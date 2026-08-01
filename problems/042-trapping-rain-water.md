# 042 · 接雨水

<ProblemMeta
  :tags="['Hot100', '大厂面试', '双指针', '单调栈', '华为面试题']"
  difficulty="hard"
  :appearances="64"
  pass-rate="63%"
  source-url="https://leetcode.cn/problems/trapping-rain-water/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="双指针 O(1)，单调栈 O(n)" />

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

## 解法一：双指针

### 优化抓手

使用左右指针，并维护已经扫描区域的最高柱 `left_max` 与 `right_max`。

当 `height[left] <= height[right]` 时，右侧至少存在一根不低于 `height[left]` 的柱子，因此左侧当前位置能接多少水只由 `left_max` 决定。反过来，右侧当前位置只由 `right_max` 决定。

每次处理边界更低的一侧，就能立即确定该位置的水量。

### 动画拆解

下面把柱高、水层、左右指针和累计水量放在同一张图上。每个位置只会在较矮一侧离开时结算一次。

<PointerArrayDemo variant="trapping-rain-water" />

### Python 实现

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

### 为什么移动较低的一侧

某个位置的水位上限是：

```text
min(左侧最高柱, 右侧最高柱)
```

如果当前左柱不高于右柱，那么右侧已经有一个足够高的边界，左位置的短板只可能来自左侧。即使右侧未来出现更高的柱子，也不会改变左侧短板。于是可以立即结算左位置，再把左指针右移。

### 正确性说明

算法每次选择当前边界较低的一侧。处理左侧时，当前右边界保证右侧最高值至少不低于左柱，所以该位置的有效水位由已知 `left_max` 决定；处理右侧时对称成立。被结算的位置以后不会再受未扫描部分影响，因此每个位置的水量都被正确计算一次。

### 复杂度

- 时间复杂度：`O(n)`。左右指针合计移动不超过 `n` 次。
- 空间复杂度：`O(1)`。只维护常数个变量。

## 解法二：单调栈

双指针按“每根柱子上方有多少水”纵向结算；单调栈换一个视角，在找到凹槽右边界时，按水层横向结算。

栈中保存柱子的下标，并让对应高度从栈底到栈顶保持**单调不增**。扫描到更高的柱子 `right` 时，栈顶矮柱可能成为一个凹槽底部：

1. 弹出栈顶下标 `bottom`，它是本层水的底部；
2. 如果栈已经为空，说明左边没有挡板，不能接水；
3. 新栈顶 `left` 是左边界，当前柱 `right` 是右边界；
4. 宽度是 `right - left - 1`；
5. 本层有效高度是 `min(height[left], height[right]) - height[bottom]`。

因此本次新增水量为：

```text
(right - left - 1)
× (min(height[left], height[right]) - height[bottom])
```

这里计算的是刚刚被填平的一层，而不是整个凹槽的全部水量。继续弹栈时会计算更高的水层，所以不会重复计数。

### Python 实现

```python
class Solution:
    def trap(self, height: list[int]) -> int:
        stack: list[int] = []
        trapped_water = 0

        for right in range(len(height)):
            # 当前柱比栈顶高时，栈顶柱可以作为凹槽底部结算一层水。
            while stack and height[right] > height[stack[-1]]:
                bottom = stack.pop()

                # 弹出后没有左边界，水会从左侧流走。
                if not stack:
                    break

                left = stack[-1]
                width = right - left - 1
                bounded_height = (
                    min(height[left], height[right])
                    - height[bottom]
                )

                trapped_water += width * bounded_height

            # 保存下标，既能比较高度，也能计算左右边界之间的宽度。
            stack.append(right)

        return trapped_water
```

### 为什么可能连续弹出多个柱子

一个凹槽可能有多级台阶。例如当前右边界很高，它先填平最矮的底部；如果仍高于新的栈顶，就继续填下一层。每次弹栈只结算相邻两个高度层之间的面积，多个水层相加恰好得到完整水量。

### 正确性说明

栈内柱高始终单调不增。只有遇到更高的右边界时，栈顶柱上方才形成一个左右边界都已确定的封闭水层。弹出底部后，新栈顶是距离它最近且不低于该水层的左边界，因此上述宽度和有效高度准确描述了尚未计算的水层。

每根柱子最多入栈一次、出栈一次；每次弹出结算的高度层彼此不重叠，所以所有能形成左右边界的水量都会被计算且只计算一次。

### 复杂度

- 时间复杂度：`O(n)`。每个下标最多入栈、出栈各一次。
- 空间复杂度：`O(n)`。单调递减或等高数组可能全部留在栈中。

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

“这题有两种线性做法。双指针按柱子纵向结算：维护左右最高值，每次处理较低边界的一侧，时间 `O(n)`、空间 `O(1)`。单调栈则按水层横向结算：栈中保存高度单调不增的柱子下标，遇到更高的右边界就弹出凹槽底部，用新栈顶和当前柱作为左右边界，水量等于宽度乘有效高度。每个下标最多进出栈一次，所以也是 `O(n)`，空间 `O(n)`。”

## 常见追问

- 双指针空间更优；单调栈能直接展示凹槽结构，也更容易迁移到“下一个更大元素”等题型。
- 如果要输出每个位置的水量，可以使用左右最大值数组，空间为 `O(n)`。
- 二维接雨水需要从边界出发使用优先队列，不再能直接套用一维双指针。
