# 138 · 随机链表的复制

<ProblemMeta
  :tags="['Hot100', '大厂面试', '链表', '哈希表']"
  difficulty="medium"
  :appearances="58"
  pass-rate="73%"
  source-url="https://leetcode.cn/problems/copy-list-with-random-pointer/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(n)" />

## 题目

深拷贝一条链表。每个结点除 `next` 外还有 `random` 指针，它可以指向链表任意结点或空。

难点是新结点的 `random` 必须指向对应的新结点，不能残留对原链表的引用。

## Python 实现：哈希映射

```python
from typing import Optional


class Solution:
    def copyRandomList(
        self,
        head: Optional[Node],
    ) -> Optional[Node]:
        if head is None:
            return None

        copies: dict[Node, Node] = {}
        current = head

        # 第一遍只创建结点，建立“原结点 -> 新结点”映射。
        while current:
            copies[current] = Node(current.val)
            current = current.next

        current = head
        while current:
            clone = copies[current]
            clone.next = copies.get(current.next)
            clone.random = copies.get(current.random)
            current = current.next

        return copies[head]
```

## 正确性说明

第一遍为每个原结点创建唯一副本。第二遍把原结点的两类边通过映射转换成副本之间的边，因此新链表与原链表结构完全同构，且所有指针只指向新结点。

## 复杂度与进阶

- 时间 `O(n)`，哈希表空间 `O(n)`。
- 进阶 `O(1)` 空间：把副本插入原结点后面，借助 `original.next` 定位副本；设置随机指针后再拆分两条链表。面试中应先写稳妥哈希版，再说明穿插法。
