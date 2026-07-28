# 234 · 回文链表

<ProblemMeta
  :tags="['Hot100', '腾讯面试', '链表', '快慢指针']"
  difficulty="easy"
  :appearances="10"
  pass-rate="62%"
  source-url="https://leetcode.cn/problems/palindrome-linked-list/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(1)" />

## 题目

给定一个单链表的头结点 `head`，判断该链表的结点值序列是否为回文。

### 示例

```text
输入：1 → 2 → 2 → 1
输出：true
```

## 核心思路

若把值复制到数组，双指针判断很简单，但需要 `O(n)` 额外空间。链表版本可以原地完成：

1. 快慢指针找到后半部分起点；
2. 原地反转后半部分；
3. 从链表头和反转后的后半部分同时比较；
4. 再反转一次恢复原链表。

奇数长度时，后半部分包含中间结点，但它只会和自己对应，不影响结果。

## Python 实现

```python
from typing import Optional


class Solution:
    def isPalindrome(
        self,
        head: Optional[ListNode],
    ) -> bool:
        if head is None or head.next is None:
            return True

        slow = head
        fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next

        # slow 指向后半部分起点，原地反转后与前半部分比较。
        second_half = self._reverse(slow)
        left = head
        right = second_half
        is_palindrome = True

        while right:
            if left.val != right.val:
                is_palindrome = False
                break
            left = left.next
            right = right.next

        # 恢复输入结构，避免函数产生难以察觉的副作用。
        self._reverse(second_half)
        return is_palindrome

    def _reverse(
        self,
        head: Optional[ListNode],
    ) -> Optional[ListNode]:
        previous = None
        current = head

        while current:
            following = current.next
            current.next = previous
            previous = current
            current = following

        return previous
```

## 正确性说明

快指针每次走两步、慢指针走一步，所以循环结束时慢指针位于链表中点或右半部分起点。反转后半部分后，从两端向中间的对应结点会以相同方向出现在两条待比较链中。

若每一对值都相同，原序列关于中心对称，是回文；若存在任意不同值，则不是回文。恢复操作只再次反转同一段链表，不改变判断结果。

## 复杂度

- 时间复杂度：`O(n)`，查中点、反转、比较与恢复均为线性；
- 空间复杂度：`O(1)`。

## 边界用例

| 输入 | 输出 |
|---|---|
| 空链表 | `true` |
| `1` | `true` |
| `1→2` | `false` |
| `1→2→1` | `true` |
| `1→2→2→1` | `true` |

## 90 秒面试表达

“为了做到常数空间，我先用快慢指针找中点，再原地反转后半链表。随后从头结点和反转后的尾部同时向中间比较，任一值不同就不是回文。最后把后半部分反转回来，避免破坏输入。整体时间 `O(n)`、空间 `O(1)`。”

## 常见追问

- 数组法更直观，但空间为 `O(n)`；
- 递归比较会使用 `O(n)` 调用栈；
- 工程代码最好恢复链表，除非接口明确允许修改输入。
