# 005 · 最长回文子串

<ProblemMeta
  :tags="['Hot100', '大厂面试', '区间 DP', '华为面试题']"
  difficulty="medium"
  :appearances="78"
  pass-rate="52%"
  source-url="https://leetcode.cn/problems/longest-palindromic-substring/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n²)" space="O(n²) → O(n)" />

## 题目

给定字符串 `s`，返回其中最长的回文子串。

子串必须连续；回文表示从左向右和从右向左读取完全相同。

### 示例

```text
输入：s = "babad"
输出："bab"
说明："aba" 也是正确答案

输入：s = "cbbd"
输出："bb"
```

## 状态与转移

定义：

```text
dp[i][j] = s[i:j + 1] 是否为回文串
```

区间成为回文需要：

1. 两端字符相同；
2. 中间区间也是回文。

长度为 1 的子串天然是回文，因此先初始化：

```text
dp[i][i] = True
```

长度为 2 时没有更小的内部区间，只需要判断两个字符是否相同。长度大于 2 时：

```text
dp[i][j] = s[i] == s[j] and dp[i + 1][j - 1]
```

## 动画拆解

下面按子串长度逐层填充二维状态表。当前格、内部依赖区间和已经确认的回文会分别高亮，便于理解为什么不能随意改变遍历顺序。

<DpTableDemo variant="longest-palindrome" />

## 二维 DP 实现（基础版）

```python
class Solution:
    def longestPalindrome(self, s: str) -> str:
        n = len(s)

        # 题目保证 s 非空，因此至少存在一个长度为 1 的回文串。
        ans = s[0]

        # dp[i][j] 表示闭区间 s[i:j + 1] 是否为回文串。
        dp = [[False] * n for _ in range(n)]

        # 单个字符正着读和反着读相同，一定是回文串。
        for i in range(n):
            dp[i][i] = True

        # 按子串长度从小到大填表，保证内部区间已经计算完成。
        for l in range(2, n + 1):
            # 长度固定为 l 时，合法起点范围是 [0, n - l]。
            for i in range(n - l + 1):
                # 闭区间长度为 l，所以右端点是 i + l - 1。
                j = i + l - 1

                if s[i] == s[j]:
                    if l == 2:
                        # 两个字符相同即可构成长度为 2 的回文串。
                        dp[i][j] = True
                    else:
                        # 两端相同后，结果取决于内部区间是否回文。
                        dp[i][j] = dp[i + 1][j - 1]

                    # 只在当前区间确实回文且更长时更新答案。
                    if l > len(ans) and dp[i][j]:
                        ans = s[i:j + 1]

        return ans
```

## 为什么要按子串长度递增

状态 `dp[i][j]` 依赖内部状态 `dp[i + 1][j - 1]`，内部子串的长度比当前子串少 2。

因此必须先计算短区间，再计算长区间。让 `l` 从 2 递增到 `n`，计算当前状态时，它依赖的内部状态一定已经得到结果。

如果随意按起点或终点遍历，可能在内部状态尚未计算时读取默认值 `False`，从而漏掉回文串。

## 正确性说明

长度为 1 的区间被正确初始化为回文。长度为 2 时，算法直接比较两端字符；对于更长区间，算法检查两端字符是否相同，并读取已经正确计算的内部区间。按照区间长度归纳，每个 `dp[i][j]` 当且仅当对应子串是回文。算法枚举了所有区间，并在发现更长回文时更新 `ans`，所以最终返回全局最长回文子串。

## 复杂度

- 时间复杂度：`O(n²)`，枚举全部左右端点。
- 空间复杂度：`O(n²)`，保存区间状态。

## 第二步：再把二维 DP 压缩成一维

面试和学习时应先写上面的二维版本。`dp[i][j]` 的区间含义、初始化和依赖方向都能直接从表格中看到，最容易证明正确，也最不容易写错遍历顺序。

理解二维转移后，再观察它的依赖：

```text
dp[i][j] 只依赖上一层起点的 dp[i + 1][j - 1]
```

可以用一维数组 `dp[j]` 保存状态。开始计算起点 `i` 这一行之前，`dp[j]` 表示二维表中的 `dp[i + 1][j]`；更新后，它表示 `dp[i][j]`。

关键是右端点 `j` 必须**从右向左**更新。计算当前 `dp[j]` 时，需要读取尚未被本轮覆盖的 `dp[j - 1]`，它对应二维表里的 `dp[i + 1][j - 1]`。如果从左向右更新，读到的会是当前行 `dp[i][j - 1]`，状态含义就错了。

```python
class Solution:
    def longestPalindrome(self, s: str) -> str:
        if not s:
            return ""

        n = len(s)
        dp = [False] * n
        best_start = 0
        best_length = 1

        # 起点从右向左，保证一维数组保存的是二维表的下一行。
        for i in range(n - 1, -1, -1):
            dp[i] = True

            # 右端点必须倒序，避免覆盖仍要使用的 dp[i + 1][j - 1]。
            for j in range(n - 1, i, -1):
                dp[j] = (
                    s[i] == s[j]
                    and (j - i == 1 or dp[j - 1])
                )

                current_length = j - i + 1
                if dp[j] and current_length > best_length:
                    best_start = i
                    best_length = current_length

        return s[best_start:best_start + best_length]
```

压缩后时间复杂度仍为 `O(n²)`，额外空间从 `O(n²)` 降为 `O(n)`。代价是状态含义与新旧值更难观察，所以它应当作为二维版本之后的优化，而不是第一次讲解时的起点。

## 边界用例

| 输入 | 可能输出 | 检查点 |
|---|---|---|
| `"a"` | `"a"` | 单字符 |
| `"ac"` | `"a"` 或 `"c"` | 无长度 2 回文 |
| `"cbbd"` | `"bb"` | 偶数长度 |
| `"babad"` | `"bab"` 或 `"aba"` | 奇数长度 |
| `"aaaa"` | `"aaaa"` | 重复字符 |

## 90 秒面试表达

“定义 `dp[i][j]` 表示闭区间 `s[i:j+1]` 是否为回文。单字符状态初始化为真；长度为 2 时只需比较两个字符；更长区间要求两端相同且内部区间也是回文。因为状态依赖长度少 2 的内部区间，所以按子串长度从小到大填表。发现更长回文时更新答案。总共枚举 `O(n²)` 个区间，时间和空间都是 `O(n²)`。”

## 常见追问

- 二维 DP 可以在理解状态依赖后压缩到 `O(n)` 空间，但必须让右端点倒序更新。
- 中心扩展同样是 `O(n²)` 时间，但只需 `O(1)` 额外空间。
- Manacher 算法可以做到 `O(n)` 时间，但实现和讲解成本更高。
- 只求回文子串数量时，发现每个回文状态后累加即可。
