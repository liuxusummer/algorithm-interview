# 143 · 重排链表

<ProblemMeta
  :tags="['字节面试题', '链表', '综合指针']"
  difficulty="medium"
  :appearances="22"
  pass-rate="42%"
  source-url="https://leetcode.cn/problems/reorder-list/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(1)" />

## 题目

给定链表：

```text
L0 → L1 → … → Ln-1 → Ln
```

将它原地重排为：

```text
L0 → Ln → L1 → Ln-1 → L2 → Ln-2 → …
```

不能修改结点值，只能调整结点连接。

### 示例

```text
输入：head = [1, 2, 3, 4]
输出：[1, 4, 2, 3]
解释：按首、尾、次首、次尾的顺序重新连接原链表结点。
```

## 拆解成三个模板

1. 快慢指针找到链表中点；
2. 反转后半段链表；
3. 交替合并前半段与反转后的后半段。

## 动画拆解

下面把寻找中点、翻转后半段和交替合并拆成三幕，观察两条链如何在不创建新结点的情况下重新编织。

<LinkedListDemo variant="reorder-list" />

## Python 实现

```python
from typing import Optional


class Solution:
    def reorderList(self, head: Optional[ListNode]) -> None:
        if not head or not head.next:
            return

        slow = head
        fast = head

        # 1. 快慢指针找到前半段尾部并断开链表。
        while fast.next and fast.next.next:
            slow = slow.next
            fast = fast.next.next

        second = slow.next
        slow.next = None

        previous = None
        # 2. 原地反转后半段。
        while second:
            next_node = second.next
            second.next = previous
            previous = second
            second = next_node

        first = head
        second = previous

        # 3. 交替合并两段。
        while second:
            first_next = first.next
            second_next = second.next

            first.next = second
            second.next = first_next

            first = first_next
            second = second_next
```

## 为什么先断开前后两段

```text
slow.next = None
```

如果不先断开，后半段反转和交替连接过程中可能保留旧连接，形成环或重复引用结点。

## 奇数长度如何处理

奇数长度时，前半段比后半段多一个结点。交替合并只需要在 `second` 非空时继续，最后多出的中间结点已经位于正确尾部。

## 正确性说明

快慢指针把链表分成前半段和后半段。反转后半段后，其顺序变为 `Ln, Ln-1, ...`。交替取前半段与反转后半段的结点，恰好生成目标顺序。所有操作只修改 `next`，每个原结点保留且出现一次。

## 复杂度

- 时间复杂度：`O(n)`。
- 空间复杂度：`O(1)`。

## 边界用例

| 输入 | 预期 | 检查点 |
|---|---|---|
| `1→2→3→4` | `1→4→2→3` | 偶数长度 |
| `1→2→3→4→5` | `1→5→2→4→3` | 奇数长度 |
| `1` | `1` | 单结点 |
| `1→2` | `1→2` | 两结点 |

## 90 秒面试表达

“这题拆成三个链表模板：快慢指针找中点、反转后半段、交替合并两段。找到中点后先断开链表，避免旧连接形成环；后半段反转后就是从尾到中间的顺序，再与前半段逐个交替。奇数长度时前半段多一个结点，会自然留在尾部。时间 `O(n)`、空间 `O(1)`。”

## 常见追问

- 如果允许 `O(n)` 空间，可以把结点放入数组后用双指针连接。
- 判断回文链表也使用“找中点 + 反转后半段”。
- 如果要求恢复原链表，比较或操作后再次反转后半段并连接。
