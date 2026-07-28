# 053 · 最大子数组和

<ProblemMeta
  :tags="['模板题', '线性 DP', '普通数组']"
  difficulty="medium"
  :appearances="46"
  pass-rate="67%"
  source-url="https://leetcode.cn/problems/maximum-subarray/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(1)" />

## 题目

给定一个整数数组 `nums`，找出和最大的非空连续子数组，并返回该子数组的元素和。

### 示例

```text
输入：nums = [-2,1,-3,4,-1,2,1,-5,4]
输出：6
解释：连续子数组 [4,-1,2,1] 的和最大
```

```text
输入：nums = [-3,-2,-5]
输出：-2
```

### 约束观察

- 子数组必须连续且不能为空。
- 负数前缀只会拖累后续子数组，应在合适位置舍弃。
- 数组可能全是负数，答案不能默认初始化为 `0`。

## 先说暴力解

枚举每个起点，并向右累加，记录所有连续区间的最大和。

```python
def max_subarray_brute_force(nums: list[int]) -> int:
    best_sum = nums[0]

    for start in range(len(nums)):
        current_sum = 0

        # 固定左端点后不断扩展右端点，复用已经计算的区间和。
        for end in range(start, len(nums)):
            current_sum += nums[end]
            best_sum = max(best_sum, current_sum)

    return best_sum
```

一共有 `O(n²)` 个连续区间，因此时间复杂度为 `O(n²)`。

## 优化抓手

定义：

```text
best_ending_here = 必须以当前位置结尾的最大子数组和
```

遍历到 `value` 时，只有两种选择：

1. 把 `value` 接在前一个最优结尾之后；
2. 放弃之前的区间，从 `value` 重新开始。

转移方程：

```text
best_ending_here = max(value, best_ending_here + value)
```

再用 `best_sum` 记录所有位置的最大值。

## Python 实现

```python
class Solution:
    def maxSubArray(self, nums: list[int]) -> int:
        best_ending_here = nums[0]
        best_sum = nums[0]

        # 当前状态必须以 value 结尾：要么从这里重开，要么延续前一段。
        for value in nums[1:]:
            best_ending_here = max(
                value,
                best_ending_here + value,
            )
            best_sum = max(best_sum, best_ending_here)

        return best_sum
```

## 为什么可以丢弃负贡献前缀

如果前一个位置的 `best_ending_here` 小于 `0`，把它接到当前值前只会让总和更小：

```text
best_ending_here + value < value
```

因此从当前值重新开始一定更优。算法不是简单“遇到负数就重置”，而是判断此前整个连续区间的总贡献是否为负。

## 为什么不能把答案初始化为 `0`

当数组全为负数时，空子数组的和 `0` 并不是合法答案。用首元素初始化两个状态，能够保证算法始终选择非空子数组。

## 正确性说明

在每个位置，所有以该位置结尾的连续子数组只有两类：只包含当前元素，或由某个以前一位置结尾的子数组加上当前元素。选择两者最大值就得到该位置的最优结尾。`best_sum` 比较所有位置的最优结尾，因此等于全数组的最大连续子数组和。

## 复杂度

- 时间复杂度：`O(n)`。每个元素只处理一次。
- 空间复杂度：`O(1)`。状态被压缩为两个变量。

## 边界用例

| 输入 | 预期 | 检查点 |
|---|---:|---|
| `[-2,1,-3,4,-1,2,1,-5,4]` | 6 | 基础路径 |
| `[1]` | 1 | 单元素 |
| `[-3,-2,-5]` | -2 | 全负数 |
| `[5,4,-1,7,8]` | 23 | 整体最优 |
| `[-2,1]` | 1 | 丢弃负前缀 |

## 90 秒面试表达

“暴力枚举所有连续区间是 `O(n²)`。我定义 `best_ending_here` 为必须以当前位置结尾的最大和。加入当前值时，要么延续前一个最优区间，要么从当前值重新开始，所以转移是 `max(value, best_ending_here + value)`。再用全局变量记录所有结尾状态的最大值。两个状态都用首元素初始化，以正确处理全负数组。时间 `O(n)`、空间 `O(1)`。”

## 常见追问

- 如果要返回区间下标，在选择“重新开始”时更新候选起点，在刷新全局答案时保存左右边界。
- 分治法也能解决，时间复杂度为 `O(n log n)`。
- 最大子数组乘积需要同时维护以当前位置结尾的最大值和最小值，因为负数会交换二者。
