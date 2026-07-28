# 092 · 反转链表 II

<ProblemMeta
  :tags="['字节面试题', '链表', '局部反转', '华为面试题']"
  difficulty="medium"
  :appearances="18"
  pass-rate="55%"
  source-url="https://leetcode.cn/problems/reverse-linked-list-ii/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(1)" />

## 题目

给定单链表头结点 `head` 和两个位置 `left`、`right`，反转从第 `left` 个到第 `right` 个结点的链表区间，并返回新头结点。位置从 `1` 开始。

### 示例

```text
输入：1 → 2 → 3 → 4 → 5，left = 2，right = 4
输出：1 → 4 → 3 → 2 → 5
```

## 优化抓手

先用虚拟头结点找到反转区间前驱 `before`。保持区间首结点 `current` 不动，每轮把 `current.next` 摘下并插到 `before` 后面。

这个“头插法”完成 `right - left` 次后，区间恰好被反转。

## Python 实现

```python
from typing import Optional


class Solution:
    def reverseBetween(
        self,
        head: Optional[ListNode],
        left: int,
        right: int,
    ) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        before = dummy

        for _ in range(left - 1):
            before = before.next

        current = before.next

        # 反复把 current 后面的结点摘下并插到区间头部。
        for _ in range(right - left):
            moving = current.next
            current.next = moving.next
            moving.next = before.next
            before.next = moving

        return dummy.next
```

## 指针变化

假设局部状态为：

```text
before → current → moving → rest
```

一次头插后变成：

```text
before → moving → current → rest
```

`current` 始终是已反转部分的尾部，下一轮继续摘取它后面的结点。

## 正确性说明

每次循环都把区间中尚未反转的第一个结点移动到反转区间头部，同时保持区间前后连接完整。执行 `right - left` 次后，区间内除首结点外的所有结点都依次移到头部，得到完整逆序；区间外结点顺序不变。

## 复杂度

- 时间复杂度：`O(n)`。
- 空间复杂度：`O(1)`。

## 边界用例

| 链表 | `left, right` | 预期 | 检查点 |
|---|---|---|---|
| `1→2→3→4→5` | `2,4` | `1→4→3→2→5` | 中间区间 |
| `1→2→3` | `1,3` | `3→2→1` | 包含头结点 |
| `1` | `1,1` | `1` | 无需反转 |
| `1→2→3` | `2,2` | 原链表 | 单点区间 |

## 90 秒面试表达

“我用虚拟头结点找到反转区间的前驱。然后保持区间首结点作为局部尾部，每次摘下它后面的结点，插到区间最前面。执行 `right-left` 次后整个区间逆序，前后连接始终有效。时间 `O(n)`、空间 `O(1)`，虚拟头结点也覆盖了从原头开始反转的情况。”

## 常见追问

- K 个一组翻转需要先确认当前组有足够结点，再执行区间反转。
- 如果要反转多个互不相交区间，可以复用相同局部操作。
- 递归写法可以反转前 N 个结点，但需要额外调用栈。
