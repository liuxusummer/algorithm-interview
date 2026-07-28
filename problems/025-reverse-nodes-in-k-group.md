# 025 · K 个一组翻转链表

<ProblemMeta
  :tags="['Hot100', '大厂面试', '分组反转']"
  difficulty="hard"
  :appearances="55"
  pass-rate="51%"
  source-url="https://leetcode.cn/problems/reverse-nodes-in-k-group/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(1)" />

## 题目

给定单链表头结点 `head` 和正整数 `k`，每 `k` 个结点一组进行反转。最后不足 `k` 个的部分保持原顺序。

不能只交换结点中的值，必须真正修改结点连接。

### 示例

```text
输入：1 → 2 → 3 → 4 → 5，k = 2
输出：2 → 1 → 4 → 3 → 5
```

## 核心难点

每组需要完成三件事：

1. 先确认剩余结点至少有 `k` 个；
2. 反转当前组，同时保留下一组入口；
3. 把上一组尾部、当前组和下一组重新连接。

虚拟头结点让第一组和后续组使用相同逻辑。

## Python 实现

```python
from typing import Optional


class Solution:
    def reverseKGroup(
        self,
        head: Optional[ListNode],
        k: int,
    ) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        group_previous = dummy

        while True:
            kth = self._get_kth(group_previous, k)
            if not kth:
                return dummy.next

            group_next = kth.next
            previous = group_next
            current = group_previous.next

            while current is not group_next:
                next_node = current.next
                current.next = previous
                previous = current
                current = next_node

            old_group_head = group_previous.next
            group_previous.next = kth
            group_previous = old_group_head

    def _get_kth(
        self,
        start: ListNode,
        k: int,
    ) -> Optional[ListNode]:
        current = start

        for _ in range(k):
            current = current.next
            if not current:
                return None

        return current
```

## 为什么把 `previous` 初始化为下一组入口

普通链表反转把 `previous` 初始化为空。但当前组反转后，原组首结点会成为组尾，应该直接连接 `group_next`。

把 `previous = group_next`，可以在反转过程中一次性完成组尾连接。

## 正确性说明

每轮先确认并定位一组完整的 `k` 个结点。内部反转把这组顺序完全颠倒，并让新组尾连接下一组入口；随后让上一组尾连接新组头。已处理前缀始终正确，剩余不足 `k` 个时不再修改，因此最终结果满足题意。

## 复杂度

- 时间复杂度：`O(n)`。寻找组尾和反转的总工作量都是线性级别。
- 空间复杂度：`O(1)`。

## 边界用例

| 链表 | `k` | 预期 | 检查点 |
|---|---:|---|---|
| `1→2→3→4→5` | 2 | `2→1→4→3→5` | 尾部不足一组 |
| `1→2→3→4→5` | 3 | `3→2→1→4→5` | 一组反转 |
| `1→2` | 3 | 原链表 | 不足 K 个 |
| `1→2→3` | 1 | 原链表 | K 等于 1 |

## 90 秒面试表达

“每组先从上一组尾部向后找第 K 个结点，不足 K 个就直接结束。保存下一组入口后，用标准三指针反转当前组，但把 `previous` 初始化为下一组入口，这样原组首会自动连接后续。再让上一组尾连接新的组头，并把原组首更新为下一轮的前驱。每个结点处理常数次，时间 `O(n)`、空间 `O(1)`。”

## 常见追问

- K 为 2 时就是两两交换结点。
- 递归方案更短，但会使用 `O(n/k)` 调用栈。
- 如果最后不足 K 个也要反转，只需改变完整组检查规则。
