---
pageClass: ai-coding-page
title: 智能客服 MVP
description: 两小时完成意图路由、知识检索、人工转接、会话记录和安全降级。
---

<div class="exam-session-banner">
  <div>
    <span>CASE 04 / MEITUAN / AI EDITOR</span>
    <strong>智能客服 MVP</strong>
    <small>两小时 · 产品原型 · Python · 公开记录扩展</small>
  </div>
  <div class="exam-session-banner__meta">
    <span>意图路由</span>
    <span>知识检索</span>
    <span>人工兜底</span>
  </div>
</div>

# 智能客服 MVP

<div class="ai-trend-callout">
  <strong>任务画像</strong>
  <p>候选人需要在很短时间内把一个宽泛产品词变成可演示的流程。先让三条真实用户路径跑通，再考虑模型、页面动画和复杂工作流。</p>
</div>

## 资料边界

公开面经记录了一次使用美团 AI 代码编辑器、限时两小时完成智能客服系统的经历，但没有给出
完整需求和评分规则。本页据此设计可独立练习的训练版。

来源为[美团秋招面经中的 AI Coding 记录](https://www.nowcoder.com/feed/main/detail/171cdf9e44f8469e873e0ba74f4cac81)。

## 训练题目

为外卖订单场景实现一个智能客服 MVP。用户输入自然语言问题，系统返回回答或转人工建议。

必须跑通三条路径。

1. 用户询问配送进度，系统读取订单状态并给出事实性回答。
2. 用户询问退款规则，系统从本地知识库返回带来源的答案。
3. 用户表达食品安全、扣款异常或强烈投诉时，系统立即转人工，不让模型自行承诺赔偿。

交付包含 Python 源码、示例知识库、自动测试、启动说明和一次完整演示记录。

## 先把“智能”拆成确定步骤

```text
用户问题
   ↓
输入检查
   ↓
高风险规则 ──命中──> 转人工
   ↓ 未命中
意图识别
   ├── 订单查询 ──> 读取订单工具 ──> 模板回答
   ├── 规则咨询 ──> 检索知识库 ──> 带来源回答
   └── 无法识别 ──> 澄清一次 ──> 仍失败则转人工
```

这里最重要的决定是把订单状态和退款规则当作外部事实。语言模型可以组织表达，不能凭记忆
编造订单状态或公司规则。

## 定义完成条件

| 场景 | 输入 | 成功输出 |
|---|---|---|
| 配送查询 | 用户 ID、订单 ID、问题 | 当前状态、更新时间、可执行下一步 |
| 退款咨询 | 问题 | 答案、知识条目 ID、知识库版本 |
| 高风险投诉 | 问题 | 人工工单 ID、预计响应方式 |
| 无关问题 | 问题 | 一次澄清，不虚构答案 |

一旦写成这张表，AI 就能针对每一条生成实现和测试。只说“做一个智能客服”，生成结果通常
会停留在一个聊天框和几段硬编码回答。

## 核心数据模型

```python
from dataclasses import dataclass
from datetime import datetime, timezone
from enum import StrEnum


class Route(StrEnum):
    ORDER_STATUS = "ORDER_STATUS"
    POLICY_SEARCH = "POLICY_SEARCH"
    HUMAN_SUPPORT = "HUMAN_SUPPORT"
    CLARIFY = "CLARIFY"


@dataclass(frozen=True)
class KnowledgeEntry:
    id: str
    title: str
    content: str
    keywords: frozenset[str]
    version: str


@dataclass(frozen=True)
class SupportReply:
    route: Route
    message: str
    sources: tuple[str, ...] = ()
    ticket_id: str | None = None


@dataclass(frozen=True)
class OrderSnapshot:
    order_id: str
    owner_id: str
    status: str
    updated_at: datetime
```

回复对象显式记录路由和来源，测试不需要从自然语言中猜系统走了哪条分支。

## 高风险请求优先处理

食品安全、重复扣款和人身威胁不能交给普通 FAQ 流程。训练版用透明规则先拦截。

```python
import re


HIGH_RISK_PATTERNS: tuple[re.Pattern[str], ...] = (
    re.compile(r"食物中毒|异物|过敏|住院"),
    re.compile(r"重复扣款|盗刷|不是我付的"),
    re.compile(r"报警|人身安全|威胁"),
)


def needs_human_support(message: str) -> bool:
    normalized = re.sub(r"\s+", "", message.casefold())
    return any(pattern.search(normalized) for pattern in HIGH_RISK_PATTERNS)
```

规则会漏掉同义表达，也可能误判。MVP 中先保证高风险词能稳定触发，再在说明中提出使用分类器
和人工标注数据改进召回率。不能为了显得智能而隐藏当前限制。

## 意图路由

```python
ORDER_WORDS = frozenset({"订单", "骑手", "配送", "送到", "进度"})
POLICY_WORDS = frozenset({"退款", "取消", "优惠券", "规则", "赔付"})


def route_message(message: str) -> Route:
    if needs_human_support(message):
        return Route.HUMAN_SUPPORT

    order_hits = sum(word in message for word in ORDER_WORDS)
    policy_hits = sum(word in message for word in POLICY_WORDS)

    if order_hits > policy_hits and order_hits > 0:
        return Route.ORDER_STATUS
    if policy_hits > 0:
        return Route.POLICY_SEARCH
    return Route.CLARIFY
```

这里故意使用简单实现，便于两小时内验证。若调用大模型识别意图，也应要求它输出受约束枚举，
并在解析失败、超时或低置信时回到 `CLARIFY`，不能让任意文本直接决定后续工具调用。

## 知识检索

训练版使用关键词交集和词频完成可解释检索。知识库很小，不需要急着引入向量数据库。

```python
import re


TOKEN_PATTERN = re.compile(r"[a-z0-9]+|[\u4e00-\u9fff]")


def tokenize(text: str) -> set[str]:
    return set(TOKEN_PATTERN.findall(text.casefold()))


def search_knowledge(
    query: str,
    entries: list[KnowledgeEntry],
    limit: int = 3,
) -> list[KnowledgeEntry]:
    query_tokens = tokenize(query)
    scored: list[tuple[int, str, KnowledgeEntry]] = []

    for entry in entries:
        searchable = tokenize(entry.title + entry.content) | set(entry.keywords)
        score = len(query_tokens & searchable)
        if score > 0:
            scored.append((-score, entry.id, entry))

    scored.sort(key=lambda item: (item[0], item[1]))
    return [item[2] for item in scored[:limit]]
```

单字切分对中文语义的表达能力有限，但它是可运行基线。后续可以替换分词器或向量检索，测试
和 `KnowledgeEntry` 数据契约无需一起推翻。

## 订单工具必须鉴权

```python
class OrderStore:
    def __init__(self, orders: list[OrderSnapshot]) -> None:
        self._orders = {order.order_id: order for order in orders}

    def get_for_owner(self, order_id: str, owner_id: str) -> OrderSnapshot:
        try:
            order = self._orders[order_id]
        except KeyError as error:
            raise LookupError("订单不存在") from error

        if order.owner_id != owner_id:
            raise PermissionError("不能查看其他用户的订单")
        return order
```

不能只在前端隐藏其他订单。所有者校验必须发生在读取订单的服务端工具里，这样即使 AI 生成
错误的订单 ID，也无法越权读取。

## 组合客服服务

```python
from collections.abc import Callable


class CustomerService:
    def __init__(
        self,
        orders: OrderStore,
        knowledge: list[KnowledgeEntry],
        create_ticket: Callable[[str, str], str],
    ) -> None:
        self.orders = orders
        self.knowledge = knowledge
        self.create_ticket = create_ticket

    def answer(
        self,
        owner_id: str,
        message: str,
        order_id: str | None = None,
    ) -> SupportReply:
        clean_message = message.strip()
        if not clean_message:
            return SupportReply(Route.CLARIFY, "请描述需要帮助的问题。")

        route = route_message(clean_message)

        if route is Route.HUMAN_SUPPORT:
            ticket_id = self.create_ticket(owner_id, clean_message)
            return SupportReply(
                route,
                "问题已转交人工客服，请保留相关凭证。",
                ticket_id=ticket_id,
            )

        if route is Route.ORDER_STATUS:
            if order_id is None:
                return SupportReply(Route.CLARIFY, "请提供需要查询的订单号。")
            order = self.orders.get_for_owner(order_id, owner_id)
            updated = order.updated_at.astimezone(timezone.utc).isoformat()
            return SupportReply(
                route,
                f"订单 {order.order_id} 当前状态为 {order.status}，更新时间 {updated}。",
            )

        if route is Route.POLICY_SEARCH:
            matches = search_knowledge(clean_message, self.knowledge, limit=1)
            if not matches:
                return SupportReply(Route.CLARIFY, "没有找到对应规则，请补充具体场景。")
            entry = matches[0]
            return SupportReply(
                route,
                entry.content,
                sources=(f"{entry.id}@{entry.version}",),
            )

        return SupportReply(
            Route.CLARIFY,
            "请问你想查询订单进度、退款规则，还是需要人工帮助？",
        )
```

## 自动测试

```python
def make_service() -> CustomerService:
    orders = OrderStore([
        OrderSnapshot(
            order_id="o-1",
            owner_id="u-1",
            status="配送中",
            updated_at=datetime(2026, 4, 1, 8, 0, tzinfo=timezone.utc),
        )
    ])
    knowledge = [
        KnowledgeEntry(
            id="refund-01",
            title="订单取消与退款",
            content="商家接单前取消，退款原路退回。",
            keywords=frozenset({"退款", "取消"}),
            version="2026-04-01",
        )
    ]
    return CustomerService(
        orders,
        knowledge,
        create_ticket=lambda owner, _message: f"ticket-{owner}",
    )


def test_reads_verified_order_state() -> None:
    reply = make_service().answer("u-1", "订单送到哪里了", "o-1")
    assert reply.route is Route.ORDER_STATUS
    assert "配送中" in reply.message


def test_rejects_cross_user_order_access() -> None:
    try:
        make_service().answer("u-2", "查询订单进度", "o-1")
    except PermissionError:
        pass
    else:
        raise AssertionError("不能读取其他用户订单")


def test_high_risk_message_skips_normal_answering() -> None:
    reply = make_service().answer("u-1", "餐里有异物，我要投诉")
    assert reply.route is Route.HUMAN_SUPPORT
    assert reply.ticket_id == "ticket-u-1"


def test_policy_answer_contains_source() -> None:
    reply = make_service().answer("u-1", "取消以后怎么退款")
    assert reply.route is Route.POLICY_SEARCH
    assert reply.sources == ("refund-01@2026-04-01",)
```

## 两小时实现顺序

| 时间 | 工作 | 暂时不做 |
|---|---|---|
| 0 至 15 分钟 | 定义三条用户路径和输出对象 | 动画、账号体系 |
| 15 至 35 分钟 | 完成路由、订单工具和高风险规则 | 大模型接入 |
| 35 至 60 分钟 | 完成知识检索和来源展示 | 向量数据库 |
| 60 至 85 分钟 | 写四条端到端测试 | 大规模压测 |
| 85 至 105 分钟 | 加一个简单网页或命令行演示 | 复杂视觉效果 |
| 105 至 120 分钟 | 跑测试、清理配置、写 README | 新功能 |

## AI 协作怎么做

### 先让 AI 画状态流程

```text
这是三条必须跑通的客服路径。
不要写代码。请列出每条路径需要的数据、外部工具、失败分支和最终验收条件。
任何涉及订单事实、退款规则或赔偿承诺的内容都必须来自工具或知识库。
```

### 用 AI 生成界面时固定数据契约

```text
根据 SupportReply 的字段生成一个单页聊天界面。
不得改动后端字段，不添加虚构订单，不把 sources 隐藏。
转人工回复必须展示 ticket_id，加载失败时显示可重试状态。
```

### 让 AI 做安全审查

```text
审查当前客服服务，重点寻找越权订单读取、提示词注入、规则来源缺失、敏感信息日志、
高风险投诉误走自动回复五类问题。每个问题给出复现输入和应增加的测试。
```

## 复盘重点

1. 为什么高风险规则位于模型调用之前。
2. 为什么知识回答要携带条目 ID 和版本。
3. 当前中文检索有什么已知限制。
4. 模型超时或返回非法路由时如何降级。
5. 会话日志应保存什么，哪些个人信息需要脱敏。
6. 如果再增加一小时，先改进召回率、界面还是监控，理由是什么。
