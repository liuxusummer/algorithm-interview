# 016 · 最接近的三数之和

<ProblemMeta
  :tags="['华为面试题', '双指针', '排序']"
  difficulty="medium"
  :appearances="3"
  pass-rate="38%"
  source-url="https://leetcode.cn/problems/3sum-closest/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n²)" space="O(log n)" />

## 题目

给定整数数组 `nums` 和目标值 `target`，从数组中选出三个整数，使三数之和与 `target` 最接近，返回这个三数之和。题目保证答案唯一。

## 思路

先排序，再固定第一个数，用左右指针寻找另外两个数。每次更新当前最接近的和：和偏小就右移左指针，和偏大就左移右指针；如果恰好等于目标值，可以直接返回。

## Python 实现

```python
from typing import List


class Solution:
    def threeSumClosest(self, nums: List[int], target: int) -> int:
        nums.sort()
        closest = nums[0] + nums[1] + nums[2]

        for i in range(len(nums) - 2):
            left, right = i + 1, len(nums) - 1
            while left < right:
                current = nums[i] + nums[left] + nums[right]

                # 只有距离严格变小时才替换当前答案
                if abs(current - target) < abs(closest - target):
                    closest = current

                if current < target:
                    left += 1
                elif current > target:
                    right -= 1
                else:
                    return target

        return closest
```

## 正确性说明

排序后，固定 `nums[i]`。若当前和小于目标值，只有增大较小的数才可能更接近目标，因此移动左指针；反之移动右指针。双指针覆盖了每个固定首元素下所有可能改善答案的区间，`closest` 始终保存已检查组合中的最优值，最终即为答案。

## 复杂度

- 时间：`O(n²)`
- 空间：`O(log n)`，来自 Python 排序

## 60 秒口述

我先排序，枚举第一个数，再用双指针寻找另外两个数。每次比较当前和与目标的距离并更新答案；当前和偏小就左指针右移，偏大就右指针左移，恰好命中则直接返回。整体时间复杂度 `O(n²)`。
