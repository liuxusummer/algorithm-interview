# 034 · 在排序数组中查找元素的第一个和最后一个位置

<ProblemMeta
  :tags="['Hot100', '大厂面试', '边界二分']"
  difficulty="medium"
  :appearances="27"
  pass-rate="40%"
  source-url="https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(log n)" space="O(1)" />

## 题目

给定非递减数组 `nums` 和目标值 `target`，返回目标值第一次和最后一次出现的位置。若不存在，返回 `[-1, -1]`。

要求时间复杂度为 `O(log n)`。

### 示例

```text
输入：nums = [5,7,7,8,8,10], target = 8
输出：[3,4]

输入：nums = [5,7,7,8,8,10], target = 6
输出：[-1,-1]
```

## 统一成左边界查找

定义 `lower_bound(value)`：

```text
返回第一个大于等于 value 的下标
```

那么：

- 左边界是 `lower_bound(target)`；
- 右边界是 `lower_bound(target + 1) - 1`。

Python 整数无溢出问题，因此可以安全使用 `target + 1`。

## Python 实现

```python
class Solution:
    def searchRange(
        self,
        nums: list[int],
        target: int,
    ) -> list[int]:
        def lower_bound(value: int) -> int:
            # 在左闭右开区间中查找第一个大于等于 value 的位置。
            left = 0
            right = len(nums)

            while left < right:
                middle = left + (right - left) // 2

                if nums[middle] < value:
                    left = middle + 1
                else:
                    right = middle

            return left

        first = lower_bound(target)

        if first == len(nums) or nums[first] != target:
            return [-1, -1]

        # target + 1 的下界减一，就是最后一个 target 的位置。
        last = lower_bound(target + 1) - 1
        return [first, last]
```

## 半开区间不变量

`lower_bound` 在 `[left, right)` 中搜索：

- `left` 左侧的元素都小于 `value`；
- `right` 及其右侧的候选都大于等于 `value`。

当 `left == right` 时，这个位置就是第一个不小于目标的下标，也可能等于数组长度。

## 为什么不能命中就返回

普通二分找到任意一个目标位置后，左右仍可能存在相同元素。

要保持 `O(log n)`，应继续用边界条件二分，而不是从命中点向两侧线性扫描；后者在全数组相同时会退化为 `O(n)`。

## 正确性说明

`lower_bound(target)` 根据半开区间不变量返回第一个可能等于目标的位置，显式检查后可判断目标是否存在。所有等于目标的元素都严格小于 `target + 1`，所以 `lower_bound(target + 1)` 是目标区间之后的第一个位置，减一即最后出现位置。两次二分精确得到左右边界。

## 复杂度

- 时间复杂度：`O(log n)`，执行两次二分。
- 空间复杂度：`O(1)`。

## 边界用例

| 输入 | 目标 | 预期 |
|---|---:|---|
| `[5,7,7,8,8,10]` | `8` | `[3,4]` |
| `[5,7,7,8,8,10]` | `6` | `[-1,-1]` |
| `[]` | `0` | `[-1,-1]` |
| `[2,2,2]` | `2` | `[0,2]` |
| `[1,2,3]` | `1` | `[0,0]` |

## 90 秒面试表达

“我实现一个半开区间的 `lower_bound`，返回第一个大于等于给定值的位置。目标左边界是 `lower_bound(target)`；确认目标存在后，右边界是第一个大于目标的位置减一，也就是 `lower_bound(target+1)-1`。这样避免命中后线性扩展，两次二分总时间仍是 `O(log n)`。”

## 常见追问

- 固定宽度整数语言中要避免 `target + 1` 溢出，可以单独实现 `upper_bound`。
- 插入位置问题直接返回 `lower_bound(target)`。
- 边界二分最重要的是先声明区间语义，再保持循环不变量一致。
