---
pageClass: ai-specialty-home
title: NLP · LLM · Agent 算法岗
description: 从 Transformer、后训练和 RAG，到 Agent Runtime、评估、安全与推理系统的算法岗系统专题。
---

<div class="ai-specialty-hero">
  <div class="ai-specialty-hero__copy">
    <span class="ai-specialty-kicker">NLP / LARGE LANGUAGE MODEL / AGENT ENGINEERING</span>
    <h1>从模型原理<br>走到<em>可靠系统</em></h1>
    <p>面向 NLP、LLM 与 Agent 算法岗：既能推导 Attention 和 DPO，也能定位 RAG、工具调用、长任务与线上推理的真实失败。</p>
    <div class="ai-specialty-actions">
      <a href="./nlp-transformer">从 Transformer 开始 →</a>
      <a class="is-ghost" href="#专题地图">查看专题地图</a>
    </div>
  </div>
  <div class="ai-specialty-hero__signal" aria-label="专题能力链">
    <span><small>FOUNDATION</small><strong>NLP</strong></span>
    <span><small>MODEL</small><strong>LLM</strong></span>
    <span><small>SYSTEM</small><strong>AGENT</strong></span>
    <span><small>PROOF</small><strong>EVAL</strong></span>
  </div>
</div>

<div class="ai-specialty-principle">
  <strong>专题主线</strong>
  <span>原理可推导</span><i>→</i>
  <span>系统可实现</span><i>→</i>
  <span>改进可评估</span><i>→</i>
  <span>风险可控制</span>
</div>

# NLP · LLM · Agent 算法岗

这一专题不以某个框架的 API 为目录，而是沿着一套稳定的能力链展开：

```text
文本怎样变成 Token
  → Transformer 怎样建模
  → 模型怎样预训练、后训练与对齐
  → 外部知识怎样被检索和引用
  → Agent 怎样循环决策并影响真实系统
  → 整条链路怎样评估、观测、保护和加速
```

读完后，不应只会回答“什么是 RAG”或“什么是 Agent”，还应能处理更有区分度的问题：

- 为什么模型离线指标提高，生产任务成功率反而下降？
- 如何判断错误来自检索、上下文、模型、工具还是执行环境？
- 怎样让两小时的 Agent 任务在进程重启后安全恢复？
- 为什么权限、预算和终止条件不能只写在 Prompt 中？
- 如何用评测证明一次模型、数据或系统修改真的变好了？

## 专题地图

### 模型与数据

| 章节 | 需要建立的核心能力 | 代表性面试问题 |
|---|---|---|
| [NLP 与 Transformer](./nlp-transformer.md) | Tokenization、Attention、位置编码、归一化与复杂度 | 为什么 Attention 要除以 `sqrt(d_k)`？ |
| [预训练与数据治理](./pretraining-data.md) | 训练目标、数据配比、去重、污染、并行与实验归因 | 数据量增加为什么不一定继续提升？ |
| [后训练与参数高效微调](./posttraining-peft.md) | SFT、Reward Model、RLHF、DPO、LoRA、QLoRA | DPO 为什么仍需要参考模型？ |

### 知识与推理

| 章节 | 需要建立的核心能力 | 代表性面试问题 |
|---|---|---|
| [RAG 与搜索系统](./rag-search.md) | 解析、切块、混合召回、重排、上下文构造与归因评估 | 知识库有答案，模型为什么仍答错？ |
| [LLM 推理与性能](./inference-systems.md) | Prefill/Decode、KV Cache、Batching、量化与性能指标 | 为什么 KV Cache 省计算却吃显存？ |

### Agent 核心工程

| 章节 | 真正解决的问题 | 深入学习 |
|---|---|---|
| Runtime / Harness | 循环决策、显式状态、暂停恢复、幂等和预算 | [进入章节](../company-interview-questions/agent-core/runtime-harness.md) |
| 工具与结构化输出 | Schema、权限、审批、沙箱和副作用 | [进入章节](../company-interview-questions/agent-core/tool-engineering.md) |
| 上下文与记忆 | 每一步该让模型看到什么，哪些内容值得长期保存 | [进入章节](../company-interview-questions/agent-core/context-memory.md) |
| Agent 评估 | 如何同时评最终结果、执行轨迹、组件和安全 | [进入章节](../company-interview-questions/agent-core/evaluation.md) |
| 安全与治理 | Prompt Injection、越权、泄漏、SSRF 和供应链 | [进入章节](../company-interview-questions/agent-core/security-governance.md) |
| 观测与成本 | 出错、变慢、变贵时如何定位并归因 | [进入章节](../company-interview-questions/agent-core/observability-cost.md) |
| MCP、A2A 与多 Agent | 工具连接、远程协作、身份和任务协议 | [进入章节](../company-interview-questions/agent-core/protocols-multi-agent.md) |

## 三条岗位路线

### NLP / LLM 算法

建议顺序：

`NLP 与 Transformer → 预训练与数据 → 后训练 → RAG → 推理系统`

重点准备公式、训练目标、数据实验和模型行为分析。不能只记论文结论，要能解释：

1. 设计解决了哪个瓶颈；
2. 优化目标改变了什么分布；
3. 实验如何排除数据、模型和评测噪声；
4. 方案在哪些情况下会失败。

### RAG / LLM 应用算法

建议顺序：

`Transformer → RAG → 评估 → 上下文 → 工具 → 观测与成本`

重点训练故障归因。不要把所有错误都归因于“模型幻觉”，而要按解析、索引、召回、重排、上下文、生成和引用逐层定位。

### Agent 算法与工程

建议顺序：

`后训练基础 → RAG → Runtime → 工具 → 上下文 → 评估 → 安全 → 观测 → 协议`

Agent 面试的区分度通常来自工程边界：状态是否可恢复、工具是否幂等、权限是否独立于模型、评估是否覆盖多条合法轨迹、成本是否按成功任务核算。

## 每章怎样学习

重点章节统一采用下面的阅读结构：

1. **90 秒面试回答**：先形成可以直接表达的答案主干；
2. **原理与公式**：知道结论从哪里来，而不是背名词；
3. **工程实现**：用 Python、数据流或系统设计把概念落地；
4. **失败案例**：学习怎样定位，而不只是描述理想流程；
5. **常见误区**：主动排除听起来正确但不严谨的说法；
6. **递进追问**：从概念题进入实验题和系统题；
7. **自测**：离开页面后检查能否独立推导和表达。

建议使用三遍法：

```text
第一遍：画出公式、状态和数据流
第二遍：关掉页面做 90 秒口述
第三遍：回答失败案例和递进追问
```

## 面试回答框架

面对模型或系统题，可以使用同一套结构：

```text
一句话结论
  → 机制或目标函数
  → 一个具体例子
  → 关键取舍
  → 失败方式
  → 如何验证
```

例如回答“怎样优化 RAG”时，不能只罗列 Query Rewrite、Reranker 和更大的模型。更完整的表达是：

1. 先用标注集和 Trace 确认瓶颈位于召回还是生成；
2. 召回缺失时调整解析、切块、索引和查询；
3. 候选已命中但排序靠后时优化融合与重排；
4. 证据正确但回答不忠实时约束生成与引用；
5. 分别观察 Recall@K、NDCG、Faithfulness、延迟和单成功任务成本。

## 生产心智模型

```text
                    ┌──────── 评估集 / 发布门禁 ────────┐
                    │                                  │
数据 → 训练/微调 → 模型 → 检索与上下文 → Agent Runtime → 工具与外部系统
 │        │          │          │             │              │
版本     实验归因    推理性能    证据质量       状态恢复        权限与审计
                    │                                  │
                    └──── Trace / Metric / 安全 / 成本 ─┘
```

模型能力只是链路中的一环。任何一次改动都应绑定数据版本、模型版本、Prompt/策略版本、工具版本和评测结果，否则很难证明提升来自哪里。

## 通关标准

- 能手写并解释 Scaled Dot-Product Attention 的关键步骤；
- 能画出预训练、SFT、偏好数据、Reward Model 与策略优化的关系；
- 能解释 LoRA、QLoRA 的参数和显存收益来自哪里；
- 能对 RAG 错误做分层归因，而不是统一称为幻觉；
- 能设计可暂停、恢复、限预算的 Agent Runtime；
- 能区分执行状态、推理上下文、长期记忆和外部知识；
- 能设计同时覆盖结果、轨迹、组件、安全和成本的评估；
- 能解释 KV Cache、Continuous Batching、FlashAttention 与 PagedAttention；
- 能说明 MCP、A2A、函数调用和普通 API 的边界；
- 能为高风险工具设计最小权限、审批、幂等和审计。

## 资料口径

专题内容在 **2026-07-31** 依据以下优先级核验：

1. 原始论文与正式技术报告；
2. MCP、A2A、OAuth、OpenTelemetry 等规范；
3. 模型与 Agent 团队的官方工程文章；
4. 官方岗位要求用于判断能力方向，不作为技术结论；
5. 公开面经只用于发现问题，不用于证明答案正确或推算精确频率。

核心入口：

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [InstructGPT：Training language models to follow instructions](https://arxiv.org/abs/2203.02155)
- [Direct Preference Optimization](https://arxiv.org/abs/2305.18290)
- [Retrieval-Augmented Generation](https://arxiv.org/abs/2005.11401)
- [LoRA](https://arxiv.org/abs/2106.09685) 与 [QLoRA](https://arxiv.org/abs/2305.14314)
- [Anthropic：Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Anthropic：Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [MCP 稳定规范](https://modelcontextprotocol.io/specification/2025-11-25)
- [A2A 规范](https://a2a-protocol.org/latest/specification/)

---

**开始学习：** [NLP 与 Transformer：从 Token 到一次完整前向计算](./nlp-transformer.md)
