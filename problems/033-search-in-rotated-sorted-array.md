# 033 · 搜索旋转排序数组

<ProblemMeta
  :tags="['Hot100', '大厂面试', '旋转数组']"
  difficulty="medium"
  :appearances="52"
  pass-rate="44%"
  source-url="https://leetcode.cn/problems/search-in-rotated-sorted-array/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(log n)" space="O(1)" />

## 题目

一个元素互不相同的升序数组在某个未知位置发生旋转。给定旋转后的数组 `nums` 和目标值 `target`，返回目标下标；不存在则返回 `-1`。

要求时间复杂度为 `O(log n)`。

### 示例

```text
输入：nums = [4,5,6,7,0,1,2], target = 0
输出：4

输入：nums = [4,5,6,7,0,1,2], target = 3
输出：-1
```

## 旋转后仍保留的性质

整个区间不再有序，但以中点切开后，左右两半至少有一半有序。

- `nums[left] <= nums[middle]`：左半有序；
- 否则右半有序。

确定有序半区后，就能判断目标是否落在其值域内，并排除另一半。

## 动画拆解

下面逐轮标出当前候选区间、中点与有序半区，重点观察：我们不是判断目标位于中点哪一侧，而是先判断哪一半有序，再用值域决定取舍。

<BinarySearchDemo variant="rotated-search" />

## Python 实现

```python
class Solution:
    def search(self, nums: list[int], target: int) -> int:
        left = 0
        right = len(nums) - 1

        while left <= right:
            middle = left + (right - left) // 2

            if nums[middle] == target:
                return middle

            # 旋转数组中至少有一半有序，再判断目标是否落在该半区。
            if nums[left] <= nums[middle]:
                if nums[left] <= target < nums[middle]:
                    right = middle - 1
                else:
                    left = middle + 1
            else:
                if nums[middle] < target <= nums[right]:
                    left = middle + 1
                else:
                    right = middle - 1

        return -1
```

## 区间边界为什么一边闭一边开

当左半有序时，目标落入左半的条件是：

```text
nums[left] <= target < nums[middle]
```

中点已经单独比较过，因此不再包含。右半同理使用：

```text
nums[middle] < target <= nums[right]
```

## 正确性说明

每轮中点命中即可返回。未命中时，由数组无重复元素可确定至少一半严格有序。在有序半区内，可以用端点值准确判断目标是否可能存在；若在其值域内就保留该半，否则目标只能位于另一半。每轮排除一半且不会丢失目标，最终返回正确下标或确认不存在。

## 复杂度

- 时间复杂度：`O(log n)`。
- 空间复杂度：`O(1)`。

## 边界用例

| 输入 | 目标 | 预期 | 检查点 |
|---|---:|---:|---|
| `[4,5,6,7,0,1,2]` | `0` | `4` | 旋转右段 |
| `[4,5,6,7,0,1,2]` | `3` | `-1` | 不存在 |
| `[1]` | `1` | `0` | 单元素 |
| `[3,1]` | `1` | `1` | 两元素旋转 |
| `[1,2,3]` | `2` | `1` | 未旋转 |

## 90 秒面试表达

“旋转数组整体不有序，但每次用中点切分，至少一半仍然有序。先判断左半还是右半有序，再用该半区的端点值判断目标是否落在其中；落在就保留，否则搜索另一半。中点单独检查，区间每轮缩小一半，时间 `O(log n)`、空间 `O(1)`。”

## 常见追问

- 数组允许重复值时，端点和中点相等会失去判断依据，最坏需要逐步收缩到 `O(n)`。
- 只求旋转点或最小值时，可以直接与右端点比较。
- 找到目标后若还要求边界，需要根据重复元素规则继续二分。
