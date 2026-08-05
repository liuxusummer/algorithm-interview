---
pageClass: ai-coding-page
title: 安全邮件系统
description: 拆解双域服务、邮件投递、鉴权、限流、附件和威胁模型的 AI Coding 项目题。
---

<div class="exam-session-banner">
  <div>
    <span>CASE 01 / ANT GROUP / PUBLIC PROMPT</span>
    <strong>安全邮件系统</strong>
    <small>在线 IDE · 完整项目 · Python · 公开题目拆解</small>
  </div>
  <div class="exam-session-banner__meta">
    <span>服务隔离</span>
    <span>安全设计</span>
    <span>可复现测试</span>
  </div>
</div>

# 安全邮件系统

<div class="ai-trend-callout">
  <strong>任务画像</strong>
  <p>这类题同时检查功能实现、工程组织和安全判断。最容易失分的地方不是少做一个页面，而是没有先定义信任边界，最后交出一个能演示却不能验证的系统。</p>
</div>

## 资料边界

牛客公开记录给出了较完整的 README，要求候选人在在线 IDE 中实现服务端与客户端，
运行两个相互隔离的邮件域，支持基本邮箱功能、至少两项算法增强、安全防护和可复现测试。
本页根据公开要求重新组织讲解，代码和测试由本站编写。

来源为[蚂蚁集团 AI Coding 笔试公开记录](https://www.nowcoder.com/discuss/865336111655051264?sourceSSR=subject)。

## 训练题目

实现一个简化的安全邮件系统。系统包含两个独立邮件域，每个域运行自己的服务实例，
维护自己的用户和邮件数据。两个域可以通过明确的投递接口互发邮件，但不得直接读取
对方的数据目录。

必须完成下面的能力。

1. 用户注册、登录和会话鉴权。
2. 写信、收件箱、发件箱、草稿、群发、快捷回复和邮件撤回。
3. 图片附件收发，并限制类型、大小和访问权限。
4. 至少两项增强能力，例如搜索、分类、关键词提取或附件去重。
5. 登录防爆破、发信限流、敏感信息保护和基础垃圾邮件识别。
6. 双域互发、并发访问、安全攻击和附件行为的自动化测试。

交付物至少包含源码、启动配置、协议说明、测试命令、测试结果和威胁模型。

## 第一步先划信任边界

先把系统中的参与者和可访问资源写清楚。

```text
客户端 A ──登录/读写──> 域服务 A ──投递协议──> 域服务 B
                         │                  │
                         └─只读写 A 的库    └─只读写 B 的库
```

这里有四条关键规则。

- 客户端不能通过传入任意文件路径读取附件。
- 域 A 投递邮件时只能调用域 B 的公开接口，不能打开域 B 的数据库。
- 用户会话只能访问当前用户的邮箱数据。
- 撤回请求需要同时证明发送者身份和邮件当前状态允许撤回。

若 AI 一上来就生成数据库表和页面，可以先让它停下来。没有信任边界，后面的鉴权和测试
很容易零散地堆在路由中。

## 第二步砍出最小闭环

两小时左右的工程题不适合同时开发全部功能。推荐按下面顺序推进。

| 优先级 | 闭环 | 完成标志 |
|---|---|---|
| P0 | 注册、登录、发信、收信 | 两个域可以互发纯文本邮件 |
| P0 | 鉴权和数据隔离 | 用户不能查看别人的邮件，域不能直读对方存储 |
| P0 | 自动测试 | 正常流程和越权流程都有可复现结果 |
| P1 | 撤回和限流 | 状态检查、身份检查、频率检查全部生效 |
| P1 | 图片附件 | 类型、大小、哈希和下载权限均受控 |
| P2 | 搜索、分类、快捷回复 | 核心功能稳定后再增加 |

## 第三步设计领域模型

邮件状态不应散落为字符串。先定义状态和所有者，后面的权限判断才有可靠入口。

```python
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import StrEnum


class MailState(StrEnum):
    DRAFT = "DRAFT"
    SENT = "SENT"
    DELIVERED = "DELIVERED"
    RECALLED = "RECALLED"


@dataclass(frozen=True)
class Address:
    local_part: str
    domain: str

    @classmethod
    def parse(cls, raw: str) -> "Address":
        local_part, separator, domain = raw.strip().partition("@")
        if not separator or not local_part or not domain:
            raise ValueError("邮箱地址格式错误")
        return cls(local_part=local_part, domain=domain.lower())

    def __str__(self) -> str:
        return f"{self.local_part}@{self.domain}"


@dataclass
class Mail:
    id: str
    sender: Address
    recipients: tuple[Address, ...]
    subject: str
    body: str
    state: MailState = MailState.DRAFT
    created_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
```

### 为什么收件人使用元组

邮件提交后，收件人集合属于历史事实。使用不可变元组可以降低后续代码误改收件人的风险。
系统仍需在创建邮件时去重，并限制群发人数。

## 第四步把身份验证做对

密码不能明文存储。仅使用 Python 标准库时，可以用 `scrypt` 派生密码摘要，并为每个用户
生成独立盐值。

```python
import hashlib
import hmac
import secrets


def hash_password(password: str) -> str:
    if len(password) < 10:
        raise ValueError("密码至少 10 个字符")

    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(
        password.encode("utf-8"),
        salt=salt,
        n=2**14,
        r=8,
        p=1,
    )
    return f"{salt.hex()}:{digest.hex()}"


def verify_password(password: str, encoded: str) -> bool:
    salt_hex, digest_hex = encoded.split(":", maxsplit=1)
    actual = hashlib.scrypt(
        password.encode("utf-8"),
        salt=bytes.fromhex(salt_hex),
        n=2**14,
        r=8,
        p=1,
    )
    return hmac.compare_digest(actual.hex(), digest_hex)
```

`compare_digest` 避免普通字符串比较带来的明显时序差异。正式项目还要处理参数升级、密码
重置和密钥管理，考试中至少要把尚未覆盖的风险写进说明。

## 第五步实现可审核的投递服务

领域服务只接收已经解析并验证的对象。路由负责读取请求，服务负责业务规则，仓库负责存储。

```python
from collections.abc import Callable
from dataclasses import replace


class MailRepository:
    def __init__(self, domain: str) -> None:
        self.domain = domain
        self._mails: dict[str, Mail] = {}

    def save(self, mail: Mail) -> None:
        self._mails[mail.id] = mail

    def get(self, mail_id: str) -> Mail:
        try:
            return self._mails[mail_id]
        except KeyError as error:
            raise LookupError("邮件不存在") from error

    def inbox(self, owner: Address) -> list[Mail]:
        return [
            mail
            for mail in self._mails.values()
            if owner in mail.recipients
            and mail.state is MailState.DELIVERED
        ]


class MailService:
    def __init__(
        self,
        domain: str,
        repository: MailRepository,
        remote_delivery: Callable[[str, Mail], None],
    ) -> None:
        self.domain = domain
        self.repository = repository
        self.remote_delivery = remote_delivery

    def send(self, actor: Address, draft: Mail) -> Mail:
        if actor != draft.sender:
            raise PermissionError("不能冒用其他用户发信")
        if draft.state is not MailState.DRAFT:
            raise ValueError("只有草稿可以发送")
        if not draft.recipients or len(draft.recipients) > 50:
            raise ValueError("收件人数必须在 1 到 50 之间")

        sent = replace(draft, state=MailState.SENT)
        self.repository.save(sent)

        for domain in {address.domain for address in sent.recipients}:
            self.remote_delivery(domain, sent)
        return sent

    def receive_from_domain(self, source_domain: str, mail: Mail) -> Mail:
        if source_domain != mail.sender.domain:
            raise PermissionError("来源域与发件地址不一致")

        local_recipients = tuple(
            recipient
            for recipient in mail.recipients
            if recipient.domain == self.domain
        )
        if not local_recipients:
            raise ValueError("当前域没有收件人")

        delivered = replace(
            mail,
            recipients=local_recipients,
            state=MailState.DELIVERED,
        )
        self.repository.save(delivered)
        return delivered
```

这段代码仍然是核心示例，不是完整生产邮件协议。它刻意保留了清晰的接口边界，便于后续把
`remote_delivery` 替换为 HTTP 客户端，并在入口增加域间签名、超时和重试。

## 第六步处理撤回

撤回不是把数据库记录删除。删除会让审计和并发行为都无法解释。更稳妥的做法是保留邮件，
把状态改为 `RECALLED`，并让收件箱查询排除该状态。

撤回至少要验证下面四项。

1. 操作者是原始发送者。
2. 邮件已经发送或投递，草稿不需要撤回。
3. 邮件尚未撤回。
4. 各域对同一个撤回请求采用幂等处理。

```python
def recall(self, actor: Address, mail_id: str) -> Mail:
    mail = self.repository.get(mail_id)
    if actor != mail.sender:
        raise PermissionError("只有发件人可以撤回")
    if mail.state not in {MailState.SENT, MailState.DELIVERED}:
        raise ValueError("当前状态不能撤回")

    recalled = replace(mail, state=MailState.RECALLED)
    self.repository.save(recalled)
    return recalled
```

分布式情况下，发送域还要向每个收件域发送带邮件 ID、操作者和签名的撤回命令。网络失败时
应记录部分失败，不能向用户谎报“全部撤回成功”。

## 第七步给附件设防

只检查文件名后缀不够。图片附件至少要同时检查文件大小、允许的 MIME 类型、文件头和哈希。

```python
import hashlib


PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"
JPEG_PREFIX = b"\xff\xd8\xff"
MAX_IMAGE_BYTES = 5 * 1024 * 1024


def validate_image(content: bytes, declared_type: str) -> str:
    if not content or len(content) > MAX_IMAGE_BYTES:
        raise ValueError("附件为空或超过 5 MiB")

    actual_type: str | None = None
    if content.startswith(PNG_SIGNATURE):
        actual_type = "image/png"
    elif content.startswith(JPEG_PREFIX):
        actual_type = "image/jpeg"

    if actual_type is None or actual_type != declared_type:
        raise ValueError("附件内容与声明类型不一致")

    return hashlib.sha256(content).hexdigest()
```

哈希可以用于去重，但不能把“拥有相同哈希”等同于“有权下载”。附件元数据仍要记录所有者和
邮件关系，下载接口必须再次鉴权。

## 第八步实现限流和防爆破

下面是单进程测试可用的滑动窗口限流器。多进程或多实例部署时，需要把状态迁移到具备原子
操作的共享存储。

```python
from collections import defaultdict, deque
from time import monotonic


class SlidingWindowLimiter:
    def __init__(self, limit: int, window_seconds: float) -> None:
        self.limit = limit
        self.window_seconds = window_seconds
        self._events: dict[str, deque[float]] = defaultdict(deque)

    def allow(self, key: str, now: float | None = None) -> bool:
        current = monotonic() if now is None else now
        events = self._events[key]
        boundary = current - self.window_seconds

        while events and events[0] <= boundary:
            events.popleft()
        if len(events) >= self.limit:
            return False

        events.append(current)
        return True
```

登录限流的键可以组合账号和来源 IP，发信限流则组合用户和域。只按账号限制会允许攻击者
轮换账号，只按 IP 限制又可能误伤共享出口用户。

## 第九步用测试证明系统成立

先写最小领域测试，再补接口和并发测试。

```python
def test_cross_domain_delivery() -> None:
    repositories = {
        "alpha.test": MailRepository("alpha.test"),
        "beta.test": MailRepository("beta.test"),
    }
    services: dict[str, MailService] = {}

    def deliver(domain: str, mail: Mail) -> None:
        services[domain].receive_from_domain(mail.sender.domain, mail)

    for domain, repository in repositories.items():
        services[domain] = MailService(domain, repository, deliver)

    alice = Address.parse("alice@alpha.test")
    bob = Address.parse("bob@beta.test")
    draft = Mail(
        id="mail-001",
        sender=alice,
        recipients=(bob,),
        subject="meeting",
        body="10:00",
    )

    services["alpha.test"].send(alice, draft)

    inbox = repositories["beta.test"].inbox(bob)
    assert [mail.id for mail in inbox] == ["mail-001"]
    assert repositories["alpha.test"] is not repositories["beta.test"]


def test_rejects_spoofed_sender() -> None:
    repository = MailRepository("alpha.test")
    service = MailService("alpha.test", repository, lambda _domain, _mail: None)
    alice = Address.parse("alice@alpha.test")
    mallory = Address.parse("mallory@alpha.test")
    draft = Mail("mail-002", alice, (mallory,), "x", "y")

    try:
        service.send(mallory, draft)
    except PermissionError:
        pass
    else:
        raise AssertionError("冒用发件人必须失败")


def test_rate_limiter_expires_old_events() -> None:
    limiter = SlidingWindowLimiter(limit=2, window_seconds=10)
    assert limiter.allow("alice", now=0)
    assert limiter.allow("alice", now=1)
    assert not limiter.allow("alice", now=2)
    assert limiter.allow("alice", now=11)
```

接口层还应补充未登录访问、跨用户读取、非法附件、错误域签名、重复撤回和高频发送测试。
每个测试都要能说明它在防止哪一种真实失败。

## AI 协作怎么做

### 第一次提示只让 AI 建图

```text
阅读 README 和当前目录，不修改文件。
输出参与者、数据所有者、跨域调用、信任边界、必须交付物和最小可运行闭环。
标出题目没有说明但实现前必须决定的五个问题。
```

### 第二次提示限定一个模块

```text
只实现 domain.py 中的 Address、MailState 和 Mail。
不得引入第三方依赖，不创建路由，不实现数据库。
完成后给出三个最小单元测试，覆盖非法地址、默认状态和收件人不可变性。
```

### 第三次提示让 AI 审查自己的假设

```text
检查刚才的实现。逐项列出你自行假设的需求、尚未覆盖的安全风险和可能导致测试不稳定的地方。
不要直接改代码，先等我确认。
```

关键点在于每次提示都给出范围、完成条件和禁止事项。生成结果仍需逐行阅读并运行测试。

## 两小时作答安排

| 时间 | 工作 |
|---|---|
| 0 至 15 分钟 | 读题、画边界、确定 P0、检查环境和依赖 |
| 15 至 35 分钟 | 建领域模型、内存仓库和第一组测试 |
| 35 至 70 分钟 | 跑通双域注册、登录、发信和收信 |
| 70 至 90 分钟 | 加入鉴权、限流、撤回和失败测试 |
| 90 至 105 分钟 | 完成一到两项增强能力 |
| 105 至 120 分钟 | 清理密钥、运行全量测试、写 README 和未完成项 |

功能做不完时，应保住可运行闭环、测试和诚实说明。留下六个半成品通常比不上三个可以证明
正确的核心功能。

## 最终复盘

面试官继续追问时，至少能回答下面的问题。

1. 两个域为什么算隔离，隔离在哪一层得到保证。
2. 为什么密码哈希选 `scrypt`，盐值和密钥分别解决什么问题。
3. 撤回失败一半时，用户会看到什么状态。
4. 附件去重为什么不能自动授予访问权限。
5. 当前限流器为什么不适合多实例部署。
6. 哪些代码来自 AI，你采用什么证据确认它可以提交。
