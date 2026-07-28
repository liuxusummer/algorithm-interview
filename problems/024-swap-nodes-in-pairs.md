# 024 · 两两交换链表中的节点

<ProblemMeta
  :tags="['腾讯面试题', '链表', '指针']"
  difficulty="medium"
  :appearances="8"
  pass-rate="48%"
  source-url="https://leetcode.cn/problems/swap-nodes-in-pairs/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(1)" />

## 题目

给定一个单链表，两两交换其中相邻的结点并返回交换后的头结点。必须真正调整结点连接，不能只交换结点值。

### 示例

```text
输入：1 → 2 → 3 → 4
输出：2 → 1 → 4 → 3
```

```text
输入：1 → 2 → 3
输出：2 → 1 → 3
```

## 核心思路

用虚拟头结点统一处理第一组和后续组。每轮令：

- `previous` 指向待交换二元组之前的结点；
- `first = previous.next`；
- `second = first.next`。

交换前：

```text
previous → first → second → following
```

交换后：

```text
previous → second → first → following
```

然后把 `previous` 移到 `first`，继续处理下一组。

## Python 实现

```python
from typing import Optional


class Solution:
    def swapPairs(
        self,
        head: Optional[ListNode],
    ) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        previous = dummy

        while previous.next and previous.next.next:
            first = previous.next
            second = first.next
            following = second.next

            # 按固定顺序重连，避免丢失后续链表。
            previous.next = second
            second.next = first
            first.next = following

            # first 已成为这一组的尾部，下一组从它后面开始。
            previous = first

        return dummy.next
```

## 正确性说明

每轮只修改当前相邻两个结点的连接，并把它们从 `first → second` 变为 `second → first`；`previous` 保证交换后的链表前缀仍与当前组相连，`following` 保证剩余后缀没有丢失。

完成一轮后，`previous` 前面的所有结点都已经按两两交换后的正确顺序排列。循环结束时，剩余结点不足两个：没有结点则全部完成，只有一个则按题意保持原位。因此返回链表正确。

## 复杂度

- 时间复杂度：`O(n)`，每个结点只处理一次；
- 空间复杂度：`O(1)`，只使用常数个指针。

## 边界用例

| 输入 | 输出 | 检查点 |
|---|---|---|
| 空链表 | 空链表 | 无结点 |
| `1` | `1` | 单个结点 |
| `1→2` | `2→1` | 恰好一组 |
| `1→2→3` | `2→1→3` | 奇数长度 |

## 90 秒面试表达

“我用虚拟头结点消除第一组的特殊处理。每轮找到前驱、第一结点、第二结点和后继，按 `前驱→第二→第一→后继` 重连，然后把前驱移动到这一组的新尾部。循环条件保证至少还有两个结点，奇数长度最后一个自然保留。时间 `O(n)`，空间 `O(1)`。”

## 常见追问

- 递归写法更短，但会占用 `O(n)` 调用栈；
- 若每 `k` 个结点翻转一次，需要先确认当前组长度不少于 `k`；
- 面试时应先保存 `following`，否则改指针后容易丢失后缀。
