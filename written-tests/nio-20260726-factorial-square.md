---
pageClass: acm-problem-page
title: 阶乘平方数
---

# 阶乘平方数

<div class="acm-problem-banner">
  <div>
    <span>SESSION 001 · PROBLEM 01</span>
    <strong>蔚来通用岗 · 2026-07-26</strong>
  </div>
  <div class="acm-problem-banner__tags">
    <span>ACM</span>
    <span>数论</span>
    <span>预处理</span>
    <span>中等</span>
  </div>
</div>

<ComplexityBadge time="O(K + T log C + 输出量)" space="O(C + T)" />

> 题目依据[公开笔试资料](https://onefly.top/zero2Leetcode/04_real_interviews/nio/general-20260726/index.html)重新表述；以下推导、证明与 Python 实现由本站独立编写。

## 题目描述

给定一个正整数上界 `n`。请找出所有正整数 `x`，使得：

1. `x! + 1 <= n`；
2. `x! + 1` 是完全平方数。

对每组查询，按 `x` 从小到大输出全部答案；若不存在满足条件的 `x`，输出 `-1`。

## 输入格式

第一行输入一个整数 `T`，表示查询组数。

接下来 `T` 行，每行输入一个正整数 `n`。

## 输出格式

对每组查询输出一行：

- 若存在答案，输出所有满足条件的 `x`，相邻数字用一个空格分隔；
- 若不存在，输出 `-1`。

## 数据范围

- `1 <= T <= 10^5`
- `1 <= n <= 10^18`

Python 可以直接处理本题中的整数乘法；在 C++ 或 Java 中需要使用 64 位整数，并在乘法前关注溢出。

## 样例

**输入**

```text
3
1
25
5041
```

**输出**

```text
-1
4
4 5 7
```

## 样例解释

- `4! + 1 = 25 = 5²`；
- `5! + 1 = 121 = 11²`；
- `7! + 1 = 5041 = 71²`。

当 `n = 25` 时只有 `x = 4` 满足；当 `n = 5041` 时，`4、5、7` 都满足。

## 题意拆解

表面上 `n` 最大达到 `10^18`，似乎无法枚举所有可能的 `x`。但限制条件比较的是 `x! + 1` 与 `n`，而阶乘增长极快：

```text
10!  = 3,628,800
15!  = 1,307,674,368,000
20!  = 2,432,902,008,176,640,000
```

因此在 `10^18` 范围内，真正需要检查的 `x` 不到 20 个。大范围并不意味着大枚举量，关键是先看清函数的增长速度。

## 朴素思路为什么不合适

如果对每组查询都从 `x = 1` 开始重新计算阶乘，虽然单组循环不多，但 `T` 可能达到 `10^5`，相同的候选会被重复检查。

更自然的做法是：

1. 读取全部查询，得到最大上界 `max_n`；
2. 只预处理一次所有不超过 `max_n` 的候选；
3. 每组查询在候选表中寻找截止位置。

## 关键观察一：逐项维护阶乘

相邻阶乘满足：

```text
x! = (x - 1)! × x
```

因此不需要每次从头计算。维护变量 `factorial`，进入第 `x` 轮时乘上 `x`，即可得到当前 `x!`。

一旦 `x! + 1 > max_n`，更大的阶乘也一定超过所有查询上界，可以立即停止。

## 关键观察二：必须使用整数平方根

不能用下面这种浮点判断：

```python
int(value ** 0.5) ** 2 == value
```

`value` 接近 `10^18` 时，浮点数可能因精度损失得到错误结果。Python 的 `math.isqrt(value)` 返回精确的 `⌊√value⌋`。令：

```text
root = isqrt(value)
```

则 `value` 为完全平方数，当且仅当 `root * root == value`。

## 关键观察三：候选值有序，可以二分

随着 `x` 增大，`x! + 1` 严格递增。把满足完全平方条件的二元组 `(x! + 1, x)` 保存下来后，对查询 `n` 只需找到最后一个不超过 `n` 的候选值。

Python 可以用 `bisect_right` 得到可用候选的数量。

## 正确性证明

下面证明算法对每组查询都会输出且只输出合法答案。

**引理 1：预处理不会漏掉任何可能的 `x`。**

算法从 `x = 1` 开始按顺序计算每个 `x! + 1`，直到该值第一次超过所有查询中的最大上界。阶乘严格递增，因此停止位置之后的值也全部超过最大上界，不可能成为任何查询的答案。

**引理 2：候选表中的每个 `x` 都满足完全平方条件。**

只有当 `root = isqrt(x! + 1)` 且 `root² = x! + 1` 时，算法才保存 `x`。这个等式正是“`x! + 1` 是完全平方数”的充要条件。

**引理 3：二分得到的候选前缀恰好满足当前上界。**

候选值按 `x! + 1` 严格递增。`bisect_right(values, n)` 返回第一个大于 `n` 的位置，因此它之前的候选全部满足 `x! + 1 <= n`，之后的候选全部不满足。

由三个引理可知，算法不会遗漏合法答案，也不会输出非法答案，因此算法正确。

## Python ACM 实现

```python
import sys
from bisect import bisect_right
from math import isqrt


def build_candidates(limit: int) -> tuple[list[int], list[int]]:
    """返回候选值 x! + 1，以及与它们一一对应的 x。"""
    values = []
    xs = []
    factorial = 1
    x = 1

    while True:
        # 利用 x! = (x - 1)! * x，避免重复计算阶乘
        factorial *= x
        value = factorial + 1

        if value > limit:
            break

        # 使用整数平方根，规避 10^18 附近的浮点精度问题
        root = isqrt(value)
        if root * root == value:
            values.append(value)
            xs.append(x)

        x += 1

    return values, xs


def solve() -> None:
    data = list(map(int, sys.stdin.buffer.read().split()))
    if not data:
        return

    test_count = data[0]
    queries = data[1 : 1 + test_count]
    max_n = max(queries)

    candidate_values, candidate_xs = build_candidates(max_n)
    answers = []

    for n in queries:
        # end 表示不超过 n 的候选数量
        end = bisect_right(candidate_values, n)
        if end == 0:
            answers.append("-1")
        else:
            answers.append(" ".join(map(str, candidate_xs[:end])))

    sys.stdout.write("\n".join(answers))


if __name__ == "__main__":
    solve()
```

## 代码讲解

`build_candidates()` 只与所有查询中的最大值有关，因此整场输入只执行一次。两个数组 `candidate_values` 与 `candidate_xs` 下标对应：

```text
candidate_values[i] = candidate_xs[i]! + 1
```

对每个查询，`bisect_right` 返回合法前缀长度。切片 `candidate_xs[:end]` 已经按 `x` 升序排列，可以直接输出。

## 复杂度分析

设：

- `K` 为满足 `x! + 1 <= max_n` 的枚举次数，本题范围内 `K < 20`；
- `C` 为预处理后保存的完全平方候选数量；
- `A` 为某次查询实际输出的答案数量。

则：

- 预处理时间：`O(K)`；
- 每组查询：`O(log C + A)`；
- 总时间：`O(K + T log C + 总输出量)`；
- 额外空间：`O(C + T)`，其中 `T` 来自批量读取查询。

## 边界与易错点

1. `n < 25` 时没有答案，必须输出 `-1`；
2. 比较的是 `x! + 1 <= n`，不是 `x <= n`；
3. 不能使用浮点平方根判断大整数；
4. 不要为每组查询重复预处理；
5. ACM 输出要求每组答案独占一行，不能输出 Python 列表格式；
6. 读取后应只取前 `T` 个查询，避免把异常尾部数据误当作新测试。

## 自测用例

```text
输入
5
1
24
25
120
121

输出
-1
-1
4
4
4 5
```

## 90 秒口述

`n` 虽然达到 `10^18`，但阶乘增长非常快，所以可枚举的 `x` 不到 20 个。我先读完所有查询，以最大 `n` 为上界统一预处理。逐项维护阶乘，对 `x! + 1` 使用 `isqrt` 做精确完全平方判断，并把合法候选按值保存。候选值天然递增，每组查询用 `bisect_right` 找到不超过 `n` 的前缀并输出。正确性来自完整枚举、精确平方判断和有序前缀筛选。
