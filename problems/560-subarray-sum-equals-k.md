# 560 · 和为 K 的子数组

<ProblemMeta
  :tags="['Hot100', '大厂面试', '前缀和']"
  difficulty="medium"
  :appearances="11"
  pass-rate="36%"
  source-url="https://leetcode.cn/problems/subarray-sum-equals-k/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(n)" />

## 题目

给定一个整数数组 `nums` 和一个整数 `k`，请统计并返回数组中元素和等于 `k` 的连续子数组个数。

子数组必须连续且不能为空；不同起止位置视为不同子数组。

### 示例一

```text
输入：nums = [1, 1, 1], k = 2
输出：2
解释：[1, 1] 分别出现在下标区间 [0, 1] 和 [1, 2]
```

### 示例二

```text
输入：nums = [1, 2, 3], k = 3
输出：2
解释：满足条件的连续子数组是 [1, 2] 和 [3]
```

### 约束观察

- 题目统计的是子数组数量，不是返回某一个区间。
- 数组可能包含负数，窗口和不会随右指针单调变化。
- 因此常规滑动窗口不能保证正确，需要记录不同位置的前缀和。

## 先说暴力解

枚举每个起点，再向右累加直到数组末尾。只要当前区间和等于 `k` 就把答案加一。

```python
def subarray_sum_brute_force(nums: list[int], k: int) -> int:
    count = 0

    for start in range(len(nums)):
        # 固定左端点后累加右端点，枚举所有连续子数组。
        current_sum = 0

        for end in range(start, len(nums)):
            current_sum += nums[end]
            if current_sum == k:
                count += 1

    return count
```

它避免了重复计算每个区间的总和，但仍需要枚举 `O(n²)` 个区间。

## 优化抓手

设 `prefix[i]` 表示从数组开头到当前位置的元素和。下标区间 `(j, i]` 的和为：

```text
prefix[i] - prefix[j]
```

要让这个区间和等于 `k`：

```text
prefix[i] - prefix[j] = k
prefix[j] = prefix[i] - k
```

因此遍历到当前前缀和 `prefix[i]` 时，只需查询此前出现过多少次 `prefix[i] - k`。每一次出现都对应一个不同起点，也就对应一个满足条件的连续子数组。

## Python 实现

```python
class Solution:
    def subarraySum(self, nums: list[int], k: int) -> int:
        prefix_frequency: dict[int, int] = {0: 1}
        prefix_sum = 0
        count = 0

        for value in nums:
            prefix_sum += value

            # 若之前出现过 prefix_sum - k，就形成一个和为 k 的子数组。
            required_prefix = prefix_sum - k
            count += prefix_frequency.get(required_prefix, 0)

            prefix_frequency[prefix_sum] = (
                prefix_frequency.get(prefix_sum, 0) + 1
            )

        return count
```

## 为什么初始要放入 `0 → 1`

如果从数组开头到当前位置的元素和刚好等于 `k`，需要找到一个值为 `0` 的“前置前缀和”。在遍历开始前放入 `0 → 1`，相当于表示数组开始位置之前存在一个前缀和为零的位置。

例如 `nums = [3]`、`k = 3`。读到 `3` 时，`prefixSum - k = 0`，这条初始化记录让区间 `[0, 0]` 能被正确计数。

## 为什么记录频次而不是是否出现

同一个前缀和可能在多个位置出现。每个位置都能和当前下标组成不同的连续子数组，所以哈希表必须保存出现次数。

例如：

```text
nums = [0, 0], k = 0
```

满足条件的子数组有 `[0]`、第二个 `[0]` 和 `[0, 0]`，共 3 个。只记录“出现过”会漏掉答案。

## 正确性说明

遍历到每个位置时，哈希表包含当前位置之前所有前缀和及其出现次数。对于当前前缀和 `prefixSum`，任意一个值为 `prefixSum - k` 的历史前缀位置，都与当前位置唯一确定一个和为 `k` 的连续子数组。算法把这些频次全部加入答案，既不会漏掉合法区间，也不会重复统计同一个起止位置。

## 复杂度

- 时间复杂度：`O(n)`。每个元素只处理一次，哈希表查询和更新平均为 `O(1)`。
- 空间复杂度：`O(n)`。最坏情况下，所有前缀和互不相同。

## 边界用例

| 输入 | `k` | 预期 | 检查点 |
|---|---:|---:|---|
| `[1, 1, 1]` | 2 | 2 | 重叠子数组 |
| `[1, -1, 0]` | 0 | 3 | 负数与重复前缀和 |
| `[3]` | 3 | 1 | 从下标 0 开始 |
| `[0, 0]` | 0 | 3 | 前缀和频次 |
| `[]` | 0 | 0 | 空数组 |

## 90 秒面试表达

“暴力方法会枚举所有起点和终点，即使使用滚动累加也需要 `O(n²)`。这题允许负数，所以滑动窗口不具备单调性。对当前前缀和 `sum`，如果之前出现过前缀和 `sum - k`，两者之间的连续区间和就等于 `k`。我用哈希表记录每种前缀和出现的次数，遍历时先把 `sum - k` 的频次加入答案，再记录当前 `sum`。初始放入 `0 → 1`，用于统计从数组开头开始的合法区间。整体时间 `O(n)`，空间 `O(n)`。”

## 常见追问

- 如果数组元素全部为正数，可以考虑滑动窗口。
- 如果只需要判断是否存在某个区间，哈希集合即可，不需要保存频次。
- 如果要返回所有区间，需要保存“前缀和 → 所有历史下标”的映射，输出本身可能达到 `O(n²)`。
