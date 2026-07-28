# 221 · 最大正方形

<ProblemMeta
  :tags="['字节面试题', '动态规划', '矩阵']"
  difficulty="medium"
  :appearances="14"
  pass-rate="52%"
  source-url="https://leetcode.cn/problems/maximal-square/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(mn)" space="O(n)" />

## 题目

给定由字符 `"0"` 和 `"1"` 组成的 `m × n` 矩阵，找出只包含 `"1"` 的最大正方形，返回它的面积。

### 示例

```text
输入：
[
  ["1", "0", "1", "0", "0"],
  ["1", "0", "1", "1", "1"],
  ["1", "1", "1", "1", "1"],
  ["1", "0", "0", "1", "0"]
]
输出：4
```

## 状态与转移

定义：

```text
dp[row][column] =
以当前位置为右下角的全 1 正方形最大边长
```

当前位置是 `"1"` 时，要扩成更大的正方形，左边、上边和左上角三个方向都必须支持：

```text
dp[row][column] =
min(左, 上, 左上) + 1
```

当前位置是 `"0"` 时状态为零。

## Python 实现

```python
class Solution:
    def maximalSquare(self, matrix: list[list[str]]) -> int:
        if not matrix or not matrix[0]:
            return 0

        columns = len(matrix[0])
        dp = [0] * (columns + 1)
        maximum_side = 0

        for row in matrix:
            # dp[column] 是上方，dp[column - 1] 是左侧，top_left 是左上角。
            top_left = 0

            for column in range(1, columns + 1):
                top = dp[column]

                if row[column - 1] == "1":
                    dp[column] = min(
                        dp[column],
                        dp[column - 1],
                        top_left,
                    ) + 1
                    maximum_side = max(maximum_side, dp[column])
                else:
                    dp[column] = 0

                top_left = top

        return maximum_side * maximum_side
```

## 一维压缩时三个值分别是谁

- 更新前的 `dp[column]`：上一行同列，也就是上方；
- 更新后的 `dp[column - 1]`：当前行前一列，也就是左方；
- `top_left`：更新前保存的上一行前一列。

额外多开一列零值哨兵，可以统一处理矩阵第一列，无需边界分支。

## 正确性说明

若当前位置为零，不可能作为全 1 正方形右下角。若为一，边长超过 1 的正方形必须同时由左、上、左上三个较小正方形支撑，其最大可扩展边长由三者最小值限制；加上当前行列后边长增加一。转移准确计算每个右下角的最大边长，比较所有状态后平方即为最大面积。

## 复杂度

- 时间复杂度：`O(mn)`，每个格子处理一次。
- 空间复杂度：`O(n)`，`n` 为列数。

## 边界用例

| 场景 | 预期 | 检查点 |
|---|---:|---|
| 单个 `"0"` | `0` | 没有正方形 |
| 单个 `"1"` | `1` | 最小正方形 |
| 全为 `"1"` 的 `2 × 3` | `4` | 边长受短边限制 |
| 只有对角线为 `"1"` | `1` | 不能拼成大正方形 |

## 90 秒面试表达

“定义状态为以当前格为右下角的最大全 1 正方形边长。当前格是 1 时，边长由左、上、左上三个状态的最小值加一决定；是 0 时状态归零。遍历中记录最大边长，最后返回平方。我用一维数组压缩行状态，并额外保存更新前的左上值。时间 `O(mn)`、空间 `O(n)`。”

## 常见追问

- 返回正方形坐标时，在更新最大边长时保存右下角位置。
- 最大矩形需要使用柱状图与单调栈，状态模型不同。
- 若列数大于行数，可以转置思路，把空间压缩到较短维度。
