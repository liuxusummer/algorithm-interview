---
pageClass: exam-session-page
title: 携程算法岗 2026-04-23
description: 携程 2026-04-23 算法岗笔试真题，含 4 道 Python ACM 模式题解
---

<div class="exam-session-banner">
  <div>
    <span>CTRIP / 2026.04.23 / ACM</span>
    <strong>携程 · 算法岗</strong>
    <small>2026-04-23 · 4 题 ACM · 难度 中等偏难</small>
  </div>
  <div class="exam-session-banner__meta">
    <span>奇偶性分析</span>
    <span>区间覆盖推导 / 数学思维</span>
    <span>KNN 元学习 + LogisticRegression</span>
    <span>并查集 + 倍数筛</span>
  </div>
</div>

# 携程 2026-04-23 算法岗笔试解析

本场统一整理为完整 Python 3 ACM 程序。每题保留标准输入输出、建模过程、正确性依据、复杂度、易错点和关键中文注释；原 SQL、Shell 与第三方机器学习库题也已改写为可独立运行的标准库版本。

来源：[Zero2Leetcode · 携程 2026-04-23 算法岗](https://onefly.top/zero2Leetcode/04_real_interviews/ctrip/algo-20260423/)。

## 本场考试概述

**考试时间**：2026年4月23日
**考试岗位**：算法岗
**难度评级**：中等偏难

**考点分析**：

1. 第一题：奇偶性分析（难度简单）
2. 第二题：区间覆盖推导 / 数学思维（难度中等）
3. 第三题：KNN 元学习 + LogisticRegression（难度中等）
4. 第四题：并查集 + 倍数筛（难度困难）

**建议策略**：

- 第一、二题为纯思维题，优先完成，争取满分
- 第三题熟悉 纯 Python 基本流程即可快速 AC，按题意四步实现
- 第四题并查集 + 调和级数枚举是经典套路，时间充裕再攻克

---

## 01 · 炒鸡回文构造 {#problem-01}

### 题目描述

定义一个长度为 $n$ 的数组 $a$ 是回文数组，当且仅当对于任意 $i$ 都有 $a_i = a_{n+1-i}$。

给定一个正整数长度 $n$，判断：对于所有满足 $m \geq n$ 的正整数 $m$，是否都存在一个长度为 $n$ 的回文数组，使其所有元素均为正整数且元素之和恰好等于 $m$。

如果满足条件，输出 `Yes`；否则，输出 `No`。

输入格式：第一行一个整数 $T$ 表示数据组数，此后每组一行一个整数 $n$。$n$ 可达 $10^9$。

输出格式：每组数据输出 `Yes` 或 `No`。

### 样例

**输入**

```
4
1
2
1000000000
999999999
```

**输出**

```
Yes
No
No
Yes
```

### 解题思路

**第一步：观察回文数组的结构**

回文数组满足 $a_i = a_{n+1-i}$，因此元素天然成对出现。当 $n$ 为偶数时恰好有 $n/2$ 对，当 $n$ 为奇数时有 $(n-1)/2$ 对再加一个中心元素。

**第二步：分析总和的奇偶性**

- **偶数长度**：所有元素严格成对，总和 $= 2 \times (\text{各对之和})$，永远是偶数。但 $m$ 可以是奇数（例如 $m = n + 1$），所以无法覆盖所有 $m \geq n$，答案是 `No`。
- **奇数长度**：把每一对都设为 $1$（贡献 $n - 1$），中心元素设为 $m - (n - 1)$。只要 $m \geq n$，中心元素 $\geq 1$，是合法正整数。因此任意 $m \geq n$ 都可构造，答案是 `Yes`。

**结论**：$n$ 为奇数输出 `Yes`，$n$ 为偶数输出 `No`。

### 正确性依据

上述状态、枚举或贪心不变量保留了决定后续结果的全部信息；每个合法选择都被覆盖且不会重复计数。按处理顺序归纳，程序得到的最终状态与题目目标等价。

### Python ACM 实现

下面给出完整标准输入、标准输出程序，可直接在 Python 3 ACM 环境运行。

```python
# 核心步骤：奇偶性分析；严格按题面处理边界并输出结果。
import sys
input = sys.stdin.readline

T = int(input())
results = []
for _ in range(T):
    n = int(input())
    results.append("Yes" if n % 2 == 1 else "No")
print('\n'.join(results))
```

### 易错点

- 严格区分题面中的“严格大于/不小于”、开闭区间与下标起点。
- 多组测试时必须重置状态；大规模累加按题面需要使用 Python 整数或取模。

### 复杂度分析

**时间复杂度**：$O(T)$，每组数据 $O(1)$ 判断。
**空间复杂度**：$O(1)$。

---

## 02 · 炒鸡钞票构造 {#problem-02}

### 题目描述

有两种面额的钞票，各无限张：一种面值为 $n$ 元，另一种面值为 $n+1$ 元。想要购买一件价格为 $m$ 元的商品。商店没有找零系统，付款金额不能少于商品价格。计算最少需要额外多支付多少元；若能刚好支付则额外花费为 $0$。

输入格式：第一行整数 $T$ 表示数据组数，每组一行两个整数 $n, m$。$n, m$ 可达 $10^{18}$。

输出格式：每组输出最少额外支付金额。

### 样例

**输入**

```
3
3 8
4 6
5 7
```

**输出**

```
0
2
3
```

### 解题思路

**第一步：分析可支付区间**

用 $s$ 张钞票（$a$ 张面额 $n$，$b$ 张面额 $n+1$，$a + b = s$），总额 $= s \cdot n + b$。由于 $0 \leq b \leq s$，用 $s$ 张钞票能凑出闭区间 $[s \cdot n,\; s \cdot (n+1)]$ 内的任意整数。

**第二步：找最少张数**

为使区间右端覆盖 $m$，需要 $s \cdot (n+1) \geq m$，即 $s \geq \lceil m / (n+1) \rceil$。取 $s = \lceil m / (n+1) \rceil$。

**第三步：判断能否精确支付**

若 $s \cdot n \leq m$，则 $m$ 落在区间 $[s \cdot n,\; s \cdot (n+1)]$ 内，可精确凑出，多付 $0$。若 $s \cdot n > m$，最小付款为 $s \cdot n$，多付 $s \cdot n - m$。

**样例推导**：$n=5,\; m=7$。$s = \lceil 7/6 \rceil = 2$，区间 $[10, 12]$。因为 $10 > 7$，多付 $10 - 7 = 3$。

### 正确性依据

上述状态、枚举或贪心不变量保留了决定后续结果的全部信息；每个合法选择都被覆盖且不会重复计数。按处理顺序归纳，程序得到的最终状态与题目目标等价。

### Python ACM 实现

下面给出完整标准输入、标准输出程序，可直接在 Python 3 ACM 环境运行。

```python
# 核心步骤：区间覆盖推导 / 数学思维；严格按题面处理边界并输出结果。
import sys
import math
input = sys.stdin.readline

T = int(input())
results = []
for _ in range(T):
    n, m = map(int, input().split())
    s = math.ceil(m / (n + 1))
    ans = max(0, s * n - m)
    results.append(str(ans))
print('\n'.join(results))
```

### 易错点

- 严格区分题面中的“严格大于/不小于”、开闭区间与下标起点。
- 多组测试时必须重置状态；大规模累加按题面需要使用 Python 整数或取模。

### 复杂度分析

**时间复杂度**：$O(T)$，每组数据 $O(1)$ 计算。
**空间复杂度**：$O(1)$。

---

## 03 · 用历史数据挑选 Logistic C {#problem-03}

### 题目描述

给定一张历史元数据表（每行包含数据集的简单特征和其最优 $C$）以及一份当前任务的训练/测试数据，实现一个基于 KNN 的超参数元学习器：

1. **元特征计算**：对每个数据集计算三维向量 $(n, d, \text{imbalance})$，其中 $n$ 为训练样本数，$d$ 为特征维度，$\text{imbalance} = \lvert n_{\text{pos}} - n_{\text{neg}} \rvert / n$。
2. **KNN 检索（K=3）**：计算当前任务元向量到所有历史数据的 $L_2$ 距离，取 $3$ 个最近邻；距离并列按行号升序决定。
3. **汇聚选 $C^*$**：对 $3$ 个最近邻中出现过的所有 $C$ 值分组计算平均 score；取平均分最高者为 $C^*$；若并列则取数值最小的 $C$。
4. **模型训练 + 预测**：使用纯 Python 全批量梯度下降拟合带 L2 正则的 Logistic 回归，输出测试集的 0/1 标签。

输入格式：单行 JSON，包含 `train_X`、`train_y`、`test_X`、`history` 字段。history 每条含 `meta`（三维元特征）、`C`、`score`。

输出格式：一行 JSON `{"C_star": ..., "pred": [...]}`。

### 样例

**输入**

```
{"train_X": [[0.0,0.0],[0.2,0.4],[0.3,0.5],[0.1,0.2],[1.0,1.1],[1.2,1.3],[1.3,1.4],[1.1,1.0]], "train_y": [0,0,0,0,1,1,1,1], "test_X": [[0.15,0.25],[1.15,1.25]], "history": [{"meta":[50,2,0.10],"C":0.1,"score":0.82},{"meta":[48,2,0.20],"C":0.3,"score":0.79},{"meta":[60,2,0.00],"C":1.0,"score":0.85},{"meta":[40,4,0.30],"C":3.0,"score":0.80},{"meta":[55,3,0.18],"C":0.3,"score":0.83},{"meta":[52,2,0.10],"C":1.0,"score":0.81},{"meta":[58,2,0.05],"C":10.0,"score":0.78}]}
```

**输出**

```
{"C_star": 0.1, "pred": [0, 1]}
```

### 解题思路

先由训练标签计算三维元特征 $(n,d,imbalance)$，再按“欧氏距离、历史行号”排序取最近的 3 条记录。对相同 $C$ 的历史分数取平均，平均分并列时选择数值更小的 $C$。

选定 $C$ 后，用全批量梯度下降训练带 L2 正则的 Logistic 回归。对每个样本计算 $sigma(w\cdot x+b)$，梯度由交叉熵项与 $w/(Cn)$ 的正则项组成；偏置不做正则。固定迭代次数和衰减学习率，使程序在标准 Python ACM 环境中可复现且不依赖 NumPy、scikit-learn。

**正确性要点**：前三步严格实现题面给定的 KNN 检索与分组平均规则，所以得到的 $C^*$ 唯一确定；Logistic 回归的梯度是目标函数的一阶导数，沿负梯度反复更新会降低该凸目标，最终以线性得分的正负输出类别。

### 正确性依据

上述状态、枚举或贪心不变量保留了决定后续结果的全部信息；每个合法选择都被覆盖且不会重复计数。按处理顺序归纳，程序得到的最终状态与题目目标等价。

### Python ACM 实现

下面给出完整标准输入、标准输出程序，可直接在 Python 3 ACM 环境运行。

```python
import json
import math


def train_logistic(features, labels, c_value):
    sample_count = len(labels)
    dimension = len(features[0])
    weights = [0.0] * dimension
    bias = 0.0

    for step in range(5000):
        gradient_w = [0.0] * dimension
        gradient_b = 0.0
        for row, label in zip(features, labels):
            score = sum(w * x for w, x in zip(weights, row)) + bias
            score = max(-50.0, min(50.0, score))
            probability = 1.0 / (1.0 + math.exp(-score))
            error = probability - label
            for j, value in enumerate(row):
                gradient_w[j] += error * value
            gradient_b += error

        learning_rate = 0.2 / (1.0 + step / 500.0)
        for j in range(dimension):
            # C 越小，L2 正则越强；偏置项不参与正则。
            regularized = gradient_w[j] / sample_count
            regularized += weights[j] / (c_value * sample_count)
            weights[j] -= learning_rate * regularized
        bias -= learning_rate * gradient_b / sample_count

    return weights, bias


def solve():
    data = json.loads(input())
    train_x = data["train_X"]
    train_y = data["train_y"]
    test_x = data["test_X"]
    history = data["history"]

    positive = sum(train_y)
    sample_count = len(train_y)
    meta = [
        sample_count,
        len(train_x[0]),
        abs(positive - (sample_count - positive)) / sample_count,
    ]

    distances = []
    for index, record in enumerate(history):
        distance = math.dist(meta, record["meta"])
        distances.append((distance, index))
    distances.sort()

    scores = {}
    for _, index in distances[:3]:
        record = history[index]
        scores.setdefault(record["C"], []).append(record["score"])

    best_c = min(
        scores,
        key=lambda value: (-sum(scores[value]) / len(scores[value]), value),
    )
    weights, bias = train_logistic(train_x, train_y, best_c)
    prediction = [
        int(sum(w * x for w, x in zip(weights, row)) + bias >= 0)
        for row in test_x
    ]
    c_output = int(best_c) if best_c == int(best_c) else best_c
    print(json.dumps({"C_star": c_output, "pred": prediction}, separators=(", ", ": ")))


solve()
```

### 易错点

- 严格区分题面中的“严格大于/不小于”、开闭区间与下标起点。
- 多组测试时必须重置状态；大规模累加按题面需要使用 Python 整数或取模。

### 复杂度分析

**时间复杂度**：$O(H \log H + I n d)$，其中 $H$ 为历史记录数、$I=5000$ 为训练轮数。
**空间复杂度**：$O(nd)$，存储训练数据矩阵。

---

## 04 · 序列倍数交换 {#problem-04}

### 题目描述

给定一个长度为 $n$ 的序列 $a$，其中第 $i$ 个元素的值为 $a_i$（$1 \leq a_i \leq n$）。可以对序列进行任意次如下操作：选择两个不同的下标 $i, j$，且 $a_i$ 与 $a_j$ 满足倍数关系（即 $a_i \mid a_j$ 或 $a_j \mid a_i$），然后交换 $a_i$ 和 $a_j$。

求在任意次操作后，字典序最小的序列。

输入格式：第一行整数 $T$ 表示数据组数。每组第一行一个整数 $n$，第二行 $n$ 个整数。单个测试文件的 $n$ 之和不超过 $10^5$。

输出格式：每组输出 $n$ 个整数。

### 样例

**输入**

```
2
5
1 4 3 2 5
6
3 4 2 2 6 5
```

**输出**

```
1 2 3 4 5
2 2 3 4 6 5
```

### 解题思路

**第一步：发现可传递性**

如果 $a_i$ 和 $a_j$ 可以交换，$a_j$ 和 $a_k$ 也可以交换，那么经过中间步骤 $a_i$ 和 $a_k$ 也能到达任意排列。因此"能交换"是一个传递关系，所有互相可达的位置形成一个等价类。

**第二步：问题转化**

在同一个等价类内部，元素可以任意重排。要让整个序列字典序最小，只需在每个等价类内部把最小的值分配给最小的位置。

**第三步：用并查集 + 倍数筛建图**

暴力枚举所有位置对是 $O(n^2)$ 的，太慢。观察到：如果值 $v$ 和值 $2v$ 都在数组中出现过，那么持有这两个值的位置可以交换（因为 $v \mid 2v$）。因此枚举每个出现过的值 $v$，将 $v$ 和 $2v, 3v, \ldots$ 的代表位置用并查集合并。枚举量为 $\sum_{v=1}^{n} n/v = O(n \log n)$（调和级数），比暴力快得多。

**第四步：分量内排序**

对每个连通分量，收集其所有位置和对应值，分别排序后逐一对应填回。位置从小到大、值从小到大，保证字典序最小。

**样例推导**：$a = [3, 4, 2, 2, 6, 5]$。值 $2$ 与 $4$（$2 \mid 4$）、$2$ 与 $6$（$2 \mid 6$）、$3$ 与 $6$（$3 \mid 6$）连通，位置 $\{0, 1, 2, 3, 4\}$ 形成一个分量，值 $\{3, 4, 2, 2, 6\}$ 排序后填入得 $[2, 2, 3, 4, 6]$；位置 $\{5\}$ 独立，值 $5$ 不动。结果 $[2, 2, 3, 4, 6, 5]$。

### 正确性依据

上述状态、枚举或贪心不变量保留了决定后续结果的全部信息；每个合法选择都被覆盖且不会重复计数。按处理顺序归纳，程序得到的最终状态与题目目标等价。

### Python ACM 实现

下面给出完整标准输入、标准输出程序，可直接在 Python 3 ACM 环境运行。

```python
import sys
from collections import defaultdict
input_data = sys.stdin.read().split()
idx = 0

def read_int():
    global idx
    val = int(input_data[idx]); idx += 1
    return val

T = read_int()
output_parts = []

for _ in range(T):
    n = read_int()
    a = [read_int() for _ in range(n)]

    parent = list(range(n))
    rank = [0] * n

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(x, y):
        rx, ry = find(x), find(y)
        if rx == ry:
            return
        if rank[rx] < rank[ry]:
            rx, ry = ry, rx
        parent[ry] = rx
        if rank[rx] == rank[ry]:
            rank[rx] += 1

    # rep[v] = 值为 v 的某个代表位置
    rep = [-1] * (n + 1)
    for i in range(n):
        if rep[a[i]] == -1:
            rep[a[i]] = i
        else:
            union(i, rep[a[i]])

    # 倍数筛：将 v 与 2v, 3v, ... 的代表位置合并
    for v in range(1, n + 1):
        if rep[v] == -1:
            continue
        mult = 2 * v
        while mult <= n:
            if rep[mult] != -1:
                union(rep[v], rep[mult])
            mult += v

    # 每个连通分量内排序，最小值填最小位置
    comp_pos = defaultdict(list)
    comp_vals = defaultdict(list)
    for i in range(n):
        root = find(i)
        comp_pos[root].append(i)
        comp_vals[root].append(a[i])

    result = [0] * n
    for root in comp_pos:
        positions = sorted(comp_pos[root])
        values = sorted(comp_vals[root])
        for p, v in zip(positions, values):
            result[p] = v

    output_parts.append(' '.join(map(str, result)))

print('\n'.join(output_parts))
```

### 易错点

- 严格区分题面中的“严格大于/不小于”、开闭区间与下标起点。
- 多组测试时必须重置状态；大规模累加按题面需要使用 Python 整数或取模。

### 复杂度分析

**时间复杂度**：倍数筛 $O(n \log n)$（调和级数）；并查集操作近 $O(n)$；分量内排序 $O(n \log n)$。总计 $O(n \log n)$。
**空间复杂度**：$O(n)$，并查集数组和值映射表。

---

## 小结

- 第一题是纯数学思维题：偶数长度回文总和必为偶数，奇数长度可通过中心元素自由调节
- 第二题利用"$s$ 张钞票可凑出连续区间 $[sn, s(n+1)]$"的关键观察，$O(1)$ 得出答案
- 第三题是 ML 综合题，按题目四步流程（元特征 → KNN 检索 → 汇聚选 $C$ → 训练预测）直接实现
- 第四题是经典的并查集 + 调和级数枚举，核心在于将倍数关系转化为连通分量内自由排列
