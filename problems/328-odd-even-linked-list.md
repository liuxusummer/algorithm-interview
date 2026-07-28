# 328 · 奇偶链表

<ProblemMeta
  :tags="['字节面试题', '链表', '指针分组']"
  difficulty="medium"
  :appearances="10"
  pass-rate="45%"
  source-url="https://leetcode.cn/problems/odd-even-linked-list/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(1)" />

## 题目

给定单链表，把所有奇数位置的结点排在偶数位置结点之前，并保持两组内部的相对顺序。

这里的奇偶指结点位置，从 `1` 开始，不是结点值的奇偶性。

### 示例

```text
输入：1 → 2 → 3 → 4 → 5
输出：1 → 3 → 5 → 2 → 4
```

## 核心思路

维护两条链：

- `odd` 串联奇数位置结点；
- `even` 串联偶数位置结点；
- `even_head` 保存偶数链表头，最后接到奇数链表尾。

## Python 实现

```python
from typing import Optional


class Solution:
    def oddEvenList(
        self,
        head: Optional[ListNode],
    ) -> Optional[ListNode]:
        if not head:
            return None

        odd = head
        even = head.next
        even_head = even

        while even and even.next:
            odd.next = even.next
            odd = odd.next

            even.next = odd.next
            even = even.next

        odd.next = even_head
        return head
```

## 为什么循环条件是 `even and even.next`

每轮需要把 `even.next` 接到奇数链，再把新的 `odd.next` 接到偶数链。只有偶数指针和它的后继都存在时，这两步才安全。

## 为什么要保存 `even_head`

偶数指针会不断向后移动。最终需要把奇数链尾连接到偶数链头，所以必须在移动前保存最初的第二个结点。

## 正确性说明

每轮把下一个奇数位置结点追加到奇数链，再把下一个偶数位置结点追加到偶数链，两组内部都按原顺序推进。循环结束后两组覆盖全部结点且互不重叠，把奇数链尾连接偶数链头即可得到目标顺序。

## 复杂度

- 时间复杂度：`O(n)`。
- 空间复杂度：`O(1)`。

## 边界用例

| 输入 | 预期 | 检查点 |
|---|---|---|
| `1→2→3→4→5` | `1→3→5→2→4` | 奇数长度 |
| `1→2→3→4` | `1→3→2→4` | 偶数长度 |
| `1` | `1` | 单结点 |
| 空链表 | 空链表 | 空输入 |

## 90 秒面试表达

“奇偶指的是结点位置。我维护奇数链尾和偶数链尾，同时保存偶数链头。每轮把下一个奇数位置结点接到奇数链，再把下一个偶数位置结点接到偶数链，两组内部相对顺序不会改变。结束后把奇数链尾接到偶数链头。每个结点处理一次，时间 `O(n)`、空间 `O(1)`。”

## 常见追问

- 如果按结点值奇偶分组，需要根据值判断并维护两个虚拟头结点。
- K 路位置分组可以维护 K 条子链，最后依次连接。
- 这个操作会修改原链表结构，但不创建新结点。
