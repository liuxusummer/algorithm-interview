# 179 · 最大数

<ProblemMeta
  :tags="['华为面试题', '排序与堆', '自定义排序']"
  difficulty="medium"
  :appearances="9"
  pass-rate="45%"
  source-url="https://leetcode.cn/problems/largest-number/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n log n · k)" space="O(nk)" />

## 题目

给定一组非负整数，重新排列它们的顺序，使拼接得到的整数最大。结果可能很大，请以字符串返回。

## 思路

比较两个字符串 `a`、`b` 时，不比较数值大小，而比较 `a + b` 和 `b + a`。如果前者更大，`a` 就应排在 `b` 前面。

## Python 实现

```python
from functools import cmp_to_key
from typing import List


class Solution:
    def largestNumber(self, nums: List[int]) -> str:
        values = list(map(str, nums))

        def compare(a: str, b: str) -> int:
            # 拼接结果更大的字符串应排在前面
            if a + b > b + a:
                return -1
            if a + b < b + a:
                return 1
            return 0

        values.sort(key=cmp_to_key(compare))
        result = "".join(values)

        # 多个 0 拼接后统一返回 "0"
        return "0" if result[0] == "0" else result
```

## 正确性说明

若相邻元素 `a`、`b` 满足 `a+b < b+a`，交换它们会使整体拼接结果更大。因此按该比较规则排序后不存在可以改善答案的相邻逆序对，得到的拼接结果最大。

## 复杂度

- 时间：`O(n log n · k)`，`k` 为数字字符串平均长度
- 空间：`O(nk)`

## 易错点

输入全为零时不能返回 `"00"` 或 `"000"`，需要归一化为 `"0"`。
