# 148 · 排序链表

<ProblemMeta
  :tags="['Hot100', '大厂面试', '归并排序']"
  difficulty="medium"
  :appearances="20"
  pass-rate="62%"
  source-url="https://leetcode.cn/problems/sort-list/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n log n)" space="O(log n)" />

## 题目

给定单链表头结点 `head`，将链表按非递减顺序排序并返回。

### 示例

```text
输入：head = [4, 2, 1, 3]
输出：[1, 2, 3, 4]
解释：复用原链表结点，将它们按非递减顺序重新连接。
```

### 为什么选择归并排序

链表不支持按下标随机访问，快速排序的分区与数组原地交换不再自然。归并排序只需要顺序访问，并且两条有序链表能以 `O(n)` 时间合并。

## 核心步骤

1. 快慢指针找到中点并断开；
2. 递归排序左右两段；
3. 合并两个有序链表。

## Python 实现

```python
from typing import Optional


class Solution:
    def sortList(
        self,
        head: Optional[ListNode],
    ) -> Optional[ListNode]:
        if not head or not head.next:
            return head

        slow = head
        fast = head.next

        # 快慢指针断开链表，递归排序后再线性归并。
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next

        right_head = slow.next
        slow.next = None

        left = self.sortList(head)
        right = self.sortList(right_head)
        return self._merge(left, right)

    def _merge(
        self,
        left: Optional[ListNode],
        right: Optional[ListNode],
    ) -> Optional[ListNode]:
        dummy = ListNode()
        tail = dummy

        while left and right:
            if left.val <= right.val:
                tail.next = left
                left = left.next
            else:
                tail.next = right
                right = right.next

            tail = tail.next

        tail.next = left if left else right
        return dummy.next
```

## 为什么必须断开链表

找到中点后执行：

```text
slow.next = None
```

否则左半段递归仍能访问右半段，子问题不会真正缩小，可能导致无限递归。

## 正确性说明

递归基线中，空链表和单结点链表天然有序。对更长链表，算法将其拆成更短的两段并分别正确排序，再通过标准有序链表归并得到包含全部结点的有序结果。根据归纳法，最终整个链表有序。

## 复杂度

- 时间复杂度：`O(n log n)`。每层合并处理全部结点，共 `O(log n)` 层。
- 空间复杂度：`O(log n)`，来自递归调用栈。

## 边界用例

| 输入 | 预期 | 检查点 |
|---|---|---|
| `4→2→1→3` | `1→2→3→4` | 基础路径 |
| `-1→5→3→4→0` | `-1→0→3→4→5` | 负数 |
| `2→2→1` | `1→2→2` | 重复值 |
| 空链表 | 空链表 | 空输入 |

## 90 秒面试表达

“链表缺少随机访问，归并排序最合适。用快慢指针找到中点并断开，递归排序左右两段，再用双指针合并两条有序链表。每一层归并总共处理 `n` 个结点，层数是 `log n`，所以时间 `O(n log n)`；当前递归写法使用 `O(log n)` 栈空间。”

## 常见追问

- 若严格要求 `O(1)` 额外空间，需要使用自底向上的迭代归并排序。
- 稳定排序时，相等值应优先取左链表结点。
- 若链表是双向的，合并时还要维护 `prev`。
