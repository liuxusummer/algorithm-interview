# 543 · 二叉树的直径

<ProblemMeta
  :tags="['Hot100', '大厂面试', '树形 DP']"
  difficulty="easy"
  :appearances="14"
  pass-rate="48%"
  source-url="https://leetcode.cn/problems/diameter-of-binary-tree/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(h)" />

## 题目

给定二叉树根结点，返回它的直径。

直径是树中任意两个结点之间最长路径的边数。这条路径不一定经过根结点。

## 两种信息

辅助函数返回当前子树的最大深度，单位是结点数。对当前结点：

```text
经过当前结点的直径边数 = 左子树深度 + 右子树深度
```

再用全局变量记录所有结点的最大值。

## Python 实现

```python
from typing import Optional


class Solution:
    def diameterOfBinaryTree(
        self,
        root: Optional[TreeNode],
    ) -> int:
        self.longest_diameter = 0
        self._depth(root)
        return self.longest_diameter

    def _depth(self, node: Optional[TreeNode]) -> int:
        if not node:
            return 0

        left_depth = self._depth(node.left)
        right_depth = self._depth(node.right)

        # 左右最大深度之和，就是以当前结点为拐点的直径。
        self.longest_diameter = max(
            self.longest_diameter,
            left_depth + right_depth,
        )

        return 1 + max(left_depth, right_depth)
```

## 为什么左右深度之和就是边数

若左深度为 `L` 个结点，从当前结点到左侧最深结点恰好有 `L` 条边；右侧同理有 `R` 条边。因此经过当前结点的路径边数是 `L + R`。

## 正确性说明

辅助函数正确返回每棵子树深度。任意最长路径都有唯一的最高连接点，在该点处路径由左侧最深分支和右侧最深分支组成。算法对每个结点计算这种路径并更新全局最大值，因此得到整棵树直径。

## 复杂度

- 时间复杂度：`O(n)`。
- 空间复杂度：`O(h)`。

## 边界用例

| 树 | 预期直径 | 检查点 |
|---|---:|---|
| 空树 | 0 | 无边 |
| 单结点 | 0 | 结点数与边数 |
| 两结点 | 1 | 单边 |
| 直径不经过根 | 子树内部最长路径 | 全局答案 |

## 90 秒面试表达

“我让递归函数返回当前子树深度。对每个结点，左深度加右深度就是经过它的最长路径边数，用全局变量更新直径；返回父结点时只能提供左右较深一侧再加当前层。任意路径都有唯一最高连接点，所以不会遗漏。时间 `O(n)`、空间 `O(h)`。”

## 常见追问

- 最大路径和使用相同框架，但贡献是结点值且负贡献要舍弃。
- 如果题目把直径定义为结点数，最终边数需要加一。
- 若要返回直径路径，需要记录最深分支和最佳连接点。
