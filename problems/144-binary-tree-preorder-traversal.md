# 144 · 二叉树的前序遍历

<ProblemMeta
  :tags="['Hot100', '大厂面试', '树遍历', '递归']"
  difficulty="easy"
  :appearances="84"
  pass-rate="72%"
  source-url="https://leetcode.cn/problems/binary-tree-preorder-traversal/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(h)" />

## 遍历顺序

前序遍历是“当前结点 → 左子树 → 右子树”。递归版对应定义，迭代版用栈保存稍后访问的子树。

## 示例

```text
输入：root = [1, null, 2, 3]
输出：[1, 2, 3]
解释：按照“根 → 左 → 右”的顺序访问所有结点。
```

## Python 实现：递归版

```python
from typing import List, Optional


class Solution:
    def preorderTraversal(self, root: Optional[TreeNode]) -> List[int]:
        answer: List[int] = []

        def dfs(node: Optional[TreeNode]) -> None:
            if node is None:
                return
            answer.append(node.val)
            dfs(node.left)
            dfs(node.right)

        dfs(root)
        return answer
```

## Python 实现：迭代版

```python
from typing import List, Optional


class Solution:
    def preorderTraversal(self, root: Optional[TreeNode]) -> List[int]:
        if root is None:
            return []

        answer: List[int] = []
        stack = [root]

        while stack:
            node = stack.pop()
            answer.append(node.val)

            # 栈后进先出：先压右边，才能先访问左边。
            if node.right:
                stack.append(node.right)
            if node.left:
                stack.append(node.left)

        return answer
```

## 正确性与复杂度

递归版直接遵循根、左、右。迭代版访问当前结点后把右、左子树依次压栈，因此左子树先弹出，顺序与递归一致。时间 `O(n)`，额外空间 `O(h)`，极端情况下为 `O(n)`。

## 遍历题组

- 094 中序：左、根、右；
- 144 前序：根、左、右；
- 145 后序：左、右、根。
