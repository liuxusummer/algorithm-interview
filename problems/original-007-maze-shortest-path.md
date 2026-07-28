# 腾讯原创题单 07 · 迷宫最短路径

<ProblemMeta
  :tags="['腾讯原创题单', '腾讯面试题', '搜索与图论', 'BFS']"
  difficulty="medium"
  :appearances="8"
  pass-rate="—"
/>

<ComplexityBadge
  time="O(mn)"
  space="O(mn)"
/>

> 截图没有展示本题通过率，因此本站保留为“—”。迷宫最短路径是经典 BFS 模型；“原创”沿用截图题单分类，本站按腾讯面试题版本补全输入输出约定。公开题库中没有与本页四方向接口完全相同的力扣题，因此不附“力扣原题”按钮。

## 题目

给定一个 `rows × columns` 的二维迷宫：

- `0` 表示可以通行；
- `1` 表示障碍物；
- 每一步可以向上、下、左、右移动一格；
- 不能越界，也不能进入障碍物。

再给定起点 `start` 和终点 `target`，返回从起点走到终点所需的最少步数。如果无法到达，返回 `-1`。

### 接口约定

```text
shortestPath(grid, start, target) -> int
```

坐标均使用 0-based 的 `(row, column)`。

### 数据范围

- `1 <= rows, columns <= 1000`；
- `grid` 是非空矩形；
- `grid[row][column]` 只取 `0` 或 `1`；
- `start` 和 `target` 均在网格范围内；
- 如果起点或终点是障碍物，返回 `-1`。

## 示例

```text
输入：
grid = [
    [0, 0, 1, 0],
    [1, 0, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 0],
]
start = (0, 0)
target = (3, 3)

输出：6
```

一条最短路线为：

```text
(0,0) → (0,1) → (1,1) → (1,2)
→ (1,3) → (2,3) → (3,3)
```

## 为什么 BFS 能得到最短路径

把每个可通行格子看成图节点，相邻格子之间有一条边。因为每次移动的代价都恰好是 1，所以这是一个无权图最短路径问题。

BFS 按距离分层扩展：

- 第 0 层是起点；
- 第 1 层是一步可达的格子；
- 第 2 层是最少两步可达的格子；
- 依此类推。

因此一个格子第一次被访问时，得到的就是从起点到它的最短距离。

## Python 实现

```python
from collections import deque


class Solution:
    def shortestPath(
        self,
        grid: list[list[int]],
        start: tuple[int, int],
        target: tuple[int, int],
    ) -> int:
        if not grid or not grid[0]:
            return -1

        rows = len(grid)
        columns = len(grid[0])
        start_row, start_column = start
        target_row, target_column = target

        if (
            grid[start_row][start_column] == 1
            or grid[target_row][target_column] == 1
        ):
            return -1
        if start == target:
            return 0

        distances = [
            [-1] * columns
            for _ in range(rows)
        ]
        distances[start_row][start_column] = 0
        queue = deque([start])

        while queue:
            row, column = queue.popleft()

            for row_step, column_step in (
                (1, 0),
                (-1, 0),
                (0, 1),
                (0, -1),
            ):
                next_row = row + row_step
                next_column = column + column_step

                if not (
                    0 <= next_row < rows
                    and 0 <= next_column < columns
                ):
                    continue
                if grid[next_row][next_column] == 1:
                    continue
                if distances[next_row][next_column] != -1:
                    continue

                # 入队时立即记录距离，保证每个格子只入队一次。
                distances[next_row][next_column] = (
                    distances[row][column] + 1
                )

                if (next_row, next_column) == target:
                    return distances[next_row][next_column]

                queue.append((next_row, next_column))

        return -1
```

## 为什么必须在入队时标记

如果等到出队时才标记访问状态，同一个格子可能被多个相邻格子重复加入队列。

例如一个空白矩形中的中心格子可以从多个方向到达。入队时立即记录距离，可以保证：

- 每个格子至多入队一次；
- 第一次记录的距离就是最短距离；
- 队列规模和总操作次数保持在 `O(rows × columns)`。

## 正确性说明

起点距离为 0。BFS 队列中的格子按距离非递减顺序出队。

假设当前格子的距离已经是最短距离，那么从它走到未访问邻居只增加一步。所有可能以更少步数到达该邻居的前驱都会位于当前层或更早层，并且已经先被处理。因此邻居第一次入队时记录的距离不可能再被缩短。

算法会访问所有从起点可达的通行格子：

- 终点第一次被发现时，其距离就是最少步数，可以立即返回；
- 如果队列耗尽仍未发现终点，说明不存在可行路径，返回 `-1`。

所以算法结果正确。

## 复杂度

- 每个格子至多入队、出队一次，时间复杂度为 `O(rows × columns)`；
- 距离矩阵和队列最多保存全部格子，空间复杂度为 `O(rows × columns)`。

## 边界用例

| 场景 | 预期 |
|---|---|
| 起点等于终点且可通行 | 返回 `0` |
| 起点或终点是障碍物 | 返回 `-1` |
| 单行或单列迷宫 | 正常沿唯一方向搜索 |
| 终点被障碍物包围 | 返回 `-1` |
| 全部格子可通行 | 返回曼哈顿距离 |
| 存在多条最短路线 | 返回共同的最少步数 |

## 如何恢复一条最短路径

如果不仅要最少步数，还要输出路线，可以在邻居第一次入队时记录它的前驱：

```python
from collections import deque


def shortest_path_with_route(
    grid: list[list[int]],
    start: tuple[int, int],
    target: tuple[int, int],
) -> tuple[int, list[tuple[int, int]]]:
    rows = len(grid)
    columns = len(grid[0])

    if grid[start[0]][start[1]] == 1:
        return -1, []
    if grid[target[0]][target[1]] == 1:
        return -1, []

    queue = deque([start])
    parent: dict[
        tuple[int, int],
        tuple[int, int] | None,
    ] = {start: None}

    while queue:
        row, column = queue.popleft()
        if (row, column) == target:
            path: list[tuple[int, int]] = []
            current: tuple[int, int] | None = target

            # 从终点沿前驱回到起点，再反转得到正向路径。
            while current is not None:
                path.append(current)
                current = parent[current]
            path.reverse()
            return len(path) - 1, path

        for row_step, column_step in (
            (1, 0),
            (-1, 0),
            (0, 1),
            (0, -1),
        ):
            neighbor = (
                row + row_step,
                column + column_step,
            )
            next_row, next_column = neighbor

            if (
                0 <= next_row < rows
                and 0 <= next_column < columns
                and grid[next_row][next_column] == 0
                and neighbor not in parent
            ):
                parent[neighbor] = (row, column)
                queue.append(neighbor)

    return -1, []
```

## 60～90 秒口述稿

我把每个可通行格子看成图节点，上下左右相邻就是边。每次移动代价都为 1，所以用 BFS 按距离分层扩展。

我用距离矩阵同时保存访问状态，起点距离为 0。每个邻居第一次入队时就记录为当前距离加 1，这样它只会入队一次，而且第一次得到的距离就是最短距离。发现终点可以立即返回；队列耗尽仍没找到就返回 `-1`。

每个格子最多处理一次，时间和空间都是 `O(rows × columns)`。如果追问输出路线，我会额外记录每个格子的前驱，再从终点反向恢复。

## 常见追问

### 1. 为什么不能使用 DFS？

DFS 能判断是否可达，但第一次到达终点的路径不一定最短。要用 DFS 求最短路，需要枚举大量路径并回溯，效率远低于 BFS。

### 2. 如果允许八个方向移动呢？

只需在方向数组中加入四个对角方向，BFS 框架不变。[二进制矩阵中的最短路径 1091](https://leetcode.cn/problems/shortest-path-in-binary-matrix/)就是相关的八方向练习，但不是本页四方向题面的完全同题。

### 3. 如果不同格子的移动代价不同呢？

单位权假设被破坏后不能直接使用普通 BFS：

- 边权只有 0 和 1：使用 0-1 BFS；
- 边权均非负：使用 Dijkstra；
- 存在负权：需要其他最短路算法。

### 4. 能否不使用完整距离矩阵？

如果只需要最短步数，可以保存访问集合，并在 BFS 中按层计数。最坏空间仍是 `O(rows × columns)`，但不再保存每个格子的具体距离。
