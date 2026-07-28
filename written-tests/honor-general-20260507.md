---
pageClass: exam-session-page
title: 荣耀通用岗 2026-05-07
description: 荣耀 2026-05-07 通用岗笔试真题，含 3 道 Python ACM 模式题解
---

<div class="exam-session-banner">
  <div>
    <span>HONOR / 2026.05.07 / ACM</span>
    <strong>荣耀 · 通用岗</strong>
    <small>2026-05-07 · 3 题 ACM · 难度 中等</small>
  </div>
  <div class="exam-session-banner__meta">
    <span>数学 / 大整数</span>
    <span>贪心 / 区间调度</span>
    <span>DFS 回溯</span>
  </div>
</div>

# 荣耀 2026-05-07 通用岗笔试解析

本场统一整理为完整 Python 3 ACM 程序。每题保留标准输入输出、建模过程、正确性依据、复杂度、易错点和关键中文注释；原 SQL、Shell 与第三方机器学习库题也已改写为可独立运行的标准库版本。

来源：[Zero2Leetcode · 荣耀 2026-05-07 通用岗](https://onefly.top/zero2Leetcode/04_real_interviews/honor/general-20260507/)。

## 本场考试概述

**考试时间**：2026年5月7日
**考试岗位**：通用
**难度评级**：中等

**考点分析**：

- 第一题：数学 / 大整数（难度简单）
- 第二题：贪心 / 区间调度（难度中等）
- 第三题：DFS 回溯（难度中等）

**建议策略**：

- 第一题是签到题，Python 原生大整数 + `bit_length()` 一行搞定
- 第二题是经典区间调度模型，按结束时间排序 + 贪心扫描即可
- 第三题关键在于分析出每个房间只有两种人数，之后就是排列枚举

---

## 01 · 寻找 2 的次幂 {#problem-01}

### 题目描述

给定一个正整数 $N$（$N$ 可达 $10^{1000}$），输出 $k$，使得 $2^k \leq N < 2^{k+1}$。

### 样例

**输入**

```
5
```

**输出**

```
2
```

### 解题思路

**第一步：转化为二进制位数问题**

$2^k$ 在二进制下是 `1` 后面跟 $k$ 个 `0`，共 $k+1$ 位。$2^k \leq N < 2^{k+1}$ 意味着 $N$ 的二进制恰好有 $k+1$ 位。所以答案就是 $N$ 的二进制位数减 1。

**第二步：大整数处理**

$N$ 最大有 1000 位十进制，普通 64 位整数存不下。Python 原生支持任意精度整数，直接用 `int.bit_length()` 求二进制位数即可。

### 正确性依据

上述状态、枚举或贪心不变量保留了决定后续结果的全部信息；每个合法选择都被覆盖且不会重复计数。按处理顺序归纳，程序得到的最终状态与题目目标等价。

### Python ACM 实现

下面给出完整标准输入、标准输出程序，可直接在 Python 3 ACM 环境运行。

```python
# 核心步骤：数学 / 大整数；严格按题面处理边界并输出结果。
import sys
sys.set_int_max_str_digits(0)

n = int(input())
print(n.bit_length() - 1)
```

### 易错点

- 严格区分题面中的“严格大于/不小于”、开闭区间与下标起点。
- 多组测试时必须重置状态；大规模累加按题面需要使用 Python 整数或取模。

### 复杂度分析

**时间复杂度**：$O(L)$，$L$ 为 $N$ 的十进制位数（字符串转大整数的开销）
**空间复杂度**：$O(L)$，存储大整数

---

## 02 · 鸟巢场馆 {#problem-02}

### 题目描述

2008 年奥运会后，鸟巢场馆对外开放，各公司可以申请使用。每个公司提交一个使用时间段 $[s_i, e_i]$（闭区间），时间段重叠的公司不能同时安排（端点重合也算重叠）。设计方案使尽可能多的公司使用到鸟巢。

第一行整数 $n$ 表示公司数，第二行 $2n$ 个整数，每两个一组表示起止时间。

### 样例

**输入**

```
4
4 9 9 11 13 19 10 17
```

**输出**

```
2
```

### 解题思路

**第一步：识别问题模型**

给定 $n$ 个闭区间，选出尽可能多的区间使两两不重叠。这就是经典的"活动选择问题"（区间调度最大化）。

**第二步：贪心策略**

按结束时间从小到大排序。从前往后扫描，维护已选区间的最大结束时间 `last_end`。对于每个区间 $[s, e]$：若 $$s > \text{last\_end}$$（严格大于，因为端点重合也算冲突），则选入并更新 `last_end = e`。

**第三步：正确性**

每次选结束最早的区间一定最优——选结束更晚的区间不会比当前选择更好，因为它只会占用更多时间，给后续留更少空间。这是经典贪心的交换论证。

以样例为例：4 个区间为 $[4,9], [9,11], [13,19], [10,17]$。按结束时间排序后为 $[4,9], [9,11], [10,17], [13,19]$。选 $[4,9]$ 后，$[9,11]$ 的起点 $9$ 不严格大于 $9$，跳过；$[10,17]$ 的起点 $10 > 9$，选入。最终选 2 个。

### 正确性依据

上述状态、枚举或贪心不变量保留了决定后续结果的全部信息；每个合法选择都被覆盖且不会重复计数。按处理顺序归纳，程序得到的最终状态与题目目标等价。

### Python ACM 实现

下面给出完整标准输入、标准输出程序，可直接在 Python 3 ACM 环境运行。

```python
import sys
input = sys.stdin.readline

def solve():
    n = int(input())
    nums = list(map(int, input().split()))
    intervals = [(nums[2 * i], nums[2 * i + 1]) for i in range(n)]
    # 按结束时间排序
    intervals.sort(key=lambda x: (x[1], x[0]))

    cnt = 0
    last_end = -10**18
    for s, e in intervals:
        if s > last_end:
            cnt += 1
            last_end = e
    print(cnt)

solve()
```

### 易错点

- 严格区分题面中的“严格大于/不小于”、开闭区间与下标起点。
- 多组测试时必须重置状态；大规模累加按题面需要使用 Python 整数或取模。

### 复杂度分析

**时间复杂度**：$O(n \log n)$，排序为瓶颈
**空间复杂度**：$O(n)$，存储区间数组

---

## 03 · 房间安排 {#problem-03}

### 题目描述

有 $m$ 个房间，$n$ 个人需要入住。每个房间最多住 5 人，且任意两个房间的人数差不超过 1。列出所有满足条件的安排方案（房间有先后顺序，不同排列视为不同方案）。

输入一行，格式为 `m,n`。输出第一行为剩余未安排的人数，之后每行一种方案。参数异常时输出 `invalid`。

### 样例

**输入**

```text
3,5
```

**输出**

```text
0
2,2,1
2,1,2
1,2,2
```

### 解题思路

**第一步：计算实际能安排的人数**

每个房间最多 5 人，$m$ 个房间最多装 $5m$ 人。若 $n > 5m$，多出来的人无法安排。实际安排人数 $\text{used} = \min(n, 5m)$，剩余 $\text{left} = n - \text{used}$。

**第二步：确定每个房间住几人**

将 $\text{used}$ 人平均分到 $m$ 个房间：$\text{base} = \text{used} \div m$（整除），余数 $\text{extra} = \text{used} \mod m$。有 $\text{extra}$ 个房间住 $\text{base}+1$ 人，其余 $m - \text{extra}$ 个房间住 $\text{base}$ 人。任意两房间差值恰好为 0 或 1，满足公平约束。

**第三步：DFS 枚举所有排列**

问题变成：$m$ 个位置里选 $\text{extra}$ 个放 $\text{base}+1$，其余放 $\text{base}$。用回溯法逐个位置填数，每个位置先尝试填大数（保证输出顺序与样例一致），再尝试填小数。

### 正确性依据

上述状态、枚举或贪心不变量保留了决定后续结果的全部信息；每个合法选择都被覆盖且不会重复计数。按处理顺序归纳，程序得到的最终状态与题目目标等价。

### Python ACM 实现

下面给出完整标准输入、标准输出程序，可直接在 Python 3 ACM 环境运行。

```python
import sys

def solve():
    s = input().strip()
    try:
        parts = s.split(",")
        if len(parts) != 2:
            print("invalid")
            return
        m = int(parts[0])
        n = int(parts[1])
    except:
        print("invalid")
        return

    if m <= 0 or n < 0:
        print("invalid")
        return

    used = min(n, m * 5)
    left = n - used
    base = used // m
    extra = used % m

    results = []
    path = []

    def dfs(idx, high_left, low_left):
        if idx == m:
            results.append(",".join(map(str, path)))
            return
        # 先放 base+1 保证输出顺序
        if high_left > 0:
            path.append(base + 1)
            dfs(idx + 1, high_left - 1, low_left)
            path.pop()
        if low_left > 0:
            path.append(base)
            dfs(idx + 1, high_left, low_left - 1)
            path.pop()

    dfs(0, extra, m - extra)
    print(left)
    print('\n'.join(results))

solve()
```

### 易错点

- 严格区分题面中的“严格大于/不小于”、开闭区间与下标起点。
- 多组测试时必须重置状态；大规模累加按题面需要使用 Python 整数或取模。

### 复杂度分析

**时间复杂度**：$O(\binom{m}{\text{extra}} \cdot m)$，共 $\binom{m}{\text{extra}}$ 个方案，每个方案长度 $m$
**空间复杂度**：$O(m)$，递归栈深度

---

## 小结

- 第一题考察大整数处理：利用 Python 原生大整数和 `bit_length()` 方法一行求解
- 第二题是经典区间调度贪心：按结束时间排序，每次贪心选最早结束的区间
- 第三题本质是组合排列枚举：先分析出每个房间只有两种可能人数，再用 DFS 回溯列出所有排列
