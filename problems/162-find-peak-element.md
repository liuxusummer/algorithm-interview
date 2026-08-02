# 162 · 寻找峰值

<ProblemMeta
  :tags="['Hot100', '大厂面试', '二分查找', '数组']"
  difficulty="medium"
  :appearances="80"
  pass-rate="49%"
  source-url="https://leetcode.cn/problems/find-peak-element/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(log n)" space="O(1)" />

## 题目

返回任意一个峰值元素的下标。相邻元素不相等，数组边界外视为负无穷，要求 `O(log n)`。

### 示例

```text
输入：nums = [1, 2, 3, 1]
输出：2
解释：nums[2] = 3 同时大于左右相邻元素，因此下标 2 是峰值位置。
```

## 为什么可以二分

比较 `nums[mid]` 与 `nums[mid + 1]`：

- 若正在上坡，右侧必然能遇到峰值；令 `left = mid + 1`；
- 若正在下坡或 `mid` 已是峰值，左半部分（包含 `mid`）必然有峰值；令 `right = mid`。

这里寻找的不是具体数值，而是一个始终包含答案的区间。

## Python 实现

```python
from typing import List


class Solution:
    def findPeakElement(self, nums: List[int]) -> int:
        left, right = 0, len(nums) - 1

        while left < right:
            mid = left + (right - left) // 2

            if nums[mid] < nums[mid + 1]:
                # 上坡：mid 不可能是峰值，但右侧一定存在峰值。
                left = mid + 1
            else:
                # 下坡：mid 本身或左侧存在峰值，不能丢掉 mid。
                right = mid

        return left
```

## 正确性说明

区间初始包含整个数组，必有峰值。每轮依据局部坡度保留必含峰值的一侧，并严格缩短区间；当左右边界重合时，唯一剩余位置就是峰值。

## 复杂度与边界

- 时间 `O(log n)`，空间 `O(1)`。
- `mid + 1` 安全，因为循环条件保证 `mid < right`。
- 单元素数组直接返回 0；存在多个峰值时返回任意一个即可。

## 90 秒面试表达

“我不需要判断哪一个峰值，只要维护一个必含峰值的区间。中点右侧更高说明当前处于上坡，右边一定能走到峰值；否则左侧连同中点一定有峰值。每次区间减半，最终收敛到答案。”
