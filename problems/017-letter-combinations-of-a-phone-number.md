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

### 示例

```text
输入：digits = "23"
输出：["ad","ae","af","bd","be","bf","cd","ce","cf"]
```

### 约束观察

- 每一位数字有 `3` 或 `4` 个可选字母；
- 组合必须为每一位数字选择恰好一个字母；
- 输入只包含 `2` 到 `9`，不需要处理 `0`、`1` 或非法字符。

## 先说多重循环

数字位数固定时可以写多层循环，但输入长度变化就需要不断增加循环层数。回溯把“第几层循环”抽象为递归下标，更适合可变长度输入。

## 回溯思路

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

### `"23"` 的搜索树

```text
          ""
      /    |    \
     a     b     c
   / | \ / | \ / | \
  ad ae af bd be bf cd ce cf
```

## 复杂度

- 时间：最坏 `O(4ⁿ · n)`，生成答案字符串需要 `O(n)`
- 递归空间：`O(n)`，不计输出

## 边界用例

| 输入 | 输出规模 | 检查点 |
|---|---:|---|
| `""` | `0` | 空输入返回空列表 |
| `"2"` | `3` | 单层选择 |
| `"7"` | `4` | 数字 `7` 对应四个字母 |
| `"79"` | `16` | 两位均有四个选择 |

## 90 秒面试表达

每一位数字都是回溯树的一层，当前层枚举它对应的所有字母。选择一个字母后递归下一位，到达末尾就收集完整路径，再撤销选择尝试同层其他分支。这样每条根到叶路径对应一个且仅一个合法组合。最坏有 `4ⁿ` 个结果，构造字符串还需要 `O(n)`。

## 常见追问

- 空输入应返回 `[]`，而不是包含空字符串的列表；
- `7` 和 `9` 各有四个字母，复杂度上界按 `4ⁿ` 计算；
- 若只要求组合数量，可以直接累乘每一位的选项数，无需生成结果。
