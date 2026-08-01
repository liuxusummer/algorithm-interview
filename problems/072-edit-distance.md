# 072 · 编辑距离

<ProblemMeta
  :tags="['Hot100', '大厂面试', '二维 DP', '华为面试题']"
  difficulty="medium"
  :appearances="64"
  pass-rate="42%"
  source-url="https://leetcode.cn/problems/edit-distance/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(mn)" space="O(mn) → O(min(m, n))" />

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

## 动画拆解

下面把两个字符串的所有前缀组合放进同一张表。每一步会同时标出插入、删除、替换所对应的三个来源状态。

<DpTableDemo variant="edit-distance" />

## 二维 DP 实现（基础版）

```python
class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        len1 = len(word1)
        len2 = len(word2)

        # dp[i][j]：word1 前 i 个字符变成 word2 前 j 个字符的最少操作数。
        dp = [[0] * (len2 + 1) for _ in range(len1 + 1)]

        # word1 的前 i 个字符变成空串，只能连续删除 i 次。
        for i in range(len1 + 1):
            dp[i][0] = i

        # 空串变成 word2 的前 j 个字符，只能连续插入 j 次。
        for j in range(len2 + 1):
            dp[0][j] = j

        for i in range(1, len1 + 1):
            for j in range(1, len2 + 1):
                if word1[i - 1] == word2[j - 1]:
                    # 末尾字符相同，不需要增加编辑操作。
                    dp[i][j] = dp[i - 1][j - 1]
                else:
                    dp[i][j] = 1 + min(
                        dp[i - 1][j],      # 删除 word1[i - 1]
                        dp[i][j - 1],      # 在 word1 末尾插入 word2[j - 1]
                        dp[i - 1][j - 1],  # 把 word1[i - 1] 替换成 word2[j - 1]
                    )

        return dp[len1][len2]
```

## 初始化代表什么

- `dp[0][j] = j`：空字符串变成长度为 `j` 的前缀，需要插入 `j` 次；
- `dp[i][0] = i`：长度为 `i` 的前缀变成空字符串，需要删除 `i` 次。

这两组状态构成二维表的第零行和第零列，也是后续所有状态的递推起点。

## 三个转移来源如何理解

| 来源 | 对应操作 | 操作之后的问题 |
|---|---|---|
| `dp[i - 1][j]` | 删除 `word1[i - 1]` | 前 `i - 1` 个字符继续匹配前 `j` 个字符 |
| `dp[i][j - 1]` | 插入 `word2[j - 1]` | 前 `i` 个字符已经匹配到 `word2` 的前 `j - 1` 个字符 |
| `dp[i - 1][j - 1]` | 替换末尾字符 | 两边各去掉最后一个字符 |

因此，当两个末尾字符不同时，三个来源取最小值后再加一次当前操作。

## 正确性说明

若末尾字符相同，任何最优转换都可以保留它们，问题退化为两个更短前缀。若不同，最优方案最后一步必然是删除、插入或替换之一；移除这一步后分别对应三个已计算的子问题。算法取三者最小并加一，覆盖所有可能且选择最优。由基础空串状态递推到完整字符串，结果正确。

## 空间优化：压缩成一行

如果只需要最少编辑次数，不需要恢复具体操作路径，当前行只依赖：

- 上方 `dp[i - 1][j]`；
- 左方 `dp[i][j - 1]`；
- 左上 `dp[i - 1][j - 1]`。

使用一维数组时，更新前的 `dp[j]` 是上方，更新后的 `dp[j - 1]` 是左方；左上旧值会在覆盖前保存到 `top_left`。让较短字符串作为列，可以把空间降到 `O(min(m, n))`。

```python
class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        # 让 word2 更短，作为一维数组的列方向。
        if len(word1) < len(word2):
            word1, word2 = word2, word1

        dp = list(range(len(word2) + 1))

        for i, char1 in enumerate(word1, start=1):
            # 覆盖 dp[0] 前，它表示上一行左上角 dp[i - 1][0]。
            top_left = dp[0]
            dp[0] = i

            for j, char2 in enumerate(word2, start=1):
                top = dp[j]

                if char1 == char2:
                    dp[j] = top_left
                else:
                    dp[j] = 1 + min(
                        top,        # 上方：删除
                        dp[j - 1], # 左方：插入
                        top_left,   # 左上：替换
                    )

                # 当前上方旧值会成为下一列的左上旧值。
                top_left = top

        return dp[-1]
```

这里必须显式保存 `top_left`。如果直接覆盖 `dp[j]` 而不保存旧的左上状态，字符相同与替换操作都会读取错误的当前行数据。

## 复杂度对比

- 二维基础版：时间 `O(mn)`，空间 `O(mn)`，并支持回溯编辑路径；
- 一维优化版：时间 `O(mn)`，空间 `O(min(m, n))`，但不能直接恢复完整操作序列。

## 边界用例

| 输入 | 预期 | 检查点 |
|---|---:|---|
| `"horse"`, `"ros"` | `3` | 三种操作组合 |
| `""`, `"abc"` | `3` | 全部插入 |
| `"abc"`, `""` | `3` | 全部删除 |
| `"abc"`, `"abc"` | `0` | 完全相同 |
| `"a"`, `"b"` | `1` | 单次替换 |

## 90 秒面试表达

“先定义二维 `dp[i][j]` 为两个前缀之间的最少编辑次数。第零列表示连续删除，第零行表示连续插入；末尾相同就继承左上，不同则从删除、插入、替换三个来源取最小再加一。二维版本时间、空间都是 `O(mn)`。只求距离时，可用一维数组保存上一行：更新前是上方，更新后左侧是当前行，并用变量保存被覆盖的左上角，空间降到 `O(min(m,n))`。”

## 常见追问

- 不同操作代价不同时，把三个转移分别加对应权重。
- 要恢复具体编辑步骤，需要保留完整二维表并从右下角回溯。
- 如果只需要最小距离而不恢复路径，可以按上面的方式压成一行；两行滚动也是更容易书写的中间方案。
- 只判断距离是否不超过 `k` 时，可以只计算主对角线附近的带状区域。
