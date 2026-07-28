# 300 · 最长递增子序列

<ProblemMeta
  :tags="['Hot100', '大厂面试', '二分优化']"
  difficulty="easy"
  :appearances="99"
  pass-rate="59%"
  source-url="https://leetcode.cn/problems/longest-increasing-subsequence/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n log n)" space="O(n)" />

## 题目

给定整数数组 `nums`，返回最长严格递增子序列的长度。

子序列可以删除任意元素，但不能改变剩余元素的相对顺序。本页难度按提供的面试题截图记录。

### 示例

```text
输入：nums = [10, 9, 2, 5, 3, 7, 101, 18]
输出：4
解释：例如 [2, 3, 7, 101]
```

## 基础动态规划

可以定义 `dp[i]` 为以 `nums[i]` 结尾的最长递增子序列长度，再枚举此前所有更小元素：

```text
dp[i] = max(dp[j] + 1)，其中 j < i 且 nums[j] < nums[i]
```

时间复杂度为 `O(n²)`。进一步观察：相同长度的递增子序列，结尾越小，越容易接上后续元素。

## `tails` 的含义

`tails[length - 1]` 表示：

```text
长度为 length 的递增子序列，能够取得的最小结尾值
```

对每个新值，在 `tails` 中找到第一个大于等于它的位置：

- 找不到：它可以接在最长序列后，长度加一；
- 找到：用更小或相等的结尾替换该位置，为后续保留更优可能。

## Python 实现

```python
from bisect import bisect_left


class Solution:
    def lengthOfLIS(self, nums: list[int]) -> int:
        tails: list[int] = []

        # tails[length - 1] 保存该长度递增子序列的最小尾值。
        for value in nums:
            position = bisect_left(tails, value)

            if position == len(tails):
                tails.append(value)
            else:
                tails[position] = value

        return len(tails)
```

## 为什么用 `bisect_left`

题目要求严格递增。遇到与某个结尾相同的值时，它不能让长度增加，应替换第一个大于等于它的位置。

如果题目要求非递减子序列，则应查找第一个严格大于当前值的位置，也就是使用 `bisect_right`。

## `tails` 不一定是真实答案

替换操作可能把来自不同子序列的结尾放在同一数组中，因此 `tails` 不保证本身就是原数组的一个子序列。

但 `tails` 的长度始终等于当前前缀能构成的最长递增子序列长度，这正是本题所需。

## 正确性说明

`tails` 始终严格递增，并保存每个可达长度的最小结尾。新值若大于全部结尾，可扩展最长序列；否则替换第一个不小于它的结尾，不改变已存在长度，只让该长度的结尾更小，不会损害后续扩展能力。归纳处理全部元素后，`tails` 覆盖且仅覆盖所有可达长度，因此其长度就是 LIS 长度。

## 复杂度

- 时间复杂度：`O(n log n)`，每个元素进行一次二分查找。
- 空间复杂度：`O(n)`。

## 边界用例

| 输入 | 预期 | 检查点 |
|---|---:|---|
| `[10,9,2,5,3,7,101,18]` | `4` | 基础路径 |
| `[0,1,0,3,2,3]` | `4` | 多次替换 |
| `[7,7,7,7]` | `1` | 严格递增 |
| `[1,2,3,4]` | `4` | 持续扩展 |
| `[4,3,2,1]` | `1` | 持续替换 |

## 90 秒面试表达

“基础 DP 枚举前驱是 `O(n²)`。优化时维护 `tails[i]`：长度为 `i+1` 的递增子序列能达到的最小结尾。每个数用二分找到第一个大于等于它的位置并替换；如果比所有结尾都大，就追加并让最长长度加一。更小的结尾不会损害已有长度，只会让后续更容易扩展。总时间 `O(n log n)`、空间 `O(n)`。”

## 常见追问

- 要还原具体序列，需要额外记录每个元素的前驱和对应长度位置。
- 非递减子序列改用 `bisect_right`。
- 若数据在线到达，这个结构也能持续维护当前 LIS 长度。
