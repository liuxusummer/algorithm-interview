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

## 思路

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

## 复杂度

- 时间：`O(mn)`
- 空间：`O(mn)`

## 易错点

初始没有新鲜橘子时答案是 `0`，而不是 `1`。
