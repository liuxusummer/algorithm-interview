# 082 · 删除排序链表中的重复元素 II

<ProblemMeta
  :tags="['字节面试题', '链表', '去重']"
  difficulty="medium"
  :appearances="28"
  pass-rate="45%"
  source-url="https://leetcode.cn/problems/remove-duplicates-from-sorted-list-ii/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(1)" />

## 题目

给定一条非递减有序链表，删除所有出现过重复值的结点，只保留原链表中从未重复出现的数字，并返回结果头结点。

### 示例

```text
输入：1 → 2 → 3 → 3 → 4 → 4 → 5
输出：1 → 2 → 5
```

```text
输入：1 → 1 → 1 → 2 → 3
输出：2 → 3
```

## 容易混淆的地方

这题不是“每个值只留一个”。如果某个值重复出现，该值的所有结点都要删除。

有序性质让相同值连续出现，可以一次跳过整段重复结点。

## Python 实现

```python
from typing import Optional


class Solution:
    def deleteDuplicates(
        self,
        head: Optional[ListNode],
    ) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        previous = dummy
        current = head

        # previous 始终指向确认保留的最后一个结点。
        while current:
            if current.next and current.val == current.next.val:
                duplicate_value = current.val

                while current and current.val == duplicate_value:
                    current = current.next

                previous.next = current
            else:
                previous = current
                current = current.next

        return dummy.next
```

## 为什么需要虚拟头结点

重复段可能从原头开始，例如 `1→1→2`。虚拟头结点始终保留一个确定不被删除的前驱，使跳过重复段统一为 `previous.next = current`。

## 指针分工

- `previous`：结果链表中最后一个确定保留的结点；
- `current`：当前尚未判断的结点；
- 发现重复时，`previous` 不动，`current` 跳过整个重复段；
- 当前值唯一时，两者一起向前推进。

## 正确性说明

链表有序，因此相同值组成连续段。算法判断每段长度：长度大于一时把前驱直接连接到下一段，删除该值全部结点；长度为一时把当前结点加入保留前缀。每个值段被准确分类一次，最终只留下从未重复的值。

## 复杂度

- 时间复杂度：`O(n)`。
- 空间复杂度：`O(1)`。

## 边界用例

| 输入 | 预期 | 检查点 |
|---|---|---|
| `1→2→3→3→4→4→5` | `1→2→5` | 多个重复段 |
| `1→1→1→2→3` | `2→3` | 头部重复 |
| `1→1` | 空 | 全部删除 |
| `1→2→3` | 原链表 | 无重复 |

## 90 秒面试表达

“题目要求重复值全部删除。链表有序，所以相同值连续。我用虚拟头结点和 `previous` 指向最后一个确定保留的结点。发现当前值与下一个相同时，记录这个值并让 `current` 跳过整段，再把 `previous.next` 接到下一段；值唯一时正常推进。每个结点访问一次，时间 `O(n)`、空间 `O(1)`。”

## 常见追问

- 如果每个重复值保留一个，只需让当前结点跳过后续相同结点。
- 无序链表需要哈希计数，通常使用 `O(n)` 空间。
- 如果要返回被删除值列表，可在发现重复段时记录。
