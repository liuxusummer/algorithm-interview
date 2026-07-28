# 236 · 二叉树的最近公共祖先

<ProblemMeta
  :tags="['Hot100', '大厂面试', '递归']"
  difficulty="medium"
  :appearances="41"
  pass-rate="47%"
  source-url="https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-tree/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(h)" />

## 题目

给定二叉树根结点 `root` 和树中的两个结点 `p`、`q`，返回它们的最近公共祖先。

最近公共祖先是最深的、同时拥有 `p` 和 `q` 作为后代的结点。结点也可以是自己的后代。

## 递归语义

定义递归函数返回：

- 当前子树未找到 `p` 或 `q`：返回空；
- 只找到其中一个：返回找到的结点；
- 左右子树分别找到目标：当前结点就是最近公共祖先。

如果当前结点本身是 `p` 或 `q`，直接返回当前结点。

## Python 实现

```python
from typing import Optional


class Solution:
    def lowestCommonAncestor(
        self,
        root: Optional[TreeNode],
        p: TreeNode,
        q: TreeNode,
    ) -> Optional[TreeNode]:
        if not root or root is p or root is q:
            return root

        left_result = self.lowestCommonAncestor(root.left, p, q)
        right_result = self.lowestCommonAncestor(root.right, p, q)

        if left_result and right_result:
            return root

        return left_result if left_result else right_result
```

## 为什么遇到目标结点直接返回

题目允许结点成为自己的祖先。如果当前结点是 `p`，且 `q` 位于它的子树中，那么最近公共祖先就是 `p`，无需继续向下确认后再改变答案。

题目保证两个结点都存在于树中，这使返回逻辑成立。

## 正确性说明

递归结果表示当前子树中发现的目标或最近公共祖先。左右结果都非空时，两个目标分布在当前结点两侧，当前结点是它们第一次汇合的位置；只有一侧非空时，答案完全位于该侧；当前结点等于目标时直接返回。自底向上得到的第一个分叉结点就是最近公共祖先。

## 复杂度

- 时间复杂度：`O(n)`，最坏访问全部结点。
- 空间复杂度：`O(h)`。

## 边界用例

| 场景 | 预期 | 检查点 |
|---|---|---|
| `p`、`q` 分处根两侧 | 根 | 左右都命中 |
| `p` 是 `q` 的祖先 | `p` | 结点可为自身祖先 |
| 两者位于同一子树 | 子树内部祖先 | 单侧返回 |
| `p` 与 `q` 为同一结点 | 该结点 | 身份比较 |

## 90 秒面试表达

“递归函数返回当前子树中找到的目标结点或最近公共祖先。空结点、当前结点等于 `p` 或 `q` 时直接返回。分别递归左右子树：两侧都非空说明两个目标在当前结点两侧，当前结点就是最近公共祖先；只有一侧非空就向上返回那一侧。最坏访问全树，时间 `O(n)`、空间 `O(h)`。”

## 常见追问

- 二叉搜索树可以利用值大小关系，只沿一条路径查找。
- 如果目标可能不存在，需要额外返回找到目标的数量。
- 多个结点的公共祖先可以把目标放入集合并扩展递归统计。
