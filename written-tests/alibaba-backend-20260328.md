---
pageClass: exam-session-page
title: 阿里巴巴后端开发岗 2026-03-28
description: 阿里巴巴 2026-03-28 后端开发岗笔试真题，含三道 Python ACM 模式题解
---

<div class="exam-session-banner">
  <div>
    <span>ALIBABA / 2026.03.28 / ACM</span>
    <strong>阿里巴巴 · 后端开发岗</strong>
    <small>2026-03-28 · 三题 ACM · 难度 中等偏难</small>
  </div>
  <div class="exam-session-banner__meta">
    <span>列车相对静止</span>
    <span>隐式素数</span>
    <span>二进制操作</span>
  </div>
</div>

# 阿里巴巴 2026-03-28 后端开发岗笔试解析

本场三道题均按原场次输入输出组织为完整 Python 程序，可直接在 ACM 环境运行。讲解重点包括建模、优化依据、实现细节与复杂度。

来源：[Zero2Leetcode · 阿里巴巴 2026-03-28 后端开发岗](https://onefly.top/zero2Leetcode/04_real_interviews/alibaba/backend-20260328/)。

## 本场考试概述

**考试时间**：2026年3月28日
**考试岗位**：后端开发岗
**难度评级**：中等偏难

**考点分析**：

- 第一题：并查集（难度中等）
- 第二题：数论 + 素数计数（难度困难）
- 第三题：模拟 + 位运算（难度中等）

**建议策略**：

- 第一题是经典并查集，熟悉模板可以快速拿下
- 第二题数论推导有一定难度，但想清楚"隐式素数=素数幂"这一关键结论就能写出来
- 第三题模拟题，注意用数组/deque维护二进制位，避免大整数运算

---

## 01 · 列车相对静止 {#problem-01}

### 题目描述

给定 n 辆列车的相对静止矩阵信息，其中至少存在一辆列车真正静止。相对静止关系具有传递性。请计算可能真正静止的列车数量的最小值和最大值。

### 样例

**输入**

```
2
1 0
0 1
```

**输出**

```
1 1
```

### 解题思路：并查集

相对静止关系是等价关系，将列车划分为若干等价类。"真正静止"的列车必须恰好是某一个等价类的全部成员。最小值 = 最小等价类大小，最大值 = 最大等价类大小。

**时间复杂度**：O(n^2)。

### Python ACM 实现

下面的程序可直接提交到 ACM 判题环境，严格按本题样例的标准输入顺序读取。

```python
import sys
input = sys.stdin.readline

# 核心步骤：列车相对静止；实现顺序与上文推导保持一致。

def main():
    n = int(input())
    fa = list(range(n))

    def find(x):
        while fa[x] != x:
            fa[x] = fa[fa[x]]
            x = fa[x]
        return x

    def unite(x, y):
        fa[find(x)] = find(y)

    for i in range(n):
        row = list(map(int, input().split()))
        for j in range(n):
            if row[j] == 1:
                unite(i, j)

    cnt = {}
    for i in range(n):
        r = find(i)
        cnt[r] = cnt.get(r, 0) + 1

    print(min(cnt.values()), max(cnt.values()))

main()
```

---

## 02 · 隐式素数 {#problem-02}

### 题目描述

正整数 n 的正因子个数为素数时，称 n 为隐式素数。给定闭区间 [l, r]（最大 2*10^9），计算区间内隐式素数的个数。

### 样例

**输入**

```
2
1 10
10 20
```

**输出**

```
6
5
```

**样例解释**：[1,10] 中的隐式素数为 2, 3, 4, 5, 7, 9 共 6 个。

### 解题思路：数论 + 素数计数

**关键推导**：因子个数 d(n) = (e1+1)(e2+1)... 要是素数，n 只能有一个质因子，即 n = p^(q-1)，其中 p、q 都是素数。

**结论**：隐式素数 = 所有素数（p^1, d=2）+ 所有素数的平方（p^2, d=3）+ 素数的四次方（p^4, d=5）+ ...

**实现**：
- 用 Lucy DP 高效计算区间内素数个数，复杂度 O(n^{2/3})
- 预枚举所有高次素数幂，二分查找统计区间内个数

**时间复杂度**：O(n^{2/3})。

### Python ACM 实现

下面的程序可直接提交到 ACM 判题环境，严格按本题样例的标准输入顺序读取。

```python
import sys
from bisect import bisect_left, bisect_right
from math import isqrt
input = sys.stdin.readline

# 核心步骤：隐式素数；实现顺序与上文推导保持一致。

def prime_count(n):
    if n < 2:
        return 0
    s = isqrt(n)
    while (s + 1) * (s + 1) <= n:
        s += 1
    while s * s > n:
        s -= 1
    small = [0] * (s + 2)
    for i in range(2, s + 2):
        small[i] = i - 1
    large = [0] * (s + 2)
    for k in range(1, s + 1):
        large[k] = n // k - 1
    for p in range(2, s + 1):
        if small[p] <= small[p - 1]:
            continue
        cnt = small[p - 1]
        p2 = p * p
        upper = min(s, n // p2)
        for k in range(1, upper + 1):
            j = k * p
            if j <= s:
                large[k] -= large[j] - cnt
            else:
                large[k] -= small[n // j] - cnt
        for v in range(s, p2 - 1, -1):
            small[v] -= small[v // p] - cnt
    return large[1]

def main():
    MAX_VAL = 2_000_000_000
    LIM = 44722
    is_prime = [True] * (LIM + 1)
    is_prime[0] = is_prime[1] = False
    for i in range(2, isqrt(LIM) + 1):
        if is_prime[i]:
            for j in range(i * i, LIM + 1, i):
                is_prime[j] = False

    exps = [2, 4, 6, 10, 12, 16, 18, 22, 28, 30]
    powers = []
    for e in exps:
        for p in range(2, LIM + 1):
            if not is_prime[p]:
                continue
            val = p ** e
            if val > MAX_VAL:
                break
            powers.append(val)
    powers.sort()

    T = int(input())
    out = []
    for _ in range(T):
        l, r = map(int, input().split())
        count = prime_count(r) - prime_count(l - 1)
        lo = bisect_left(powers, l)
        hi = bisect_right(powers, r)
        count += hi - lo
        out.append(str(count))
    sys.stdout.write('\n'.join(out) + '\n')

main()
```

---

## 03 · 二进制操作 {#problem-03}

### 题目描述

给定初始值为 0 的整数 x 和操作字符串（`+` `-` `*` `/`），每次操作后输出 x 的二进制中 1 的个数。n 最大 10^6，连续 `*` 操作会使数指数增长，无法用普通整型存储。

### 样例

**输入**

```
7
++-*-//
```

**输出**

```
1
1
1
1
1
0
0
```

### 解题思路：数组模拟二进制位

用数组存储 x 的每一位（LSB 在前），维护 popcount 计数器：

- `*`：左移一位，popcount 不变
- `/`：右移一位，若移除位是 1 则 popcount 减 1
- `+`：进位链——从最低位找第一个 0，途中 1 变 0，该 0 变 1
- `-`：借位链——从最低位找第一个 1，途中 0 变 1，该 1 变 0

根据二进制计数器均摊分析，n 次操作总位翻转次数为 O(n)。

**时间复杂度**：O(n)（均摊）。

### Python ACM 实现

下面的程序可直接提交到 ACM 判题环境，严格按本题样例的标准输入顺序读取。

```python
import sys
input = sys.stdin.readline

# 核心步骤：二进制操作；实现顺序与上文推导保持一致。

def main():
    n = int(input())
    s = input().strip()
    max_bits = 2 * n + 10
    bits = [0] * max_bits
    lo = n + 5
    hi = lo
    popcount = 0
    out = []
    for ch in s:
        if ch == '*':
            if hi > lo:
                lo -= 1
                bits[lo] = 0
        elif ch == '/':
            if hi > lo:
                if bits[lo] == 1:
                    popcount -= 1
                bits[lo] = 0
                lo += 1
                while hi > lo and bits[hi - 1] == 0:
                    hi -= 1
        elif ch == '+':
            i = lo
            while i < hi and bits[i] == 1:
                bits[i] = 0
                popcount -= 1
                i += 1
            if i < hi:
                bits[i] = 1
            else:
                bits[hi] = 1
                hi += 1
            popcount += 1
        else:  # '-'
            if popcount > 0:
                i = lo
                while i < hi and bits[i] == 0:
                    bits[i] = 1
                    popcount += 1
                    i += 1
                if i < hi:
                    bits[i] = 0
                    popcount -= 1
                while hi > lo and bits[hi - 1] == 0:
                    hi -= 1
        out.append(str(popcount))
    sys.stdout.write('\n'.join(out) + '\n')

main()
```

---

## 小结

- 第一题并查集模板题，将等价关系转化为等价类划分
- 第二题数论推导是核心：隐式素数 = 素数幂，结合 Lucy DP 处理大范围素数计数
- 第三题用数组模拟二进制位避免大整数，均摊分析保证线性复杂度
