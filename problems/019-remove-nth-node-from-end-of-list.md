# 019 · 删除链表的倒数第 N 个结点

<ProblemMeta
  :tags="['Hot100', '大厂面试', '快慢指针']"
  difficulty="medium"
  :appearances="60"
  pass-rate="49%"
  source-url="https://leetcode.cn/problems/remove-nth-node-from-end-of-list/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(1)" />

## 题目

给定一个单链表头结点 `head` 和正整数 `n`，删除链表的倒数第 `n` 个结点，并返回新的头结点。

### 示例

```text
输入：1 → 2 → 3 → 4 → 5，n = 2
输出：1 → 2 → 3 → 5
```

### 直接方案

先遍历得到链表长度，再从头找到第 `length - n` 个位置进行删除，需要两次遍历。

快慢指针可以在一次遍历中完成。

## 优化抓手

使用虚拟头结点，并让 `fast` 先前进 `n` 步。之后同步移动 `fast` 与 `slow`：

- 当 `fast.next` 为空时，`slow.next` 正好是待删除结点；
- 虚拟头结点让删除原头结点与删除中间结点使用同一逻辑。

## Python 实现

```python
from typing import Optional


class Solution:
    def removeNthFromEnd(
        self,
        head: Optional[ListNode],
        n: int,
    ) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        fast = dummy
        slow = dummy

        # 快指针先领先 n 步；随后同步移动，slow 会停在待删结点前。
        for _ in range(n):
            fast = fast.next

        while fast.next:
            fast = fast.next
            slow = slow.next

        slow.next = slow.next.next
        return dummy.next
```

## 为什么从虚拟头结点出发

如果删除的是原链表头结点，需要修改 `head`。虚拟头结点保证待删除结点始终存在前驱 `slow`，删除操作统一为：

```text
slow.next = slow.next.next
```

## 正确性说明

`fast` 先走 `n` 步后，与 `slow` 保持固定距离。两者同步移动直到 `fast` 位于最后一个结点时，`slow` 位于倒数第 `n` 个结点的前驱。跳过 `slow.next` 就准确删除目标结点。

## 复杂度

- 时间复杂度：`O(n)`。链表只进行一次完整扫描。
- 空间复杂度：`O(1)`。

## 边界用例

| 链表 | `n` | 预期 | 检查点 |
|---|---:|---|---|
| `1→2→3→4→5` | 2 | `1→2→3→5` | 基础路径 |
| `1` | 1 | 空链表 | 删除唯一结点 |
| `1→2` | 2 | `2` | 删除头结点 |
| `1→2` | 1 | `1` | 删除尾结点 |

## 90 秒面试表达

“我用虚拟头结点统一处理删除头结点的情况。快指针先走 `n` 步，再让快慢指针同步移动；当快指针到达最后一个结点时，慢指针正好停在待删除结点的前驱。把 `slow.next` 指向下下个结点即可。时间 `O(n)`、空间 `O(1)`。”

## 常见追问

- 如果 `n` 可能非法，需要在快指针预走阶段检查空指针。
- 如果是双向链表，删除操作相同但还要维护前向指针。
- 如果需要返回被删除结点，修改指针前先保存引用。
