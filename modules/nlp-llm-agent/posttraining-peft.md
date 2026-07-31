---
title: LLM 后训练与参数高效微调
description: 从 SFT、Reward Model、PPO、DPO、GRPO 与可验证奖励，到 LoRA、QLoRA 和推理蒸馏，理解模型行为如何被数据和目标函数塑造。
---

# SFT、偏好优化、推理 RL 与参数高效微调

后训练的目标不是简单“给模型增加知识”，而是把基础模型的生成分布调整为更符合任务、指令、偏好和安全要求的行为分布。

需要始终分开四件事：

- **知识是否存在**：预训练或外部检索；
- **任务格式是否学会**：SFT；
- **多个可行答案更偏好哪个**：偏好优化；
- **模型能否在环境中获得长期任务奖励**：Agent / Reasoning RL。

## 90 秒面试回答

SFT 使用高质量的指令—回答样本，继续最小化目标回答 Token 的交叉熵，让模型学会任务格式和示范行为。RLHF 通常先收集同一 Prompt 下的候选排序，用 Bradley–Terry 模型训练 Reward Model，再使用 PPO 等方法最大化奖励，同时用 KL 约束限制策略偏离参考模型。

DPO 利用 KL 正则化最优策略与奖励之间的闭式关系，把偏好学习改写为 chosen/rejected 对的二分类式目标，不需要显式训练 Reward Model，也不需要在线 PPO Rollout；但它仍依赖参考模型、偏好数据分布和超参数 $\beta$，也可能出现 chosen 概率下降、数据偏差和能力回归。

推理任务若能由答案检查器、编译器、单元测试或形式化验证器给出可靠奖励，可以使用 RL with Verifiable Rewards。GRPO 对同一 Prompt 采样一组回答，用组内相对奖励代替单独训练 Value Model，但会增加 Rollout 成本，并且仍会受到奖励漏洞、低方差组和策略坍缩影响。DeepSeek-R1、Kimi k1.5 与 Qwen3 的共同经验不是“纯 RL 取代一切”，而是冷启动数据、在线探索、可靠奖励、长短推理控制和蒸馏的组合。

LoRA 冻结原权重，只学习低秩增量 $\Delta W=BA$；QLoRA 再把基础模型以 4-bit 量化形式加载，并通过量化权重反向传播到 Adapter。选择后训练方案时，应先明确要改变的是知识、格式、偏好、可验证推理还是环境策略，然后用能力、安全、风格、事实性、延迟和成本切片共同评估。

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
   ├── 可验证任务：prompt → rollout → checker reward
   │       ↓
   │   GRPO / 其他在线策略优化
   │
   └── 环境任务：state → action → observation → reward
           ↓
       Agent RL
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

## 现代推理后训练：GRPO、RLVR 与长推理

偏好对齐主要回答“多个可接受答案中，人更喜欢哪个”；推理强化学习则更关心“模型能否通过探索，找到以前不会的正确解法”。两者可能使用相似的策略优化工具，但奖励来源、数据生成和评估方式不同。

### 先分清四类监督信号

| 信号 | 示例 | 优点 | 主要风险 |
|---|---|---|---|
| 示范 Token | 人工或教师生成的标准解答 | 稳定、训练简单 | 只能模仿数据覆盖的轨迹 |
| 偏好排序 | chosen / rejected | 能学习风格和综合偏好 | 标注偏差、长度偏差 |
| 可验证结果奖励 | 答案检查、编译、单测、Lean Checker | 低歧义、可规模化 | 奖励稀疏、检查器漏洞 |
| 学习型奖励 | Reward Model、Process RM、LLM Judge | 能评价开放任务 | Reward Hacking、版本漂移 |

RLVR 是 **Reinforcement Learning with Verifiable Rewards**。常见验证器包括：

- 数学答案的规范化匹配或符号计算；
- 代码编译、隐藏单元测试和资源限制；
- 形式化证明内核；
- 结构化输出 Schema 与确定性业务不变量；
- Agent 环境中的真实状态变化和任务完成条件。

“可验证”不等于“奖励设计已经正确”。例如公开样例可能被硬编码，浮点答案可能被宽松匹配，代码可能读取测试数据，Agent 可能通过高权限动作绕过任务。验证器本身也是安全边界，需要隐藏测试、沙箱、超时、反作弊和版本化。

### GRPO 为什么不需要单独的 Value Model

对同一个 Prompt $x$，从旧策略采样 $G$ 个回答：

$$
o_1,\ldots,o_G\sim\pi_{\theta_{\mathrm{old}}}(\cdot\mid x)
$$

得到奖励 $r_1,\ldots,r_G$ 后，用组内均值和标准差构造相对 Advantage：

$$
\hat A_i=
\frac{r_i-\operatorname{mean}(r_1,\ldots,r_G)}
{\operatorname{std}(r_1,\ldots,r_G)+\epsilon}
$$

再使用类似 PPO 的概率比率裁剪：

$$
\rho_{i,t}(\theta)=
\frac{\pi_\theta(o_{i,t}\mid x,o_{i,<t})}
{\pi_{\theta_{\mathrm{old}}}(o_{i,t}\mid x,o_{i,<t})}
$$

$$
\mathcal J_{\mathrm{GRPO}}
\approx
\frac{1}{G}
\sum_i\frac{1}{|o_i|}
\sum_t
\min\left(
\rho_{i,t}\hat A_i,
\operatorname{clip}(\rho_{i,t},1-\varepsilon,1+\varepsilon)\hat A_i
\right)
-\beta D_{\mathrm{KL}}(\pi_\theta\Vert\pi_{\mathrm{ref}})
$$

组内相对分数充当 Baseline，因此原始 GRPO 不需要像 PPO 那样训练与 Policy 同量级的 Critic/Value Model，显存和系统组件更少。[DeepSeekMath 论文](https://arxiv.org/abs/2402.03300)

但“没有 Value Model”不等于训练便宜：

- 每个 Prompt 必须采样多个 Rollout；
- 长 CoT 使生成 Token 数迅速增加；
- 一组回答奖励完全相同时，归一化后几乎没有学习信号；
- 组大小太小，Advantage 方差大；组太大，采样昂贵；
- 旧策略、当前策略和参考策略的版本必须严格绑定；
- 异步 Rollout 会引入策略陈旧，需要控制 Staleness。

### Python：理解组内相对 Advantage

```python
import torch


def group_relative_advantages(
    rewards: torch.Tensor,
    epsilon: float = 1e-6,
) -> torch.Tensor:
    """rewards 的形状是 [batch_size, group_size]。"""
    group_mean = rewards.mean(dim=-1, keepdim=True)
    group_std = rewards.std(dim=-1, keepdim=True, unbiased=False)

    # 同一个 Prompt 内只比较相对好坏，减少不同题目奖励尺度的影响。
    advantages = (rewards - group_mean) / (group_std + epsilon)

    # 如果整组奖励相同，标准化结果接近 0，这组样本几乎不提供梯度。
    return advantages
```

生产训练还需要 Token Mask、Importance Ratio、Clip、KL、分布式 Rollout、奖励聚合和异常样本处理。这个示例只用于解释“组内相对 Baseline”，不能冒充完整 GRPO 实现。

### PPO、GRPO 与 DPO 的选择

| 维度 | PPO | GRPO | DPO |
|---|---|---|---|
| 数据 | 在线 Rollout | 同 Prompt 的分组在线 Rollout | 离线偏好对 |
| Value/Critic | 通常需要 | 原始方案不需要 | 不需要 |
| 显式 Reward | 通常需要 | 需要规则或学习型奖励 | 不显式训练 |
| 探索新解法 | 强 | 强 | 受离线数据覆盖限制 |
| 主要成本 | 多模型与在线采样 | 多回答采样、长 CoT | 偏好数据与参考模型前向 |
| 典型场景 | 综合偏好、环境策略 | 数学、代码、可验证推理 | 离线偏好对齐 |

算法名称不是选型起点。真正的决策顺序是：

1. 输出或环境状态能否可靠验证；
2. 是否需要模型探索数据集中没有的新轨迹；
3. Rollout 是否安全、可并行且成本可接受；
4. 奖励是否容易被钻空子；
5. 是否需要学习长期信用分配，而不只是最终答案；
6. 目标是提升能力，还是改变表达偏好。

### DeepSeek-R1：纯 RL 是研究对照，不是完整生产配方

DeepSeek-R1-Zero 直接在 Base Model 上进行大规模 RL，没有先做 SFT，观察到了自检、反思和更长推理等行为；同时也出现可读性差和语言混杂。完整 DeepSeek-R1 因此采用多阶段流程：

```text
少量高质量长 CoT 冷启动
  → 面向数学、代码、科学与逻辑的 Reasoning RL
  → Rejection Sampling 生成新 SFT 数据
  → 通用能力 SFT
  → 同时兼顾推理与人类偏好的第二阶段 RL
```

这说明 R1-Zero 证明的是“可靠奖励可以激励推理行为”，不是“所有模型都应删除 SFT”。冷启动数据负责可读格式和初始行为分布，RL 负责探索，后续 SFT 与对齐阶段负责恢复通用性和用户体验。[DeepSeek-R1 论文](https://arxiv.org/abs/2501.12948)

DeepSeek-R1 还报告：在其 32B 实验中，从强教师蒸馏推理数据，比直接在同规模 Base Model 上做大规模 RL 更有效。正确结论不是“蒸馏永远胜过 RL”，而是：

- 小模型可以经济地学习强模型已经发现的推理模式；
- 蒸馏主要转移已有轨迹，难以独立突破教师能力边界；
- 大模型和在线 RL 更适合探索新策略，但成本更高；
- 蒸馏数据必须做正确性验证、去重和难度分层。

### Kimi k1.5：长上下文也是 RL 的扩展轴

Kimi k1.5 将 RL Context 扩展到 128K，并通过复用旧轨迹前缀的 Partial Rollout 降低重新生成成本。它采用改进的在线策略优化、采样策略、长度惩罚和数据配方，在不依赖 Value Function、Process Reward Model 和 MCTS 的情况下训练长 CoT。

值得记住的不是某个榜单分数，而是两个工程结论：

1. 长 CoT 的主要训练成本来自 Rollout，必须优化轨迹复用、调度和生成吞吐；
2. “思考更长”可能提升探索，也会导致 Overthinking，因此需要长度奖励、难度切片和效率指标。

其 Long2Short 方法还展示了从长推理模型向短推理模型转移能力的思路，例如使用长度惩罚、长 CoT 激活信息和模型合并；目标是在保留能力的同时降低推理 Token 与延迟。[Kimi k1.5 论文](https://arxiv.org/abs/2501.12599)

### Qwen3：把 Thinking 与 Non-Thinking 合并

Qwen3 将长 CoT 冷启动、Reasoning RL、Thinking Mode Fusion 和通用 RL 组织为多阶段后训练，并用 `/think`、`/no_think` 等模板信号统一思考与非思考模式。Thinking Budget 让推理计算成为可控制资源，而不是每个问题都固定生成很长过程。[Qwen3 技术报告](https://arxiv.org/abs/2505.09388)

面试中应主动指出：

- Thinking Token 更多不保证答案更正确；
- 预算应随题目难度、风险和剩余延迟动态分配；
- 评估必须同时报告准确率、平均推理 Token、P95 延迟与单位正确答案成本；
- 不能把用户可见的长解释直接等同于模型内部决策的忠实因果证明。

### 推理 RL 的训练与发布门禁

**训练侧至少监控：**

- Reward Mean、Std、分位数和各奖励分量；
- 每组全对、全错、奖励同值的比例；
- KL、Clip Fraction、Entropy、梯度范数；
- Response Length、有效 Token、截断率；
- Rollout 吞吐、策略 Staleness、验证器失败率；
- 不同题型、语言、难度和答案格式切片。

**发布侧至少比较：**

- Pass@1 与固定采样预算下的 Pass@k；
- 数学、代码、科学、通用问答和安全能力回归；
- 长度控制后的准确率；
- 重复推理、虚假自检、语言混杂和格式退化；
- 推理 Token、TTFT、TPOT 与单位正确答案成本；
- 隐藏测试、污染检查和对抗性验证器测试。

只看训练 Reward 或 AIME 一类单项指标，无法证明模型已经获得可泛化、可部署的推理能力。

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
- **GRPO 就是没有 Critic 的廉价 PPO**：它省掉 Value Model，却需要同 Prompt 多次 Rollout，长推理下采样可能才是最大成本；
- **结果奖励正确就不需要过程约束**：验证器可能有漏洞，稀疏结果奖励也难以定位错误步骤；
- **R1-Zero 证明 SFT 已经过时**：R1-Zero 是展示纯 RL 涌现的研究对照，完整 R1 使用冷启动和多阶段 SFT/RL；
- **CoT 越长推理越强**：长轨迹增加搜索空间，也可能重复、绕路和钻长度奖励；
- **蒸馏等于让小模型复现大模型全部推理能力**：蒸馏主要转移教师已生成且被筛选的模式，仍受容量、数据与教师边界限制；
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

### Q5：GRPO 为什么要同一 Prompt 采样一组回答？

组内回答共享题目难度，可以用相对奖励估计 Baseline，而不单独训练 Value Model。若整组全对或全错，奖励方差接近 0，几乎没有区分信号；因此 Prompt 难度、组大小和采样温度都会影响训练效率。

### Q6：什么时候更适合 RLVR，而不是 DPO？

当正确性可以由可靠程序验证，而且目标是通过在线探索发现新解法时，RLVR 更合适。若任务主要是语气、帮助性或多个合理答案之间的偏好，DPO 或 Reward Model 更自然。开放式任务不能因为 Judge 能打分就假装已经“可验证”。

### Q7：为什么小模型通常先考虑蒸馏，而不是直接复刻大规模 RL？

小模型的探索能力和容量有限，而在线 RL Rollout 昂贵。蒸馏先提供经过验证的强轨迹，通常更具样本效率；之后仍可在模型能力边界附近做小规模 RL。必须保留独立测试，避免学生只模仿教师措辞。

## 自测

1. 写出 SFT、Reward Model 和 DPO 的目标函数；
2. 解释 PPO-RLHF 中 KL 的作用；
3. 说明 DPO 不需要显式 Reward Model 的推导直觉；
4. 列举三类偏好数据偏差；
5. 推导 LoRA 的参数量；
6. 解释 QLoRA 的 NF4、Double Quantization 和 Paged Optimizer；
7. 设计一次 LoRA Rank 与目标层的消融实验；
8. 给出 Reward Hacking 的检测方案。
9. 写出 GRPO 组内 Advantage，并解释全组同分会发生什么；
10. 比较 PPO、GRPO、DPO 的数据来源、探索能力和主要系统成本；
11. 为代码 RL 设计一个防止读取测试数据和硬编码样例的验证器；
12. 解释 DeepSeek-R1-Zero 与完整 DeepSeek-R1 训练流程的区别；
13. 设计 Long-CoT 到 Short-CoT 的质量、长度和延迟联合评估；
14. 说明为什么用户可见 CoT 不能直接作为忠实因果解释。

## 权威资料

- [InstructGPT：Training language models to follow instructions](https://arxiv.org/abs/2203.02155)
- [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347)
- [Direct Preference Optimization](https://arxiv.org/abs/2305.18290)
- [DeepSeekMath：Group Relative Policy Optimization](https://arxiv.org/abs/2402.03300)
- [DeepSeek-R1：Reasoning RL、冷启动与蒸馏](https://arxiv.org/abs/2501.12948)
- [Kimi k1.5：Scaling Reinforcement Learning with LLMs](https://arxiv.org/abs/2501.12599)
- [Qwen3 Technical Report](https://arxiv.org/abs/2505.09388)
- [LoRA](https://arxiv.org/abs/2106.09685)
- [QLoRA](https://arxiv.org/abs/2305.14314)
- [Training a Helpful and Harmless Assistant with RLHF](https://arxiv.org/abs/2204.05862)

---

**下一章：** [RAG 与搜索系统](./rag-search.md)
