# 145 · 二叉树的后序遍历

<ProblemMeta
  :tags="['大厂面试', '树遍历', '递归', '栈']"
  difficulty="easy"
  :appearances="34"
  pass-rate="76%"
  source-url="https://leetcode.cn/problems/binary-tree-postorder-traversal/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(h)" />

## 遍历顺序

后序遍历是“左子树 → 右子树 → 当前结点”。它最适合处理需要先得到两个子树结果的问题，例如树高、直径、平衡性和最大路径和。

## 示例

```text
输入：root = [1, null, 2, 3]
输出：[3, 2, 1]
解释：按照“左 → 右 → 根”的顺序访问所有结点。
```

## Python 实现：递归版

```python
from typing import List, Optional


class Solution:
    def postorderTraversal(self, root: Optional[TreeNode]) -> List[int]:
        answer: List[int] = []

        def dfs(node: Optional[TreeNode]) -> None:
            if node is None:
                return
            dfs(node.left)
            dfs(node.right)
            answer.append(node.val)

        dfs(root)
        return answer
```

## Python 实现：迭代版

```python
from typing import List, Optional


class Solution:
    def postorderTraversal(self, root: Optional[TreeNode]) -> List[int]:
        if root is None:
            return []

        answer: List[int] = []
        stack = [(root, False)]

        while stack:
            node, visited = stack.pop()
            if visited:
                answer.append(node.val)
                continue

            # 第二次弹出才访问当前结点；左右子树先完成。
            stack.append((node, True))
            if node.right:
                stack.append((node.right, False))
            if node.left:
                stack.append((node.left, False))

        return answer
```

## 为什么使用 visited 标记

第一次遇到结点时安排它的左右子树，第二次遇到才访问自身，显式模拟递归的“回到当前栈帧”。这种写法比“根右左后反转”更容易扩展到真正的后序计算。

## 复杂度

每个结点进入和离开各一次，时间 `O(n)`；递归栈或显式栈最坏 `O(n)`，平均与树高相关。
