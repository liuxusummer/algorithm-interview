# 415 · 字符串相加

<ProblemMeta
  :tags="['字节面试题', '模拟', '字符串']"
  difficulty="medium"
  :appearances="17"
  pass-rate="42%"
  source-url="https://leetcode.cn/problems/add-strings/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(max(m, n))" space="O(max(m, n))" />

## 题目

给定两个以字符串表示的非负整数 `num1` 和 `num2`，返回它们的和，结果仍然使用字符串表示。

不能使用处理大整数的内置库，也不能把整个输入字符串直接转换为整数。

### 示例

```text
输入：num1 = "11", num2 = "123"
输出："134"
```

```text
输入：num1 = "456", num2 = "77"
输出："533"
```

### 约束观察

- 加法从最低位开始，因此要从字符串末尾向前遍历。
- 两个字符串长度可能不同，较短一侧缺失位按 `0` 处理。
- 最后一次相加后可能仍有进位，例如 `"9" + "1" = "10"`。

## 错误捷径

```python
return str(int(num1) + int(num2))
```

这个写法违反题目限制，而且在使用定长整数的语言中可能溢出。正确做法是模拟竖式加法，只处理单个数字。

## 优化抓手

用两个指针分别指向字符串末尾，每轮计算：

```text
total = first_digit + second_digit + carry
当前结果位 = total % 10
新的进位 = total // 10
```

计算出的数字从低位到高位产生，先放入列表，最后统一反转并拼接。

## Python 实现

```python
class Solution:
    def addStrings(self, num1: str, num2: str) -> str:
        first_index = len(num1) - 1
        second_index = len(num2) - 1
        carry = 0
        reversed_digits: list[str] = []

        while first_index >= 0 or second_index >= 0 or carry:
            first_digit = 0
            if first_index >= 0:
                first_digit = ord(num1[first_index]) - ord("0")

            second_digit = 0
            if second_index >= 0:
                second_digit = ord(num2[second_index]) - ord("0")

            total = first_digit + second_digit + carry
            reversed_digits.append(str(total % 10))
            carry = total // 10

            first_index -= 1
            second_index -= 1

        return "".join(reversed(reversed_digits))
```

## 为什么循环条件包含 `carry`

两个字符串都处理完后，仍可能有最高位进位。例如：

```text
99 + 1
```

处理完输入数字时 `carry = 1`，还需要再循环一次，把最高位 `1` 写入结果。

## 为什么不在字符串头部反复拼接

Python 字符串不可变。如果每次执行：

```python
result = digit + result
```

都需要复制已有内容，整体可能退化到 `O(n²)`。先把字符追加到列表，最后反转拼接可以保持线性复杂度。

## 正确性说明

每轮处理相同十进制位的两个数字和上一位进位，写入 `total % 10`，并把 `total // 10` 传给更高位，这与竖式加法完全一致。缺失数字按零处理，循环在两侧数字和最终进位都处理完后结束，因此返回字符串就是完整的十进制和。

## 复杂度

- 时间复杂度：`O(max(m, n))`。
- 空间复杂度：`O(max(m, n))`，用于保存结果字符。

## 边界用例

| `num1` | `num2` | 预期 | 检查点 |
|---|---|---|---|
| `"11"` | `"123"` | `"134"` | 长度不同 |
| `"456"` | `"77"` | `"533"` | 连续进位 |
| `"0"` | `"0"` | `"0"` | 两个零 |
| `"9"` | `"1"` | `"10"` | 最高位进位 |
| `"999"` | `"1"` | `"1000"` | 多位连续进位 |

## 90 秒面试表达

“题目不允许把整个字符串转成整数，所以我模拟竖式加法。两个指针从字符串末尾开始，每轮读取一个数字，加上上一位进位；当前位是总和模 10，新进位是整除 10。较短字符串缺失位置按零处理，循环条件还要包含进位，避免漏掉最高位。结果按低位到高位产生，先追加到列表，最后反转拼接。时间和空间都是 `O(max(m, n))`。”

## 常见追问

- 字符串相减需要先比较大小，并处理借位。
- 字符串相乘可以模拟每一位乘法，用长度 `m + n` 的数组累加。
- 如果输入允许前导零，返回前应去掉多余前导零并保留至少一个零。
