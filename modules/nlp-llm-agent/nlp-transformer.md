---
title: NLP 与 Transformer 基础
description: 从 Tokenization、Embedding 和标准 Attention，深入 MLA、DSA、KDA、MoBA 与混合注意力，建立 NLP 与大语言模型算法岗的共同底座。
---

# NLP 与 Transformer：从 Token 到一次前向计算

这一章解决两个问题：

1. 一段文本怎样变成模型能够计算的张量；
2. Transformer 为什么能在这些张量上完成上下文建模。

面试中只会说“Transformer 使用自注意力，能够并行”是不够的。至少要能写出核心公式、解释 Mask 和位置、计算复杂度，并说明训练与推理阶段有什么不同。

## 90 秒面试回答

文本首先经过规范化和 Tokenizer，被映射为整数 Token ID，再经过词嵌入与位置编码变成向量。Transformer 每层用输入分别乘三个投影矩阵得到 `Q、K、V`，通过

$$
\operatorname{Attention}(Q,K,V)
= \operatorname{softmax}\left(\frac{QK^\top}{\sqrt{d_k}} + M\right)V
$$

计算每个 Token 对其他 Token 的加权汇总。除以 $\sqrt{d_k}$ 是为了控制点积方差，避免维度增大后 Softmax 过度饱和；Mask 用来屏蔽 Padding，Decoder 的 Causal Mask 还要阻止看到未来 Token。

多头注意力让不同子空间学习不同关系，残差连接保证信息和梯度通路，LayerNorm 稳定每个样本内部的特征尺度，FFN 对每个位置独立做非线性变换。Self-Attention 的主要时间复杂度是 $O(n^2d)$，长上下文的瓶颈来自注意力矩阵、KV Cache 和内存访问。Decoder-only 语言模型使用因果掩码做下一个 Token 预测，训练时可以并行处理整段序列，推理时则必须逐 Token 自回归生成。

现代注意力优化不是只有一条路线：MQA、GQA、MLA 主要压缩 KV Cache；DSA、NSA、MoBA、MSA 只对选中的 Token 或 Block 做精确注意力；KDA、Gated DeltaNet 等把历史压缩为有限状态；Kimi、Qwen 等模型再周期性插入全注意力补足精确召回。FlashAttention 优化的是精确注意力的 IO，而 PagedAttention 管理的是 KV Cache，它们不能与注意力架构变体混为一谈。

## 文本怎样变成 Token

### 为什么不能只按字或空格切分

- 按词切分：词表巨大，未登录词严重；
- 按字符切分：序列变长，语义单元被拆散；
- 子词切分：在词表大小、序列长度和未知词之间折中。

BPE、WordPiece 和 Unigram 都属于子词方案，但优化目标不同：

| 方法 | 核心思想 | 常见实现 |
|---|---|---|
| BPE | 反复合并频率最高的相邻符号对 | GPT 系列常见变体 |
| WordPiece | 选择最能提高语言模型似然的合并 | BERT |
| Unigram | 从大词表出发，删除损失最小的子词 | SentencePiece |

Tokenizer 不是无关紧要的预处理。它会影响：

- 序列长度和训练成本；
- 数字、代码、多语言文本的表示；
- 停止词和结构化输出的稳定性；
- 同一个词在不同上下文中的切分；
- 模型复制、拼写和字符级推理能力。

### Python：一个教学版 BPE

下面只展示“统计相邻对并合并”的核心机制。生产 Tokenizer 还需要规范化、特殊 Token、字节回退、序列化和确定性版本管理。

```python
from collections import Counter


def pair_frequencies(vocabulary: dict[tuple[str, ...], int]) -> Counter:
    frequencies = Counter()

    for symbols, word_count in vocabulary.items():
        for left, right in zip(symbols, symbols[1:]):
            frequencies[(left, right)] += word_count

    return frequencies


def merge_pair(
    vocabulary: dict[tuple[str, ...], int],
    target_pair: tuple[str, str],
) -> dict[tuple[str, ...], int]:
    merged_vocabulary: dict[tuple[str, ...], int] = {}
    left, right = target_pair
    merged_symbol = left + right

    for symbols, count in vocabulary.items():
        new_symbols: list[str] = []
        index = 0

        while index < len(symbols):
            # 只合并当前训练轮选中的相邻符号对。
            if (
                index + 1 < len(symbols)
                and symbols[index] == left
                and symbols[index + 1] == right
            ):
                new_symbols.append(merged_symbol)
                index += 2
            else:
                new_symbols.append(symbols[index])
                index += 1

        merged_vocabulary[tuple(new_symbols)] = count

    return merged_vocabulary


def train_toy_bpe(
    word_counts: dict[str, int],
    merge_steps: int,
) -> list[tuple[str, str]]:
    vocabulary = {
        tuple(list(word) + ["</w>"]): count
        for word, count in word_counts.items()
    }
    merge_rules: list[tuple[str, str]] = []

    for _ in range(merge_steps):
        frequencies = pair_frequencies(vocabulary)
        if not frequencies:
            break

        best_pair, _ = frequencies.most_common(1)[0]
        vocabulary = merge_pair(vocabulary, best_pair)
        merge_rules.append(best_pair)

    return merge_rules
```

面试时应主动说明：这个示例按 Unicode 字符开始，不能复现 GPT 类 Byte-level BPE 对任意字节串的完整处理。

## Embedding 到底是什么

词表大小为 $V$、隐藏维度为 $d$ 时，Embedding 表可以写成：

$$
E \in \mathbb{R}^{V \times d}
$$

Token ID 取出其中一行。它等价于 One-Hot 向量乘矩阵，但实现不会真的构造巨大的 One-Hot。

需要区分：

- **Token Embedding**：词表项到向量；
- **Position Representation**：提供顺序信息；
- **Contextual Representation**：经过多层 Transformer 后，同一个 Token 在不同上下文得到不同表示；
- **Sentence Embedding**：为检索或聚类构造的整段向量，不等于简单平均所有 Token。

## Scaled Dot-Product Attention

设输入为：

$$
X \in \mathbb{R}^{n \times d_{\text{model}}}
$$

线性投影：

$$
Q=XW_Q,\quad K=XW_K,\quad V=XW_V
$$

相似度矩阵 $QK^\top$ 的形状为 $n \times n$。第 $i$ 行表示第 $i$ 个查询位置对所有键位置的分数。

### 为什么除以 $\sqrt{d_k}$

若 $q_i$、$k_i$ 独立、均值为 0、方差为 1，则点积：

$$
q^\top k = \sum_{i=1}^{d_k}q_i k_i
$$

方差随 $d_k$ 线性增长。维度越大，点积绝对值通常越大，Softmax 越容易进入接近 0/1 的饱和区，梯度会变小。除以 $\sqrt{d_k}$ 后，方差回到较稳定的量级。

常见误区是说“为了防止梯度爆炸”。更准确的表述是：**控制 Logit 尺度，减少 Softmax 饱和，使优化更稳定**。

### Mask 怎样进入计算

Mask 通常在 Softmax 前加到 Logit：

```text
允许关注的位置：加 0
禁止关注的位置：加一个足够大的负数
```

Causal Mask 示意：

```text
       K0  K1  K2  K3
Q0      ✓   ×   ×   ×
Q1      ✓   ✓   ×   ×
Q2      ✓   ✓   ✓   ×
Q3      ✓   ✓   ✓   ✓
```

不能在 Softmax 后简单把非法位置乘 0 而不重新归一化，否则剩余概率之和不再为 1。

### Python：可读版单头 Attention

```python
import math

import torch


def scaled_dot_product_attention(
    query: torch.Tensor,
    key: torch.Tensor,
    value: torch.Tensor,
    allowed_mask: torch.Tensor | None = None,
) -> tuple[torch.Tensor, torch.Tensor]:
    key_dimension = query.size(-1)
    scores = query @ key.transpose(-2, -1)
    scores = scores / math.sqrt(key_dimension)

    if allowed_mask is not None:
        # False 表示该位置不可见；使用数据类型可表示的最小值。
        scores = scores.masked_fill(
            ~allowed_mask,
            torch.finfo(scores.dtype).min,
        )

    attention_weights = torch.softmax(scores, dim=-1)
    output = attention_weights @ value
    return output, attention_weights
```

工程实现还需要处理 Batch、Head、Padding、混合精度和全 Mask 行。全 Mask 行若直接 Softmax，可能产生 NaN，因此数据契约必须保证至少有一个合法位置，或显式处理该分支。

## Multi-Head、MQA 与 GQA

多头注意力将隐藏维度拆成多个 Head：

$$
\operatorname{MHA}(Q,K,V)
= \operatorname{Concat}(\text{head}_1,\ldots,\text{head}_h)W_O
$$

它不是简单把同一份 Attention 重复多次。每个 Head 有不同投影参数，可以在不同表示子空间学习局部、句法、指代或长距离关系。

推理系统常见三种形式：

| 结构 | Query Head | KV Head | 取舍 |
|---|---:|---:|---|
| MHA | 多个 | 与 Query 一样多 | 表达能力强，KV Cache 大 |
| MQA | 多个 | 1 个 | Cache 小，可能损失质量 |
| GQA | 多个 | 少量分组 | 在质量和推理成本间折中 |

KV Head 数量直接影响缓存大小，因此 GQA 不只是模型结构题，也是一道推理系统题。

## 位置编码

没有位置信息时，Self-Attention 对输入排列近似保持等变，模型不知道 Token 的先后顺序。

常见方案：

- 绝对可学习位置 Embedding；
- 正弦余弦位置编码；
- RoPE：在 Query、Key 上按位置旋转；
- ALiBi：在注意力分数中加入随距离变化的偏置。

RoPE 的重要直觉是：两个位置旋转后的 Query、Key 点积能够包含相对位置差。它不等于“天然支持任意长度外推”，超出训练长度时仍可能需要频率缩放、重新训练或专门评估。

## 残差、归一化与 FFN

### 为什么使用 LayerNorm

BatchNorm 依赖 Batch 统计，在变长序列、小 Batch 和自回归推理中不方便；LayerNorm 在单个 Token 的隐藏维度上归一化，不依赖其他样本。

Pre-LN 结构：

```text
x = x + Attention(LN(x))
x = x + FFN(LN(x))
```

Post-LN 结构：

```text
x = LN(x + Attention(x))
x = LN(x + FFN(x))
```

Pre-LN 通常更容易训练很深的网络，因为残差主路径更直接；但具体模型还会使用 RMSNorm、残差缩放等变体，不能把结论绝对化。

### FFN 为什么重要

Attention 负责在 Token 之间混合信息，FFN 对每个位置独立完成特征变换。典型形式：

$$
\operatorname{FFN}(x)=W_2\sigma(W_1x+b_1)+b_2
$$

现代 LLM 常使用 SwiGLU 等门控变体。模型参数量中很大一部分位于 FFN，因此 MoE 通常把 FFN 专家化，而不是复制完整 Transformer。

## Encoder、Decoder 与三类架构

| 架构 | 注意力方式 | 典型任务 |
|---|---|---|
| Encoder-only | 双向可见 | 分类、抽取、向量表示 |
| Decoder-only | 因果 Mask | 自回归生成、通用 LLM |
| Encoder-Decoder | Encoder 双向，Decoder 因果并跨注意力 | 翻译、摘要、条件生成 |

Decoder-only 成为通用 LLM 主流的重要原因包括统一的下一个 Token 训练目标、生成任务适配简单、扩展规律清晰，而不是因为它在所有 NLP 任务上都必然优于 Encoder。

## 训练和推理为什么不同

训练时，已知完整目标序列，可以用 Causal Mask 一次并行计算所有位置的损失。

推理时，第 $t+1$ 个 Token 依赖前 $t$ 个 Token，只能自回归生成。已计算历史 Token 的 K、V 可以缓存，这就是 KV Cache；但新 Token 仍需逐步产生。

```text
训练：一次输入整段 → 并行计算每个位置
推理：输入 Prompt → 生成 1 个 Token → 追加 → 再生成
```

## 复杂度应该怎样回答

标准 Self-Attention 的主要计算：

- $QK^\top$：$O(n^2d)$；
- 权重乘 $V$：$O(n^2d)$；
- 投影与 FFN：还包含 $O(nd^2)$。

不能只说“Transformer 复杂度是 $O(n^2)$”，因为完整层的瓶颈与 $n$、$d$、硬件利用率都有关。短序列、大隐藏维度时，线性层可能占主要计算；长序列时，Attention 和 KV Cache 更突出。

## 现代注意力变体：它们到底在优化什么

标准因果 MHA 同时面临两个不同瓶颈：

1. **Prefill 计算**：长度为 $n$ 的 Prompt 需要构造 Token 两两关系，注意力计算约为 $O(n^2d)$；
2. **Decode 存储与访存**：每生成一个 Token，都需要读取历史 KV Cache。忽略量化和张量并行时，每层缓存量近似为：

$$
\text{KV bytes}
\approx 2 \times n \times h_{kv} \times d_h \times \text{bytes per element}
$$

其中 2 表示 Key 和 Value，$h_{kv}$ 是 KV Head 数，$d_h$ 是 Head Dimension。长上下文和大并发下，Decode 往往先成为显存带宽问题，而不只是 FLOPs 问题。

因此，现代注意力创新至少分为五类：

| 路线 | 代表方法 | 改变了什么 | 主要解决的问题 |
|---|---|---|---|
| KV 共享或压缩 | MQA、GQA、MLA | 减少每个 Token 需要缓存的 K、V | Decode 显存与带宽 |
| 稀疏精确注意力 | DSA、NSA、MoBA、MSA | 只在选中 Token 或 Block 上做 Softmax | 长上下文 Prefill 与 Decode 计算 |
| 线性/循环注意力 | KDA、Gated DeltaNet、Lightning Attention | 用固定大小状态概括历史 | 流式生成和超长序列 |
| 混合注意力 | KDA + MLA、DeltaNet + Full Attention | 线性层扫描，精确层负责召回 | 效率与质量平衡 |
| 深度方向注意力 | Attention Residuals | 动态选择历史层表示 | 超深网络的信息传播 |

这些路线彼此正交。一个模型可以同时使用 MLA、稀疏路由、输出门控和定制 Kernel，而不是只能选择其中一种。

### KV 共享：MQA、GQA 与 MLA

MQA 让所有 Query Head 共享一组 K、V，GQA 让一组 Query Head 共享一组 K、V。它们直接减小 $h_{kv}$，优点是结构简单、推理框架成熟；代价是多个 Query Head 看到的 KV 表示不再完全独立。

DeepSeek-V2 提出的 **Multi-head Latent Attention，MLA** 采用不同思路：不直接缓存完整 K、V，而是先联合压缩到低维潜变量：

$$
c_t^{KV}=W^{DKV}h_t
$$

各个 Head 再从 $c_t^{KV}$ 恢复自己需要的 Key 和 Value。推理前还可以把部分上投影矩阵吸收到 Query 与输出投影中，使运行时直接使用压缩表示。这样既降低 Cache，又比单纯共享一组 KV 保留更多多头表达能力。

MLA 还有一个容易漏答的工程细节：标准 RoPE 会把位置相关旋转夹在投影之间，阻碍矩阵吸收。因此 MLA 将内容通道与位置通道解耦，只在专门的低维 Key/Query 分支上应用 RoPE。

DeepSeek-V2 技术报告给出的模型级结果是：与 DeepSeek 67B 相比，KV Cache 减少约 93.3%，最大生成吞吐量最高达到约 5.76 倍。这个数字包含模型结构与实现的共同影响，不能脱离模型、硬件和 Batch 直接外推。[DeepSeek-V2 论文](https://arxiv.org/abs/2405.04434)

**面试时的比较结论：**

- MQA：缓存最小、实现简单，但 KV 表达共享最强；
- GQA：成熟的质量与成本折中；
- MLA：通过低秩潜变量压缩缓存，目标是在接近小 Cache 的同时保留多头表达力；
- MLA 的代价是投影、位置编码和 Kernel 都更复杂，理论 Cache 降低不等于端到端延迟自动同比降低。

### 稀疏精确注意力：先选择，再计算

稀疏注意力通常先构造候选集合：

$$
\mathcal I_t=\operatorname{TopK}
\left(\operatorname{Indexer}(q_t,K_{\le t})\right)
$$

再只对候选执行正常 Softmax：

$$
o_t=
\operatorname{softmax}
\left(
\frac{q_tK_{\mathcal I_t}^{\top}}{\sqrt{d_k}}
\right)V_{\mathcal I_t}
$$

“稀疏”发生在候选范围，“精确”表示选中后仍然计算标准注意力。真正的挑战是：索引器能否召回关键证据，以及选中的 KV 能否被 GPU 高效读取。

#### DeepSeek NSA：压缩、精选与局部三路并行

Native Sparse Attention 同时保留三条分支：

1. **压缩分支**：用摘要表示覆盖远距离全局上下文；
2. **选择分支**：挑选少量重要 Token 做细粒度精确注意力；
3. **局部分支**：始终保留最近窗口，维护局部连续性。

这个结构分别弥补三类失败：只有局部窗口会错过远处事实，只有 Top-K 可能破坏连续关系，只有压缩摘要又会丢失精确细节。NSA 从训练阶段就使用稀疏结构，而不是对 Dense 模型事后剪枝。论文在 64K 序列实验中报告最高约 9 倍前向、6 倍反向和 11.6 倍解码加速；这些是特定实验设置下的结果，重点应放在三路结构与原生训练思想。[NSA 论文](https://arxiv.org/abs/2502.11089)

#### DeepSeek DSA：Token 级 Top-K + Sparse MLA

DeepSeek-V3.2-Exp 的 DeepSeek Sparse Attention 使用轻量索引器扫描历史并选出相关 Token，主分支只对被选 Token 执行 Sparse MLA。它的选择粒度比块稀疏更细，适合“少数关键证据藏在很长上下文中”的任务。[DeepSeek-V3.2-Exp 官方仓库](https://github.com/deepseek-ai/DeepSeek-V3.2-Exp)

但 DSA 不能被简单称为“端到端严格线性”：

- 索引器仍需要为历史位置产生分数；
- 离散 Token 的随机 Gather 不如连续矩阵乘天然适合 GPU；
- Top-K 漏掉关键 Token 后，后续精确 Softmax 无法补救。

GLM-5 官方技术报告明确采用了 DSA。这说明可学习 Token 稀疏已经从 DeepSeek 自身实验扩展到另一套大型开源模型体系；GLM-5 的价值更偏向大规模验证和工程整合，而不是重新发明一种独立命名的注意力机制。[GLM-5 论文](https://arxiv.org/abs/2602.15763)

#### Kimi MoBA：块级路由

Mixture of Block Attention 先把历史 KV 划分成连续块，再为每个 Query 选择最相关的 Top-K 块，当前因果块始终保留。选中块内部仍执行标准注意力。

块级方案的优势是连续内存读取更适合 GPU；缺点是一个块中即使只有少量 Token 相关，也需要读取整块，而且块边界可能切断精细关联。MoBA 一般需要继续训练让模型适应稀疏路由，不是给任意预训练模型无损替换的插件。Moonshot 的公开资料说明它已用于 Kimi 长上下文请求。[MoBA 论文](https://arxiv.org/abs/2502.13189)、[MoBA 官方实现](https://github.com/MoonshotAI/MoBA)

#### MiniMax MSA：按 GQA 分组选择 KV Block

MiniMax Sparse Attention 也使用块稀疏，但索引分支会针对不同 GQA Group 独立选择 KV Block，主分支再对选中块执行精确注意力。不同 KV Group 可以关注不同上下文区域，比所有 Head 共用一套块选择更灵活。

论文在 1M 上下文、109B 模型的实验中报告约 28.4 倍的单 Token 注意力计算量缩减，以及 H800 上最高约 14.2 倍 Prefill、7.6 倍 Decode 墙钟加速。仍应以目标模型和实际 Kernel 复测，而不是把论文峰值当成部署保证。[MSA 论文](https://arxiv.org/abs/2606.13392)、[MSA 官方实现](https://github.com/MiniMax-AI/MSA)

#### Token 稀疏和 Block 稀疏怎样选

| 维度 | Token 级稀疏 | Block 级稀疏 |
|---|---|---|
| 代表 | DSA、NSA 选择分支 | MoBA、MSA |
| 选择精度 | 高 | 较粗 |
| 访存连续性 | 较差 | 较好 |
| 关键风险 | Top-K 漏召回、随机 Gather | 块内冗余、边界效应 |
| 更适合 | 精确定位少量证据 | GPU 友好的大段上下文路由 |

### 线性与循环注意力：把历史写入有限状态

线性/循环注意力不保留完整注意力矩阵，而是维护固定大小状态。教学上可以抽象为：

$$
S_t=g_t\odot S_{t-1}+\operatorname{Write}(k_t,v_t)
$$

$$
o_t=\operatorname{Read}(q_t,S_t)
$$

$g_t$ 控制遗忘，Write 决定如何写入新信息。这样 Decode 不必读取随序列长度增长的完整 KV Cache，特别适合持续生成和流式 Agent。

代价也很明确：有限状态会发生信息碰撞、覆盖和遗忘。完整注意力可以重新访问任意历史 Token，而有限状态只能读取“压缩之后还剩下什么”。因此当前更成功的路线通常不是完全取消 Softmax，而是使用混合架构。

#### Kimi Delta Attention：细粒度门控更新

Kimi Delta Attention 在 Gated DeltaNet 基础上使用更细粒度的门控，决定旧状态遗忘多少、新信息写入多少，以及冲突信息如何覆盖。Kimi Linear 使用约 **3:1 的 KDA 与全局 MLA**：

- 多数 KDA 层低成本扫描上下文；
- 周期性的全局 MLA 层重新访问原始历史，修复精确召回短板。

官方报告在百万 Token 上下文场景下最高减少约 75% KV Cache，并取得最高约 6 倍解码吞吐量。这里同样应理解为指定模型与环境下的综合结果。[Kimi Linear 论文](https://arxiv.org/abs/2510.26692)、[Kimi Linear 官方实现](https://github.com/MoonshotAI/Kimi-Linear)

#### Qwen3-Next：Gated DeltaNet + 标准注意力

Qwen3-Next 采用相似的混合原则：约 75% 层使用 Gated DeltaNet，25% 层使用标准注意力。标准注意力输出还增加 Sigmoid Gate，让每个 Head 或通道控制实际写回残差流的信息量。

门控主要处理信息流和训练稳定性，例如缓解 Attention Sink 与异常巨大激活；它与 KV 压缩、稀疏选择并不冲突。Qwen 官方给出的设计动机也很直接：线性注意力便宜但精确召回较弱，完整注意力可靠但昂贵，混合结构通常优于只使用其中一种。[Qwen3-Next 官方技术说明](https://qwen.ai/blog?id=e34c4305036ce60d55a0791b170337c2b70ae51d)、[Gated DeltaNet 论文](https://arxiv.org/abs/2412.06464)

#### MiniMax Lightning Attention：块内精确、块间线性

Lightning Attention 使用分块计算：块内保留常规注意力，块间通过线性状态传播，避免朴素线性注意力实现中的累积和瓶颈。MiniMax-01 用它支持长上下文训练，体现的是“算法形式必须匹配 GPU 分块计算”，而不仅是把复杂度符号从平方改成线性。[Lightning Attention-2 论文](https://arxiv.org/abs/2405.17381)、[MiniMax-01 论文](https://arxiv.org/abs/2501.08313)

### Attention Residuals：在模型深度上做注意力

传统残差连接通常固定累加上一层输出：

$$
h_l=h_{l-1}+F_l(h_{l-1})
$$

Moonshot 的 Attention Residuals 允许当前层动态聚合更早的层表示：

$$
h_l=\sum_{i<l}\alpha_{i\rightarrow l}v_i
$$

它解决的是**层与层之间的信息路由**，不是 Token 序列上的长上下文计算。Full AttnRes 可以访问所有历史层，但需要保存更多表示；Block AttnRes 把若干层组成一个 Block，在较低开销下保留大部分收益。

截至 2026 年 7 月公开的 Kimi K3 将 KDA、全局注意力和 Attention Residuals 结合起来：前两者处理序列长度上的效率与召回，后者处理模型深度上的信息传播。这三个概念不能混为一种注意力。[Attention Residuals 论文](https://arxiv.org/abs/2603.15031)、[Kimi K3 论文](https://arxiv.org/abs/2607.24653)

### 当前开源模型路线图

| 模型或论文 | 主要注意力设计 | 最应该记住的点 |
|---|---|---|
| DeepSeek-V2/V3 | MLA | 用联合低秩潜变量压缩 KV Cache |
| DeepSeek NSA | 压缩 + 选择 + 局部三分支 | 原生训练的分层稀疏 |
| DeepSeek-V3.2-Exp | DSA + Sparse MLA | Token 级索引后做精确稀疏注意力 |
| GLM-5 | 集成 DSA | 对 DSA 的跨模型大规模验证 |
| Kimi MoBA | Top-K Block Attention | 连续块访问更适合 GPU |
| Kimi Linear | 3:1 KDA + MLA | 固定状态负责效率，MLA 负责精确召回 |
| Kimi K3 | KDA + 全局注意力 + AttnRes | 同时优化序列和深度信息流 |
| Qwen3-Next | 3:1 Gated DeltaNet + Full Attention | 混合线性与精确注意力，并增加输出门控 |
| MiniMax-01 | Lightning Attention | 块内精确、块间线性 |
| MiniMax-M3 / MSA | GQA Group 级 Top-K Block | 稀疏粒度与硬件效率的折中 |

### 不要把架构、位置编码和推理系统混在一起

| 技术 | 所属层次 | 是否改变注意力语义 |
|---|---|---|
| MLA、DSA、KDA、MoBA | 模型架构 | 是 |
| RoPE、YaRN、NTK Scaling | 位置表示与外推 | 不直接改变 |
| FlashAttention | 精确注意力 Kernel / IO 优化 | 否 |
| PagedAttention | KV Cache 内存管理 | 否 |
| Prefix Cache、KV 量化 | 推理服务与缓存优化 | 否 |

FlashAttention 仍计算完整的精确 Softmax Attention，只是通过 Tiling 和在线 Softmax 减少 HBM 读写；PagedAttention 则把不同请求动态增长的 KV Cache 分页管理。它们的系统原理放在[推理系统章节](./inference-systems.md#flashattention)继续讲。

### 面试中怎样选择方案

- **Decode 显存和并发优先**：先考虑 GQA 或 MLA，再结合 KV 量化和分页管理；
- **百万 Token 中精确找少量证据**：考虑 DSA、NSA 一类 Token 稀疏；
- **希望获得 GPU 友好的稀疏吞吐**：考虑 MoBA、MSA 一类 Block 稀疏；
- **持续生成、流式 Agent、超长会话**：考虑 KDA、Gated DeltaNet 等混合线性架构；
- **超深模型的信息稀释**：Attention Residuals 是正交的深度路由方案；
- **生态兼容和部署简单优先**：GQA + FlashAttention 仍是成熟基线。

不存在只看理论复杂度就能决定的最佳方案。评估至少应同时包含：

1. 质量：短上下文基准、长上下文检索、推理、代码和真实 Agent 任务；
2. 长上下文鲁棒性：不同证据位置、干扰项数量、多跳证据和 Needle/RULER 类切片；
3. Prefill：TTFT、Token Throughput、峰值显存；
4. Decode：TPOT、KV bytes/request、并发容量和内存带宽；
5. 端到端成本：索引器、路由、Gather、通信和 Kernel 是否抵消理论收益；
6. 训练边界：能否直接替换、是否需要继续训练、是否有对应硬件实现。

“支持 1M Context”只说明最大容量，不等于模型能稳定利用窗口中任意位置的证据。注意力变体必须用真实任务和对抗干扰评估，不能只看最大长度或单个 Needle 测试。

## 失败案例：模型新增特殊 Token 后效果下降

排查顺序：

1. Token 是否加入词表但 Embedding 未正确初始化；
2. 输入和标签是否使用同一个 Tokenizer 版本；
3. 特殊 Token 是否被规范化或再次切分；
4. Padding ID 是否错误参与损失；
5. Chat Template 是否在训练和推理阶段一致；
6. 新 Token 在训练数据中是否有足够覆盖；
7. 保存模型时是否同时保存 Tokenizer 与模板。

这类问题表面像“模型没学会”，实际常是数据契约或版本不一致。

## 常见误区

- **Attention 权重等于可解释因果关系**：权重可帮助分析，但不能直接当作因果解释；
- **位置窗口越长越好**：窗口增大会提高显存、延迟和噪声，能力还需要专门评估；
- **Token 越细越准确**：更细会增加序列长度和计算成本；
- **FlashAttention 把理论复杂度降为线性**：它主要优化精确 Attention 的内存访问，不改变标准 Attention 的渐近计算量；
- **稀疏注意力一定比稠密注意力快**：索引、Top-K 和离散 Gather 也有成本，没有高效 Kernel 时理论稀疏可能无法转化为墙钟收益；
- **线性注意力可以无损记住无限历史**：固定状态容量有限，信息会覆盖或碰撞，混合架构仍需精确注意力补充召回；
- **MLA 就是另一种 GQA**：GQA 共享少量 KV Head，MLA 联合压缩到潜变量再恢复多头表示，信息约束与实现方式不同；
- **GLM-5 提出了 DSA**：DSA 源自 DeepSeek，GLM-5 的代表性工作是采用并完成大规模工程验证；
- **Attention Residuals 用来降低序列注意力复杂度**：它关注模型深度上的历史层选择，与 Token 序列注意力正交；
- **Decoder-only 不能理解双向上下文**：它生成当前位置时可以使用此前 Prompt 的全部上下文，只是训练掩码是因果的；
- **温度为 0 就绝对可复现**：并行归约、服务路由和内核实现仍可能带来差异。

## 递进追问

### Q1：为什么 Embedding 权重常与输出层共享？

输入和输出都处于同一词表空间，权重共享可以减少参数并形成有用的表示约束。但两端分布、隐藏维度或多模态设计不匹配时，不一定适合共享。

### Q2：长上下文为什么会出现“中间信息丢失”？

上下文容量不等于稳定利用能力。位置分布、训练数据长度、注意力竞争和检索噪声都会影响模型是否使用中间证据，应通过位置切片评估，而不是只看最大窗口声明。

### Q3：如何验证模型真的使用了某段证据？

可以做证据删除、证据替换和位置扰动实验，比较答案、置信和引用变化；同时避免把暴露给模型的 Chain-of-Thought 当作唯一证据。

### Q4：Attention 的 Mask 为什么可能导致 NaN？

如果一整行都被设为负无穷，Softmax 的归一化分母可能变成非法值。应保证每个 Query 至少能看到一个位置，或对全 Mask 行做显式处理。

### Q5：为什么 MLA 能比 GQA 更省 Cache 又保留多头表达？

GQA 直接让多个 Query Head 共享 KV Head；MLA 则缓存共享的低维潜变量，各 Head 仍可通过不同投影恢复所需表示。它不是免费午餐：模型必须在训练中学会这种低秩表示，并依赖矩阵吸收、解耦 RoPE 和专用 Kernel 才能兑现端到端收益。

### Q6：为什么线性注意力模型还要周期性插入全注意力？

固定状态适合压缩和流式更新，却不能保证任意历史细节都可恢复。周期性的全注意力或 MLA 层相当于重新读取原始历史，补足关联记忆、精确复制和长距离召回，因此 Kimi Linear 与 Qwen3-Next 都选择了混合结构。

### Q7：DSA 与 MoBA 最大的区别是什么？

DSA 选择细粒度 Token，召回更精确但访存分散；MoBA 选择连续 Block，块内可能包含冗余 Token，但更容易使用 GPU 友好的连续读取。两者都必须把索引质量、选择成本和主注意力 Kernel 一起评估。

## 自测

1. 不看页面写出 Scaled Dot-Product Attention 公式，并标出每个张量形状；
2. 解释为什么 Mask 必须在 Softmax 前进入 Logit；
3. 比较 BPE、WordPiece 和 Unigram；
4. 解释 Pre-LN、Post-LN 的结构差异；
5. 说明 MHA、MQA、GQA 对 KV Cache 的影响；
6. 分别给出训练阶段和推理阶段的并行边界；
7. 说明为什么 FlashAttention 不是稀疏 Attention。
8. 比较 GQA 与 MLA 的缓存方式、表达约束和工程代价；
9. 画出 NSA 的压缩、选择、局部三条分支；
10. 解释 DSA 的索引器为什么可能仍是系统瓶颈；
11. 比较 Token 稀疏和 Block 稀疏的召回与访存特性；
12. 解释 KDA 为什么需要周期性全局 MLA；
13. 说明 Attention Residuals 与序列注意力的维度差异；
14. 为“百万 Token Agent 会话”设计一组质量、延迟、显存联合评测。

## 权威资料

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [BERT：Pre-training of Deep Bidirectional Transformers](https://arxiv.org/abs/1810.04805)
- [SentencePiece](https://arxiv.org/abs/1808.06226)
- [RoFormer：Rotary Position Embedding](https://arxiv.org/abs/2104.09864)
- [GQA：Training Generalized Multi-Query Transformer Models](https://arxiv.org/abs/2305.13245)
- [FlashAttention](https://arxiv.org/abs/2205.14135)
- [DeepSeek-V2：Multi-head Latent Attention](https://arxiv.org/abs/2405.04434)
- [DeepSeek Native Sparse Attention](https://arxiv.org/abs/2502.11089)
- [DeepSeek-V3.2-Exp / DeepSeek Sparse Attention](https://github.com/deepseek-ai/DeepSeek-V3.2-Exp)
- [FlashMLA](https://github.com/deepseek-ai/FlashMLA)
- [Kimi MoBA：Mixture of Block Attention](https://arxiv.org/abs/2502.13189)
- [Kimi Linear：Kimi Delta Attention](https://arxiv.org/abs/2510.26692)
- [Attention Residuals](https://arxiv.org/abs/2603.15031)
- [Kimi K3](https://arxiv.org/abs/2607.24653)
- [GLM-5](https://arxiv.org/abs/2602.15763)
- [Gated DeltaNet](https://arxiv.org/abs/2412.06464)
- [Qwen3-Next 官方技术说明](https://qwen.ai/blog?id=e34c4305036ce60d55a0791b170337c2b70ae51d)
- [Lightning Attention-2](https://arxiv.org/abs/2405.17381)
- [MiniMax-01](https://arxiv.org/abs/2501.08313)
- [MiniMax Sparse Attention](https://arxiv.org/abs/2606.13392)

---

**下一章：** [LLM 预训练与数据治理](./pretraining-data.md)
