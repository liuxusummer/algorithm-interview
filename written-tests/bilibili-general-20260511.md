---
pageClass: exam-session-page
title: 哔哩哔哩通用岗 2026-05-11
description: 哔哩哔哩 2026-05-11 通用岗笔试真题，含 2 道 Python ACM 模式题解
---

<div class="exam-session-banner">
  <div>
    <span>BILIBILI / 2026.05.11 / ACM</span>
    <strong>哔哩哔哩 · 通用岗</strong>
    <small>2026-05-11 · 2 题 ACM · 难度 中等</small>
  </div>
  <div class="exam-session-banner__meta">
    <span>贪心 + 大根堆</span>
    <span>感知机批量梯度下降 / NumPy 向量化</span>
  </div>
</div>

# 哔哩哔哩 2026-05-11 通用岗笔试解析

本场统一整理为完整 Python 3 ACM 程序。每题保留标准输入输出、建模过程、正确性依据、复杂度、易错点和关键中文注释；原 SQL、Shell 与第三方机器学习库题也已改写为可独立运行的标准库版本。

来源：[Zero2Leetcode · 哔哩哔哩 2026-05-11 通用岗](https://onefly.top/zero2Leetcode/04_real_interviews/bilibili/general-20260511/)。

## 本场考试概述

**考试时间**：2026年5月11日
**考试岗位**：通用
**难度评级**：中等

**考点分析**：

1. 第一题：贪心 + 大根堆（难度中等）
2. 第二题：感知机批量梯度下降 / Python 标准库 向量化（难度中等）

**建议策略**：

1. 第一题是经典"任务分配 + 大根堆"贪心，按金币升序、房子按价格升序排好，逐人取堆顶
2. 第二题考察 ML 基础功，重点在于从损失函数推导梯度更新公式，注意是"批量"更新而非"随机"更新

---

## 01 · 房屋购买匹配优化 {#problem-01}

### 题目描述

有 $n$ 个朋友和 $m$ 个房子。每个朋友有一定数量的金币，每个房子有舒适度和价格两个属性。当一个人的金币大于等于房子的价格时才能购买，且满足：一人至多买一房，一房至多被一人买。求所有朋友购买房子的舒适度之和最大值。

### 样例

**输入**

```
2 2
2 2
2 2
2 2
```

**输出**

```
4
```

**输入**

```
3 4
5 3 8
6 4
3 2
4 5
7 7
```

**输出**

```
16
```

### 解题思路

**第一步：观察题目性质**

每个朋友只能买"价格不超过自己金币"的房子中的一个，要求舒适度之和最大。这是一个典型的二部图匹配优化问题。

**第二步：贪心策略**

金币少的朋友可选范围最小，如果后面金币多的朋友"抢"了便宜且舒适度高的房子，前面的朋友就无房可选。因此按金币从小到大处理每个朋友。

对于当前朋友，把所有他买得起的房子都加入候选集，然后从中选舒适度最大的那个——用大根堆维护候选集即可。

**第三步：正确性（交换论证）**

假设贪心给朋友 $i$ 分配了堆顶房子（舒适度最大），而某个最优解让他拿了更差的房子。把两者互换后，由于后续朋友金币更多（约束更宽松），交换不会破坏可行性，且总舒适度不降。

**第四步：实现要点**

- 金币排序后，用双指针把价格 $\leq$ 当前金币的房子逐个入堆
- Python 的 heapq 是小根堆，存负数模拟大根堆

### 正确性依据

上述状态、枚举或贪心不变量保留了决定后续结果的全部信息；每个合法选择都被覆盖且不会重复计数。按处理顺序归纳，程序得到的最终状态与题目目标等价。

### Python ACM 实现

下面给出完整标准输入、标准输出程序，可直接在 Python 3 ACM 环境运行。

```python
# 核心步骤：贪心 + 大根堆；严格按题面处理边界并输出结果。
import sys
import heapq

input = sys.stdin.readline

def solve():
    n, m = map(int, input().split())
    coins = list(map(int, input().split()))
    houses = []
    for _ in range(m):
        a, p = map(int, input().split())
        houses.append((p, a))

    coins.sort()
    houses.sort()

    heap = []
    ans = 0
    j = 0
    for money in coins:
        while j < m and houses[j][0] <= money:
            heapq.heappush(heap, -houses[j][1])
            j += 1
        if heap:
            ans += -heapq.heappop(heap)

    print(ans)

solve()
```

### 易错点

- 严格区分题面中的“严格大于/不小于”、开闭区间与下标起点。
- 多组测试时必须重置状态；大规模累加按题面需要使用 Python 整数或取模。

### 复杂度分析

**时间复杂度**：$O((n + m) \log m)$，排序 $O(n \log n + m \log m)$，每个房子至多入堆出堆各一次
**空间复杂度**：$O(n + m)$

---

## 02 · 感知机梯度下降实现 {#problem-02}

### 题目描述

给定二维训练数据集，二分类标签取值 $\{+1, -1\}$，使用感知机进行二分类。损失函数定义为误分类点到超平面的总距离（去掉 $\frac{1}{\lVert w \rVert}$ 系数）：

$$L(w, b) = -\sum_{x_i \in M} y_i(w \cdot x_i + b)$$

其中 $M$ 为误分类样本集合。请使用批量梯度下降法完成对 $w, b$ 的参数更新。

### 样例

**输入**

```
[[(1,2),1],[(3,4),-1]]
[20,0.1]
```

**输出**

```
[-0.5, 0.2, 0.7]
```

### 解题思路

**第一步：理解损失函数和梯度**

损失函数 $L = -\sum_{x_i \in M} y_i(w \cdot x_i + b)$，对 $w$ 和 $b$ 分别求偏导：

$$\frac{\partial L}{\partial w} = -\sum_{x_i \in M} y_i x_i, \quad \frac{\partial L}{\partial b} = -\sum_{x_i \in M} y_i$$

梯度下降更新规则为参数减去学习率乘以梯度，负号抵消后：

$$w \leftarrow w + \eta \sum_{x_i \in M} y_i x_i, \quad b \leftarrow b + \eta \sum_{x_i \in M} y_i$$

**第二步：区分批量与随机梯度下降**

题目要求**批量梯度下降**：每轮先遍历所有样本，把误分类样本的梯度全部累加，再统一更新一次参数。这与随机梯度下降（每碰到一个误分类样本就立刻更新）在数值结果上不同。

**第三步：误分类判定**

对样本 $(x_i, y_i)$，若 $y_i(w \cdot x_i + b) \leq 0$ 则为误分类。

**第四步：向量化实现**

把样本组织成矩阵，用 Python 标准库 一次性计算所有判别值和布尔掩码，避免逐样本循环。

### 正确性依据

上述状态、枚举或贪心不变量保留了决定后续结果的全部信息；每个合法选择都被覆盖且不会重复计数。按处理顺序归纳，程序得到的最终状态与题目目标等价。

### Python ACM 实现

下面给出完整标准输入、标准输出程序，可直接在 Python 3 ACM 环境运行。

```python
import ast


def solve():
    samples = ast.literal_eval(input().strip())
    epochs, learning_rate = ast.literal_eval(input().strip())
    dimension = len(samples[0][0])
    weights = [0.0] * dimension
    bias = 0.0

    for _ in range(epochs):
        gradient_w = [0.0] * dimension
        gradient_b = 0.0
        for features, label in samples:
            score = sum(w * x for w, x in zip(weights, features)) + bias
            if label * score <= 0:
                # 批量梯度：先累计本轮全部误分类样本，再统一更新。
                for index, value in enumerate(features):
                    gradient_w[index] += label * value
                gradient_b += label

        for index in range(dimension):
            weights[index] += learning_rate * gradient_w[index]
        bias += learning_rate * gradient_b

    answer = [round(value, 3) for value in weights]
    answer.append(round(bias, 3))
    print(answer)


solve()
```

### 易错点

- 严格区分题面中的“严格大于/不小于”、开闭区间与下标起点。
- 多组测试时必须重置状态；大规模累加按题面需要使用 Python 整数或取模。

### 复杂度分析

**时间复杂度**：$O(T \cdot n)$，$T$ 为迭代次数，$n$ 为样本数
**空间复杂度**：$O(n)$

---

## 小结

- 第一题是经典的"排序 + 堆"贪心匹配，核心在于按金币升序处理、双指针入堆、贪心取堆顶
- 第二题考察 ML 基础，关键是理解批量梯度下降与随机梯度下降的区别，以及从损失函数正确推导更新公式
