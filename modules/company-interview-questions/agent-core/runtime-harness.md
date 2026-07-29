---
title: Agent Runtime 与 Harness
description: 系统讲解 Agent Loop、显式状态、检查点、暂停恢复、幂等副作用、预算和长任务 Harness。
---

# 01 · Agent Runtime 与 Harness

Runtime 是 Agent 真正“活起来”的地方。它负责把目标、模型和工具组织成可停止、可恢复、可审计的执行过程。Harness 则是在 Runtime 之外进一步约束长任务的脚手架：它规定如何分解任务、保存进度、验证结果、处理失败并交接给下一轮执行。

## 90 秒面试回答

生产级 Agent Runtime 不是一个无限 `while` 循环。它至少包含 **显式状态机、模型决策、确定性动作校验、工具执行、检查点、终止条件和预算控制**。每一步都把输入、候选动作、策略结果、工具结果和新状态写成事件；在调用高风险工具前、获得工具结果后以及人工审批点保存检查点。

恢复时不能简单“从崩溃的那一行继续”，而要根据持久化状态判断某个副作用是否已提交。写操作必须使用幂等键或事务性 Outbox，暂停点之前的代码要允许重放。长任务还需要 Harness：把任务拆成可验收的小单元，用结构化进度文件或状态表交接，定期压缩上下文，并让独立验证器检查产物。最后用步骤、时间、Token、费用、工具调用和风险动作六类预算防止失控。

## 最小运行时状态

不要把状态隐含在一长串消息里。一个可恢复状态至少应有：

```python
from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class RunStatus(str, Enum):
    RUNNING = "running"
    WAITING_APPROVAL = "waiting_approval"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class Budget:
    max_steps: int = 20
    max_tool_calls: int = 12
    max_tokens: int = 50_000
    max_cost_usd: float = 2.0
    deadline_ms: int = 0


@dataclass
class AgentState:
    run_id: str
    tenant_id: str
    user_id: str
    goal: str
    status: RunStatus = RunStatus.RUNNING
    step: int = 0
    tool_calls: int = 0
    tokens_used: int = 0
    cost_usd: float = 0.0
    evidence: list[dict[str, Any]] = field(default_factory=list)
    pending_action: dict[str, Any] | None = None
    final_answer: str | None = None
    version: int = 0
```

需要显式保存 `tenant_id` 和 `user_id`，因为恢复、记忆、工具授权和审计都必须回到原始安全上下文，不能只凭 `run_id` 猜测身份。

## 一步执行的正确顺序

```text
1. 加载 state 和版本
2. 检查取消信号、截止时间与各类预算
3. 依据 state 构造本轮最小上下文
4. 请求模型提出结构化 action
5. 校验 Schema、业务前置条件和权限
6. 必要时挂起并请求人工审批
7. 使用幂等键执行工具
8. 记录结果、费用、事件和新状态
9. 原子写入检查点
10. 判断成功、失败、继续或降级
```

模型只参与第 4 步。预算、授权、审批和状态提交必须由代码控制。

## Python 参考实现：有边界的 Agent Loop

下面省略具体模型 SDK，重点展示运行时边界：

```python
import time
from typing import Protocol


class Store(Protocol):
    def load(self, run_id: str) -> AgentState: ...
    def commit(self, state: AgentState, expected_version: int) -> None: ...
    def append_event(self, run_id: str, event: dict) -> None: ...


def budget_exhausted(state: AgentState, budget: Budget) -> str | None:
    if state.step >= budget.max_steps:
        return "step_budget_exhausted"
    if state.tool_calls >= budget.max_tool_calls:
        return "tool_budget_exhausted"
    if state.tokens_used >= budget.max_tokens:
        return "token_budget_exhausted"
    if state.cost_usd >= budget.max_cost_usd:
        return "cost_budget_exhausted"
    if budget.deadline_ms and time.time_ns() // 1_000_000 >= budget.deadline_ms:
        return "deadline_exceeded"
    return None


def run_one_step(
    state: AgentState,
    budget: Budget,
    propose_action,
    policy_engine,
    tool_gateway,
    store: Store,
) -> AgentState:
    reason = budget_exhausted(state, budget)
    if reason:
        state.status = RunStatus.FAILED
        store.append_event(state.run_id, {"type": "run_stopped", "reason": reason})
        store.commit(state, expected_version=state.version)
        return state

    # 上下文由状态重新构造，不能把整个历史不加选择地回放给模型。
    context = build_context(state)
    proposal, usage = propose_action(context)
    state.tokens_used += usage.tokens
    state.cost_usd += usage.cost_usd

    decision = policy_engine.authorize(
        actor={"tenant_id": state.tenant_id, "user_id": state.user_id},
        action=proposal,
        context={"run_id": state.run_id, "goal": state.goal},
    )
    store.append_event(
        state.run_id,
        {"type": "action_proposed", "action": proposal, "decision": decision.kind},
    )

    if decision.kind == "deny":
        state.evidence.append({"type": "policy_denial", "reason": decision.reason})
    elif decision.kind == "require_approval":
        state.pending_action = proposal
        state.status = RunStatus.WAITING_APPROVAL
    else:
        # run_id + step + 规范化动作构成稳定幂等键，重试不会重复产生副作用。
        idempotency_key = make_idempotency_key(state.run_id, state.step, proposal)
        result = tool_gateway.execute(proposal, idempotency_key=idempotency_key)
        state.tool_calls += 1
        state.evidence.append({"type": "tool_result", "data": result.for_model()})

    state.step += 1
    old_version = state.version
    state.version += 1
    # 实际实现中，事件与状态提交应处于同一事务或使用事务性 Outbox。
    store.commit(state, expected_version=old_version)
    return state
```

这个例子没有假装“恰好一次执行”。分布式系统很难普遍提供 exactly-once，可靠做法通常是 **至少一次调度 + 幂等副作用 + 可核对的提交记录**。

## 检查点应该保存什么

检查点不只是消息列表。建议保存：

- 运行身份：`run_id`、租户、用户、授权快照；
- 任务状态：目标、已完成子任务、待处理动作；
- 控制状态：步骤、预算、取消标志、截止时间；
- 外部交互：工具调用 ID、幂等键、请求摘要、提交状态；
- 上下文引用：证据 ID、记忆版本、知识库快照版本；
- 模型信息：模型、Prompt/策略版本、采样参数；
- 审批信息：申请者、审批者、审批范围和过期时间；
- 乐观锁版本：避免两个 Worker 同时推进同一任务。

大体量工具结果应放对象存储，检查点只存内容哈希和引用，避免状态行无限膨胀。

## 暂停、审批与恢复

一个可靠审批点应满足：

1. 暂停前状态已经持久化；
2. 待审批动作被规范化，用户能看清目标、影响和关键参数；
3. 审批绑定具体动作哈希、身份、范围和过期时间；
4. 恢复时重新检查权限和业务前置条件；
5. 审批只授权这一个动作，不授权后续模型自由发挥；
6. 拒绝、超时和撤销都有明确分支。

LangGraph 的官方 Interrupt 文档特别提醒：恢复后节点会从开头重新执行。因此，暂停之前的副作用必须幂等，或者放到暂停之后。

## 幂等与副作用

### 三类工具分级

| 类型 | 示例 | 默认策略 |
|---|---|---|
| 只读 | 查询监控、搜索文档 | 可自动执行，但仍需鉴权和限流 |
| 可逆写 | 创建草稿、加标签 | 自动或低级审批，保留补偿动作 |
| 高风险写 | 转账、删除、发外部消息 | 强审批、短时授权、执行后核验 |

### 幂等键

幂等键应该表示业务意图，而不是每次重试随机生成：

```python
import hashlib
import json


def make_idempotency_key(run_id: str, step: int, action: dict) -> str:
    canonical = json.dumps(action, sort_keys=True, separators=(",", ":"))
    raw = f"{run_id}:{step}:{canonical}".encode()
    return hashlib.sha256(raw).hexdigest()
```

接收方应把幂等键与已提交结果一起保存。再次收到相同键时返回原结果，而不是重新执行。

### 不确定提交

最危险的情况是工具已成功，但 Agent 在收到响应前崩溃。恢复时不能直接重试，应先通过幂等键或查询接口确认：

```text
执行超时
  ├─ 能按幂等键查询 → 已提交则读取结果，未提交才重试
  ├─ 工具有幂等语义 → 使用相同键安全重试
  └─ 无法确认且不可逆 → 转人工处理，不盲目重放
```

## 错误不是一个统一的 retry

| 错误 | 例子 | 处理 |
|---|---|---|
| 瞬时故障 | 429、短时网络错误 | 指数退避、抖动、有限次数重试 |
| 输入可修复 | Schema 校验失败 | 返回结构化错误，让模型最多修正一次 |
| 权限错误 | 403、作用域不足 | 不重试；重新授权或拒绝 |
| 业务冲突 | 库存变化、版本冲突 | 重新读取状态并重新规划 |
| 不确定提交 | 超时但服务端可能成功 | 先核对幂等记录 |
| 永久错误 | 资源不存在、策略禁止 | 失败或走替代路径 |
| 系统性故障 | 下游持续不可用 | 熔断、降级、排队或人工接管 |

“最多重试三次”不是策略，必须先分类。

## 长任务 Harness

长任务最大的敌人是 **上下文丢失和进度幻觉**。Anthropic 对长时间应用开发的工程复盘强调，单靠一次长上下文或自动压缩并不足够，需要用 Harness 管理任务和验证。

一个实用 Harness 包含：

```text
任务清单：每项有验收标准、依赖、状态和负责人
进度摘要：已经完成什么、证据在哪里、下一步是什么
产物索引：文件、提交、测试、日志和外部资源引用
验证器：单元测试、静态检查、规则或独立评估 Agent
交接协议：下一轮先读什么，禁止重复做什么
```

进度不能只写“基本完成”。应写成可证伪事实：

```yaml
task: add_retry_policy
status: verified
artifacts:
  - src/runtime/retry.py
verification:
  command: pytest tests/runtime/test_retry.py
  result: 18 passed
remaining_risks:
  - downstream idempotency contract needs integration test
```

## 六类预算

生产系统不要只设 `max_steps`：

| 预算 | 约束对象 | 超限动作 |
|---|---|---|
| 步骤预算 | 循环次数 | 总结当前证据并停止 |
| 时间预算 | 端到端截止时间 | 取消子任务、返回部分结果 |
| Token 预算 | 输入与输出 | 压缩、换小模型或停止 |
| 费用预算 | 模型和工具成本 | 降级或请求用户确认 |
| 工具预算 | 调用次数、并发 | 合并查询、限流 |
| 风险预算 | 写操作、外发、敏感读取 | 强制审批或禁止 |

预算应在每一步之前检查，而不是账单产生后才报警。

## 常见失败设计

### 1. 无限循环直到模型说完成

模型可能反复查询、在两个工具之间震荡，或错误地认为还缺信息。必须由 Runtime 设置硬终止条件和停滞检测。

### 2. 所有状态都在对话历史

历史可能被压缩、截断或污染，也无法可靠表达提交状态。业务状态要结构化持久化。

### 3. 崩溃后从最后一个节点直接重跑

如果节点已发邮件或扣款，会重复产生副作用。需要幂等键、提交记录和恢复核对。

### 4. 审批后允许模型重新生成参数

用户批准的是 A，恢复后模型可能生成 B。审批必须绑定动作内容哈希。

### 5. 一个大 Agent 完成所有任务

长任务没有小里程碑和独立验收，失败时不知道重做哪部分。用 Harness 拆成可交付、可验证单元。

## 最佳实践清单

### 必须

- 显式状态机，不以聊天消息代替业务状态；
- 每轮前检查取消与全部预算；
- 关键节点检查点，状态写入使用版本控制；
- 写工具具备幂等或补偿语义；
- 暂停/恢复逻辑按“可重放”设计；
- 错误分类，不对权限和永久错误盲目重试；
- 终止由确定性规则和任务验收共同决定。

### 推荐

- 事件日志与状态快照结合，既可回放又能快速加载；
- 长任务使用结构化任务清单、产物索引和独立验证；
- 对停滞、重复动作和无新增证据进行检测；
- 高风险动作执行后做 read-after-write 核验；
- 对运行时、Prompt、工具和策略全部版本化。

## 高频追问

### Q1：检查点多久保存一次？

不是按固定秒数一刀切，而是在 **状态跃迁和副作用边界** 保存：模型动作确定后、工具调用前后、审批前后、子任务完成时。纯计算可按时间或进度批量保存。

### Q2：如何避免两个 Worker 同时恢复同一任务？

使用租约或乐观锁。提交时携带 `expected_version`，版本不一致则说明状态已被其他 Worker 推进，当前 Worker 放弃结果并重新加载。

### Q3：模型说完成了就结束吗？

不能。运行时用任务验收器检查结构化成功条件；例如报告必须引用至少两个有效证据、测试必须通过、外部写入必须核验。模型的 `finish` 只是候选终止动作。

### Q4：什么时候转人工？

风险超阈值、权限不足、不确定提交、证据冲突、连续无进展、预算将耗尽或输出置信不足时。人工接管应该是状态机中的正常分支，不是异常补丁。

## 自测

1. Agent 在发出退款请求后超时，恢复时你会先做什么？
2. 为什么暂停点之前的代码必须允许重放？
3. 检查点里为什么要保存授权上下文和工具调用 ID？
4. 如何区分“模型需要更多信息”和“Agent 已经陷入循环”？
5. 一个两小时任务如何保证下一轮执行不会重复劳动？

## 与高频题联动

- [AQ02：最小 Agent Loop](../agent-development.md#aq02-不使用框架-如何实现一个最小但可靠的-agent-loop)
- [AQ06：暂停、恢复与重复副作用](../agent-development.md#aq06-长时间运行的-agent-如何实现暂停、恢复和恰当的人工审批)
- [AQ10：生产架构设计](../agent-development.md#aq10-设计一个可上线的企业-agent-如何控制成本、延迟、可观测性和降级)

## 权威资料

- [Anthropic：Harness design for long-running application development（2026-03-24）](https://www.anthropic.com/engineering/harness-design-long-running-apps)
- [Anthropic：Effective harnesses for long-running agents（2025-11-26）](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [LangGraph：Persistence](https://docs.langchain.com/oss/python/langgraph/persistence)
- [LangGraph：Interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts)
- [LangGraph：Thinking in LangGraph](https://docs.langchain.com/oss/python/langgraph/thinking-in-langgraph)

---

[返回专题导读](./README.md) · **下一章：** [工具工程与权限边界](./tool-engineering.md)
