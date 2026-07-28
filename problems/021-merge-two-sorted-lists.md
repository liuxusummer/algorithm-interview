# 021 · 合并两个有序链表

<ProblemMeta
  :tags="['Hot100', '大厂面试', '归并']"
  difficulty="easy"
  :appearances="29"
  pass-rate="58%"
  source-url="https://leetcode.cn/problems/merge-two-sorted-lists/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(m + n)" space="O(1)" />

## 题目

将两个非递减顺序的单链表合并为一个新的非递减链表。新链表由两个输入链表的原有结点组成。

### 示例

```text
输入：1 → 2 → 4，1 → 3 → 4
输出：1 → 1 → 2 → 3 → 4 → 4
```

## 核心思路

两个指针分别指向两条链表当前最小的未处理结点。每次把值较小的结点接到结果尾部，并移动对应指针。

虚拟头结点可以避免单独处理结果链表的第一个结点。

## Python 实现

```python
from typing import Optional


class Solution:
    def mergeTwoLists(
        self,
        list1: Optional[ListNode],
        list2: Optional[ListNode],
    ) -> Optional[ListNode]:
        dummy = ListNode()
        tail = dummy

        while list1 and list2:
            if list1.val <= list2.val:
                tail.next = list1
                list1 = list1.next
            else:
                tail.next = list2
                list2 = list2.next

            tail = tail.next

        tail.next = list1 if list1 else list2
        return dummy.next
```

## 为什么剩余部分可以整体连接

当一条链表耗尽时，另一条链表剩余结点本身已经有序，并且所有值都不小于结果尾部，因此无需逐个处理，可以直接连接。

## 正确性说明

每轮从两条链表的最小未处理结点中选择较小者，它一定是所有剩余结点的最小值。追加后结果仍然有序。循环结束时将另一条有序后缀整体连接，最终包含全部结点且保持非递减顺序。

## 复杂度

- 时间复杂度：`O(m + n)`。
- 空间复杂度：`O(1)`，复用输入结点。

## 边界用例

| `list1` | `list2` | 预期 | 检查点 |
|---|---|---|---|
| `1→2→4` | `1→3→4` | `1→1→2→3→4→4` | 基础路径 |
| 空 | 空 | 空 | 两者为空 |
| 空 | `0` | `0` | 单侧为空 |
| `1→1` | `1→1` | `1→1→1→1` | 重复值 |

## 90 秒面试表达

“两条链表都已经有序。我用两个指针比较当前结点，把较小结点接到结果尾部，并移动对应指针。虚拟头结点消除首次插入的特殊处理。一条链表耗尽后，另一条剩余部分可以整体连接。所有结点最多访问一次，时间 `O(m+n)`，复用原结点所以空间 `O(1)`。”

## 常见追问

- 递归写法更短，但会使用 `O(m+n)` 调用栈。
- 合并 K 条链表可以使用最小堆或分治归并。
- 如果不能修改输入，需要创建新结点。
