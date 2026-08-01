# 912 · 排序数组

<ProblemMeta
  :tags="['字节面试题', '排序', '归并排序', '快速排序']"
  difficulty="medium"
  :appearances="30"
  pass-rate="54%"
  source-url="https://leetcode.cn/problems/sort-an-array/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n log n)" space="O(n)" />

## 题目

给定整数数组 `nums`，将数组按升序排列并返回。

本题不调用语言内置排序。下面先给出最坏复杂度稳定的自底向上归并排序，再补充面试中常考的原地快速排序。

### 示例

```text
输入：nums = [5,2,3,1]
输出：[1,2,3,5]

输入：nums = [5,1,1,2,0,0]
输出：[0,0,1,1,2,5]
```

## 解法一：自底向上归并排序

### 为什么选择归并排序

- 最坏时间复杂度稳定为 `O(n log n)`；
- 不依赖输入是否接近有序；
- 不会像随机化不足的快速排序那样退化到 `O(n²)`；
- 自底向上实现不使用递归栈。

算法先把每个单元素看作有序段，再依次合并长度为 `1、2、4、8...` 的相邻有序段。

### Python 实现

```python
class Solution:
    def sortArray(self, nums: list[int]) -> list[int]:
        length = len(nums)
        source = nums.copy()
        target = [0] * length
        width = 1

        # width 表示当前有序段长度，每轮两两归并后翻倍。
        while width < length:
            for left in range(0, length, width * 2):
                middle = min(left + width, length)
                right = min(left + width * 2, length)
                first = left
                second = middle
                write = left

                while first < middle and second < right:
                    if source[first] <= source[second]:
                        target[write] = source[first]
                        first += 1
                    else:
                        target[write] = source[second]
                        second += 1
                    write += 1

                while first < middle:
                    target[write] = source[first]
                    first += 1
                    write += 1

                while second < right:
                    target[write] = source[second]
                    second += 1
                    write += 1

            # 交换源/目标缓冲区，避免每轮重新分配数组。
            source, target = target, source
            width *= 2

        return source
```

### 双缓冲为什么不会丢数据

每一轮都从 `source` 读取两个上一轮已经有序的相邻段，把完整合并结果写入 `target` 的同一区间。

整轮结束后交换两个数组的角色，下一轮读取刚完成的结果。所有位置每轮都会被恰好覆盖一次，因此旧的 `target` 内容无需清空。

### 稳定性

两个元素相等时优先取左段元素，保持相等元素原有相对顺序，因此该实现是稳定排序。

本题只包含整数，稳定性不会影响返回值，但这是归并排序的重要性质。

### 正确性说明

初始宽度为 1，每个单元素段有序。假设一轮开始时所有长度不超过 `width` 的分段有序，合并操作按序选取两段最小剩余元素，产生有序的长度不超过 `2 × width` 的分段。由归纳法，每轮结束后有序段宽度翻倍；当宽度覆盖数组长度时，整个数组有序。

### 复杂度

- 时间复杂度：`O(n log n)`，共 `log n` 轮，每轮处理 `n` 个元素。
- 空间复杂度：`O(n)`，使用辅助数组。

## 解法二：随机化三路快速排序

普通快速排序若总选区间端点作为主元，在数组已经有序时可能连续切出极不平衡的区间，时间退化为 `O(n²)`。这里做两点改进：

1. **随机选择主元**：让特定输入不容易持续制造最坏分割；
2. **三路分区**：一次把区间划分成“小于主元、等于主元、大于主元”三部分，重复元素不再参与后续递归。

分区过程中始终维护下面的不变量：

- `[left, less)` 中的元素都小于 `pivot`；
- `[less, current)` 中的元素都等于 `pivot`；
- `[current, greater]` 还没有检查；
- `(greater, right]` 中的元素都大于 `pivot`。

### Python 实现

```python
from random import randrange


class Solution:
    def sortArray(self, nums: list[int]) -> list[int]:
        def quick_sort(left: int, right: int) -> None:
            # 用循环继续处理较长的一边，只递归较短的一边。
            # 即使分区极不均衡，递归栈深度也能控制在 O(log n)。
            while left < right:
                pivot = nums[randrange(left, right + 1)]

                less = left
                current = left
                greater = right

                # 三路分区完成后：
                # [left, less) < pivot
                # [less, greater] == pivot
                # (greater, right] > pivot
                while current <= greater:
                    if nums[current] < pivot:
                        nums[less], nums[current] = nums[current], nums[less]
                        less += 1
                        current += 1
                    elif nums[current] > pivot:
                        nums[current], nums[greater] = nums[greater], nums[current]
                        greater -= 1
                        # 换到 current 的元素还没有检查，因此 current 不移动。
                    else:
                        current += 1

                # 优先递归元素更少的一侧，另一侧交给 while 循环处理。
                if less - left < right - greater:
                    quick_sort(left, less - 1)
                    left = greater + 1
                else:
                    quick_sort(greater + 1, right)
                    right = less - 1

        quick_sort(0, len(nums) - 1)
        return nums
```

### 为什么等于主元的区间不用再排序

三路分区结束后，`[less, greater]` 中的值全部等于 `pivot`。相同值之间没有顺序要求，这一整段已经处于最终位置；后续只需分别排序左右两侧。

### 正确性说明

三路分区结束时，左段所有元素都小于中间段，右段所有元素都大于中间段。中间段已经有序；递归（或循环）将同样的过程应用于左右两段。区间长度不断缩小，最终每个区间长度至多为 1，因此整个数组按非递减顺序排列。

### 复杂度

- 平均时间复杂度：`O(n log n)`；随机主元通常能得到较均衡的分割。
- 最坏时间复杂度：`O(n²)`；随机化只能降低发生概率，不能消除理论最坏情况。
- 额外空间复杂度：`O(log n)`；只递归较短的一侧，另一侧使用循环处理。
- 快速排序是不稳定排序，相等元素的原始相对顺序可能改变。

## 边界用例

| 输入 | 预期 | 检查点 |
|---|---|---|
| `[]` | `[]` | 空数组 |
| `[1]` | `[1]` | 单元素 |
| `[5,2,3,1]` | `[1,2,3,5]` | 常规乱序 |
| `[5,1,1,2,0,0]` | `[0,0,1,1,2,5]` | 重复值 |
| `[4,3,2,1]` | `[1,2,3,4]` | 逆序 |

## 90 秒面试表达

“如果优先保证最坏复杂度，我会用自底向上的归并排序，时间稳定为 `O(n log n)`，代价是 `O(n)` 辅助空间。如果面试官要求手写快速排序，我会随机选择主元并做三路分区，让大量重复元素一次归位；同时只递归较短的一侧、循环处理较长的一侧，把递归栈控制在 `O(log n)`。快速排序平均 `O(n log n)`，但理论最坏仍是 `O(n²)`。”

## 常见追问

- 堆排序可以做到最坏 `O(n log n)` 且额外空间 `O(1)`，但不稳定。
- 快速排序平均 `O(n log n)`，应随机化主元并注意最坏情况。
- 链表排序适合归并，因为合并时无需额外数组且不需要随机访问。
