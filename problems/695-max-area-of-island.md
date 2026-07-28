# 695 · 岛屿的最大面积

<ProblemMeta
  :tags="['字节面试题', 'DFS', '网格搜索']"
  difficulty="medium"
  :appearances="15"
  pass-rate="46%"
  source-url="https://leetcode.cn/problems/max-area-of-island/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(mn)" space="O(mn)" />

## 题目

给定由 `0` 和 `1` 组成的二维网格。上下左右相邻的 `1` 构成一座岛屿，岛屿面积是其中格子的数量。

返回所有岛屿中的最大面积；如果没有陆地，返回 `0`。

### 示例

```text
输入：grid = [
  [0, 0, 1, 0],
  [1, 1, 1, 0],
  [0, 1, 0, 1]
]
输出：5
```

## 与岛屿数量的关系

两题都需要枚举网格中的连通分量：

- 岛屿数量：每发现一个新连通分量，计数加一；
- 最大面积：搜索一个连通分量时统计结点数，并更新最大值。

下面同样使用迭代 DFS，并把访问过的陆地改为水。

## Python 实现

```python
class Solution:
    def maxAreaOfIsland(self, grid: list[list[int]]) -> int:
        if not grid or not grid[0]:
            return 0

        rows = len(grid)
        columns = len(grid[0])
        maximum_area = 0

        for row in range(rows):
            for column in range(columns):
                if grid[row][column] != 1:
                    continue

                # 发现新岛屿后立即标记，DFS 统计该连通分量面积。
                grid[row][column] = 0
                stack = [(row, column)]
                current_area = 0

                while stack:
                    current_row, current_column = stack.pop()
                    current_area += 1

                    for row_step, column_step in (
                        (1, 0),
                        (-1, 0),
                        (0, 1),
                        (0, -1),
                    ):
                        next_row = current_row + row_step
                        next_column = current_column + column_step

                        if (
                            0 <= next_row < rows
                            and 0 <= next_column < columns
                            and grid[next_row][next_column] == 1
                        ):
                            grid[next_row][next_column] = 0
                            stack.append((next_row, next_column))

                maximum_area = max(maximum_area, current_area)

        return maximum_area
```

## 面积在哪里累加

格子入栈时已被标记，保证每个陆地只入栈一次；格子出栈时把当前岛屿面积加一。DFS 结束后，`current_area` 就是该连通分量的结点数。

也可以在入栈时累加，只要“标记”和“计数”都保证每个格子只发生一次即可。

## 正确性说明

外层遍历会找到每个尚未访问连通分量的第一个陆地。DFS 沿四个方向访问该岛屿的全部格子且不进入水域，也不会重复访问，所以 `current_area` 恰好等于这座岛的面积。算法比较所有连通分量的面积，最终返回其中最大值。

## 复杂度

- 时间复杂度：`O(mn)`，每个格子至多被处理常数次。
- 空间复杂度：最坏 `O(mn)`，显式栈可能容纳整座岛屿的大量格子。

## 边界用例

| 场景 | 预期 | 检查点 |
|---|---|---|
| 全是 `0` | `0` | 没有岛屿 |
| 单个 `1` | `1` | 最小岛屿 |
| 全是 `1` | `m × n` | 最大连通分量 |
| 对角线上的 `1` | 每座面积为 `1` | 四方向连接 |

## 90 秒面试表达

“这题与岛屿数量一样，本质是枚举网格连通分量，只是需要统计每个分量的结点数。我遍历网格，每遇到未访问陆地就用显式栈做 DFS，入栈时改成 0 防止重复，出栈时面积加一。一次搜索结束后更新最大面积。每个格子最多处理一次，时间 `O(mn)`，最坏栈空间 `O(mn)`。”

## 常见追问

- 如果要求岛屿周长，需要统计陆地格子的临水边或越界边。
- 如果要求最大岛屿形状，可以在 DFS 中记录相对坐标。
- 如果允许把一个水格改成陆地，可为各连通分量编号并枚举水格相邻分量。
