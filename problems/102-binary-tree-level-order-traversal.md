# 102 · 二叉树的层序遍历

<ProblemMeta
  :tags="['Hot100', '大厂面试', 'BFS']"
  difficulty="medium"
  :appearances="48"
  pass-rate="48%"
  source-url="https://leetcode.cn/problems/binary-tree-level-order-traversal/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(w)" />

## 题目

给定二叉树根结点 `root`，按从上到下、从左到右的顺序返回每一层的结点值。

### 示例

```text
输入：[3,9,20,null,null,15,7]
输出：[[3], [9,20], [15,7]]
```

## 核心思路

使用队列进行广度优先搜索。每轮开始时，队列长度就是当前层结点数量：

1. 固定 `level_size`；
2. 弹出恰好这么多个结点；
3. 收集它们的值，并把孩子加入队尾；
4. 完成本层后再进入下一轮。

## Python 实现

```python
from collections import deque
from typing import Optional


class Solution:
    def levelOrder(
        self,
        root: Optional[TreeNode],
    ) -> list[list[int]]:
        if not root:
            return []

        queue = deque([root])
        levels: list[list[int]] = []

        while queue:
            # 固定本层长度，循环中新入队的结点留给下一层。
            level_size = len(queue)
            level_values: list[int] = []

            for _ in range(level_size):
                node = queue.popleft()
                level_values.append(node.val)

                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)

            levels.append(level_values)

        return levels
```

## 为什么必须先固定层大小

处理当前层时会把下一层孩子加入队列。如果直接遍历到队列为空，当前层和下一层会混在一起。固定循环开始时的长度，就能准确切分层级。

## 正确性说明

队列按父结点出现顺序加入左右孩子，因此同层结点保持从左到右顺序。每轮只处理进入该轮前已有的结点，恰好对应一层。所有结点最终入队、出队一次，返回结果就是完整层序遍历。

## 复杂度

- 时间复杂度：`O(n)`。
- 空间复杂度：`O(w)`，`w` 为树的最大实际宽度。

## 边界用例

| 树 | 预期 | 检查点 |
|---|---|---|
| 空树 | `[]` | 空输入 |
| 单结点 | `[[root]]` | 单层 |
| 只有左链 | 每层一个值 | 深树 |
| 完全二叉树 | 按层分组 | 宽树 |

## 90 秒面试表达

“层序遍历使用 BFS 队列。每轮先记录当前队列长度，它就是这一层的结点数；只弹出这些结点，收集值并把孩子加入队尾，下一轮再处理下一层。每个结点进出队一次，时间 `O(n)`，空间是最大层宽 `O(w)`。”

## 常见追问

- 锯齿形层序遍历只需按层切换写入方向。
- 右视图可以记录每层最后一个结点。
- 如果需要层平均值，在本层累加后除以 `level_size`。
