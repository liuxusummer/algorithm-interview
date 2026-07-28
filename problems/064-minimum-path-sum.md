# 064 · 最小路径和

<ProblemMeta
  :tags="['Hot100', '大厂面试', '网格 DP']"
  difficulty="medium"
  :appearances="13"
  pass-rate="55%"
  source-url="https://leetcode.cn/problems/minimum-path-sum/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(mn)" space="O(n)" />

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

每一行只依赖上一行和本行左侧，可以压缩成一维数组。

## Python 实现

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

## 一维数组中的两个方向

更新 `dp[column]` 前，它表示上一行同列的最小路径和，也就是“上方”。

更新后的 `dp[column - 1]` 已经属于当前行，也就是“左方”。从两者取最小再加当前格值，等价于二维转移。

首列只能从上方到达，需要单独累加；把其他未到达位置初始化为无穷大，可以统一首行逻辑。

## 正确性说明

任意到达当前格的合法路径，最后一步必然来自上方或左方。根据归纳假设，一维数组在更新前后分别保存这两个方向的最优路径和，取较小者加当前格值即为当前位置最优值。按从上到下、从左到右的拓扑顺序处理后，右下角状态就是全局最小路径和。

## 复杂度

- 时间复杂度：`O(mn)`，每个格子处理一次。
- 空间复杂度：`O(n)`，`n` 为列数。

## 边界用例

| 输入 | 预期 | 检查点 |
|---|---:|---|
| `[[5]]` | `5` | 单格 |
| `[[1,2,3]]` | `6` | 单行 |
| `[[1],[2],[3]]` | `6` | 单列 |
| 示例矩阵 | `7` | 上、左选择 |
| 含多个 `0` | 正确最小值 | 非负权重 |

## 90 秒面试表达

“定义状态为从左上角到当前格的最小路径和。因为只能向右或向下，当前格只可能从上方或左方进入，所以取两者最小值加当前格。按行扫描时，更新前的一维 `dp[col]` 是上方，更新后的 `dp[col-1]` 是左方，因此可把二维空间压成一行。时间 `O(mn)`、空间 `O(n)`。”

## 常见追问

- 若允许负权值但移动方向仍无环，动态规划依然成立。
- 若允许四方向移动，状态图可能有环，应使用最短路径算法。
- 要返回具体路径，可以保存前驱方向或使用完整二维 DP 回溯。
