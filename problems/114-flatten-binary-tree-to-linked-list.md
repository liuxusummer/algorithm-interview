# 114 · 二叉树展开为链表

<ProblemMeta
  :tags="['Hot100', '大厂面试', '二叉树', '原地修改']"
  difficulty="medium"
  :appearances="47"
  pass-rate="74%"
  source-url="https://leetcode.cn/problems/flatten-binary-tree-to-linked-list/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(h)" />

## 题目

把二叉树原地展开成只使用 `right` 指针的链表，结点顺序与前序遍历一致，所有 `left` 指针必须置空。

## 逆前序递归

若按“右、左、根”的顺序递归，就可以维护已经展开好的后继链表 `previous`。处理当前结点时：

1. `node.right = previous`；
2. `node.left = None`；
3. 令 `previous = node`。

## Python 实现

```python
from typing import Optional


class Solution:
    def flatten(self, root: Optional[TreeNode]) -> None:
        previous: Optional[TreeNode] = None

        def dfs(node: Optional[TreeNode]) -> None:
            nonlocal previous
            if node is None:
                return

            # 必须先处理右子树，否则修改 right 后会丢失原结构。
            dfs(node.right)
            dfs(node.left)

            node.right = previous
            node.left = None
            previous = node

        dfs(root)
```

## 正确性说明

逆前序访问当前结点时，`previous` 已经是前序序列中当前结点之后的完整链表。把当前结点接到它前面，归纳可得最终根结点连接完整前序序列，且所有左指针被清空。

## 复杂度与追问

- 时间 `O(n)`，递归栈 `O(h)`。
- 可用 Morris 风格的前驱连接实现 `O(1)` 额外空间：把左子树最右结点连接到原右子树，再把左子树整体移到右侧。
