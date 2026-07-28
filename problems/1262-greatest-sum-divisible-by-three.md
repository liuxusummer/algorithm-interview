# 1262 · 可被三整除的最大和

<ProblemMeta
  :tags="['腾讯面试题', '动态规划', '余数状态']"
  difficulty="medium"
  :appearances="10"
  pass-rate="33%"
  source-url="https://leetcode.cn/problems/greatest-sum-divisible-by-three/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(1)" />

## 题目

给定整数数组 `nums`，从中选择任意若干个元素，使它们的和可以被 3 整除。返回满足条件的最大和。

可以不选任何元素，此时和为 `0`。

### 示例

```text
输入：[3, 6, 5, 1, 8]
输出：18
解释：选择 3、6、1、8。
```

## 余数动态规划

具体和可能很大，但决定答案是否合法的只有除以 3 的余数。维护：

```text
dp[r] = 当前已处理元素中，余数为 r 的最大可达和
```

初始只有空集：

```text
dp = [0, 不可达, 不可达]
```

处理 `value` 时，对旧状态有两个选择：

- 不选它，状态不变；
- 选它，从余数 `r` 转移到 `(r + value) % 3`。

必须从旧数组生成新数组，不能在同一轮重复使用当前元素。

## Python 实现

```python
class Solution:
    def maxSumDivThree(self, nums: list[int]) -> int:
        negative_infinity = float("-inf")
        dp = [0, negative_infinity, negative_infinity]

        for value in nums:
            next_dp = dp.copy()

            for remainder in range(3):
                if dp[remainder] == negative_infinity:
                    continue

                candidate = dp[remainder] + value
                next_remainder = candidate % 3

                # 只保留每种余数下最大的可达和。
                next_dp[next_remainder] = max(
                    next_dp[next_remainder],
                    candidate,
                )

            dp = next_dp

        return int(dp[0])
```

## 为什么每种余数只保留最大和

假设两个已选集合的和余数相同，且一个和更大。后续无论再选择哪些元素，两者新增的数完全相同，余数变化也相同；原本更大的和始终不会变差。因此较小状态不可能产生更优答案，可以安全丢弃。

## 正确性说明

处理任意数组前缀后，`dp[r]` 保存该前缀所有子集中余数为 `r` 的最大和。加入新元素时，“不选”和“选择”覆盖每个子集的两种来源，且转移使用上一轮状态，不会重复选择同一元素。

由归纳可知处理完整个数组后状态仍满足定义。能够被 3 整除的和余数为 0，所以 `dp[0]` 就是所求最大和。

## 复杂度

- 时间复杂度：`O(n)`，每个元素只转移 3 个状态；
- 空间复杂度：`O(1)`，状态数组长度固定为 3。

## 边界用例

| 输入 | 输出 |
|---|---:|
| `[]` | `0` |
| `[1]` | `0` |
| `[3]` | `3` |
| `[1, 2, 3]` | `6` |
| `[4, 1, 5, 3, 1]` | `12` |

## 90 秒面试表达

“是否能被 3 整除只和余数有关，所以我维护三个状态：当前前缀中余数为 0、1、2 的最大可达和。每个数可以不选，也可以从旧余数转移到新余数；同余数只保留最大和，因为后续加相同元素时它始终更优。每轮必须复制旧状态，避免重复使用当前数。时间 `O(n)`、空间 `O(1)`。”

## 常见追问

- 不能把不可达状态初始化为 0，否则会伪造选择方案；
- 模数变为 `m` 时，可维护长度为 `m` 的状态数组；
- 若数组允许负数，需要重新确认“可以不选”和最大值定义。
