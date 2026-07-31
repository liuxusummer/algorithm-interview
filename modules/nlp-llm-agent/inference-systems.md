---
title: LLM 推理与性能优化
description: 从 Prefill、Decode 和 KV Cache，到 Continuous Batching、PagedAttention、FlashAttention、量化和模型路由。
---

# LLM 推理与性能：从一条请求到 GPU

LLM 推理优化不是单纯追求“每秒 Token 越多越好”。线上系统需要同时平衡：

- 首 Token 延迟；
- 后续 Token 速度；
- 并发吞吐；
- 显存；
- 输出质量；
- P95/P99 尾延迟；
- 单成功任务成本。

Agent 场景还会产生大量短模型调用、长上下文、工具等待和前缀复用，因此普通聊天服务的最优配置不一定适合 Agent。

## 90 秒面试回答

自回归推理分为 Prefill 和 Decode。Prefill 并行处理整个 Prompt，计算密集；Decode 每次只生成一个 Token，复用历史 K、V，但需要频繁读取模型权重和不断增长的 KV Cache，通常更受内存带宽影响。

KV Cache 避免每轮重新计算历史 Token 的 Key、Value，代价是显存随层数、序列长度、Batch 和 KV Head 数线性增长。Continuous Batching 在请求到达和结束时动态调整 Batch，提高 GPU 利用率；PagedAttention 用分页思想管理不同请求动态增长的 KV Block，降低碎片和重复。

FlashAttention 通过 Tiling 减少 HBM 与片上 SRAM 数据搬运，优化精确 Attention 的实际速度和内存访问，不会把标准 Attention 的理论 $O(n^2)$ 计算变成线性。线上我会分别监控 TTFT、TPOT、E2E Latency、Token Throughput、请求吞吐、KV 使用率和成功任务成本，再通过批处理、Prefix Cache、量化、推测解码、并行和模型路由优化。

## Prefill 与 Decode

### Prefill

输入完整 Prompt：

```text
[system][history][retrieved evidence][user query]
```

模型可以并行计算所有位置，Attention 需要处理 Prompt 内 Token 之间的关系。特点：

- 计算量随输入长度显著增长；
- 大矩阵乘法较容易利用 GPU；
- 影响 Time to First Token；
- 产生每层历史 Token 的 KV Cache。

### Decode

每轮输入一个新 Token：

```text
token_t → logits → sample token_(t+1)
```

新 Query 与所有历史 K、V 做 Attention。特点：

- 生成过程串行；
- 每步计算规模相对小；
- 需要反复读取模型权重和 KV；
- 常更受内存带宽限制；
- 影响 Time per Output Token。

## 四个核心指标

| 指标 | 含义 | 主要受什么影响 |
|---|---|---|
| TTFT | 请求到第一个 Token | 排队、Prefill、输入长度 |
| TPOT | 首 Token 后每个输出 Token 的平均时间 | Decode、Batch、带宽 |
| E2E Latency | 完整请求总耗时 | TTFT、输出长度、工具等待 |
| Throughput | 单位时间处理的 Token 或请求 | Batch、利用率、模型大小 |

还应同时看：

- P50/P95/P99；
- Input/Output Token 分开统计；
- 排队时间与计算时间；
- 请求取消后浪费的计算；
- 每个模型和租户的成功任务成本。

只报告平均 Token/s 可能掩盖交互请求已经无法接受的尾延迟。

## KV Cache

对每一层 Self-Attention，历史 Token 的 K、V 在后续生成中不会改变，可以缓存。

简化估算：

$$
\text{KV bytes}
\approx
2
\times L
\times B
\times S
\times H_{kv}
\times D_h
\times \text{bytes per element}
$$

其中：

- `2`：K 与 V；
- $L$：层数；
- $B$：Batch 中序列数；
- $S$：缓存长度；
- $H_{kv}$：KV Head 数；
- $D_h$：每个 Head 维度。

### Python：估算 KV Cache

```python
def estimate_kv_cache_gib(
    layers: int,
    batch_size: int,
    sequence_length: int,
    kv_heads: int,
    head_dimension: int,
    bytes_per_element: int = 2,
) -> float:
    cache_bytes = (
        2
        * layers
        * batch_size
        * sequence_length
        * kv_heads
        * head_dimension
        * bytes_per_element
    )
    return cache_bytes / (1024 ** 3)


example_gib = estimate_kv_cache_gib(
    layers=32,
    batch_size=16,
    sequence_length=8192,
    kv_heads=8,
    head_dimension=128,
)
```

这是不含元数据、分配粒度、临时 Buffer 和框架开销的下界式估算，但足以在面试中解释 GQA、上下文长度和 Batch 为什么影响显存。

## MHA、MQA、GQA 与缓存

若 Query Head 为 32：

```text
MHA：32 个 KV Head
GQA： 8 个 KV Head
MQA： 1 个 KV Head
```

在其他参数相同时，KV Cache 大小近似按 KV Head 数缩放。MQA 最省缓存，GQA 在质量与性能之间折中。

## Static Batching 与 Continuous Batching

### Static Batching

等待一批请求，一起执行到全部结束。若输出长度不同，短请求完成后仍可能等待长请求，形成空槽。

### Continuous Batching

调度器在 Decode 迭代之间动态加入新请求、移除已完成请求：

```text
step 1: A B C
step 2: A B C
step 3: A D C   # B 完成，D 加入
step 4: E D C   # A 完成，E 加入
```

它提高吞吐，但调度目标复杂：

- Prefill 是否阻塞正在 Decode 的请求；
- 长 Prompt 是否造成 Head-of-Line Blocking；
- 如何做优先级和租户公平；
- 如何响应取消；
- KV Block 如何分配；
- 是否设置最大 Batch Token。

## PagedAttention

传统连续分配要求为每个请求预留一段足够大的 KV 空间，但输出长度未知，会造成内部碎片和难以共享。

PagedAttention 把 KV Cache 划分为固定大小 Block，逻辑序列通过 Block Table 映射到不连续物理块：

```text
逻辑 Token: [0 ... 15][16 ... 31][32 ...]
物理 Block:     #7        #2        #9
```

收益：

- 按需分配；
- 降低碎片；
- 更容易在并行采样或共享前缀时复用 Block；
- 支持更大的有效 Batch。

代价包括 Block 管理、映射和专用内核复杂度。它解决的是 KV 内存管理，不等于压缩模型权重。

## FlashAttention

标准 Attention 的朴素实现会显式读写大的 $n\times n$ 中间矩阵。FlashAttention 将计算按块搬到更快的片上 SRAM，并在线维护 Softmax 归一化统计，从而减少 HBM 访问。

准确表述：

- 仍然计算精确 Attention；
- 主要改善 IO Complexity 和中间内存；
- 不改变稠密 Attention 的渐近计算复杂度；
- 实际收益取决于长度、Head Dimension、数据类型和硬件内核。

不要把 FlashAttention 与稀疏 Attention、线性 Attention 混为一谈。

## Prefix Cache

当多次请求共享相同前缀，例如：

- 相同 System Prompt；
- 相同工具描述；
- 相同知识库说明；
- Agent 多轮执行的稳定前缀；

可以缓存前缀对应的 KV，避免重复 Prefill。

必须注意：

- Cache Key 包含模型、Tokenizer、模板和全部前缀 Token；
- 不同租户的敏感前缀不能错误共享；
- 权限、时间敏感上下文和工具版本变化要失效；
- 缓存命中率与显存占用要一起评估。

## 量化

### 量化对象

- 权重；
- 激活；
- KV Cache；
- Embedding；
- 部分层保持高精度。

### 常见路线

| 路线 | 特点 |
|---|---|
| PTQ | 训练后量化，部署快，需要校准 |
| QAT | 训练中模拟量化，质量通常更稳，成本高 |
| Weight-only | 权重低比特，激活保留高精度 |
| W8A8 / FP8 | 权重和激活共同降低精度 |
| INT4 | 更省显存，对内核与质量更敏感 |

量化是否加速取决于硬件是否有高效内核。模型文件变小，不保证端到端延迟一定下降。

评估应包含：

- 通用和领域任务质量；
- 长上下文；
- 数学与代码；
- 结构化输出；
- 工具参数准确率；
- 不同输入长度；
- TTFT、TPOT 和吞吐。

## Speculative Decoding

使用较小 Draft Model 一次提出多个候选 Token，再由目标模型并行验证；被接受的前缀可以一次推进多个 Token。

收益取决于：

- Draft 与 Target 分布接近程度；
- 接受率；
- Draft 成本；
- 验证内核；
- Batch 和请求长度。

它应保持目标模型的采样分布，而不是简单用小模型替代大模型。若接受率低，额外 Draft 计算可能得不偿失。

## 并行策略

### Tensor Parallel

将同一层大矩阵切到多卡。适合单卡放不下或需要降低单请求延迟，但每层需要高频通信。

### Pipeline Parallel

不同层放在不同 Stage。适合大模型，但存在 Pipeline Bubble；在线小 Batch 下利用率可能受限。

### Data Parallel / Replica

每组设备放完整模型，处理不同请求。吞吐扩展直接，但单副本仍需容纳模型。

### Expert Parallel

MoE 模型将专家分布到不同设备，需要处理 Token 路由、All-to-All 和负载不均。

线上部署通常组合这些策略，并结合设备拓扑、网络带宽和请求分布选择。

## Model Routing

不是每个请求都需要最大模型。可以按任务、风险、长度和置信路由：

```text
规则/小模型判断
 ├─ 简单分类、抽取 → 小模型
 ├─ 普通知识问答   → 中模型 + RAG
 ├─ 复杂推理       → 大模型
 └─ 高风险动作     → 大模型 + 审批 / 人工
```

路由器也会犯错，因此要评估：

- 路由准确率；
- 降级导致的质量损失；
- 复杂请求漏判率；
- 成本与延迟收益；
- 不确定请求的回退策略。

## Agent 负载的特殊性

Agent 请求往往具有：

- 大量工具 Schema；
- 多轮共享前缀；
- 短输出决策与长输出总结混合；
- 模型调用与工具等待交替；
- 可暂停和取消；
- 总任务成本由多次调用组成。

因此应按整个 Run 观察：

```text
成功任务成本
= Σ 模型调用 + Σ 工具 + 检索 + 沙箱 + 重试浪费
```

只优化一次 Decode 的 Token/s，可能对端到端任务帮助很小。更有效的优化可能是减少无效步骤、压缩工具结果、提高 Prefix Cache 命中或用小模型处理路由。

## 容量规划

需要从真实流量分布估算：

- 输入长度分布；
- 输出长度分布；
- 峰值并发与到达率；
- 模型选择；
- KV Cache 上限；
- 超时与取消率；
- 可用 GPU；
- 故障冗余；
- 目标 SLO。

建议用回放或负载测试测量，而不是只按理论 FLOPs 推算。真实瓶颈可能在 Tokenizer、网络、队列、CPU 后处理或外部工具。

## 失败案例：吞吐提高，P95 延迟恶化

可能原因：

- Batch Token 上限过大；
- 长 Prompt Prefill 阻塞 Decode；
- 调度器优先吞吐，没有交互请求优先级；
- KV 接近上限导致频繁抢占或重算；
- 请求排队时间增长；
- 量化内核只在大 Batch 下高效；
- 多租户没有公平调度。

解决前应把延迟拆为：

```text
网关 → 排队 → Tokenize → Prefill → Decode → 后处理
```

再按输入长度、输出长度、模型和租户切片。不能只看 GPU 利用率。

## 失败案例：Prefix Cache 命中率很低

排查：

- System Prompt 是否包含动态时间或随机 ID；
- 工具描述顺序是否不稳定；
- JSON 是否没有规范化；
- 模型、Tokenizer 或模板版本是否频繁变化；
- 对话中稳定与动态部分是否混在前缀；
- Cache Key 是否过度包含请求特有字段。

修复前先确保缓存不跨安全边界；不能为了命中率忽略租户和权限。

## 常见误区

- **KV Cache 减少显存**：它减少重复计算，但会增加显存；
- **FlashAttention 把 $O(n^2)$ 变成 $O(n)$**：错误；
- **量化后文件小多少，速度就快多少**：受硬件内核和瓶颈影响；
- **Batch 越大越好**：吞吐、TTFT 和尾延迟存在取舍；
- **GPU 利用率高就代表服务健康**：用户可能在长时间排队；
- **Token/s 可以跨模型直接比较**：Tokenizer、输出长度和硬件不同；
- **Agent 成本等于最后一次回答成本**：应按完整任务核算。

## 递进追问

### Q1：Prefill 和 Decode 应该分离部署吗？

长 Prompt 和长输出的资源特征不同，分离可以独立扩缩和调度；但会增加 KV 传输、网络和系统复杂度。应根据流量、拓扑和 SLO 验证。

### Q2：为什么 Decode 常是 Memory-Bound？

每步只处理少量新 Token，却要读取大量模型权重和 KV，算术强度较低。Batch 增大可以复用权重读取，但会增加排队和缓存压力。

### Q3：什么时候量化 KV Cache？

长上下文或大并发下 KV 成为主要显存瓶颈时值得尝试；必须单独评估长上下文、注意力敏感任务和所用硬件内核。

### Q4：如何选择小模型路由还是量化大模型？

小模型路由可以对简单任务节约更多成本，但承担路由错误；量化保持统一能力边界但每次仍运行大模型结构。用真实任务切片比较质量、风险、延迟和成本。

## 自测

1. 解释 Prefill 和 Decode 的计算特征；
2. 根据层数、KV Head 和序列长度估算缓存；
3. 比较 Static 与 Continuous Batching；
4. 解释 PagedAttention 解决的具体碎片问题；
5. 说明 FlashAttention 优化了什么、没有优化什么；
6. 设计 Prefix Cache 的安全 Cache Key；
7. 比较 PTQ、QAT 和 Weight-only Quantization；
8. 为 Agent 服务设计一棵模型路由与降级树。

## 权威资料

- [FlashAttention](https://arxiv.org/abs/2205.14135)
- [PagedAttention / vLLM](https://arxiv.org/abs/2309.06180)
- [Orca：A Distributed Serving System for Transformer-Based Generative Models](https://www.usenix.org/conference/osdi22/presentation/yu)
- [Speculative Decoding](https://arxiv.org/abs/2211.17192)
- [Megatron-LM](https://arxiv.org/abs/1909.08053)
- [SmoothQuant](https://arxiv.org/abs/2211.10438)

---

**进入 Agent 系统：** [Agent Runtime 与 Harness](../company-interview-questions/agent-core/runtime-harness.md)
