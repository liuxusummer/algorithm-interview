# 098 · 验证二叉搜索树

<ProblemMeta
  :tags="['Hot100', '大厂面试', '二叉搜索树', '递归']"
  difficulty="medium"
  :appearances="84"
  pass-rate="39%"
  source-url="https://leetcode.cn/problems/validate-binary-search-tree/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(h)" />

## 容易写错的地方

BST 不只是满足“左孩子小、右孩子大”，而是整棵左子树都小于当前结点、整棵右子树都大于当前结点，并且题目要求严格不等，重复值也非法。

递归时为每个结点携带来自所有祖先的开区间 `(lower, upper)`，可以直接表达完整约束。

## 示例

```text
输入：root = [5, 1, 4, null, null, 3, 6]
输出：false
解释：值为 4 的结点位于根结点 5 的右子树中，但其子结点 3 小于 5，违反 BST 的全局范围约束。
```

## Python 实现：上下界递归

```python
from typing import Optional


class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        def validate(
            node: Optional[TreeNode],
            lower: float,
            upper: float,
        ) -> bool:
            if node is None:
                return True

            if not lower < node.val < upper:
                return False

            # 左子树收紧上界，右子树收紧下界。
            return (
                validate(node.left, lower, node.val)
                and validate(node.right, node.val, upper)
            )

        return validate(root, float("-inf"), float("inf"))
```

## 另一种思路：中序遍历

BST 的中序遍历必须严格递增。迭代中序遍历时保存上一个访问值，一旦当前值不大于它即可返回 `False`。上下界法更适合解释祖先约束，中序法能复用 094 的遍历模板。

## 正确性说明

根结点初始允许任意值。进入左子树时把当前值设为上界，进入右子树时设为下界，因此每个结点都同时满足所有祖先施加的约束。所有结点均通过检查当且仅当整棵树是合法 BST。

## 复杂度与边界

- 时间 `O(n)`；递归栈 `O(h)`，退化树最坏 `O(n)`。
- 空树合法；单结点合法；出现与祖先相等的值必须判错。

## 面试追问

- 若允许重复值，必须先明确重复值统一放左侧还是右侧。
- 只比较父子结点无法识别 `[5, 1, 6, null, null, 3, 7]` 这类跨层违规。
