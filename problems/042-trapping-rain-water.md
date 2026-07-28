# 042 · 接雨水

<ProblemMeta
  :tags="['Hot100', '大厂面试', '双指针']"
  difficulty="hard"
  :appearances="38"
  pass-rate="63%"
  source-url="https://leetcode.cn/problems/trapping-rain-water/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(1)" />

## 题目

给定 `n` 个非负整数表示宽度均为 `1` 的柱子高度，计算下雨后这些柱子之间能够接住多少单位的水。

### 示例

```text
输入：height = [0,1,0,2,1,0,1,3,2,1,2,1]
输出：6
```

```text
输入：height = [4,2,0,3,2,5]
输出：9
```

### 约束观察

- 单根柱子上方的水量由它左侧最高柱和右侧最高柱中的较小者决定。
- 两端没有外侧边界，无法存水。
- 只需要总水量，不需要恢复每个位置的水面。

## 先说暴力解

对每个位置分别向左、向右扫描最高柱：

```text
water[i] = min(left_max[i], right_max[i]) - height[i]
```

每个位置都扫描两侧，时间复杂度为 `O(n²)`。可以预处理左右最大值降到 `O(n)` 时间，但会使用 `O(n)` 空间。

## 优化抓手

使用左右指针，并维护已经扫描区域的最高柱 `left_max` 与 `right_max`。

当 `height[left] <= height[right]` 时，右侧至少存在一根不低于 `height[left]` 的柱子，因此左侧当前位置能接多少水只由 `left_max` 决定。反过来，右侧当前位置只由 `right_max` 决定。

每次处理边界更低的一侧，就能立即确定该位置的水量。

## Python 实现

```python
class Solution:
    def trap(self, height: list[int]) -> int:
        left = 0
        right = len(height) - 1
        left_max = 0
        right_max = 0
        trapped_water = 0

        while left < right:
            # 较矮一侧的蓄水上界已经确定，可安全结算后向内移动。
            if height[left] <= height[right]:
                left_max = max(left_max, height[left])
                trapped_water += left_max - height[left]
                left += 1
            else:
                right_max = max(right_max, height[right])
                trapped_water += right_max - height[right]
                right -= 1

        return trapped_water
```

## 为什么移动较低的一侧

某个位置的水位上限是：

```text
min(左侧最高柱, 右侧最高柱)
```

如果当前左柱不高于右柱，那么右侧已经有一个足够高的边界，左位置的短板只可能来自左侧。即使右侧未来出现更高的柱子，也不会改变左侧短板。于是可以立即结算左位置，再把左指针右移。

## 正确性说明

算法每次选择当前边界较低的一侧。处理左侧时，当前右边界保证右侧最高值至少不低于左柱，所以该位置的有效水位由已知 `left_max` 决定；处理右侧时对称成立。被结算的位置以后不会再受未扫描部分影响，因此每个位置的水量都被正确计算一次。

## 复杂度

- 时间复杂度：`O(n)`。左右指针合计移动不超过 `n` 次。
- 空间复杂度：`O(1)`。只维护常数个变量。

## 边界用例

| 输入 | 预期 | 检查点 |
|---|---:|---|
| `[]` | 0 | 空数组 |
| `[1]` | 0 | 单柱 |
| `[1, 2, 3]` | 0 | 单调递增 |
| `[3, 2, 1]` | 0 | 单调递减 |
| `[2, 0, 2]` | 2 | 基础凹槽 |
| `[4, 2, 0, 3, 2, 5]` | 9 | 多层水位 |

## 90 秒面试表达

“每个位置的水量等于左右最高柱较小值减去当前高度。暴力做法为每个位置扫描两侧，是 `O(n²)`；预处理能做到 `O(n)`，但需要两个数组。我用左右双指针维护 `left_max` 和 `right_max`。每次处理当前边界较低的一侧，因为另一侧已经提供足够边界，该位置水量只由本侧最大值决定。每个位置结算一次，时间 `O(n)`、空间 `O(1)`。”

## 常见追问

- 使用单调递减栈也能在 `O(n)` 时间解决，它按凹槽逐层结算水量。
- 如果要输出每个位置的水量，可以使用左右最大值数组，空间为 `O(n)`。
- 二维接雨水需要从边界出发使用优先队列，不再能直接套用一维双指针。
