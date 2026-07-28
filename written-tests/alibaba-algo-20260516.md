---
pageClass: exam-session-page
title: 阿里巴巴算法岗 2026-05-16
description: 阿里巴巴 2026-05-16 算法岗笔试真题，含三道 Python ACM 模式题解
---

<div class="exam-session-banner">
  <div>
    <span>ALIBABA / 2026.05.16 / ACM</span>
    <strong>阿里巴巴 · 算法岗</strong>
    <small>2026-05-16 · 三题 ACM · 难度 中等</small>
  </div>
  <div class="exam-session-banner__meta">
    <span>线性 DP</span>
    <span>组合计数</span>
    <span>有序集合维护连续段长度</span>
  </div>
</div>

# 阿里巴巴 2026-05-16 算法岗笔试解析

本场三道题均按原场次输入输出组织为完整 Python 程序，可直接在 ACM 环境运行。讲解重点包括建模、优化依据、实现细节与复杂度。

来源：[Zero2Leetcode · 阿里巴巴 2026-05-16 算法岗](https://onefly.top/zero2Leetcode/04_real_interviews/alibaba/algo-20260516/)。

## 本场考试概述

**考试时间**：2026年5月16日
**考试岗位**：算法岗（暑期实习/春招）
**难度评级**：中等

**考点分析**：

1. 第一题：线性 DP（难度中等）
2. 第二题：组合计数（难度中等）
3. 第三题：有序集合维护连续段长度（难度中等）

**建议策略**：

1. 三道题难度均衡、无特别难题，重点考察对经典模型的熟练度
2. 第一题核心是"相邻可配/不可配"的线性 DP 状态拆分，掌握 $f_i = f_{i-1} + [条件] \cdot f_{i-2}$ 即可
3. 第三题用有序集合（SortedList）维护所有"0 位置"，单点翻转只影响相邻段，局部更新即可

---

## 01 · 分组计数 {#problem-01}

### 题目描述

给定一个长度为 $n$ 的非递减序列 $a$，将所有人划分成若干组，每组恰好 $1$ 人或 $2$ 人。二人组中的两人必须在原序列中下标相邻（即由第 $i$ 和第 $i+1$ 人组成），且满足 $a_{i+1} - a_i \leq K$。

求满足条件的分组方案数，结果对 $10^9 + 7$ 取模。

多组测试数据，每组第一行两个整数 $n, K$，第二行 $n$ 个非递减整数。

### 样例

**输入**

```
3
4 1
1 2 4 10
4 0
1 2 3 4
5 2
1 1 2 4 7
```

**输出**

```
2
1
5
```

### 解题思路

**第一步：决策分析**

对于第 $i$ 个人，只有两种归属：

- 单独成组（永远合法）
- 与第 $i-1$ 个人配对（仅当 $a_i - a_{i-1} \leq K$ 时合法）

注意不能与第 $i+1$ 个人"向右配对"，因为如果第 $i$ 和第 $i+1$ 配了一组，从第 $i+1$ 的视角看就是"与前一个配对"，等价。

**第二步：状态设计**

设 $f_i$ 表示前 $i$ 个人的合法分组方案数。

- $f_0 = 1$（空集有一种方案）
- $f_1 = 1$（第一个人只能单独成组）

**第三步：转移方程**

$$f_i = f_{i-1} + [a_i - a_{i-1} \leq K] \cdot f_{i-2}$$

- $f_{i-1}$：第 $i$ 个人单独成组，前 $i-1$ 个人随意分
- $f_{i-2}$：第 $i$ 和第 $i-1$ 配对，前 $i-2$ 个人随意分（仅当差值合法时贡献）

最终答案为 $f_n$。

**实现注意**：$a_i$ 可达 $10^{18}$，差值在 64 位整型范围内计算即可。Python 无溢出问题。

### Python ACM 实现

下面的程序可直接提交到 ACM 判题环境，严格按本题样例的标准输入顺序读取。

```python
import sys
input = sys.stdin.readline

MOD = 10**9 + 7

def solve():
    n, k = map(int, input().split())
    a = list(map(int, input().split()))

    # f[i] = 前 i 个人的合法分组方案数
    f_prev2 = 1  # f[0]
    f_prev1 = 1  # f[1]

    for i in range(2, n + 1):
        f_cur = f_prev1
        if a[i - 1] - a[i - 2] <= k:
            f_cur = (f_cur + f_prev2) % MOD
        f_prev2, f_prev1 = f_prev1, f_cur

    print(f_prev1 if n >= 2 else 1)

T = int(input())
for _ in range(T):
    solve()
```

### 复杂度分析

**时间复杂度**：$O(n)$，单次线性扫描。
**空间复杂度**：$O(1)$（滚动变量），若存储数组则为 $O(n)$。

---

## 02 · 坏掉的键盘 {#problem-02}

### 题目描述

小明准备输入一个仅由小写英文字母组成的字符串 $S$，但键盘在一开始就有且仅有一个按键失灵。失灵的字母在 $S$ 中所有出现都没有被输入，最终得到的字符串为 $T$。已知原串 $S$ 中任意相邻两个字符都不相同。

对于每个可能失灵的小写字母 $c$（$a$ 到 $z$），计算满足条件的原串数量，然后将 26 种情况的数量求和。结果对 $10^9 + 7$ 取模。

多组测试数据，每组第一行整数 $n$，第二行字符串 $T$（长度 $n$）。

### 样例

**输入**

```
3
4
abac
4
aaaa
3
xyz
```

**输出**

```
736
100
368
```

### 解题思路

**第一步：哪些字母可以做失灵键？**

如果字母 $c$ 已在 $T$ 中出现，那么它不可能是失灵键（否则它也会被删掉）。所以候选失灵键数量为 $26 - \text{distinct}(T)$。

**第二步：分析插入空隙**

将 $T$ 视为有 $n+1$ 个空隙：$T$ 的最左端、最右端各一个，相邻字符之间共 $n-1$ 个内部空隙。失灵字母 $c$ 原本散布在这些空隙中。

**第三步：单个空隙的选择数**

由于原串相邻字符必须不同，而失灵字母 $c$ 不等于 $T$ 中任何字符：

- **内部空隙**（$T_i$ 和 $T_{i+1}$ 之间）：
  - 若 $T_i = T_{i+1}$：它们在原串中本不该相邻，**必须**放至少 $1$ 个 $c$ 隔开。又因为连续两个 $c$ 会相邻相同，所以恰好放 $1$ 个。贡献 $1$ 种选择。
  - 若 $T_i \neq T_{i+1}$：放 $0$ 个或 $1$ 个都合法。贡献 $2$ 种选择。

- **两端空隙**（$T$ 最左端和最右端）：各可放 $0$ 个或 $1$ 个 $c$，共 $2 \times 2 = 4$ 种。

**第四步：统计答案**

设 $T$ 中相邻不同的位置对数为 $\text{ne}$（即 $T_i \neq T_{i+1}$ 的 $i$ 的数量），则单个失灵键贡献的原串数为：

$$4 \times 2^{\text{ne}}$$

总答案为：

$$(26 - \text{distinct}) \times 4 \times 2^{\text{ne}} \mod (10^9 + 7)$$

### Python ACM 实现

下面的程序可直接提交到 ACM 判题环境，严格按本题样例的标准输入顺序读取。

```python
import sys
input = sys.stdin.readline

MOD = 10**9 + 7

def solve():
    n = int(input())
    s = input().strip()

    distinct = len(set(s))
    # 相邻不同的位置对数
    ne = sum(1 for i in range(1, n) if s[i] != s[i - 1])
    # 候选失灵键数 * 两端4种 * 内部不同位2^ne种
    ans = (26 - distinct) * (pow(2, ne, MOD) * 4 % MOD) % MOD
    print(ans)

T = int(input())
for _ in range(T):
    solve()
```

### 复杂度分析

**时间复杂度**：$O(n)$，扫描一遍字符串。
**空间复杂度**：$O(n)$，存储字符串。

---

## 03 · 小红的 01 串操作 {#problem-03}

### 题目描述

定义一个 01 串的**权值**为：所有仅由 $1$ 组成的非空连续子串数量。若一段连续 $1$ 的长度为 $L$，则该段贡献 $\frac{L(L+1)}{2}$ 个全 $1$ 子串。

给定长为 $n$ 的 01 串，执行 $q$ 次操作，每次选取某一位将其反置（$0 \to 1$ 或 $1 \to 0$）。输出每次操作后的权值。

第一行 $n, q$，第二行 01 串，之后 $q$ 行每行一个位置 $k$（1-indexed）。

### 样例

**输入**

```
5 2
10010
2
3
```

**输出**

```
4
10
```

### 解题思路

**第一步：权值等价于什么？**

权值 = 所有极大连续 $1$ 段的 $\frac{L(L+1)}{2}$ 之和，其中 $L$ 是每段长度。记 $\text{tri}(L) = \frac{L(L+1)}{2}$。

**第二步：翻转一位的影响**

每次操作只翻转一个位置，影响范围局限于该位置所在（或相邻）的连续段：

- **$1 \to 0$**：原来包含该位置的一段 $1$ 被拆成左右两段。设原段长为 $L + 1 + R$，拆成长度 $L$ 和 $R$ 的两段。权值变化：$\text{tri}(L) + \text{tri}(R) - \text{tri}(L + 1 + R)$。
- **$0 \to 1$**：该位置左侧和右侧的两段 $1$ 合并为一段。设左段长 $L$，右段长 $R$，合并后长 $L + 1 + R$。权值变化：$\text{tri}(L + 1 + R) - \text{tri}(L) - \text{tri}(R)$。

**第三步：数据结构选择**

需要快速查找某位置左右最近的 $0$ 的位置。用树状数组维护每个位置是否为 $0$。前缀和给出左侧 $0$ 的数量，再用树状数组二分找到对应的前驱和后继；边界用虚拟位置 $0$ 与 $n+1$ 表示。

**第四步：初始化**

扫描原串，把所有 $0$ 的位置加入有序集合。同时计算初始权值：扫描所有极大 $1$ 段，累加 $\text{tri}(L)$。

### Python ACM 实现

下面的程序可直接提交到 ACM 判题环境，严格按本题样例的标准输入顺序读取。

```python
import sys

input = sys.stdin.readline


def tri(length):
    return length * (length + 1) // 2


class Fenwick:
    def __init__(self, size):
        self.size = size
        self.tree = [0] * (size + 1)

    def add(self, index, delta):
        while index <= self.size:
            self.tree[index] += delta
            index += index & -index

    def prefix_sum(self, index):
        total = 0
        while index > 0:
            total += self.tree[index]
            index -= index & -index
        return total

    def kth(self, order):
        """返回第 order 个 0 所在的位置，order 从 1 开始。"""
        index = 0
        step = 1 << (self.size.bit_length() - 1)
        while step:
            next_index = index + step
            if next_index <= self.size and self.tree[next_index] < order:
                index = next_index
                order -= self.tree[next_index]
            step >>= 1
        return index + 1


def main():
    n, q = map(int, input().split())
    bits = list(input().strip())
    zeros = Fenwick(n)
    zero_count = 0

    total = 0
    run = 0
    for index, value in enumerate(bits, 1):
        if value == "0":
            zeros.add(index, 1)
            zero_count += 1
            total += tri(run)
            run = 0
        else:
            run += 1
    total += tri(run)

    def neighbors(position):
        # 统计左侧 0 的数量，再用 Fenwick 二分找到前驱和后继。
        left_count = zeros.prefix_sum(position - 1)
        left_zero = zeros.kth(left_count) if left_count else 0
        right_zero = zeros.kth(left_count + 1) if left_count < zero_count else n + 1
        return left_zero, right_zero

    answers = []
    for _ in range(q):
        position = int(input())

        if bits[position - 1] == "1":
            left_zero, right_zero = neighbors(position)
            left_length = position - left_zero - 1
            right_length = right_zero - position - 1
            total += (
                tri(left_length)
                + tri(right_length)
                - tri(left_length + right_length + 1)
            )
            zeros.add(position, 1)
            zero_count += 1
            bits[position - 1] = "0"
        else:
            # 先从集合删除当前位置，再查询两侧仍然存在的 0。
            zeros.add(position, -1)
            zero_count -= 1
            left_zero, right_zero = neighbors(position)
            left_length = position - left_zero - 1
            right_length = right_zero - position - 1
            total += (
                tri(left_length + right_length + 1)
                - tri(left_length)
                - tri(right_length)
            )
            bits[position - 1] = "1"

        answers.append(str(total))

    sys.stdout.write("\n".join(answers))


main()
```

### 复杂度分析

**时间复杂度**：$O((n + q) \log n)$，每次操作通过树状数组完成前驱、后继与单点更新。
**空间复杂度**：$O(n)$，存储字符串与树状数组。

---

## 小结

- **第一题（分组计数）**：经典线性 DP，状态转移只依赖前两项，转移条件由相邻差值决定——遇到"相邻元素可配/不可配"的分组问题，优先想到 $f_i = f_{i-1} + [条件] \cdot f_{i-2}$
- **第二题（坏掉的键盘）**：组合计数思维，关键洞察是"每个空隙独立选择"，乘法原理直接算——枚举失灵键后，插入位置的选择互不影响，用乘法把各空隙的选择数相乘即可
- **第三题（01 串操作）**：用有序集合维护 $0$ 位置实现 $O(\log n)$ 局部更新——翻转一位只影响相邻段的合并或拆分，掌握 $\text{tri}(L)$ 差分公式即可快速更新权值
