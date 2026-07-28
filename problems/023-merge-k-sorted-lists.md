# 023 · 合并 K 个升序链表

<ProblemMeta
  :tags="['Hot100', '大厂面试', '最小堆']"
  difficulty="hard"
  :appearances="69"
  pass-rate="24%"
  source-url="https://leetcode.cn/problems/merge-k-sorted-lists/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(N log k)" space="O(k)" />

## 题目

给定一个链表数组，每条链表都按非递减顺序排列。将所有链表合并为一条有序链表并返回。

`k` 表示链表数量，`N` 表示所有链表的结点总数。

### 示例

```text
输入：[1→4→5, 1→3→4, 2→6]
输出：1→1→2→3→4→4→5→6
```

## 直接方案

依次把当前结果与下一条链表两两合并。最坏情况下，已经合并的长链表会被反复扫描，时间复杂度可能达到 `O(Nk)`。

最小堆可以始终从 K 条链表的当前头结点中取出最小值。

## 优化抓手

堆中最多保存每条链表的一个候选结点：

1. 把所有非空链表头加入最小堆；
2. 弹出最小结点接到结果尾部；
3. 如果该结点还有后继，把后继加入堆；
4. 重复直到堆为空。

## Python 实现

```python
import heapq
from itertools import count
from typing import Optional


class Solution:
    def mergeKLists(
        self,
        lists: list[Optional[ListNode]],
    ) -> Optional[ListNode]:
        heap = []
        # 唯一序号用于打破相同结点值的平局，避免直接比较 ListNode。
        sequence = count()

        # 堆中每条非空链表最多保留一个当前候选结点。
        for node in lists:
            if node:
                heapq.heappush(
                    heap,
                    (node.val, next(sequence), node),
                )

        dummy = ListNode()
        tail = dummy

        while heap:
            _, _, node = heapq.heappop(heap)
            next_node = node.next

            tail.next = node
            tail = node
            tail.next = None

            if next_node:
                heapq.heappush(
                    heap,
                    (next_node.val, next(sequence), next_node),
                )

        return dummy.next
```

## 为什么堆元素需要序号

不同结点可能具有相同值。如果堆只保存 `(node.val, node)`，数值相同时 Python 会尝试比较两个 `ListNode`，从而报错。

单调递增的 `sequence` 提供稳定且唯一的第二比较项：

```text
(结点值, 唯一序号, 结点)
```

## 正确性说明

每条未耗尽链表的头结点都是该链表剩余部分的最小值，因此所有剩余结点的全局最小值一定在堆中。每轮弹出堆顶并加入其后继，持续保持这个性质。按顺序弹出的全部结点必然非递减，并且每个结点恰好处理一次。

## 复杂度

- 时间复杂度：`O(N log k)`。每个结点入堆、出堆一次。
- 空间复杂度：`O(k)`，堆中最多有 K 个候选。

## 边界用例

| 输入 | 预期 | 检查点 |
|---|---|---|
| `[1→4→5, 1→3→4, 2→6]` | `1→1→2→3→4→4→5→6` | 基础路径 |
| `[]` | 空 | 没有链表 |
| `[空]` | 空 | 只有空链表 |
| `[1, 1, 1]` | `1→1→1` | 相同值 |

## 90 秒面试表达

“依次两两合并最坏会反复扫描长链表。我用最小堆维护每条非空链表的当前头结点。每次弹出全局最小结点接到结果尾部，再把它的后继加入堆。Python 堆在值相同时不能比较 `ListNode`，所以元组中加入唯一序号。每个结点入堆、出堆一次，时间 `O(N log k)`、空间 `O(k)`。”

## 常见追问

- 分治两两归并同样能做到 `O(N log k)`，额外堆空间更少。
- 如果链表持续流式产生结点，最小堆方案更自然。
- 如果不能修改输入，需要为结果创建新结点。
