# 141 · 环形链表

<ProblemMeta
  :tags="['Hot100', '大厂面试', '快慢指针']"
  difficulty="easy"
  :appearances="28"
  pass-rate="56%"
  source-url="https://leetcode.cn/problems/linked-list-cycle/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(1)" />

## 题目

给定单链表头结点 `head`，判断链表中是否存在环。链表中的某个结点若能通过持续访问 `next` 再次到达，则存在环。

### 直接方案

用集合记录访问过的结点。如果再次遇到同一结点就存在环。时间为 `O(n)`，但需要 `O(n)` 空间。

## 优化抓手

使用 Floyd 快慢指针：

- `slow` 每次走一步；
- `fast` 每次走两步；
- 有环时，两者最终一定在环内相遇；
- 无环时，`fast` 会先到达链表末尾。

## Python 实现

```python
from typing import Optional


class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        slow = head
        fast = head

        # 快指针每次走两步；若存在环，二者最终必在环内相遇。
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next

            if slow is fast:
                return True

        return False
```

## 为什么比较结点身份

不同结点可能保存相同数值。环的判断依据是是否回到同一个结点对象，因此必须使用结点身份比较，而不是比较 `val`。

## 为什么一定会相遇

进入环后，快指针每轮相对慢指针多走一步。把环看成长度有限的圆形跑道，相对距离每轮缩短一个位置，最多经过一个环长就会重合。

## 正确性说明

无环时，快指针沿有限链表最终到达空指针，算法返回 `False`。有环时，快慢指针都会进入环，且相对速度为每轮一个结点，所以必然相遇并返回 `True`。

## 复杂度

- 时间复杂度：`O(n)`。
- 空间复杂度：`O(1)`。

## 边界用例

| 结构 | 预期 | 检查点 |
|---|---|---|
| 空链表 | `False` | 无结点 |
| 单结点无环 | `False` | `next = None` |
| 单结点自环 | `True` | 最小环 |
| 尾结点连回头结点 | `True` | 整链成环 |

## 90 秒面试表达

“集合记录访问结点需要 `O(n)` 空间。我用 Floyd 快慢指针，慢指针每次一步、快指针每次两步。无环时快指针会到达空；有环时两者进入环后，快指针每轮相对多走一步，最终一定相遇。判断要比较结点身份而不是值。时间 `O(n)`、空间 `O(1)`。”

## 常见追问

- 如果还要找环入口，第一次相遇后让一个指针回到头结点，再同步前进。
- 环长度可以在相遇后固定一个指针，让另一个绕一圈计数。
- 使用集合能直接返回第一次重复访问的结点，但空间为 `O(n)`。
