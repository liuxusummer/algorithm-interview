# 572 · 另一棵树的子树

<ProblemMeta
  :tags="['字节面试题', '二叉树', '递归匹配']"
  difficulty="medium"
  :appearances="17"
  pass-rate="46%"
  source-url="https://leetcode.cn/problems/subtree-of-another-tree/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(mn)" space="O(h₁ + h₂)" />

## 题目

给定两棵二叉树 `root` 和 `subRoot`，判断 `root` 中是否存在一棵与 `subRoot` 结构和结点值完全相同的子树。

子树必须包含某个结点及其全部后代，不能只选择部分后代。

## 拆成两个问题

1. `isSubtree`：在主树中枚举可能的子树根；
2. `_same_tree`：判断两棵树是否结构和值完全相同。

当主树当前结点与 `subRoot` 相同，或左、右子树中存在匹配时，返回真。

## Python 实现

```python
from typing import Optional


class Solution:
    def isSubtree(
        self,
        root: Optional[TreeNode],
        subRoot: Optional[TreeNode],
    ) -> bool:
        if not subRoot:
            return True
        if not root:
            return False

        # 当前结点先尝试整树匹配，失败后再搜索左右子树。
        return (
            self._same_tree(root, subRoot)
            or self.isSubtree(root.left, subRoot)
            or self.isSubtree(root.right, subRoot)
        )

    def _same_tree(
        self,
        first: Optional[TreeNode],
        second: Optional[TreeNode],
    ) -> bool:
        if not first and not second:
            return True
        if not first or not second:
            return False

        return (
            first.val == second.val
            and self._same_tree(first.left, second.left)
            and self._same_tree(first.right, second.right)
        )
```

## 为什么必须比较空结点位置

仅比较前序结点值可能把不同结构误判为相同。`_same_tree` 同时递归比较左右孩子以及空结点位置，确保结构和值都一致。

## 正确性说明

`_same_tree` 按结点值和左右结构递归，准确判断两树相同。`isSubtree` 对主树每个结点都尝试作为候选根，并递归搜索左右子树，因此所有可能子树根都会被检查；任意真实匹配会被找到，返回真时也一定存在完整同构子树。

## 复杂度

- 时间复杂度：最坏 `O(mn)`，主树每个结点都可能触发一次子树比较。
- 空间复杂度：`O(h₁ + h₂)`，来自嵌套递归栈。

## 边界用例

| 场景 | 预期 | 检查点 |
|---|---|---|
| 两树完全相同 | `True` | 根即候选 |
| 值相同但结构不同 | `False` | 空位置 |
| `subRoot` 位于深层 | `True` | 递归枚举 |
| 主树为空、子树非空 | `False` | 空主树 |

## 90 秒面试表达

“我拆成两个递归函数：一个判断两棵树是否完全相同，另一个在主树中枚举候选根。当前两树相同就返回真，否则继续在主树左右子树中搜索。相同判断必须同时比较值、左右结构和空结点位置。最坏主树每个结点都与子树比较，时间 `O(mn)`，递归空间 `O(h₁+h₂)`。”

## 常见追问

- 树序列化后使用 KMP 可以把匹配时间优化到线性级别。
- 序列化必须加入空结点标记，避免结构歧义。
- 判断“子结构”与“子树”不同，子结构通常不要求匹配到候选树的所有空后代。
