# 443 · 压缩字符串

<ProblemMeta
  :tags="['腾讯面试题', '字符串', '双指针']"
  difficulty="medium"
  :appearances="13"
  pass-rate="51%"
  source-url="https://leetcode.cn/problems/string-compression/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(1)" />

## 题目

给定字符数组 `chars`，使用以下规则原地压缩：

- 连续相同字符只保留一个字符；
- 连续次数大于 1 时，紧随其后写入次数的每一位数字；
- 返回压缩后的新长度。

只需保证数组前 `new_length` 个位置是压缩结果。

### 示例

```text
输入：["a", "a", "b", "b", "c", "c", "c"]
输出：6
解释：原数组前六位被改为 ["a", "2", "b", "2", "c", "3"]。
```

## 读写双指针

`read` 扫描每一段连续相同字符，`write` 指向下一个写入位置：

1. 记录当前段起点；
2. 向右找到第一个不同字符，得到段长度；
3. 写入字符；
4. 段长度大于 1 时，把十进制次数逐字符写入。

由于每一段压缩后长度不会超过原段长度，写指针不会越过尚未读取的数据。

## Python 实现

```python
class Solution:
    def compress(self, chars: list[str]) -> int:
        write = 0
        read = 0

        while read < len(chars):
            group_start = read
            character = chars[read]

            while (
                read < len(chars)
                and chars[read] == character
            ):
                read += 1

            chars[write] = character
            write += 1
            group_length = read - group_start

            if group_length > 1:
                # 次数可能有多位，必须按十进制字符逐个写入。
                for digit in str(group_length):
                    chars[write] = digit
                    write += 1

        return write
```

## 为什么只压缩连续字符

题目按连续段编码。`["a", "b", "a"]` 中两个 `"a"` 不相邻，必须分别保留，不能合并成 `"a2b"`。

## 正确性说明

外层循环每次完整读取一个极大的连续相同字符段。算法先写入该段唯一字符，再在段长大于一时写入准确的十进制长度，这正是题目规定的编码。

所有连续段按原顺序处理且互不重叠，所以数组前 `write` 个字符恰好是完整压缩结果，返回长度正确。

## 复杂度

- 时间复杂度：`O(n)`，读指针单调向右；
- 额外空间复杂度：`O(1)`，十进制次数最多是输入长度的位数，按题目口径视为常数辅助空间。

## 边界用例

| 输入 | 压缩结果 |
|---|---|
| `["a"]` | `["a"]` |
| `["a","b"]` | `["a","b"]` |
| 12 个 `"a"` | `["a","1","2"]` |
| `["a","a","b"]` | `["a","2","b"]` |

## 90 秒面试表达

“我用读写双指针。读指针每次找到一段连续相同字符的结束位置，写指针先写字符，段长大于 1 时再把次数转成十进制字符逐位写入。每段压缩结果不会比原段更长，所以原地覆盖是安全的。读指针只向右，时间 `O(n)`、额外空间 `O(1)`。”

## 常见追问

- 次数 `12` 必须写成字符 `"1"`、`"2"`；
- 单个字符不能附加 `"1"`；
- 若要求解压，需要根据字符后的连续数字解析完整次数。
