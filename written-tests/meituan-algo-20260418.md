---
pageClass: exam-session-page
title: 美团算法岗 2026-04-18
description: 美团 2026-04-18 算法岗笔试真题，含 4 道 Python ACM 模式题解
---

<div class="exam-session-banner">
  <div>
    <span>MEITUAN / 2026.04.18 / ACM</span>
    <strong>美团 · 算法岗</strong>
    <small>2026-04-18 · 4 题 ACM · 难度 中等偏难</small>
  </div>
  <div class="exam-session-banner__meta">
    <span>排序 + 模拟</span>
    <span>高斯过程回归 GPR</span>
    <span>分组贪心</span>
    <span>贪心 + 树状数组求字典序最大 LCS</span>
  </div>
</div>

# 美团 2026-04-18 算法岗笔试解析

本场题目按原考试输入输出整理为完整 Python 程序。每题依次说明建模依据、状态或数据结构、正确性理由、边界处理与复杂度。

来源：[Zero2Leetcode · 美团 2026-04-18 算法岗](https://onefly.top/zero2Leetcode/04_real_interviews/meituan/algo-20260418/)。

## 本场考试概述

**考试时间**：2026年4月18日
**考试岗位**：算法岗
**难度评级**：中等偏难

**考点分析**：

1. 第一题：排序 + 模拟（难度简单）
2. 第二题：高斯过程回归 GPR（难度困难，ML实现题）
3. 第三题：分组贪心（难度中等）
4. 第四题：贪心 + 树状数组求字典序最大 LCS（难度困难）

**建议策略**：

1. 第一题排序签到，直接拿满分
2. 第二题 ML 实现题，需要了解 GPR 闭式公式和 RBF 核，NumPy 向量化一步到位
3. 第三题需要理清"翻倍操作"的数学本质——不改变奇数因子，按奇数因子分组后贪心匹配
4. 第四题是经典难题"字典序最大 LCS"，将 LCS 转化为 LIS 后用树状数组维护后缀 LIS 长度

---

## 01 · 清除残留数据 {#problem-01}

### 题目描述

给定长度为 n 的序列，需要删除其中最小的 m 个元素（若有并列，优先删除位置靠左的），输出剩余元素按原顺序排列的结果。

多组测试数据，T 组，保证所有测试数据的 n 之和不超过 200000。

### 样例

**输入**

```
3
5 2
3 1 4 1 5
3 0
1 2 3
5 4
5 4 3 2 1
```

**输出**

```
3 4 5
1 2 3
5
```

### 解题思路

**第一步：确定删除策略**

题目要求删除最小的 m 个元素，遇到值相同时优先删最左边的。这等价于：按 (值, 下标) 升序排序所有元素，标记排序后前 m 个元素为"被删除"。

**第二步：为什么按 (值, 下标) 排序就够了？**

因为值相同时，下标小的排在前面，恰好满足"并列时优先删左边"的规则。标记前 m 个即可把题意中"最小的 m 个、左优先"精确对应。

**第三步：输出未被删除的元素**

用一个布尔数组记录哪些下标被删除，最后按原顺序遍历输出未标记的元素。

### Python ACM 实现

下面给出完整标准输入、标准输出程序；除题面明确要求的机器学习库外，可直接提交到 Python ACM 环境。

```python
import sys
input = sys.stdin.readline

def solve():
    n, m = map(int, input().split())
    arr = list(map(int, input().split()))
    # 按 (值, 下标) 排序，前 m 个标记为删除
    indices = sorted(range(n), key=lambda i: (arr[i], i))
    removed = [False] * n
    for i in range(m):
        removed[indices[i]] = True
    result = [str(arr[i]) for i in range(n) if not removed[i]]
    print(' '.join(result))

T = int(input())
for _ in range(T):
    solve()
```

### 复杂度分析

**时间复杂度**：O(n log n)，排序为瓶颈。
**空间复杂度**：O(n)。

---

## 02 · 数据分析师 {#problem-02}

### 题目描述

实现高斯过程回归（Gaussian Process Regression, GPR）。给定训练数据和测试数据，使用 RBF 核（也称径向基核 / 平方指数核）进行预测。超参数固定为：长度尺度 l = 1.0，信号方差 $\sigma_f^2 = 1.0$，噪声方差 $\sigma_n^2 = 0.1$。

输入为单行 JSON，格式为 `{"train": [[x1, x2, ..., y], ...], "test": [[x1, x2, ...], ...]}`，其中 train 每行的最后一个值为标签 y。

输出预测均值的 JSON 数组，保留 6 位小数。

### 样例

**输入**

```
{"train": [[1,-1,1],[1,1,1]], "test": [[-1,1],[0,1],[1,1]]}
```

**输出**

```
[-0.896337, 0.0, 0.896337]
```

### 解题思路

**第一步：理解 GPR 的直觉——用"相似度"做加权预测**

高斯过程回归的核心思想可以用一句话概括：**测试点的预测值 = 训练标签的加权平均，权重由测试点与各训练点的"相似度"决定**。

这里的"相似度"由核函数定义。RBF 核 $k(x, x') = \sigma_f^2 \exp\left(-\frac{\|x - x'\|^2}{2l^2}\right)$ 在两点距离近时值接近 1（非常相似），距离远时值趋近 0（无关）。直觉上：离测试点近的训练样本对预测贡献大，远的贡献小。

**第二步：为什么不能直接用核值做权重？**

如果训练点之间彼此离得很近，它们提供的信息是冗余的——一个点就能代表一群。直接用核值做权重会过度倾斜向这类密集区域。

GPR 通过构造并求逆矩阵 $K = K(X_{train}, X_{train}) + \sigma_n^2 I$ 来"去除训练点之间的冗余影响"。$K^{-1}$ 的作用就是：如果两个训练点高度相关，它会自动压低它们各自的权重，避免重复计数。加入 $\sigma_n^2 I$ 则表示我们承认观测有噪声，不要求完美拟合训练数据。

**第三步：闭式预测公式**

GPR 的预测均值有优雅的闭式解：

$$\mu_* = k_*^T (K + \sigma_n^2 I)^{-1} y$$

其中：
- $K$ 是训练点之间的核矩阵（n x n）
- $k_*$ 是测试点与所有训练点的核向量（n x 1，每个测试点一个）
- $y$ 是训练标签向量

实际计算中，设 $\alpha = (K + \sigma_n^2 I)^{-1} y$（只需解一次线性系统），则每个测试点的预测就是 $k_*^T \alpha$。

**第四步：RBF 核的向量化计算**

RBF 核需要计算所有点对之间的欧几里得距离平方。利用恒等式：

$$\|x - x'\|^2 = \|x\|^2 + \|x'\|^2 - 2 x \cdot x'$$

可以用 NumPy 的矩阵运算一步完成，避免 for 循环。

### Python ACM 实现

下面给出完整标准输入、标准输出程序；除题面明确要求的机器学习库外，可直接提交到 Python ACM 环境。

```python
import json
import numpy as np

line = input()
data = json.loads(line)

train_raw = data["train"]
test_raw = data["test"]

# 解析训练数据：每行最后一个是标签 y
train_arr = np.array(train_raw, dtype=np.float64)
X_train = train_arr[:, :-1]
y = train_arr[:, -1]

X_test = np.array(test_raw, dtype=np.float64)

# 超参数
l = 1.0
sigma_f2 = 1.0
sigma_n2 = 0.1

# RBF 核函数（向量化）
def rbf_kernel(A, B):
    # A: (m, d), B: (n, d) -> K: (m, n)
    sq_A = np.sum(A ** 2, axis=1, keepdims=True)  # (m, 1)
    sq_B = np.sum(B ** 2, axis=1, keepdims=True)  # (n, 1)
    dist_sq = sq_A + sq_B.T - 2.0 * A @ B.T      # (m, n)
    return sigma_f2 * np.exp(-dist_sq / (2.0 * l ** 2))

# 训练点之间的核矩阵 + 噪声
n_train = X_train.shape[0]
K = rbf_kernel(X_train, X_train) + sigma_n2 * np.eye(n_train)

# 求解 alpha = K^{-1} y
alpha = np.linalg.solve(K, y)

# 测试点与训练点的核向量
K_star = rbf_kernel(X_test, X_train)  # (n_test, n_train)

# 预测均值
y_pred = K_star @ alpha

# 输出
result = [round(float(v), 6) for v in y_pred]
print(json.dumps(result))
```

### 复杂度分析

**时间复杂度**：O(n^3 + n * m)，其中 n 为训练样本数（线性系统求解 O(n^3)），m 为测试样本数。
**空间复杂度**：O(n^2 + n * m)，存储核矩阵。

---

## 03 · 神秘工坊 {#problem-03}

### 题目描述

给定长度为 n 的数组 a 和 b。你可以执行以下操作：选择一个值 v，将数组 a 中所有等于 v 的元素同时乘以 2（即翻倍）。这算作一次操作。

问：最少需要多少次操作，使得 a 的多重集等于 b 的多重集？如果无法达成，输出 -1。

### 样例

**输入**

```
3
3
1 2 3
2 4 3
4
1 1 2 2
4 2 2 1
2
3 5
3 9
```

**输出**

```
2
2
-1
```

### 解题思路

**第一步：翻倍操作的数学本质——只改变 2 的幂次**

将任意正整数写成 $x = \text{odd}(x) \times 2^{k}$ 的形式，其中 $\text{odd}(x)$ 是 x 的奇数因子（不断除以 2 直到为奇数）。翻倍操作将 x 变为 $\text{odd}(x) \times 2^{k+1}$，**只有 2 的幂次增加了 1，奇数因子不变**。

这意味着：
- 如果 a 中某元素的奇数因子为 p，经过任何次数操作后它的奇数因子仍然是 p
- 操作只能增加 2 的幂次，不能减少

因此，若 b 中存在一个元素的奇数因子在 a 中找不到对应，或者 b 中某元素的 2 的幂次比 a 中对应元素的幂次还小，则答案为 -1。

**第二步：按奇数因子分组**

将 a 和 b 的元素都按奇数因子分组。对于每个奇数因子 p，a 中有若干个形如 $p \times 2^{k_1}, p \times 2^{k_2}, \ldots$ 的元素，b 中也有若干个形如 $p \times 2^{j_1}, p \times 2^{j_2}, \ldots$ 的元素。

若某组中 a 和 b 的元素个数不同，直接返回 -1。

**第三步：组内贪心匹配**

在同一组内，将 a 的幂次序列和 b 的幂次序列分别排序。排序后一一配对（最小对最小）是最优的，因为：
- 操作是"选择当前值为 v 的所有元素同时翻倍"，即同一层的所有元素一起升一级
- 将 a 的幂次从 $k_i$ 升到 $j_i$（$j_i \geq k_i$，否则无解）需要经过 $j_i - k_i$ 个不同的"层"

**第四步：计算操作次数——统计经过的不同层**

一次操作是"选择值相同的所有元素翻倍"。值相同意味着奇数因子相同且当前 2 的幂次相同。所以对于同一组（奇数因子 = p），一次操作可以将所有当前为 $p \times 2^t$ 的元素一起升到 $p \times 2^{t+1}$。

匹配后，对于每对 $(k_i, j_i)$，元素需要经过层 $k_i, k_i+1, \ldots, j_i-1$ 的翻倍。操作次数 = 该组中所有这些中间层的**去重数量**（因为同一层只需操作一次）。

实现上，收集所有需要经过的区间 $[k_i, j_i)$，统计这些区间的并集覆盖了多少个整数点即可。

### Python ACM 实现

下面给出完整标准输入、标准输出程序；除题面明确要求的机器学习库外，可直接提交到 Python ACM 环境。

```python
import sys
from collections import defaultdict
input = sys.stdin.readline

def solve():
    n = int(input())
    a = list(map(int, input().split()))
    b = list(map(int, input().split()))

    def decompose(x):
        """分离奇数因子和 2 的幂次"""
        k = 0
        while x % 2 == 0:
            x //= 2
            k += 1
        return x, k  # (奇数因子, 2的幂次)

    # 按奇数因子分组
    groups_a = defaultdict(list)
    groups_b = defaultdict(list)
    for x in a:
        odd, pw = decompose(x)
        groups_a[odd].append(pw)
    for x in b:
        odd, pw = decompose(x)
        groups_b[odd].append(pw)

    # 检查分组是否对应
    if set(groups_a.keys()) != set(groups_b.keys()):
        print(-1)
        return
    for key in groups_a:
        if len(groups_a[key]) != len(groups_b[key]):
            print(-1)
            return

    total_ops = 0
    for odd_part in groups_a:
        pa = sorted(groups_a[odd_part])
        pb = sorted(groups_b[odd_part])
        # 一一配对：最小对最小
        # 收集所有需要经过的层
        layers = set()
        for ka, kb in zip(pa, pb):
            if kb < ka:
                print(-1)
                return
            for t in range(ka, kb):
                layers.add(t)
        total_ops += len(layers)

    print(total_ops)

T = int(input())
for _ in range(T):
    solve()
```

### 复杂度分析

**时间复杂度**：O(n log V)，其中 V 为元素最大值。分解每个元素 O(log V)，组内排序 O(n log n)，收集层数在最坏情况下为 O(n log V)。
**空间复杂度**：O(n log V)。

---

## 04 · 最长公共子序列3 {#problem-04}

### 题目描述

给定两个长度为 n 的排列（1 到 n 的全排列）p 和 q，求它们的**字典序最大的最长公共子序列**（LCS）。

### 样例

**输入**

```
5
5 3 4 1 2
3 5 4 2 1
```

**输出**

```
5 4 2
```

**解释**：最长公共子序列长度为 3；在所有长度为 3 的方案中，`5 4 2` 的字典序最大。

### 解题思路

**第一步：LCS 转 LIS——经典排列技巧**

两个排列的 LCS 可以转化为 LIS（最长递增子序列）问题。设 pos\[v\] = v 在 q 中的位置，构造序列 c\[i\] = pos\[p\[i\]\]，则 p 和 q 的 LCS 等价于 c 的 LIS（严格递增子序列）。

但这里需要的是**字典序最大**的 LCS，对应到 c 上就是**字典序最大的 LIS**（元素按原始值排序，不是按位置排序）。

**第二步：贪心策略——从大到小尝试选取**

要构造字典序最大的 LCS，贪心思路为：在每一步尽可能选当前能选的最大值。

具体地：维护一个"当前位置下界"（在 p 和 q 中都要在之前选的元素后面），从值 n 开始从大到小扫描每个值 v：如果选了 v 之后，剩余部分仍然能凑够剩余的 LCS 长度，就选它。

**第三步：一维树状数组维护后缀 LIS 长度**

关键子问题是：从位置 i 开始（c 数组中），且值严格大于某个阈值，能得到的最长递增子序列长度是多少？

从右往左处理 c 数组，用树状数组维护：以位置 j 开头的 LIS 长度，按 c\[j\] 的值做索引。查询"c 值 > threshold 的位置中，LIS 长度的最大值"就是一个后缀最大值查询。

**第四步：二维树状数组支持字典序贪心**

设已经选到 p 中位置 `last_pos`、q 中位置 `last_q`，还需要选择 `remain` 个元素。候选位置 i 必须满足 `i > last_pos`、`c[i] > last_q`、`lis_from[i] >= remain`。

当前位应在所有可行候选中选择原值 `p[i]` 最大者。按 `remain` 从大到小逐层激活满足后缀长度要求的点，再用离线二维树状数组查询二维后缀矩形中的最大 `p[i]`，每一步都能在 O(log² n) 时间完成。

### Python ACM 实现

下面给出完整标准输入、标准输出程序；除题面明确要求的机器学习库外，可直接提交到 Python ACM 环境。

```python
import sys
from bisect import bisect_left, bisect_right

input = sys.stdin.readline

def largest_lcs(p, q):
    n = len(p)
    pos_p = [0] * (n + 1)
    pos_q = [0] * (n + 1)
    for i, value in enumerate(p):
        pos_p[value] = i
    for i, value in enumerate(q):
        pos_q[value] = i

    # LCS 转 LIS：c[i] 是 p[i] 在 q 中的位置。
    c = [pos_q[value] for value in p]

    bit = [0] * (n + 1)

    def query(index):
        best = 0
        while index > 0:
            best = max(best, bit[index])
            index -= index & -index
        return best

    def update(index, value):
        while index <= n:
            bit[index] = max(bit[index], value)
            index += index & -index

    lis_from = [0] * n
    for i in range(n - 1, -1, -1):
        reversed_q = n - c[i]
        lis_from[i] = 1 + query(reversed_q - 1)
        update(reversed_q, lis_from[i])

    longest = max(lis_from)
    positions_by_length = [[] for _ in range(longest + 1)]
    for i, length in enumerate(lis_from):
        positions_by_length[length].append(i)

    # 离线准备二维 BIT：反转两维后，二维后缀查询变成前缀查询。
    y_coordinates = [[] for _ in range(n + 1)]
    for i, q_position in enumerate(c):
        x = n - i
        y = n - q_position
        while x <= n:
            y_coordinates[x].append(y)
            x += x & -x

    trees = [None] * (n + 1)
    for x in range(1, n + 1):
        y_coordinates[x] = sorted(set(y_coordinates[x]))
        trees[x] = [0] * (len(y_coordinates[x]) + 1)

    def add_point(i):
        x = n - i
        y = n - c[i]
        value = p[i]
        while x <= n:
            inner = bisect_left(y_coordinates[x], y) + 1
            tree = trees[x]
            while inner < len(tree):
                tree[inner] = max(tree[inner], value)
                inner += inner & -inner
            x += x & -x

    def rectangle_max(x_limit, y_limit):
        best = 0
        x = x_limit
        while x > 0:
            inner = bisect_right(y_coordinates[x], y_limit)
            tree = trees[x]
            while inner > 0:
                best = max(best, tree[inner])
                inner -= inner & -inner
            x -= x & -x
        return best

    answer = []
    last_pos = -1
    last_q = -1
    for remain in range(longest, 0, -1):
        for i in positions_by_length[remain]:
            add_point(i)

        value = rectangle_max(n - last_pos - 1, n - last_q - 1)
        answer.append(value)
        last_pos = pos_p[value]
        last_q = pos_q[value]

    return answer


def solve():
    n = int(input())
    p = list(map(int, input().split()))
    q = list(map(int, input().split()))
    print(*largest_lcs(p, q))

solve()
```

### 复杂度分析

**时间复杂度**：O(n log² n)。一维 BIT 求 `lis_from` 为 O(n log n)，每个点在二维 BIT 中激活一次，更新和逐位查询均为 O(log² n)。
**空间复杂度**：O(n log n)，用于离线二维 BIT。

---

## 小结

- 第一题排序签到，按 (值, 下标) 排序后标记前 m 个元素删除，再按原顺序输出剩余
- 第二题高斯过程回归是 ML 实现题，核心公式 $\mu_* = k_*^T (K + \sigma_n^2 I)^{-1} y$，理解三步：RBF 核度量相似度、$K^{-1}$ 去除训练点间冗余、$k_*$ 按相似度加权
- 第三题利用翻倍只改变 2 的幂次、不改变奇数因子的性质，按奇数因子分组后排序配对，统计需要经过的不同层数即为操作次数
- 第四题字典序最大 LCS 是经典难题，通过排列的位置映射将 LCS 转 LIS，再利用后缀 LIS 长度数组贪心地从大到小选取可行元素
