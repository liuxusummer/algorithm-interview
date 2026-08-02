# 518 · 零钱兑换 II

<ProblemMeta
  :tags="['Hot100', '大厂面试', '动态规划', '完全背包']"
  difficulty="medium"
  :appearances="48"
  pass-rate="71%"
  source-url="https://leetcode.cn/problems/coin-change-ii/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n · amount)" space="O(amount)" />

## 题目

给定总金额和若干面额，硬币可无限使用，返回凑成金额的组合数量。不同顺序不算不同组合。

### 示例

```text
输入：amount = 5, coins = [1, 2, 5]
输出：4
解释：四种组合分别是 5、2+2+1、2+1+1+1、1+1+1+1+1。
```

## 先从二维 DP 理解

定义 `dp[i][value]`：只使用前 `i` 种硬币，凑成 `value` 的组合数。

```text
dp[i][value] = dp[i-1][value]
             + dp[i][value-coin]
```

分别对应“不使用当前硬币”和“至少使用一枚当前硬币”。由于当前行只依赖上一行同列和当前行左侧，可以压缩成一维。

## Python 实现：空间优化

```python
from typing import List


class Solution:
    def change(self, amount: int, coins: List[int]) -> int:
        dp = [0] * (amount + 1)
        dp[0] = 1

        # 硬币在外层，确保同一组硬币排列不会被重复统计。
        for coin in coins:
            for value in range(coin, amount + 1):
                dp[value] += dp[value - coin]

        return dp[amount]
```

## 循环顺序为什么重要

金额正序使本轮刚更新的 `dp[value-coin]` 可以继续使用当前硬币，符合完全背包。硬币放外层使每个组合只按面额处理顺序生成一次；若金额放外层，会统计排列数量。

## 正确性与复杂度

处理完每种硬币后，`dp[value]` 恰好包含只使用已处理面额的全部组合。转移把不使用与使用当前硬币的方案互斥相加，所以不重不漏。时间 `O(n·amount)`，空间 `O(amount)`。

## 与 322 的区别

322 求最少硬币数，状态取最小值；518 求组合数量，状态做方案累加。两题背包结构相似，但状态语义和初始化完全不同。
