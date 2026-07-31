---
title: NLP 与 Transformer 基础
description: 从 Tokenization、Embedding、Attention、位置编码和归一化，建立 NLP 与大语言模型算法岗的共同底座。
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

## 自测

1. 不看页面写出 Scaled Dot-Product Attention 公式，并标出每个张量形状；
2. 解释为什么 Mask 必须在 Softmax 前进入 Logit；
3. 比较 BPE、WordPiece 和 Unigram；
4. 解释 Pre-LN、Post-LN 的结构差异；
5. 说明 MHA、MQA、GQA 对 KV Cache 的影响；
6. 分别给出训练阶段和推理阶段的并行边界；
7. 说明为什么 FlashAttention 不是稀疏 Attention。

## 权威资料

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [BERT：Pre-training of Deep Bidirectional Transformers](https://arxiv.org/abs/1810.04805)
- [SentencePiece](https://arxiv.org/abs/1808.06226)
- [RoFormer：Rotary Position Embedding](https://arxiv.org/abs/2104.09864)
- [GQA：Training Generalized Multi-Query Transformer Models](https://arxiv.org/abs/2305.13245)
- [FlashAttention](https://arxiv.org/abs/2205.14135)

---

**下一章：** [LLM 预训练与数据治理](./pretraining-data.md)
