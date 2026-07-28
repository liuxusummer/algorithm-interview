# 103 · 二叉树的锯齿形层序遍历

<ProblemMeta
  :tags="['字节面试题', '二叉树', 'BFS']"
  difficulty="medium"
  :appearances="28"
  pass-rate="33%"
  source-url="https://leetcode.cn/problems/binary-tree-zigzag-level-order-traversal/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(w)" />

## 题目

给定二叉树根结点，返回锯齿形层序遍历：

- 第一层从左到右；
- 第二层从右到左；
- 后续每层交替方向。

### 示例

```text
输入：[3,9,20,null,null,15,7]
输出：[[3], [20,9], [15,7]]
```

## 核心思路

树的访问仍使用普通 BFS，只有“本层结果的写入方向”发生变化。

用双端队列保存本层结果：

- 左到右时追加到尾部；
- 右到左时追加到头部；
- 孩子始终按左、右顺序加入 BFS 队列。

## Python 实现

```python
from collections import deque
from typing import Optional


class Solution:
    def zigzagLevelOrder(
        self,
        root: Optional[TreeNode],
    ) -> list[list[int]]:
        if not root:
            return []

        queue = deque([root])
        levels: list[list[int]] = []
        left_to_right = True

        while queue:
            level_values = deque()

            for _ in range(len(queue)):
                node = queue.popleft()

                if left_to_right:
                    level_values.append(node.val)
                else:
                    level_values.appendleft(node.val)

                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)

            levels.append(list(level_values))
            left_to_right = not left_to_right

        return levels
```

## 为什么不改变孩子入队顺序

锯齿形只改变输出顺序，不改变树的层序访问结构。如果交替改变孩子入队顺序，会让下一层结点的相对关系变复杂。保持统一 BFS，只调整结果写入方向更清晰。

## 正确性说明

队列按标准层序访问每一层，保证层级划分正确。方向标记为真时按访问顺序写入，为假时从头部写入，恰好反转该层输出。每层结束后切换标记，因此得到交替方向的全部层。

## 复杂度

- 时间复杂度：`O(n)`。
- 空间复杂度：`O(w)`。

## 边界用例

| 树 | 预期 | 检查点 |
|---|---|---|
| 空树 | `[]` | 空输入 |
| 单结点 | `[[root]]` | 无需切换 |
| 两层树 | 第二层反向 | 首次切换 |
| 单链树 | 每层单元素 | 方向无视觉差异 |

## 90 秒面试表达

“层级划分仍然使用普通 BFS，每轮固定当前队列长度。方向变化只影响本层结果：从左到右时追加到双端队列尾部，从右到左时追加到头部；孩子始终按左、右顺序入队。每层结束后切换方向。时间 `O(n)`，空间 `O(w)`。”

## 常见追问

- 也可以先按普通顺序收集一层，再按需反转列表。
- 双端队列头插避免显式反转，但两种方案总复杂度相同。
- 如果要从底向上输出，最后整体反转层列表。
