# 072 · 编辑距离

<ProblemMeta
  :tags="['Hot100', '大厂面试', '二维 DP', '华为面试题']"
  difficulty="medium"
  :appearances="64"
  pass-rate="42%"
  source-url="https://leetcode.cn/problems/edit-distance/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(mn)" space="O(min(m, n))" />

## 题目

给定两个单词 `word1` 和 `word2`，可以对 `word1` 执行插入、删除或替换一个字符。返回把 `word1` 转换成 `word2` 所需的最少操作数。

### 示例

```text
输入：word1 = "horse", word2 = "ros"
输出：3
解释：horse → rorse → rose → ros
```

## 状态与三种操作

定义：

```text
dp[i][j] =
word1 前 i 个字符转换成 word2 前 j 个字符的最少操作数
```

当最后两个字符相同时，不需要新操作：

```text
dp[i][j] = dp[i - 1][j - 1]
```

不同时，考虑最后一步：

- 删除 `word1` 的最后字符：`dp[i - 1][j] + 1`；
- 插入 `word2` 的最后字符：`dp[i][j - 1] + 1`；
- 替换最后字符：`dp[i - 1][j - 1] + 1`。

## Python 实现

```python
class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        if len(word1) < len(word2):
            word1, word2 = word2, word1

        # previous 表示上一行状态；current 逐格构造当前行。
        previous = list(range(len(word2) + 1))

        for row, char1 in enumerate(word1, start=1):
            current = [row] + [0] * len(word2)

            for column, char2 in enumerate(word2, start=1):
                if char1 == char2:
                    current[column] = previous[column - 1]
                else:
                    # 三个来源依次对应删除、插入和替换。
                    current[column] = 1 + min(
                        previous[column],
                        current[column - 1],
                        previous[column - 1],
                    )

            previous = current

        return previous[-1]
```

## 初始化代表什么

- `dp[0][j] = j`：空字符串变成长度为 `j` 的前缀，需要插入 `j` 次；
- `dp[i][0] = i`：长度为 `i` 的前缀变成空字符串，需要删除 `i` 次。

实现中 `previous = range(...)` 初始化第零行，`current[0] = row` 初始化每一行的第零列。

## 为什么可以交换两个单词

编辑距离具有对称性：把 `word1` 变成 `word2` 的最少插入、删除、替换次数，与反向转换相同，插入和删除互为逆操作。

让较短字符串作为列，可以把滚动数组空间降到 `O(min(m, n))`。

## 正确性说明

若末尾字符相同，任何最优转换都可以保留它们，问题退化为两个更短前缀。若不同，最优方案最后一步必然是删除、插入或替换之一；移除这一步后分别对应三个已计算的子问题。算法取三者最小并加一，覆盖所有可能且选择最优。由基础空串状态递推到完整字符串，结果正确。

## 复杂度

- 时间复杂度：`O(mn)`。
- 空间复杂度：`O(min(m, n))`。

## 边界用例

| 输入 | 预期 | 检查点 |
|---|---:|---|
| `"horse"`, `"ros"` | `3` | 三种操作组合 |
| `""`, `"abc"` | `3` | 全部插入 |
| `"abc"`, `""` | `3` | 全部删除 |
| `"abc"`, `"abc"` | `0` | 完全相同 |
| `"a"`, `"b"` | `1` | 单次替换 |

## 90 秒面试表达

“定义 `dp[i][j]` 为两个前缀之间的最小编辑次数。末尾字符相同就继承左上状态；不同则分别考虑删除、插入、替换，对应上、左、左上三个状态取最小再加一。空前缀与长度 `j` 前缀的距离是 `j`。我用两行滚动，并让较短字符串作为列，时间 `O(mn)`、空间 `O(min(m,n))`。”

## 常见追问

- 不同操作代价不同时，把三个转移分别加对应权重。
- 要恢复具体编辑步骤，需要保留完整二维表并从右下角回溯。
- 只判断距离是否不超过 `k` 时，可以只计算主对角线附近的带状区域。
