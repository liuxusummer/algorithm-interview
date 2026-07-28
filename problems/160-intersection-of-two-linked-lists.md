# 160 · 相交链表

<ProblemMeta
  :tags="['Hot100', '大厂面试', '双指针']"
  difficulty="easy"
  :appearances="14"
  pass-rate="45%"
  source-url="https://leetcode.cn/problems/intersection-of-two-linked-lists/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(m + n)" space="O(1)" />

## 题目

给定两个无环单链表的头结点 `headA` 和 `headB`，找出它们开始相交的第一个结点。如果不相交，返回空。

相交指两个指针引用同一个结点对象，不是结点值相等。相交后两条链表共享整个后缀。

## 直接方案

用集合保存第一条链表的所有结点，再扫描第二条链表寻找第一个已出现结点。时间 `O(m+n)`，空间 `O(m)`。

## 优化抓手

让两个指针分别从两条链表出发：

- `first` 到达 A 末尾后转到 B；
- `second` 到达 B 末尾后转到 A。

两者都走过 `m + n` 的总路径，长度差被自动抵消，最终会在交点或空指针处相遇。

## Python 实现

```python
from typing import Optional


class Solution:
    def getIntersectionNode(
        self,
        headA: ListNode,
        headB: ListNode,
    ) -> Optional[ListNode]:
        first = headA
        second = headB

        # 两指针各走 A + B；相交时同步到交点，否则同时到 None。
        while first is not second:
            first = first.next if first else headB
            second = second.next if second else headA

        return first
```

## 为什么切换链表能对齐

假设 A 独有长度为 `a`，B 独有长度为 `b`，公共后缀长度为 `c`。两个指针到达交点前分别走：

```text
first:  a + c + b
second: b + c + a
```

总长度相同，因此会同步到达交点。若没有公共后缀，两者会同步到达空指针。

## 正确性说明

每个指针依次走完 A 与 B 两条链表，只是顺序相反。两条总路径长度相同，独有前缀的长度差被另一条链表的切换抵消。若有交点，两者第一次引用相同对象时就是公共后缀起点；若无交点，最终同时为空。

## 复杂度

- 时间复杂度：`O(m + n)`。
- 空间复杂度：`O(1)`。

## 边界用例

| 场景 | 预期 | 检查点 |
|---|---|---|
| 两链表共享中间后缀 | 返回后缀首结点 | 基础路径 |
| 完全不相交 | 空 | 双指针同时结束 |
| 两个头结点相同 | 返回头结点 | 从起点相交 |
| 一条链表为空 | 空 | 空输入 |

## 90 秒面试表达

“相交要比较结点身份。用集合可以做，但需要线性空间。我让两个指针分别从 A、B 出发，到达末尾后切换到另一条链表。这样两个指针都走过 A 加 B 的总长度，原本的长度差被抵消。有交点时会在公共后缀起点相遇，没有交点时会同时变为空。时间 `O(m+n)`、空间 `O(1)`。”

## 常见追问

- 如果链表可能有环，需要先判断各自环入口，再分类讨论。
- 如果只给尾结点，可以先比较尾结点身份快速判断是否相交。
- 不允许修改链表；临时反转或打标记通常不符合题意。
