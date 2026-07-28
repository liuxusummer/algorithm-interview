# 206 · 反转链表

<ProblemMeta
  :tags="['Hot100', '大厂面试', '链表']"
  difficulty="easy"
  :appearances="55"
  pass-rate="39%"
  source-url="https://leetcode.cn/problems/reverse-linked-list/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(1)" />

## 题目

给定单链表头结点 `head`，反转链表并返回新的头结点。

### 示例

```text
输入：1 → 2 → 3 → 4 → 5
输出：5 → 4 → 3 → 2 → 1
```

## 核心思路

遍历链表时维护：

- `previous`：已经反转部分的头结点；
- `current`：当前待处理结点；
- `next_node`：修改指针前保存的后继。

每轮把 `current.next` 指向 `previous`，再整体向前推进。

## Python 实现

```python
from typing import Optional


class Solution:
    def reverseList(
        self,
        head: Optional[ListNode],
    ) -> Optional[ListNode]:
        previous = None
        current = head

        # 每轮先保存后继再反转指针，避免丢失剩余链表。
        while current:
            next_node = current.next
            current.next = previous
            previous = current
            current = next_node

        return previous
```

## 为什么要先保存后继

执行 `current.next = previous` 后，原本通往未处理链表的指针会被覆盖。如果没有提前保存 `next_node`，后续结点将无法访问。

## 循环不变量

每轮开始时：

- `previous` 指向已经完成反转的前缀；
- `current` 指向尚未处理后缀的第一个结点；
- 两部分包含原链表全部结点且互不重叠。

处理当前结点后，不变量继续成立。

## 正确性说明

算法逐个把当前结点从未处理后缀移动到已反转前缀的头部。链表结束时，未处理部分为空，`previous` 包含全部原结点且连接方向完全相反，所以它就是反转后的新头结点。

## 复杂度

- 时间复杂度：`O(n)`。
- 空间复杂度：`O(1)`。

## 边界用例

| 输入 | 预期 | 检查点 |
|---|---|---|
| 空链表 | 空链表 | 无结点 |
| `1` | `1` | 单结点 |
| `1→2` | `2→1` | 最小反转 |
| `1→2→3→4→5` | `5→4→3→2→1` | 基础路径 |

## 90 秒面试表达

“我维护 `previous` 和 `current`。每轮先保存当前结点的后继，避免修改 `next` 后丢失剩余链表；再把当前结点指向已反转部分，并推进两个指针。循环结束时 `previous` 就是新头结点。每个结点处理一次，时间 `O(n)`、空间 `O(1)`。”

## 常见追问

- 递归写法更符合定义，但需要 `O(n)` 调用栈。
- 局部反转、K 组反转都建立在相同的三指针操作上。
- 双向链表反转还需要同时交换 `next` 和 `prev`。
