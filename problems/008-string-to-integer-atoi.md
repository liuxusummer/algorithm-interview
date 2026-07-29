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

### 示例

```text
输入：s = "   -42abc"
输出：-42
解释：跳过前导空格和负号，读取连续数字 42，遇到 a 后停止。
```

### 约束观察

- 只跳过前导空格，数字后的字符会让解析立即停止；
- 符号只能出现一次，并且必须位于数字前；
- 题目中的数字字符是 ASCII `0` 到 `9`；
- 结果必须限制在 32 位有符号整数范围内。

## 先说直接转换

Python 的 `int()` 会接受与题目不同的格式，也无法直接表达“遇到第一个非法字符停止”的规则。正则可以匹配前缀，但面试更希望看到按阶段解析和溢出处理。

## 分阶段模拟

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
        while index < n and "0" <= s[index] <= "9":
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

## 边界用例

| 输入 | 输出 | 检查点 |
|---|---:|---|
| `"42"` | `42` | 普通正数 |
| `"words and 987"` | `0` | 首个有效位置不是数字 |
| `"+-12"` | `0` | 重复符号 |
| `"91283472332"` | `2147483647` | 正溢出截断 |
| `"-91283472332"` | `-2147483648` | 负溢出截断 |

## 90 秒面试表达

我按语法顺序做一次线性扫描：先跳过前导空格，再读取可选符号，最后读取连续的 ASCII 数字。累积每一位之前，用 `(limit-digit)//10` 判断乘十加当前数字是否会越界，避免依赖更大整数类型。遇到第一个非法字符就停止，时间 `O(n)`、空间 `O(1)`。

## 常见追问

- 负数范围比正数多一个绝对值：`-2³¹` 合法，而 `2³¹` 不合法；
- 不建议使用 `.isdigit()`，它还会接受部分非 ASCII Unicode 数字；
- 如果没有读到任何数字，累积值保持为 `0`。
