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

```text
输入：words = ["cat", "bt", "hat", "tree"], chars = "atach"
输出：6
```

`"cat"` 和 `"hat"` 可以拼出，总长度为 `3 + 3 = 6`。

## 思路

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

## 常见错误

- 只判断字符是否出现，没有比较出现次数；
- 把前一个单词消耗的字符错误地延续到下一个单词；
- 每个单词都重新统计 `chars`，造成不必要开销。
