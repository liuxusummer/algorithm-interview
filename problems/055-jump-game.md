# 055 · 跳跃游戏

<ProblemMeta
  :tags="['Hot100', '华为面试题', '贪心']"
  difficulty="medium"
  :appearances="7"
  pass-rate="49%"
  source-url="https://leetcode.cn/problems/jump-game/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(1)" />

## 题目

数组中每个元素表示从该位置最多可以向右跳多少步。判断能否从下标 `0` 到达最后一个下标。

## 思路

从左到右维护当前能够到达的最远位置。若遍历到的下标超过最远位置，说明中间出现了无法跨越的断点；否则用当前位置继续扩展最远边界。

## Python 实现

```python
from typing import List


class Solution:
    def canJump(self, nums: List[int]) -> bool:
        farthest = 0

        for index, step in enumerate(nums):
            if index > farthest:
                return False

            # 只关心所有可达位置能扩展出的最远边界
            farthest = max(farthest, index + step)
            if farthest >= len(nums) - 1:
                return True

        return True
```

## 正确性说明

遍历到 `index` 时，`farthest` 是此前所有可达位置能够到达的最远下标。若 `index > farthest`，该位置及其右侧都无法到达；否则将其跳跃能力纳入边界。边界覆盖末尾时即证明存在可行路径。

## 复杂度

- 时间：`O(n)`
- 空间：`O(1)`

## 易错点

题目问“能否到达”，不需要计算具体跳法，也不需要动态规划枚举所有前驱。
