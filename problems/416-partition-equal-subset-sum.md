# 416 · 分割等和子集

<ProblemMeta
  :tags="['Hot100', '大厂面试', '0/1 背包']"
  difficulty="medium"
  :appearances="17"
  pass-rate="54%"
  source-url="https://leetcode.cn/problems/partition-equal-subset-sum/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n · target)" space="O(target)" />

## 题目

给定只包含正整数的数组 `nums`，判断能否把它分成两个元素和相等的子集。

每个数组元素只能使用一次。

### 示例

```text
输入：nums = [1, 5, 11, 5]
输出：True
解释：可以分成 [1, 5, 5] 和 [11]

输入：nums = [1, 2, 3, 5]
输出：False
```

## 转换成 0/1 背包

设数组总和为 `total`：

- `total` 为奇数时不可能平分；
- `total` 为偶数时，只需判断能否从数组中选出和为 `total / 2` 的子集。

定义 `reachable[sum]` 表示能否用已经处理过的元素组成该和。

## Python 实现

```python
class Solution:
    def canPartition(self, nums: list[int]) -> bool:
        total = sum(nums)

        if total % 2 == 1:
            return False

        target = total // 2
        reachable = [False] * (target + 1)
        reachable[0] = True

        for number in nums:
            if number > target:
                return False

            for current_sum in range(target, number - 1, -1):
                reachable[current_sum] = (
                    reachable[current_sum]
                    or reachable[current_sum - number]
                )

            if reachable[target]:
                return True

        return reachable[target]
```

## 为什么金额必须逆序

当前元素只能使用一次。逆序更新时，`reachable[current_sum - number]` 仍然是处理当前元素之前的旧状态。

如果正序更新，刚刚由当前元素得到的状态可能在同一轮再次被使用，相当于一件物品被选多次，错误地变成完全背包。

## 为什么某个数字大于目标可以直接失败

数组元素均为正数。如果某个元素大于总和的一半：

- 它无法放入目标子集；
- 剩余所有元素的总和小于它，也无法单独组成另一半。

因此不可能分成等和两组。

## 正确性说明

初始只有和为零可达。处理数字 `number` 时，每个目标和有“不选它”与“选择它”两种可能，逆序转移分别由旧的当前状态和旧的 `current_sum - number` 状态表示，且保证当前数字最多使用一次。归纳处理全部元素后，`reachable[target]` 当且仅当存在和为一半总和的子集，也就当且仅当原数组可以等和分割。

## 复杂度

- 时间复杂度：`O(n · target)`。
- 空间复杂度：`O(target)`。

## 边界用例

| 输入 | 预期 | 检查点 |
|---|---|---|
| `[1,5,11,5]` | `True` | 基础可分 |
| `[1,2,3,5]` | `False` | 总和为奇数 |
| `[2,2]` | `True` | 最小配对 |
| `[1,2,5]` | `False` | 大元素超过一半 |
| `[3,3,3,4,5]` | `True` | 多元素组合 |

## 90 秒面试表达

“先求总和，奇数直接失败；偶数时问题等价于能否选出和为一半的子集。定义一维布尔数组表示目标和是否可达，初始只有 0 可达。每个数字只能使用一次，所以目标和必须从大到小更新，避免当前数字在同一轮被重复使用。这是标准 0/1 背包，时间 `O(n·target)`、空间 `O(target)`。”

## 常见追问

- 每个数字可无限使用时，改为正序更新，成为完全背包。
- 要返回具体子集，需要保存二维状态或额外记录前驱。
- 如果含负数，简单的非负下标背包不再适用，需要集合状态或偏移量。
