# 110 · 平衡二叉树

<ProblemMeta
  :tags="['Hot100', '大厂面试', '二叉树', '后序遍历']"
  difficulty="easy"
  :appearances="87"
  pass-rate="59%"
  source-url="https://leetcode.cn/problems/balanced-binary-tree/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(h)" />

## 题目

判断一棵二叉树是否高度平衡：任意结点左右子树的高度差都不超过 1。

直接对每个结点重复计算高度最坏会达到 `O(n²)`。更好的做法是一次后序遍历，让递归同时返回“高度”和“不平衡信号”。

## Python 实现

```python
from typing import Optional


class Solution:
    def isBalanced(self, root: Optional[TreeNode]) -> bool:
        def height(node: Optional[TreeNode]) -> int:
            if node is None:
                return 0

            left_height = height(node.left)
            if left_height == -1:
                return -1

            right_height = height(node.right)
            if right_height == -1:
                return -1

            if abs(left_height - right_height) > 1:
                return -1

            return max(left_height, right_height) + 1

        return height(root) != -1
```

## 返回值设计

- 非负数：当前子树的真实高度；
- `-1`：当前子树已经不平衡。

父结点发现任一子树返回 `-1` 后立即向上传播，无需继续计算无用高度。这是一类常见的“正常结果 + 异常哨兵”树形递归。

## 正确性与复杂度

后序遍历先获得左右子树结论。若任一子树不平衡，整棵当前子树必不平衡；否则只需检查两侧高度差，并返回当前高度。每个结点最多访问一次，时间 `O(n)`，递归空间 `O(h)`。

## 面试追问

- 自顶向下反复求高度为何最坏 `O(n²)`？退化树中同一结点会被多次计算。
- Python 面对极深树可能触发递归深度限制，工程中可改显式栈后序遍历。
