# 腾讯原创题单 06 · 单源最短路径

<ProblemMeta
  :tags="['腾讯原创题单', '腾讯面试题', '搜索与图论', 'Dijkstra']"
  difficulty="medium"
  :appearances="8"
  pass-rate="—"
/>

<ComplexityBadge
  time="O((V + E) log V)"
  space="O(V + E)"
/>

> 截图没有展示本题通过率，因此本站保留为“—”。单源最短路径是经典图论问题；“原创”沿用截图题单分类，本站按腾讯面试题版本补全输入输出约定。公开题库中没有与本页接口完全相同的力扣题，因此不附“力扣原题”按钮。

## 题目

给定一个包含 `n` 个节点的有向带权图，节点编号为 `0` 到 `n - 1`。

每条边用三元组 `[from_node, to_node, weight]` 表示，其中 `weight` 是非负整数。给定源点 `source`，请返回源点到每个节点的最短距离。

如果某个节点从源点不可达，对应距离返回 `-1`。

### 接口约定

```text
shortestPath(n, edges, source) -> list[int]
```

### 数据范围

- `1 <= n <= 10^5`；
- `0 <= len(edges) <= 2 × 10^5`；
- `0 <= from_node, to_node < n`；
- `0 <= weight <= 10^9`；
- 图中允许出现重边和自环；
- 图中不包含负权边。

## 示例

```text
输入：
n = 5
edges = [
    [0, 1, 4],
    [0, 2, 1],
    [2, 1, 2],
    [1, 3, 1],
    [2, 3, 5],
]
source = 0

输出：[0, 3, 1, 4, -1]
```

解释：

- `0 → 2` 的距离为 `1`；
- `0 → 2 → 1` 的距离为 `3`，优于边 `0 → 1` 的距离 `4`；
- `0 → 2 → 1 → 3` 的距离为 `4`；
- 节点 `4` 不可达。

## 为什么选择 Dijkstra

这道题有三个关键信号：

1. 求一个源点到所有节点的最短距离；
2. 边有不同权重，不能直接使用普通 BFS；
3. 所有边权都非负，可以使用 Dijkstra 的贪心性质。

如果图中存在负权边，Dijkstra 不能保证正确，需要根据约束改用 Bellman-Ford、SPFA 的受限版本，或在有向无环图中使用拓扑序动态规划。

## 堆优化 Dijkstra

维护：

- 邻接表 `graph`；
- 当前已知最短距离数组 `distances`；
- 保存 `(距离, 节点)` 的最小堆。

每次取出堆中距离最小的节点，并尝试用它更新所有出边：

```text
candidate = current_distance + edge_weight
```

如果 `candidate` 更短，就更新距离并压入堆。

Python 的 `heapq` 不支持原地修改堆中元素，因此一个节点可能在堆里出现多次。弹出记录时，如果它的距离已经不是当前最优值，说明这是一条历史记录，直接跳过。

## Python 实现

```python
import heapq


class Solution:
    def shortestPath(
        self,
        n: int,
        edges: list[list[int]],
        source: int,
    ) -> list[int]:
        if n <= 0:
            raise ValueError("n 必须是正整数")
        if not 0 <= source < n:
            raise ValueError("source 超出节点范围")

        graph: list[list[tuple[int, int]]] = [
            [] for _ in range(n)
        ]
        for from_node, to_node, weight in edges:
            if weight < 0:
                raise ValueError("Dijkstra 不支持负权边")
            graph[from_node].append((to_node, weight))

        infinity = float("inf")
        distances: list[float | int] = [infinity] * n
        distances[source] = 0
        min_heap: list[tuple[int, int]] = [(0, source)]

        while min_heap:
            current_distance, node = heapq.heappop(min_heap)

            # 同一节点可能被多次压入堆；旧距离已经失效。
            if current_distance != distances[node]:
                continue

            for neighbor, weight in graph[node]:
                candidate = current_distance + weight
                if candidate >= distances[neighbor]:
                    continue

                # 找到更短路径后更新，并等待后续继续扩展。
                distances[neighbor] = candidate
                heapq.heappush(
                    min_heap,
                    (candidate, neighbor),
                )

        return [
            -1 if distance == infinity else int(distance)
            for distance in distances
        ]
```

## 为什么弹出时的最小距离可以确定

假设节点 `u` 以当前最小距离 `d` 从堆中弹出，并且这条记录没有过期。

如果还存在一条更短但尚未发现的路径到达 `u`，这条路径上必然有第一个尚未确定的节点 `x`。`x` 的前一个节点已经被处理，因此到 `x` 的那段候选距离早已进入最小堆。

由于所有边权非负，这个候选距离不会大于整条路径到 `u` 的距离，也就会小于 `d`。那么 `x` 应该先于 `u` 被弹出，与 `u` 当前是堆中最小值矛盾。

所以 `u` 弹出时的距离就是源点到 `u` 的最短距离。

## 正确性说明

算法开始时，源点距离为 `0`，其他节点距离为无穷大。

根据上面的贪心性质，每次处理一条未过期的堆记录时，该节点的距离已经是最终最短距离。随后遍历它的每条出边：

- 如果经过当前节点不能缩短邻居距离，不作修改；
- 如果能够缩短，就记录这条更优路径并放入堆中。

所有从源点可达的节点最终都会沿某条路径被松弛并弹出，不可达节点则始终保持无穷大。最后把无穷大转换为 `-1`，因此返回数组正确。

## 复杂度

令节点数为 `V`、边数为 `E`：

- 构建邻接表需要 `O(V + E)` 时间和空间；
- 每次成功松弛最多压入一条堆记录，堆操作为 `O(log V)`；
- 总时间复杂度为 `O((V + E) log V)`；
- 邻接表、距离数组和堆共占用 `O(V + E)` 空间。

## 边界用例

| 场景 | 预期 |
|---|---|
| 只有源点 | 返回 `[0]` |
| 没有边 | 源点为 0，其余节点为 `-1` |
| 存在重边 | 自动保留能形成最短路径的边 |
| 存在 0 权边 | 正常处理 |
| 存在自环 | 不影响最短距离 |
| 存在负权边 | 抛出 `ValueError` |
| 堆中存在旧记录 | 通过距离比较跳过 |

## 60～90 秒口述稿

这是非负权图的单源最短路径，我用邻接表加最小堆实现 Dijkstra。距离数组初始为无穷大，源点为 0；每次从堆里取当前距离最小的节点，用它松弛所有出边。

因为 `heapq` 不能原地修改，一个节点可能有多条堆记录，所以弹出时要和距离数组比较，旧记录直接跳过。非负权保证当前最小节点不会再被一条尚未发现的路径缩短，因此它的距离可以确定。

建图和存储是 `O(V + E)`，堆优化后的时间复杂度是 `O((V + E) log V)`。不可达节点最后从无穷大转换成 `-1`。

## 常见追问

### 1. 为什么普通 BFS 不行？

普通 BFS 按边数分层，只适用于每条边代价相同的图。本题边权不同，边数更少的路径不一定总权重更小。

### 2. 如果只求 source 到 target 呢？

当 `target` 的未过期记录第一次从最小堆弹出时即可返回，不必继续计算其他节点。

### 3. 如果边权只有 0 和 1 呢？

可以使用双端队列实现 0-1 BFS，把 0 权边加入队首、1 权边加入队尾，时间复杂度降为 `O(V + E)`。

### 4. 力扣上有相关练习吗？

[网络延迟时间 743](https://leetcode.cn/problems/network-delay-time/)同样使用单源 Dijkstra，但它最终要求所有节点中最晚到达的时间，与本页返回完整距离数组的接口并不完全相同。
