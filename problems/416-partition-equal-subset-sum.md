# 416 · 分割等和子集

<ProblemMeta
  :tags="['Hot100', '大厂面试', '0/1 背包']"
  difficulty="medium"
  :appearances="17"
  pass-rate="54%"
  source-url="https://leetcode.cn/problems/partition-equal-subset-sum/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n · target)" space="O(n · target) → O(target)" />

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

先定义完整二维状态：

```text
dp[i][current_sum] =
能否用前 i 个数字组成 current_sum
```

处理第 `i` 个数字 `number` 时，可以不选或选择它：

```text
dp[i][current_sum] =
dp[i - 1][current_sum]
or dp[i - 1][current_sum - number]
```

第二项只在 `current_sum >= number` 时存在。

## 二维 DP 实现（基础版）

```python
class Solution:
    def canPartition(self, nums: list[int]) -> bool:
        total = sum(nums)

        if total % 2 == 1:
            return False

        target = total // 2
        count = len(nums)
        dp = [[False] * (target + 1) for _ in range(count + 1)]

        # 不选择任何数字时，只有和为 0 可以组成。
        for i in range(count + 1):
            dp[i][0] = True

        for i in range(1, count + 1):
            number = nums[i - 1]

            for current_sum in range(1, target + 1):
                # 不选择当前数字。
                dp[i][current_sum] = dp[i - 1][current_sum]

                # 选择当前数字，剩余和必须由前 i - 1 个数字组成。
                if current_sum >= number:
                    dp[i][current_sum] = (
                        dp[i][current_sum]
                        or dp[i - 1][current_sum - number]
                    )

        return dp[count][target]
```

二维表中每一行只从上一行转移，所以能清楚证明每个数字最多使用一次。

## 空间优化：压缩成一行

二维状态的当前行只依赖上一行，可以改用 `reachable[current_sum]` 表示“用已经处理过的数字能否组成该和”。压缩后必须倒序更新，才能让右侧状态继续读取上一行数据。

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

            # 倒序更新，确保每个数字在 0/1 背包中只使用一次。
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

## 复杂度对比

- 二维基础版：时间 `O(n · target)`，空间 `O(n · target)`；
- 一维优化版：时间 `O(n · target)`，空间 `O(target)`。

## 边界用例

| 输入 | 预期 | 检查点 |
|---|---|---|
| `[1,5,11,5]` | `True` | 基础可分 |
| `[1,2,3,5]` | `False` | 总和为奇数 |
| `[2,2]` | `True` | 最小配对 |
| `[1,2,5]` | `False` | 大元素超过一半 |
| `[3,3,3,4,5]` | `True` | 多元素组合 |

## 90 秒面试表达

“先求总和，奇数直接失败；偶数时转成容量为一半总和的 0/1 背包。基础二维状态表示前 `i` 个数字能否组成指定和，当前数字有选与不选两种来源，时间、空间都是 `O(n·target)`。确认当前行只依赖上一行后压成一维；因为每个数字只能使用一次，目标和必须倒序更新，空间降到 `O(target)`。”

## 常见追问

- 每个数字可无限使用时，改为正序更新，成为完全背包。
- 要返回具体子集，需要保存二维状态或额外记录前驱。
- 如果含负数，简单的非负下标背包不再适用，需要集合状态或偏移量。
