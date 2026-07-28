---
pageClass: exam-session-page
title: 美团研发岗 2026-04-18
description: 美团 2026-04-18 研发岗笔试真题，含 3 道 Python ACM 模式题解
---

<div class="exam-session-banner">
  <div>
    <span>MEITUAN / 2026.04.18 / ACM</span>
    <strong>美团 · 研发岗</strong>
    <small>2026-04-18 · 3 题 ACM · 难度 中等偏难</small>
  </div>
  <div class="exam-session-banner__meta">
    <span>排序 + 模拟</span>
    <span>排序 + 二分查找</span>
    <span>贪心 + 树状数组</span>
  </div>
</div>

# 美团 2026-04-18 研发岗笔试解析

本场题目按原考试输入输出整理为完整 Python 程序。每题依次说明建模依据、状态或数据结构、正确性理由、边界处理与复杂度。

来源：[Zero2Leetcode · 美团 2026-04-18 研发岗](https://onefly.top/zero2Leetcode/04_real_interviews/meituan/dev-20260418/)。

## 本场考试概述

**考试时间**：2026年4月18日
**考试岗位**：研发岗
**难度评级**：中等偏难

**考点分析**：

1. 第一题：排序 + 模拟（难度简单）
2. 第二题：排序 + 二分查找（难度中等）
3. 第三题：贪心 + 树状数组（难度困难）

**建议策略**：

1. 第一题排序标记删除即可，注意处理值相同时优先删左边的规则，快速拿满分
2. 第二题对每个点预排距离后二分，注意用距离平方避免浮点误差
3. 第三题是经典的"字典序最大 LCS"问题，核心是将两个排列的 LCS 转化为 LIS，再用 BIT + 贪心逐位确定答案

---

## 01 · 清除残留数据 {#problem-01}

### 题目描述

给定一个长度为 n 的序列，需要删除其中最小的 m 个元素。如果有多个元素值相同，优先删除最左边的。删除后，输出剩余元素按原始顺序排列的结果。

多组测试数据，第一行输入 T。每组数据第一行给出 n 和 m，第二行给出数组 a。保证所有测试数据的 n 之和不超过 200000。

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

**第一步：理解删除规则**

我们需要从序列中找出最小的 m 个元素并删除它们。关键约束是：当多个元素值相同时，优先删除位于左边的那个。这就要求我们在排序比较时，同值的元素按下标从小到大排，这样取前 m 个就自然满足"优先删左边"的规则。

**第二步：确定哪些位置被删除**

将所有元素按 (值, 下标) 排序，取排序后的前 m 个元素，记录它们的下标为"被删除"。

**第三步：按原顺序输出剩余元素**

遍历原数组，跳过被标记为删除的位置，将剩余元素按顺序输出。

以样例第一组为例：数组 \[3, 1, 4, 1, 5\]，m=2。按 (值, 下标) 排序后为 (1,1), (1,3), (3,0), (4,2), (5,4)。取前 2 个：下标 1 和 3 被删除。原数组中保留下标 0, 2, 4 对应的 3, 4, 5。

### Python ACM 实现

下面给出完整标准输入、标准输出程序；除题面明确要求的机器学习库外，可直接提交到 Python ACM 环境。

```python
import sys
input = sys.stdin.readline

def solve():
    n, m = map(int, input().split())
    a = list(map(int, input().split()))
    if m == 0:
        print(*a)
        return
    # 按 (值, 下标) 排序，取前 m 个的下标标记为删除
    indices = sorted(range(n), key=lambda i: (a[i], i))
    removed = set(indices[:m])
    # 按原顺序输出未被删除的元素
    res = [a[i] for i in range(n) if i not in removed]
    print(*res)

T = int(input())
for _ in range(T):
    solve()
```

### 复杂度分析

**时间复杂度**：O(n log n)，排序为主要开销。
**空间复杂度**：O(n)，存储排序后的下标和删除集合。

---

## 02 · 二维坐标系 {#problem-02}

### 题目描述

平面上有 n 个点。对于每对点 (i, j)（i != j），定义 c\[i\]\[j\] 为：以点 i 为圆心、dist(i, j) 为半径的圆内（含圆上）的其他点的数量（不包括 i 和 j 本身）。即 c\[i\]\[j\] 等于满足 k != i 且 k != j 且 dist(i, k) <= dist(i, j) 的点 k 的数量。定义 c\[i\]\[i\] = 0。

多组测试数据，第一行输入 T。每组数据第一行给出 n，接下来 n 行每行两个整数表示坐标。保证所有测试数据的 n 之和不超过 5000。

### 样例

**输入**

```
1
4
0 0
1 0
0 1
1 1
```

**输出**

```
0 1 1 2
1 0 2 1
1 2 0 1
2 1 1 0
```

### 解题思路

**第一步：理解 c\[i\]\[j\] 的含义**

c\[i\]\[j\] 本质上是：以点 i 为圆心画一个刚好经过点 j 的圆，这个圆内部和边界上还有多少个其他点（不算 i 和 j）。

直觉上，如果 j 离 i 很远，那圆就很大，里面包含的其他点就多。

**第二步：为什么排序 + 二分？**

对于固定的点 i，c\[i\]\[j\] 只依赖于 dist(i, j) 的相对大小。如果我们预先将所有其他点按到 i 的距离排好序，那么对于任意 j，只需要知道"距离 <= dist(i, j) 的点有多少个"，这正好是排序后的前缀计数问题，可以用二分查找 O(log n) 解决。

具体地：对于点 i，计算它到其余所有点的距离平方（用 int64 避免浮点），排序后对每个 j 二分查找 upper_bound(dist_sq(i, j))，得到"距离 <= dist(i, j) 的点个数"，再减 1（排除 j 本身）。

**第三步：为什么用距离平方？**

坐标范围到 10^6，距离平方最大约 (2 * 10^6)^2 = 4 * 10^12，在 int64 范围内。使用距离平方可以完全避免浮点运算和精度问题，且不影响大小比较。

**第四步：算法流程**

1. 对每个点 i，计算到其余 n-1 个点的距离平方，存入列表并排序
2. 对每对 (i, j)，用 bisect_right 在 i 的排序列表中查找 dist_sq(i, j) 的上界位置，该位置就是"距离 <= dist(i, j)"的点数（不含 i），减去 1（排除 j）就是 c\[i\]\[j\]

以样例为例：4 个点构成单位正方形。对于点 0=(0,0)：到点 1 距离平方=1，到点 2 距离平方=1，到点 3 距离平方=2。排序后为 \[1, 1, 2\]。c\[0\]\[1\]：bisect_right(\[1,1,2\], 1) = 2，减 1 = 1。c\[0\]\[3\]：bisect_right(\[1,1,2\], 2) = 3，减 1 = 2。

### Python ACM 实现

下面给出完整标准输入、标准输出程序；除题面明确要求的机器学习库外，可直接提交到 Python ACM 环境。

```python
import sys
from bisect import bisect_right
input = sys.stdin.readline

def solve():
    n = int(input())
    pts = []
    for _ in range(n):
        x, y = map(int, input().split())
        pts.append((x, y))

    # 对每个点 i，预计算到其他所有点的距离平方并排序
    dist_sorted = [[] for _ in range(n)]
    for i in range(n):
        dists = []
        xi, yi = pts[i]
        for j in range(n):
            if j == i:
                continue
            dx = pts[j][0] - xi
            dy = pts[j][1] - yi
            dists.append(dx * dx + dy * dy)
        dists.sort()
        dist_sorted[i] = dists

    # 计算 c[i][j]
    out = []
    for i in range(n):
        row = []
        xi, yi = pts[i]
        for j in range(n):
            if j == i:
                row.append(0)
            else:
                dx = pts[j][0] - xi
                dy = pts[j][1] - yi
                d2 = dx * dx + dy * dy
                # 在排序列表中找 <= d2 的个数，减 1 排除 j
                cnt = bisect_right(dist_sorted[i], d2) - 1
                row.append(cnt)
        out.append(" ".join(map(str, row)))
    print("\n".join(out))

T = int(input())
for _ in range(T):
    solve()
```

### 复杂度分析

**时间复杂度**：O(n^2 log n)，对每个点排序 O(n log n)，共 n 个点；查询共 n^2 次，每次 O(log n)。
**空间复杂度**：O(n^2)，存储每个点的距离排序数组。

---

## 03 · 最长公共子序列3 {#problem-03}

### 题目描述

给定两个长度为 n 的排列 p 和 q（即 1 到 n 的全排列），求它们的**字典序最大的最长公共子序列（LCS）**。输出 LCS 的长度和具体序列。

多组测试数据，第一行输入 T。每组数据第一行给出 n，接下来两行分别给出排列 p 和 q。保证所有测试数据的 n 之和不超过 200000。

### 样例

**输入**

```
3
4
1 3 2 4
3 4 1 2
5
1 2 3 4 5
5 4 3 2 1
9
9 2 6 7 3 8 1 4 5
6 2 7 9 4 8 3 5 1
```

**输出**

```
2
3 4
1
5
4
6 7 8 5
```

### 解题思路

**第一步：LCS 转化为 LIS**

两个排列的 LCS 有一个经典转化：构造序列 c，其中 c\[i\] 表示 p\[i\] 在 q 中出现的位置（即 q 的逆排列在 p\[i\] 处的值）。那么 p 和 q 的 LCS 等价于 c 的最长递增子序列（LIS）。

为什么？p 和 q 的公共子序列要求选出的元素在 p 中下标递增，同时在 q 中下标也递增。如果我们用 c\[i\] = pos_q(p\[i\])（p\[i\] 在 q 中的位置），那么选择一组下标 i1 < i2 < ... < ik 使得 c\[i1\] < c\[i2\] < ... < c\[ik\]，就恰好对应 p 和 q 的一个公共子序列。因此 LCS 长度 = LIS(c) 的长度。

**第二步：求字典序最大的 LIS**

现在问题变成：在序列 c 上找字典序最大的 LIS。这里"字典序最大"是指 LIS 对应的**原始值**（p\[i\] 的值）字典序最大，而不是 c 值字典序最大。

关键思路：贪心地从左到右逐位确定结果。对于结果的第 k 位，我们想选最大的 p\[i\] 值，同时满足：

1. c\[i\] 严格大于已选的上一个 c 值（保证递增性）
2. 从位置 i 开始（含 i），剩余的后缀中能形成的 LIS 长度足够填满剩余位数

条件 2 需要预计算：对每个位置 i，从 i 开始的"后缀 LIS 长度"（即以 c\[i\] 为起点、只考虑 i 及之后的元素能形成的最长递增子序列长度）。

**第三步：用一维 BIT 计算后缀 LIS 长度**

从右到左扫描，维护一个树状数组（BIT），BIT 的下标对应 c 值，存储的是以 >= 该 c 值开头的 LIS 最大长度。

对于位置 i，suffix\_lis\[i\] = 1 + BIT 查询 (c\[i\]+1, n) 的最大值（即在 i 之后、c 值严格大于 c\[i\] 的位置中最长递增子序列长度的最大值）。然后将 suffix\_lis\[i\] 更新到 BIT 的位置 c\[i\]。

由于 BIT 通常用于前缀查询，而我们需要后缀最大值查询（查 \[c\[i\]+1, n\] 的最大值），可以做坐标翻转：令 c'\[i\] = n + 1 - c\[i\]，则查询 \[c\[i\]+1, n\] 变成查询前缀 \[1, c'\[i\]-1\] 的最大值，标准 BIT 即可处理。

**第四步：把逐位贪心变成二维后缀最大值查询**

LIS 的总长度 L = max(suffix\_lis\[i\])。我们需要逐步选出 L 个元素。

设已经选到位置 `last_pos`，其在 q 中的位置为 `last_c`，还需要选择 `remain` 个元素。下一个候选 i 必须同时满足：

1. `i > last_pos`；
2. `c[i] > last_c`；
3. `suffix_lis[i] >= remain`。

在所有可行候选中取 `p[i]` 最大者，就是当前位的字典序最优选择。选择后重复同样过程，贪心正确性来自“当前位优先级高于所有后续位”，而条件 3 保证当前选择仍能补齐最长长度。

为了避免每一位扫描整个数组，将 `suffix_lis` 从大到小处理：当 `remain` 降到某个值时，把 `suffix_lis[i] == remain` 的点加入数据结构。已加入的点就恰好满足条件 3。再用离线构建的**二维树状数组**维护点 `(i, c[i])` 上的最大 `p[i]`，即可在二维后缀矩形 `(last_pos, n) × (last_c, n)` 中以 O(log² n) 找到最大值。

以样例第三组为例：p = \[9,2,6,7,3,8,1,4,5\]，q = \[6,2,7,9,4,8,3,5,1\]。构造 c：p\[0\]=9 在 q 中位置 4，p\[1\]=2 在 q 中位置 2，p\[2\]=6 在 q 中位置 1，p\[3\]=7 在 q 中位置 3，p\[4\]=3 在 q 中位置 7，p\[5\]=8 在 q 中位置 6，p\[6\]=1 在 q 中位置 9，p\[7\]=4 在 q 中位置 5，p\[8\]=5 在 q 中位置 8。c = \[4,2,1,3,7,6,9,5,8\]。LIS(c) 长度为 4（如子序列 1,3,6,8 或 1,3,5,8 等）。字典序最大的对应原值为 6,7,8,5。

### Python ACM 实现

下面给出完整标准输入、标准输出程序；除题面明确要求的机器学习库外，可直接提交到 Python ACM 环境。

```python
import sys
from bisect import bisect_left, bisect_right

input = sys.stdin.readline

def lexicographically_largest_lcs(p, q):
    """返回两个排列中字典序最大的最长公共子序列。"""
    n = len(p)

    pos_in_p = [0] * (n + 1)
    pos_in_q = [0] * (n + 1)
    for i, value in enumerate(p):
        pos_in_p[value] = i
    for i, value in enumerate(q):
        pos_in_q[value] = i

    # c 的递增子序列与 p、q 的公共子序列一一对应。
    c = [pos_in_q[value] for value in p]

    # 一维 BIT：从右向左求以每个位置开头的 LIS 长度。
    bit = [0] * (n + 1)

    def bit_query(index):
        best = 0
        while index > 0:
            best = max(best, bit[index])
            index -= index & -index
        return best

    def bit_update(index, value):
        while index <= n:
            bit[index] = max(bit[index], value)
            index += index & -index

    suffix_lis = [0] * n
    for i in range(n - 1, -1, -1):
        reversed_q = n - c[i]
        suffix_lis[i] = 1 + bit_query(reversed_q - 1)
        bit_update(reversed_q, suffix_lis[i])

    longest = max(suffix_lis)
    positions_by_length = [[] for _ in range(longest + 1)]
    for i, length in enumerate(suffix_lis):
        positions_by_length[length].append(i)

    # 二维 BIT 的外层坐标是反转后的 p 位置，内层坐标是反转后的 q 位置。
    # 先离线收集每个外层节点会用到的内层坐标，避免建立 n×n 网格。
    y_coordinates = [[] for _ in range(n + 1)]
    for i, q_pos in enumerate(c):
        x = n - i
        y = n - q_pos
        while x <= n:
            y_coordinates[x].append(y)
            x += x & -x

    trees = [None] * (n + 1)
    for x in range(1, n + 1):
        y_coordinates[x] = sorted(set(y_coordinates[x]))
        trees[x] = [0] * (len(y_coordinates[x]) + 1)

    def add_point(i):
        """激活点 (i, c[i])，权值是原排列中的值 p[i]。"""
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
        """查询反转坐标前缀矩形中的最大 p[i]。"""
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
    last_q_pos = -1

    for remain in range(longest, 0, -1):
        # 激活后，数据结构中恰好保留 suffix_lis >= remain 的位置。
        for i in positions_by_length[remain]:
            add_point(i)

        value = rectangle_max(
            n - last_pos - 1,
            n - last_q_pos - 1
        )
        answer.append(value)
        last_pos = pos_in_p[value]
        last_q_pos = pos_in_q[value]

    return answer


def solve():
    n = int(input())
    p = list(map(int, input().split()))
    q = list(map(int, input().split()))
    result = lexicographically_largest_lcs(p, q)
    print(len(result))
    print(*result)

T = int(input())
for _ in range(T):
    solve()
```

### 复杂度分析

**时间复杂度**：O(n log² n)。一维 BIT 计算后缀 LIS 为 O(n log n)，二维 BIT 的每个点只激活一次、每次更新或查询为 O(log² n)。
**空间复杂度**：O(n log n)，离线二维 BIT 中每个点会出现在 O(log n) 个外层节点。

---

## 小结

- 第一题是排序模拟题，核心是按 (值, 下标) 排序来处理"同值优先删左边"的规则，标记删除后按原顺序输出，是一道送分题
- 第二题利用"距离平方"避免浮点，对每个点预排距离后二分查找，本质是将"圆内点计数"转化为"有序数组前缀计数"，是排序 + 二分的经典应用
- 第三题是本场最难的题目，将两个排列的 LCS 转化为 LIS 是关键的第一步转化，随后用 BIT 计算后缀 LIS 长度，再用贪心按值降序逐位确定答案，需要对 LIS 的结构有深入理解
