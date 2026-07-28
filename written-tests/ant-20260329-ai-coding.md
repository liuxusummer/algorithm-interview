---
pageClass: ai-coding-page
title: 蚂蚁 AI Coding 2026-03-29
---

<div class="exam-session-banner">
  <div>
    <span>ANT GROUP / AI CODING / TREND WATCH</span>
    <strong>终端早餐店系统</strong>
    <small>2026-03-29 · 120 分钟工程交付 · Python</small>
  </div>
  <div class="exam-session-banner__meta">
    <span>系统设计</span>
    <span>状态机</span>
    <span>API 契约</span>
    <span>测试交付</span>
  </div>
</div>

# 蚂蚁 AI Coding：终端早餐店系统

<div class="ai-trend-callout">
  <strong>NEW FORMAT</strong>
  <p>这不是传统 ACM 单文件题，而是限定时间的工程交付题。考察重点已经从“能否写出一个算法”扩展到“能否带着 AI 完成需求拆解、架构实现、验证与文档交付”。本页全部实现仍使用 Python。</p>
</div>

来源：[Zero2Leetcode · 蚂蚁 AI Coding 3.29](https://onefly.top/zero2Leetcode/04_real_interviews/ant/ai-coding-20260329/index.html)。

## 任务边界

实现一个多终端早餐店系统，覆盖顾客下单、店主处理、叫号展示和支付结束的完整流程。

| 终端 | 默认端口 | 职责 |
|---|---:|---|
| 叫号牌端 | 8024 | 展示当前订单及状态 |
| 顾客端 | 8025 | 浏览菜单、创建订单、查询进度 |
| 店主端 | 8026 | 查看订单、推进或取消订单 |

核心状态流：

```text
待确认 → 已确认 → 制作中 → 待取餐 → 已支付
   └────────→ 已取消 ←────────┘
```

交付至少包含：可运行代码、测试脚本及结果、启动和使用说明。持久化、权限控制和高可读 TUI 属于加分项。

## 这类题为什么会成为新趋势

AI 能快速生成局部代码后，区分度转移到了更上层的能力：

1. **需求建模**：能否发现三个终端共享同一订单事实源；
2. **边界控制**：能否把状态跳转、权限和异常输入写成明确规则；
3. **AI 协作**：能否一次只交付一个模块，并提供可检查的验收条件；
4. **工程闭环**：能否用测试和文档证明系统真的可运行；
5. **时间决策**：能否在功能完整、技术复杂度和剩余时间之间取舍。

考试中最危险的做法，是让 AI 一次生成整个项目，再在最后二十分钟集中排错。更稳妥的方式是让每个阶段都产生一个可以运行、可以验证的中间结果。

## 推荐架构

在两小时限制下，推荐“中心服务 + 三个轻量客户端”：

```text
breakfast_shop/
├── app/
│   ├── main.py          # FastAPI 入口与路由
│   ├── domain.py        # 订单、菜单、状态机
│   ├── repository.py    # 内存或 SQLite 存储
│   └── settings.py      # 环境变量与配置
├── terminals/
│   ├── customer.py      # 顾客端
│   ├── owner.py         # 店主端
│   └── display.py       # 叫号牌端
├── tests/
│   └── test_orders.py
├── requirements.txt
└── README.md
```

技术取舍：

- 服务端：FastAPI，接口清晰、自动生成 OpenAPI；
- 终端 UI：先用标准输入输出实现，时间充足再用 Rich 美化；
- 同步方式：叫号牌每两秒 HTTP 轮询，避免考试中引入 WebSocket 复杂度；
- 存储：先内存仓库跑通流程，再替换为 SQLite；
- 权限：店主请求读取环境变量中的 token，不在仓库中写真实密钥。

## 先设计状态机

状态机是整个系统的业务核心。若只在路由里散落 `if`，后续很容易出现跳过制作直接支付、取消已支付订单等错误。

```python
from enum import StrEnum


class OrderStatus(StrEnum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    COOKING = "COOKING"
    READY = "READY"
    PAID = "PAID"
    CANCELLED = "CANCELLED"


VALID_TRANSITIONS: dict[OrderStatus, set[OrderStatus]] = {
    OrderStatus.PENDING: {
        OrderStatus.CONFIRMED,
        OrderStatus.CANCELLED,
    },
    OrderStatus.CONFIRMED: {
        OrderStatus.COOKING,
        OrderStatus.CANCELLED,
    },
    OrderStatus.COOKING: {
        OrderStatus.READY,
        OrderStatus.CANCELLED,
    },
    OrderStatus.READY: {OrderStatus.PAID},
    OrderStatus.PAID: set(),
    OrderStatus.CANCELLED: set(),
}


def ensure_transition(
    current: OrderStatus,
    target: OrderStatus,
) -> None:
    """非法流转立即失败，避免业务状态被悄悄破坏。"""
    if target not in VALID_TRANSITIONS[current]:
        raise ValueError(f"不允许从 {current} 切换到 {target}")
```

### 状态机应满足的性质

- `PAID` 与 `CANCELLED` 是终态，不能再离开；
- 每个非终态仅允许题目明确规定的下一步；
- 状态校验只在领域层实现一次，API、TUI 和测试共用；
- 更新失败时订单原状态不能被修改。

## 数据模型

先做最小模型，避免一开始就加入优惠券、库存、退款等题目没有要求的概念。

```python
from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass(frozen=True)
class MenuItem:
    id: int
    name: str
    price_cents: int


@dataclass
class OrderItem:
    menu_item_id: int
    quantity: int


@dataclass
class Order:
    id: int
    items: list[OrderItem]
    status: OrderStatus = OrderStatus.PENDING
    created_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    def change_status(self, target: OrderStatus) -> None:
        ensure_transition(self.status, target)
        self.status = target
```

金额使用整数“分”而不是浮点数，避免 `0.1 + 0.2` 类精度问题；订单号由仓库统一生成，终端不得自行猜测。

## API 契约

先写接口表，再写代码。它既是 AI 的实现上下文，也是后续测试的验收标准。

| Method | Path | 调用方 | 成功结果 | 主要异常 |
|---|---|---|---|---|
| `GET` | `/menu` | 顾客端 | 菜单列表 | — |
| `POST` | `/orders` | 顾客端 | `201` + 新订单 | 空订单、数量非法 |
| `GET` | `/orders` | 三端 | 订单列表 | 状态筛选非法 |
| `GET` | `/orders/{id}` | 三端 | 单个订单 | 订单不存在 |
| `PUT` | `/orders/{id}/status` | 店主端 | 更新后的订单 | 无权限、非法跳转 |

更新状态接口必须先鉴权、再查订单、最后执行领域层状态校验。顺序错误可能泄露订单是否存在，也可能在失败请求中留下脏状态。

## 服务端最小闭环

下面代码展示核心路由的实现方式。真实项目应把仓库和领域模型拆到独立文件。

```python
import os

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Breakfast Shop")
orders: dict[int, Order] = {}
next_order_id = 1


class StatusRequest(BaseModel):
    status: OrderStatus


@app.get("/orders")
def list_orders() -> list[Order]:
    return sorted(orders.values(), key=lambda order: order.id)


@app.put("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    request: StatusRequest,
    owner_token: str | None = Header(default=None),
) -> Order:
    expected_token = os.environ.get("OWNER_TOKEN")
    if not expected_token or owner_token != expected_token:
        raise HTTPException(status_code=403, detail="权限不足")

    order = orders.get(order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="订单不存在")

    try:
        order.change_status(request.status)
    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error

    return order
```

这里不提供任何真实 token；公开仓库只说明变量名和配置方法。

## 三端实现顺序

### 1. 顾客端

先实现“获取菜单 → 输入商品和数量 → 创建订单 → 显示订单号”。必须处理空输入、非数字数量和服务端不可用。

### 2. 店主端

展示可处理订单，根据当前状态只给出合法操作。例如 `READY` 状态只显示“确认支付”，不要让用户输入任意状态字符串。

### 3. 叫号牌端

每隔两秒拉取一次订单列表，按 `COOKING`、`READY` 分栏展示。网络失败时保留上一次成功数据，并在界面上显示“连接中断”，不要直接退出。

## 测试矩阵

| 类别 | 必测场景 | 预期 |
|---|---|---|
| 主链路 | 创建 → 确认 → 制作 → 待取 → 支付 | 最终为 `PAID` |
| 状态机 | `PENDING → READY` | `409`，状态不变 |
| 终态 | 已支付订单再次更新 | `409` |
| 权限 | 不带或携带错误 token | `403` |
| 输入 | 空订单、数量为 0 | `422` 或业务错误 |
| 查询 | 不存在的订单号 | `404` |
| 恢复 | 重启后读取 SQLite | 数据仍存在 |

状态机的最小单元测试：

```python
import pytest


def test_order_cannot_skip_cooking() -> None:
    order = Order(id=1, items=[OrderItem(menu_item_id=1, quantity=1)])

    with pytest.raises(ValueError):
        order.change_status(OrderStatus.READY)

    # 失败操作不能污染原状态。
    assert order.status is OrderStatus.PENDING


def test_complete_order_flow() -> None:
    order = Order(id=1, items=[OrderItem(menu_item_id=1, quantity=1)])

    for status in (
        OrderStatus.CONFIRMED,
        OrderStatus.COOKING,
        OrderStatus.READY,
        OrderStatus.PAID,
    ):
        order.change_status(status)

    assert order.status is OrderStatus.PAID
```

## 120 分钟作战节奏

| 时间 | 必须达到的状态 | 超时降级 |
|---:|---|---|
| 0–10 分钟 | 需求、状态机、接口表确定 | 停止比较技术栈 |
| 10–35 分钟 | 领域模型和服务端主链路可运行 | 先用内存存储 |
| 35–60 分钟 | 三端能调用真实接口 | TUI 降级为普通终端 |
| 60–85 分钟 | 主流程与异常测试通过 | 暂停美化 |
| 85–105 分钟 | SQLite、权限或显示优化 | 只选一个加分项 |
| 105–120 分钟 | README、启动脚本、最终回归 | 不再新增功能 |

## 与 AI 协作的五阶段提示框架

### P · Plan

把完整题目交给 AI，要求它只输出模块、数据模型、接口和风险，不写代码。你负责确认边界。

### A · Architect

一次实现一个核心文件，并给出验收条件，例如“运行状态机单测必须全部通过”。不要同时生成五个相互依赖的模块。

### R · Realize

在后端接口已经可调用后，再生成三个终端。明确真实 API 地址、错误处理和用户输入约束。

### S · Stabilize

把完整错误、相关代码和失败测试一起交给 AI，要求只修复导致失败的最小范围，并立即重跑测试。

### E · Export

最后让 AI 根据已经存在的代码生成 README，要求列出安装、启动、测试、目录结构和设计决策，禁止编造尚未实现的功能。

## 最终交付检查

- [ ] 新环境按 README 可以启动；
- [ ] 三个终端连接的是同一个服务端；
- [ ] 主状态链与取消链均有测试；
- [ ] 失败请求不会修改订单；
- [ ] 仓库不包含真实 token、私有地址或本机路径；
- [ ] 测试结果与已实现功能一致；
- [ ] 最后五分钟停止开发，只做回归和清理。

AI Coding 的核心并不是“提示词写得花哨”，而是把工程拆成可以独立验收的增量，并在每个增量后保留可运行状态。
