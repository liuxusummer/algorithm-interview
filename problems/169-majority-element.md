# 169 · 多数元素

<ProblemMeta
  :tags="['Hot100', '华为面试题', '普通数组与矩阵', '摩尔投票']"
  difficulty="easy"
  :appearances="3"
  pass-rate="72%"
  source-url="https://leetcode.cn/problems/majority-element/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(1)" />

## 题目

给定长度为 `n` 的数组，找出出现次数严格超过 `n / 2` 的元素。题目保证该元素存在。

## 思路

使用 Boyer–Moore 投票：相同元素互相支持，不同元素两两抵消。由于多数元素比所有其他元素之和还多，最终候选者一定是多数元素。

## Python 实现

```python
from typing import List


class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        candidate = None
        votes = 0

        for number in nums:
            if votes == 0:
                # 前面的票已完全抵消，重新选择候选者
                candidate = number
            votes += 1 if number == candidate else -1

        return candidate
```

## 正确性说明

删除任意一对不同元素不会改变多数元素。投票过程等价于不断做这种抵消；因为多数元素出现次数超过其余元素总数，最终剩余候选者必然是多数元素。

## 复杂度

- 时间：`O(n)`
- 空间：`O(1)`

## 常见追问

若题目不保证多数元素存在，需要再扫描一次验证候选者的实际出现次数。
