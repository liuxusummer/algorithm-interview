# 226 · 翻转二叉树

<ProblemMeta
  :tags="['Hot100', '大厂面试', '递归']"
  difficulty="easy"
  :appearances="10"
  pass-rate="54%"
  source-url="https://leetcode.cn/problems/invert-binary-tree/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(h)" />

## 题目

给定二叉树根结点 `root`，将整棵树左右翻转，并返回根结点。

翻转意味着每个结点的左、右子树都交换。

## 递归定义

要翻转以当前结点为根的树：

1. 递归翻转左子树；
2. 递归翻转右子树；
3. 交换两个翻转结果。

交换发生在递归前或递归后都可以，只要每个结点执行一次。

## Python 实现

```python
from typing import Optional


class Solution:
    def invertTree(
        self,
        root: Optional[TreeNode],
    ) -> Optional[TreeNode]:
        if not root:
            return None

        inverted_left = self.invertTree(root.left)
        inverted_right = self.invertTree(root.right)
        root.left = inverted_right
        root.right = inverted_left
        return root
```

## 是否会丢失子树

代码先把左右递归结果分别保存，再执行赋值，因此不会因为覆盖 `root.left` 而丢失原右子树。

也可以使用 Python 同时赋值，但显式变量更容易在面试中解释。

## 正确性说明

空树翻转后仍为空。对非空结点，递归正确翻转左右子树，再把两棵结果交换，当前整棵子树就成为原树的镜像。对所有结点应用同一过程，得到完整翻转树。

## 复杂度

- 时间复杂度：`O(n)`。
- 空间复杂度：`O(h)`。

## 边界用例

| 树 | 预期 | 检查点 |
|---|---|---|
| 空树 | 空树 | 空输入 |
| 单结点 | 原树 | 无孩子 |
| 只有左链 | 变为右链 | 单侧树 |
| 完全二叉树 | 所有左右结点交换 | 基础路径 |

## 90 秒面试表达

“翻转一棵树就是递归翻转左右子树，再交换两个结果。空结点直接返回空；非空结点保存左右递归结果，交叉赋给 `root.left` 和 `root.right`。每个结点交换一次，时间 `O(n)`，递归空间 `O(h)`。”

## 常见追问

- BFS 迭代也可以逐个交换队列中的结点。
- 判断两棵树是否互为镜像可以使用对称树的交叉递归。
- 当前实现原地修改树；若不能修改输入，需要创建新结点。
