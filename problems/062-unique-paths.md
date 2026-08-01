# 062 · 不同路径

<ProblemMeta
  :tags="['Hot100', '华为面试题', '动态规划', '网格 DP', '组合数学']"
  difficulty="medium"
  :appearances="4"
  pass-rate="67%"
  source-url="https://leetcode.cn/problems/unique-paths/"
  source-label="力扣原题"
/>

<ComplexityBadge time="DP O(mn)，组合数学 O(min(m, n))" space="DP O(n)，组合数学 O(1)" />

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

## 解法三：组合数学

从左上角走到右下角，无论怎样选择顺序，总共都必须走：

- `m - 1` 次向下；
- `n - 1` 次向右。

因此问题等价于：在 `m + n - 2` 步中，选择其中 `m - 1` 步向下（或选择 `n - 1` 步向右）：

```text
C(m + n - 2, m - 1)
```

不直接计算阶乘，而是逐项构造组合数。令 `k = min(m - 1, n - 1)`，利用：

```text
C(total, i) = C(total, i - 1) × (total - i + 1) / i
```

每一步都是一个完整组合数，能够整除，不会产生精度误差。

### Python 实现

```python
class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        total_steps = m + n - 2
        choose_steps = min(m - 1, n - 1)
        paths = 1

        # 逐项计算 C(total_steps, choose_steps)，避免构造 DP 表。
        for step in range(1, choose_steps + 1):
            paths = (
                paths
                * (total_steps - step + 1)
                // step
            )

        return paths
```

### 为什么这是完整计数

每条路径都能唯一表示成一个长度为 `m + n - 2` 的动作序列，其中恰好有 `m - 1` 个位置填“向下”。反过来，任意这样的选位方案都会产生一条合法路径，所以路径与组合选择一一对应。

### 复杂度

- 时间复杂度：`O(min(m, n))`，只计算较小的选择数。
- 空间复杂度：`O(1)`，只维护当前组合数。

组合数学是本题无障碍、无权值时更优的写法；如果加入障碍物或格子代价，路径不再只由动作数量决定，应回到动态规划。

## 边界用例

| `m` | `n` | 输出 | 检查点 |
|---:|---:|---:|---|
| `1` | `1` | `1` | 起点就是终点 |
| `1` | `5` | `1` | 只能一直向右 |
| `2` | `2` | `2` | 右下、下右两条路径 |

## 90 秒面试表达

“基础解定义二维 `dp[row][column]`，由上方加左方得到，再按依赖关系压成一维。进一步观察，每条路径固定包含 `m-1` 次向下和 `n-1` 次向右，因此答案就是组合数 `C(m+n-2, m-1)`。逐项乘除即可在 `O(min(m,n))` 时间、`O(1)` 空间内精确计算；如果题目加入障碍物，再改回 DP。”

## 常见追问

- 组合数学只适用于每一步规则完全相同、没有障碍和权值的网格；
- 若想进一步减少空间，应令 `n` 为较短的维度；
- 动态规划更容易扩展到有障碍物或带权网格。
