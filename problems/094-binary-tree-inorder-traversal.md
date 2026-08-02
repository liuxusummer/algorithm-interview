# 094 · 二叉树的中序遍历

<ProblemMeta
  :tags="['Hot100', '大厂面试', '树遍历']"
  difficulty="easy"
  :appearances="10"
  pass-rate="61%"
  source-url="https://leetcode.cn/problems/binary-tree-inorder-traversal/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(h)" />

## 题目

给定二叉树根结点 `root`，返回它的中序遍历结果。

中序遍历顺序为：

```text
左子树 → 当前结点 → 右子树
```

### 示例

```text
输入：root = [1, null, 2, 3]
输出：[1, 3, 2]
解释：按照“左子树 → 当前结点 → 右子树”的顺序访问所有结点。
```

## 递归与迭代

递归写法直接对应“左子树、当前结点、右子树”的定义：

1. 递归遍历左子树；
2. 把当前结点加入结果；
3. 递归遍历右子树。

迭代写法则用显式栈模拟上述调用过程：

- 沿左链不断入栈；
- 左侧走到底后弹出结点并访问；
- 转向该结点的右子树。

## 动画拆解：递归调用栈

递归代码虽然短，但面试时需要说清“为什么此刻访问当前结点”。下面同时展示当前结点、系统调用栈、已经产生的结果和正在执行的代码行。

<InorderTraversalDemo />

## Python 实现：递归版

```python
from typing import Optional


class Solution:
    def inorderTraversal(
        self,
        root: Optional[TreeNode],
    ) -> list[int]:
        result: list[int] = []

        def traverse(node: Optional[TreeNode]) -> None:
            if node is None:
                return

            # 中序遍历严格遵循：左子树 -> 当前结点 -> 右子树。
            traverse(node.left)
            result.append(node.val)
            traverse(node.right)

        traverse(root)
        return result
```

递归函数 `traverse(node)` 的语义是：按照中序顺序访问以 `node` 为根的整棵子树，并把结点值依次加入 `result`。空结点不产生任何结果，直接返回。

## Python 实现：迭代版

```python
from typing import Optional


class Solution:
    def inorderTraversal(
        self,
        root: Optional[TreeNode],
    ) -> list[int]:
        result: list[int] = []
        stack: list[TreeNode] = []
        current = root

        # 先一路压入左链；弹栈访问后再转向右子树。
        while current or stack:
            while current:
                stack.append(current)
                current = current.left

            current = stack.pop()
            result.append(current.val)
            current = current.right

        return result
```

## 栈中保存的含义

栈中的结点都是“左子树尚在处理，自己还没有访问”的祖先。弹出时说明它的左子树已经全部完成，因此可以访问当前结点，再进入右子树。

## 正确性说明

- 递归版对每个非空结点依次遍历左子树、访问当前结点、遍历右子树，直接符合中序遍历的定义。
- 迭代版先沿左链到达最左结点，随后按栈的后进先出顺序访问祖先，并在每次访问后处理右子树，相当于显式模拟递归调用栈。

因此两种写法都会按照“左、根、右”的顺序访问每个结点一次，得到正确的中序遍历结果。

## 复杂度

- 两种写法的时间复杂度都是 `O(n)`，每个结点访问一次。
- 递归版使用 `O(h)` 的系统调用栈。
- 迭代版使用 `O(h)` 的显式栈。
- `h` 为树高；树退化成链表时，空间复杂度最坏为 `O(n)`。

## 边界用例

| 树 | 预期 | 检查点 |
|---|---|---|
| 空树 | `[]` | 空输入 |
| 单结点 | `[root]` | 基础情况 |
| 只有左链 | 从叶到根 | 栈深度 |
| 只有右链 | 从根到叶 | 无左子树 |

## 90 秒面试表达

“中序遍历的顺序是左、根、右。递归版直接按照这个定义实现：递归左子树、记录当前值、递归右子树。迭代版用显式栈模拟递归，沿左链持续入栈，走到底后弹出并访问，再转向右子树。两种写法都会访问每个结点一次，时间 `O(n)`，额外空间都是树高 `O(h)`。”

## 常见追问

- 二叉搜索树的中序遍历结果非递减。
- Morris 遍历可把额外空间降为 `O(1)`，但会临时修改树结构。
- 前序迭代通常先压右子树再压左子树。
