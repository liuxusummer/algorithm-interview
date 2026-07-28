# 875 · 爱吃香蕉的珂珂

<ProblemMeta
  :tags="['华为面试题', '二分查找', '答案二分']"
  difficulty="medium"
  :appearances="4"
  pass-rate="50%"
  source-url="https://leetcode.cn/problems/koko-eating-bananas/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n log M)" space="O(1)" />

## 题目

有若干堆香蕉。珂珂每小时选择一堆，最多吃 `k` 根；如果该堆不足 `k` 根则吃完这一堆。给定总时限 `h`，求能在时限内吃完全部香蕉的最小速度 `k`。

## 思路

速度越快，所需时间越短，答案具有单调性。速度范围是 `[1, max(piles)]`，可以二分查找第一个满足总耗时不超过 `h` 的速度。

## Python 实现

```python
from typing import List


class Solution:
    def minEatingSpeed(self, piles: List[int], h: int) -> int:
        left, right = 1, max(piles)

        while left < right:
            speed = (left + right) // 2
            # 向上取整：一堆香蕉至少占用一个完整小时
            hours = sum((pile + speed - 1) // speed for pile in piles)

            if hours <= h:
                right = speed
            else:
                left = speed + 1

        return left
```

## 正确性说明

若速度 `k` 可行，则所有更大的速度也可行；若 `k` 不可行，则所有更小的速度也不可行。二分始终保留最小可行速度所在区间，区间收缩到一个值时，该值就是答案。

## 复杂度

- 时间：`O(n log M)`，`M` 为最大香蕉堆
- 空间：`O(1)`

## 易错点

单堆耗时需要向上取整，不能使用普通整除。
