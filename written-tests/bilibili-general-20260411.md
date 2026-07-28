---
pageClass: exam-session-page
title: 哔哩哔哩通用岗 2026-04-11
description: 哔哩哔哩 2026-04-11 通用岗笔试真题，含 2 道 Python ACM 模式题解
---

<div class="exam-session-banner">
  <div>
    <span>BILIBILI / 2026.04.11 / ACM</span>
    <strong>哔哩哔哩 · 通用岗</strong>
    <small>2026-04-11 · 2 题 ACM · 难度 中等偏难</small>
  </div>
  <div class="exam-session-banner__meta">
    <span>数位DP</span>
    <span>矩阵遍历/模拟</span>
  </div>
</div>

# 哔哩哔哩 2026-04-11 通用岗笔试解析

本场统一整理为完整 Python 3 ACM 程序。每题保留标准输入输出、建模过程、正确性依据、复杂度、易错点和关键中文注释；原 SQL、Shell 与第三方机器学习库题也已改写为可独立运行的标准库版本。

来源：[Zero2Leetcode · 哔哩哔哩 2026-04-11 通用岗](https://onefly.top/zero2Leetcode/04_real_interviews/bilibili/general-20260411/)。

## 本场考试概述

**考试时间**：2026年4月11日
**考试岗位**：通用
**难度评级**：中等偏难

**考点分析**：

1. 第一题：数位DP（难度困难）
2. 第二题：矩阵遍历/模拟（难度简单）

**建议策略**：

1. 第二题模拟题是送分题，务必先拿下
2. 第一题数位 DP 是高频考点，建议提前掌握记忆化搜索框架

---

## 01 · AK机与区间 {#problem-01}

### 题目描述

给定区间 [l, r]，统计其中满足"十进制表示的第一位数字和最后一位数字相等"的数的个数。不含前导零。

### 样例

**输入**

```
1 10
```

**输出**

```
9
```

**输入**

```
88 100
```

**输出**

```
2
```

### 解题思路

**第一步：观察题目性质**

l, r 高达 10^18，逐个枚举不可行，需要按位分析每个数字的结构。经典的前缀差分思路：答案 = f(r) - f(l-1)，其中 f(n) 表示 [1, n] 中满足条件的数的个数。

**第二步：数位 DP 状态设计**

从高位到低位逐位填入数字，用记忆化搜索统计。状态为 (pos, first, tight, started)：pos 为当前位，first 记录首位数字，tight 表示是否仍贴着上界，started 标记是否已填过非零数字。

**第三步：实现要点**

在尚未开始时遇到 0 继续跳过（前导零），遇到非零数字则记为首位。填到最后一位时，只有该位数字等于 first 时才计数。对于单位数（首位即末位），直接计数。

### 正确性依据

上述状态、枚举或贪心不变量保留了决定后续结果的全部信息；每个合法选择都被覆盖且不会重复计数。按处理顺序归纳，程序得到的最终状态与题目目标等价。

### Python ACM 实现

下面给出完整标准输入、标准输出程序，可直接在 Python 3 ACM 环境运行。

```python
from functools import lru_cache

def count(n):
    if n <= 0:
        return 0
    s = str(n)
    length = len(s)

    @lru_cache(maxsize=None)
    def dp(pos, first, tight, started):
        if pos == length:
            return 1 if started else 0
        limit = int(s[pos]) if tight else 9
        res = 0
        for d in range(0, limit + 1):
            nt = tight and (d == limit)
            if not started and d == 0:
                res += dp(pos + 1, 0, nt, False)
            elif not started and d > 0:
                if pos == length - 1:
                    # 单位数，首位即末位
                    res += 1
                else:
                    res += dp(pos + 1, d, nt, True)
            else:
                if pos == length - 1:
                    # 最后一位必须等于首位
                    if d == first:
                        res += 1
                else:
                    res += dp(pos + 1, first, nt, True)
        return res

    return dp(0, 0, True, False)

l, r = map(int, input().split())
print(count(r) - count(l - 1))
```

### 易错点

- 严格区分题面中的“严格大于/不小于”、开闭区间与下标起点。
- 多组测试时必须重置状态；大规模累加按题面需要使用 Python 整数或取模。

### 复杂度分析

**时间复杂度**：O(D * 10 * 10 * 2 * 2)，其中 D 为数字位数（最多 19 位），总状态数约 7600。
**空间复杂度**：O(D * 10 * 2 * 2)，用于记忆化表。

---

## 02 · 斜行矩阵 {#problem-02}

### 题目描述

给出一个 n×m 的矩阵，检查对于所有满足条件的 i 和 j 是否都满足 a[i][j] == a[i+1][j+1]。即判断矩阵是否为 Toeplitz 矩阵（同一条左上到右下的对角线上元素全部相同）。

### 样例

**输入**

```
1
3 3
1 2 3
4 1 2
0 4 1
```

**输出**

```
Yes
```

### 解题思路

Toeplitz 矩阵的判定条件很直接：对每个位置 (i, j)（i < n-1, j < m-1），检查 a[i][j] 是否等于 a[i+1][j+1]。一旦发现不等即输出 No，全部满足则输出 Yes。

### 正确性依据

上述状态、枚举或贪心不变量保留了决定后续结果的全部信息；每个合法选择都被覆盖且不会重复计数。按处理顺序归纳，程序得到的最终状态与题目目标等价。

### Python ACM 实现

下面给出完整标准输入、标准输出程序，可直接在 Python 3 ACM 环境运行。

```python
# 核心步骤：矩阵遍历/模拟；严格按题面处理边界并输出结果。
import sys
input = sys.stdin.readline

def is_toeplitz(mat, n, m):
    for i in range(n - 1):
        for j in range(m - 1):
            if mat[i][j] != mat[i + 1][j + 1]:
                return False
    return True

T = int(input())
for _ in range(T):
    n, m = map(int, input().split())
    mat = []
    for i in range(n):
        row = list(map(int, input().split()))
        mat.append(row)
    print("Yes" if is_toeplitz(mat, n, m) else "No")
```

### 易错点

- 严格区分题面中的“严格大于/不小于”、开闭区间与下标起点。
- 多组测试时必须重置状态；大规模累加按题面需要使用 Python 整数或取模。

### 复杂度分析

**时间复杂度**：O(n * m)，每组数据遍历一次矩阵。
**空间复杂度**：O(n * m)，存储当前矩阵。

---

## 小结

- 第一题数位 DP 是高频考点，关键在于状态设计：用 first 记录首位数字，在最后一位与 first 比较
- 第二题 Toeplitz 矩阵判定是经典模拟题，逐元素检查对角线一致性即可
