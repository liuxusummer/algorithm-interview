# 104 · 二叉树的最大深度

<ProblemMeta
  :tags="['Hot100', '大厂面试', '递归', '华为面试题']"
  difficulty="easy"
  :appearances="15"
  pass-rate="61%"
  source-url="https://leetcode.cn/problems/maximum-depth-of-binary-tree/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(h)" />

## 题目

给定二叉树根结点 `root`，返回它的最大深度。

最大深度是从根结点到最远叶子结点的最长路径上的结点数量。空树深度为 `0`。

### 示例

```text
输入：root = [3, 9, 20, null, null, 15, 7]
输出：3
解释：从根结点 3 到叶结点 15（或 7）的路径包含 3 个结点。
```

## 递归定义

一棵非空树的最大深度等于左右子树最大深度中的较大值加一：

```text
depth(node) = 1 + max(depth(node.left), depth(node.right))
```

## Python 实现

```python
from typing import Optional


class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        if not root:
            return 0

        left_depth = self.maxDepth(root.left)
        right_depth = self.maxDepth(root.right)
        # 当前深度等于更深子树的深度加一。
        return 1 + max(left_depth, right_depth)
```

## 递归函数的语义

`maxDepth(node)` 返回“以 `node` 为根的子树高度”。先获得左右子树高度，再加上当前这一层，是典型的自底向上递归。

## 正确性说明

空树深度为零。非空树到最远叶子的路径必然先经过根结点，再进入左右子树中较深的一侧。因此递归式准确计算当前树深度。所有子树都满足该定义时，根的返回值就是整棵树最大深度。

## 复杂度

- 时间复杂度：`O(n)`。
- 空间复杂度：`O(h)`，来自递归栈。

## 边界用例

| 树 | 预期 | 检查点 |
|---|---:|---|
| 空树 | 0 | 递归基线 |
| 单结点 | 1 | 只有根 |
| 完全二叉树三层 | 3 | 平衡树 |
| 单链树 N 个结点 | N | 最坏栈深 |

## 90 秒面试表达

“我把递归函数定义为返回当前子树的最大深度。空结点返回 0；非空结点递归得到左右深度，返回较大值加 1。每个结点访问一次，时间 `O(n)`；递归栈深度等于树高 `O(h)`，退化链表时最坏 `O(n)`。”

## 常见追问

- BFS 也可以按层计数，空间由最大宽度决定。
- 最小深度要特别处理只有一侧子树的结点，不能简单取最小值。
- 直径和最大路径和都在“返回子树信息”的同时更新全局答案。
