# 005 · 最长回文子串

<ProblemMeta
  :tags="['Hot100', '大厂面试', '区间 DP']"
  difficulty="medium"
  :appearances="72"
  pass-rate="52%"
  source-url="https://leetcode.cn/problems/longest-palindromic-substring/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n²)" space="O(n²)" />

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
palindrome[left][right] =
s[left:right + 1] 是否为回文串
```

区间成为回文需要：

1. 两端字符相同；
2. 中间区间也是回文。

长度不超过 3 时，只要两端相同，中间为空或只有一个字符，可以直接成立：

```text
s[left] == s[right]
and (
    right - left < 3
    or palindrome[left + 1][right - 1]
)
```

## Python 实现

```python
class Solution:
    def longestPalindrome(self, s: str) -> str:
        length = len(s)
        palindrome = [
            [False] * length
            for _ in range(length)
        ]
        best_start = 0
        best_length = 1

        # 按右端点递增填表，访问内部区间时其状态已经计算完成。
        for right in range(length):
            for left in range(right + 1):
                if (
                    s[left] == s[right]
                    and (
                        right - left < 3
                        or palindrome[left + 1][right - 1]
                    )
                ):
                    palindrome[left][right] = True
                    current_length = right - left + 1

                    if current_length > best_length:
                        best_start = left
                        best_length = current_length

        return s[best_start:best_start + best_length]
```

## 遍历顺序为什么是右端点递增

状态 `[left][right]` 依赖 `[left + 1][right - 1]`，后者的右端点更小。

让 `right` 从小到大扫描，可以保证计算较大区间时，内部区间已经得到结果。只要依赖顺序满足，按区间长度递增遍历也可以。

## 正确性说明

长度为 1 的区间天然是回文。对于更长区间，算法严格按照回文定义检查两端字符和内部区间；内部状态因遍历顺序已正确计算。因此每个 `palindrome[left][right]` 当且仅当对应子串为回文。算法比较所有为真的区间长度，所以记录的子串是全局最长回文子串。

## 复杂度

- 时间复杂度：`O(n²)`，枚举全部左右端点。
- 空间复杂度：`O(n²)`，保存区间状态。

## 边界用例

| 输入 | 可能输出 | 检查点 |
|---|---|---|
| `"a"` | `"a"` | 单字符 |
| `"ac"` | `"a"` 或 `"c"` | 无长度 2 回文 |
| `"cbbd"` | `"bb"` | 偶数长度 |
| `"babad"` | `"bab"` 或 `"aba"` | 奇数长度 |
| `"aaaa"` | `"aaaa"` | 重复字符 |

## 90 秒面试表达

“定义二维状态表示闭区间是否为回文。一个区间是回文，当且仅当两端字符相等，并且区间长度小于等于 3，或者内部区间也是回文。状态依赖更小的右端点，所以我让右端点递增，枚举左端点并更新最长区间。时间和空间都是 `O(n²)`。”

## 常见追问

- 中心扩展同样是 `O(n²)` 时间，但只需 `O(1)` 额外空间。
- Manacher 算法可以做到 `O(n)` 时间，但实现和讲解成本更高。
- 只求回文子串数量时，发现每个回文状态后累加即可。
