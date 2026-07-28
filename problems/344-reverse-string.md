# 344 · 反转字符串

<ProblemMeta
  :tags="['华为面试题', '双指针', '字符串']"
  difficulty="easy"
  :appearances="3"
  pass-rate="58%"
  source-url="https://leetcode.cn/problems/reverse-string/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(1)" />

## 题目

给定字符数组 `s`，要求原地反转，不能额外创建另一个同规模数组。

## 思路

左右指针分别从数组两端出发，交换对应字符，然后同时向中间移动。

## Python 实现

```python
from typing import List


class Solution:
    def reverseString(self, s: List[str]) -> None:
        left, right = 0, len(s) - 1

        while left < right:
            # 原地交换两端字符，不申请额外数组
            s[left], s[right] = s[right], s[left]
            left += 1
            right -= 1
```

## 正确性说明

每轮将当前左右位置放入它们反转后应在的位置。循环结束时，所有对称位置均已交换，中间字符（若有）无需处理，因此整个数组被正确反转。

## 复杂度

- 时间：`O(n)`
- 空间：`O(1)`

## 常见追问

Python 的 `s.reverse()` 也能原地完成，但面试中手写双指针更能说明空间复杂度和交换过程。
