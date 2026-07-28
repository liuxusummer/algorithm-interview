# 200 · 岛屿数量

<ProblemMeta
  :tags="['Hot100', '大厂面试', 'DFS', '华为面试题']"
  difficulty="medium"
  :appearances="94"
  pass-rate="30%"
  source-url="https://leetcode.cn/problems/number-of-islands/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(mn)" space="O(mn)" />

## 题目

给定由字符 `"1"` 和 `"0"` 组成的二维网格，`"1"` 表示陆地，`"0"` 表示水。

上下左右相邻的陆地属于同一座岛屿，计算网格中的岛屿数量。

### 示例

```text
输入：
[
  ["1", "1", "0", "0", "0"],
  ["1", "1", "0", "0", "0"],
  ["0", "0", "1", "0", "0"],
  ["0", "0", "0", "1", "1"]
]
输出：3
```

## 转换成图问题

把每个陆地格子看成结点，相邻陆地之间有边。一座岛屿就是图中的一个连通分量。

遍历网格时，每遇到一个尚未访问的陆地：

1. 岛屿数量加一；
2. 从它出发做 DFS；
3. 把同一连通分量的所有陆地标记为已访问。

## 为什么使用迭代 DFS

网格最多可能形成很长的蛇形路径。Python 默认递归深度有限，递归 DFS 可能在大用例上报错。显式栈与递归语义相同，但不受递归深度限制。

下面直接把访问过的 `"1"` 改成 `"0"`，复用输入网格保存访问状态。

## Python 实现

```python
class Solution:
    def numIslands(self, grid: list[list[str]]) -> int:
        if not grid or not grid[0]:
            return 0

        rows = len(grid)
        columns = len(grid[0])
        island_count = 0

        for row in range(rows):
            for column in range(columns):
                if grid[row][column] != "1":
                    continue

                island_count += 1
                # 发现新陆地后立即染色，并遍历整个连通分量。
                grid[row][column] = "0"
                stack = [(row, column)]

                while stack:
                    current_row, current_column = stack.pop()

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
                            and grid[next_row][next_column] == "1"
                        ):
                            grid[next_row][next_column] = "0"
                            stack.append((next_row, next_column))

        return island_count
```

## 为什么入栈时就标记

如果等到出栈才标记，同一个陆地可能被多个邻居重复加入栈。入栈时立即标记可以保证每个格子至多入栈一次，使时间复杂度稳定在线性范围。

## 正确性说明

每当外层遍历发现未访问陆地，它不属于此前处理过的任何连通分量，因此对应一座新岛屿。随后 DFS 恰好访问所有与它四向连通的陆地并标记。这样每座岛屿只会在第一次遇到时计数一次，所有陆地又都会被外层遍历覆盖，所以结果正好是岛屿数量。

## 复杂度

- 时间复杂度：`O(mn)`，每个格子至多被检查和入栈常数次。
- 空间复杂度：最坏 `O(mn)`，整张网格均为陆地时栈可能保存大量格子。

## 边界用例

| 场景 | 预期 | 检查点 |
|---|---|---|
| 全是水 | `0` | 没有搜索起点 |
| 全是陆地 | `1` | 单一连通分量 |
| 对角线相邻陆地 | 分属不同岛屿 | 只看四方向 |
| 多个分散区域 | 区域数量 | 不重复计数 |

## 90 秒面试表达

“把陆地格子看作图结点，岛屿就是四方向连通分量。遍历网格，每发现一个未访问陆地，答案加一，再从它做 DFS，把整个岛屿标记为水。为了避免 Python 递归深度问题，我用显式栈，并在邻格入栈时立即标记，保证不会重复入栈。每个格子只处理常数次，时间 `O(mn)`，最坏空间 `O(mn)`。”

## 常见追问

- 不允许修改输入时，可以维护 `visited` 集合或布尔矩阵。
- 动态加入陆地并实时查询岛屿数时，可以使用并查集。
- 若允许八方向相连，只需增加四个对角方向。
