# 994 · 腐烂的橘子

<ProblemMeta
  :tags="['Hot100', '华为面试题', '搜索与图论', '多源 BFS']"
  difficulty="medium"
  :appearances="3"
  pass-rate="53%"
  source-url="https://leetcode.cn/problems/rotting-oranges/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(mn)" space="O(mn)" />

## 题目

网格中 `0` 表示空格，`1` 表示新鲜橘子，`2` 表示腐烂橘子。每分钟，腐烂橘子会使上下左右相邻的新鲜橘子腐烂。求没有新鲜橘子所需的最少分钟数；若无法全部腐烂，返回 `-1`。

### 示例

```text
输入：grid = [[2,1,1],[1,1,0],[0,1,1]]
输出：4
解释：腐烂按分钟同时向外扩散，4 分钟后没有新鲜橘子。
```

### 约束观察

- 所有初始腐烂橘子在第 `0` 分钟同时作为传播源；
- 每分钟只能向上下左右扩散，正好对应无权图的一层距离；
- 需要区分“已经腐烂”和“本分钟新腐烂”，避免重复入队；
- 当前实现会把新鲜橘子原地改为 `2`。

## 先说逐分钟扫描

可以每分钟扫描整个网格，寻找所有可被腐烂的橘子，直到状态不再变化。最坏会重复扫描 `O(mn)` 轮，总时间达到 `O((mn)²)`。队列可以只处理这一分钟真正发生变化的位置。

## 多源 BFS

所有初始腐烂橘子会同时传播，因此把它们全部加入队列，执行多源 BFS。按层扩散，每处理完一层代表经过一分钟，同时维护剩余新鲜橘子数量。

## Python 实现

```python
from collections import deque
from typing import List


class Solution:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        rows, columns = len(grid), len(grid[0])
        queue = deque()
        fresh = 0

        for row in range(rows):
            for column in range(columns):
                if grid[row][column] == 2:
                    queue.append((row, column))
                elif grid[row][column] == 1:
                    fresh += 1

        minutes = 0
        directions = ((1, 0), (-1, 0), (0, 1), (0, -1))

        while queue and fresh > 0:
            # 当前队列长度对应这一分钟开始时所有腐烂橘子
            for _ in range(len(queue)):
                row, column = queue.popleft()
                for dr, dc in directions:
                    next_row, next_column = row + dr, column + dc
                    if (
                        0 <= next_row < rows
                        and 0 <= next_column < columns
                        and grid[next_row][next_column] == 1
                    ):
                        grid[next_row][next_column] = 2
                        fresh -= 1
                        queue.append((next_row, next_column))
            minutes += 1

        return minutes if fresh == 0 else -1
```

## 正确性说明

多源 BFS 的第 `t` 层正好表示距离任一初始腐烂橘子为 `t` 的可达新鲜橘子，因此首次腐烂时间最小。BFS 结束后若仍有新鲜橘子，它们与所有腐烂源不连通，无法被感染。

### 示例的时间层

```text
第 0 分钟：所有初始值为 2 的位置入队
第 1 分钟：处理初始队列，感染相邻新鲜橘子
第 2 分钟：只处理上一分钟新感染的位置
……
队列的一层恰好对应一分钟
```

## 复杂度

- 时间：`O(mn)`
- 空间：`O(mn)`

## 边界用例

| 输入 | 输出 | 检查点 |
|---|---:|---|
| `[[0]]` | `0` | 没有新鲜橘子 |
| `[[1]]` | `-1` | 有新鲜橘子但没有传播源 |
| `[[2,1]]` | `1` | 一层扩散 |
| `[[2,1,1],[0,1,1],[1,0,1]]` | `-1` | 存在隔离的新鲜橘子 |

## 90 秒面试表达

所有初始腐烂橘子会同时传播，所以这是多源 BFS。我先把全部腐烂位置入队并统计新鲜橘子数，然后按层处理队列；一层代表一分钟，新感染的橘子立即标记并进入下一层。队列结束后，新鲜数为零就返回分钟数，否则说明存在不可达区域，返回 `-1`。每个格子最多入队一次，时间和空间都是 `O(mn)`。

## 常见追问

- 初始没有新鲜橘子时答案是 `0`，而不是 `1`；
- 入队时就要标记腐烂，不能等出队，否则可能重复入队；
- 当前代码会修改输入网格；如需保留原数据，应先复制网格或使用独立访问数组。
