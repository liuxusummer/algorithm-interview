# 662 · 二叉树最大宽度

<ProblemMeta
  :tags="['字节面试题', '二叉树', 'BFS 编号']"
  difficulty="medium"
  :appearances="10"
  pass-rate="68%"
  source-url="https://leetcode.cn/problems/maximum-width-of-binary-tree/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(w)" />

## 题目

给定二叉树根结点，返回树的最大宽度。

一层的宽度由最左和最右非空结点之间的位置数决定，中间的空位置也要计入。

### 示例

```text
输入：[1,3,2,5,3,null,9]
输出：4
解释：第三层位置为 [5,3,null,9]
```

## 为什么不能只用队列长度

队列长度只统计实际结点数，而题目还要计算两端结点之间的空位。需要为结点分配它在完全二叉树中的位置编号。

若父结点编号为 `i`：

```text
左孩子：2i
右孩子：2i + 1
```

每层宽度是最后编号减第一编号加一。

## Python 实现

```python
from collections import deque
from typing import Optional


class Solution:
    def widthOfBinaryTree(
        self,
        root: Optional[TreeNode],
    ) -> int:
        if not root:
            return 0

        queue = deque([(root, 0)])
        maximum_width = 0

        while queue:
            level_size = len(queue)
            level_start = queue[0][1]
            last_position = 0

            for _ in range(level_size):
                node, position = queue.popleft()
                # 按完全二叉树编号，并减去本层起点避免编号无限膨胀。
                normalized = position - level_start
                last_position = normalized

                if node.left:
                    queue.append((node.left, 2 * normalized))
                if node.right:
                    queue.append((node.right, 2 * normalized + 1))

            maximum_width = max(
                maximum_width,
                last_position + 1,
            )

        return maximum_width
```

## 为什么每层要归一化编号

深树的完全二叉树编号会指数增长。在每层减去第一个编号，不改变同层结点之间的相对距离，却能把数字保持在合理范围。

子结点编号继续基于归一化位置计算，下一层的宽度关系仍然正确。

## 正确性说明

完全二叉树编号准确保留了空位置。每层 BFS 按从左到右顺序处理，首编号归一化为零，最后结点编号加一就是该层包含空位的宽度。归一化只做整体平移，不改变差值。比较所有层后得到最大宽度。

## 复杂度

- 时间复杂度：`O(n)`。
- 空间复杂度：`O(w)`。

## 边界用例

| 树 | 预期 | 检查点 |
|---|---:|---|
| 空树 | 0 | 空输入 |
| 单结点 | 1 | 单层 |
| 完全二叉树 | 最后一层结点数 | 无空洞 |
| 两侧深链 | 包含中间大量空位 | 编号差 |

## 90 秒面试表达

“队列长度不能计算中间空位。我按完全二叉树给每个结点编号，左孩子是 `2i`、右孩子是 `2i+1`。每层宽度等于最后编号减第一编号加一。为避免深树编号指数增长，每层都减去首编号做归一化，差值不变。每个结点处理一次，时间 `O(n)`、空间 `O(w)`。”

## 常见追问

- 普通层序最大结点数只需比较队列长度，不包含空位置。
- 如果语言整数会溢出，归一化尤其重要。
- 返回最大宽度所在层时，可在更新答案时同步记录深度。
