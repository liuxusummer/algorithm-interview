# 199 · 二叉树的右视图

<ProblemMeta
  :tags="['Hot100', '大厂面试', 'BFS']"
  difficulty="medium"
  :appearances="26"
  pass-rate="48%"
  source-url="https://leetcode.cn/problems/binary-tree-right-side-view/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(w)" />

## 题目

给定二叉树根结点，想象自己站在树的右侧，返回从上到下能看到的结点值。

每一层只能看到最右侧结点。

## 核心思路

使用层序遍历。因为每层按从左到右顺序处理，当前层最后弹出的结点就是右视图结点。

## Python 实现

```python
from collections import deque
from typing import Optional


class Solution:
    def rightSideView(
        self,
        root: Optional[TreeNode],
    ) -> list[int]:
        if not root:
            return []

        queue = deque([root])
        view: list[int] = []

        while queue:
            level_size = len(queue)

            for index in range(level_size):
                node = queue.popleft()

                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)

                if index == level_size - 1:
                    view.append(node.val)

        return view
```

## 右视图不一定来自右子树

某层右子树可能缺少结点，而左子树延伸得更深。右视图取的是每一层最右位置的实际结点，不是沿 `right` 指针一直向下。

## 正确性说明

BFS 将同一深度结点按从左到右顺序出队。每层最后一个结点在该深度的位置最靠右，因此恰好是从右侧可见结点。对每一层记录一次最后结点，得到完整右视图。

## 复杂度

- 时间复杂度：`O(n)`。
- 空间复杂度：`O(w)`。

## 边界用例

| 树 | 预期 | 检查点 |
|---|---|---|
| 空树 | `[]` | 空输入 |
| 单结点 | `[root]` | 单层 |
| 只有左链 | 全部左链值 | 右子树缺失 |
| 左右不平衡 | 每层最右实际结点 | 非简单右链 |

## 90 秒面试表达

“右视图就是每层最右侧结点。我做标准 BFS，每轮固定层大小，并按左、右顺序加入孩子；这一层最后一个出队结点就是最右结点，把它加入答案。不能只沿右指针走，因为右子树缺失时左子树的结点仍可能可见。时间 `O(n)`、空间 `O(w)`。”

## 常见追问

- 左视图记录每层第一个结点。
- DFS 可以优先访问右子树，并在首次到达某个深度时记录结点。
- 如果要求俯视图或垂直遍历，需要额外记录水平坐标。
