# 064 · 最小路径和

<ProblemMeta
  :tags="['Hot100', '大厂面试', '网格 DP']"
  difficulty="medium"
  :appearances="13"
  pass-rate="55%"
  source-url="https://leetcode.cn/problems/minimum-path-sum/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(mn)" space="O(mn) → O(n)" />

## 题目

给定一个包含非负整数的 `m × n` 网格，从左上角出发，每次只能向右或向下移动，返回到达右下角的最小路径数字和。

### 示例

```text
输入：
[
  [1, 3, 1],
  [1, 5, 1],
  [4, 2, 1]
]
输出：7
解释：路径 1 → 3 → 1 → 1 → 1
```

## 状态与转移

定义：

```text
dp[row][column] =
从左上角到当前位置的最小路径和
```

只能从上方或左方进入当前格：

```text
dp[row][column] =
min(dp[row - 1][column], dp[row][column - 1])
+ grid[row][column]
```

先用二维表把首行、首列和两个转移来源写清楚，再观察每一行只依赖上一行和本行左侧，从而压缩空间。

## 二维 DP 实现（基础版）

```python
class Solution:
    def minPathSum(self, grid: list[list[int]]) -> int:
        rows = len(grid)
        columns = len(grid[0])
        dp = [[0] * columns for _ in range(rows)]

        dp[0][0] = grid[0][0]

        # 第一列只能从上方到达。
        for row in range(1, rows):
            dp[row][0] = dp[row - 1][0] + grid[row][0]

        # 第一行只能从左侧到达。
        for column in range(1, columns):
            dp[0][column] = dp[0][column - 1] + grid[0][column]

        for row in range(1, rows):
            for column in range(1, columns):
                dp[row][column] = min(
                    dp[row - 1][column],
                    dp[row][column - 1],
                ) + grid[row][column]

        return dp[rows - 1][columns - 1]
```

完整二维表还可以直接保存前驱方向，适合需要恢复具体最短路径的变体。

## 空间优化：压缩成一行

当前状态只依赖上一行同列与当前行左侧，因此可以让 `dp[column]` 同时承载新旧两行状态。

```python
class Solution:
    def minPathSum(self, grid: list[list[int]]) -> int:
        columns = len(grid[0])
        dp = [float("inf")] * columns
        dp[0] = 0

        # 更新前 dp[column] 来自上方，dp[column - 1] 来自左侧。
        for row in grid:
            for column, value in enumerate(row):
                if column == 0:
                    dp[column] += value
                else:
                    dp[column] = min(
                        dp[column],
                        dp[column - 1],
                    ) + value

        return int(dp[-1])
```

### 一维数组中的两个方向

更新 `dp[column]` 前，它表示上一行同列的最小路径和，也就是“上方”。

更新后的 `dp[column - 1]` 已经属于当前行，也就是“左方”。从两者取最小再加当前格值，等价于二维转移。

首列只能从上方到达，需要单独累加；把其他未到达位置初始化为无穷大，可以统一首行逻辑。

## 正确性说明

任意到达当前格的合法路径，最后一步必然来自上方或左方。根据归纳假设，一维数组在更新前后分别保存这两个方向的最优路径和，取较小者加当前格值即为当前位置最优值。按从上到下、从左到右的拓扑顺序处理后，右下角状态就是全局最小路径和。

## 复杂度对比

- 二维基础版：时间 `O(mn)`，空间 `O(mn)`；
- 一维优化版：时间 `O(mn)`，空间 `O(n)`，其中 `n` 为列数。

## 边界用例

| 输入 | 预期 | 检查点 |
|---|---:|---|
| `[[5]]` | `5` | 单格 |
| `[[1,2,3]]` | `6` | 单行 |
| `[[1],[2],[3]]` | `6` | 单列 |
| 示例矩阵 | `7` | 上、左选择 |
| 含多个 `0` | 正确最小值 | 非负权重 |

## 90 秒面试表达

“先定义二维状态为从左上角到当前格的最小路径和。首行只能来自左侧，首列只能来自上方；其余格取上方、左方最小值再加当前值。二维版本时间和空间都是 `O(mn)`。确认当前行只依赖上一行后，再压成一维：更新前的 `dp[col]` 是上方，更新后的 `dp[col-1]` 是左方，空间降到 `O(n)`。”

## 常见追问

- 若允许负权值但移动方向仍无环，动态规划依然成立。
- 若允许四方向移动，状态图可能有环，应使用最短路径算法。
- 要返回具体路径，可以保存前驱方向或使用完整二维 DP 回溯。
