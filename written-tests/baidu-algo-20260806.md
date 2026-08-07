---
pageClass: exam-session-page
title: 百度算法岗 2026-08-06
description: 百度 2026-08-06 算法岗笔试真题，含 3 道 Python ACM 模式题解
---

<div class="exam-session-banner">
  <div>
    <span>BAIDU / 2026.08.06 / ACM</span>
    <strong>百度 · 算法岗</strong>
    <small>2026-08-06 · 3 题 ACM · 难度 中等</small>
  </div>
  <div class="exam-session-banner__meta">
    <span>极差与区间合并贪心</span>
    <span>异或与二进制进位</span>
    <span>置换环、KMP 与 LCM</span>
  </div>
</div>

# 百度 2026-08-06 算法岗笔试解析

本场统一整理为完整 Python 3 ACM 程序。每题依次给出完整题意、输入输出、样例、建模过程、正确性证明、复杂度和易错点，代码中的关键步骤配有中文注释。

来源：[Zero2Leetcode · 百度 2026-08-06 算法岗](https://onefly.top/zero2Leetcode/04_real_interviews/baidu/algo-20260806/)。题面在不改变约束与判定规则的前提下重新表述。

## 本场考试概述

**考试时间**：2026 年 8 月 6 日

**考试岗位**：算法岗

**整体难度**：中等

**考点分布**：

- 第一题：极差、连续分段、区间合并贪心；
- 第二题：异或、按位与、二进制加法与 `lowbit`；
- 第三题：置换环、KMP 最小循环节、质因数分解与最小公倍数。

---

## 01 · 平衡度划分 {#problem-01}

### 题目描述

给定一个长度为 $n$ 的整数序列 $a_1,a_2,\ldots,a_n$。你需要把整个序列划分成若干个非空连续子段，每个元素必须且只能属于其中一个子段。

对任意子段 $[l,r]$，定义它的平衡度为

$$
B(l,r)=\left(\max_{l\le i\le r}a_i-\min_{l\le i\le r}a_i\right)(r-l+1).
$$

一次划分的价值等于所有子段平衡度之和。请计算所有合法划分能够取得的最大价值。

### 输入描述

第一行输入整数 $T$，表示测试数据组数，满足 $1\le T\le 10^4$。

每组测试数据包含两行：

- 第一行输入整数 $n$，满足 $1\le n\le 3\times10^5$；
- 第二行输入 $n$ 个整数 $a_1,a_2,\ldots,a_n$，满足 $1\le a_i\le 10^9$。

保证一个输入文件内所有测试数据的 $n$ 之和不超过 $3\times10^5$。

### 输出描述

对每组测试数据输出一行一个整数，表示最大划分价值。

### 样例

**输入**

```
3
5
1 3 2 5 4
1
7
4
2 2 2 2
```

**输出**

```
20
0
0
```

第一组将整个序列保留为一个子段，可得到 $(5-1)\times5=20$。

### 解题思路

#### 1. 比较“切开前”与“切开后”

设一个子段的最大值、最小值和长度分别为 $M,m,L$，把它从中间切成长度为 $L_1,L_2$ 的两个非空子段。两段各自的最大值不会超过 $M$，最小值不会小于 $m$，因此两段极差都不超过 $M-m$。

切开后的贡献至多为

$$
(M-m)L_1+(M-m)L_2=(M-m)L,
$$

它正好等于切开前的贡献上界。也就是说，**切开一个子段不会使答案变大**。

#### 2. 反向理解为合并贪心

从任意划分开始，不断合并相邻子段，价值都不会下降。最终所有子段合并成整个序列，所以不切分一定不劣于任意其他方案。

答案直接为

$$
\left(\max_{1\le i\le n}a_i-\min_{1\le i\le n}a_i\right)n.
$$

这道题表面像复杂的分段优化，真正的突破口是证明“合并不会变差”。

### 正确性证明

任取某个子段，记其极差为 $R$。将它切成两个子段后，每个新子段的所有元素仍来自原子段，因此两个新子段的极差都不超过 $R$。若两段长度分别为 $L_1,L_2$，切开后的总贡献不超过 $RL_1+RL_2=R(L_1+L_2)$，这就是原子段的贡献。

所以对任何合法划分，合并任意两个相邻子段都不会减小总价值。反复合并直到只剩整个序列，得到的价值不小于原划分。算法计算的正是整段不切时的价值，因此它等于全局最优值。

### Python ACM 实现

```python
import sys


def solve():
    data = list(map(int, sys.stdin.buffer.read().split()))
    iterator = iter(data)
    test_count = next(iterator)
    answers = []

    for _ in range(test_count):
        n = next(iterator)
        first = next(iterator)
        minimum = first
        maximum = first

        # 只需维护全局最小值和最大值，不必保存整个数组。
        for _ in range(n - 1):
            value = next(iterator)
            minimum = min(minimum, value)
            maximum = max(maximum, value)

        answers.append(str((maximum - minimum) * n))

    sys.stdout.write('\n'.join(answers))


if __name__ == '__main__':
    solve()
```

### 复杂度分析

设当前测试数据的序列长度为 $n$。

- **时间复杂度**：$O(n)$；
- **额外空间复杂度**：$O(1)$。一次性输入和答案缓冲不计入额外空间。

### 易错点

- 不要被“连续划分”诱导去写 $O(n^2)$ 的区间 DP；
- 最大答案约为 $(10^9-1)\times3\times10^5$，固定宽度语言要使用 64 位整数；
- $n=1$ 或所有元素相同时，答案自然为 $0$。

---

## 02 · 最小爆发值 {#problem-02}

### 题目描述

给定正整数 $n$。选择一个整数 $x$，满足 $0\le x\le n$，把 $n$ 分成 $x$ 和 $n-x$ 两部分。

这次分割的爆发值定义为

$$
V(x)=x\oplus(n-x),
$$

其中 $\oplus$ 表示按位异或。请计算爆发值的最小可能值。

### 输入描述

第一行输入整数 $T$，表示测试数据组数，满足 $1\le T\le10^5$。

接下来 $T$ 行，每行输入一个整数 $n$，满足 $1\le n\le10^{18}$。

### 输出描述

对每组测试数据输出一行一个整数，表示最小爆发值。

### 样例

**输入**

```
5
1
4
11
7
1000000000000000000
```

**输出**

```
1
0
3
7
0
```

例如 $n=11$ 时可取 $x=4$，另一部分为 $7$，此时 $4\oplus7=3$。

### 解题思路

#### 1. 用二进制加法恒等式建立约束

令

$$
y=n-x,\qquad s=x\oplus y,\qquad c=x\mathbin{\&}y.
$$

任意两个非负整数都满足

$$
x+y=(x\oplus y)+2(x\mathbin{\&}y),
$$

所以

$$
n=s+2c.
$$

同时 $s\mathbin{\&}c=0$，因为同一个二进制位不可能既表示 $x,y$ 不同，又表示二者都为 $1$。

#### 2. 观察 $n$ 末尾连续的 $1$

设 $n$ 的二进制末尾有 $t$ 个连续的 $1$。从最低位向高位考察 $n=s+2c$：

- $2c$ 的最低位一定为 $0$，因此 $s$ 的最低位必须为 $1$；
- 又因为 $s\mathbin{\&}c=0$，$c$ 的最低位只能为 $0$；
- 上一位没有进位，继续同样推导，可知 $s$ 的低 $t$ 位都必须为 $1$。

于是任何合法答案都满足

$$
s\ge 2^t-1.
$$

#### 3. 证明下界能够达到

令

$$
s=2^t-1,\qquad c=\frac{n-s}{2}.
$$

因为 $n$ 的末尾恰有 $t$ 个 $1$，所以 $c$ 的低 $t$ 位全是 $0$，从而 $s\mathbin{\&}c=0$。取 $x=s+c$、$y=c$，就有 $x+y=n$ 且 $x\oplus y=s$，所以这个下界确实可达。

当 $n$ 末尾有 $t$ 个 $1$ 时，$n+1$ 末尾恰有 $t$ 个 $0$，于是

$$
2^t=\operatorname{lowbit}(n+1)=(n+1)\mathbin{\&}(-(n+1)).
$$

最终答案为

$$
\boxed{\operatorname{lowbit}(n+1)-1}.
$$

### 正确性证明

由 $n=s+2c$、$s\mathbin{\&}c=0$，从最低位开始归纳，可以证明 $s$ 的低 $t$ 位必须全为 $1$，因此任意合法分割的爆发值至少为 $2^t-1$。

另一方面，取 $s=2^t-1$、$c=(n-s)/2$。此时 $s$ 与 $c$ 的二进制 $1$ 不重叠。令 $x=s+c$、$y=c$，则 $x=s\oplus c$，所以 $x\oplus y=s$；同时 $x+y=s+2c=n$。这构造出了爆发值恰为 $2^t-1$ 的合法分割。

算法输出值既是所有方案的下界，又能被某个方案取得，因此就是最小爆发值。

### Python ACM 实现

```python
import sys


def minimum_burst(n):
    value = n + 1
    # lowbit(value) 等于 n 末尾连续 1 的数量所对应的 2 的幂。
    return (value & -value) - 1


def solve():
    data = list(map(int, sys.stdin.buffer.read().split()))
    test_count = data[0]
    answers = []

    for index in range(1, test_count + 1):
        answers.append(str(minimum_burst(data[index])))

    sys.stdout.write('\n'.join(answers))


if __name__ == '__main__':
    solve()
```

### 复杂度分析

- **时间复杂度**：每组 $O(1)$，全部测试为 $O(T)$；
- **额外空间复杂度**：除输入输出缓冲外为 $O(1)$。

### 易错点

- $x$ 允许取 $0$ 或 $n$，不要擅自要求两部分均为正数；
- 偶数 $n$ 的答案为 $0$，可取 $x=n/2$；
- $n$ 可达 $10^{18}$，不能枚举 $x$；
- 公式对 `n + 1` 求 `lowbit`，不是对 `n` 求。

---

## 03 · 旋转跳跃 {#problem-03}

### 题目描述

给定一个长度为 $n$、只包含小写英文字母的字符串 $s$，以及一个 $1$ 到 $n$ 的排列 $a_1,a_2,\ldots,a_n$。字符串下标从 $1$ 开始。

一次操作会生成新字符串 $t$，其中

$$
t_i=s_{a_i},\qquad 1\le i\le n,
$$

随后用 $t$ 替换 $s$。不断重复同一操作，求字符串第一次恢复为初始字符串所需的最少正整数操作次数 $k$。由于答案可能很大，输出 $k\bmod(10^9+7)$。

### 输入描述

第一行输入整数 $T$，表示测试数据组数，满足 $1\le T\le2\times10^5$。

每组测试数据包含三行：

- 第一行输入整数 $n$，满足 $1\le n\le2\times10^5$；
- 第二行输入长度为 $n$ 的小写字母字符串 $s$；
- 第三行输入 $n$ 个整数 $a_1,a_2,\ldots,a_n$，它们构成 $1$ 到 $n$ 的排列。

保证一个输入文件内所有测试数据的 $n$ 之和不超过 $2\times10^5$。

### 输出描述

对每组测试数据输出一行一个整数，表示最少正操作次数对 $10^9+7$ 取模后的结果。

### 样例

**输入**

```
3
5
abcde
2 3 1 5 4
4
aaaa
2 1 4 3
4
abab
2 3 4 1
```

**输出**

```
6
1
2
```

第一组的排列包含长度为 $3$ 和 $2$ 的两个环，环上字符的最小循环节分别为 $3$ 和 $2$，所以答案为 $\operatorname{lcm}(3,2)=6$。第三组只有一个长度为 $4$ 的环，但环上的字符序列是 `abab`，移动 $2$ 位就已经恢复。

### 解题思路

#### 1. 把操作拆成互不影响的置换环

执行一次后，位置 $i$ 的字符来自旧位置 $a_i$；执行 $k$ 次后，它来自初始位置 $a^k(i)$。因为 $a$ 是排列，所有位置能够唯一地分解成若干个互不相交的环。

沿 $i\to a_i$ 遍历某个长度为 $L$ 的环，按顺序记录字符

$$
c_0,c_1,\ldots,c_{L-1}.
$$

执行 $k$ 次后，这个环恢复的条件是

$$
c_{(j+k)\bmod L}=c_j,\qquad 0\le j<L.
$$

因此每个环需要的最少操作次数，不一定是环长，而是环上字符序列的**最小循环节**。

#### 2. 用 KMP 求最小循环节

对长度为 $L$ 的字符序列求 KMP 前缀函数 $\pi$。令

$$
d_0=L-\pi_{L-1}.
$$

若 $d_0$ 能整除 $L$，序列由长度为 $d_0$ 的模式完整重复组成，最小循环节就是 $d_0$；否则最小循环节是 $L$。

#### 3. 合并所有环的恢复条件

若各环的最小循环节为 $d_1,d_2,\ldots$，整个字符串恢复要求操作次数同时是所有 $d_i$ 的倍数，所以

$$
k=\operatorname{lcm}(d_1,d_2,\ldots).
$$

不能在求最小公倍数的过程中直接对数值取模，因为取模会破坏整除关系。正确做法是先把每个 $d_i$ 分解质因数：

$$
d_i=\prod_p p^{e_p(d_i)}.
$$

LCM 中每个质数 $p$ 的指数等于 $\max_i e_p(d_i)$。预处理最小质因子 `spf` 后，记录各质数出现过的最大指数，最后计算

$$
\prod_p p^{\max_i e_p(d_i)}\bmod(10^9+7).
$$

### 正确性证明

执行 $k$ 次操作后，位置 $i$ 的字符来自初始位置 $a^k(i)$，这一点可由操作定义直接归纳得到。于是对某个置换环而言，执行操作等价于循环移动环上的字符序列；环第一次恢复所需的操作次数，正是该字符序列的最小循环节 $d_i$。

不同置换环互不相交。整个字符串在第 $k$ 次操作后恢复，当且仅当每个环都恢复，也就是对所有环都有 $d_i\mid k$。满足这些整除条件的最小正整数是 $\operatorname{lcm}(d_1,d_2,\ldots)$。

算法用 KMP 正确求出每个 $d_i$，再对质因数指数逐项取最大值，这恰好得到最小公倍数的唯一标准分解。最后才对结果取模，因此算法输出的是题目要求的答案。

### Python ACM 实现

```python
import sys

MOD = 10 ** 9 + 7
MAX_N = 200_000


def build_smallest_prime_factor(limit):
    """预处理每个正整数的最小质因子。"""
    spf = list(range(limit + 1))
    spf[1] = 1

    factor = 2
    while factor * factor <= limit:
        if spf[factor] == factor:
            for multiple in range(factor * factor, limit + 1, factor):
                if spf[multiple] == multiple:
                    spf[multiple] = factor
        factor += 1

    return spf


SPF = build_smallest_prime_factor(MAX_N)


def minimum_period(chars):
    """使用 KMP 前缀函数求字符序列的最小循环节。"""
    length = len(chars)
    prefix = [0] * length

    for index in range(1, length):
        matched = prefix[index - 1]
        while matched > 0 and chars[index] != chars[matched]:
            matched = prefix[matched - 1]
        if chars[index] == chars[matched]:
            matched += 1
        prefix[index] = matched

    candidate = length - prefix[-1]
    return candidate if length % candidate == 0 else length


def solve_case(n, text, permutation):
    visited = [False] * n
    maximum_exponent = {}

    for start in range(n):
        if visited[start]:
            continue

        # 沿 i -> a[i] 取出一个完整置换环上的字符序列。
        cycle_chars = []
        current = start
        while not visited[current]:
            visited[current] = True
            cycle_chars.append(text[current])
            current = permutation[current]

        period = minimum_period(cycle_chars)

        # LCM 只保留每个质数在所有周期中的最高指数。
        while period > 1:
            prime = SPF[period]
            exponent = 0
            while period % prime == 0:
                period //= prime
                exponent += 1
            maximum_exponent[prime] = max(
                maximum_exponent.get(prime, 0),
                exponent
            )

    answer = 1
    for prime, exponent in maximum_exponent.items():
        answer = answer * pow(prime, exponent, MOD) % MOD
    return answer


def solve():
    input = sys.stdin.buffer.readline
    test_count = int(input())
    answers = []

    for _ in range(test_count):
        n = int(input())
        text = input().strip().decode()
        permutation = [value - 1 for value in map(int, input().split())]
        answers.append(str(solve_case(n, text, permutation)))

    sys.stdout.write('\n'.join(answers))


if __name__ == '__main__':
    solve()
```

### 复杂度分析

令 $V=2\times10^5$，当前测试数据的字符串长度为 $n$。

- **预处理时间复杂度**：$O(V\log\log V)$；
- **每组时间复杂度**：拆环和全部 KMP 的总长度为 $O(n)$，质因数分解为 $O(n\log n)$ 的宽松上界；
- **空间复杂度**：$O(V+n)$，用于最小质因子表、访问标记和 KMP 前缀函数。

### 易错点

- 操作方向是 $t_i=s_{a_i}$，代码沿 `i -> a[i]` 拆环；
- 不能只对置换环长度求 LCM，重复字符可能使环提前恢复；
- `L - prefix[-1]` 只有能整除 $L$ 时才是完整循环节；
- 不要先对 LCM 取模再继续求 GCD，应先合并质因数最高指数；
- 题目要求最少**正**操作次数，所有环周期均为 $1$ 时答案也是 $1$。

---

## 本场知识清单

- 用“合并相邻段不会变差”排除伪区间 DP；
- 熟记 $x+y=(x\oplus y)+2(x\mathbin{\&}y)$，并能把二进制低位约束转成闭式；
- 置换问题先拆环，环上对象可能存在比环长更短的真实周期；
- KMP 前缀函数不仅能匹配字符串，也能求最小循环节；
- 超大 LCM 不应边取模边做整除运算，应维护质因数最高指数。
