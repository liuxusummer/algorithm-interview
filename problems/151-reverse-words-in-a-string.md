# 151 · 反转字符串中的单词

<ProblemMeta
  :tags="['Hot100', '大厂面试', '字符串', '双指针']"
  difficulty="medium"
  :appearances="106"
  pass-rate="55%"
  source-url="https://leetcode.cn/problems/reverse-words-in-a-string/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(n)" />

## 题目

反转字符串中的单词顺序，并把单词之间多余的空格规整为一个。

```text
输入："  the sky   is blue  "
输出："blue is sky the"
```

Python 字符串不可变，直接使用 `split()` 是最清晰、也最不容易漏边界的实现。无参数 `split()` 会自动忽略首尾空白并合并连续空白。

## Python 实现

```python
class Solution:
    def reverseWords(self, s: str) -> str:
        # split() 自动完成去除首尾空格和压缩连续空格。
        words = s.split()
        words.reverse()
        return " ".join(words)
```

## 手写双指针思路

若面试官禁止 `split()`，可以从字符串右端开始：

1. 跳过空格；
2. 用右指针标记单词结尾；
3. 向左找到单词开头并加入结果；
4. 重复直到扫描完毕。

该方案同样是 `O(n)` 时间，结果字符串仍需要 `O(n)` 空间。

## 正确性与复杂度

`split()` 按原顺序提取所有非空单词，反转列表后顺序恰好相反；`join` 在相邻单词之间只插入一个空格，所以同时满足顺序和空格要求。时间、空间均为 `O(n)`。

## 面试追问

- 若输入是可变字符数组，可先整体反转、再逐个反转单词，并用读写指针压缩空格。
- 必须明确题目中的“单词”是否只由普通字符构成，空白是否只有空格。
