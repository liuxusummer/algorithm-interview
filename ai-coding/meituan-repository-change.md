---
pageClass: ai-coding-page
title: 真实仓库需求变更
description: 在已有 Python 服务中理解调用关系、修复分页缺陷并加入幂等写入。
---

<div class="exam-session-banner">
  <div>
    <span>CASE 03 / MEITUAN / REPOSITORY TASK</span>
    <strong>真实仓库需求变更</strong>
    <small>现场修改 · 陌生代码库 · Python · 公开形式训练版</small>
  </div>
  <div class="exam-session-banner__meta">
    <span>仓库探索</span>
    <span>小范围 Diff</span>
    <span>回归测试</span>
  </div>
</div>

# 真实仓库需求变更

<div class="ai-trend-callout">
  <strong>任务画像</strong>
  <p>面试官从候选人的 GitHub 克隆仓库，再临时要求增加或修改模块。你的优势来自对自己代码的理解，以及能否让 AI 在明确边界内工作。</p>
</div>

## 资料边界

公开面经确认了“从候选人 GitHub 克隆项目，根据现场需求增加或修改模块”的形式，但没有
公开具体需求。本页因此设计一组等价训练任务，不宣称是美团原题。

来源为[美团软件开发全栈实习面经](https://www.nowcoder.com/feed/main/detail/3e0b975bc77d4379bcdd710130f1105f)。

## 训练题目

你接手一个小型任务服务。

```text
task_service/
├── app.py
├── service.py
├── repository.py
├── models.py
└── tests/
    ├── test_service.py
    └── test_repository.py
```

面试官提出两个需求。

1. 修复 `list_all_tasks` 一直重复请求第一页的问题。
2. 为创建任务增加幂等键。相同用户使用相同幂等键重复请求时，必须返回第一次创建的任务，
   不能产生重复记录。

约束如下。

- 不改变现有 `TaskRepository.list_page` 的签名。
- 不引入第三方依赖。
- 不重写无关模块。
- 补充自动化测试并说明并发边界。

## 第一阶段先读仓库

拿到仓库后先回答四个问题。

1. 程序入口在哪里。
2. 领域对象由谁创建，ID 由谁生成。
3. 分页结束条件是什么。
4. 现有测试如何运行，测试替身在哪里。

可以先使用下面的只读命令。

```bash
find . -maxdepth 3 -type f
python -m unittest discover -v
rg "list_page|create_task|TaskRepository" .
```

不要第一时间把整个仓库交给 AI 重构。先自己建立最小调用图。

```text
HTTP handler → TaskService → TaskRepository → in-memory storage
                         ↘ IdempotencyStore
```

## 现有代码和第一个缺陷

```python
class TaskService:
    def __init__(self, repository: "TaskRepository") -> None:
        self.repository = repository

    def list_all_tasks(self, page_size: int = 20) -> list["Task"]:
        page = 1
        result: list[Task] = []

        while True:
            current = self.repository.list_page(page, page_size)
            if not current:
                return result
            result.extend(current)
```

循环变量 `page` 没有变化。只要第一页不为空，服务就会不停请求第一页，最终可能耗尽内存或
拖死依赖服务。

## 先写一个会失败的测试

```python
import unittest


class FakeTaskRepository:
    def __init__(self) -> None:
        self.requested_pages: list[int] = []

    def list_page(self, page: int, page_size: int) -> list["Task"]:
        self.requested_pages.append(page)
        pages = {
            1: [Task(id="1", owner_id="u1", title="first")],
            2: [Task(id="2", owner_id="u1", title="second")],
            3: [],
        }
        return pages[page]


class TaskServicePaginationTest(unittest.TestCase):
    def test_reads_each_page_once_until_empty_page(self) -> None:
        repository = FakeTaskRepository()
        service = TaskService(repository)

        result = service.list_all_tasks(page_size=1)

        self.assertEqual([task.id for task in result], ["1", "2"])
        self.assertEqual(repository.requested_pages, [1, 2, 3])
```

原代码运行这个测试时不会结束。实际面试中可先增加一个调用次数保护，让失败快速暴露，避免
测试进程一直挂住。

```python
if len(self.requested_pages) > 5:
    raise AssertionError("可能重复请求同一页")
```

## 最小修复

```python
def list_all_tasks(self, page_size: int = 20) -> list["Task"]:
    if page_size <= 0:
        raise ValueError("page_size 必须为正数")

    page = 1
    result: list[Task] = []

    while True:
        current = self.repository.list_page(page, page_size)
        if not current:
            return result

        result.extend(current)
        page += 1
```

这个修改保留了原有分页协议。不要趁机改成游标分页，除非面试官明确要求。可以在复盘里说明
页码分页面对并发插入可能出现重复或遗漏，但这不属于当前修复范围。

## 第二个需求先定义幂等语义

“支持幂等”至少要回答下面的问题。

- 幂等键在所有用户之间唯一，还是只在单个用户内唯一。
- 相同键但请求内容不同怎么办。
- 幂等记录保存多久。
- 创建成功但响应丢失时，重试返回什么。

训练版采用以下规则。

1. 唯一范围为 `(owner_id, idempotency_key)`。
2. 重复请求内容相同则返回原任务。
3. 重复请求内容不同则抛出冲突错误。
4. 内存实现暂不自动过期，生产方案需要配置 TTL。

## 数据模型

```python
from dataclasses import dataclass
import hashlib
import json


@dataclass(frozen=True)
class Task:
    id: str
    owner_id: str
    title: str


@dataclass(frozen=True)
class IdempotencyRecord:
    request_hash: str
    task_id: str


def hash_create_request(owner_id: str, title: str) -> str:
    canonical = json.dumps(
        {"owner_id": owner_id, "title": title},
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    )
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()
```

对规范化后的请求求哈希，可以判断同一幂等键是否被用于不同内容。这里的哈希用于一致性检查，
不用于保存密码或创建安全签名。

## 实现幂等存储接口

幂等状态不应藏在 HTTP handler 的全局字典里。先定义接口，便于测试和替换数据库实现。

```python
from collections.abc import Callable
from threading import Lock
from typing import TypeVar


T = TypeVar("T")


class IdempotencyConflictError(Exception):
    pass


class InMemoryIdempotencyStore:
    def __init__(self) -> None:
        self._records: dict[tuple[str, str], IdempotencyRecord] = {}
        self._lock = Lock()

    def execute_once(
        self,
        owner_id: str,
        key: str,
        request_hash: str,
        create: Callable[[], tuple[IdempotencyRecord, T]],
        load_existing: Callable[[str], T],
    ) -> T:
        compound_key = (owner_id, key)

        with self._lock:
            existing = self._records.get(compound_key)
            if existing is not None:
                if existing.request_hash != request_hash:
                    raise IdempotencyConflictError(
                        "同一幂等键不能用于不同请求"
                    )
                return load_existing(existing.task_id)

            record, value = create()
            self._records[compound_key] = record
            return value
```

锁覆盖了“检查、创建、记录”的完整过程，能够避免单进程多线程中的重复创建。缺点是创建操作
期间会持有全局锁，吞吐量有限。考试中可以先保证语义正确，再说明数据库实现应使用唯一索引
和事务缩小锁范围。

## 服务层组合

```python
from uuid import uuid4


class TaskService:
    def __init__(
        self,
        repository: "TaskRepository",
        idempotency: InMemoryIdempotencyStore,
    ) -> None:
        self.repository = repository
        self.idempotency = idempotency

    def create_task(
        self,
        owner_id: str,
        title: str,
        idempotency_key: str,
    ) -> Task:
        clean_title = title.strip()
        if not clean_title:
            raise ValueError("任务标题不能为空")
        if not idempotency_key.strip():
            raise ValueError("幂等键不能为空")

        request_hash = hash_create_request(owner_id, clean_title)

        def create() -> tuple[IdempotencyRecord, Task]:
            task = Task(
                id=str(uuid4()),
                owner_id=owner_id,
                title=clean_title,
            )
            self.repository.save(task)
            record = IdempotencyRecord(request_hash, task.id)
            return record, task

        return self.idempotency.execute_once(
            owner_id=owner_id,
            key=idempotency_key,
            request_hash=request_hash,
            create=create,
            load_existing=self.repository.get,
        )
```

## 幂等测试

```python
class InMemoryTaskRepository:
    def __init__(self) -> None:
        self.tasks: dict[str, Task] = {}

    def save(self, task: Task) -> None:
        self.tasks[task.id] = task

    def get(self, task_id: str) -> Task:
        return self.tasks[task_id]


class IdempotentCreateTest(unittest.TestCase):
    def setUp(self) -> None:
        self.repository = InMemoryTaskRepository()
        self.service = TaskService(
            self.repository,
            InMemoryIdempotencyStore(),
        )

    def test_same_request_returns_original_task(self) -> None:
        first = self.service.create_task("u1", "read docs", "request-1")
        second = self.service.create_task("u1", "read docs", "request-1")

        self.assertEqual(first, second)
        self.assertEqual(len(self.repository.tasks), 1)

    def test_same_key_with_different_payload_conflicts(self) -> None:
        self.service.create_task("u1", "first", "request-1")

        with self.assertRaises(IdempotencyConflictError):
            self.service.create_task("u1", "second", "request-1")

    def test_key_is_scoped_by_owner(self) -> None:
        first = self.service.create_task("u1", "task", "request-1")
        second = self.service.create_task("u2", "task", "request-1")

        self.assertNotEqual(first.id, second.id)
        self.assertEqual(len(self.repository.tasks), 2)
```

## AI 协作步骤

### 先让 AI 做只读探索

```text
不要修改文件。请找出 list_all_tasks 和 create_task 的定义、所有调用方、仓库接口和相关测试。
用五行以内画出调用关系，并列出修改这两个函数可能影响的行为。
```

### 再要求最小补丁

```text
只修复 list_all_tasks 的无限循环和非法 page_size。
保持 TaskRepository.list_page 签名不变，不修改路由，不顺便重构。
先给补丁，再说明哪个测试能在修改前失败、修改后通过。
```

### 对幂等方案进行反例审查

```text
这是我定义的幂等语义和实现草案。
请构造相同键不同请求、相同请求不同用户、并发重复请求、创建后响应丢失四个反例。
指出当前实现在哪些部署方式下不成立，不要直接重写整个模块。
```

## 面试官可能继续追问

### 为什么不直接用一个全局 `set`

`set` 只能记住键出现过，无法返回第一次创建的任务，也无法检测相同键对应不同请求。

### 数据库里怎样实现

可以在幂等表上建立 `(owner_id, idempotency_key)` 唯一索引，在事务中写业务记录和幂等记录。
遇到唯一键冲突后读取旧记录并比较请求哈希。还需要处理业务记录写入成功、幂等记录失败的
原子性问题。

### 为什么不让 AI 重构所有文件

现场需求只有两个目标。扩大修改范围会增加回归风险，也让面试官难以判断你是否理解原设计。
保留小范围 diff 更容易验证和解释。

## 交付清单

- 原有测试全部通过。
- 新测试在旧实现上能够稳定失败。
- 分页请求序列被明确断言。
- 幂等键的作用域、冲突规则和生命周期写入 README。
- 说明内存锁只能保证单进程语义。
- `git diff` 中没有无关格式化、依赖升级或密钥文件。
