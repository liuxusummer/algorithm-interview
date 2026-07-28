---
pageClass: exam-session-page
title: 拼多多暑期实习 · 大模型算法岗 2026-07-02
description: 拼多多 2026-07-02 暑期实习 · 大模型算法岗笔试真题，含 4 道 Python ACM 模式题解
---

<div class="exam-session-banner">
  <div>
    <span>PINDUODUO / 2026.07.02 / ACM</span>
    <strong>拼多多 · 暑期实习 · 大模型算法岗</strong>
    <small>2026-07-02 · 4 题 ACM · 难度 中等</small>
  </div>
  <div class="exam-session-banner__meta">
    <span>对角线遍历矩阵</span>
    <span>多多的营救行动</span>
    <span>多多捕蝇</span>
    <span>CLIP 对比学习损失</span>
  </div>
</div>

# 拼多多 2026-07-02 暑期实习 · 大模型算法岗笔试解析

本场仅整理需要编程实现的题目，并统一为完整 Python ACM 程序。每题保留标准输入输出、建模过程、正确性依据、复杂度、易错点和关键中文注释；数据岗原 SQL 题也补充了等价的 Python 标准输入输出版本。

来源：[Zero2Leetcode · 拼多多 2026-07-02 暑期实习 · 大模型算法岗](https://onefly.top/zero2Leetcode/04_real_interviews/pinduoduo/algo-20260702/)。

## 本场考试概述

**考试时间**：2026年7月2日
**考试岗位**：大模型算法岗
**难度评级**：中等

**考点分析**：

1. 第一题：对角线遍历矩阵——矩阵模拟（难度简单）
2. 第二题：多多的营救行动——图论建模 + 拓扑剥离（难度中等）
3. 第三题：多多捕蝇——函数图找环（难度中等）
4. 第四题：CLIP 对比学习损失——NumPy 矩阵运算（难度中等）

**建议策略**：

1. 第一题是纯送分题，抓住"同一条对角线上行列差 $i-j$ 相同、相邻对角线方向交替"即可
2. 第二、三题本质是同一套思想——在图上反复剥离"入度为 0"的节点，先稳拿第一题再攻这两道
3. 第四题考的是徒手用 NumPy 复现 softmax 交叉熵，代码量不大，注意数值稳定（减去行最大值）和双向取平均

---

## 01 · 对角线遍历矩阵 {#problem-01}

### 题目描述

给定一个 $m \times n$ 的矩阵，按对角线遍历的顺序输出所有元素。从左下角出发，逐条对角线向右上推进，相邻对角线方向交替（第一条从下往上，第二条从上往下，依此类推）。

### 样例

**输入**

```
3 3
1 2 3
4 5 6
7 8 9
```

**输出**

```
7 4 8 9 5 1 2 6 3
```

### 解题思路

**第一步：用行列差给对角线编号**

观察发现同一条对角线上所有格子的行列差 $i - j$ 相同。从最左下那条对角线（$i-j = m-1$）开始，到最右上（$i-j = -(n-1)$）结束，共 $m+n-1$ 条。

**第二步：确定每条对角线上的格子范围**

固定差值 $d = i - j$ 后，行号 $i$ 要同时满足 $0 \leq i \leq m-1$ 和 $0 \leq i-d \leq n-1$，合并得到 $\max(0, d) \leq i \leq \min(m-1, n-1+d)$。

**第三步：方向交替**

用编号 $g$ 从 0 开始递增，$g$ 为偶数时从下往上取（行号递减），奇数时从上往下取（行号递增）。

### Python ACM 实现

下面给出完整标准输入、标准输出程序，可直接在 Python 3 ACM 环境运行。

```python
import sys
input = sys.stdin.readline

# 核心步骤：对角线遍历矩阵；按题面读取标准输入并输出唯一结果。

def solve():
    m, n = map(int, input().split())
    mat = [list(map(int, input().split())) for _ in range(m)]

    res = []
    for g in range(m + n - 1):
        d = (m - 1) - g
        lo = max(0, d)
        hi = min(m - 1, n - 1 + d)
        order = range(hi, lo - 1, -1) if g % 2 == 0 else range(lo, hi + 1)
        for i in order:
            res.append(mat[i][i - d])

    print(" ".join(map(str, res)))

solve()
```

### 复杂度分析

**时间复杂度**：$O(mn)$，每个格子恰好访问一次。
**空间复杂度**：$O(mn)$，存储矩阵。

---

## 02 · 多多的营救行动 {#problem-02}

### 题目描述

地牢中有 $n$ 个守卫，每个守卫站在自己的区域并监视若干其他区域。多多可以单杀或双杀守卫：

- **单杀**：守卫所在区域没有被其他存活守卫监视
- **双杀**：两个守卫彼此且仅彼此监视（各自只被对方监视），可同时打倒

被打倒的守卫不再具备监视能力。问能否打倒所有守卫？若不能，输出最少剩余数量。

### 样例

**输入**

```
2
1 1 2
2 0
```

**输出**

```
SUCCESS
```

### 解题思路

**第一步：建成有向图**

把"守卫 $j$ 监视区域 $r$"看作一条有向边 $j \to r$。用 `monitored_by[r]` 记录当前存活守卫中监视区域 $r$ 的集合。

**第二步：两种安全操作对应两种结构**

- 单杀：区域 $i$ 的 `monitored_by[i]` 为空（入度为 0），可以安全打倒守卫 $i$
- 双杀：守卫 $i$ 只被 $j$ 监视，且 $j$ 也只被 $i$ 监视，互为唯一监视者

**第三步：剥离到不动点**

反复执行：先尽量单杀所有入度为 0 的守卫，没有可单杀的再找一对可双杀的。每次打倒守卫只会让其他守卫的条件更容易满足（从别人的 monitored_by 中移除），不会制造新阻碍，因此贪心到底最优。

**第四步：剩余守卫**

剥离停止时若还有存活守卫，它们一定卡在相互纠缠的结构里（如三元环），无法安全消除。

### Python ACM 实现

下面给出完整标准输入、标准输出程序，可直接在 Python 3 ACM 环境运行。

```python
import sys
input = sys.stdin.readline

# 核心步骤：多多的营救行动；按题面读取标准输入并输出唯一结果。

def solve():
    n = int(input())
    watch = [[] for _ in range(n + 1)]
    for _ in range(n):
        parts = list(map(int, input().split()))
        x, m = parts[0], parts[1]
        watch[x] = parts[2:2 + m]

    monitored_by = [set() for _ in range(n + 1)]
    for j in range(1, n + 1):
        for r in watch[j]:
            if 1 <= r <= n and r != j:
                monitored_by[r].add(j)

    alive = [i > 0 for i in range(n + 1)]
    cnt = n

    def kill(i):
        nonlocal cnt
        alive[i] = False
        cnt -= 1
        for r in watch[i]:
            if 1 <= r <= n:
                monitored_by[r].discard(i)

    changed = True
    while changed:
        changed = False
        for i in range(1, n + 1):
            if alive[i] and not monitored_by[i]:
                kill(i)
                changed = True
        if changed:
            continue
        for i in range(1, n + 1):
            if alive[i] and len(monitored_by[i]) == 1:
                j = next(iter(monitored_by[i]))
                if alive[j] and monitored_by[j] == {i}:
                    kill(i)
                    kill(j)
                    changed = True
                    break

    print("SUCCESS" if cnt == 0 else cnt)

solve()
```

### 复杂度分析

**时间复杂度**：$O(n \cdot E)$，$E$ 为监视关系总数，每轮剥离至少消除一个守卫。
**空间复杂度**：$O(n + E)$。

---

## 03 · 多多捕蝇 {#problem-03}

### 题目描述

$n$ 个房间，房间 $i$ 有出边指向 $a_i$（每个房间恰好一条出边）。苍蝇从任意房间出发沿边行走。在房间 $i$ 放粘蝇板的代价为 $c_i$。求最少总代价使得无论苍蝇初始在哪都能被捕获。

### 样例

**输入**

```
4
1 10 2 10
2 4 2 2
```

**输出**

```
10
```

### 解题思路

**第一步：函数图的结构**

每个节点出度恰好为 1，构成函数图。从任意节点出发一直走，房间数有限必然进入环。整张图由若干连通块组成，每个连通块是一个环加上汇入环的若干树枝。

**第二步：为什么每个环放一块板就够**

苍蝇最终会落入所在连通块的环里无限绕圈，只要环上有一块板必然经过；树枝上的房间早晚走进环，无需单独放板。不同环互不连通，必须各放至少一块。

**第三步：取每个环上最便宜的房间**

每个环选代价最小的房间放板，总答案是所有环最小 $c$ 之和。

**第四步：用拓扑剥离找环**

统计入度，把入度为 0 的房间不断出队删除（它们在树枝末端），删除时将其指向的房间入度减一。剥离结束后仍存活的房间恰好是所有环上的节点。最后沿出边遍历每个环累加最小值。

### Python ACM 实现

下面给出完整标准输入、标准输出程序，可直接在 Python 3 ACM 环境运行。

```python
import sys
from collections import deque
input = sys.stdin.readline

def solve():
    n = int(input())
    c = [0] + list(map(int, input().split()))
    a = [0] + list(map(int, input().split()))

    indeg = [0] * (n + 1)
    for i in range(1, n + 1):
        indeg[a[i]] += 1

    # 拓扑剥离：入度为 0 的是树枝末端
    removed = [False] * (n + 1)
    q = deque(i for i in range(1, n + 1) if indeg[i] == 0)
    while q:
        u = q.popleft()
        removed[u] = True
        v = a[u]
        indeg[v] -= 1
        if indeg[v] == 0 and not removed[v]:
            q.append(v)

    # 遍历每个环取最小代价
    visited = [False] * (n + 1)
    ans = 0
    for i in range(1, n + 1):
        if not removed[i] and not visited[i]:
            mn = c[i]
            visited[i] = True
            x = a[i]
            while x != i:
                visited[x] = True
                if c[x] < mn:
                    mn = c[x]
                x = a[x]
            ans += mn

    print(ans)

solve()
```

### 复杂度分析

**时间复杂度**：$O(n)$，每个房间入队出队各一次，每个环完整遍历一次。
**空间复杂度**：$O(n)$。

---

## 04 · CLIP 对比学习损失 {#problem-04}

### 题目描述

实现 CLIP 对比学习损失函数。给定已 L2 归一化的图像嵌入矩阵（$N \times D$）、文本嵌入矩阵（$N \times D$）和温度参数 $\tau$：

1. 计算相似度矩阵 $S = I \cdot T^\top / \tau$
2. 标签在对角线：第 $i$ 个图像匹配第 $i$ 个文本
3. 图像→文本方向和文本→图像方向各做 softmax 交叉熵，取平均

输出最终损失值，保留 6 位小数。实现仅使用 Python 标准库。

### 样例

**输入**

```
{"image_embeds": [[1, 0], [0, 1]], "text_embeds": [[1, 0], [0, 1]], "temperature": 1.0}
```

**输出**

```
0.313262
```

### 解题思路

**第一步：相似度矩阵**

图像与文本先做矩阵乘法再除以温度，得到 $N \times N$ 的 logits 矩阵。第 $i$ 行第 $j$ 列是图像 $i$ 与文本 $j$ 的相似度。

**第二步：对比学习的标签在对角线**

一个 batch 里第 $i$ 个图像的正确匹配就是第 $i$ 个文本，标签为 $\text{diag}(0, 1, ..., N-1)$。

**第三步：数值稳定的交叉熵**

对每一行先减去行最大值再取指数（避免溢出）。单行交叉熵 = log-sum-exp - 标签位置的分数（即对角元）。对所有行求平均得该方向的损失。

**第四步：双向取平均**

图像→文本对 $S$ 的每一行做 softmax 交叉熵；文本→图像对 $S^\top$ 做同样计算。最终损失为两者均值。

### Python ACM 实现

下面给出完整标准输入、标准输出程序，可直接在 Python 3 ACM 环境运行。

```python
import json
import math
import sys


def solve():
    data = json.loads(sys.stdin.read())
    image_embeds = data["image_embeds"]
    text_embeds = data["text_embeds"]
    temperature = float(data["temperature"])
    sample_count = len(image_embeds)

    # 用纯 Python 计算 N×N 相似度矩阵，输入仍保持来源题面的 JSON 格式。
    logits = [
        [
            sum(x * y for x, y in zip(image, text)) / temperature
            for text in text_embeds
        ]
        for image in image_embeds
    ]

    def cross_entropy(matrix):
        total = 0.0
        for index, row in enumerate(matrix):
            # 减去行最大值，避免 exp 在大数上溢出。
            row_max = max(row)
            log_sum_exp = row_max + math.log(
                sum(math.exp(value - row_max) for value in row)
            )
            total += log_sum_exp - row[index]
        return total / sample_count

    transposed = [list(column) for column in zip(*logits)]
    loss = (cross_entropy(logits) + cross_entropy(transposed)) / 2
    print(f"{loss:.6f}")


solve()
```

### 复杂度分析

**时间复杂度**：$O(N^2 D)$，主要开销是相似度矩阵的矩阵乘法。
**空间复杂度**：$O(N^2)$，存储 logits 矩阵。

---

## 小结

- 第一题是纯模拟题，按行列差分组对角线、方向交替遍历即可
- 第二题建有向图后，反复剥离入度为 0 的节点和互为唯一监视者的节点对，贪心到不动点
- 第三题利用函数图"每个连通块有且仅有一个环"的性质，拓扑剥离找环后取每环最小代价
- 第四题是 CLIP 损失的标准实现，注意数值稳定（减行最大值）和双向对称
