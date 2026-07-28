# 224 · 基本计算器

<ProblemMeta
  :tags="['腾讯面试题', '栈', '字符串']"
  difficulty="hard"
  :appearances="15"
  pass-rate="100%"
  source-url="https://leetcode.cn/problems/basic-calculator/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(n)" />

## 题目

给定一个合法表达式字符串 `s`，其中包含非负整数、空格、加号、减号和括号，计算并返回表达式的值。

不能调用可以直接执行字符串表达式的内置函数。

### 示例

```text
输入：s = "(1+(4+5+2)-3)+(6+8)"
输出：23
```

## 核心思路

括号外只存在加减法，可以边扫描边把“符号 × 当前数字”累加到 `result`。

遇到左括号时，把外层的：

```text
累计结果、括号前符号
```

依次压栈，然后从零开始计算括号内部。遇到右括号时，先结算括号内最后一个数字，再把整个括号结果乘外层符号并加回外层累计值。

## Python 实现

```python
class Solution:
    def calculate(self, s: str) -> int:
        result = 0
        number = 0
        sign = 1
        stack: list[int] = []

        for character in s:
            if character.isdigit():
                number = number * 10 + int(character)
            elif character in "+-":
                # 一个运算符到来时，前一个完整数字才可以结算。
                result += sign * number
                number = 0
                sign = 1 if character == "+" else -1
            elif character == "(":
                # 保存外层环境：先累计值，再保存括号前符号。
                stack.append(result)
                stack.append(sign)
                result = 0
                number = 0
                sign = 1
            elif character == ")":
                result += sign * number
                number = 0

                outer_sign = stack.pop()
                outer_result = stack.pop()
                result = outer_result + outer_sign * result

        # 表达式末尾没有运算符，最后一个数字需单独结算。
        return result + sign * number
```

## 一元负号为什么也能处理

表达式开头或左括号后的 `-` 会在 `number = 0` 时触发结算，结果不变，只把 `sign` 设为 `-1`。因此 `-2+1`、`1-(-2)` 等合法表达式都能按同一逻辑处理。

## 正确性说明

在同一括号层内，`result` 保存已经完整读完的所有项之和，`sign` 是当前数字前的符号，`number` 是正在读取的数字。

遇到括号时保存外层环境，括号内部独立计算；右括号把完整子表达式视为一个数字，乘括号前符号后合并回外层。栈按嵌套顺序恢复环境，因此任意层括号都能正确求值。

## 复杂度

- 时间复杂度：`O(n)`，每个字符扫描一次；
- 空间复杂度：`O(n)`，最坏情况下括号全部嵌套。

## 边界用例

| 输入 | 输出 |
|---|---:|
| `"1 + 1"` | `2` |
| `"-2+1"` | `-1` |
| `"1-(2+3)"` | `-4` |
| `"1-(-2)"` | `3` |
| `"((10))"` | `10` |

## 90 秒面试表达

“表达式只有加减法，所以我用 `result` 累加已完成项，用 `number` 读取多位数，用 `sign` 保存当前项符号。左括号时把外层结果和符号压栈，括号内从零计算；右括号时结算内部，再乘外层符号并加回外层结果。每个字符只处理一次，时间 `O(n)`，栈空间 `O(n)`。”

## 常见追问

- 加入乘除法后，需要额外维护上一项或使用运算符栈；
- 逆波兰表达式可直接用数值栈求值；
- 面试时要说明输入表达式合法，避免把语法校验与求值逻辑混在一起。
