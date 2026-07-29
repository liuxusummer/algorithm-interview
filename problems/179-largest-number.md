# 179 · 最大数

<ProblemMeta
  :tags="['华为面试题', '排序与堆', '自定义排序']"
  difficulty="medium"
  :appearances="9"
  pass-rate="45%"
  source-url="https://leetcode.cn/problems/largest-number/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n log n · k)" space="O(nk)" />

## 题目

给定一组非负整数，重新排列它们的顺序，使拼接得到的整数最大。结果可能很大，请以字符串返回。

### 示例

```text
输入：nums = [3, 30, 34, 5, 9]
输出："9534330"
解释："9"、"5"、"34"、"3"、"30" 按拼接比较规则排列。
```

### 约束观察

- 输入数组至少包含一个非负整数；
- 单看数值大小或字符串字典序都会出错，例如 `3` 应排在 `30` 前；
- 结果可能超过整数范围，整个过程都应使用字符串。

## 先说错误直觉

直接按整数从大到小排序会把 `30` 放在 `3` 前面，但 `"303"` 小于 `"330"`。真正需要比较的是两个数在不同先后顺序下形成的整体结果。

## 优化抓手

比较两个字符串 `a`、`b` 时，不比较数值大小，而比较 `a + b` 和 `b + a`。如果前者更大，`a` 就应排在 `b` 前面。

## Python 实现

```python
from functools import cmp_to_key
from typing import List


class Solution:
    def largestNumber(self, nums: List[int]) -> str:
        values = list(map(str, nums))
        if not values:
            return ""

        def compare(a: str, b: str) -> int:
            # 拼接结果更大的字符串应排在前面
            if a + b > b + a:
                return -1
            if a + b < b + a:
                return 1
            return 0

        values.sort(key=cmp_to_key(compare))
        result = "".join(values)

        # 多个 0 拼接后统一返回 "0"
        return "0" if result[0] == "0" else result
```

## 正确性说明

若相邻元素 `a`、`b` 满足 `a+b < b+a`，交换它们会使整体拼接结果更大。因此按该比较规则排序后不存在可以改善答案的相邻逆序对，得到的拼接结果最大。

## 复杂度

- 时间：`O(n log n · k)`，`k` 为数字字符串平均长度
- 空间：`O(nk)`

## 边界用例

| 输入 | 输出 | 检查点 |
|---|---|---|
| `[10, 2]` | `"210"` | 不能按数值升序 |
| `[3, 30]` | `"330"` | 比较拼接顺序 |
| `[0, 0]` | `"0"` | 多个零需要归一化 |
| `[121, 12]` | `"12121"` | 前缀相同时仍要比较完整拼接 |

## 90 秒面试表达

我把数字转成字符串，并定义比较规则：如果 `a+b` 大于 `b+a`，`a` 就排在 `b` 前面。按这个规则排序后拼接即可。证明可以用相邻交换：任何不满足规则的相邻对交换后都会让整体结果更大，因此最终无可改善的逆序对。最后把全零结果压缩成单个 `"0"`。

## 常见追问

- 为什么比较规则可用于排序：它定义了拼接结果的相对优先级，可用相邻交换论证；
- 为什么不转回整数：结果可能非常大；
- 输入全为零时不能返回 `"00"` 或 `"000"`。
