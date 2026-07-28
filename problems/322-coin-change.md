# 322 · 零钱兑换

<ProblemMeta
  :tags="['Hot100', '大厂面试', '完全背包']"
  difficulty="medium"
  :appearances="45"
  pass-rate="53%"
  source-url="https://leetcode.cn/problems/coin-change/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(amount · c)" space="O(amount)" />

## 题目

给定不同面额的硬币数组 `coins` 和总金额 `amount`。每种硬币数量不限，返回凑成总金额所需的最少硬币数；如果无法凑成，返回 `-1`。

### 示例

```text
输入：coins = [1, 2, 5], amount = 11
输出：3
解释：5 + 5 + 1

输入：coins = [2], amount = 3
输出：-1
```

## 状态与转移

定义：

```text
dp[current] = 凑成 current 所需的最少硬币数
```

`dp[0] = 0`，因为凑成零金额不需要硬币。

如果最后使用面额 `coin`，此前需要凑成 `current - coin`：

```text
dp[current] = min(dp[current], dp[current - coin] + 1)
```

每种硬币可以无限使用，所以同一面额可以参与多个状态，也可以在一条方案中重复出现。

## Python 实现

```python
class Solution:
    def coinChange(self, coins: list[int], amount: int) -> int:
        unreachable = amount + 1
        dp = [unreachable] * (amount + 1)
        dp[0] = 0

        # dp[current] 表示凑出 current 的最少硬币数。
        for current in range(1, amount + 1):
            for coin in coins:
                if coin <= current:
                    dp[current] = min(
                        dp[current],
                        dp[current - coin] + 1,
                    )

        return -1 if dp[amount] == unreachable else dp[amount]
```

## 为什么哨兵用 `amount + 1`

若存在解，最极端情况下使用面额为 1 的硬币，也只需要 `amount` 枚。因此 `amount + 1` 一定大于所有合法答案，可以安全表示不可达。

使用有限整数哨兵还避免了对无穷值进行特殊分支处理。

## 为什么贪心选择最大硬币不可靠

面额不是标准货币系统时，优先拿大硬币可能失败。例如：

```text
coins = [1, 3, 4], amount = 6
```

贪心得到 `4 + 1 + 1` 共三枚，而最优是 `3 + 3` 共两枚。需要动态规划比较所有最后一枚硬币的选择。

## 正确性说明

任意凑成 `current` 的最优方案都有一枚最后使用的硬币 `coin`，移除它后必然是凑成 `current - coin` 的最优子方案，否则可以替换成更优方案。算法枚举所有可作为最后一枚的硬币并取最小值，因此准确得到每个金额的最少硬币数。状态按金额递增，所依赖的小金额状态均已正确计算。

## 复杂度

设硬币种类数为 `c`。

- 时间复杂度：`O(amount · c)`。
- 空间复杂度：`O(amount)`。

## 边界用例

| 输入 | 预期 | 检查点 |
|---|---:|---|
| `[1,2,5], 11` | `3` | 重复使用硬币 |
| `[2], 3` | `-1` | 不可达 |
| `[1], 0` | `0` | 零金额 |
| `[2,5,10,1], 27` | `4` | 多面额组合 |

## 90 秒面试表达

“定义 `dp[x]` 为凑成金额 `x` 的最少硬币数，`dp[0]=0`。枚举目标金额和每种硬币，如果当前金额放得下这枚硬币，就从 `dp[x-coin]+1` 转移并取最小。用 `amount+1` 表示不可达，最后仍是哨兵就返回 -1。每种硬币可以重复使用，这是完全背包。时间 `O(amount·c)`、空间 `O(amount)`。”

## 常见追问

- 求组合数量时，状态含义和循环顺序都会改变。
- 若每种硬币只能用一次，就变成 0/1 背包，金额需要逆序更新。
- 金额非常大时，可先用所有面额的最大公约数判断基本可达性。
