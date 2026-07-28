# 062 · 不同路径

<ProblemMeta
  :tags="['Hot100', '华为面试题', '动态规划', '网格 DP']"
  difficulty="medium"
  :appearances="4"
  pass-rate="67%"
  source-url="https://leetcode.cn/problems/unique-paths/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(mn)" space="O(n)" />

## 题目

机器人位于 `m × n` 网格左上角，每次只能向右或向下移动一步，求到达右下角的不同路径数量。

## 思路

到达一个格子的路径数等于其上方和左方路径数之和。使用一维数组压缩状态：更新前的 `dp[column]` 表示上方，`dp[column - 1]` 表示左方。

## Python 实现

```python
class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        dp = [1] * n

        for _ in range(1, m):
            for column in range(1, n):
                # 原值来自上方，左侧新值来自当前行
                dp[column] += dp[column - 1]

        return dp[-1]
```

## 正确性说明

第一行和第一列都只有一种走法。其余格子的最后一步必然来自上方或左方，两类路径互不重叠，因此状态转移为两者之和。逐行更新后，`dp[-1]` 即右下角路径数。

## 复杂度

- 时间：`O(mn)`
- 空间：`O(n)`

## 常见追问

也可以使用组合数学计算 `C(m+n-2, m-1)`；动态规划更容易扩展到有障碍物或带权网格。
