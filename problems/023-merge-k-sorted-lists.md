# 023 · 合并 K 个升序链表

<ProblemMeta
  :tags="['Hot100', '大厂面试', '最小堆', '分治归并', '华为面试题']"
  difficulty="hard"
  :appearances="74"
  pass-rate="24%"
  source-url="https://leetcode.cn/problems/merge-k-sorted-lists/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(N log k)" space="最小堆 O(k)，两两归并 O(1)" />

## 题目

给定一个链表数组，每条链表都按非递减顺序排列。将所有链表合并为一条有序链表并返回。

`k` 表示链表数量，`N` 表示所有链表的结点总数。

### 示例

```text
输入：[1→4→5, 1→3→4, 2→6]
输出：1→1→2→3→4→4→5→6
```

## 解法一：最小堆

### 直接方案

依次把当前结果与下一条链表两两合并。最坏情况下，已经合并的长链表会被反复扫描，时间复杂度可能达到 `O(Nk)`。

最小堆可以始终从 K 条链表的当前头结点中取出最小值。

### 优化抓手

堆中最多保存每条链表的一个候选结点：

1. 把所有非空链表头加入最小堆；
2. 弹出最小结点接到结果尾部；
3. 如果该结点还有后继，把后继加入堆；
4. 重复直到堆为空。

### Python 实现

```python
import heapq
from typing import List, Optional


# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next


class Solution:
    def mergeKLists(
        self,
        lists: List[Optional[ListNode]],
    ) -> Optional[ListNode]:
        heap = []

        # 将每条非空链表的头结点放入小根堆。
        # i 是链表下标：当结点值相同时，它可以避免 Python 比较 ListNode。
        for i, node in enumerate(lists):
            if node is not None:
                heapq.heappush(heap, (node.val, i, node))

        dummy = ListNode()
        current = dummy

        while heap:
            # 堆顶是所有链表当前未合并结点中的最小值。
            _, i, node = heapq.heappop(heap)

            current.next = node
            current = current.next

            # 当前结点来自第 i 条链表；若它还有后继，
            # 将后继作为这条链表新的最小候选放回堆中。
            if node.next is not None:
                heapq.heappush(
                    heap,
                    (node.next.val, i, node.next),
                )

        return dummy.next
```

### 为什么堆元素需要链表下标

不同结点可能具有相同值。如果堆只保存 `(node.val, node)`，数值相同时 Python 会尝试比较两个 `ListNode`，从而报错。

因此堆中保存三元组：

```text
(结点值, 链表下标, 结点)
```

堆中同一条链表始终最多只有一个候选结点：只有弹出第 `i` 条链表的当前结点后，才会把它的后继以相同下标 `i` 放回堆。因此堆内的链表下标不会重复，可以安全地作为第二比较项。

### 正确性说明

每条未耗尽链表的头结点都是该链表剩余部分的最小值，因此所有剩余结点的全局最小值一定在堆中。每轮弹出堆顶并加入其后继，持续保持这个性质。按顺序弹出的全部结点必然非递减，并且每个结点恰好处理一次。

### 复杂度

- 时间复杂度：`O(N log k)`。每个结点入堆、出堆一次。
- 空间复杂度：`O(k)`，堆中最多有 K 个候选。

## 解法二：自底向上两两归并

两条有序链表可以在 `O(a + b)` 时间、`O(1)` 额外空间内归并。把 `k` 条链表像归并排序一样成对合并：

```text
第 1 轮：0 和 1、2 和 3、4 和 5 ...
第 2 轮：0 和 2、4 和 6 ...
第 3 轮：0 和 4 ...
```

每轮步长翻倍，经过 `log k` 轮后只剩一条链表。每一轮所有结点合计只被扫描一次，因此总时间仍是 `O(N log k)`。

### Python 实现

```python
from typing import Optional


class Solution:
    def mergeKLists(
        self,
        lists: list[Optional[ListNode]],
    ) -> Optional[ListNode]:
        if not lists:
            return None

        step = 1

        # 每轮把相距 step 的两条链表合并，下一轮步长翻倍。
        while step < len(lists):
            for left in range(
                0,
                len(lists) - step,
                step * 2,
            ):
                lists[left] = self._merge_two(
                    lists[left],
                    lists[left + step],
                )

            step *= 2

        return lists[0]

    def _merge_two(
        self,
        first: Optional[ListNode],
        second: Optional[ListNode],
    ) -> Optional[ListNode]:
        dummy = ListNode(0)
        tail = dummy

        while first and second:
            if first.val <= second.val:
                tail.next = first
                first = first.next
            else:
                tail.next = second
                second = second.next

            tail = tail.next

        # 剩余后缀本身已有序，可以整体接到结果末尾。
        tail.next = first if first else second
        return dummy.next
```

### 为什么不能从左到右逐条合并

如果先把第 1、2 条合成一条长链，再依次加入第 3、4 条，前面已经合并出的长链会被重复扫描，链表长度相近时总时间可能达到 `O(Nk)`。

成对归并让每个结点每轮只参与一次，且轮数只有 `log k`，避免了长链被线性次数地反复遍历。

### 正确性说明

`_merge_two` 每次从两条链表当前头结点中选择较小者，因此输出保持有序且包含两边全部结点。第 1 轮后，每个已处理位置包含两条原链表；第 2 轮包含四条，依此类推。步长覆盖 `k` 后，`lists[0]` 包含所有输入结点并保持有序。

### 复杂度

- 时间复杂度：`O(N log k)`。每轮扫描全部 `N` 个结点，共 `log k` 轮。
- 额外空间复杂度：`O(1)`。复用原链表结点和输入的 `lists` 数组，只使用常数个指针。

最小堆适合链表以数据流方式持续产生结点；两两归并更适合输入一次性给全、并希望避免维护堆的场景。

## 边界用例

| 输入 | 预期 | 检查点 |
|---|---|---|
| `[1→4→5, 1→3→4, 2→6]` | `1→1→2→3→4→4→5→6` | 基础路径 |
| `[]` | 空 | 没有链表 |
| `[空]` | 空 | 只有空链表 |
| `[1, 1, 1]` | `1→1→1` | 相同值 |

## 90 秒面试表达

“最小堆维护每条链表的当前头结点，每个结点进出堆一次，时间 `O(N log k)`、空间 `O(k)`。如果所有链表一次性给出，我更倾向自底向上两两归并：第一轮两两合并，之后步长不断翻倍。每轮全部结点只扫描一次，共 `log k` 轮，同样是 `O(N log k)`，但复用原结点后额外空间是 `O(1)`。”

## 常见追问

- 如果链表持续流式产生结点，最小堆方案更自然；静态输入可优先两两归并。
- 如果不能修改输入，需要为结果创建新结点。
