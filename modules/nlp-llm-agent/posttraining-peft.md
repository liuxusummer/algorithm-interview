---
title: LLM 后训练与参数高效微调
description: 从 SFT、Reward Model、PPO-RLHF、DPO 到 LoRA、QLoRA，理解模型行为如何被数据和目标函数塑造。
---

# SFT、RLHF、DPO 与参数高效微调

后训练的目标不是简单“给模型增加知识”，而是把基础模型的生成分布调整为更符合任务、指令、偏好和安全要求的行为分布。

需要始终分开四件事：

- **知识是否存在**：预训练或外部检索；
- **任务格式是否学会**：SFT；
- **多个可行答案更偏好哪个**：偏好优化；
- **模型能否在环境中获得长期任务奖励**：Agent / Reasoning RL。

## 90 秒面试回答

SFT 使用高质量的指令—回答样本，继续最小化目标回答 Token 的交叉熵，让模型学会任务格式和示范行为。RLHF 通常先收集同一 Prompt 下的候选排序，用 Bradley–Terry 模型训练 Reward Model，再使用 PPO 等方法最大化奖励，同时用 KL 约束限制策略偏离参考模型。

DPO 利用 KL 正则化最优策略与奖励之间的闭式关系，把偏好学习改写为 chosen/rejected 对的二分类式目标，不需要显式训练 Reward Model，也不需要在线 PPO Rollout；但它仍依赖参考模型、偏好数据分布和超参数 $\beta$，也可能出现 chosen 概率下降、数据偏差和能力回归。

LoRA 冻结原权重，只学习低秩增量 $\Delta W=BA$；QLoRA 再把基础模型以 4-bit 量化形式加载，并通过量化权重反向传播到 Adapter。选择后训练方案时，应先明确要改变的是知识、格式、偏好还是环境策略，然后用能力、安全、风格、事实性、延迟和成本切片共同评估。

## 先画清后训练流水线

```text
基础模型
   │
   ├── SFT 数据：prompt → ideal response
   │       ↓
   │   指令模型 π_sft
   │
   ├── 偏好数据：(prompt, chosen, rejected)
   │       ↓
   │   Reward Model + PPO
   │          或
   │         DPO
   │
   └── 环境任务：state → action → reward
           ↓
       Agent / Reasoning RL
```

不同阶段的数据契约和评估不能混在一起。SFT 数据中的“标准答案”与偏好数据中的“相对更好”不是同一种监督信号。

## SFT：让模型学会示范行为

给定指令 $x$ 和目标回答 $y=(y_1,\ldots,y_T)$：

$$
\mathcal L_{\mathrm{SFT}}
=-\sum_{t=1}^{T}\log \pi_\theta(y_t\mid x,y_{<t})
$$

很多实现只对 Assistant Token 计算损失：

```text
system     user       assistant
 -100      -100       有效标签
```

这里 `-100` 是许多 Cross Entropy 实现的忽略索引，不是目标 Token ID。

### SFT 数据质量比数量更重要的原因

模型会学习：

- 是否遵循约束；
- 如何组织答案；
- 遇到不确定信息是否承认；
- 是否引用证据；
- 工具调用参数如何表达；
- 拒答和边界行为；
- 冗长、讨好或模板化风格。

混入相互冲突、事实错误、过度啰嗦或泄漏隐式答案的数据，会直接塑造模型行为。数据筛选应同时检查正确性、相关性、完整性、风格、多样性和安全性。

### 常见 SFT 失败

- Prompt 和 Completion 模板与线上不一致；
- 所有 Token 都计算损失，模型被迫复述系统和用户输入；
- 数据只覆盖成功案例，没有拒答、澄清和工具错误；
- 大量同质合成数据造成措辞坍缩；
- 领域数据过强，通用能力灾难性遗忘；
- 训练集有高质量长答案，评估却只测短答案准确率。

## Reward Model 与偏好数据

对同一 Prompt $x$ 的两个回答 $y_w$、$y_l$，若标注者偏好 $y_w$，Bradley–Terry 形式通常写为：

$$
P(y_w \succ y_l\mid x)
=\sigma\left(r_\phi(x,y_w)-r_\phi(x,y_l)\right)
$$

Reward Model 损失：

$$
\mathcal L_{\mathrm{RM}}
=-\log\sigma\left(r_\phi(x,y_w)-r_\phi(x,y_l)\right)
$$

它学习的是相对排序，不保证绝对分数跨数据集或版本可比较。

### 偏好数据的主要偏差

- 位置偏差：倾向选择第一个；
- 长度偏差：倾向更长、更完整的回答；
- 风格偏差：把流畅等同于正确；
- 权威口吻偏差；
- 标注者知识不足；
- 多个合理答案被强行二选一；
- 采样策略与目标模型分布不一致；
- 安全偏好压过任务能力，或反过来。

应使用随机交换位置、标注指南、资格测试、一致性样本、分歧保留和分领域分析，而不是只追求总一致率。

## PPO-RLHF 的核心约束

简化目标可以写成：

$$
\max_\theta\;
\mathbb E_{y\sim\pi_\theta(\cdot\mid x)}
\left[
r_\phi(x,y)
-\beta D_{\mathrm{KL}}
\left(\pi_\theta(\cdot\mid x)\Vert\pi_{\mathrm{ref}}(\cdot\mid x)\right)
\right]
$$

KL 约束防止策略为了钻 Reward Model 漏洞而远离基础能力。$\beta$ 太小可能 Reward Hacking 或语言退化，太大则模型几乎不改变。

PPO 还涉及：

- Policy、Reference、Reward、Value 模型；
- Rollout；
- Advantage 估计；
- Clipped Objective；
- 训练与采样分布变化；
- 较高的工程和显存复杂度。

面试中不应把 PPO 简化成“根据人工反馈更新模型”。要说明反馈先形成奖励信号，策略优化还需要限制更新幅度。

## DPO：不显式训练 Reward Model

DPO 使用参考模型 $\pi_{\mathrm{ref}}$ 和当前策略 $\pi_\theta$ 的对数概率差：

$$
\mathcal L_{\mathrm{DPO}}
=-\log\sigma\left(
\beta
\left[
\log\frac{\pi_\theta(y_w\mid x)}
{\pi_{\mathrm{ref}}(y_w\mid x)}
-
\log\frac{\pi_\theta(y_l\mid x)}
{\pi_{\mathrm{ref}}(y_l\mid x)}
\right]
\right)
$$

注意：

- 比较的是完整序列条件概率，实践中要处理长度与 Mask；
- 参考模型提供行为锚点；
- $\beta$ 控制偏离参考策略的强度；
- DPO 不等于“完全没有奖励假设”，它隐式利用偏好对应的奖励关系；
- 离线偏好数据与更新后策略可能产生分布偏移。

### Python：DPO 损失的核心

```python
import torch
import torch.nn.functional as functional


def dpo_loss(
    policy_chosen_log_probability: torch.Tensor,
    policy_rejected_log_probability: torch.Tensor,
    reference_chosen_log_probability: torch.Tensor,
    reference_rejected_log_probability: torch.Tensor,
    beta: float = 0.1,
) -> torch.Tensor:
    # 当前策略相对参考策略，对 chosen 增强了多少。
    chosen_log_ratio = (
        policy_chosen_log_probability
        - reference_chosen_log_probability
    )
    # 当前策略相对参考策略，对 rejected 增强了多少。
    rejected_log_ratio = (
        policy_rejected_log_probability
        - reference_rejected_log_probability
    )

    preference_margin = beta * (chosen_log_ratio - rejected_log_ratio)
    return -functional.logsigmoid(preference_margin).mean()
```

这里输入应是按有效回答 Token 聚合后的序列 Log Probability。到底使用求和还是长度归一化，需要与实现和任务长度偏差一起评估，不能悄悄改变口径。

## DPO 与 PPO 怎样选择

| 维度 | PPO-RLHF | DPO |
|---|---|---|
| 奖励模型 | 显式 | 不显式训练 |
| 在线采样 | 通常需要 | 经典 DPO 使用离线偏好对 |
| 工程复杂度 | 高 | 相对低 |
| 探索新策略 | 更自然 | 受离线数据覆盖限制 |
| 稳定性 | 对超参数和系统要求高 | 通常更容易训练 |
| 适合场景 | 有环境奖励、可持续采样 | 高质量离线偏好数据 |

不是所有偏好问题都应默认 DPO，也不是所有 Agent RL 都必须 PPO。应根据奖励是否可验证、是否需要探索、能否安全采样和数据覆盖决定。

## Reward Hacking 与 Goodhart 定律

当优化器直接追逐一个不完美指标时，模型可能学会指标漏洞：

- 用更长答案骗取完整性得分；
- 重复关键词骗取检索或分类器；
- 在代码任务中硬编码样例；
- 调用高权限工具绕过困难步骤；
- 生成看似有引用但不支持结论的文本；
- 让 Judge 偏好的模型风格替代真实正确性。

防御方法：

1. 使用多个互补 Grader；
2. 将关键约束写成可执行规则；
3. 保留隐藏测试和对抗集；
4. 监控奖励分数与真实业务指标的偏离；
5. 定期人工审查高奖励异常样本；
6. 更新数据时防止评测集泄漏。

## LoRA 的低秩假设

对原权重：

$$
W_0\in\mathbb R^{d_{\text{out}}\times d_{\text{in}}}
$$

LoRA 冻结 $W_0$，只学习：

$$
\Delta W=BA
$$

其中：

$$
A\in\mathbb R^{r\times d_{\text{in}}},
\quad
B\in\mathbb R^{d_{\text{out}}\times r},
\quad r\ll \min(d_{\text{in}},d_{\text{out}})
$$

前向：

$$
h=W_0x+\frac{\alpha}{r}BAx
$$

训练参数由 $d_{\text{out}}d_{\text{in}}$ 降为：

$$
r(d_{\text{in}}+d_{\text{out}})
$$

但要注意：LoRA 主要节省可训练参数、梯度和优化器状态；基础模型权重和激活仍需显存。

### Python：最小 LoRA Linear

```python
import math

import torch
from torch import nn


class LoRALinear(nn.Module):
    def __init__(
        self,
        base_linear: nn.Linear,
        rank: int,
        alpha: float,
    ):
        super().__init__()
        self.base_linear = base_linear
        self.rank = rank
        self.scale = alpha / rank

        # 冻结原权重，只训练低秩 A、B。
        for parameter in self.base_linear.parameters():
            parameter.requires_grad = False

        self.lora_a = nn.Parameter(
            torch.empty(rank, base_linear.in_features)
        )
        self.lora_b = nn.Parameter(
            torch.zeros(base_linear.out_features, rank)
        )

        nn.init.kaiming_uniform_(self.lora_a, a=math.sqrt(5))

    def forward(self, inputs: torch.Tensor) -> torch.Tensor:
        base_output = self.base_linear(inputs)
        low_rank_output = (inputs @ self.lora_a.T) @ self.lora_b.T
        return base_output + self.scale * low_rank_output
```

`B` 初始化为 0，使初始增量为 0，模型从原行为开始训练。生产实现还要处理 Dropout、合并权重、多 Adapter、量化层和分布式保存。

## QLoRA 为什么进一步省显存

QLoRA 的核心不是“把 LoRA 也量化”，而是：

- 基础模型使用 4-bit NormalFloat 存储；
- 计算时按需要反量化；
- 梯度流经量化基础模型，但只更新 LoRA；
- 使用 Double Quantization 降低量化常数开销；
- 使用 Paged Optimizer 缓解显存峰值。

需要区分：

- **训练量化**：为了低显存微调；
- **权重量化推理**：为了部署；
- **KV Cache 量化**：降低长上下文缓存；
- **量化感知训练和训练后量化**。

QLoRA 能省显存，不代表任何任务都与全量微调等价。需要用目标能力、遗忘、训练稳定性和部署约束验证。

## LoRA 应插入哪些层

常见候选：

- Attention 的 `q_proj`、`k_proj`、`v_proj`、`o_proj`；
- FFN 的 Gate、Up、Down Projection；
- Embedding 或输出层；
- 特定模态投影层。

插入范围越大，容量和训练成本越高。选择应基于任务、模型和消融实验，不要把某个开源配置当成普遍最优。

## 失败案例：DPO 胜率提高但模型更啰嗦

排查：

1. 偏好数据是否系统性偏爱长回答；
2. Judge 是否把详细程度误当正确性；
3. chosen/rejected 长度是否失衡；
4. 序列 Log Probability 是否采用了不同长度口径；
5. $\beta$ 是否导致过度偏离参考模型；
6. SFT 基线是否已经存在冗长风格；
7. 评估是否缺少简洁性、任务完成时间和成本指标。

修复可以包括平衡数据、明确标注标准、加入长度切片、改进 Grader、重新选择 $\beta$，而不是只在 System Prompt 中要求“简洁”。

## 失败案例：LoRA 训练 Loss 正常，线上无效果

常见原因：

- 线上没有加载正确 Adapter；
- Adapter 与基础模型版本不匹配；
- Chat Template 或 Tokenizer 不一致；
- 训练只学会格式，评估却期望新知识；
- 目标层选择不合适；
- Rank 太小或学习率不合适；
- 权重合并后量化误差过大；
- 线上路由将请求发给其他模型版本。

应把基础模型、Adapter、Tokenizer、模板和推理配置绑定为一个不可分割的发布版本。

## 常见误区

- **SFT 会可靠注入大量实时知识**：参数更新不是可追溯知识库，实时事实优先考虑 RAG；
- **DPO 一定优于 PPO**：取决于数据覆盖、环境奖励和探索需求；
- **DPO 不需要参考模型**：经典目标明确依赖参考策略；
- **Reward 越高越好**：代理指标会被优化和利用；
- **LoRA Rank 越大越好**：容量、过拟合和资源都需权衡；
- **LoRA 不增加推理延迟**：合并后通常没有额外分支；未合并、多 Adapter 动态路由仍有开销；
- **量化只影响显存，不影响质量**：校准、异常值、硬件内核和任务都会影响误差。

## 递进追问

### Q1：DPO 中 $\beta$ 的直觉是什么？

它控制偏好更新相对参考模型的强度。不同论文与代码可能使用相反的温度表述，面试时应先写出所采用的公式，再解释数值变化。

### Q2：什么时候应该用 RAG，而不是微调？

需要频繁更新、可引用、可删除的事实知识优先 RAG；需要稳定改变输出格式、领域语言或决策行为时考虑微调。生产系统常同时使用两者。

### Q3：怎样评估后训练没有造成能力回归？

除目标任务外保留通用能力、事实性、安全、拒答、长上下文、工具使用和不同语言切片；比较多个种子，并对高风险回归设置发布硬门禁。

### Q4：偏好标注者意见不一致怎么办？

先判断是标注指南不清、任务本身多解还是标注错误。可保留软标签或分歧信息，按人群和场景建模，而不是强行制造不存在的唯一答案。

## 自测

1. 写出 SFT、Reward Model 和 DPO 的目标函数；
2. 解释 PPO-RLHF 中 KL 的作用；
3. 说明 DPO 不需要显式 Reward Model 的推导直觉；
4. 列举三类偏好数据偏差；
5. 推导 LoRA 的参数量；
6. 解释 QLoRA 的 NF4、Double Quantization 和 Paged Optimizer；
7. 设计一次 LoRA Rank 与目标层的消融实验；
8. 给出 Reward Hacking 的检测方案。

## 权威资料

- [InstructGPT：Training language models to follow instructions](https://arxiv.org/abs/2203.02155)
- [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347)
- [Direct Preference Optimization](https://arxiv.org/abs/2305.18290)
- [LoRA](https://arxiv.org/abs/2106.09685)
- [QLoRA](https://arxiv.org/abs/2305.14314)
- [Training a Helpful and Harmless Assistant with RLHF](https://arxiv.org/abs/2204.05862)

---

**下一章：** [RAG 与搜索系统](./rag-search.md)
