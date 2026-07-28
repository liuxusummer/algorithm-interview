# 017 · 电话号码的字母组合

<ProblemMeta
  :tags="['Hot100', '华为面试题', '回溯']"
  difficulty="medium"
  :appearances="3"
  pass-rate="53%"
  source-url="https://leetcode.cn/problems/letter-combinations-of-a-phone-number/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(4ⁿ · n)" space="O(n)" />

## 题目

给定只包含数字 `2` 到 `9` 的字符串，按照电话按键上的字母映射，返回所有可能的字母组合。输入为空时返回空列表。

## 思路

每一位数字都是一次选择。使用回溯逐位添加对应字母，到达字符串末尾时收集一个完整组合。

## Python 实现

```python
from typing import List


class Solution:
    def letterCombinations(self, digits: str) -> List[str]:
        if not digits:
            return []

        letters = {
            "2": "abc", "3": "def", "4": "ghi", "5": "jkl",
            "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz",
        }
        answer = []
        path = []

        def backtrack(index: int) -> None:
            if index == len(digits):
                answer.append("".join(path))
                return

            for char in letters[digits[index]]:
                path.append(char)
                backtrack(index + 1)
                # 撤销当前选择，继续尝试同一层的其他字母
                path.pop()

        backtrack(0)
        return answer
```

## 正确性说明

回溯树的第 `i` 层枚举第 `i` 个数字对应的全部字母。每条根到叶路径恰好构成一个合法组合，且不同路径至少有一位不同，因此算法无遗漏、无重复地生成全部答案。

## 复杂度

- 时间：最坏 `O(4ⁿ · n)`，生成答案字符串需要 `O(n)`
- 递归空间：`O(n)`，不计输出

## 易错点

空输入应返回 `[]`，而不是包含空字符串的列表。
