# 704 · 二分查找

<ProblemMeta
  :tags="['字节面试题', '二分查找', '模板']"
  difficulty="medium"
  :appearances="26"
  pass-rate="55%"
  source-url="https://leetcode.cn/problems/binary-search/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(log n)" space="O(1)" />

## 题目

给定严格升序整数数组 `nums` 和目标值 `target`，返回目标下标；不存在则返回 `-1`。

本页难度按提供的面试题截图记录。

### 示例

```text
输入：nums = [-1,0,3,5,9,12], target = 9
输出：4

输入：nums = [-1,0,3,5,9,12], target = 2
输出：-1
```

## 闭区间模板

维护目标可能存在的闭区间 `[left, right]`：

- 初始为 `[0, len(nums) - 1]`；
- 中点小于目标，排除中点及左侧；
- 中点大于目标，排除中点及右侧；
- 区间为空时目标不存在。

因为左右端点都可能是答案，循环条件使用 `left <= right`。

## Python 实现

```python
class Solution:
    def search(self, nums: list[int], target: int) -> int:
        left = 0
        right = len(nums) - 1

        # 在闭区间 [left, right] 内二分，每次排除中点及一侧。
        while left <= right:
            middle = left + (right - left) // 2

            if nums[middle] == target:
                return middle

            if nums[middle] < target:
                left = middle + 1
            else:
                right = middle - 1

        return -1
```

## 为什么边界必须跨过中点

中点已经与目标比较且确认不相等，下一轮不能继续保留它。

写成 `left = middle` 或 `right = middle` 可能在区间只剩两个元素时无法缩小，造成死循环。闭区间模板应使用 `middle + 1` 和 `middle - 1`。

## 正确性说明

循环不变量是：若目标存在，它一定位于 `[left, right]`。中点小于目标时，由数组严格递增可排除中点及其左侧；大于目标时可排除中点及其右侧。命中立即返回。若最终 `left > right`，候选区间为空，因此目标不存在。

## 复杂度

- 时间复杂度：`O(log n)`。
- 空间复杂度：`O(1)`。

## 边界用例

| 输入 | 目标 | 预期 |
|---|---:|---:|
| `[-1,0,3,5,9,12]` | `9` | `4` |
| `[-1,0,3,5,9,12]` | `2` | `-1` |
| `[5]` | `5` | `0` |
| `[5]` | `2` | `-1` |
| `[1,3]` | `3` | `1` |

## 90 秒面试表达

“我使用闭区间 `[left,right]`。每轮取中点，命中就返回；中点值小于目标，目标只能在右侧，所以左边界设为 `mid+1`；否则右边界设为 `mid-1`。循环条件是 `left<=right`，结束时区间为空说明不存在。时间 `O(log n)`、空间 `O(1)`。”

## 常见追问

- 查找第一个大于等于目标的位置时，推荐使用半开区间 `lower_bound` 模板。
- 数组按降序排列时，边界移动方向相反。
- 二分不仅能查数组，也能用于任何具有单调真假边界的答案空间。
