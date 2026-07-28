# 153 · 寻找旋转排序数组中的最小值

<ProblemMeta
  :tags="['Hot100', '大厂面试', '旋转数组']"
  difficulty="medium"
  :appearances="21"
  pass-rate="59%"
  source-url="https://leetcode.cn/problems/find-minimum-in-rotated-sorted-array/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(log n)" space="O(1)" />

## 题目

一个元素互不相同的升序数组经过若干次旋转，返回数组中的最小元素。

要求时间复杂度为 `O(log n)`。

### 示例

```text
输入：nums = [3,4,5,1,2]
输出：1

输入：nums = [4,5,6,7,0,1,2]
输出：0

输入：nums = [11,13,15,17]
输出：11
```

## 为什么与右端点比较

中点值与右端点值可以判断中点位于哪一段：

- `nums[middle] > nums[right]`：中点在旋转前的较大段，最小值一定在中点右侧；
- `nums[middle] < nums[right]`：中点到右端有序，最小值可能就是中点，也可能在左侧。

数组无重复元素，所以不会出现无法判断的相等情况，除非 `middle == right`，而循环条件会避免它。

## Python 实现

```python
class Solution:
    def findMin(self, nums: list[int]) -> int:
        left = 0
        right = len(nums) - 1

        # 与右端点比较即可判断最小值位于哪一半。
        while left < right:
            middle = left + (right - left) // 2

            if nums[middle] > nums[right]:
                left = middle + 1
            else:
                right = middle

        return nums[left]
```

## 为什么一边是 `middle + 1`，另一边是 `middle`

当 `nums[middle] > nums[right]` 时，中点不可能是最小值，可以安全排除。

否则中点可能恰好是最小值，不能排除，因此令 `right = middle`。这也决定循环使用 `left < right`，最终收缩到唯一候选。

## 正确性说明

循环始终保持最小值位于闭区间 `[left, right]`。若中点值大于右端值，旋转断点必在中点右侧；否则从中点到右端单调，断点不可能位于中点右侧，所以保留左侧及中点。每轮区间严格缩小且不丢失最小值，最终唯一位置就是答案。

## 复杂度

- 时间复杂度：`O(log n)`。
- 空间复杂度：`O(1)`。

## 边界用例

| 输入 | 预期 | 检查点 |
|---|---:|---|
| `[3,4,5,1,2]` | `1` | 常规旋转 |
| `[4,5,6,7,0,1,2]` | `0` | 较长右段 |
| `[1,2,3]` | `1` | 未旋转 |
| `[2,1]` | `1` | 两元素 |
| `[1]` | `1` | 单元素 |

## 90 秒面试表达

“我维护最小值所在的闭区间，并比较中点与右端。中点大于右端，说明中点位于较大的前半段，最小值严格在右边，所以左边界到 `mid+1`；否则中点可能就是最小值，右边界收缩到 `mid`。最终左右边界重合就是旋转点。时间 `O(log n)`、空间 `O(1)`。”

## 常见追问

- 允许重复元素时，中点等于右端无法判断，只能把右边界减一，最坏 `O(n)`。
- 旋转次数等于最小值下标。
- 搜索指定元素时，还需要结合有序半区的值域判断。
