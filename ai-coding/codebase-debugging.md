---
pageClass: ai-coding-page
title: 多文件代码库排错
description: 在一小时内根据失败测试定位跨文件缺陷，并在受限 AI 环境中完成验证。
---

<div class="exam-session-banner">
  <div>
    <span>CASE 06 / CODE REPOSITORY / DEBUGGING</span>
    <strong>多文件代码库排错</strong>
    <small>60 分钟 · 四个缺陷 · Python · 海外形式训练版</small>
  </div>
  <div class="exam-session-banner__meta">
    <span>陌生仓库</span>
    <span>失败测试</span>
    <span>受限 AI</span>
  </div>
</div>

# 多文件代码库排错

<div class="ai-trend-callout">
  <strong>任务画像</strong>
  <p>候选人拿到仓库和 README，在限定时间里修复多个缺陷。AI 可能只能解释仓库、语法和测试命令，最终定位仍依赖你对代码、日志和失败用例的阅读。</p>
</div>

## 资料边界

CoderPad 公开介绍了 Meta 的 AI 编码面试试点。候选人社区还记录过“约一小时修复四个缺陷，
AI 只能提供仓库信息和方向性帮助”的经历。公开材料没有完整代码，本页据此重新设计训练仓库。

- [CoderPad 对 Meta AI 编码试点的介绍](https://coderpad.io/blog/hiring-developers/ai-in-the-interview-is-not-cheating-it-is-the-job-according-to-meta/)
- [Stripe 与 Meta AI 编码面试社区讨论](https://www.reddit.com/r/leetcode/comments/1vbpool/stripe_and_meta_new_ai_interview_experience/)
- [HackerRank Code Repository 与 AI 辅助面试说明](https://support.hackerrank.com/articles/5821380141-ai-assisted-interviews)

## 训练题目

推荐服务根据社交关系给用户返回候选好友。仓库中已有测试，但四个缺陷导致部分测试失败。
请在 60 分钟内定位并修复，保持公开接口不变。

```text
friend_recommendation/
├── README.md
├── recommendation/
│   ├── models.py
│   ├── repository.py
│   ├── service.py
│   ├── cache.py
│   └── metrics.py
└── tests/
    ├── test_service.py
    ├── test_cache.py
    └── test_metrics.py
```

验收条件如下。

1. 不能推荐用户自己或已经是好友的人。
2. 推荐按共同好友数从高到低排序，同分时用户 ID 升序。
3. 不同用户的缓存结果必须隔离。
4. 没有推荐曝光时，接受率返回 `0.0`，不能抛异常。
5. 所有原有测试和新增回归测试通过。

## 第一步建立仓库地图

先运行测试，不要凭 README 猜错误。

```bash
python -m unittest discover -v
rg "def recommend|def valid|cache|acceptance_rate" recommendation tests
```

把失败信息按调用路径分组。

```text
test_excludes_self
  → RecommendationService.recommend
    → RecommendationService._is_valid

test_cache_is_scoped_by_user
  → RecommendationCache.get / put

test_zero_impressions
  → acceptance_rate
```

先找“第一个错误状态出现在哪里”，不要看到一个断言失败就重写整条调用链。

## 缺陷一　把自己加入候选人

现有实现如下。

```python
def _is_valid(self, user_id: str, candidate_id: str) -> bool:
    user = self.repository.get(user_id)
    return candidate_id not in user.friend_ids
```

它只排除了已有好友，没有排除 `candidate_id == user_id`。

### 回归测试

```python
def test_does_not_recommend_user_to_themself() -> None:
    repository = UserRepository([
        User("u1", frozenset()),
        User("u2", frozenset()),
    ])
    service = RecommendationService(repository, RecommendationCache())

    assert service.recommend("u1", limit=10) == ["u2"]
```

### 最小修复

```python
def _is_valid(self, user_id: str, candidate_id: str) -> bool:
    if candidate_id == user_id:
        return False

    user = self.repository.get(user_id)
    return candidate_id not in user.friend_ids
```

修复保持了函数职责，没有新增一套候选过滤流程。

## 缺陷二　排序键方向错误

```python
scored.sort(key=lambda item: (item.mutual_count, item.user_id))
```

共同好友数应该降序，用户 ID 应该升序。不能简单加 `reverse=True`，否则两个字段都会反转。

```python
scored.sort(key=lambda item: (-item.mutual_count, item.user_id))
```

### 为什么需要同分测试

```python
def test_orders_by_mutual_count_then_user_id() -> None:
    scored = [
        CandidateScore("u3", 1),
        CandidateScore("u2", 2),
        CandidateScore("u1", 2),
    ]

    scored.sort(key=lambda item: (-item.mutual_count, item.user_id))

    assert [item.user_id for item in scored] == ["u1", "u2", "u3"]
```

若只测试共同好友数不同的情况，`reverse=True` 也可能通过，隐藏同分规则错误。

## 缺陷三　缓存键泄露其他用户结果

现有缓存只使用 `limit` 作为键。

```python
class RecommendationCache:
    def __init__(self) -> None:
        self._values: dict[int, list[str]] = {}

    def get(self, user_id: str, limit: int) -> list[str] | None:
        return self._values.get(limit)

    def put(self, user_id: str, limit: int, values: list[str]) -> None:
        self._values[limit] = values
```

用户 A 请求 `limit=10` 后，用户 B 会读到 A 的结果。这既是正确性缺陷，也可能暴露社交关系。

### 修复

```python
class RecommendationCache:
    def __init__(self) -> None:
        self._values: dict[tuple[str, int], tuple[str, ...]] = {}

    def get(self, user_id: str, limit: int) -> list[str] | None:
        cached = self._values.get((user_id, limit))
        return None if cached is None else list(cached)

    def put(self, user_id: str, limit: int, values: list[str]) -> None:
        self._values[(user_id, limit)] = tuple(values)
```

缓存内部保存元组，读取时返回新列表，避免调用方修改缓存中的原始对象。

### 测试隔离和防御性复制

```python
def test_cache_is_scoped_by_user() -> None:
    cache = RecommendationCache()
    cache.put("u1", 2, ["u3"])
    cache.put("u2", 2, ["u4"])

    assert cache.get("u1", 2) == ["u3"]
    assert cache.get("u2", 2) == ["u4"]


def test_caller_cannot_mutate_cached_value() -> None:
    cache = RecommendationCache()
    cache.put("u1", 2, ["u3"])

    result = cache.get("u1", 2)
    assert result is not None
    result.append("u9")

    assert cache.get("u1", 2) == ["u3"]
```

## 缺陷四　零曝光时除零

```python
def acceptance_rate(accepted: int, impressions: int) -> float:
    return accepted / impressions
```

在监控系统刚启动或筛选条件没有结果时，曝光数可能为零。题目规定返回 `0.0`。

```python
def acceptance_rate(accepted: int, impressions: int) -> float:
    if accepted < 0 or impressions < 0:
        raise ValueError("计数不能为负数")
    if accepted > impressions:
        raise ValueError("接受数不能超过曝光数")
    if impressions == 0:
        return 0.0
    return accepted / impressions
```

### 测试

```python
def test_acceptance_rate_handles_zero_impressions() -> None:
    assert acceptance_rate(0, 0) == 0.0


def test_acceptance_rate_rejects_impossible_counts() -> None:
    for accepted, impressions in [(-1, 1), (2, 1)]:
        try:
            acceptance_rate(accepted, impressions)
        except ValueError:
            pass
        else:
            raise AssertionError("非法计数必须失败")
```

## 修复后的核心服务

```python
from dataclasses import dataclass


@dataclass(frozen=True)
class User:
    id: str
    friend_ids: frozenset[str]


@dataclass(frozen=True)
class CandidateScore:
    user_id: str
    mutual_count: int


class UserRepository:
    def __init__(self, users: list[User]) -> None:
        self._users = {user.id: user for user in users}

    def get(self, user_id: str) -> User:
        try:
            return self._users[user_id]
        except KeyError as error:
            raise LookupError("用户不存在") from error

    def all(self) -> list[User]:
        return list(self._users.values())


class RecommendationService:
    def __init__(
        self,
        repository: UserRepository,
        cache: RecommendationCache,
    ) -> None:
        self.repository = repository
        self.cache = cache

    def _is_valid(self, user_id: str, candidate_id: str) -> bool:
        if candidate_id == user_id:
            return False
        return candidate_id not in self.repository.get(user_id).friend_ids

    def recommend(self, user_id: str, limit: int) -> list[str]:
        if limit <= 0:
            raise ValueError("limit 必须为正数")

        cached = self.cache.get(user_id, limit)
        if cached is not None:
            return cached

        user = self.repository.get(user_id)
        scored: list[CandidateScore] = []

        for candidate in self.repository.all():
            if not self._is_valid(user_id, candidate.id):
                continue
            mutual_count = len(user.friend_ids & candidate.friend_ids)
            scored.append(CandidateScore(candidate.id, mutual_count))

        scored.sort(key=lambda item: (-item.mutual_count, item.user_id))
        result = [item.user_id for item in scored[:limit]]
        self.cache.put(user_id, limit, result)
        return result
```

## 修复顺序怎么选

60 分钟里不要平均分配时间。推荐按照“定位成本”和“影响范围”排序。

| 时间 | 动作 |
|---|---|
| 0 至 8 分钟 | 读 README、运行全量测试、画调用关系 |
| 8 至 18 分钟 | 修复零曝光和排序方向，快速减少失败数 |
| 18 至 32 分钟 | 修复自推荐并补回归测试 |
| 32 至 46 分钟 | 修复缓存隔离和可变对象问题 |
| 46 至 54 分钟 | 全量回归，检查修改范围 |
| 54 至 60 分钟 | 解释根因、风险和未处理边界 |

真实失败可能互相影响。每修复一个根因就运行相关测试，再运行一次全量测试，避免最后才发现
前一个修改破坏了其他模块。

## 受限 AI 环境怎么用

如果 AI 只允许解释代码和测试命令，可以问下面的问题。

```text
请说明 RecommendationService.recommend 的调用关系和数据流。
只引用仓库中存在的类和函数，不提出重构方案。
```

```text
test_cache_is_scoped_by_user 为什么能证明缓存键不完整。
请根据测试输入逐行追踪 put 和 get，不直接给修复代码。
```

```text
列出运行单个测试文件和全量测试的命令。
如果仓库没有声明测试框架，请先检查配置文件，不要猜。
```

即使平台允许完整生成代码，也可以先用解释模式。自己先定位根因，再让 AI 生成一个小补丁，
更容易控制范围和判断对错。

## 面试复述模板

> 我先运行测试并按调用路径分组。四个失败分别来自候选过滤、复合排序、缓存键和指标边界。
> 每次只修一个根因，并增加能在旧实现上失败的测试。缓存问题还涉及跨用户数据泄露，所以我
> 同时加入了用户维度的键和防御性复制。最后运行全量测试，并保留了公开接口。

## 继续追问

1. 用户好友关系变化后，缓存如何失效。
2. 多实例服务如何共享缓存并防止击穿。
3. 共同好友数为零的候选人是否应该返回。
4. 用户 ID 排序是否满足真实产品需求。
5. 现有测试是否可能只验证实现细节，没有验证业务行为。
6. 哪个问题 AI 最容易给出“看起来正确”的错误修复。
