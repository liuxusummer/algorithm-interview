# 230 · 二叉搜索树中第 K 小的元素

<ProblemMeta
  :tags="['Hot100', '腾讯面试', '二叉搜索树', '中序遍历']"
  difficulty="medium"
  :appearances="11"
  pass-rate="49%"
  source-url="https://leetcode.cn/problems/kth-smallest-element-in-a-bst/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(h + k)" space="O(h)" />

## 题目

给定一棵二叉搜索树的根结点 `root` 和整数 `k`，返回树中第 `k` 小的结点值。`k` 从 1 开始计数。

### 示例

```text
输入：root = [3, 1, 4, null, 2], k = 1
输出：1
```

## 优化抓手

二叉搜索树满足：

```text
左子树值 < 根结点值 < 右子树值
```

所以中序遍历会按严格递增顺序访问结点。无需遍历并排序全部值，只需进行迭代中序遍历，在弹出第 `k` 个结点时立即返回。

## Python 实现

```python
from typing import Optional


class Solution:
    def kthSmallest(
        self,
        root: Optional[TreeNode],
        k: int,
    ) -> int:
        stack: list[TreeNode] = []
        current = root

        while current or stack:
            # 先走到当前子树最左端，栈顶就是下一个较小结点。
            while current:
                stack.append(current)
                current = current.left

            current = stack.pop()
            k -= 1
            if k == 0:
                return current.val

            current = current.right

        raise ValueError("k 超出结点数量")
```

## 栈不变量

栈中保存尚未访问的祖先路径。走完左链后弹出的结点没有更小的未访问左侧结点，因此它就是中序序列中的下一个值；访问它后再进入右子树，继续保持相同性质。

## 正确性说明

二叉搜索树的中序遍历按从小到大顺序访问所有结点。算法的显式栈与递归中序遍历顺序完全相同，每弹出一个结点就将 `k` 减一。因此 `k` 首次变为零时，当前结点恰好是递增序列中的第 `k` 个，也就是第 `k` 小元素。

## 复杂度

令树高为 `h`：

- 时间复杂度：`O(h+k)`，先下降到最小值，再访问到第 `k` 个结点；
- 空间复杂度：`O(h)`，用于保存路径。

## 边界用例

| 场景 | 检查点 |
|---|---|
| 只有根结点，`k=1` | 直接返回根值 |
| `k=1` | 返回全树最小值 |
| `k=结点数` | 返回全树最大值 |
| 树退化成链 | 栈最坏为 `O(n)` |

## 90 秒面试表达

“BST 的中序遍历天然递增。我用显式栈做中序遍历：不断压入左链，弹出时就是下一个最小值，每弹出一次让 `k` 减一，减到零立即返回，再进入右子树。这样不用收集和排序所有值，时间 `O(h+k)`、空间 `O(h)`。”

## 常见追问

- 若频繁查询不同 `k`，可在每个结点维护子树大小；
- 平衡 BST 的单次带子树大小查询可降到 `O(log n)`；
- 普通二叉树没有中序有序性质，只能收集后选择或排序。
