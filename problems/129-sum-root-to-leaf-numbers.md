# 129 · 求根节点到叶节点数字之和

<ProblemMeta
  :tags="['Hot100', '大厂面试', '二叉树', 'DFS']"
  difficulty="medium"
  :appearances="100"
  pass-rate="71%"
  source-url="https://leetcode.cn/problems/sum-root-to-leaf-numbers/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(h)" />

## 题目

树中每个结点存放 `0..9`。每条根到叶路径表示一个十进制整数，返回所有这些整数之和。

```text
    1
   / \
  2   3

路径数字：12、13，答案 25
```

## 路径状态如何传递

设到父结点为止形成的数字为 `prefix`，进入当前结点后新数字是：

```text
prefix * 10 + node.val
```

这个整数是不可变值，递归返回后天然恢复，不需要像路径列表那样显式 `pop`。

## Python 实现

```python
from typing import Optional


class Solution:
    def sumNumbers(self, root: Optional[TreeNode]) -> int:
        def dfs(node: Optional[TreeNode], prefix: int) -> int:
            if node is None:
                return 0

            current = prefix * 10 + node.val

            # 到叶结点时，一条完整数字构造完毕。
            if node.left is None and node.right is None:
                return current

            return dfs(node.left, current) + dfs(node.right, current)

        return dfs(root, 0)
```

## 正确性说明

由十进制拼接规则，递归参数 `current` 始终等于根到当前结点组成的数字。叶结点返回完整路径数字，内部结点返回左右子树所有路径数字之和，所以根结点最终返回全部答案。

## 复杂度与边界

- 每个结点访问一次，时间 `O(n)`；递归栈 `O(h)`。
- 空树返回 0；路径中的前导 0 不影响整数计算；只有叶结点才能结算数字。

## 面试追问

若数字可能很长或要求取模，只需把状态更新改为 `(prefix * 10 + value) % mod`，遍历结构不变。
