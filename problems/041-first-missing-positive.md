# 041 · 缺失的第一个正数

<ProblemMeta
  :tags="['Hot100', '大厂面试', '数组', '原地哈希']"
  difficulty="hard"
  :appearances="114"
  pass-rate="43%"
  source-url="https://leetcode.cn/problems/first-missing-positive/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(1)" />

## 题目与关键范围

在未排序数组中找到没有出现的最小正整数，要求 `O(n)` 时间、`O(1)` 额外空间。

长度为 `n` 的数组最多完整包含 `1..n`，因此答案一定落在 `1..n+1`。可以把数组本身当哈希表：数字 `x` 应放在下标 `x - 1`。

### 示例

```text
输入：nums = [3, 4, -1, 1]
输出：2
解释：1 已经出现，但 2 没有出现，因此最小缺失正整数是 2。
```

## Python 实现

```python
from typing import List


class Solution:
    def firstMissingPositive(self, nums: List[int]) -> int:
        n = len(nums)

        for index in range(n):
            # 用 while 连续安置被交换过来的新数字。
            while 1 <= nums[index] <= n:
                target = nums[index] - 1
                if nums[target] == nums[index]:
                    # 相同数字已经在正确位置，避免重复值导致死循环。
                    break
                nums[index], nums[target] = nums[target], nums[index]

        for index, value in enumerate(nums):
            if value != index + 1:
                return index + 1

        return n + 1
```

## 为什么总时间仍是 O(n)

虽然出现嵌套 `while`，但每次有效交换至少把一个 `1..n` 内的数字放到最终位置。这样的成功安置最多发生 `n` 次，因此总交换次数是线性的。

## 正确性说明

整理完成后，凡是出现在数组中的 `x ∈ [1,n]` 都会位于 `nums[x-1]`；重复值不影响这个事实。第一次发现 `nums[i] != i+1`，说明更小正数都存在而 `i+1` 不存在，所以它就是答案。若全部匹配，则 `1..n` 都存在，答案为 `n+1`。

## 边界用例

| 输入 | 输出 | 检查点 |
|---|---:|---|
| `[1,2,0]` | `3` | 忽略 0 |
| `[3,4,-1,1]` | `2` | 负数与交换链 |
| `[1,1]` | `2` | 重复值防死循环 |

## 面试表达

“答案只可能在 `1..n+1`，所以我把值 `x` 映射到下标 `x-1`，通过原地交换把有效数字归位。随后第一个值与下标不匹配的位置就是缺失正数。每次交换都会固定至少一个数字，总时间 `O(n)`，额外空间 `O(1)`。”
