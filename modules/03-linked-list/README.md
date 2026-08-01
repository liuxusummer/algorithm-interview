# 03 · 链表

链表题考察的是指针关系，而不是语法熟练度。每一步都要明确“当前指针指向谁、修改后是否丢失后继节点”。

## Python 结点约定

题解沿用力扣预先提供的结点结构：

```python
class ListNode:
    def __init__(
        self,
        val: int = 0,
        next: "ListNode | None" = None,
    ):
        self.val = val
        self.next = next
```

判断链表相交或成环时比较的是结点对象身份，不是 `val`。

## 建议学习顺序

### 1. 基础连接与虚拟头结点

- [206 · 反转链表](/problems/206-reverse-linked-list)：保存后继、反转指向、整体推进。
- [021 · 合并两个有序链表](/problems/021-merge-two-sorted-lists)：虚拟头结点与尾指针。
- [024 · 两两交换链表中的节点](/problems/024-swap-nodes-in-pairs)：虚拟头结点与成对重连。
- [002 · 两数相加](/problems/002-add-two-numbers)：同步遍历、进位与结果构造。
- [082 · 删除排序链表中的重复元素 II](/problems/082-remove-duplicates-from-sorted-list-ii)：跳过整段重复值。

### 2. 快慢指针与长度差

- [019 · 删除链表的倒数第 N 个结点](/problems/019-remove-nth-node-from-end-of-list)：固定距离双指针。
- [141 · 环形链表](/problems/141-linked-list-cycle)：Floyd 判圈。
- [142 · 环形链表 II](/problems/142-linked-list-cycle-ii)：由相遇点定位环入口。
- [160 · 相交链表](/problems/160-intersection-of-two-linked-lists)：切换链表抵消长度差。
- [234 · 回文链表](/problems/234-palindrome-linked-list)：找中点、反转后半段并比较。

### 3. 局部反转与重排

- [092 · 反转链表 II](/problems/092-reverse-linked-list-ii)：区间头插法。
- [025 · K 个一组翻转链表](/problems/025-reverse-nodes-in-k-group)：定位、反转、重连。
- [143 · 重排链表](/problems/143-reorder-list)：找中点、反转后半段、交替合并。
- [328 · 奇偶链表](/problems/328-odd-even-linked-list)：两条子链稳定分组。

### 4. 多链表归并与排序

- [023 · 合并 K 个升序链表](/problems/023-merge-k-sorted-lists)：最小堆维护 K 个候选，或自底向上两两归并。
- [148 · 排序链表](/problems/148-sort-list)：快慢指针拆分与归并排序。

## 链表操作检查清单

- 修改 `next` 前是否保存了原后继？
- 删除头结点时是否需要虚拟头结点？
- 判断相交或环时是否比较结点身份？
- 分割链表后是否断开旧连接？
- 反转或重排后是否可能形成环？
- 空链表、单结点、两结点是否安全？
