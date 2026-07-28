# 043 · 字符串相乘

<ProblemMeta
  :tags="['腾讯面试题', '字符串', '模拟']"
  difficulty="medium"
  :appearances="20"
  pass-rate="51%"
  source-url="https://leetcode.cn/problems/multiply-strings/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(mn)" space="O(m + n)" />

## 题目

给定两个以字符串表示的非负整数 `num1` 和 `num2`，返回它们的乘积，结果也用字符串表示。

不能使用大整数库，也不能把整个字符串直接转换成整数。

### 示例

```text
输入：num1 = "123", num2 = "456"
输出："56088"
```

## 从竖式乘法到下标关系

长度分别为 `m`、`n` 的两个数相乘，结果最多有 `m + n` 位。

`num1[i]` 与 `num2[j]` 的乘积会影响结果数组的两个位置：

```text
高位：i + j
低位：i + j + 1
```

从低位向高位枚举每对数字，把乘积先加到低位，再将十位进位累加到高位。由于当前位置可能已经保存其他乘积的贡献，计算时必须一起处理。

## Python 实现

```python
class Solution:
    def multiply(self, num1: str, num2: str) -> str:
        if num1 == "0" or num2 == "0":
            return "0"

        result = [0] * (len(num1) + len(num2))

        for first_index in range(len(num1) - 1, -1, -1):
            first_digit = ord(num1[first_index]) - ord("0")

            for second_index in range(len(num2) - 1, -1, -1):
                second_digit = ord(num2[second_index]) - ord("0")
                high = first_index + second_index
                low = high + 1

                # low 中可能已有其他乘积，合并后统一处理进位。
                total = (
                    first_digit * second_digit
                    + result[low]
                )
                result[low] = total % 10
                result[high] += total // 10

        # 结果数组最多只有第一个位置可能是无效前导零。
        start = 1 if result[0] == 0 else 0
        return "".join(str(digit) for digit in result[start:])
```

## 为什么高位累加不会超过一位

内层循环从右向左处理。某一轮给 `result[high]` 加进位后，这个位置会在后续作为另一次计算的 `low`，届时会与新乘积一起执行 `% 10` 和 `// 10`，继续向左传递。因此最终每个位置都会被规范成单个数字。

## 正确性说明

竖式乘法会把每对数字的乘积放到由它们十进制位权决定的位置。算法按照 `i+j`、`i+j+1` 的对应关系累加每一对乘积，并完整传播进位，因此结果数组表示所有部分积之和。去掉唯一可能的前导零后，返回值就是两个输入数的十进制乘积。

## 复杂度

- 时间复杂度：`O(mn)`，枚举两字符串的每一对数字；
- 空间复杂度：`O(m+n)`，保存结果数字。

## 边界用例

| 输入 | 输出 | 检查点 |
|---|---|---|
| `"0"`, `"999"` | `"0"` | 零乘任何数 |
| `"2"`, `"3"` | `"6"` | 单位数 |
| `"9"`, `"9"` | `"81"` | 产生进位 |
| `"123"`, `"456"` | `"56088"` | 多个部分积 |

## 90 秒面试表达

“我模拟竖式乘法。长度 `m`、`n` 的乘积最多 `m+n` 位，数字 `i` 和 `j` 的乘积落在结果下标 `i+j` 与 `i+j+1`。从低位向高位枚举，乘积加上低位已有值，个位留在低位，十位累加到高位。最后去掉可能的首位零。时间 `O(mn)`，空间 `O(m+n)`。”

## 常见追问

- 字符串相加只需要双指针和一个进位；
- 超长整数相乘可进一步使用 Karatsuba 或 FFT；
- 不能在结果字符串头部反复拼接，否则可能产生额外的二次复杂度。
