# 05 · 二叉树与递归

树题的关键是先定义递归函数的语义，再决定当前节点应在递归调用之前、之间还是之后处理。

## 专题深入

[二叉树与递归系统详解](./tree-recursion)从递归契约出发，系统讲解前中后序、递归与迭代、DFS 与 BFS、路径问题、最近公共祖先、从遍历序列建树和树形动态规划，并配有逐步演算与完整 Python 例题。

## Python 结点约定

题解沿用力扣提供的结点结构：

```python
class TreeNode:
    def __init__(
        self,
        val: int = 0,
        left: "TreeNode | None" = None,
        right: "TreeNode | None" = None,
    ):
        self.val = val
        self.left = left
        self.right = right
```

## 建议学习顺序

### 1. 遍历框架

- [094 · 二叉树的中序遍历](/problems/094-binary-tree-inorder-traversal)：显式栈模拟递归。
- [230 · 二叉搜索树中第 K 小的元素](/problems/230-kth-smallest-element-in-a-bst)：利用 BST 中序递增并提前停止。
- [102 · 二叉树的层序遍历](/problems/102-binary-tree-level-order-traversal)：BFS 队列与层大小。
- [103 · 二叉树的锯齿形层序遍历](/problems/103-binary-tree-zigzag-level-order-traversal)：分层与输出方向解耦。
- [199 · 二叉树的右视图](/problems/199-binary-tree-right-side-view)：提取每层最后结点。

### 2. 基础递归与结构关系

- [104 · 二叉树的最大深度](/problems/104-maximum-depth-of-binary-tree)：定义子树返回值。
- [226 · 翻转二叉树](/problems/226-invert-binary-tree)：递归处理并交换左右子树。
- [101 · 对称二叉树](/problems/101-symmetric-tree)：交叉镜像比较。
- [572 · 另一棵树的子树](/problems/572-subtree-of-another-tree)：枚举候选根与同树判断。
- [236 · 二叉树的最近公共祖先](/problems/236-lowest-common-ancestor-of-a-binary-tree)：由左右递归结果判断分叉点。

### 3. 自底向上与树形 DP

- [543 · 二叉树的直径](/problems/543-diameter-of-binary-tree)：返回深度，同时更新全局路径。
- [124 · 二叉树中的最大路径和](/problems/124-binary-tree-maximum-path-sum)：区分单边贡献与完整路径。
- [662 · 二叉树最大宽度](/problems/662-maximum-width-of-binary-tree)：完全二叉树编号与层内归一化。

### 4. 从遍历序列构造

- [105 · 从前序与中序遍历序列构造二叉树](/problems/105-construct-binary-tree-from-preorder-and-inorder-traversal)：前序定根、中序分区。

## 树题检查清单

- 递归函数返回的语义是否能用一句话说明？
- 空结点应该返回什么单位元？
- 当前结点应在递归之前、之间还是之后处理？
- 返回给父结点的信息与更新全局答案的信息是否不同？
- 路径长度按结点数还是边数计算？
- BFS 是否在每轮开始时固定了层大小？
- 退化成单链时递归深度是否可接受？
