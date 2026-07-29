---
title: MCP、A2A 与多 Agent
description: 分清函数调用、MCP、A2A 和本地多 Agent 的边界，掌握协议接入、能力发现、任务协作和可靠编排。
---

# 07 · MCP、A2A 与多 Agent

函数调用、MCP、A2A 和多 Agent 经常被混为一谈。它们处在不同层：

```text
模型函数调用：模型如何提出结构化动作
MCP：应用 / Agent 如何连接工具、资源和提示服务器
A2A：独立 Agent 如何发现能力并协作完成任务
多 Agent 架构：系统内部如何拆分、并行和汇总工作
```

协议解决互操作，不替代业务编排、权限、安全、评估或正确性。

## 90 秒面试回答

函数调用是模型输出契约，执行仍由宿主程序负责；MCP 标准化客户端与能力服务器之间的连接，核心原语包括 Tools、Resources、Prompts 等；A2A 面向独立、可能由不同框架或组织实现的 Agent，提供 Agent Card 能力发现、Message、Task、Artifact、流式和异步协作。

选择时我优先使用最简单边界：进程内稳定函数直接调用；需要复用、动态发现或跨应用共享工具时用 MCP；需要把一个长任务委托给拥有独立身份、状态和生命周期的远程 Agent 时才用 A2A。本地多 Agent 只有在任务可并行、需要不同上下文或专长，并且质量收益大于协调与 Token 成本时才采用。无论哪种方式，都要做身份认证、能力允许清单、最小权限、超时取消、幂等、Trace 传播、版本兼容和输出验证。

## 决策矩阵

| 需求 | 优先选择 | 原因 |
|---|---|---|
| 同进程调用稳定业务函数 | 直接函数 / SDK | 最简单、类型和调试最好 |
| 让模型选择一个本地动作 | 函数调用 + 工具网关 | 模型只产生结构化提案 |
| 多个客户端复用工具与资源 | MCP | 标准化发现和调用 |
| 独立 Agent 跨系统委托任务 | A2A | 有能力发现与任务生命周期 |
| 一个系统内并行探索多个方向 | 本地多 Agent | 编排器可控制上下文和预算 |
| 固定步骤的数据流水线 | 工作流 / DAG | 不需要自治与协议复杂度 |

不要为了“架构先进”把一个普通函数包装成远程 Agent。

## 函数调用的边界

模型生成：

```json
{
  "name": "order.lookup",
  "arguments": {"order_id": "ORD-123"}
}
```

宿主程序仍需完成：

```text
Schema 验证 → 身份与资源授权 → 执行 → 结果过滤 → 回传模型
```

函数调用不定义服务发现、网络传输、资源访问或跨 Agent 任务协作。

## MCP 解决什么

MCP 采用客户端—服务器关系。当前 `2025-11-25` 稳定规范中，常用 Server 能力包括：

| 原语 | 谁主要控制 | 用途 |
|---|---|---|
| Tools | 模型选择、客户端执行控制 | 查询或执行动作 |
| Resources | 应用选择、模型消费 | 文档、文件、结构化上下文 |
| Prompts | 用户或应用选择 | 可复用提示模板 |
| Tasks | 请求方/接收方协商 | 持久请求、轮询与延迟结果；当前实验性 |

### MCP 接入流程

```text
发现并连接 Server
  → 协议版本与能力协商
  → 认证与授权
  → 获取工具/资源/提示目录
  → 本地信任与策略过滤
  → 向模型暴露最小能力集
  → 调用、校验结果、观测和审计
```

客户端不能因为 Server 声明 `readOnlyHint=true` 就跳过本地风险判断。MCP 规范明确把 Tool Annotations 定义为 hint，来自不可信 Server 时不能据此做安全决策。

## MCP 生产基线

### 版本与能力

- 固定协议版本，不依赖“latest”自动升级；
- 初始化时检查能力，不假定全部 Server 支持同样原语；
- 工具目录变更触发审查与兼容测试；
- 工具输入输出 Schema 版本化；
- 实验性 Tasks 单独开关。

### 身份与授权

- HTTP 传输采用规范授权流程和 HTTPS；
- 校验 Token issuer、audience、scope 和过期；
- 使用 Resource Indicators 绑定目标 Server；
- 禁止 Token passthrough；
- 下游 API 使用 Server 自己获得的独立 Token；
- stdio 也限制环境变量、文件和进程权限。

### 可靠性

- 每个调用有超时、取消、幂等和错误分类；
- 大结果分页或使用 Resource Link；
- 长任务使用轮询/异步时绑定授权上下文；
- Server 断开、重连和目录变化都有明确状态；
- Trace Context 跨 Server 传播或建立受控链接。

### 安全

- Server 允许清单与所有者；
- 工具、资源内容都视为可能不可信；
- 本地策略再次验证工具动作；
- 限制网络、文件和数据流；
- 对新版本做注入、越权和泄漏回归。

## A2A 解决什么

A2A `0.3.0` 的目标是让独立、可能不透明的 Agent 互操作，而不要求访问彼此内部记忆和工具。

核心概念：

| 概念 | 作用 |
|---|---|
| Agent Card | 发布身份、能力、端点、交互方式和安全方案 |
| Message | 用户、Agent 之间的消息与 Parts |
| Task | 可持续跟踪的协作任务和状态 |
| Artifact | Agent 生成的文件、数据或其他产物 |
| Streaming | 持续推送执行更新 |
| Push notification | 长任务异步完成后通知 |

典型流程：

```text
发现 Agent Card
  → 验证来源、身份和能力
  → 选择交互模式与认证
  → 创建 Task / 发送 Message
  → 接收状态、消息和 Artifact
  → 校验产物与任务终态
  → 取消、重试、补偿或继续
```

Agent Card 是能力声明，不是可信证明。仍需 HTTPS、认证、允许清单和契约测试。

## MCP 与 A2A 如何配合

```text
用户
  │
  ▼
主 Agent
  ├─ MCP → 搜索、数据库、文件等工具与资源
  ├─ A2A → 法务 Agent（独立身份与长期任务）
  │          └─ MCP → 法规库与合同系统
  └─ A2A → 财务 Agent
             └─ MCP → 预算和付款工具
```

- MCP 连接“能力”；
- A2A 连接“独立的协作主体”；
- 两者都不替代主 Agent 的目标分解、预算、审批和结果验收。

## 什么时候需要多 Agent

### 值得拆

- 子任务可以真正并行；
- 每个子任务需要大量独立上下文；
- 需要不同权限、模型、工具或领域提示；
- 主 Agent 无法在单一上下文内有效覆盖；
- 汇总结果可验证，错误不会无限传播；
- 质量或时延收益显著高于 Token 和协调成本。

### 不值得拆

- 步骤严格串行；
- 子任务高度共享上下文；
- 只是为了模拟“角色讨论”；
- 没有清晰输入输出和负责人；
- 最终结果无法自动验收；
- 单 Agent 加好工具和上下文已经足够。

多 Agent 会放大调用次数、错误概率和攻击面。不是越多越强。

## 常见架构模式

### Orchestrator–Worker

主 Agent 分解，Worker 并行，主 Agent 汇总。适合开放调研、代码库多模块分析。Anthropic 的多 Agent Research 使用这一模式。

### Router–Specialist

路由器把任务交给一个专业 Agent。适合领域边界清楚、任务只需一个专家的场景。

### Pipeline

每个 Agent 处理固定阶段。若路径固定，通常直接工作流更合适，不一定需要每个阶段自治。

### Debate / Reviewer

生成者与审查者分离。适合高价值产物，但审查者必须有独立证据或测试，不能只表达不同意见。

## Orchestrator–Worker 的 Python 骨架

```python
import asyncio
from dataclasses import dataclass
from typing import Any, Awaitable, Callable


@dataclass(frozen=True)
class Subtask:
    subtask_id: str
    objective: str
    allowed_tools: tuple[str, ...]
    token_budget: int
    timeout_seconds: float


@dataclass(frozen=True)
class Finding:
    subtask_id: str
    claims: tuple[str, ...]
    evidence_refs: tuple[str, ...]
    unresolved: tuple[str, ...]
    tokens_used: int


async def run_workers(
    subtasks: list[Subtask],
    worker: Callable[[Subtask], Awaitable[Finding]],
    max_concurrency: int = 4,
) -> list[Finding]:
    semaphore = asyncio.Semaphore(max_concurrency)

    async def bounded(task: Subtask) -> Finding:
        async with semaphore:
            # 每个 Worker 继承最小工具集与独立预算，不共享全部主上下文。
            return await asyncio.wait_for(
                worker(task),
                timeout=task.timeout_seconds,
            )

    results = await asyncio.gather(
        *(bounded(task) for task in subtasks),
        return_exceptions=True,
    )

    findings: list[Finding] = []
    for task, result in zip(subtasks, results):
        if isinstance(result, Exception):
            findings.append(
                Finding(
                    subtask_id=task.subtask_id,
                    claims=(),
                    evidence_refs=(),
                    unresolved=(f"worker_failed:{type(result).__name__}",),
                    tokens_used=0,
                )
            )
        else:
            findings.append(result)
    return findings
```

主 Agent 汇总前还要：

- 验证证据引用可访问且属于当前租户；
- 去重和冲突检测；
- 标记失败 Worker，不用幻觉填空；
- 检查父任务总预算；
- 对关键结论做独立验证。

## 任务分解契约

坏任务：

```text
帮我研究一下安全问题。
```

好任务：

```yaml
objective: 核对 MCP 2025-11-25 授权规范中的 Token audience 要求
deliverable:
  claims:
    - 每条不超过 80 字
  evidence:
    - 官方规范直达链接
constraints:
  sources:
    allow:
      - modelcontextprotocol.io
  no_external_actions: true
budget:
  tokens: 8000
  tool_calls: 8
success:
  - 至少找到一个规范级 MUST 要求
  - 明确 Token passthrough 是否允许
```

Worker 之间共享“任务契约”，不共享无边界的全部上下文和凭证。

## 跨 Agent 身份与授权

A2A 委托至少保留：

- 原始用户或服务主体；
- 发起 Agent 身份；
- 接收 Agent 身份；
- 委托目标、作用域和有效期；
- 可访问资源；
- 是否允许继续转委托；
- 审计与 Trace 关联。

不要把主 Agent 的全部权限转交给子 Agent。对子任务签发最小权限，默认禁止再次委托。

## 结果与 Artifact 验证

远程 Agent 返回 `completed` 不等于任务完成。主 Agent应检查：

- Artifact 的类型、大小、哈希和恶意内容；
- 业务 Schema 与成功断言；
- 引用和数据来源；
- 是否包含不应外泄的数据；
- 是否超预算或使用禁止能力；
- 与其他 Agent 结果是否冲突。

远程输出和本地工具结果一样，都是不可信输入。

## 可靠性与取消

长任务必须处理：

| 问题 | 做法 |
|---|---|
| 网络断开 | 通过 Task ID 查询，不重新创建 |
| 重复请求 | 客户端请求 ID / 幂等键 |
| 状态丢失 | 持久 Task Store 与授权绑定 |
| 子 Agent 超时 | 取消、返回部分结果或替代 Worker |
| 父任务取消 | 向所有子任务传播取消 |
| 结果迟到 | 检查父任务状态和版本后再接纳 |
| 协议不兼容 | 能力协商、版本固定、降级 |

## 多 Agent 如何评估

除最终结果外，还要测：

- 分解覆盖率和重叠率；
- Worker 成功率、超时率；
- 证据重复与冲突；
- 汇总是否忠于 Worker 证据；
- 子 Agent Token、工具和总成本；
- 并行带来的真实时延收益；
- 跨 Agent 越权和数据泄漏；
- 一个 Worker 失败时的退化质量。

对照单 Agent 基线。多 Agent 只有显著提高质量或时延，才值得复杂度。

## 常见失败设计

### 把 MCP 当远程 Agent

MCP Tool 通常是受调用的能力；远程 Agent 有独立任务状态和自主循环。边界不同。

### Agent Card 或 Tool Annotation 等于可信

都是对方元数据声明。需要身份、允许清单、策略和验证。

### 子 Agent 继承所有上下文和权限

放大泄漏和越权面。按子任务提供最小上下文、工具和预算。

### 多 Agent 互相聊天直到达成一致

成本无上限，一致也不等于正确。设置轮数、证据和验收器。

### 远程任务超时就重新创建

可能产生重复副作用。使用 Task ID 或幂等请求查询原任务状态。

## 最佳实践清单

### 必须

- 先按最简单边界选择函数、MCP、A2A 或工作流；
- 固定协议版本并进行能力协商；
- 远程能力和返回内容均按不可信处理；
- 身份、作用域、audience、租户和委托链完整；
- 长任务有 Task ID、幂等、取消和恢复；
- 子 Agent 使用最小上下文、权限和预算；
- 主 Agent 对 Artifact 和最终结果独立验收；
- Trace 与成本跨 Agent 关联。

### 推荐

- 维护 MCP Server 和 A2A Agent 资产清单；
- 对工具目录和 Agent Card 变化做审查；
- 多 Agent 与单 Agent 基线进行 A/B；
- 优先使用 Orchestrator–Worker，减少任意点对点通信；
- Worker 返回结构化 Claim、Evidence 和 Unresolved，而不是长篇自由文本。

## 高频追问

### Q1：MCP 和函数调用是什么关系？

函数调用定义模型如何提出结构化动作；MCP 标准化宿主如何发现和访问外部工具、资源等。MCP Tool 最终也可作为函数调用描述暴露给模型。

### Q2：MCP 与 A2A 可以互相替代吗？

不能完全替代。MCP 更偏能力连接，A2A 更偏独立 Agent 的任务协作；一个远程 Agent 内部还可以通过 MCP 使用工具。

### Q3：为什么多 Agent 常常更贵？

任务分解、多个上下文、并行搜索、汇总和验证都会增加模型调用；错误还会复合。必须看质量提升和成本/成功任务。

### Q4：如何防止子 Agent 失控？

最小目标、工具和权限；独立预算与超时；禁止默认再委托；可取消；输出经过验收；策略和审计仍由父系统控制。

## 自测

1. 什么时候直接函数比 MCP 更合适？
2. MCP Tool Annotation 为什么不能作为授权依据？
3. A2A 的 Task 与一次普通 RPC 有何区别？
4. 多 Agent 拆分的收益如何量化？
5. 主 Agent 为什么必须验证远程 Artifact？

## 与高频题联动

- [AQ04：MCP、函数调用和 A2A 的边界](../agent-development.md#aq04-模型函数调用、mcp-和-a2a-分别解决什么问题)
- [AQ09：什么时候需要多 Agent](../agent-development.md#aq09-什么时候应该使用多-agent-如何设计协作)

## 权威资料

- [MCP 2025-11-25 规范](https://modelcontextprotocol.io/specification/2025-11-25)
- [MCP：Tools](https://modelcontextprotocol.io/specification/2025-11-25/server/tools)
- [MCP：Resources](https://modelcontextprotocol.io/specification/2025-11-25/server/resources)
- [MCP：Tasks（实验性）](https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/tasks)
- [A2A 0.3.0 官方规范](https://a2a-protocol.org/v0.3.0/specification/)
- [Anthropic：How we built our multi-agent research system（2025-06-13）](https://www.anthropic.com/engineering/multi-agent-research-system)

---

[上一章：可观测性与成本控制](./observability-cost.md) · [返回专题导读](./README.md) · [回到 Agent 高频面试题](../agent-development.md)
