# 008 · 字符串转换整数（atoi）

<ProblemMeta
  :tags="['华为面试题', '字符串', '模拟']"
  difficulty="medium"
  :appearances="4"
  pass-rate="40%"
  source-url="https://leetcode.cn/problems/string-to-integer-atoi/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(1)" />

## 题目

实现字符串转 32 位有符号整数：忽略前导空格，读取可选正负号和连续数字，遇到其他字符停止；若结果超出 `[-2³¹, 2³¹-1]`，返回对应边界值。

## 思路

按解析顺序模拟：跳过空格、读取符号、累积数字。加入新数字前判断是否会溢出，可以避免依赖更大整数类型。

## Python 实现

```python
class Solution:
    def myAtoi(self, s: str) -> int:
        index, n = 0, len(s)
        int_min, int_max = -(2**31), 2**31 - 1

        while index < n and s[index] == " ":
            index += 1

        sign = 1
        if index < n and s[index] in "+-":
            sign = -1 if s[index] == "-" else 1
            index += 1

        value = 0
        while index < n and s[index].isdigit():
            digit = ord(s[index]) - ord("0")

            # 在乘 10 之前判断正数上界，避免累积值溢出
            limit = int_max if sign == 1 else -int_min
            if value > (limit - digit) // 10:
                return int_max if sign == 1 else int_min

            value = value * 10 + digit
            index += 1

        return sign * value
```

## 正确性说明

算法只读取题目允许的最长数字前缀。`value` 始终等于已读取数字的数值；溢出判断在加入下一位前完成。未溢出时返回带符号结果，溢出时返回对应边界，符合所有解析规则。

## 复杂度

- 时间：`O(n)`
- 空间：`O(1)`

## 易错点

负数范围比正数多一个绝对值：`-2³¹` 合法，而 `2³¹` 不合法。
