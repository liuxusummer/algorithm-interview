# 128 · 最长连续序列

<ProblemMeta
  :tags="['Hot100', '大厂面试', '哈希表', '数组']"
  difficulty="medium"
  :appearances="93"
  pass-rate="56%"
  source-url="https://leetcode.cn/problems/longest-consecutive-sequence/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(n)" />

## 题目

在未排序数组中找出最长连续整数序列的长度，要求平均 `O(n)` 时间。

排序可以做到 `O(n log n)`。要达到线性时间，把所有数字放入集合，并且只从序列起点开始向右扩展。

## Python 实现

```python
from typing import List


class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        values = set(nums)
        answer = 0

        for value in values:
            # value - 1 存在时，value 不是序列起点，跳过它。
            if value - 1 in values:
                continue

            current = value
            length = 1
            while current + 1 in values:
                current += 1
                length += 1

            answer = max(answer, length)

        return answer
```

## 为什么不是 O(n²)

只有满足 `value - 1` 不存在的数字才启动扫描，所以每个连续序列只会被完整扫描一次。所有 `while` 循环累计访问的数字不超过集合大小，总时间平均为 `O(n)`。

## 正确性说明

每条连续序列都有唯一最小值，算法必从这个起点扫描到序列末端；非起点全部跳过。因此每条序列长度都被准确计算一次，最大值就是答案。

## 边界用例

| 输入 | 输出 | 检查点 |
|---|---:|---|
| `[]` | `0` | 空数组 |
| `[1,2,0,1]` | `3` | 重复数字 |
| `[100,4,200,1,3,2]` | `4` | 无序输入 |

## 面试表达

“排序会超过题目要求。我用集合提供 `O(1)` 平均查询，只从前驱不存在的数字启动扩展。这样每条连续段只扫描一次，总时间 `O(n)`，空间 `O(n)`。”
