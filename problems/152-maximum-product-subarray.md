# 152 · 乘积最大子数组

<ProblemMeta
  :tags="['Hot100', '腾讯面试', '动态规划']"
  difficulty="medium"
  :appearances="10"
  pass-rate="49%"
  source-url="https://leetcode.cn/problems/maximum-product-subarray/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(1)" />

## 题目

给定整数数组 `nums`，找出乘积最大的非空连续子数组，并返回该子数组的乘积。

### 示例

```text
输入：[2, 3, -2, 4]
输出：6
解释：子数组 [2, 3] 的乘积最大。
```

```text
输入：[-2, 0, -1]
输出：0
```

## 为什么要同时维护最大值和最小值

加法 DP 只需保存“以当前位置结尾的最大和”，但乘法遇到负数会反转大小关系：

- 之前的最大正数乘负数，可能变成最小值；
- 之前的最小负数乘负数，可能变成新的最大值。

因此处理到每个位置时，同时维护：

- `maximum_ending_here`：必须以当前位置结尾的最大乘积；
- `minimum_ending_here`：必须以当前位置结尾的最小乘积。

当前值既可以独立开始新子数组，也可以接到前一个最大或最小乘积之后。

## Python 实现

```python
class Solution:
    def maxProduct(self, nums: list[int]) -> int:
        maximum_ending_here = nums[0]
        minimum_ending_here = nums[0]
        answer = nums[0]

        for value in nums[1:]:
            previous_maximum = maximum_ending_here
            previous_minimum = minimum_ending_here

            # 负数会交换最大、最小候选的角色，必须同时转移。
            maximum_ending_here = max(
                value,
                previous_maximum * value,
                previous_minimum * value,
            )
            minimum_ending_here = min(
                value,
                previous_maximum * value,
                previous_minimum * value,
            )
            answer = max(answer, maximum_ending_here)

        return answer
```

## 状态为什么允许从当前值重新开始

零会把此前乘积清空，绝对值较小或符号不利的前缀也可能拖累当前值。把 `value` 本身列为候选，相当于允许连续子数组从当前位置重新开始。

## 正确性说明

任意以当前位置结尾的连续子数组，要么只包含当前值，要么由一个以前一位置结尾的连续子数组乘当前值而来。乘正数时最大值仍来自此前最大值，乘负数时最大值可能来自此前最小值，所以三个候选覆盖全部可能。

算法同时保留最大与最小状态，不会遗漏负负得正的情况；`answer` 记录所有结束位置中的最大乘积，因此最终得到全局最优解。

## 复杂度

- 时间复杂度：`O(n)`；
- 空间复杂度：`O(1)`。

## 边界用例

| 输入 | 输出 | 检查点 |
|---|---:|---|
| `[-2]` | `-2` | 非空子数组 |
| `[0, 2]` | `2` | 零后重启 |
| `[-2, 3, -4]` | `24` | 两个负数 |
| `[-2, 0, -1]` | `0` | 零分割区间 |

## 90 秒面试表达

“乘法和最大子数组和的区别是负数会交换大小关系，所以我同时维护以当前位置结尾的最大乘积和最小乘积。当前状态从当前值、前一最大值乘当前值、前一最小值乘当前值三个候选转移；当前值单独出现表示从这里重新开始。遍历时更新全局最大值，时间 `O(n)`、空间 `O(1)`。”

## 常见追问

- 必须先保存上一轮最大、最小值，不能让更新后的状态污染另一条转移；
- 若要求返回区间，还需同步记录每个状态的起点；
- 输入为空时需要与面试官确认返回约定，本题保证非空。
