# 227 · 基本计算器 II

<ProblemMeta
  :tags="['Hot100', '大厂面试', '栈', '字符串模拟']"
  difficulty="medium"
  :appearances="69"
  pass-rate="46%"
  source-url="https://leetcode.cn/problems/basic-calculator-ii/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(n)" />

## 题目

计算只包含非负整数、空格和 `+ - * /` 的合法表达式。除法向零截断，不能使用 `eval`。

## 延迟处理当前数字

扫描过程中保存上一个运算符 `operator`。当遇到新运算符或字符串末尾时，说明当前数字已经读完，此时用“上一个运算符”处理它：

- `+/-`：带符号压栈；
- `*//`：立即与栈顶合并。

这样乘除法会先计算，最后把栈中各项相加即可。

## Python 实现

```python
class Solution:
    def calculate(self, s: str) -> int:
        stack: list[int] = []
        number = 0
        operator = "+"

        for index, character in enumerate(s):
            if character.isdigit():
                number = number * 10 + int(character)

            # 读到运算符或末尾时，结算前一个运算符控制的数字。
            if (not character.isdigit() and character != " ") or index == len(s) - 1:
                if operator == "+":
                    stack.append(number)
                elif operator == "-":
                    stack.append(-number)
                elif operator == "*":
                    stack[-1] *= number
                else:
                    # int(a / b) 按题意向零截断；// 对负数会向下取整。
                    stack[-1] = int(stack[-1] / number)

                operator = character
                number = 0

        return sum(stack)
```

## 正确性说明

栈中保存已经完成乘除运算的加减项。遇到乘除时立即与最近一项结合，等价于优先计算高优先级运算；加减则开启新项。扫描结束后所有项均已完成，求和就是表达式值。

## 复杂度与边界

- 时间 `O(n)`；栈最坏保存全部加减项，空间 `O(n)`。
- 多位数、连续空格、末尾数字均由统一结算逻辑处理。
- 题目保证除数非零且表达式合法。

## 与 224 的区别

227 有乘除但没有括号，核心是运算符优先级；224 有括号但只有加减，核心是保存和恢复外层计算环境。
