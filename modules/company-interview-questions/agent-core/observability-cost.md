---
title: Agent 可观测性与成本控制
description: 用 Trace、Metric、Log 和审计还原 Agent 决策链，并把 Token、工具、人工与失败成本纳入预算和优化。
---

# 06 · 可观测性与成本控制

一次 Agent 请求可能包含多轮模型调用、检索、工具、审批、重试和子 Agent。用户只看到“用了 45 秒”，系统必须能回答：慢在哪里、为什么调用、花了多少、是否越权、哪个版本导致退化。

## 90 秒面试回答

我会把一次 Agent 任务作为根 Trace，模型调用、检索、工具、策略、审批、检查点和子 Agent 都是子 Span，并统一携带 run、tenant、版本、风险和预算标识。Metric 用于趋势和告警，Log 记录结构化离散事件，审计日志专门保存不可抵赖的高风险动作；三者通过 Trace ID 关联。

遵循 OpenTelemetry GenAI 语义约定记录模型、输入输出 Token、完成原因和时延，但 Prompt、工具参数与结果可能含敏感数据，默认不采集正文，只在受控环境按需开启并脱敏。成本不只看模型账单，而按成功任务核算模型、检索、工具、基础设施和人工成本。Runtime 在每步前执行硬预算，线上监控 P50/P95、成功率、失败浪费、Token/成功任务和成本/成功任务，超阈值时路由小模型、压缩上下文、减少工具、降级或停止。

## 四种信号各自负责什么

| 信号 | 适合回答 | 例子 |
|---|---|---|
| Trace | 一次任务完整经过了什么 | 哪次模型调用后选择了错误工具 |
| Metric | 系统整体是否异常 | P95 延迟、成功率、Token 使用趋势 |
| Log | 发生了哪个离散事件 | 预算耗尽、状态迁移、解析失败 |
| Audit | 谁以什么授权执行了什么 | 用户批准后对订单提交退款 |

审计日志不能用普通 Debug Log 替代。它需要严格访问、完整字段、保留策略和防篡改能力。

## 推荐的 Trace 结构

OpenTelemetry GenAI 约定提供 `invoke_agent`、`chat` 和 `execute_tool` 等操作名。可以扩展出：

```text
invoke_agent run_id=...
├─ load_checkpoint
├─ build_context
│  ├─ retrieval
│  └─ memory.read
├─ chat model=... input_tokens=... output_tokens=...
├─ policy.evaluate decision=require_approval
├─ approval.wait
├─ execute_tool tool=refund.submit
├─ checkpoint.commit
├─ chat model=...
└─ evaluate_outcome
```

跨 MCP、A2A、消息队列和子 Agent 时传播 Trace Context；如果由于信任边界不能直接继承，至少保存受控的 `linked_trace_id`。

## Span 最少记录什么

### 根 Agent Span

- workflow / Agent 名称；
- `run_id`、会话 ID 的不可逆摘要；
- Agent、Prompt、策略和工具目录版本；
- 任务类别、风险等级、最终状态；
- 总步骤、Token、费用、延迟；
- 是否人工接管、是否降级。

### 模型 Span

- Provider、模型和操作名；
- 输入、输出、缓存和推理 Token；
- 完成原因、重试次数和错误类型；
- 请求队列、首 Token 和总延迟；
- 估算费用与模型路由原因。

### 工具 Span

- 工具和版本；
- 风险、作用域、策略结果；
- 幂等键摘要和目标资源摘要；
- 时延、错误分类、是否重试；
- 副作用是否核验。

### 上下文 Span

- 候选与最终文档数；
- 来源、权限过滤、截断和去重数量；
- 上下文 Token；
- 记忆和知识库快照版本。

避免把高基数、敏感或超长正文直接变成 Metric Label。

## Python 示例：统一追踪一次工具调用

```python
from contextlib import contextmanager
from time import perf_counter
from typing import Any

from opentelemetry import trace


tracer = trace.get_tracer("interview.agent-runtime")


@contextmanager
def traced_tool_call(
    *,
    tool_name: str,
    tool_version: str,
    risk: str,
    run_id_hash: str,
):
    started = perf_counter()
    with tracer.start_as_current_span(
        f"execute_tool {tool_name}",
        attributes={
            "gen_ai.operation.name": "execute_tool",
            "gen_ai.tool.name": tool_name,
            "app.tool.version": tool_version,
            "app.tool.risk": risk,
            # 只记录不可逆摘要，避免原始 run_id 成为敏感高基数标签。
            "app.run.id_hash": run_id_hash,
        },
    ) as span:
        try:
            yield span
            span.set_attribute("app.tool.success", True)
        except Exception as exc:
            span.set_attribute("app.tool.success", False)
            span.set_attribute("error.type", type(exc).__name__)
            span.record_exception(exc)
            raise
        finally:
            span.set_attribute(
                "app.tool.duration_ms",
                (perf_counter() - started) * 1000,
            )


def call_tool(gateway, proposal: dict[str, Any]) -> dict[str, Any]:
    with traced_tool_call(
        tool_name=proposal["tool"],
        tool_version="2026-07-29",
        risk=proposal["risk"],
        run_id_hash=proposal["run_id_hash"],
    ):
        return gateway.execute(proposal)
```

真实系统要由自动 Instrumentation 和 Runtime 统一注入字段，避免每个业务团队自行定义不兼容名称。

## 内容采集的安全默认值

OpenTelemetry 官方示例明确指出：Prompt、回复、工具参数和结果可能含敏感信息，因此默认只采集模型、Token 和时延等元数据。

建议分级：

| 环境 | 正文采集 |
|---|---|
| 本地开发合成数据 | 可开启 |
| 测试环境真实脱敏样本 | 按需、短期 |
| 生产普通请求 | 默认关闭 |
| 生产故障采样 | 经授权、脱敏、限时、严格访问 |
| 高敏业务 | 禁止或仅保留内容哈希与安全摘要 |

正文采集一旦开启，要有字段级脱敏、加密、访问审计、保留期限和删除能力。

## Metric 体系

### 可靠性

- 任务成功率与关键失败率；
- 停滞、预算耗尽、人工接管率；
- 模型、工具、策略和恢复错误率；
- 检查点恢复成功率；
- 取消生效延迟。

### 性能

- 端到端 P50 / P95 / P99；
- 模型排队、首 Token 和生成时间；
- 工具和检索 P95；
- Agent 步数和并行度；
- 审批等待时间单独统计。

### 质量

- 用户纠正、撤销和重复提问；
- 关键评估切片的在线代理指标；
- 有效证据、无效工具和重复动作比例；
- 记忆命中与陈旧记忆率。

### 成本

- 输入、输出、缓存、推理 Token；
- 模型费用、工具/API 费用；
- 检索、向量库、沙箱和存储费用；
- 人工审批与接管耗时；
- 失败任务浪费费用。

## 成本应该如何计算

```text
单任务总成本
= 模型调用
+ Embedding / Rerank / 检索
+ 外部工具与 API
+ 计算、存储和网络
+ 人工审批与接管
+ 失败后的重试与补偿
```

核心指标：

```text
cost_per_success
= 所有任务总成本 / 成功且合规的任务数
```

如果更便宜的模型让失败率大幅上升，单次请求成本下降但每个成功任务成本可能更高。

### Python 参考

```python
from dataclasses import dataclass


@dataclass(frozen=True)
class RunCost:
    model_usd: float
    retrieval_usd: float
    tool_usd: float
    infrastructure_usd: float
    human_minutes: float
    succeeded: bool


def total_cost(run: RunCost, human_usd_per_hour: float) -> float:
    human = run.human_minutes / 60 * human_usd_per_hour
    return (
        run.model_usd
        + run.retrieval_usd
        + run.tool_usd
        + run.infrastructure_usd
        + human
    )


def cost_per_success(runs: list[RunCost], human_usd_per_hour: float) -> float:
    successes = sum(run.succeeded for run in runs)
    if successes == 0:
        return float("inf")
    return sum(total_cost(run, human_usd_per_hour) for run in runs) / successes
```

## 预算控制的三个层次

### 请求前

- 根据任务风险和复杂度分配预算；
- 简单分类和提取路由到小模型或固定工作流；
- 限制可用工具和最大并发；
- 估算大文件与长上下文费用，必要时先征求确认。

### 执行中

- 每步前检查剩余时间、Token、费用和风险动作；
- 重复或无新增证据时停止；
- 大结果先过滤、聚合和缓存；
- 子 Agent 并行数和总预算由父任务统一控制；
- 接近预算时压缩、降级、返回部分结果或转人工。

### 执行后

- 按任务、用户、租户、模型和版本归因；
- 找出失败浪费、重复调用和长尾工具；
- 对照质量评估做成本—收益分析；
- 把异常预算样本加入回归集。

## 常用优化顺序

1. **消除不必要的 Agent**：固定流程能完成就不用循环；
2. **减少无效步骤**：改工具语义、终止条件和上下文；
3. **缩小上下文**：渐进式披露、去重和缓存；
4. **模型路由**：简单任务小模型，困难节点升级；
5. **合并与并行**：独立查询并行，相关小调用批量；
6. **缓存**：Prompt 前缀、检索、工具只读结果；
7. **输出上限**：结构化简洁结果；
8. **基础设施优化**：在算法和流程正确后再做。

任何优化都要通过评估集验证，不能只看账单。

## SLO 与告警

一个 SLO 例子：

```text
过去 28 天：
  高风险任务成功且合规率 ≥ 99.5%
  P95 执行时间 ≤ 45 秒（不含人工等待）
  关键安全失败 = 0
  成本 / 成功任务 ≤ 预算
```

告警优先基于用户影响：

- 关键失败或越权立即告警；
- 成功率下降、P95 上升和成本/成功任务异常；
- 某模型、工具或版本切片异常；
- 停滞、重复副作用、恢复失败；
- Trace 缺失或审计写入失败。

对 Token 总量的绝对值告警往往噪声很大，应结合任务量和成功率。

## 调试顺序

“Agent 变慢”时：

```text
看根 Trace
  → 是步骤变多还是单 Span 变慢
  → 模型、检索、工具、审批分别占多少
  → 是否重试、重复读取或上下文膨胀
  → 对比最近 Agent/Prompt/工具/策略版本
  → 用相同初始状态回放或进入评估集
```

“Agent 变贵”时先区分流量增长、任务分布变化、模型价格/路由、Token 膨胀和失败浪费。

## 常见失败设计

### 只记录最终答案和总耗时

无法定位是哪一轮模型或工具造成问题。需要 Span 树。

### 全量保存 Prompt

排障方便但泄漏面巨大。默认元数据，内容按需、脱敏和限时。

### Metric Label 使用用户 ID 或完整 Prompt

造成高基数、成本爆炸和隐私风险。使用聚合维度，具体请求放 Trace。

### 只优化每次模型调用成本

忽略失败、重试和人工处理。看成本/成功任务。

### Trace 与版本无关

无法归因。Agent、模型、Prompt、工具、策略和知识库都要版本化。

## 最佳实践清单

### 必须

- 一次任务一个根 Trace，跨模型、工具、MCP/A2A 传播上下文；
- Trace、Metric、Log、Audit 职责分离并可关联；
- 记录 Token、时延、错误、策略和版本；
- 内容默认不采集，敏感数据有脱敏、访问和保留策略；
- 预算在执行前和每步前硬检查；
- 成本按成功任务核算；
- SLO 同时包含成功、关键安全、延迟和成本。

### 推荐

- 采用 OpenTelemetry 语义约定；
- 对恢复、审批和副作用核验建立专用 Span；
- Trace 采样按错误和风险自适应；
- 成本与评估结果在同一版本看板联动；
- 定期从长尾 Trace 中提炼回归样本。

## 高频追问

### Q1：Trace 是否应该记录模型思维过程？

通常不需要，也不应依赖隐藏推理。记录输入输出摘要、结构化动作、工具证据、策略决策和状态变化，已足够解释系统行为。

### Q2：为什么 P95 比平均延迟重要？

Agent 的重试、长工具和多步循环容易形成长尾，平均值会掩盖最差用户体验和超时风险。

### Q3：如何降低观测本身的成本？

Metric 聚合、Trace 采样、正文默认关闭、错误和高风险请求提高采样率；大工具结果只存哈希与对象引用。

### Q4：成本超过预算应该直接失败吗？

取决于任务契约。可以降级模型、减少并行、返回有证据的部分结果或询问用户是否追加预算；高风险动作不能因预算不足跳过校验。

## 自测

1. 一次 Agent 请求应怎样组织 Span 树？
2. 为什么 Prompt 正文默认不采集？
3. 单请求成本和成本/成功任务哪个更能反映经济性？
4. 如何区分模型变慢和步骤变多？
5. 哪些字段不适合放进 Metric Label？

## 与高频题联动

- [AQ10：可上线 Agent 的生产架构](../agent-development.md#aq10-设计一个可上线的企业-agent-如何控制成本、延迟、可观测性和降级)

## 权威资料

- [OpenTelemetry：Inside the LLM Call: GenAI Observability（2026-05-14）](https://opentelemetry.io/blog/2026/genai-observability/)
- [OpenTelemetry：GenAI Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/)
- [OpenTelemetry：Semantic Conventions 1.43.0](https://opentelemetry.io/docs/specs/semconv/)
- [OpenTelemetry GenAI Semantic Conventions GitHub](https://github.com/open-telemetry/semantic-conventions-genai)

---

[上一章：安全与治理](./security-governance.md) · [返回专题导读](./README.md) · **下一章：** [MCP、A2A 与多 Agent](./protocols-multi-agent.md)
