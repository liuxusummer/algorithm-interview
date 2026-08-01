# 062 · 不同路径

<ProblemMeta
  :tags="['Hot100', '华为面试题', '动态规划', '网格 DP']"
  difficulty="medium"
  :appearances="4"
  pass-rate="67%"
  source-url="https://leetcode.cn/problems/unique-paths/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(mn)" space="O(mn) → O(n)" />

## 题目

机器人位于 `m × n` 网格左上角，每次只能向右或向下移动一步，求到达右下角的不同路径数量。

### 示例

```text
输入：m = 3, n = 7
输出：28
```

### 约束观察

- 每条路径恰好包含 `m-1` 次向下和 `n-1` 次向右；
- 到达当前格子的最后一步只能来自上方或左方；
- 二维表能直接展示每个格子的两个来源；理解后再压缩空间。

## 二维状态与转移

定义 `dp[row][column]` 为到达该格子的路径数。

第一行只能一直向右，第一列只能一直向下，因此全部初始化为 `1`。其余位置的最后一步只能来自上方或左方：

```text
dp[row][column] =
dp[row - 1][column] + dp[row][column - 1]
```

## 二维 DP 实现（基础版）

```python
class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        # 第一行和第一列都只有一种走法。
        dp = [[1] * n for _ in range(m)]

        for row in range(1, m):
            for column in range(1, n):
                dp[row][column] = (
                    dp[row - 1][column]
                    + dp[row][column - 1]
                )

        return dp[m - 1][n - 1]
```

二维表中，上方与左方状态都清晰可见，应先用这个版本理解初始化、转移与遍历顺序。

## 空间优化：压缩成一行

计算当前行时只会读取上一行同列和当前行左侧，因此可以让一维 `dp[column]` 复用这两类状态：

- 更新前的 `dp[column]` 表示上方；
- 更新后的 `dp[column - 1]` 表示左方。

```python
class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        dp = [1] * n

        for _ in range(1, m):
            for column in range(1, n):
                # 原值来自上方，左侧新值来自当前行
                dp[column] += dp[column - 1]

        return dp[-1]
```

## 正确性说明

第一行和第一列都只有一种走法。其余格子的最后一步必然来自上方或左方，两类路径互不重叠，因此状态转移为两者之和。逐行更新后，`dp[-1]` 即右下角路径数。

### `3 × 3` 的更新过程

```text
初始第一行：[1, 1, 1]
更新第二行：[1, 2, 3]
更新第三行：[1, 3, 6]
```

更新 `dp[column]` 时，旧值代表上方路径数，新得到的 `dp[column-1]` 代表左方路径数。

## 复杂度对比

- 二维基础版：时间 `O(mn)`，空间 `O(mn)`；
- 一维优化版：时间 `O(mn)`，空间 `O(n)`；若让较短维度作为列，可写成 `O(min(m, n))`。

## 边界用例

| `m` | `n` | 输出 | 检查点 |
|---:|---:|---:|---|
| `1` | `1` | `1` | 起点就是终点 |
| `1` | `5` | `1` | 只能一直向右 |
| `2` | `2` | `2` | 右下、下右两条路径 |

## 90 秒面试表达

“先定义二维 `dp[row][column]` 为到达当前格的路径数。第一行和第一列都是一，其余位置由上方加左方得到，时间和空间都是 `O(mn)`。确认当前行只依赖上一行同列和本行左侧后，再压成一维：更新前的 `dp[column]` 是上方，更新后的 `dp[column-1]` 是左方，空间降到 `O(n)`。”

## 常见追问

- 也可以使用组合数学计算 `C(m+n-2, m-1)`；
- 若想进一步减少空间，应令 `n` 为较短的维度；
- 动态规划更容易扩展到有障碍物或带权网格。
