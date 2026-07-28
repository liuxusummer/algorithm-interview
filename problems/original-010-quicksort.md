# 原创 010 · 手写快速排序

<ProblemMeta
  :tags="['华为面试题', '排序与堆', '快速排序']"
  difficulty="medium"
  :appearances="5"
  pass-rate="60%"
/>

<ComplexityBadge time="平均 O(n log n)" space="平均 O(log n)" />

## 题目

给定整数数组，请手写快速排序，将数组按非递减顺序原地排列。要求说明分区过程、递归边界，以及大量重复元素时的处理方式。

## 思路

使用三路分区：

- `[left, less)`：小于基准值；
- `[less, current)`：等于基准值；
- `(greater, right]`：大于基准值。

分区完成后，只需递归处理小于区和大于区。三路分区能避免大量重复元素导致无意义的递归。

## Python 实现

```python
from typing import List


def quick_sort(nums: List[int]) -> List[int]:
    def sort(left: int, right: int) -> None:
        if left >= right:
            return

        # 取中间元素作为基准，降低有序数组触发最坏情况的概率
        pivot = nums[(left + right) // 2]
        less, current, greater = left, left, right

        while current <= greater:
            if nums[current] < pivot:
                nums[less], nums[current] = nums[current], nums[less]
                less += 1
                current += 1
            elif nums[current] > pivot:
                # 换回来的元素尚未检查，因此 current 暂不移动
                nums[current], nums[greater] = nums[greater], nums[current]
                greater -= 1
            else:
                current += 1

        sort(left, less - 1)
        sort(greater + 1, right)

    sort(0, len(nums) - 1)
    return nums
```

## 正确性说明

分区循环始终维持三个已确定区间。循环结束时，数组被划分为小于、等于、大于基准值的三部分。中间部分已经位于最终位置，对左右两部分递归应用同样过程，最终整个数组有序。

## 复杂度

- 平均时间：`O(n log n)`
- 最坏时间：`O(n²)`
- 平均递归空间：`O(log n)`
- 最坏递归空间：`O(n)`

## 常见追问

若需要进一步降低构造数据触发最坏情况的风险，可以随机选择基准值；工程中还可以优先递归较短区间，以控制调用栈深度。
