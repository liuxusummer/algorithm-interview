# 451 · 根据字符出现频率排序

<ProblemMeta
  :tags="['华为面试题', '哈希表', '排序']"
  difficulty="medium"
  :appearances="8"
  pass-rate="54%"
  source-url="https://leetcode.cn/problems/sort-characters-by-frequency/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(n)" />

## 题目

给定字符串 `s`，将字符按照出现频率从高到低排列。相同字符必须放在一起；频率相同的字符顺序不限。

### 示例

```text
输入：s = "tree"
输出："eert"
解释：e 出现两次，必须排在只出现一次的 t 和 r 前面。
```

### 约束观察

- 相同字符必须连续输出，因此先计数再批量拼接；
- 频率相同的字符顺序不限，答案可能不唯一；
- 单个字符的最高频率不会超过字符串长度 `n`。

## 先说排序解

统计频率后，把不同字符按频率降序排序，再按次数拼接。若不同字符数为 `k`，时间为 `O(n + k log k)`，写法简单且通常足够。

## 思路：计数 + 频次桶

先用哈希表统计每个字符的频率。字符最高频率不会超过 `n`，因此建立 `n + 1` 个桶，把字符放进下标等于其频率的桶中。

最后从高频桶向低频桶遍历，把字符重复对应次数后加入答案。

## Python 实现

```python
from collections import Counter


class Solution:
    def frequencySort(self, s: str) -> str:
        frequencies = Counter(s)
        buckets: list[list[str]] = [
            [] for _ in range(len(s) + 1)
        ]

        for character, frequency in frequencies.items():
            # 桶下标就是字符出现次数。
            buckets[frequency].append(character)

        answer: list[str] = []
        for frequency in range(len(s), 0, -1):
            for character in buckets[frequency]:
                answer.append(character * frequency)

        return "".join(answer)
```

## 正确性说明

每个字符被放入与其真实频率对应的桶。算法按照桶下标从大到小输出，因此高频字符一定先于低频字符；每个字符又恰好重复其统计次数，所以输出与原字符串包含完全相同的字符。

## 复杂度

- 统计、入桶和生成答案都需要 `O(n)` 时间；
- 哈希表、桶和结果数组共占用 `O(n)` 空间。

## 边界与追问

- 空字符串直接返回空串；
- 所有字符相同时只有一个非空桶；
- 如果不用桶，可按频率排序不同字符，时间为 `O(k log k + n)`；
- 若要求频率相同时按字符字典序排列，只需对每个桶内部排序。

## 90 秒面试表达

我先用哈希表统计字符频率。因为最高频率不超过字符串长度，所以用频次作为桶下标，把字符放入对应桶，再从高频桶向低频桶拼接。每个字符按其频率重复，结果既保持字符总数不变，又保证频率单调下降，时间和空间都是 `O(n)`。
