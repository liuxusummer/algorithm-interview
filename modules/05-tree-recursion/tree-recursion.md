---
title: 二叉树与递归系统详解
description: 从递归函数契约出发，系统掌握二叉树遍历、DFS 与 BFS、分治、路径问题、最近公共祖先、建树和树形动态规划。
---

# 二叉树与递归系统详解

二叉树题看似变化很多：遍历、深度、路径、祖先、对称、建树、搜索树、树形 DP……但绝大多数题都可以从同一个问题开始：

> 假设左右子树已经处理完，当前结点需要从它们那里得到什么，又应该向父结点返回什么？

这就是树上递归的核心。递归不是“函数自己调用自己”，而是把整棵树的问题拆成两个结构相同、规模更小的子树问题。

## 一、先建立树题的心智模型

对于任意结点 `node`，一棵二叉树都可以分成：

```text
当前结点 node
左子树 node.left
右子树 node.right
```

如果一个问题对每棵子树都有相同定义，就很适合递归。

例如“求树高”：

```text
当前树的高度
= 1 + max(左子树高度, 右子树高度)
```

“判断两棵树是否相同”：

```text
当前两棵树相同
= 当前值相同
  且左子树相同
  且右子树相同
```

“求二叉树最大路径和”：

```text
父结点只需要当前子树能提供的最大单边贡献
全局答案还要考虑左贡献 + 当前值 + 右贡献
```

树题的关键不是看见结点就写 DFS，而是先确定递归调用之间传递的信息。

## 二、统一结点定义

本站题解沿用力扣的二叉树结点：

```python
from typing import Optional


class TreeNode:
    def __init__(
        self,
        val: int = 0,
        left: Optional["TreeNode"] = None,
        right: Optional["TreeNode"] = None,
    ):
        self.val = val
        self.left = left
        self.right = right
```

代码中的 `Optional[TreeNode]` 表示变量可能是一个结点，也可能是空结点 `None`。

## 三、写递归前必须回答的五个问题

### 1. 函数的输入是什么

最常见输入是当前子树根结点：

```python
def dfs(node: Optional[TreeNode]):
    ...
```

路径题还可能需要携带状态：

```python
def dfs(node, current_sum, path):
    ...
```

双树比较会同时传入两个结点：

```python
def same(first, second):
    ...
```

### 2. 函数返回什么

必须能用一句话说清：

```text
dfs(node) 返回以 node 为根的子树高度。
```

或者：

```text
dfs(node) 返回从 node 向下延伸的最大单边路径贡献。
```

如果这句话含糊，递归代码通常也会混乱。

### 3. 空结点返回什么

空结点返回值是递归的单位元：

| 问题 | 空结点返回 |
|---|---|
| 高度 | `0` |
| 结点数量 | `0` |
| 路径和累加 | `0` 或题目定义的无效值 |
| 判断两树相同 | 需要同时检查两边是否为空 |
| 搜索目标 | `None` |

### 4. 当前结点何时处理

- 递归之前处理：前序；
- 左右递归之间处理：中序；
- 左右递归之后处理：后序。

### 5. 是否需要全局答案

有些信息要返回给父结点，有些信息只用于更新最终答案。

例如二叉树直径：

- 返回父结点的是“当前子树高度”；
- 更新全局答案的是“左高度 + 右高度”。

这两者不是同一个量。

## 四、前序、中序、后序到底表示什么

考虑这棵树：

```text
        1
       / \
      2   3
     / \
    4   5
```

三种深度优先遍历：

| 遍历 | 顺序 | 结果 |
|---|---|---|
| 前序 | 根 → 左 → 右 | `1, 2, 4, 5, 3` |
| 中序 | 左 → 根 → 右 | `4, 2, 5, 1, 3` |
| 后序 | 左 → 右 → 根 | `4, 5, 2, 3, 1` |

通用递归框架：

```python
def traverse(node: Optional[TreeNode]) -> None:
    if node is None:
        return

    # 前序位置：刚进入当前结点
    traverse(node.left)

    # 中序位置：左子树已经处理完成
    traverse(node.right)

    # 后序位置：左右子树都处理完成
```

### 前序适合什么

前序位置拿到的是“从父结点传下来的信息”，适合：

- 记录当前路径；
- 维护从根到当前结点的状态；
- 复制或翻转树；
- 序列化；
- 构造树时先创建根结点。

### 中序适合什么

中序位置在二叉搜索树中尤其重要：

- BST 中序结果有序；
- 求第 K 小元素；
- 验证 BST；
- 把 BST 转成有序序列。

### 后序适合什么

后序位置已经拿到左右子树结果，适合：

- 高度与直径；
- 平衡判断；
- 最大路径和；
- 子树信息汇总；
- 删除树；
- 树形动态规划。

## 五、例题一：中序遍历的递归与迭代

[094 · 二叉树的中序遍历](../../problems/094-binary-tree-inorder-traversal)是理解递归调用栈的最佳起点。

### 递归版

```python
def inorder_traversal(
    root: Optional[TreeNode],
) -> list[int]:
    result: list[int] = []

    def traverse(node: Optional[TreeNode]) -> None:
        if node is None:
            return

        # 左子树完成后访问当前结点，再进入右子树。
        traverse(node.left)
        result.append(node.val)
        traverse(node.right)

    traverse(root)
    return result
```

递归函数的契约：

```text
traverse(node) 按中序顺序访问 node 的整棵子树，
并把结果追加到 result。
```

### 迭代版

```python
def inorder_iterative(
    root: Optional[TreeNode],
) -> list[int]:
    result: list[int] = []
    stack: list[TreeNode] = []
    current = root

    while current or stack:
        # 模拟递归进入左子树，沿左链保存祖先。
        while current:
            stack.append(current)
            current = current.left

        # 左子树处理完成，返回当前结点。
        current = stack.pop()
        result.append(current.val)

        # 接下来递归处理右子树。
        current = current.right

    return result
```

### 显式栈里保存什么

栈中结点表示：

```text
已经进入这个结点，
但它的左子树还没完全处理完，
所以当前结点自己也还没访问。
```

走到最左侧后，弹栈就等价于一次递归返回。

## 六、递归调用是怎样展开的

仍然使用：

```text
    2
   / \
  1   3
```

调用 `traverse(2)` 时：

```text
traverse(2)
├─ traverse(1)
│  ├─ traverse(None)
│  ├─ visit 1
│  └─ traverse(None)
├─ visit 2
└─ traverse(3)
   ├─ traverse(None)
   ├─ visit 3
   └─ traverse(None)
```

每层调用都有自己的局部变量和返回位置。系统调用栈保存的就是这些尚未完成的现场。

## 七、例题二：最大深度——最纯粹的分治

[104 · 二叉树的最大深度](../../problems/104-maximum-depth-of-binary-tree)的递归定义是：

```text
空树深度 = 0
非空树深度 = 1 + max(左子树深度, 右子树深度)
```

```python
def max_depth(root: Optional[TreeNode]) -> int:
    if root is None:
        return 0

    left_depth = max_depth(root.left)
    right_depth = max_depth(root.right)

    return 1 + max(left_depth, right_depth)
```

### 逐步计算

```text
        1
       / \
      2   3
     /
    4
```

自底向上：

| 结点 | 左深度 | 右深度 | 返回 |
|---:|---:|---:|---:|
| 4 | 0 | 0 | 1 |
| 2 | 1 | 0 | 2 |
| 3 | 0 | 0 | 1 |
| 1 | 2 | 1 | 3 |

这类写法叫作**自底向上**：先得到子树答案，再计算当前答案。

## 八、自顶向下与自底向上

### 自顶向下

把父结点的信息通过参数传给子结点：

```python
def max_depth_top_down(root: Optional[TreeNode]) -> int:
    best = 0

    def dfs(node: Optional[TreeNode], depth: int) -> None:
        nonlocal best

        if node is None:
            return

        best = max(best, depth)
        dfs(node.left, depth + 1)
        dfs(node.right, depth + 1)

    dfs(root, 1)
    return best
```

### 自底向上

子结点把信息通过返回值交给父结点：

```python
def depth(node: Optional[TreeNode]) -> int:
    if node is None:
        return 0

    return 1 + max(depth(node.left), depth(node.right))
```

### 如何选择

| 场景 | 更自然的方式 |
|---|---|
| 路径上累加状态 | 自顶向下 |
| 需要子树高度、大小、最优值 | 自底向上 |
| 记录所有根到叶路径 | 自顶向下 |
| 判断平衡、直径、最大路径和 | 自底向上 |

两种方式可以组合，但要避免同时用参数和返回值表达同一份信息。

## 九、例题三：二叉树直径

[543 · 二叉树的直径](../../problems/543-diameter-of-binary-tree)要求任意两个结点之间最长路径的边数。

### 最容易混淆的两个量

递归向父结点返回：

```text
从当前结点向下走的最大深度
```

当前结点可以形成的完整路径：

```text
左子树最大深度 + 右子树最大深度
```

完整路径可能同时经过左右子树，不能整体返回给父结点，否则路径会出现分叉，不再是一条合法路径。

```python
def diameter_of_binary_tree(
    root: Optional[TreeNode],
) -> int:
    diameter = 0

    def depth(node: Optional[TreeNode]) -> int:
        nonlocal diameter

        if node is None:
            return 0

        left_depth = depth(node.left)
        right_depth = depth(node.right)

        # 经过当前结点的路径包含左右两条向下分支。
        diameter = max(
            diameter,
            left_depth + right_depth,
        )

        # 父结点只能选择其中一条分支继续向上连接。
        return 1 + max(left_depth, right_depth)

    depth(root)
    return diameter
```

### 为什么直径是边数

如果左右子树深度按结点数计算：

```text
left_depth + right_depth
```

正好是左右叶子之间的边数，不需要再加 1。

单结点树：

```text
left_depth = 0
right_depth = 0
diameter = 0
```

符合题意。

## 十、从直径到最大路径和

[124 · 二叉树中的最大路径和](../../problems/124-binary-tree-maximum-path-sum)与直径结构非常相似，但有两个变化：

1. 路径价值由结点值决定，不是边数；
2. 负贡献应该舍弃。

```python
def max_path_sum(root: Optional[TreeNode]) -> int:
    if root is None:
        raise ValueError("题目要求二叉树至少包含一个结点")

    best = root.val

    def contribution(node: Optional[TreeNode]) -> int:
        nonlocal best

        if node is None:
            return 0

        # 负贡献不如不选，因此与 0 取最大值。
        left = max(contribution(node.left), 0)
        right = max(contribution(node.right), 0)

        # 当前结点作为最高点，可以同时连接左右分支。
        best = max(best, left + node.val + right)

        # 返回父结点时只能选择一侧，保持路径不分叉。
        return node.val + max(left, right)

    contribution(root)
    return best
```

直径和最大路径和共同体现了一个高频模式：

```text
返回值：父结点继续连接时能使用的信息
全局答案：当前结点作为拐点时能形成的完整方案
```

## 十一、路径题先分清四件事

看到“路径”不要立刻套模板，先确认：

### 1. 起点和终点

- 必须从根开始吗？
- 必须到叶子结束吗？
- 可以是任意两个结点吗？
- 可以只选一个结点吗？

### 2. 路径方向

- 只能从父到子向下？
- 可以从左子树经过父结点再到右子树？
- 能否重复经过结点？

### 3. 长度单位

- 结点数；
- 边数；
- 结点值之和；
- 边权之和。

### 4. 返回值和答案是否相同

父结点需要的常常是一条单边路径，而全局答案可能是一条经过当前结点的双边路径。

## 十二、例题四：最近公共祖先

[236 · 二叉树的最近公共祖先](../../problems/236-lowest-common-ancestor-of-a-binary-tree)是“递归返回值语义”最经典的题。

定义：

```text
dfs(node) 返回当前子树中找到的目标结点，
或者已经确定的最近公共祖先；
若什么都没找到则返回 None。
```

```python
def lowest_common_ancestor(
    root: Optional[TreeNode],
    p: TreeNode,
    q: TreeNode,
) -> Optional[TreeNode]:
    if root is None or root is p or root is q:
        return root

    left_result = lowest_common_ancestor(root.left, p, q)
    right_result = lowest_common_ancestor(root.right, p, q)

    if left_result is not None and right_result is not None:
        # 两个目标分居左右，当前结点是第一次汇合的位置。
        return root

    return (
        left_result
        if left_result is not None
        else right_result
    )
```

### 三种情况

| 左递归 | 右递归 | 当前结论 |
|---|---|---|
| 空 | 空 | 当前子树没有目标 |
| 非空 | 空 | 答案或目标在左侧 |
| 空 | 非空 | 答案或目标在右侧 |
| 非空 | 非空 | 当前结点是最近公共祖先 |

### 为什么遇到 `p` 或 `q` 直接返回

题目允许结点是自己的祖先。如果当前结点就是 `p`，而 `q` 位于它的子树中，最近公共祖先就是 `p`。

这个简洁写法依赖一个前提：

```text
p 和 q 都保证存在于树中。
```

如果目标可能不存在，递归还要额外返回找到目标的数量。

## 十三、双树递归：对称与相同

[101 · 对称二叉树](../../problems/101-symmetric-tree)不是比较：

```text
左.left 和 右.left
```

而是交叉比较：

```text
左.left 和 右.right
左.right 和 右.left
```

```python
def is_symmetric(root: Optional[TreeNode]) -> bool:
    def mirror(
        left: Optional[TreeNode],
        right: Optional[TreeNode],
    ) -> bool:
        if left is None or right is None:
            return left is right

        if left.val != right.val:
            return False

        return (
            mirror(left.left, right.right)
            and mirror(left.right, right.left)
        )

    if root is None:
        return True

    return mirror(root.left, root.right)
```

这里 `left is right` 在两者都是 `None` 时为真，只有一边为空时为假。

## 十四、子树问题为什么经常是两层递归

[572 · 另一棵树的子树](../../problems/572-subtree-of-another-tree)包含两个不同任务：

1. 在主树中枚举可能的子树根；
2. 从候选根开始判断两棵树是否完全相同。

```python
def is_subtree(
    root: Optional[TreeNode],
    sub_root: Optional[TreeNode],
) -> bool:
    def same(
        first: Optional[TreeNode],
        second: Optional[TreeNode],
    ) -> bool:
        if first is None or second is None:
            return first is second

        return (
            first.val == second.val
            and same(first.left, second.left)
            and same(first.right, second.right)
        )

    if sub_root is None:
        return True

    if root is None:
        return False

    return (
        same(root, sub_root)
        or is_subtree(root.left, sub_root)
        or is_subtree(root.right, sub_root)
    )
```

不要把“枚举候选根”和“判断树相同”混进同一个含糊的递归函数。

## 十五、翻转二叉树：前序和后序都可以

[226 · 翻转二叉树](../../problems/226-invert-binary-tree)可以先交换，再递归：

```python
def invert_tree(
    root: Optional[TreeNode],
) -> Optional[TreeNode]:
    if root is None:
        return None

    # 先处理当前结点，再递归处理交换后的左右子树。
    root.left, root.right = root.right, root.left
    invert_tree(root.left)
    invert_tree(root.right)

    return root
```

也可以先递归得到翻转后的左右子树，再交换：

```python
def invert_tree_postorder(
    root: Optional[TreeNode],
) -> Optional[TreeNode]:
    if root is None:
        return None

    inverted_left = invert_tree_postorder(root.left)
    inverted_right = invert_tree_postorder(root.right)

    root.left = inverted_right
    root.right = inverted_left
    return root
```

中序遍历不适合直接照搬，因为交换左右子树后，遍历方向会发生变化，容易重复处理同一侧。

## 十六、广度优先遍历与“层”的边界

[102 · 二叉树的层序遍历](../../problems/102-binary-tree-level-order-traversal)使用队列。

```python
from collections import deque


def level_order(
    root: Optional[TreeNode],
) -> list[list[int]]:
    if root is None:
        return []

    queue = deque([root])
    levels: list[list[int]] = []

    while queue:
        # 必须在本层开始时固定长度。
        level_size = len(queue)
        current_level: list[int] = []

        for _ in range(level_size):
            node = queue.popleft()
            current_level.append(node.val)

            if node.left is not None:
                queue.append(node.left)
            if node.right is not None:
                queue.append(node.right)

        levels.append(current_level)

    return levels
```

### 为什么先保存 `level_size`

处理本层时会把下一层结点加入队列。如果循环条件直接使用不断变化的 `len(queue)`，本层与下一层会混在一起。

队列在每轮开始时保存的是：

```text
当前层所有尚未处理的结点。
```

## 十七、层序遍历的常见变形

### 锯齿形层序遍历

[103 · 二叉树的锯齿形层序遍历](../../problems/103-binary-tree-zigzag-level-order-traversal)可以保持 BFS 顺序不变，只在输出时反转奇数层。

### 二叉树右视图

[199 · 二叉树的右视图](../../problems/199-binary-tree-right-side-view)只需记录每层最后出队的结点。

### 最大宽度

[662 · 二叉树最大宽度](../../problems/662-maximum-width-of-binary-tree)为结点赋完全二叉树编号：

```text
左孩子编号 = 2 * index
右孩子编号 = 2 * index + 1
```

每层用：

```text
最后编号 - 第一编号 + 1
```

计算包含空位的宽度。为防编号快速增大，可以每层减去第一个编号做归一化。

## 十八、DFS 和 BFS 怎么选

| 问题信号 | 优先考虑 |
|---|---|
| 子树高度、大小、最优值 | DFS 后序 |
| 根到叶路径、路径状态 | DFS 前序 |
| 最近层、最少边数 | BFS |
| 按层输出 | BFS |
| 树很宽但不深 | DFS 可能更省内存 |
| 树很深且可能触发递归限制 | BFS 或迭代 DFS |

二叉树上两者时间通常都是 `O(n)`，差别主要在遍历顺序和额外空间峰值。

## 十九、从前序和中序构造二叉树

[105 · 从前序与中序遍历序列构造二叉树](../../problems/105-construct-binary-tree-from-preorder-and-inorder-traversal)依赖两个性质：

```text
前序：第一个元素是根
中序：根左边属于左子树，根右边属于右子树
```

示例：

```text
preorder = [3, 9, 20, 15, 7]
inorder  = [9, 3, 15, 20, 7]
```

第一步：

```text
根 = 3
中序左侧 [9]           → 左子树
中序右侧 [15, 20, 7]  → 右子树
```

为了避免每层线性查找根位置，先建立哈希表。

```python
def build_tree(
    preorder: list[int],
    inorder: list[int],
) -> Optional[TreeNode]:
    inorder_index = {
        value: index
        for index, value in enumerate(inorder)
    }
    preorder_index = 0

    def build(
        inorder_left: int,
        inorder_right: int,
    ) -> Optional[TreeNode]:
        nonlocal preorder_index

        if inorder_left > inorder_right:
            return None

        # 前序序列按“根、左、右”消费根结点。
        root_value = preorder[preorder_index]
        preorder_index += 1

        root = TreeNode(root_value)
        split = inorder_index[root_value]

        root.left = build(inorder_left, split - 1)
        root.right = build(split + 1, inorder_right)
        return root

    return build(0, len(inorder) - 1)
```

### 递归契约

```text
build(left, right)
根据 inorder[left:right + 1] 构造对应子树，
同时从 preorder 中按顺序消费所需根结点。
```

这个写法假设树中结点值互不相同。

## 二十、二叉搜索树的额外性质

二叉搜索树 BST 满足：

```text
左子树所有值 < 当前值 < 右子树所有值
```

因此中序遍历结果严格递增或非递减，取决于题目是否允许重复值。

[230 · 二叉搜索树中第 K 小的元素](../../problems/230-kth-smallest-element-in-a-bst)可以中序遍历，并在访问第 `k` 个结点时提前停止。

```python
def kth_smallest(
    root: Optional[TreeNode],
    k: int,
) -> int:
    stack: list[TreeNode] = []
    current = root

    while current or stack:
        while current:
            stack.append(current)
            current = current.left

        current = stack.pop()
        k -= 1

        if k == 0:
            return current.val

        current = current.right

    raise ValueError("k 超过二叉搜索树的结点数量")
```

普通二叉树题不要擅自使用 BST 的大小关系。

## 二十一、树形动态规划是什么

如果每个结点的最优答案由子结点若干状态组合而来，就可以看作树形 DP。

一般步骤：

1. 为每个结点定义有限个状态；
2. 递归得到左右子树状态；
3. 根据是否选择当前结点进行状态转移；
4. 返回当前结点状态给父结点。

例如“相邻结点不能同时选择”的树上打家劫舍，可以定义：

```text
skip  = 不选当前结点时的最大收益
take  = 选择当前结点时的最大收益
```

```python
def rob_tree(root: Optional[TreeNode]) -> int:
    def dfs(node: Optional[TreeNode]) -> tuple[int, int]:
        if node is None:
            return 0, 0

        left_skip, left_take = dfs(node.left)
        right_skip, right_take = dfs(node.right)

        take = node.val + left_skip + right_skip
        skip = (
            max(left_skip, left_take)
            + max(right_skip, right_take)
        )

        return skip, take

    skip_root, take_root = dfs(root)
    return max(skip_root, take_root)
```

这里返回多个值并不是技巧，而是父结点确实需要知道两种条件下的子树最优解。

## 二十二、递归如何转成迭代

递归调用栈隐式保存三类信息：

- 当前结点；
- 返回后继续执行的位置；
- 当前调用的局部状态。

简单遍历可以只保存结点：

```python
def preorder_iterative(
    root: Optional[TreeNode],
) -> list[int]:
    if root is None:
        return []

    result: list[int] = []
    stack = [root]

    while stack:
        node = stack.pop()
        result.append(node.val)

        # 栈后进先出，所以先压右，再压左。
        if node.right is not None:
            stack.append(node.right)
        if node.left is not None:
            stack.append(node.left)

    return result
```

需要后序状态时，可以保存“是否已经展开”：

```python
def postorder_iterative(
    root: Optional[TreeNode],
) -> list[int]:
    if root is None:
        return []

    result: list[int] = []
    stack: list[tuple[TreeNode, bool]] = [(root, False)]

    while stack:
        node, expanded = stack.pop()

        if expanded:
            result.append(node.val)
            continue

        # 第二次遇到当前结点时，左右子树已经处理完。
        stack.append((node, True))

        if node.right is not None:
            stack.append((node.right, False))
        if node.left is not None:
            stack.append((node.left, False))

    return result
```

`expanded` 就是在显式保存递归返回后的执行阶段。

## 二十三、Morris 遍历了解什么

Morris 遍历利用空闲右指针临时建立“返回路径”，可以在 `O(1)` 额外空间内完成遍历。

优点：

- 不使用递归栈或显式栈；
- 额外空间 `O(1)`。

代价：

- 会临时修改树结构；
- 代码复杂、边界更多；
- 面试中通常是进阶追问，不应替代首先写出的清晰递归或栈版本。

除非题目明确要求常数空间，否则优先保证正确和可解释。

## 二十四、正确性怎么证明

树递归常用结构归纳法。

以最大深度为例：

### 基础情况

空树返回 0，显然正确。

### 归纳假设

假设递归函数能正确返回左子树和右子树的最大深度。

### 归纳步骤

任何从当前根出发的最长路径必然进入左子树或右子树，所以当前深度等于：

```text
1 + max(左深度, 右深度)
```

因此当前子树也返回正确答案。

写树题证明时，不必逐个模拟所有结点；只要说明子树结果正确时，当前结点如何得到正确结果。

## 二十五、复杂度分析

### 时间复杂度

如果每个结点只处理常数次：

```text
O(n)
```

两层递归不一定是 `O(n²)`。例如左右子树递归访问的是互不重叠的结点，总访问次数仍是 `n`。

但子树判断可能在每个候选根再次比较整棵树，最坏会达到 `O(nm)`。

### 空间复杂度

递归栈深度等于树高 `h`：

```text
O(h)
```

- 平衡树：`h = O(log n)`；
- 退化成链表：`h = O(n)`。

BFS 队列空间取决于树的最大宽度，最坏也是 `O(n)`。

## 二十六、Python 递归深度问题

Python 默认递归深度通常约为一千层。二叉树退化成很长的单链时，递归 DFS 可能抛出：

```text
RecursionError
```

面试和工程中优先考虑：

1. 改成显式栈迭代；
2. 如果输入规模可控，保留递归以换取清晰性；
3. 不要不加分析地依赖 `sys.setrecursionlimit`，因为过深的系统栈仍有风险。

## 二十七、最常见的错误

### 1. 递归语义不清

函数一会儿返回高度，一会儿返回路径和，导致父结点无法正确使用。

### 2. 空结点返回值错误

最大值问题中，空结点有时不能简单返回 0；需要根据“是否允许不选”决定单位元。

### 3. 边数和结点数混淆

- 深度通常按结点数；
- 直径题常按边数；
- 两者转换时容易多加或少加 1。

### 4. 全局答案与返回值混淆

最大路径和、直径等问题中，返回父结点的必须是单边结构。

### 5. 用值判断结点身份

题目给出结点 `p`、`q` 时，应使用：

```python
root is p
```

而不是只比较 `root.val == p.val`，因为树中可能有相同值。

### 6. BFS 没固定本层长度

入队下一层时改变了队列长度，导致层边界混乱。

### 7. 建树时反复切片

大量列表切片会复制数据，可能把时间和空间开销放大。推荐用下标区间。

### 8. 修改树后继续按原方向遍历

翻转、剪枝等原地修改题，要明确递归参数指向的是修改前还是修改后的子树。

## 二十八、看到树题如何快速决策

### 第一步：题目是否按层

- 最近层、最少边、每层输出：BFS；
- 否则继续考虑 DFS。

### 第二步：信息流方向

- 父结点把状态传给子结点：前序、自顶向下；
- 子结点把结果交给父结点：后序、自底向上；
- 利用 BST 有序性：中序。

### 第三步：定义返回值

问自己：

```text
如果左、右子树已经算好，父结点最需要它们返回什么？
```

### 第四步：区分局部与全局

当前结点能形成的完整答案，是否能原样继续连接到父结点？如果不能，就需要“返回值 + 全局答案”两个量。

### 第五步：检查退化树

验证空树、单结点、只有左链、只有右链、重复值和极深树。

## 二十九、题型与递归设计速查

| 题型 | 推荐顺序 | 返回值 |
|---|---|---|
| 最大深度 | 后序 | 子树高度 |
| 翻转二叉树 | 前序或后序 | 翻转后的根 |
| 对称二叉树 | 双树递归 | 是否镜像 |
| 最近公共祖先 | 后序 | 目标或祖先 |
| 二叉树直径 | 后序 | 子树高度 |
| 最大路径和 | 后序 | 最大单边贡献 |
| 根到叶路径 | 前序 | 常用参数携带状态 |
| BST 第 K 小 | 中序 | 可迭代提前停止 |
| 层序、右视图 | BFS | 通常不递归 |
| 前序 + 中序建树 | 前序消费根 | 构造出的子树根 |
| 树上打家劫舍 | 后序树形 DP | 多个条件状态 |

## 三十、配套训练题

### 遍历与层序

1. [094 · 二叉树的中序遍历](../../problems/094-binary-tree-inorder-traversal)
2. [102 · 二叉树的层序遍历](../../problems/102-binary-tree-level-order-traversal)
3. [103 · 二叉树的锯齿形层序遍历](../../problems/103-binary-tree-zigzag-level-order-traversal)
4. [199 · 二叉树的右视图](../../problems/199-binary-tree-right-side-view)

### 基础递归

1. [104 · 二叉树的最大深度](../../problems/104-maximum-depth-of-binary-tree)
2. [101 · 对称二叉树](../../problems/101-symmetric-tree)
3. [226 · 翻转二叉树](../../problems/226-invert-binary-tree)
4. [572 · 另一棵树的子树](../../problems/572-subtree-of-another-tree)

### 后序与树形 DP

1. [543 · 二叉树的直径](../../problems/543-diameter-of-binary-tree)
2. [124 · 二叉树中的最大路径和](../../problems/124-binary-tree-maximum-path-sum)
3. [236 · 二叉树的最近公共祖先](../../problems/236-lowest-common-ancestor-of-a-binary-tree)
4. [662 · 二叉树最大宽度](../../problems/662-maximum-width-of-binary-tree)

### BST 与构造

1. [230 · 二叉搜索树中第 K 小的元素](../../problems/230-kth-smallest-element-in-a-bst)
2. [105 · 从前序与中序遍历序列构造二叉树](../../problems/105-construct-binary-tree-from-preorder-and-inorder-traversal)

## 三十一、面试时怎么讲

推荐按六句话组织：

1. **递归契约**：`dfs(node)` 返回什么；
2. **基础情况**：空结点返回什么；
3. **递归顺序**：为什么使用前序、中序或后序；
4. **当前转移**：如何组合左右子树结果；
5. **正确性**：子树正确时，当前结点为什么也正确；
6. **复杂度**：每个结点访问次数、树高和最坏退化情况。

以直径为例：

> `depth(node)` 返回当前子树的最大深度。空结点深度为 0。递归得到左右深度后，经过当前结点的最长路径边数是左右深度之和，用它更新全局直径；返回父结点时只能选择较深的一侧并加 1。每个结点访问一次，时间 `O(n)`，递归栈是 `O(h)`。

## 三十二、最后记住什么

如果只能记住三句话：

1. **递归函数必须先有一句清晰的返回值语义；**
2. **前序传递父结点状态，后序汇总子树信息，中序利用 BST 有序性；**
3. **返回父结点的局部信息，不一定等于当前结点能形成的全局答案。**

真正掌握二叉树，不是背完几十段 DFS，而是看见陌生题时，能独立设计出递归契约。
