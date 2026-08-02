# 199 · 二叉树的右视图

<ProblemMeta
  :tags="['Hot100', '大厂面试', 'BFS', 'DFS', '递归']"
  difficulty="medium"
  :appearances="26"
  pass-rate="48%"
  source-url="https://leetcode.cn/problems/binary-tree-right-side-view/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="BFS O(w)，DFS O(h)" />

## 题目

给定二叉树根结点，想象自己站在树的右侧，返回从上到下能看到的结点值。

每一层只能看到最右侧结点。

## 解法一：BFS 层序遍历

使用层序遍历。因为每层按从左到右顺序处理，当前层最后弹出的结点就是右视图结点。

### Python 实现

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
            # 每层最后出队的结点就是从右侧看到的结点。
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

## 解法二：递归 DFS，右子树优先

DFS 也可以按照深度构造右视图。关键是改变普通先序遍历的访问顺序：

```text
根结点 → 右子树 → 左子树
```

这样在同一深度中，DFS 会优先到达位置更靠右的结点。如果当前深度等于答案数组长度，说明这是第一次访问该层，应把当前结点加入答案。

```python
from typing import Optional


class Solution:
    def rightSideView(
        self,
        root: Optional[TreeNode],
    ) -> list[int]:
        answer: list[int] = []

        def dfs(
            node: Optional[TreeNode],
            depth: int,
        ) -> None:
            if node is None:
                return

            # answer 中已经保存了深度 0 到 len(answer) - 1 的右视图。
            # depth == len(answer) 表示第一次到达这一层。
            # 又因为 DFS 先访问右子树，此时的 node 就是该层最右结点。
            if depth == len(answer):
                answer.append(node.val)

            # 顺序不能反：必须先右后左，才能让每层最右结点最先被访问。
            dfs(node.right, depth + 1)
            dfs(node.left, depth + 1)

        # 根结点位于第 0 层；空树会直接返回空数组。
        dfs(root, 0)
        return answer
```

### 为什么不能先遍历左子树

`depth == len(answer)` 只会在每层第一次访问时成立。如果先递归左子树，第一次访问到的将是该层最左结点，得到的就会变成左视图。

右子树优先并不表示答案只来自 `right` 指针。当右子树在某一层没有结点时，DFS 仍会继续访问左子树；只要该层还没有记录，左子树中位置最靠右的实际结点就会被加入答案。

## 右视图不一定来自右子树

某层右子树可能缺少结点，而左子树延伸得更深。右视图取的是每一层最右位置的实际结点，不是沿 `right` 指针一直向下。

## 正确性说明

### BFS

BFS 将同一深度结点按从左到右顺序出队。每层最后一个结点在该深度的位置最靠右，因此恰好是从右侧可见结点。对每一层记录一次最后结点，得到完整右视图。

### DFS

DFS 按“根、右、左”的顺序遍历。对任意深度 `depth`，算法在访问右子树后才会访问左子树，因此该深度位置最靠右的实际结点一定最先被访问。

当 `depth == len(answer)` 时，该层还没有答案，算法记录当前结点；后续同层结点不会再次满足条件。于是每层恰好记录一个结点，且它就是该层最右结点。

## 复杂度

- 两种解法都会访问每个结点一次，时间复杂度均为 `O(n)`；
- BFS 队列最多保存一整层结点，空间复杂度为 `O(w)`，其中 `w` 是最大层宽；
- DFS 递归栈最多保存一条根到叶路径，空间复杂度为 `O(h)`，其中 `h` 是树高。

## 边界用例

| 树 | 预期 | 检查点 |
|---|---|---|
| 空树 | `[]` | 空输入 |
| 单结点 | `[root]` | 单层 |
| 只有左链 | 全部左链值 | 右子树缺失 |
| 左右不平衡 | 每层最右实际结点 | 非简单右链 |

## 90 秒面试表达

“右视图就是每层最右侧结点。层序遍历可以记录每层最后一个结点；递归则采用根、右、左的顺序，让最右结点最先到达该层。当深度恰好等于答案长度时，说明这是该层第一次被访问，记录当前值。不能只沿右指针走，因为右子树缺失时左子树的结点仍可能可见。两种解法时间都是 `O(n)`，DFS 递归栈为 `O(h)`。”

## 常见追问

- 左视图记录每层第一个结点。
- 左子树优先并记录每层首次访问结点，可以得到左视图。
- 如果要求俯视图或垂直遍历，需要额外记录水平坐标。
