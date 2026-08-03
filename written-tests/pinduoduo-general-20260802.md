---
pageClass: exam-session-page
title: 拼多多秋招 · 通用岗 2026-08-02
description: 拼多多 2026-08-02 秋招通用岗笔试真题，含 4 道完整题面、详细解析与 Python ACM 模式实现
---

<div class="exam-session-banner">
  <div>
    <span>PINDUODUO / 2026.08.02 / ACM</span>
    <strong>拼多多 · 秋招 · 通用岗</strong>
    <small>2026-08-02 · 4 题 ACM · 难度 中等偏难</small>
  </div>
  <div class="exam-session-banner__meta">
    <span>前缀和与最早位置</span>
    <span>字典序贪心与可行性判定</span>
    <span>分层图与 Dijkstra</span>
    <span>环图多重染色</span>
  </div>
</div>

# 拼多多 2026-08-02 秋招 · 通用岗笔试解析

本场共四道编程题。下面将公开资料中的题意重新整理为完整的标准输入输出题面，并统一给出可以直接提交的 Python 3 ACM 程序。每题包含建模过程、关键结论、正确性证明、复杂度和易错点。

来源：[Zero2Leetcode · 拼多多 2026-08-02 通用岗](https://onefly.top/zero2Leetcode/04_real_interviews/pinduoduo/general-20260802/)。

## 本场考试概述

| 题号 | 题目 | 核心知识点 | 难度 |
|---|---|---|---|
| 01 | 平衡队伍 | 前缀和、哈希、最早位置 | 简单 |
| 02 | 评价展示序列 | 字典序贪心、重排可行性 | 中等 |
| 03 | 多多送快递 | 分层图、Dijkstra、状态扩展 | 中等 |
| 04 | 环形分厂协调补货 | 独立集、环图多重染色、数学 | 困难 |

建议先稳定完成第一题；第二题的关键不是“每次取最小”，而是取完以后仍要能完成剩余序列；第三题要把“优惠券是否已使用”放进状态；第四题需要先识别环图上的加权染色模型，再使用结论计算答案。

---

## 01 · 平衡队伍 {#problem-01}

### 题目描述

某支队伍共有 $n$ 名成员，每名成员属于类型 `A` 或类型 `B`。成员按照给定顺序排成一列，用长度为 $n$ 的字符串 $s$ 表示。

请选择一个连续区间，使区间内 `A` 类型成员与 `B` 类型成员的数量相同。求满足条件的最长区间长度。如果不存在非空的平衡区间，输出 `0`。

### 输入格式

第一行输入一个整数 $n$。

第二行输入一个长度为 $n$、只包含字符 `A` 和 `B` 的字符串 $s$。

### 输出格式

输出一个整数，表示最长平衡区间的长度。

### 数据范围

$$1 \le n \le 2 \times 10^5$$

### 样例

**输入**

```
4
ABAB
```

**输出**

```
4
```

### 解题思路

把 `A` 看成 $+1$，把 `B` 看成 $-1$，定义前缀和

$$P_i=\sum_{k=1}^{i} value(s_k), \qquad P_0=0$$

区间 $[l,r]$ 内两类成员数量相等，当且仅当区间和为 $0$：

$$P_r-P_{l-1}=0 \iff P_r=P_{l-1}$$

问题因此变成：找两个值相同的前缀和位置，使它们的下标差最大。

扫描字符串时，只记录每个前缀和**第一次出现的位置**。以后再次遇到相同前缀和，就用当前位置减去最早位置更新答案。前缀和的取值范围是 $[-n,n]$，可以用长度 $2n+1$ 的数组代替哈希表。

### 正确性证明

对任意两个前缀位置 $i<j$，若 $P_i=P_j$，则区间 $(i,j]$ 的元素和为 $P_j-P_i=0$，其中 `A` 和 `B` 数量相等。

反过来，任意平衡区间 $(i,j]$ 的元素和为 $0$，因此一定有 $P_i=P_j$。

对于固定的右端前缀位置 $j$，与 $P_j$ 相同且位置最早的前缀能产生最大的区间长度。因此，算法保留每个前缀和值的最早位置，并枚举所有右端点，必然会检查到全局最长的平衡区间。

### Python 3 ACM 实现

```python
import sys


def solve():
    data = sys.stdin.buffer.read().split()
    n = int(data[0])
    team = data[1].decode()

    offset = n
    # first[x + offset] 记录前缀和 x 第一次出现的位置。
    first = [-2] * (2 * n + 1)
    first[offset] = 0

    prefix = 0
    answer = 0

    for index, member in enumerate(team, start=1):
        prefix += 1 if member == "A" else -1
        slot = prefix + offset

        if first[slot] == -2:
            # 只保留最早位置，后续才能得到最长区间。
            first[slot] = index
        else:
            answer = max(answer, index - first[slot])

    print(answer)


solve()
```

### 复杂度分析

- 时间复杂度：$O(n)$。
- 空间复杂度：$O(n)$。

### 易错点

- 必须预先记录 $P_0=0$ 的位置为 `0`，否则会漏掉从第一个成员开始的平衡区间。
- 前缀和第一次出现以后不能覆盖；覆盖会让可得到的区间变短。
- 问的是连续区间，不是任意选择若干成员。

---

## 02 · 评价展示序列 {#problem-02}

### 题目描述

平台收到了 $n$ 条商品评价，第 $i$ 条评价的星级为 $a_i$，其中 $1 \le a_i \le 5$。

现在要重新排列全部评价，使任意两条相邻评价的星级都不同。在所有满足条件的排列中，输出字典序最小的星级序列。如果不存在合法排列，输出 `-1`。

两个等长整数序列比较字典序时，从左向右找到第一个不同位置，该位置数字较小的序列字典序更小。

### 输入格式

第一行输入一个整数 $n$。

第二行输入 $n$ 个整数 $a_1,a_2,\ldots,a_n$，表示每条评价的星级。

### 输出格式

如果不存在合法排列，输出一行 `-1`。

否则输出 $n$ 个整数，表示字典序最小的合法排列。

### 数据范围

$$1 \le n \le 10^5, \qquad 1 \le a_i \le 5$$

### 样例

**输入**

```
5
1 1 1 2 3
```

**输出**

```
1 2 1 3 1
```

### 解题思路

#### 1. 为什么不能只取当前最小星级

如果每一步都选与前一个不同的最小星级，可能过早消耗用于分隔高频星级的元素，导致剩余部分无法排列。因此，每次尝试一个候选值以后，还要判断剩余多重集合是否可行。

#### 2. 剩余序列的精确可行条件

假设还要放置 $m$ 个数，当前位置之前的星级为 `previous`，星级 $v$ 的剩余数量为 $c_v$。

- 如果 $v=previous$，剩余序列的第一位不能放 $v$。它最多只能占据第 $2,4,6,\ldots$ 个位置，容量为 $\lfloor m/2 \rfloor$。
- 如果 $v\ne previous$，它可以占据第 $1,3,5,\ldots$ 个位置，容量为 $\lceil m/2 \rceil$。

因此可行条件是：

$$
c_v \le
\begin{cases}
\lfloor m/2 \rfloor, & v=previous,\\
\lceil m/2 \rceil, & v\ne previous.
\end{cases}
$$

这就是经典“重排后相邻元素不同”条件在增加一个固定前驱后的形式。星级只有 `1` 到 `5`，每次检查五个计数即可。

#### 3. 字典序贪心

从左到右构造答案。每个位置按照 `1,2,3,4,5` 的顺序尝试：

1. 候选值还有剩余，并且不等于前一个值；
2. 临时使用一个该候选值；
3. 如果剩余计数满足可行条件，就永久选择它；否则恢复计数并尝试更大的值。

因为我们选择的是“仍能完成整个答案”的最小候选值，所以最终序列一定是字典序最小的。

### 正确性证明

先证明可行性检查正确。相同星级之间至少需要一个其他星级分隔；当前驱等于该星级时，剩余序列的第一个位置也不能使用它。于是上述容量限制是必要条件。反之，只要所有星级都不超过对应的奇数位或偶数位容量，就可以先把数量最多、限制最紧的星级放入可用间隔，再用其他星级依次填充间隔，因此条件也充分。

再证明贪心的字典序最优性。设算法正在确定位置 $i$，并选择了星级 $x$。算法已经逐一排除了所有小于 $x$ 的候选值：这些值要么与前驱相同、要么数量为零、要么选择后剩余部分无解。任何合法完整答案在位置 $i$ 都不可能使用这些更小的值。同时，选择 $x$ 后剩余部分可行，所以至少存在一个以当前前缀开头的完整答案。因此算法在每个位置都取到了合法答案能使用的最小值，最终答案字典序最小。

### Python 3 ACM 实现

```python
import sys


def can_finish(count, remaining, previous):
    """判断接在 previous 后面的 remaining 个星级能否合法排完。"""
    for value in range(1, 6):
        if value == previous:
            max_slots = remaining // 2
        else:
            max_slots = (remaining + 1) // 2
        if count[value] > max_slots:
            return False
    return True


def solve():
    data = list(map(int, sys.stdin.buffer.read().split()))
    n = data[0]
    ratings = data[1:]

    count = [0] * 6
    for rating in ratings:
        count[rating] += 1

    if not can_finish(count, n, 0):
        print(-1)
        return

    answer = []
    previous = 0

    for position in range(n):
        remaining = n - position - 1

        # 从小到大尝试，保证最终答案字典序最小。
        for candidate in range(1, 6):
            if count[candidate] == 0 or candidate == previous:
                continue

            count[candidate] -= 1
            if can_finish(count, remaining, candidate):
                answer.append(candidate)
                previous = candidate
                break
            count[candidate] += 1

    print(*answer)


solve()
```

### 复杂度分析

星级种类固定为 $5$。每个位置最多尝试 $5$ 个候选值，每次可行性检查再扫描 $5$ 种星级，因此：

- 时间复杂度：$O(25n)=O(n)$。
- 空间复杂度：$O(n)$，用于保存输出序列；计数数组本身是 $O(1)$。

### 易错点

- 初始无前驱，可以用 `0` 表示；它不属于合法星级。
- 可行性检查必须考虑前一个星级，不能只判断 `max_count <= (remaining + 1) // 2`。
- 试选失败后必须恢复计数。
- 第一条可行排列不一定字典序最小；只有按从小到大的候选顺序并做后缀可行性检查才成立。

---

## 03 · 多多送快递 {#problem-03}

### 题目描述

有 $n$ 个城市和 $m$ 条单向快递线路。城市编号为 $1$ 到 $n$。第 $i$ 条线路从城市 $u_i$ 通向城市 $v_i$，运输费用为正整数 $w_i$。

现在要把包裹从城市 $1$ 送到城市 $n$。你有一张优惠券，可以在经过的任意一条线路上使用，使该条线路的费用变为 $0$。优惠券最多使用一次，也可以不使用。

求从城市 $1$ 到城市 $n$ 的最小总费用。如果无法送达，输出 `-1`。

### 输入格式

第一行输入两个整数 $n,m$。

接下来 $m$ 行，每行输入三个整数 $u_i,v_i,w_i$，表示一条从 $u_i$ 到 $v_i$、费用为 $w_i$ 的单向线路。

### 输出格式

输出最小总费用；如果不存在从城市 $1$ 到城市 $n$ 的路径，输出 `-1`。

### 数据范围

$$
2 \le n \le 10^5, \qquad
0 \le m \le 2 \times 10^5, \qquad
1 \le w_i \le 10^4
$$

### 样例

**输入**

```
4 4
1 2 2
1 3 5
2 4 3
3 4 1
```

**输出**

```
1
```

### 解题思路

普通最短路只记录“到达哪个城市”，但同样到达城市 $u$ 时，优惠券是否还在手里会影响后续决策，因此状态必须增加一维：

- $(u,0)$：到达城市 $u$，优惠券尚未使用；
- $(u,1)$：到达城市 $u$，优惠券已经使用。

对于原图中的一条边 $u\to v$，费用为 $w$：

1. 从 $(u,0)$ 支付 $w$ 到 $(v,0)$；
2. 从 $(u,0)$ 使用优惠券，以 $0$ 到 $(v,1)$；
3. 从 $(u,1)$ 支付 $w$ 到 $(v,1)$。

这相当于把原图复制成上下两层，并增加从“未使用层”到“已使用层”的零权边。所有新图边权仍然非负，可以直接运行 Dijkstra。

最终答案为

$$\min(dist[n][0], dist[n][1])$$

这样同时覆盖“不使用优惠券”和“使用一次优惠券”两种情况。

### 正确性证明

任意一条原问题中的合法路线，都可以唯一对应到分层图中的一条路径：使用优惠券之前位于第 $0$ 层；若在边 $u\to v$ 使用优惠券，就沿零权跨层边进入第 $1$ 层；此后一直留在第 $1$ 层。分层图路径的费用恰好等于原路线使用优惠券后的费用。

反过来，分层图从 $(1,0)$ 出发的任意路径最多跨层一次，而且不能从第 $1$ 层返回第 $0$ 层，因此对应原图中一条优惠券最多使用一次的合法路线，费用同样保持不变。

所以原问题与分层图最短路等价。由于分层图所有边权非负，Dijkstra 能正确求出最短距离，取两个终点状态的较小值就是原问题答案。

### Python 3 ACM 实现

```python
import heapq
import sys


def solve():
    input = sys.stdin.buffer.readline
    n, m = map(int, input().split())

    graph = [[] for _ in range(n + 1)]
    for _ in range(m):
        start, end, cost = map(int, input().split())
        graph[start].append((end, cost))

    infinity = 10**30
    distance = [[infinity, infinity] for _ in range(n + 1)]
    distance[1][0] = 0

    # 堆元素：(当前费用, 城市, 是否已使用优惠券)
    heap = [(0, 1, 0)]

    while heap:
        current_cost, city, used = heapq.heappop(heap)
        if current_cost != distance[city][used]:
            continue

        for next_city, edge_cost in graph[city]:
            # 转移一：正常支付当前边费用。
            paid_cost = current_cost + edge_cost
            if paid_cost < distance[next_city][used]:
                distance[next_city][used] = paid_cost
                heapq.heappush(heap, (paid_cost, next_city, used))

            # 转移二：优惠券未使用时，可令当前边免费。
            if used == 0 and current_cost < distance[next_city][1]:
                distance[next_city][1] = current_cost
                heapq.heappush(heap, (current_cost, next_city, 1))

    answer = min(distance[n])
    print(-1 if answer == infinity else answer)


solve()
```

### 复杂度分析

分层图有 $2n$ 个状态，至多 $3m$ 条转移边：

- 时间复杂度：$O((n+m)\log n)$。
- 空间复杂度：$O(n+m)$。

### 易错点

- 线路是单向边，不能自动加入反向边。
- 优惠券可以不使用，所以答案要同时比较两个终点状态。
- 状态中必须记录优惠券是否已使用，否则会把互不兼容的路径错误合并。
- Dijkstra 弹出堆顶后要跳过过期状态，避免重复扩展。

---

## 04 · 环形分厂协调补货 {#problem-04}

### 题目描述

某企业有 $n$ 个分厂，按编号 $1,2,\ldots,n$ 围成一圈。编号相邻的两个分厂互相干扰，其中分厂 $1$ 与分厂 $n$ 也相邻。

第 $i$ 个分厂还需要补货 $a_i$ 次。每个班次可以选择若干个分厂各补货一次，但同一班次选择的任意两个分厂都不能相邻。一个分厂可以在不同班次中被多次选择，直到恰好完成其 $a_i$ 次补货任务。

求完成全部补货任务至少需要多少个班次。

### 输入格式

第一行输入一个整数 $T$，表示测试用例数。

每组测试数据包含两行：

- 第一行输入一个整数 $n$；
- 第二行输入 $n$ 个非负整数 $a_1,a_2,\ldots,a_n$。

### 输出格式

对每组测试数据输出一行一个整数，表示最少班次数。

### 数据范围

$$
1 \le T \le 10^5, \qquad
1 \le n \le 2 \times 10^5, \qquad
0 \le a_i \le 10^9
$$

所有测试用例的 $n$ 之和不超过 $2 \times 10^6$。

### 样例

**输入**

```
1
6
1 2 3 1 2 3
```

**输出**

```
5
```

### 解题思路

#### 1. 转成环图上的多重染色

把每个分厂看成环图 $C_n$ 的一个顶点。一个班次能选择的分厂集合不能包含相邻顶点，因此它是一个**独立集**。

如果把每个班次看成一种颜色，那么顶点 $i$ 需要获得 $a_i$ 种颜色，且相邻顶点的颜色集合不能相交。这正是环图上的多重染色（也称加权染色）问题。

#### 2. 三个下界

设答案为 $K$。

**单点下界**：一个分厂每个班次至多补货一次，因此

$$K \ge \max_i a_i$$

**相邻点下界**：相邻分厂不能在同一班次补货，因此对于每条环边 $(i,i+1)$，

$$K \ge a_i+a_{i+1}$$

这里下标按环取模，必须包含 $a_n+a_1$。

**单班容量下界**：环图的一个独立集最多包含 $\lfloor n/2\rfloor$ 个顶点。记总补货次数 $S=\sum a_i$，则

$$K \ge \left\lceil \frac{S}{\lfloor n/2\rfloor} \right\rceil$$

#### 3. 为什么取三个下界的最大值就够了

环图的独立集系统有一个重要的整数分解性质：给定 $K$，需求向量能够被拆成 $K$ 个独立集，当且仅当同时满足

$$
a_i+a_{i+1}\le K \quad (1\le i\le n)
$$

以及

$$
\sum_{i=1}^{n} a_i \le K\left\lfloor\frac n2\right\rfloor.
$$

对偶地看，前一组约束保证每条相邻边上的任务能分到互不重叠的班次；后一条约束保证全部任务没有超过 $K$ 个独立集的总容量。对于偶环，图是二分图，边约束已经刻画多重染色；对于奇环，唯一额外需要的就是整环容量约束。

因此在 $n\ge2$ 时答案为

$$
\max\left(
\max_i a_i,
\max_i(a_i+a_{i+1}),
\left\lceil\frac{\sum_i a_i}{\lfloor n/2\rfloor}\right\rceil
\right).
$$

当 $n=1$ 时没有容量除数，唯一分厂每班至多补货一次，答案直接是 $a_1$。

### 正确性证明

由单点限制、相邻限制和每班最多选择 $\lfloor n/2\rfloor$ 个分厂，任何排班方案的班次数都不会小于上述三个下界，因此公式值不大于最优解。

令 $K$ 为公式计算出的最大值。此时每条环边都满足 $a_i+a_{i+1}\le K$，并且总需求满足 $\sum a_i\le K\lfloor n/2\rfloor$。根据环图多重染色的整数分解性质，需求向量可以拆成 $K$ 个独立集；把每个独立集安排到一个班次，就得到一个合法的 $K$ 班方案。因此最优解不大于 $K$。

上下界相等，所以公式得到的就是最少班次数。

### Python 3 ACM 实现

```python
import sys


def minimum_shifts(demand):
    n = len(demand)
    if n == 1:
        return demand[0]

    total = sum(demand)
    max_single = max(demand)

    # 环上相邻点不能同班，别漏掉最后一个与第一个的边。
    max_adjacent = max(
        demand[index] + demand[(index + 1) % n]
        for index in range(n)
    )

    capacity = n // 2
    capacity_bound = (total + capacity - 1) // capacity

    return max(max_single, max_adjacent, capacity_bound)


def solve():
    data = list(map(int, sys.stdin.buffer.read().split()))
    iterator = iter(data)
    test_cases = next(iterator)
    answers = []

    for _ in range(test_cases):
        n = next(iterator)
        demand = [next(iterator) for _ in range(n)]
        answers.append(str(minimum_shifts(demand)))

    print("\n".join(answers))


solve()
```

### 复杂度分析

设全部测试用例的分厂总数为 $N$：

- 时间复杂度：$O(N)$。
- 空间复杂度：$O(n)$，用于保存当前测试用例；答案计算本身只需 $O(1)$ 额外空间。

### 易错点

- 分厂首尾相邻，计算相邻需求和时必须包含 $a_n+a_1$。
- 奇数环只看最大相邻和不够，还要考虑总容量下界。
- 向上取整要写成 `(total + capacity - 1) // capacity`。
- $n=1$ 必须单独处理，否则 $\lfloor n/2\rfloor=0$ 会造成除零。

---

## 本场复盘

这四道题覆盖了从基础线性扫描到图论建模的完整梯度：

1. 看见“两类数量相等的最长连续区间”，优先尝试把两类映射为 $+1/-1$，转成相同前缀和；
2. 看见“字典序最小的合法构造”，要使用“从小到大试选 + 剩余可行性判定”，不能只做局部贪心；
3. 看见“一次性资源是否使用”，把资源状态加入最短路节点，构造分层图；
4. 看见“每轮选不相邻点、每点有多次需求”，应联想到独立集覆盖与图的多重染色。

建议独立重写第二题的 `can_finish` 和第三题的三类转移；第四题至少要能在面试中说明三个下界分别来自哪里，以及为什么奇数环必须补上总容量约束。
