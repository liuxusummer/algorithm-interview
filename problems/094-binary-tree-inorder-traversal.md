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
    1
     \
      2
     /
    3

输出：[1, 3, 2]
```

## 递归与迭代

递归写法直接对应定义，但迭代写法更能体现调用栈中保存了什么：

- 沿左链不断入栈；
- 左侧走到底后弹出结点并访问；
- 转向该结点的右子树。

## Python 实现

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

算法对每个子树先沿左链到达最左结点，随后按栈的后进先出顺序访问祖先，并在每次访问后处理右子树。这与“左、根、右”的递归定义一致，每个结点恰好入栈、出栈一次。

## 复杂度

- 时间复杂度：`O(n)`。
- 空间复杂度：`O(h)`，`h` 为树高；最坏为 `O(n)`。

## 边界用例

| 树 | 预期 | 检查点 |
|---|---|---|
| 空树 | `[]` | 空输入 |
| 单结点 | `[root]` | 基础情况 |
| 只有左链 | 从叶到根 | 栈深度 |
| 只有右链 | 从根到叶 | 无左子树 |

## 90 秒面试表达

“中序顺序是左、根、右。我用显式栈模拟递归：沿左链持续入栈，走到底后弹出并访问，再转向右子树。栈里保存的是左子树尚未完成、当前结点尚未访问的祖先。每个结点入栈出栈一次，时间 `O(n)`，空间是树高 `O(h)`。”

## 常见追问

- 二叉搜索树的中序遍历结果非递减。
- Morris 遍历可把额外空间降为 `O(1)`，但会临时修改树结构。
- 前序迭代通常先压右子树再压左子树。
