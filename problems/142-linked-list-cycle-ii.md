# 142 · 环形链表 II

<ProblemMeta
  :tags="['Hot100', '大厂面试', '快慢指针']"
  difficulty="medium"
  :appearances="13"
  pass-rate="39%"
  source-url="https://leetcode.cn/problems/linked-list-cycle-ii/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(1)" />

## 题目

给定单链表头结点 `head`，如果链表存在环，返回环的入口结点；否则返回空。不能修改链表。

## 直接方案

用集合记录访问过的结点，第一次重复遇到的结点就是环入口。时间 `O(n)`，空间 `O(n)`。

Floyd 快慢指针可以把空间降为常数。

## 优化抓手

分两阶段：

1. 快指针每次两步、慢指针每次一步，判断是否在环内相遇；
2. 相遇后让一个指针回到链表头，两者都改为每次一步，再次相遇的位置就是环入口。

## Python 实现

```python
from typing import Optional


class Solution:
    def detectCycle(
        self,
        head: Optional[ListNode],
    ) -> Optional[ListNode]:
        slow = head
        fast = head

        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next

            if slow is fast:
                finder = head

                # 从头结点和相遇点同速前进，交点就是环入口。
                while finder is not slow:
                    finder = finder.next
                    slow = slow.next

                return finder

        return None
```

## 为什么第二次相遇是入口

设头结点到环入口距离为 `a`，入口到第一次相遇点距离为 `b`，环剩余长度为 `c`。

第一次相遇时，快指针路程是慢指针两倍，可推出：

```text
a = c + 若干个完整环长
```

因此一个指针从头出发，另一个从相遇点出发，同速前进时会在环入口相遇。

## 正确性说明

无环时快指针到达空，返回空。有环时 Floyd 指针必定在环内相遇。根据相遇路程关系，头到入口的距离等于相遇点继续前进到入口的距离加若干整圈；两个同速指针因此第一次重合在入口。

## 复杂度

- 时间复杂度：`O(n)`。
- 空间复杂度：`O(1)`。

## 边界用例

| 结构 | 预期 | 检查点 |
|---|---|---|
| 空链表 | 空 | 无结点 |
| 单结点无环 | 空 | 无环 |
| 单结点自环 | 该结点 | 入口即头 |
| 尾结点连回中间 | 返回中间结点 | 普通环 |

## 90 秒面试表达

“先用 Floyd 快慢指针判断环。若相遇，让一个新指针从头开始，慢指针留在相遇点，两者都每次走一步，再次相遇的位置就是环入口。这个结论来自第一次相遇时快指针路程是慢指针两倍，能推出头到入口距离等于相遇点到入口距离加若干完整环。时间 `O(n)`、空间 `O(1)`。”

## 常见追问

- 环长度可以从第一次相遇点出发绕一圈计数。
- 只判断是否有环时不需要第二阶段。
- 两条可能有环的链表求交点，需要先比较环入口并分类。
