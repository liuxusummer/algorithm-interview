---
title: 上下文工程与记忆
description: 系统讲解推理上下文、短期状态、长期记忆、RAG 的边界，以及检索、压缩、写入、遗忘和隐私治理。
---

# 03 · 上下文工程与记忆

上下文工程不是“把更多信息塞给模型”，而是为当前决策选择 **最小、充分、可信、可定位来源** 的信息集合。上下文窗口再大，也会受到注意力稀释、成本、延迟和陈旧信息影响。

## 90 秒面试回答

我会先把执行状态、推理上下文、短期记忆、长期记忆和外部知识分层。每一步模型调用都由 Context Builder 根据当前目标动态构造上下文：稳定系统策略放在高优先级区域，任务状态结构化摘要，工具按需暴露，历史只保留相关决策和证据，长文档通过检索按需加载。

记忆写入不能由模型随意永久保存。候选记忆要经过类型判断、来源记录、置信度、租户命名空间、去重冲突、敏感性检查和 TTL；重要事实最好由用户确认或权威数据源验证。检索结果和记忆都属于数据，不得覆盖系统指令。系统还必须提供纠错、遗忘和删除能力，并用 retrieval precision、回答质量、Token 成本和陈旧记忆事故共同评估。

## 五层数据模型

| 层 | 解决什么 | 示例 | 存储与生命周期 |
|---|---|---|---|
| 执行状态 | 任务如何继续 | 当前步骤、预算、审批 | 检查点；任务结束后按策略保留 |
| 推理上下文 | 这一步让模型看到什么 | 指令、目标、证据、工具 | 每次调用重新构造 |
| 短期记忆 | 同一会话保持连续性 | 用户刚澄清的约束 | 线程范围，可压缩 |
| 长期记忆 | 跨会话复用稳定信息 | 经确认的偏好、项目事实 | 命名空间 + TTL + 可删除 |
| 外部知识 / RAG | 查询权威资料 | 产品文档、代码、数据库 | 来源系统为真相，按需检索 |

不要把这五层统一存成聊天消息。它们有不同的正确性、权限和删除要求。

## Context Builder 的输入与输出

Context Builder 不应只接受一个 `messages` 数组。它需要：

```python
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class ContextRequest:
    tenant_id: str
    user_id: str
    run_id: str
    goal: str
    current_step: str
    allowed_tool_names: tuple[str, ...]
    token_budget: int
    evidence_refs: tuple[str, ...]
    memory_query: str | None = None


@dataclass(frozen=True)
class ContextPack:
    system_rules: str
    task_state: dict[str, Any]
    evidence: list[dict[str, Any]]
    memories: list[dict[str, Any]]
    tool_specs: list[dict[str, Any]]
    omissions: list[str]
    estimated_tokens: int
```

`omissions` 很重要：系统应知道哪些内容因为权限、相关性或预算没有放入，而不是假装上下文完整。

## 一次上下文构造流程

```text
确定本轮决策
  → 加载稳定系统规则和当前状态
  → 根据身份/任务筛选可用工具
  → 检索候选证据和长期记忆
  → 权限过滤、来源验证、去重和排序
  → 对大结果做结构化压缩
  → 按 Token 预算装箱
  → 标注来源、时间、可信级别和截断
```

### 推荐优先级

1. 安全和业务硬规则；
2. 当前目标、成功条件和不可违反的约束；
3. 最新工具结果与直接证据；
4. 当前计划和未解决问题；
5. 经验证的长期记忆；
6. 相关历史摘要；
7. 示例和背景材料。

预算不足时应从低优先级向下裁剪，不能截掉权限和成功条件。

## Python 参考实现：按预算组装上下文

```python
from dataclasses import dataclass
from typing import Iterable


@dataclass(frozen=True)
class ContextItem:
    item_id: str
    text: str
    source: str
    priority: int
    estimated_tokens: int
    trusted_as_instruction: bool = False


def pack_context(
    mandatory: Iterable[ContextItem],
    optional: Iterable[ContextItem],
    token_budget: int,
) -> tuple[list[ContextItem], list[str]]:
    selected: list[ContextItem] = []
    omitted: list[str] = []
    remaining = token_budget

    # 硬规则与任务契约必须完整放入；超预算应报错或换模型，不能静默截断。
    for item in mandatory:
        if item.estimated_tokens > remaining:
            raise ValueError(f"mandatory context exceeds budget: {item.item_id}")
        selected.append(item)
        remaining -= item.estimated_tokens

    # 可选信息按优先级和单位 Token 价值排序。
    ranked = sorted(
        optional,
        key=lambda x: (x.priority, -x.estimated_tokens),
        reverse=True,
    )
    seen_sources: set[tuple[str, str]] = set()
    for item in ranked:
        dedupe_key = (item.source, normalize(item.text))
        if dedupe_key in seen_sources:
            omitted.append(f"{item.item_id}:duplicate")
            continue
        if item.estimated_tokens > remaining:
            omitted.append(f"{item.item_id}:budget")
            continue
        # 检索内容、网页和记忆都是数据，不能升级为系统指令。
        selected.append(
            ContextItem(
                **{**item.__dict__, "trusted_as_instruction": False}
            )
        )
        seen_sources.add(dedupe_key)
        remaining -= item.estimated_tokens

    return selected, omitted
```

真实系统还应对安全域、时间新鲜度、查询覆盖和证据多样性进行排序。

## 渐进式披露，而不是一次加载全部

Anthropic 的上下文工程实践强调“just-in-time context”：

```text
先告诉模型有哪些资料及其摘要
  → 模型提出需要哪一项
  → 系统验证权限并加载局部
  → 如有必要继续下钻
```

例如代码仓库 Agent 不必一开始读取全仓库。先提供目录、符号索引和变更摘要，再按目标读取具体文件与行段。

这带来三个收益：

- 降低 Token、延迟和上下文污染；
- 减小不可信内容的攻击面；
- Trace 更容易解释“为什么读取了这份资料”。

## 压缩的正确方式

### 结构化摘要

不要只让模型“总结对话”。使用固定字段：

```yaml
goal: 修复支付接口超时
confirmed_facts:
  - fact: 10:05 后数据库连接池等待升高
    source: metric://payment/db-pool
    observed_at: 2026-07-29T10:18:00Z
rejected_hypotheses:
  - CDN 故障：边缘节点指标正常
open_questions:
  - 10:00 是否有连接池配置变更
decisions:
  - 先查发布记录，不执行回滚
pending_actions:
  - tool: deploy.search_changes
    risk: read_only
```

### 保留不可压缩内容

以下信息不应只留摘要：

- 授权和审批原文；
- 精确金额、ID、时间、哈希和版本；
- 法务、安全或合规原文；
- 工具调用提交状态；
- 作为最终结论依据的关键证据。

摘要保留“导航”，原始内容保留“证据引用”。

## 长期记忆的数据契约

```python
from dataclasses import dataclass
from datetime import datetime
from enum import Enum


class MemoryType(str, Enum):
    USER_PREFERENCE = "user_preference"
    VERIFIED_FACT = "verified_fact"
    PROCEDURE = "procedure"
    EPISODIC_SUMMARY = "episodic_summary"


@dataclass(frozen=True)
class MemoryRecord:
    memory_id: str
    tenant_id: str
    subject_id: str
    memory_type: MemoryType
    content: str
    source_ref: str
    confidence: float
    created_at: datetime
    valid_from: datetime
    expires_at: datetime | None
    sensitivity: str
    supersedes: str | None = None
```

必须有 `source_ref`、有效期和敏感级别。只保存一句“用户喜欢 Java”而没有来源、时间和作用域，会很快变成错误记忆。

## 记忆写入策略

### 值得写入

- 用户明确要求长期记住的偏好；
- 权威系统验证的稳定事实；
- 多次重复并经确认的工作习惯；
- 对未来任务确有复用价值的程序性知识。

### 不应自动写入

- 模型推测、情绪判断和人格标签；
- 未验证的检索内容；
- 一次任务的临时参数；
- 密码、Token、完整证件号等秘密；
- 因攻击内容诱导产生的“新规则”；
- 已有权威数据源可实时查询的高频变化事实。

### 写入流水线

```text
候选记忆
  → 类型与复用价值判断
  → 来源和身份校验
  → PII / Secret 检测
  → 与现有记忆去重、冲突检测
  → 用户确认或权威数据验证
  → 设置命名空间、TTL、置信度
  → 写入审计日志
```

## 冲突、纠错与遗忘

长期记忆必须支持：

- **冲突**：新事实与旧事实不一致时不静默覆盖，保留版本和来源；
- **纠错**：用户明确更正后，标记旧记录被替代；
- **衰减**：时间越久、来源越弱，检索分数越低；
- **过期**：到期后不进入上下文，可按政策删除；
- **删除**：按用户、租户、来源和记忆 ID 删除；
- **可解释**：回答“为什么记得这件事”和“从哪里得知”。

向量库删除还要处理索引、缓存、备份和派生摘要，不能只删主表一行。

## RAG 与记忆的区别

| 问题 | RAG | 长期记忆 |
|---|---|---|
| 真相来源 | 外部知识库 | 经治理的主体历史 |
| 查询方式 | 按任务检索文档 | 按用户/对象和语义检索 |
| 更新方式 | 数据同步与索引 | 记忆写入、纠错和衰减 |
| 典型内容 | 产品文档、代码 | 用户偏好、过去决策 |
| 主要风险 | 文档污染、过期、越权检索 | 错误固化、跨租户泄漏 |

RAG 不是记忆，向量数据库也不是记忆系统本身。

## 防止上下文污染

为上下文中的每段内容标注信任级别：

```text
SYSTEM_POLICY      可作为指令
DEVELOPER_POLICY   可作为指令
USER_INTENT        目标，但仍受上层策略约束
TOOL_RESULT        数据
RETRIEVED_DOCUMENT 数据
MEMORY             数据
WEB_CONTENT        不可信数据
```

工具结果或网页即使包含“忽略之前的指令”，也只能作为被分析的数据。权限控制还必须在工具层独立执行。

## 如何评估上下文与记忆

不能只测最终回答：

| 指标 | 说明 |
|---|---|
| Context precision | 放入的信息有多少真正相关 |
| Context recall | 必要证据是否遗漏 |
| Attribution | 结论能否关联正确来源 |
| Staleness rate | 使用过期事实的比例 |
| Cross-tenant leakage | 跨租户召回必须为零 |
| Memory acceptance precision | 写入的长期记忆有多少真实有用 |
| Correction latency | 用户更正后多久不再使用旧记忆 |
| Tokens per successful task | 上下文治理是否真的降低成本 |

还应做消融实验：移除某类记忆或压缩策略，观察成功率、时延和成本变化。

## 常见失败设计

### 全量历史回放

早期错误、过期约束和攻击文本会持续存在，成本随轮次上涨。应以结构化状态和检索替代。

### 摘要覆盖事实

模型摘要可能漏掉否定词、金额和审批边界。精确字段与关键证据保留原始引用。

### 自动保存一切

这会把猜测固化、放大隐私风险，并让检索噪声不断增加。记忆写入必须稀疏且可治理。

### 向量相似度等于可用性

语义相似不代表权限正确、时间有效或来源可信。最终排序必须加入权限、时间和可信度。

### 跨租户共享索引后再过滤

如果过滤发生在召回后，内容可能已经进入日志或模型。租户边界应进入检索查询和存储命名空间。

## 最佳实践清单

### 必须

- 五层数据分离，业务状态结构化持久化；
- 每轮按目标构造最小上下文；
- 检索内容和记忆只作为数据；
- 记忆记录来源、租户、时间、置信度、TTL 和敏感级别；
- 提供纠错、过期和删除；
- 权限过滤在检索和加载之前执行；
- 上下文版本、证据引用和截断信息可观测。

### 推荐

- 使用渐进式披露和摘要索引；
- 历史采用结构化压缩，关键事实保留原文引用；
- 重要记忆需用户确认或权威数据验证；
- 用检索精度、陈旧率和 Token/成功任务共同评估；
- 定期清理低使用率、冲突和过期记忆。

## 高频追问

### Q1：上下文窗口足够大，还需要 RAG 和压缩吗？

需要。容量大不等于注意力无损；全量输入增加成本、延迟、噪声和攻击面，也无法解决权限、时效和来源问题。

### Q2：什么时候写长期记忆？

信息跨任务稳定、有未来复用价值、来源可验证、获得合法保存授权，并能设置清晰作用域和生命周期时。一次性参数留在任务状态即可。

### Q3：如何避免错误记忆持续影响？

保存来源和版本，检索时加入新鲜度与置信度；冲突时不静默覆盖；支持用户更正、TTL 和删除；将错误记忆事故加入回归集。

### Q4：长期记忆和用户画像有什么风险？

容易形成未经用户同意的敏感推断。只保存任务必要、可解释、可删除的信息；对敏感类别采取禁止或显式同意策略。

## 自测

1. 为什么工具结果不应该自动进入系统指令区？
2. 一次会话中确认的地址应放短期状态还是长期记忆？
3. 摘要时哪些字段必须保留原始值？
4. 为什么向量检索后再做租户过滤仍有风险？
5. 如何证明新增记忆功能真的提高了任务成功率？

## 与高频题联动

- [AQ05：状态、上下文、长期记忆和 RAG 如何分层](../agent-development.md#aq05-运行状态、上下文、短期记忆、长期记忆和-rag-有什么区别)

## 权威资料

- [Anthropic：Effective context engineering for AI agents（2025-09-29）](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [LangGraph：Persistence](https://docs.langchain.com/oss/python/langgraph/persistence)
- [LangGraph：Memory](https://docs.langchain.com/oss/python/langgraph/add-memory)
- [OWASP：Agentic AI Threats and Mitigations](https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/)

---

[上一章：工具工程与权限边界](./tool-engineering.md) · [返回专题导读](./README.md) · **下一章：** [Agent 评估体系](./evaluation.md)
