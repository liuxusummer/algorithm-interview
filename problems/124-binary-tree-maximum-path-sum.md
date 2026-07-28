# 124 · 二叉树中的最大路径和

<ProblemMeta
  :tags="['Hot100', '大厂面试', '树形 DP']"
  difficulty="hard"
  :appearances="15"
  pass-rate="39%"
  source-url="https://leetcode.cn/problems/binary-tree-maximum-path-sum/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(h)" />

## 题目

二叉树中的路径由若干相邻结点组成，同一个结点最多出现一次。路径不一定经过根结点，也不要求从叶子开始或结束。

给定非空二叉树，返回任意非空路径的最大结点值之和。

### 示例

```text
输入：[-10,9,20,null,null,15,7]
输出：42
解释：路径 15 → 20 → 7
```

## 两种状态

对每个结点需要区分：

1. **向父结点提供的最大贡献**：只能选择左、右一侧，因为路径不能分叉；
2. **以当前结点为最高连接点的完整路径**：可以同时连接左右两侧，用于更新全局答案。

负贡献应该舍弃，按零处理。

## Python 实现

```python
from typing import Optional


class Solution:
    def maxPathSum(self, root: Optional[TreeNode]) -> int:
        if not root:
            return 0

        self.best_sum = root.val
        self._maximum_gain(root)
        return self.best_sum

    def _maximum_gain(
        self,
        node: Optional[TreeNode],
    ) -> int:
        if not node:
            return 0

        # 负贡献不如不选；返回父结点时只能携带一侧路径。
        left_gain = max(self._maximum_gain(node.left), 0)
        right_gain = max(self._maximum_gain(node.right), 0)

        # 左右贡献可在当前结点汇合，但只用于更新全局答案。
        path_through_node = node.val + left_gain + right_gain
        self.best_sum = max(self.best_sum, path_through_node)

        return node.val + max(left_gain, right_gain)
```

## 为什么返回值不能同时选择左右子树

返回值将继续连接父结点。如果同时包含左右子树，再连接父结点会让当前结点出现三条分支，不再是一条简单路径。

因此返回给父结点时只能选择一侧；只有更新全局答案时可以把左右贡献同时连接。

## 为什么负贡献按零处理

若某侧最大贡献为负，把它加入路径只会降低总和。路径允许在当前结点结束，所以可以完全不选择该侧。

## 正确性说明

辅助函数返回从当前结点向下延伸的一条最大路径贡献，准确覆盖所有可连接父结点的方案。对每个结点，左右最大非负贡献加当前值构成以该结点为最高连接点的最佳完整路径。任意路径都有唯一的最高连接点，因此全局比较所有结点后不会漏掉最优路径。

## 复杂度

- 时间复杂度：`O(n)`。
- 空间复杂度：`O(h)`。

## 边界用例

| 树 | 预期 | 检查点 |
|---|---:|---|
| 单结点 `-3` | -3 | 全负数 |
| `[1,2,3]` | 6 | 左根右路径 |
| `[-10,9,20,15,7]` | 42 | 不经过根 |
| 全负树 | 最大单结点值 | 舍弃负贡献 |

## 90 秒面试表达

“递归返回当前结点向父结点能提供的最大单边贡献，所以只能选左右一侧；但更新全局答案时，可以把左右非负贡献和当前结点连成一条完整路径。负贡献按零处理，因为不选更优。任意路径都有唯一最高连接点，遍历所有结点更新答案即可。时间 `O(n)`、递归空间 `O(h)`。”

## 常见追问

- 直径题结构相同，只是贡献从结点值改为边数。
- 如果要返回路径本身，需要同时记录选择方向和最佳连接点。
- 结点值全负时，全局答案不能初始化为零。
