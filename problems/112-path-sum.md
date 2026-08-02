# 112 · 路径总和

<ProblemMeta
  :tags="['Hot100', '大厂面试', '二叉树', '递归']"
  difficulty="easy"
  :appearances="72"
  pass-rate="56%"
  source-url="https://leetcode.cn/problems/path-sum/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(h)" />

## 题目

判断二叉树中是否存在一条从根结点到叶结点的路径，使路径上的结点值之和等于 `targetSum`。

“到叶结点”是关键：到达中间结点时即使剩余值为 0，也不能提前判定成功。

### 示例

```text
输入：root = [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1], targetSum = 22
输出：true
解释：根到叶路径 5 → 4 → 11 → 2 的结点和等于 22。
```

## Python 实现

```python
from typing import Optional


class Solution:
    def hasPathSum(
        self,
        root: Optional[TreeNode],
        targetSum: int,
    ) -> bool:
        if root is None:
            return False

        remaining = targetSum - root.val

        # 只有叶结点才是一条完整的根到叶路径。
        if root.left is None and root.right is None:
            return remaining == 0

        return (
            self.hasPathSum(root.left, remaining)
            or self.hasPathSum(root.right, remaining)
        )
```

## 递归语义

`hasPathSum(node, remaining)` 表示：从 `node` 出发，是否存在一条到叶结点的路径，其总和等于 `remaining`。进入结点时扣除当前值，叶结点负责做最终判断。

## 正确性与复杂度

任意根到叶路径必从根进入左子树或右子树，代码完整枚举这两种可能，并在每层精确扣除当前值，因此返回真当且仅当存在目标路径。最坏访问所有结点，时间 `O(n)`；递归栈 `O(h)`。

## 边界用例

- 空树返回 `False`，即使目标为 0；
- 负数结点存在时不能用“剩余值小于 0”剪枝；
- 单结点树只需比较根值与目标。

## 下一步

本题只返回是否存在。113 题需要返回全部路径，因此要在同一递归结构上加入路径选择与撤销。
