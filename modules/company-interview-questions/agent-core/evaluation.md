---
title: Agent 评估体系
description: 从任务集、试验、轨迹、结果和评分器出发，建立可回归、可发布、可在线闭环的 Agent 评估体系。
---

# 04 · Agent 评估体系

普通问答可以比较一段输出；Agent 会多轮决策、调用工具并改变环境，同一个任务还可能存在多条正确轨迹。因此 Agent 评估必须同时回答：

1. 最终任务是否完成？
2. 完成过程是否安全、合规、有效率？
3. 改动是否在真实任务分布上稳定变好？

## 90 秒面试回答

我会先定义任务契约，再构建版本化评估集。每个样本包含初始环境、用户目标、成功条件、允许与禁止动作、关键检查点和成本预算；一次样本要运行多次 trial，因为模型存在随机性。

评分采用结果优先、轨迹补充：业务状态、代码测试、数据库断言等尽量用确定性 grader；文本质量使用规则、人工标注和经校准的 LLM-as-judge 组合；安全越权、数据泄漏等作为硬门禁，不能被平均分抵消。评估同时记录成功率、关键错误率、工具轨迹、延迟、Token 和费用，并按任务类型切片。发布时先做离线回归，再影子流量和灰度；线上失败经过脱敏、去重和人工确认后进入回归集，形成持续闭环。

## 先统一五个术语

Anthropic 的 Agent eval 方法把核心对象分为：

| 术语 | 含义 |
|---|---|
| Task | 一个带初始条件和成功标准的任务 |
| Trial | 某个版本对 Task 的一次独立执行 |
| Transcript / Trajectory | 模型、工具、策略和环境交互轨迹 |
| Outcome | 执行结束后的真实环境与产物 |
| Grader | 对 Outcome 或 Trajectory 进行评分的程序或评审 |

另有一个重要组件是 **Eval Harness**：负责重置环境、运行 Trial、收集轨迹、调用评分器、聚合和比较版本。

## 评估集的数据契约

```python
from dataclasses import dataclass, field
from typing import Any, Callable


@dataclass(frozen=True)
class EvalTask:
    task_id: str
    category: str
    initial_state: dict[str, Any]
    user_request: str
    success_assertions: tuple[Callable[[dict[str, Any]], bool], ...]
    forbidden_events: tuple[str, ...]
    max_steps: int
    max_cost_usd: float
    tags: frozenset[str] = field(default_factory=frozenset)


@dataclass(frozen=True)
class TrialResult:
    task_id: str
    run_id: str
    agent_version: str
    outcome: dict[str, Any]
    trajectory: tuple[dict[str, Any], ...]
    latency_ms: int
    tokens: int
    cost_usd: float
```

评估任务必须能重置初始环境。若每次测试都在共享数据上继续修改，版本对比就不可信。

## 三层评估

### 1. 最终结果评估

优先验证真实业务结果：

- 是否生成正确文件且测试通过；
- 工单是否被正确分类并更新；
- 数据库记录是否满足约束；
- 调研报告是否引用可核验证据；
- 用户目标是否完成。

结果评估通常比“是否走了参考轨迹”更重要，因为 Agent 可能找到另一条同样正确的路径。

### 2. 轨迹与过程评估

结果正确不代表过程可接受。还要检查：

- 是否访问不必要的敏感数据；
- 是否调用禁止工具；
- 是否越过审批；
- 是否重复写入或无效循环；
- 是否基于证据做决策；
- 是否超过步骤、时间和费用预算。

轨迹评估不要要求每一步与黄金轨迹完全相同，只约束关键不变量。

### 3. 组件评估

定位问题时分别测试：

- 意图和路由；
- 工具选择与参数；
- 检索、重排和上下文；
- 记忆写入与召回；
- 计划、反思或终止判断；
- 安全策略与审批；
- 最终回答或产物。

端到端结果告诉你“有没有变差”，组件评估帮助判断“哪里变差”。

## Grader 选择顺序

优先使用可重复、可解释的评分方式：

```text
业务断言 / 单元测试
  → Schema 与规则
  → 确定性模拟器
  → 参考数据比较
  → 人工评分
  → 经校准的 LLM-as-judge
```

### 确定性 Grader

```python
from dataclasses import dataclass


@dataclass(frozen=True)
class Grade:
    passed: bool
    score: float
    reason: str
    critical: bool = False


def grade_refund_trial(result: TrialResult) -> list[Grade]:
    events = list(result.trajectory)
    refund_events = [e for e in events if e.get("type") == "refund_submitted"]
    unauthorized = [e for e in events if e.get("type") == "policy_denied_but_executed"]

    return [
        Grade(
            passed=result.outcome.get("refund_status") == "submitted",
            score=1.0 if result.outcome.get("refund_status") == "submitted" else 0.0,
            reason="退款应成功提交",
        ),
        Grade(
            passed=len(refund_events) == 1,
            score=1.0 if len(refund_events) == 1 else 0.0,
            reason="退款副作用必须恰好记录一次",
            critical=True,
        ),
        Grade(
            passed=not unauthorized,
            score=1.0 if not unauthorized else 0.0,
            reason="禁止绕过策略执行",
            critical=True,
        ),
    ]
```

关键安全失败设置 `critical=True`，它会直接使 Trial 失败，不能被表达质量的高分平均掉。

## LLM-as-judge 如何可靠使用

适合：

- 回答是否完整、清晰、有证据；
- 多种自然语言答案的语义质量；
- 工具轨迹是否存在明显无效绕行。

不适合单独决定：

- 是否真实完成转账；
- 是否泄漏机密；
- 是否越权；
- 精确数值、协议和合规判断。

使用时：

1. 写清评分维度和锚点示例；
2. 隐藏候选版本名称，避免顺序与品牌偏差；
3. 对高风险样本使用双评审或人工复核；
4. 用人工标注集测一致率、假阳性和假阴性；
5. 固定 Judge 模型和 Prompt 版本；
6. 评分理由用于诊断，不能当作新的事实来源。

## 为什么同一任务要跑多次

Agent 的模型选择、工具结果和外部环境都可能波动。只跑一次容易把运气当改进。

对于每个版本，建议报告：

- `pass@1`：随机一次的通过概率；
- 多次 Trial 平均成功率和置信区间；
- 关键失败出现率；
- 平均与 P95 步数、延迟、Token 和成本；
- 对初始随机种子、工具延迟和数据变化的敏感性。

高风险低频事件需要更多 Trial 或定向攻击集，不能只看总体平均。

## 评估集如何构建

### 四类样本

| 类型 | 来源 | 作用 |
|---|---|---|
| 核心任务 | 真实业务高频流程 | 衡量主要价值 |
| 边界任务 | 缺参数、冲突、超大输入 | 验证稳健性 |
| 故障任务 | 超时、429、部分提交 | 验证恢复 |
| 对抗任务 | 注入、越权、数据外泄诱导 | 安全门禁 |

### 数据分层

- **开发集**：快速调试，可频繁查看；
- **回归集**：发布前固定执行，防止旧能力退化；
- **隐藏集**：减少针对测试过拟合；
- **线上观察集**：真实流量采样，不直接用于开发调参。

线上样本进入评估集前要脱敏、去重、确认标签，并保留来源和授权。

## 指标树

```text
北极星：成功且合规的任务 / 全部任务
├─ 质量
│  ├─ 任务成功率
│  ├─ 关键断言通过率
│  └─ 用户纠正 / 人工接管率
├─ 安全
│  ├─ 越权与泄漏率
│  ├─ 注入攻击成功率
│  └─ 高风险动作误批准率
├─ 效率
│  ├─ 步数与工具调用
│  ├─ P50 / P95 延迟
│  └─ Token / 成功任务
└─ 经济性
   ├─ 成本 / 成功任务
   ├─ 失败浪费成本
   └─ 人工处理成本
```

不要只优化“回答得分”。Agent 的目标是成功、合规地完成任务。

## 切片比总分更重要

总分可能掩盖关键退化。至少按以下维度切片：

- 任务类别和复杂度；
- 工具数量和风险等级；
- 语言、地区和用户群；
- 输入长度和上下文来源；
- 新用户与有长期记忆用户；
- 正常、故障和对抗场景；
- 模型、Prompt、工具、策略版本。

例如总体成功率提升 2%，但“高金额退款”越权率从 0 变成 0.5%，版本仍不应发布。

## 发布门禁

一个实际门禁例子：

```python
@dataclass(frozen=True)
class ReleaseMetrics:
    success_rate: float
    critical_failure_rate: float
    p95_latency_ms: int
    cost_per_success_usd: float


def can_release(candidate: ReleaseMetrics, baseline: ReleaseMetrics) -> bool:
    return all([
        candidate.success_rate >= baseline.success_rate - 0.005,
        candidate.critical_failure_rate == 0.0,
        candidate.p95_latency_ms <= baseline.p95_latency_ms * 1.10,
        candidate.cost_per_success_usd <= baseline.cost_per_success_usd * 1.05,
    ])
```

真实阈值应结合业务风险和统计置信度。安全硬门禁通常要求零容忍或极低上限。

发布流程：

```text
组件测试
  → 离线端到端回归
  → 安全攻击集
  → 影子流量
  → 小流量灰度
  → 指标与人工审查
  → 扩大或自动回滚
```

## 线上闭环

线上不要直接用点赞率代替正确率。应收集：

- 用户显式反馈与纠正；
- 任务是否真实完成；
- 重试、撤销、人工接管；
- 策略拒绝与审批；
- 工具失败和停滞；
- 延迟、Token、费用和缓存命中；
- 安全检测与事故。

发现失败后：

```text
脱敏采样 → 复现 → 根因分类 → 新增最小回归样本
  → 修工具/策略/上下文/模型 → 全量回归 → 灰度
```

不是所有失败都通过改 Prompt 解决。

## 常见失败设计

### 只看最终文本

无法发现 Agent 曾读取无关机密或绕过审批。必须同时看 Outcome 和 Trajectory。

### 参考轨迹唯一化

会惩罚有效的新路径，导致系统针对测试过拟合。只约束必要步骤与禁止行为。

### Judge 给高分就发布

Judge 可能偏向更长、更自信或与参考措辞相似的答案。关键事实与安全用确定性检查。

### 平均分掩盖致命问题

一个数据泄漏不能用九个漂亮答案抵消。关键失败单独硬门禁。

### 测试环境永远成功

没有超时、限流和部分提交，测不出真实恢复能力。必须故障注入。

### 线上指标没有版本关联

无法判断哪次模型、Prompt、工具或策略变更引入退化。全链路版本化。

## 最佳实践清单

### 必须

- 任务包含可执行成功断言、禁止动作和预算；
- Outcome、Trajectory 和组件三层评估；
- 关键业务和安全优先确定性 Grader；
- 非确定性任务进行多次 Trial；
- 安全失败设硬门禁；
- 指标按任务和风险切片；
- 每次结果绑定完整版本；
- 线上失败进入可复现回归集。

### 推荐

- 建立开发、回归、隐藏和线上观察集；
- 对 Judge 做人工校准和漂移监控；
- 发布采用影子与灰度；
- 同时报告成功率、置信区间、P95 和成本/成功任务；
- 定期审计评估集是否代表当前真实流量。

## 高频追问

### Q1：没有标准答案的研究 Agent 怎么评？

评结果中的证据覆盖、来源质量、事实可核验性和是否回答目标；过程检查搜索多样性、引用与结论对应、禁止来源和预算。再用专家抽样校准 Judge。

### Q2：为什么不能只比较最终答案？

Agent 会改变环境。两个相同答案背后，一个可能越权读取数据或重复执行写操作；必须检查轨迹和真实状态。

### Q3：LLM-as-judge 能替代人工吗？

不能完全替代。它适合规模化软质量评分，但必须用人工样本校准；高风险、争议和分布外样本需要人工复核。

### Q4：评估变好但线上变差怎么办？

说明评估集与真实分布、环境或指标不一致。检查切片覆盖、工具模拟差异、线上版本关联和选择偏差，把失败样本纳入回归。

## 自测

1. 一个结果正确但访问了无关客户数据的 Trial 是否通过？
2. 为什么每个 Task 要运行多次？
3. 哪些指标必须成为硬门禁？
4. 如何避免团队针对公开评估集过拟合？
5. 一次线上事故如何转化成稳定的回归样本？

## 与高频题联动

- [AQ07：如何建立 Agent 评估体系](../agent-development.md#aq07-多步-agent-应该怎样评估)

## 权威资料

- [Anthropic：Demystifying evals for AI agents（2026-01-09）](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [LangSmith：Evaluate a graph](https://docs.langchain.com/langsmith/evaluate-graph)
- [KDD 2025：Agent Evaluation: A Systematic Approach](https://doi.org/10.1145/3711896.3736570)
- [OpenAI Evals design guide](https://platform.openai.com/docs/guides/evals)

---

[上一章：上下文工程与记忆](./context-memory.md) · [返回专题导读](./README.md) · **下一章：** [安全与治理](./security-governance.md)
