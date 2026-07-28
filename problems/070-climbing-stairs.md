# 070 · 爬楼梯

<ProblemMeta
  :tags="['Hot100', '大厂面试', '线性 DP', '华为面试题']"
  difficulty="easy"
  :appearances="35"
  pass-rate="53%"
  source-url="https://leetcode.cn/problems/climbing-stairs/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(1)" />

## 题目

一共有 `n` 级台阶，每次可以爬 1 级或 2 级。计算到达第 `n` 级台阶共有多少种不同方法。

### 示例

```text
输入：n = 2
输出：2
解释：1 + 1，或 2

输入：n = 3
输出：3
解释：1 + 1 + 1，1 + 2，或 2 + 1
```

## 状态与转移

定义 `dp[i]` 为到达第 `i` 级台阶的方法数。

最后一步只有两种来源：

- 从第 `i - 1` 级走 1 步；
- 从第 `i - 2` 级走 2 步。

两类方案的最后一步不同，不重不漏，因此：

```text
dp[i] = dp[i - 1] + dp[i - 2]
```

## Python 实现

```python
class Solution:
    def climbStairs(self, n: int) -> int:
        if n <= 2:
            return n

        two_steps_before = 1
        one_step_before = 2

        # 只保留前两级台阶方案数，将空间压缩为 O(1)。
        for _ in range(3, n + 1):
            current = one_step_before + two_steps_before
            two_steps_before = one_step_before
            one_step_before = current

        return one_step_before
```

## 为什么可以压缩空间

计算第 `i` 个状态只依赖前两个状态，早于 `i - 2` 的结果不会再被使用，因此无需保存完整数组。

滚动变量分别表示 `dp[i - 2]` 和 `dp[i - 1]`，每轮计算后整体向前移动。

## 正确性说明

任意到达第 `i` 级的方案，最后一步要么从 `i - 1` 走一级，要么从 `i - 2` 走两级，两类互斥且覆盖全部可能。根据归纳假设，两个滚动变量分别保存这两类前缀方案数，相加即得到 `dp[i]`。从基础状态 `dp[1] = 1`、`dp[2] = 2` 递推到 `n`，结果正确。

## 复杂度

- 时间复杂度：`O(n)`。
- 空间复杂度：`O(1)`。

## 边界用例

| 输入 | 预期 | 检查点 |
|---|---:|---|
| `1` | `1` | 最小台阶 |
| `2` | `2` | 基础状态 |
| `3` | `3` | 第一次转移 |
| `5` | `8` | 连续递推 |

## 90 秒面试表达

“定义 `dp[i]` 为到达第 `i` 级的方法数。最后一步只能从 `i-1` 走一级或从 `i-2` 走两级，所以转移是两者相加，基础状态为 1 和 2。每个状态只依赖前两个值，因此用两个变量滚动即可。时间 `O(n)`、空间 `O(1)`。”

## 常见追问

- 每次可走 `1...k` 级时，转移为前 `k` 个状态之和，可用滑动窗口优化。
- 若某些台阶损坏，损坏位置的方法数设为零。
- `n` 极大且要求取模时，可用矩阵快速幂降到 `O(log n)`。
