# 剑指 Offer 51 · 数组中的逆序对

<ProblemMeta
  :tags="['大厂面试', '归并排序', '分治', '剑指 Offer']"
  difficulty="hard"
  :appearances="52"
  pass-rate="49%"
  source-url="https://leetcode.cn/problems/shu-zu-zhong-de-ni-xu-dui-lcof/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n log n)" space="O(n)" />

## 题目

统计数组中满足 `i < j` 且 `nums[i] > nums[j]` 的下标对数量。

暴力枚举是 `O(n²)`。归并排序在合并两个有序区间时，可以批量计算跨越左右区间的逆序对。

## 合并时如何计数

若 `left[i] <= right[j]`，当前左值不会与 `right[j]` 构成逆序对。否则左区间从 `i` 到末尾的所有值都大于 `right[j]`，一次增加 `mid - i + 1`。

## Python 实现

```python
from typing import List


class Solution:
    def reversePairs(self, nums: List[int]) -> int:
        if len(nums) < 2:
            return 0

        buffer = [0] * len(nums)

        def merge_sort(left: int, right: int) -> int:
            if left >= right:
                return 0

            mid = left + (right - left) // 2
            count = merge_sort(left, mid) + merge_sort(mid + 1, right)

            # 已经整体有序时不存在跨区间逆序对，也无需合并。
            if nums[mid] <= nums[mid + 1]:
                return count

            i, j, write = left, mid + 1, left
            while i <= mid and j <= right:
                if nums[i] <= nums[j]:
                    buffer[write] = nums[i]
                    i += 1
                else:
                    buffer[write] = nums[j]
                    count += mid - i + 1
                    j += 1
                write += 1

            while i <= mid:
                buffer[write] = nums[i]
                i += 1
                write += 1
            while j <= right:
                buffer[write] = nums[j]
                j += 1
                write += 1

            nums[left:right + 1] = buffer[left:right + 1]
            return count

        return merge_sort(0, len(nums) - 1)
```

## 正确性说明

递归分别统计完全位于左右区间的逆序对。合并时两侧有序，当右值更小时，尚未处理的所有左值都与它构成逆序对，批量计数准确。三类逆序对互不重叠且覆盖全部情况，因此总数正确。

## 复杂度与追问

- 时间 `O(n log n)`，辅助数组 `O(n)`，递归栈 `O(log n)`。
- 若数据在线到达，可使用树状数组配合离散化统计已出现的更大值。
