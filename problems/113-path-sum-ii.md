# 113 · 路径总和 II

<ProblemMeta
  :tags="['Hot100', '大厂面试', '二叉树', '回溯']"
  difficulty="medium"
  :appearances="78"
  pass-rate="63%"
  source-url="https://leetcode.cn/problems/path-sum-ii/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n²)" space="O(h)" />

## 题目

返回二叉树中所有结点和等于 `targetSum` 的根到叶路径。

与 112 不同，这次不仅要判断，还要保存当前路径。递归进入结点时做选择，离开结点时撤销选择，这正是树上的回溯。

## Python 实现

```python
from typing import List, Optional


class Solution:
    def pathSum(
        self,
        root: Optional[TreeNode],
        targetSum: int,
    ) -> List[List[int]]:
        answer: List[List[int]] = []
        path: List[int] = []

        def dfs(node: Optional[TreeNode], remaining: int) -> None:
            if node is None:
                return

            path.append(node.val)
            remaining -= node.val

            if node.left is None and node.right is None:
                if remaining == 0:
                    # path 会继续复用，保存答案时必须复制。
                    answer.append(path.copy())
            else:
                dfs(node.left, remaining)
                dfs(node.right, remaining)

            # 恢复进入当前结点前的路径，供兄弟分支复用。
            path.pop()

        dfs(root, targetSum)
        return answer
```

## 为什么必须复制 path

`path` 是所有递归分支共享的可变列表。若直接加入 `answer`，后续 `pop` 会同时修改已经记录的答案；`path.copy()` 保存的是当前时刻的快照。

## 正确性与复杂度

DFS 枚举每条根到叶路径，`path` 始终与当前递归链一致，`remaining` 始终等于目标减去路径和。因此只会记录合法路径，也不会漏掉任何路径。遍历本身 `O(n)`；复制答案最坏使总时间达到 `O(n²)`，递归与临时路径空间 `O(h)`，不计输出。

## 面试追问

- 若求任意向下路径，可用前缀和哈希表；不能继续套根到叶模板。
- 若只求路径数量，可能无需保存完整路径。
