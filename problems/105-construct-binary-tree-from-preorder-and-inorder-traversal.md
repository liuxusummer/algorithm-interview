# 105 · 从前序与中序遍历序列构造二叉树

<ProblemMeta
  :tags="['Hot100', '大厂面试', '树构造']"
  difficulty="medium"
  :appearances="10"
  pass-rate="47%"
  source-url="https://leetcode.cn/problems/construct-binary-tree-from-preorder-and-inorder-traversal/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(n)" />

## 题目

给定一棵二叉树的前序遍历 `preorder` 和中序遍历 `inorder`，构造并返回这棵二叉树。

树中结点值互不相同，两个遍历序列都有效且来自同一棵树。

### 示例

```text
前序：[3,9,20,15,7]
中序：[9,3,15,20,7]

构造结果：
    3
   / \
  9  20
    /  \
   15   7
```

## 核心关系

- 前序遍历的第一个未使用元素是当前子树根；
- 根在中序遍历中的位置把区间分为左子树和右子树；
- 按前序顺序递归构造左子树，再构造右子树。

用哈希表预先记录中序下标，避免每次线性查找根位置。

## Python 实现

```python
from typing import Optional


class Solution:
    def buildTree(
        self,
        preorder: list[int],
        inorder: list[int],
    ) -> Optional[TreeNode]:
        self.preorder_index = 0
        inorder_position = {
            value: index
            for index, value in enumerate(inorder)
        }

        def build(
            inorder_left: int,
            inorder_right: int,
        ) -> Optional[TreeNode]:
            if inorder_left > inorder_right:
                return None

            root_value = preorder[self.preorder_index]
            self.preorder_index += 1
            root = TreeNode(root_value)

            middle = inorder_position[root_value]
            root.left = build(inorder_left, middle - 1)
            root.right = build(middle + 1, inorder_right)
            return root

        return build(0, len(inorder) - 1)
```

## 为什么必须先构造左子树

前序顺序是“根、左、右”。取出当前根后，下一个未使用前序元素属于左子树。只有左区间构造完，前序指针才会自然移动到右子树根。

## 为什么结点值需要唯一

哈希表使用结点值定位中序下标。若存在重复值，单凭前序与中序序列通常不能唯一确定每个根的位置，需要额外标识或约束。

## 正确性说明

每次递归取前序中的下一个值作为当前根，再用它在中序区间中的位置准确划分左右子树。前序顺序保证左区间先被构造、右区间后被构造。递归区间为空时返回空，最终每个值恰好创建一个结点，且两个遍历序列都与输入一致。

## 复杂度

- 时间复杂度：`O(n)`。每个结点创建一次，中序位置查询为 `O(1)`。
- 空间复杂度：`O(n)`，用于哈希表和递归栈。

## 边界用例

| 前序 | 中序 | 结构 | 检查点 |
|---|---|---|---|
| `[1]` | `[1]` | 单结点 | 基线 |
| `[1,2,3]` | `[3,2,1]` | 只有左链 | 深递归 |
| `[1,2,3]` | `[1,2,3]` | 只有右链 | 空左区间 |
| `[]` | `[]` | 空树 | 空输入 |

## 90 秒面试表达

“前序的下一个元素就是当前子树根，根在中序中的位置把区间分成左右子树。我先用哈希表记录所有中序下标，再维护一个全局前序指针。递归时取根、构造中序左区间、再构造右区间；顺序不能反，因为前序是根左后右。每个结点处理一次，时间 `O(n)`，空间 `O(n)`。”

## 常见追问

- 中序加后序也能唯一构造，后序指针应从末尾开始并先构造右子树。
- 前序加后序通常不能唯一确定普通二叉树。
- 如果输入可能非法，需要检查区间、长度和值集合是否一致。
