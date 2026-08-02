# 101 · 对称二叉树

<ProblemMeta
  :tags="['Hot100', '大厂面试', '递归']"
  difficulty="easy"
  :appearances="14"
  pass-rate="57%"
  source-url="https://leetcode.cn/problems/symmetric-tree/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(h)" />

## 题目

给定二叉树根结点，判断它是否关于中心轴镜像对称。

### 示例

```text
输入：root = [1, 2, 2, 3, 4, 4, 3]
输出：true
解释：根结点左右两棵子树在结构和对应结点值上互为镜像。
```

### 镜像条件

两棵子树互为镜像，当且仅当：

1. 根结点值相同；
2. 左树的左子树与右树的右子树互为镜像；
3. 左树的右子树与右树的左子树互为镜像。

## Python 实现

```python
from typing import Optional


class Solution:
    def isSymmetric(self, root: Optional[TreeNode]) -> bool:
        if not root:
            return True
        return self._is_mirror(root.left, root.right)

    def _is_mirror(
        self,
        left: Optional[TreeNode],
        right: Optional[TreeNode],
    ) -> bool:
        if not left and not right:
            return True
        if not left or not right:
            return False

        # 镜像位置需要值相等，并交叉比较左右子树。
        return (
            left.val == right.val
            and self._is_mirror(left.left, right.right)
            and self._is_mirror(left.right, right.left)
        )
```

## 为什么不能分别比较左右子树

对称不是“左子树内部结构等于右子树内部结构”，而是交叉镜像。必须比较：

```text
left.left  ↔ right.right
left.right ↔ right.left
```

## 正确性说明

递归函数准确表达“两个结点为根的子树是否互为镜像”。空结点情况和结点值构成递归基线；非空且值相同时，交叉比较两对子树。所有镜像条件都满足时返回真，因此根的左右子树判断结果就是整棵树是否对称。

## 复杂度

- 时间复杂度：`O(n)`。
- 空间复杂度：`O(h)`，来自递归栈。

## 边界用例

| 场景 | 预期 | 检查点 |
|---|---|---|
| 空树 | `True` | 空输入 |
| 单结点 | `True` | 没有子树 |
| 结构对称、值不同 | `False` | 值比较 |
| 值相同、结构不对称 | `False` | 空结点位置 |

## 90 秒面试表达

“我定义辅助函数判断两个子树是否互为镜像。两个都为空时为真，只有一个为空时为假；否则要求结点值相同，并交叉递归比较左树的左与右树的右、左树的右与右树的左。每个结点访问一次，时间 `O(n)`，递归空间 `O(h)`。”

## 常见追问

- 迭代做法可以把成对结点放入队列。
- 判断两棵树相同是不交叉比较，对称树则需要交叉。
- N 叉树的镜像需要成对比较孩子列表的首尾。
