---
pageClass: exam-session-page
title: 华为研发岗（国内） 2026-05-27
description: 华为 2026-05-27 研发岗（国内）笔试真题，含 3 道 Python ACM 模式题解
---

<div class="exam-session-banner">
  <div>
    <span>HUAWEI / 2026.05.27 / ACM</span>
    <strong>华为 · 研发岗（国内）</strong>
    <small>2026-05-27 · 3 题 ACM · 难度 中等偏上</small>
  </div>
  <div class="exam-session-banner__meta">
    <span>模拟 + 邻接判定</span>
    <span>拓扑排序 + 字典序小根堆</span>
    <span>BFS 全源最短路 + 全排列 DP</span>
  </div>
</div>

# 华为 2026-05-27 研发岗（国内）笔试解析

本场仅整理需要编程实现的题目，并统一为完整 Python ACM 程序。每题保留标准输入输出、解题依据、关键实现、复杂度与中文注释；AI 岗的选择题不混入本模块。

来源：[Zero2Leetcode · 华为 2026-05-27 研发岗（国内）](https://onefly.top/zero2Leetcode/04_real_interviews/huawei/dev-20260527/)。

## 本场考试概述

**考试时间**：2026年5月27日
**考试岗位**：研发岗（国内）
**难度评级**：中等偏上

**考点分析**：

1. 第一题：模拟 + 邻接判定（难度简单）
2. 第二题：拓扑排序 + 字典序小根堆（难度中等）
3. 第三题：BFS 全源最短路 + 全排列 DP（难度困难）

**建议策略**：

1. 第一题纯模拟，把编号映射为坐标后逐对判定即可，注意边去重要正反向都算同一条
2. 第二题是拓扑排序模板题，用优先队列保证字典序最小，核心在建图方向别搞反
3. 第三题留到最后写，关键突破口是把"起点 + 碎片 + 宝箱"统一抽象为关键点，先 BFS 算两两最短路再做分组全排列 DP

---

## 01 · 矩形图案解锁路径 {#problem-01}

### 题目描述

给定一个 $M \times N$ 的矩形网格，每个格子按行优先顺序从 $1$ 开始填充正整数。现输入若干整数序列，需判断每个序列是否能构成网格中的一条有效解锁路径。

有效路径需满足两个条件：

1. 序列中任意两个相邻数字在网格上必须 8 邻接（上下左右及四个对角方向）
2. 序列中任意两个相邻数字组成的路径不能重复（正向和反向算同一条边）

输出所有合法序列（按输入顺序）。如果没有任何合法序列，输出 `false`。

**输入描述**

第一行整数 $M$（行数），第二行整数 $N$（列数），第三行整数 $K$（序列个数）。接下来 $K$ 行，每行一个逗号分隔的整数序列。

**输出描述**

按输入顺序输出所有合法序列。若无合法序列输出 `false`。

### 样例

**输入**

```
3
3
4
1,2,5,8,5,6
1,2,3,4,7
1,2,3,5,7,8
1,2,3,5,7,4
```

**输出**

```
1,2,3,5,7,8
1,2,3,5,7,4
```

### 解题思路

**第一步：坐标映射**

网格按行优先编号，列数为 $N$，那么编号 $x$ 在网格中的位置为：行 $(x-1) \div N$，列 $(x-1) \bmod N$。这是一个通用公式，不依赖行数 $M$。

**第二步：邻接判定**

两个格子在网格上 8 邻接，意味着它们的行差和列差绝对值都不超过 1，且不能是同一格。即设坐标差为 $(\Delta r, \Delta c)$，合法条件为 $\max(\lvert \Delta r \rvert, \lvert \Delta c \rvert) = 1$。

**第三步：边去重**

题目规定路径 $(a,b)$ 和 $(b,a)$ 算同一条边。所以把每条边规范化为 $(\min(a,b), \max(a,b))$ 后放入集合。下次出现同样的规范化对就是重复边，序列不合法。

整体做法就是逐对扫描序列，检查相邻性和边唯一性，全部通过则保留。

### Python ACM 实现

下面给出完整标准输入、标准输出程序，可直接提交到对应的 Python ACM 环境；题面明确要求机器学习库时按要求安装依赖。

```python
import sys
input = sys.stdin.readline

# 核心步骤：模拟 + 邻接判定；按题意读取标准输入并输出结果。


def solve():
    M = int(input())
    N = int(input())
    K = int(input())

    def pos(x):
        return (x - 1) // N, (x - 1) % N

    def is_valid(seq):
        used = set()
        for i in range(1, len(seq)):
            a, b = seq[i - 1], seq[i]
            if a < 1 or a > M * N or b < 1 or b > M * N:
                return False
            ra, ca = pos(a)
            rb, cb = pos(b)
            dr, dc = abs(ra - rb), abs(ca - cb)
            if dr > 1 or dc > 1 or (dr == 0 and dc == 0):
                return False
            edge = (min(a, b), max(a, b))
            if edge in used:
                return False
            used.add(edge)
        return True

    results = []
    for _ in range(K):
        line = input().strip()
        seq = list(map(int, line.split(',')))
        if len(seq) >= 2 and is_valid(seq):
            results.append(line)

    if not results:
        print("false")
    else:
        print('\n'.join(results))


solve()
```

### 复杂度分析

**时间复杂度**：$O(K \cdot L)$，其中 $L$ 为单条序列最大长度，每条序列线性扫描一遍。

**空间复杂度**：$O(L)$，存放边集合。

---

## 02 · 微服务部署依赖 {#problem-02}

### 题目描述

系统中包含 $N$ 个微服务，每个微服务在上线前需要其所有依赖的微服务都已部署并运行。给定所有微服务的依赖关系，判断是否存在循环依赖：

- 若存在环，输出 `Can not deploy`
- 若无环，输出一个合法的部署顺序。当多个微服务同时可部署时，按字典序从小到大输出

**输入描述**

第一行整数 $N$，表示微服务数量。接下来 $N$ 行，每行格式为 `serviceName M upstream1 upstream2 ... upstreamM`，表示该服务依赖 $M$ 个前驱服务。

**输出描述**

一行输出全部微服务名称，以空格隔开。有环则输出 `Can not deploy`。

### 样例

**输入**

```
5
payment 2 auth order
order 1 user
auth 1 database
user 0
database 0
```

**输出**

```
database auth user order payment
```

### 解题思路

**第一步：建模为有向图**

把每个微服务看成节点，"A 依赖 B"意味着 B 必须先部署，建一条从 B 到 A 的有向边。所有依赖关系建完后得到一张有向图。

**第二步：识别拓扑排序**

问题要求找一个所有节点的排列，使得每个节点出现时它的所有前驱都已出现。这正是拓扑排序的定义。

为每个服务记入度（还有多少个前驱没部署）。初始把所有入度为 0 的节点加入候选集。每次从候选集中取出一个节点部署，将其下游的入度减 1，归零者进入候选集。

**第三步：字典序保证**

题目要求同时可部署的服务按字典序输出，因此候选集不能用普通队列（FIFO 无法保证字典序），而要用**最小堆**——每次弹出字典序最小的服务名。

**第四步：环检测**

如果图中有环，环上的服务入度永远不会归零，最终出堆的总数小于 $N$，此时输出 `Can not deploy`。

### Python ACM 实现

下面给出完整标准输入、标准输出程序，可直接提交到对应的 Python ACM 环境；题面明确要求机器学习库时按要求安装依赖。

```python
import sys
import heapq
input = sys.stdin.readline

# 核心步骤：拓扑排序 + 字典序小根堆；按题意读取标准输入并输出结果。


def solve():
    n = int(input())
    graph = {}  # upstream -> list of downstream services
    in_deg = {}

    for _ in range(n):
        parts = input().split()
        name = parts[0]
        m = int(parts[1])
        in_deg.setdefault(name, 0)
        in_deg[name] += m
        for j in range(m):
            up = parts[2 + j]
            graph.setdefault(up, []).append(name)
            in_deg.setdefault(up, 0)

    heap = []
    for svc, deg in in_deg.items():
        if deg == 0:
            heapq.heappush(heap, svc)

    result = []
    while heap:
        cur = heapq.heappop(heap)
        result.append(cur)
        for nxt in graph.get(cur, []):
            in_deg[nxt] -= 1
            if in_deg[nxt] == 0:
                heapq.heappush(heap, nxt)

    if len(result) < len(in_deg):
        print("Can not deploy")
    else:
        print(' '.join(result))


solve()
```

### 复杂度分析

**时间复杂度**：$O(N \log N + E)$，其中 $E$ 为总边数。每个节点最多入堆出堆各一次，堆操作 $O(\log N)$。

**空间复杂度**：$O(N + E)$，邻接表和入度表。

---

## 03 · 开宝箱 {#problem-03}

### 题目描述

在一个 $N \times M$ 的网格中行动，网格元素含义如下：

- $0$：可通行空地
- $1$：障碍物
- $2$：起点
- $3$：宝箱位置
- $4$ 到 $9$：文物碎片（数字代表编号）

从起点出发，按编号升序依次收集所有碎片后进入宝箱。每移动一格耗时 1，只能上下左右移动。碎片编号可能不连续，可能重复（同编号的碎片都要收集，每个编号最多 3 个）。求最短总耗时。

**输入描述**

第一行两个整数 $N, M$。后续 $N$ 行，每行 $M$ 个整数。

**输出描述**

一个整数，表示最短总耗时。

### 样例

**输入**

```
4 5
2 0 0 0 0
1 0 4 0 0
1 0 1 5 0
1 0 1 0 3
```

**输出**

```
7
```

### 解题思路

**第一步：抽象关键点**

把起点、所有碎片、宝箱统称为"关键点"。碎片必须按编号升序收集，同编号的碎片要全部走到（但同编号内部顺序任意）。每个编号最多 3 个碎片，同组内的访问顺序只有 $3! = 6$ 种，可以暴力枚举。

**第二步：BFS 全源最短路**

对每个关键点跑一次 4 方向 BFS，得到它到其他所有关键点的最短距离。障碍物不可走，其余格子（包括起点、碎片、宝箱本身）都可以路过。

**第三步：分组全排列 DP**

将碎片按编号升序分组。设 $f[v]$ 表示"已经按顺序处理完前若干组碎片，当前停在关键点 $v$ 上"的最小总耗时。

初始状态 $f[\text{start}] = 0$，其余为正无穷。

每处理一个新组时，枚举上一组的停留点 $u$ 和本组碎片的全排列，计算从 $u$ 出发依次走完本组所有碎片的代价，更新新的 $f$ 数组。

最终答案是枚举最后一组的停留点 $v$，再加上 $v$ 到宝箱的距离，取最小值。

**第四步：为什么这样做是对的**

组间顺序已经确定（编号升序），组内最多 3 个碎片全排列只有 6 种，整体是一个分层 DP。关键点总数不超过 $6 \times 3 + 2 = 20$ 左右，BFS 次数和 DP 状态量都可控。

### Python ACM 实现

下面给出完整标准输入、标准输出程序，可直接提交到对应的 Python ACM 环境；题面明确要求机器学习库时按要求安装依赖。

```python
import sys
from collections import deque
from itertools import permutations
input = sys.stdin.readline

# 核心步骤：BFS 全源最短路 + 全排列 DP；按题意读取标准输入并输出结果。


def solve():
    n, m = map(int, input().split())
    grid = []
    start = treasure = None
    frags = {}  # number -> list of (r, c)

    for r in range(n):
        row = list(map(int, input().split()))
        grid.append(row)
        for c in range(m):
            v = row[c]
            if v == 2:
                start = (r, c)
            elif v == 3:
                treasure = (r, c)
            elif 4 <= v <= 9:
                frags.setdefault(v, []).append((r, c))

    keys = [start, treasure]
    for num in sorted(frags):
        keys.extend(frags[num])
    K = len(keys)
    key_idx = {}
    for i, pos in enumerate(keys):
        key_idx[pos] = i

    def bfs(sr, sc):
        dist = [[-1] * m for _ in range(n)]
        dist[sr][sc] = 0
        q = deque([(sr, sc)])
        while q:
            r, c = q.popleft()
            for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < n and 0 <= nc < m and grid[nr][nc] != 1 and dist[nr][nc] == -1:
                    dist[nr][nc] = dist[r][c] + 1
                    q.append((nr, nc))
        return dist

    pair_dist = [[0] * K for _ in range(K)]
    for i in range(K):
        d = bfs(keys[i][0], keys[i][1])
        for j in range(K):
            pair_dist[i][j] = d[keys[j][0]][keys[j][1]]

    start_idx = key_idx[start]
    treasure_idx = key_idx[treasure]

    if not frags:
        print(pair_dist[start_idx][treasure_idx])
        return

    INF = float('inf')
    f = [INF] * K
    f[start_idx] = 0

    for num in sorted(frags):
        group = frags[num]
        group_indices = [key_idx[pos] for pos in group]
        nf = [INF] * K
        for u in range(K):
            if f[u] >= INF:
                continue
            for perm in permutations(group_indices):
                cost = f[u] + pair_dist[u][perm[0]]
                for i in range(1, len(perm)):
                    cost += pair_dist[perm[i - 1]][perm[i]]
                last = perm[-1]
                if cost < nf[last]:
                    nf[last] = cost
        f = nf

    ans = INF
    for v in range(K):
        if f[v] < INF:
            ans = min(ans, f[v] + pair_dist[v][treasure_idx])
    print(ans)


solve()
```

### 复杂度分析

**时间复杂度**：$O(K \cdot N \cdot M + K^2 \cdot G!)$，其中 $K$ 为关键点数（不超过 20），$G$ 为单组最大碎片数（不超过 3）。BFS 部分 $O(K \cdot NM)$，DP 部分每组最多 $6$ 种排列乘以 $K$ 个起点。

**空间复杂度**：$O(NM + K^2)$，BFS 距离数组和关键点间距离矩阵。

---

## 小结

- 第一题是模拟题，核心在于坐标映射和边规范化去重，签到难度
- 第二题是拓扑排序模板 + 优先队列保证字典序，掌握建图方向和入度计算即可
- 第三题是本场最难题，关键在于将问题拆解为"BFS 预处理 + 分组全排列 DP"两步，利用每组最多 3 个碎片的约束控制排列枚举量
