# 065 · 有效数字

<ProblemMeta
  :tags="['华为面试题', '字符串', '状态机']"
  difficulty="hard"
  :appearances="3"
  pass-rate="33%"
  source-url="https://leetcode.cn/problems/valid-number/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(1)" />

## 题目

判断字符串是否表示有效十进制数。字符串可以包含符号、小数点和科学计数法指数，但它们必须出现在合法位置。

## 思路

线性扫描并维护三个状态：是否见过数字、是否见过小数点、是否见过指数。指数出现后必须重新看到至少一个数字，因此额外记录 `digit_after_exponent`。

## Python 实现

```python
class Solution:
    def isNumber(self, s: str) -> bool:
        s = s.strip()
        seen_digit = False
        seen_dot = False
        seen_exponent = False
        digit_after_exponent = True

        for index, char in enumerate(s):
            if char.isdigit():
                seen_digit = True
                digit_after_exponent = True
            elif char in "+-":
                # 符号只能位于开头，或紧跟在 e/E 后面
                if index > 0 and s[index - 1] not in "eE":
                    return False
            elif char == ".":
                # 指数部分不能出现小数点，且小数点最多一个
                if seen_dot or seen_exponent:
                    return False
                seen_dot = True
            elif char in "eE":
                # 指数前必须已有数字，且指数只能出现一次
                if seen_exponent or not seen_digit:
                    return False
                seen_exponent = True
                digit_after_exponent = False
            else:
                return False

        return seen_digit and digit_after_exponent
```

## 正确性说明

各状态精确限制了符号、小数点和指数的合法位置。最终既要求整个字符串至少含一个数字，也要求指数后存在数字，因此接受且仅接受合法数字格式。

## 复杂度

- 时间：`O(n)`
- 空间：`O(1)`

## 常见追问

也可以显式编写有限状态机；本实现用布尔状态压缩了相同的转移规则，更适合面试现场书写。
