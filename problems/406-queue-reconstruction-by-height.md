# 406 · 根据身高重建队列

<ProblemMeta
  :tags="['华为面试题', '贪心', '排序']"
  difficulty="medium"
  :appearances="5"
  pass-rate="74%"
  source-url="https://leetcode.cn/problems/queue-reconstruction-by-height/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n²)" space="O(n)" />

## 题目

每个人用 `[h, k]` 表示：身高为 `h`，其前方恰好有 `k` 个身高大于或等于 `h` 的人。请重建满足条件的队列。

## 思路

先按身高从高到低排序，身高相同时按 `k` 从小到大排序。依次将每个人插入结果的下标 `k`；因为已经放入的人都不矮于当前人，插入位置就是其前方高个子数量。

## Python 实现

```python
from typing import List


class Solution:
    def reconstructQueue(self, people: List[List[int]]) -> List[List[int]]:
        people.sort(key=lambda person: (-person[0], person[1]))
        queue = []

        for person in people:
            # 已入队者都不矮于当前人，直接插到 k 位置
            queue.insert(person[1], person)

        return queue
```

## 正确性说明

处理当前人时，结果中所有人身高均不小于他，因此插入下标 `k` 可确保前方恰有 `k` 个不矮于他的人。之后插入的更矮者不会影响这个计数，所以每一步建立的条件都保持成立。

## 复杂度

- 时间：`O(n²)`，列表中间插入需要移动元素
- 空间：`O(n)`

## 60 秒口述

关键是先处理高个子。高个子的位置不会受后续矮个子影响，所以按身高降序、`k` 升序排列，再把每个人插入下标 `k` 即可。
