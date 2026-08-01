# 1143 · 最长公共子序列

<ProblemMeta
  :tags="['Hot100', '大厂面试', '二维 DP', '华为面试题']"
  difficulty="medium"
  :appearances="39"
  pass-rate="63%"
  source-url="https://leetcode.cn/problems/longest-common-subsequence/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(mn)" space="O(mn) → O(min(m, n))" />

## 题目

给定两个字符串 `text1` 和 `text2`，返回它们最长公共子序列的长度。如果不存在公共子序列，返回 `0`。

子序列允许删除字符，但不能改变剩余字符的相对顺序，不要求连续。

### 示例

```text
输入：text1 = "abcde", text2 = "ace"
输出：3
解释：最长公共子序列是 "ace"

输入：text1 = "abc", text2 = "def"
输出：0
```

## 状态与转移

定义：

```text
dp[i][j] =
text1 前 i 个字符与 text2 前 j 个字符的
最长公共子序列长度
```

若最后字符相同，可以把它加入公共子序列：

```text
dp[i][j] = dp[i - 1][j - 1] + 1
```

若不同，至少要跳过其中一个最后字符：

```text
dp[i][j] = max(
    dp[i - 1][j],
    dp[i][j - 1],
)
```

## 动画拆解

下面逐格展示两个前缀之间的选择：字符相同时从左上延伸，字符不同时从上方和左方继承更优结果。

<DpTableDemo variant="longest-common-subsequence" />

## 二维 DP 实现（基础版）

```python
class Solution:
    def longestCommonSubsequence(
        self,
        text1: str,
        text2: str,
    ) -> int:
        len1 = len(text1)
        len2 = len(text2)
        dp = [[0] * (len2 + 1) for _ in range(len1 + 1)]

        for i in range(1, len1 + 1):
            for j in range(1, len2 + 1):
                if text1[i - 1] == text2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1] + 1
                else:
                    dp[i][j] = max(
                        dp[i - 1][j],
                        dp[i][j - 1],
                    )

        return dp[len1][len2]
```

完整二维表不仅容易理解从上、左、左上的转移，还能从右下角回溯出一条实际的最长公共子序列。

## 空间优化：滚动两行

如果只需要长度，当前行只依赖上一行和本行左侧，保留 `previous`、`current` 两行即可。让较短字符串作为列，可将空间降到 `O(min(m, n))`。

```python
class Solution:
    def longestCommonSubsequence(
        self,
        text1: str,
        text2: str,
    ) -> int:
        if len(text1) < len(text2):
            text1, text2 = text2, text1

        previous = [0] * (len(text2) + 1)

        # current[column] 对应两个当前前缀的最长公共子序列。
        for char1 in text1:
            current = [0] * (len(text2) + 1)

            for column, char2 in enumerate(text2, start=1):
                if char1 == char2:
                    current[column] = previous[column - 1] + 1
                else:
                    current[column] = max(
                        previous[column],
                        current[column - 1],
                    )

            previous = current

        return previous[-1]
```

## 为什么字符相同时直接取左上加一

两个末尾字符相同，总能把它们接到两个更短前缀的最长公共子序列后。

即使存在不使用这对字符的同长度最优解，左上加一也不会更差；标准 LCS 最优子结构保证该转移足以覆盖最优值。

### 为什么能压成两行

当前行只依赖：

- 上一行同列；
- 当前行左侧；
- 上一行左上。

保留 `previous` 和 `current` 两行即可。再让较短字符串作为列，把空间降到 `O(min(m, n))`。

## 正确性说明

若末尾字符相同，存在一个最优公共子序列包含这对字符，移除后对应两个更短前缀的最优解，因此长度为左上状态加一。若不同，任何公共子序列至少不使用其中一个末尾字符，分别落入上方或左方子问题，取较大者即可。由空前缀状态递推到完整字符串，右下角状态就是 LCS 长度。

## 复杂度对比

- 二维基础版：时间 `O(mn)`，空间 `O(mn)`，并支持回溯具体序列；
- 两行优化版：时间 `O(mn)`，空间 `O(min(m, n))`，只保留长度信息。

## 边界用例

| 输入 | 预期 | 检查点 |
|---|---:|---|
| `"abcde"`, `"ace"` | `3` | 跳过字符 |
| `"abc"`, `"abc"` | `3` | 完全相同 |
| `"abc"`, `"def"` | `0` | 无公共字符 |
| `"a"`, `"a"` | `1` | 单字符 |
| `"abcba"`, `"abcbcba"` | `5` | 多条候选路径 |

## 90 秒面试表达

“先定义二维状态为两个前缀的最长公共子序列长度。末尾相同就在左上答案加一；不同则至少跳过一个末尾字符，取上方和左方最大值。二维版本时间、空间都是 `O(mn)`，还能回溯具体序列。只求长度时，当前行只依赖上一行和本行左侧，所以再滚动成两行，并让短字符串作为列，空间降到 `O(min(m,n))`。”

## 常见追问

- 要还原具体公共子序列，需要保存完整表并从右下角回溯。
- 最长重复子数组要求连续，字符不同时状态要归零。
- 删除两个字符串的最少字符数可以由 `m + n - 2 × LCS` 得到。
