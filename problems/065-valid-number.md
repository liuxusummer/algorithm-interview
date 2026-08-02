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

### 示例

```text
输入：s = "2e10"
输出：true
解释：底数 2 和指数 10 都合法。

输入：s = "99e2.5"
输出：false
解释：指数部分不能包含小数点。
```

### 约束观察

- 数字字符限定为 ASCII `0` 到 `9`；
- 小数点只能出现在指数前，且最多一次；
- 指数前必须已有数字，指数后也必须至少有一位数字；
- 正负号只能出现在字符串开头或紧跟 `e/E`。

## 先说拆分判断

可以先按 `e/E` 拆分，再分别判断底数和指数是否合法，但仍要处理空串、符号和小数点边界。一次扫描配合状态变量更容易保证所有字符只处理一次。

## 状态压缩

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
            if "0" <= char <= "9":
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

### 关键状态变化

| 读到的字符 | 合法条件 | 状态变化 |
|---|---|---|
| 数字 | 始终可读 | `seen_digit = True` |
| `+/-` | 位于开头或紧跟 `e/E` | 不改变数字状态 |
| `.` | 未出现过点，且尚未进入指数 | `seen_dot = True` |
| `e/E` | 前面已有数字，且未出现过指数 | 指数后数字状态重置为 `False` |

## 复杂度

- 时间：`O(n)`
- 空间：`O(1)`

## 边界用例

| 输入 | 结果 | 原因 |
|---|---|---|
| `"."` | `False` | 没有数字 |
| `"3."` | `True` | 小数点后可以没有数字 |
| `".1"` | `True` | 小数点前可以没有数字 |
| `"1e"` | `False` | 指数后缺少数字 |
| `"6e-1"` | `True` | 指数可以带符号 |
| `"1e1e1"` | `False` | 指数只能出现一次 |

## 90 秒面试表达

我线性扫描并维护是否见过数字、小数点和指数。符号只能在开头或指数后，小数点只能出现一次且不能在指数后，指数必须在已有数字之后出现。读到指数时把“指数后是否有数字”重置，最终要求整体出现过数字，并且指数后也有数字。这样不用复杂正则，时间 `O(n)`、空间 `O(1)`。

## 常见追问

- 也可以显式编写有限状态机；布尔状态是对相同转移规则的压缩；
- 不使用 `.isdigit()`，避免意外接受非 ASCII 数字；
- 若题目明确不允许首尾空格，应删除 `strip()`，让空格直接判为非法。
