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

### 示例

```text
输入：nums = [3, 5, 3, 1, 3, 2]
输出：[1, 2, 3, 3, 3, 5]
```

### 约束观察

- 必须原地修改数组，不能把每轮结果复制到多个新数组；
- 递归区间为空或只有一个元素时天然有序；
- 大量重复元素会让普通二路分区产生无意义递归，适合三路分区。

## 先说直接调用排序

工程代码可以直接使用 `nums.sort()`。面试手写快速排序的考点在于分区不变量、递归边界以及最坏情况，因此需要把这些细节明确写出来。

## 三路分区

使用三路分区：

- `[left, less)`：小于基准值；
- `[less, current)`：等于基准值；
- `(greater, right]`：大于基准值。

分区完成后，只需递归处理小于区和大于区。三路分区能避免大量重复元素导致无意义的递归。

### 重复元素分区轨迹

以 `[3, 5, 3, 1, 3, 2]`、基准值 `3` 为例：

```text
初始：未知区覆盖全部元素
扫描后：小于区 [2, 1]｜等于区 [3, 3, 3]｜大于区 [5]
递归：只处理 [2, 1] 和 [5]
```

当元素从大于区交换回来时，它还没有被检查，所以 `current` 不能立即右移。

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

## 边界用例

| 输入 | 输出 | 检查点 |
|---|---|---|
| `[]` | `[]` | 空区间直接结束 |
| `[1]` | `[1]` | 单元素 |
| `[2, 2, 2]` | `[2, 2, 2]` | 等于区一次吸收全部元素 |
| `[5, 4, 3, 2, 1]` | `[1, 2, 3, 4, 5]` | 逆序输入 |

## 90 秒面试表达

我使用三路快排。每轮选择基准，并维护小于、等于和大于三个区间；扫描未知区时，小值交换到左侧，大值交换到右侧，等值直接前进。分区完成后等于区已经就位，只递归左右两侧。平均时间 `O(n log n)`，大量重复元素时比二路分区稳定；最坏仍可能退化到 `O(n²)`。

## 常见追问

- 中间元素只降低某些有序输入的风险，无法避免精心构造的最坏数据；
- 随机选择基准值可以降低持续失衡的概率；
- 工程中可优先递归较短区间，并用循环处理较长区间来控制调用栈。
