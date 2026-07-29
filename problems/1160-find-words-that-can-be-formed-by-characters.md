# 1160 · 拼写单词

<ProblemMeta
  :tags="['华为面试题', '哈希表', '计数']"
  difficulty="easy"
  :appearances="3"
  pass-rate="66%"
  source-url="https://leetcode.cn/problems/find-words-that-can-be-formed-by-characters/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(C + W)" space="O(Σ)" />

## 题目

给定单词数组 `words` 和字符集合字符串 `chars`。如果一个单词中的每个字符都能由 `chars` 提供，并且每个字符只能使用一次，就称该单词可以被拼写。

返回所有可拼写单词的长度之和。

### 示例

```text
输入：words = ["cat", "bt", "hat", "tree"], chars = "atach"
输出：6
解释："cat" 和 "hat" 可以拼出，总长度为 3 + 3 = 6。
```

### 约束观察

- `chars` 对每个单词都是一份全新的库存，单词之间不会互相消耗字符；
- 仅判断字符是否出现不够，还必须比较出现次数；
- 字符集有限，使用计数表比逐字符删除更直接。

## 先说直观解

对每个单词复制一份 `chars`，逐个删除已经使用的字符。虽然容易理解，但字符串删除和查找都可能是线性的，整体会产生大量重复工作。

## 优化抓手

先统计 `chars` 中每个字符的可用次数。对每个单词再做一次计数，只要某个字符需求量超过可用量，该单词就不能拼写。

## Python 实现

```python
from collections import Counter


class Solution:
    def countCharacters(
        self,
        words: list[str],
        chars: str,
    ) -> int:
        available = Counter(chars)
        total_length = 0

        for word in words:
            required = Counter(word)

            # 每一种字符的需求都不能超过库存。
            if all(
                count <= available[character]
                for character, count in required.items()
            ):
                total_length += len(word)

        return total_length
```

## 正确性说明

一个单词可被拼写，当且仅当它对每个字符的需求次数都不超过 `chars` 的可用次数。代码逐字符验证这一充要条件，因此只会累加、也一定会累加所有可拼写单词。

## 复杂度

令 `C` 为 `chars` 长度，`W` 为所有单词字符总数：

- 时间复杂度为 `O(C + W)`；
- 字符种类数为 `Σ`，计数表占用 `O(Σ)` 空间。

## 边界用例

| `words` | `chars` | 输出 | 检查点 |
|---|---|---:|---|
| `["a"]` | `""` | `0` | 没有可用字符 |
| `["aa", "a"]` | `"a"` | `1` | 必须比较字符次数 |
| `["cat", "cat"]` | `"cat"` | `6` | 每个单词独立使用库存 |
| `[]` | `"abc"` | `0` | 空单词列表 |

## 90 秒面试表达

我先统计 `chars` 的字符库存。然后逐个统计单词的字符需求，只要每一种字符的需求量都不超过库存，这个单词就可以拼出并累加长度。库存不会被上一个单词消耗。总时间与输入字符总量成正比，空间取决于字符集大小。

## 常见错误与追问

- 只判断字符是否出现，没有比较出现次数；
- 把前一个单词消耗的字符错误地延续到下一个单词；
- 每个单词都重新统计 `chars`，造成不必要开销。
