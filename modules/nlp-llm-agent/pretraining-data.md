---
title: LLM 预训练与数据治理
description: 系统讲解自回归预训练目标、数据清洗去重、数据配比、污染控制、训练稳定性和实验归因。
---

# LLM 预训练与数据治理

大模型预训练不是“收集尽可能多的文本，然后跑 Cross Entropy”。模型、数据、算力和训练系统共同决定结果，而数据问题往往会被误诊为模型结构或优化器问题。

这一章重点回答：

- 下一个 Token 预测究竟优化什么；
- 数据为什么要经过来源、许可、清洗、去重、质量和污染治理；
- 怎样设计可复现的数据混合与训练实验；
- 训练 Loss 下降为什么不等于模型能力和产品质量提高。

## 90 秒面试回答

Decoder-only LLM 通常使用因果语言建模目标：给定前缀 $x_{<t}$，最大化真实 Token $x_t$ 的条件概率，等价于最小化全序列负对数似然：

$$
\mathcal{L}_{\mathrm{CLM}}
=-\sum_{t=1}^{T}\log p_\theta(x_t\mid x_{<t})
$$

训练质量不只由 Token 数决定，还受模型规模、有效数据质量、重复率、领域配比和算力预算影响。生产数据流水线应记录来源和许可，依次做格式解析、语言与质量过滤、PII/安全治理、精确及近似去重、Benchmark 污染检查、Tokenizer 编码、样本打包和版本冻结。

我会把数据、代码、Tokenizer、模型配置和评估集都版本化。每次实验只改变有限变量，既看验证 Loss，也看分领域能力、安全切片和污染敏感指标。训练中监控 Loss、梯度范数、学习率、吞吐、溢出、数据来源占比和重复采样。出现异常时先区分数据批次、数值稳定、分布式通信和硬件故障，而不是直接换模型结构。

## 自回归训练目标

对于 Token 序列：

$$
x_1,x_2,\ldots,x_T
$$

联合概率按链式法则分解：

$$
p(x_1,\ldots,x_T)
=\prod_{t=1}^{T}p(x_t\mid x_1,\ldots,x_{t-1})
$$

训练时通常把输入向右移动一位构造标签：

```text
输入：<bos>  今天  天气  很
标签：今天   天气  很    好
```

Padding、跨文档边界和不希望计算损失的位置需要使用 Label Mask。例如指令微调时，常只对 Assistant 回复计算损失；但预训练是否允许跨文档 Attention，需要结合打包策略明确设计。

### Perplexity 怎样理解

平均 Token Loss 为 $\bar{\mathcal L}$ 时：

$$
\operatorname{PPL}=\exp(\bar{\mathcal L})
$$

它可以理解为模型在当前 Tokenizer 和数据分布下的平均不确定性。不同 Tokenizer、语言和预处理的数据，PPL 不适合直接横向比较。

## 数据流水线

推荐把数据处理看成可审计的 DAG：

```text
来源登记
  → 许可与保留策略
  → 解析和编码修复
  → 语言/领域识别
  → 质量与安全过滤
  → PII 处理
  → 精确去重
  → 近似去重
  → Benchmark 污染检查
  → Tokenize 与打包
  → 数据混合
  → 冻结 Manifest
```

每条训练样本至少应能追溯：

- `source_id`：来源与采集批次；
- `document_id`：稳定文档标识；
- `license_policy`：许可与使用边界；
- `content_hash`：规范化内容哈希；
- `language`、`domain`、`quality_score`；
- 过滤器与规则版本；
- Tokenizer 版本；
- 是否命中敏感、污染或去重规则；
- 最终进入哪个训练数据版本。

只保存处理后的大文件而不保存 Manifest，会让删除请求、污染排查和实验复现变得非常困难。

## 清洗不是越狠越好

### 常见质量信号

- 字符和词的重复比例；
- 文本长度、句子长度与异常符号比例；
- 乱码、模板导航、广告和页面样板；
- 语言识别置信度；
- 代码能否解析；
- 文档结构完整性；
- 小模型或分类器给出的质量分；
- 来源级白名单或风险等级。

过滤过松会留下垃圾和重复；过滤过严则可能删除口语、方言、少数语言、代码边界样例与低资源领域。正确做法是保留来源和分数，通过分层评估确定阈值，而不是假设一个质量分类器适合所有领域。

## 精确去重与近似去重

### 精确去重

先规范化文本，再计算内容哈希。规范化规则必须版本化，因为大小写、空白、Unicode 和模板移除都会改变去重结果。

```python
import hashlib
import re
import unicodedata


def normalize_for_deduplication(text: str) -> str:
    normalized = unicodedata.normalize("NFKC", text)
    normalized = normalized.lower()
    normalized = re.sub(r"\s+", " ", normalized).strip()
    return normalized


def content_fingerprint(text: str) -> str:
    normalized = normalize_for_deduplication(text)
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def exact_deduplicate(documents: list[str]) -> list[str]:
    seen: set[str] = set()
    unique_documents: list[str] = []

    for document in documents:
        fingerprint = content_fingerprint(document)
        if fingerprint in seen:
            continue

        seen.add(fingerprint)
        unique_documents.append(document)

    return unique_documents
```

### 近似去重

网页转载、局部修改和模板文本无法被精确哈希识别。常见方案是：

1. 将文档转成字符或 Token Shingle；
2. 使用 MinHash 近似 Jaccard 相似度；
3. 用 LSH 找候选对；
4. 对候选做精确相似度核验；
5. 按来源质量、时间或许可规则选择保留版本。

近似去重的阈值会影响数据多样性。阈值太低可能把同主题但观点不同的文档错误合并，因此必须在不同语言和领域切片上抽样审查。

## Benchmark 污染

模型在测试集上得分高，可能因为训练数据包含题目、答案、翻译、解析或近似改写。

污染检测应覆盖：

- 完整题目精确匹配；
- 长 N-gram 或 Shingle 重叠；
- 规范化后匹配；
- 题目与标准答案同时出现；
- 翻译和格式变化；
- 时间切分：训练截止时间之后的新题；
- 可疑高置信记忆行为。

### Python：简单的 N-gram 重叠检查

```python
def token_ngrams(tokens: list[str], n: int) -> set[tuple[str, ...]]:
    if len(tokens) < n:
        return set()
    return {
        tuple(tokens[index:index + n])
        for index in range(len(tokens) - n + 1)
    }


def overlap_ratio(
    training_text: str,
    evaluation_text: str,
    n: int = 8,
) -> float:
    training_grams = token_ngrams(training_text.split(), n)
    evaluation_grams = token_ngrams(evaluation_text.split(), n)

    if not evaluation_grams:
        return 0.0

    overlap = training_grams & evaluation_grams
    return len(overlap) / len(evaluation_grams)
```

它只能作为候选筛查，不能作为完整污染证明。中文、代码和数学题需要对应的 Token 或字符策略；大规模数据还需要倒排、Bloom Filter 或 MinHash 等方案。

## 数据混合与采样

假设有通用网页、代码、数学、论文和多语言数据，直接按原始体量采样会让最大来源支配训练。常见做法包括：

- 按来源设置权重；
- 温度采样，压低大数据集、提高小数据集；
- 课程式训练，在不同阶段调整配比；
- 对高质量或目标领域数据进行有限重复；
- 对重复采样设置上限，避免过拟合。

数据混合必须回答：

1. 目标能力是什么；
2. 每个来源提供什么能力或风险；
3. 采样单位是文档、序列还是 Token；
4. 小数据集会被重复多少轮；
5. 混合改变后，哪些评估切片应当响应；
6. 是否损害其他语言、领域或安全能力。

“代码占比提高后 HumanEval 提升”不能单独证明因果，还需要控制总 Token、训练步数、学习率和数据质量，并观察非代码能力是否退化。

## Tokenize、Packing 与边界

为了减少 Padding 浪费，预训练常将多个短文档打包进固定长度序列。

需要明确：

- 文档之间是否加入 EOS；
- 跨文档 Token 是否可以互相 Attention；
- Loss 是否跨边界连续计算；
- 极长文档如何截断或滑窗；
- 多轮对话模板怎样编码；
- Packing 是否改变样本权重；
- 分布式 Worker 是否得到互斥且可复现的数据分片。

一个常见错误是只拼接 Token，却没有正确保存文档边界，导致模型学习到不自然的跨文档连续关系。

## 规模、算力与 Chinchilla 直觉

模型参数更多不代表在固定算力下更优。给定训练 FLOPs，应在模型规模与训练 Token 数之间平衡。Chinchilla 工作的重要启示是：许多早期大模型相对参数量训练不足。

面试时不必死背某个固定比例，因为数据质量、架构、Tokenizer 和训练策略都会改变最优点。更重要的是说明：

- 参数量增大提高模型容量；
- Token 增加提高数据覆盖；
- 两者都消耗算力；
- 固定预算下需要通过 Scaling 实验拟合趋势；
- 最终选择还受推理成本约束。

## 训练系统基础

### 混合精度

FP16、BF16 可以降低显存和提高吞吐。BF16 指数范围更大，通常更不容易溢出；FP16 常需要 Loss Scaling。优化器状态和主权重可能保留更高精度。

### 分布式并行

| 并行方式 | 划分对象 | 主要代价 |
|---|---|---|
| 数据并行 | 每卡不同数据，复制模型 | 梯度同步 |
| ZeRO/FSDP | 切分参数、梯度、优化器状态 | 通信和重建 |
| 张量并行 | 切分单层矩阵计算 | 高频设备间通信 |
| 流水线并行 | 不同层放在不同 Stage | Pipeline Bubble |
| 序列/上下文并行 | 切分长序列 | Attention 通信复杂 |

真正的大规模训练常组合多种并行方式。面试回答应从显存、通信拓扑、计算利用率和故障恢复分析，而不是只列名词。

## 训练稳定性与可观测性

至少监控：

- Train/Validation Loss；
- 分领域 Loss；
- 梯度范数与裁剪比例；
- 参数和激活的 NaN/Inf；
- 学习率、权重衰减；
- Token/s、MFU 或硬件利用率；
- Data Loader 等待时间；
- 通信耗时和 Straggler；
- 每个来源实际采样比例；
- Checkpoint 时间与恢复测试；
- 关键能力、安全和污染切片。

### Loss 突然尖峰怎样排查

```text
先定位时间和 Rank
  → 检查该批数据与长度
  → 检查学习率和优化器状态
  → 检查梯度、激活和混合精度溢出
  → 检查通信、坏卡和 Checkpoint 恢复
  → 最后再判断是否需要修改模型或优化器
```

如果尖峰总出现在特定来源或超长样本，优先修数据；如果只有单个 Rank 出现 NaN，优先查硬件、通信或分片；如果所有 Rank 在学习率变化点同时异常，再查优化配置。

## 实验怎样做出因果归因

一次可信实验至少固定或记录：

- 数据 Manifest 与混合权重；
- Tokenizer 和 Chat Template；
- 初始化 Checkpoint；
- 模型结构；
- 优化器、学习率和 Batch；
- 随机种子与并行配置；
- 训练 Token 与总 FLOPs；
- 评估版本；
- 代码与环境版本。

只比较两个最终 Checkpoint，而训练 Token、数据和超参数都不同，无法判断提升来自哪里。

建议先运行小规模 Scaling 或消融实验：

1. 写出可证伪假设；
2. 选择会响应这个假设的评估切片；
3. 用多个种子或重复运行估计方差；
4. 同时观察目标能力和回归能力；
5. 再决定是否投入完整训练。

## 失败案例：验证 Loss 降低，问答效果变差

可能原因：

- 验证集与真实问答分布不一致；
- 重复数据让 Token 预测更容易，却降低多样性；
- 某一大来源支配了混合；
- 评估数据被污染；
- Tokenizer 或模板与下游使用不一致；
- 基础语言建模改善，但指令遵循需要后训练；
- 长答案概率更高，但事实性或拒答能力变差。

排查时应比较分领域 Loss、数据来源权重、重复率、指令评估、事实性和安全切片，而不是只盯总 Loss。

## 常见误区

- **数据越多越好**：低质量、重复、污染和无授权数据都会产生代价；
- **训练 Loss 越低，产品越好**：Loss 只描述训练目标和相应分布；
- **去重只为节省算力**：它还影响记忆、泛化、隐私和评测可信度；
- **一个质量分类器可以处理所有语言**：阈值和偏差需要分语言验证；
- **随机种子固定就完全可复现**：分布式执行、内核和硬件仍可能非确定；
- **Checkpoint 能加载就说明恢复正确**：还要验证数据游标、优化器、随机状态和全局步数。

## 递进追问

### Q1：为什么训练数据需要记录许可和删除链路？

因为后续可能需要审计来源、响应删除要求、排查隐私或污染。没有文档级谱系，只能重建整个数据集和模型，治理成本会非常高。

### Q2：过度去重有什么风险？

会删除合法重复结构、少数观点和有用练习，改变领域分布。应在不同语言与来源切片抽查，并通过下游能力评估阈值。

### Q3：怎样判断模型是在推理还是记忆测试答案？

没有单一完美方法。可以结合时间切分、污染匹配、题目改写、变量替换、反事实版本和过程一致性测试，观察模型是否能迁移规则。

### Q4：为什么数据配比是优化问题而不是固定经验值？

每种数据的边际收益、质量、重复率和目标能力不同；模型规模与训练阶段也会改变收益。应通过小规模实验和能力切片寻找 Pareto 取舍。

## 自测

1. 推导因果语言模型的负对数似然目标；
2. 解释 PPL 为什么不能跨 Tokenizer 直接比较；
3. 画出训练数据的完整可审计流水线；
4. 比较精确去重与 MinHash 近似去重；
5. 给出三种 Benchmark 污染形式；
6. 解释 Packing 怎样造成跨文档污染；
7. 分析一次 Loss Spike 的排查顺序；
8. 说明怎样设计一次数据配比消融实验。

## 权威资料

- [Scaling Laws for Neural Language Models](https://arxiv.org/abs/2001.08361)
- [Training Compute-Optimal Large Language Models（Chinchilla）](https://arxiv.org/abs/2203.15556)
- [Deduplicating Training Data Makes Language Models Better](https://arxiv.org/abs/2107.06499)
- [The Pile：An 800GB Dataset of Diverse Text](https://arxiv.org/abs/2101.00027)
- [ROOTS Corpus](https://arxiv.org/abs/2303.03915)
- [PyTorch FSDP 官方文档](https://pytorch.org/docs/stable/fsdp.html)

---

**下一章：** [SFT、RLHF、DPO 与参数高效微调](./posttraining-peft.md)
