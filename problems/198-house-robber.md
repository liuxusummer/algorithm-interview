# 198 · 打家劫舍

<ProblemMeta
  :tags="['Hot100', '大厂面试', '线性 DP']"
  difficulty="medium"
  :appearances="12"
  pass-rate="54%"
  source-url="https://leetcode.cn/problems/house-robber/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(1)" />

## 题目

给定数组 `nums`，`nums[i]` 表示第 `i` 间房屋中的金额。相邻房屋不能在同一晚都被偷，返回能够获得的最大金额。

### 示例

```text
输入：nums = [1, 2, 3, 1]
输出：4
解释：选择第 1 和第 3 间房屋

输入：nums = [2, 7, 9, 3, 1]
输出：12
```

## 状态与选择

定义 `dp[i]` 为考虑前 `i` 间房屋时能获得的最大金额。

处理当前房屋时有两个互斥选择：

- 不偷：收益保持为 `dp[i - 1]`；
- 偷：上一间不能偷，收益为 `dp[i - 2] + current_money`。

因此：

```text
dp[i] = max(dp[i - 1], dp[i - 2] + current_money)
```

## Python 实现

```python
class Solution:
    def rob(self, nums: list[int]) -> int:
        two_houses_before = 0
        one_house_before = 0

        for money in nums:
            current = max(
                one_house_before,
                two_houses_before + money,
            )
            two_houses_before = one_house_before
            one_house_before = current

        return one_house_before
```

## 为什么不用记录“当前房屋是否被偷”

`dp[i - 1]` 已经代表前 `i - 1` 间房的全局最优，不偷当前房时直接继承它。

偷当前房时必须跳过前一间，所以只能与 `dp[i - 2]` 组合。两个候选已经完整覆盖当前选择，无需额外二维状态。

## 正确性说明

任意考虑到当前房屋的合法方案，要么不包含当前房屋，此时价值不超过前一状态；要么包含当前房屋，此时前一间必不包含，剩余部分价值不超过前两状态。算法取这两个上界的较大者，且两种候选都能由合法方案构造，因此状态等于真实最优值。滚动到数组末尾即得到全局答案。

## 复杂度

- 时间复杂度：`O(n)`。
- 空间复杂度：`O(1)`。

## 边界用例

| 输入 | 预期 | 检查点 |
|---|---:|---|
| `[1]` | `1` | 单间房 |
| `[1,2]` | `2` | 二选一 |
| `[1,2,3,1]` | `4` | 间隔选择 |
| `[2,7,9,3,1]` | `12` | 多次状态切换 |

## 90 秒面试表达

“处理一间房时只有偷和不偷两种选择。不偷就继承前一状态；偷的话前一间必须跳过，收益是前两状态加当前金额，所以转移是两者取最大。每个状态只依赖前两个值，可以滚动压缩到两个变量。时间 `O(n)`、空间 `O(1)`。”

## 常见追问

- 房屋首尾相邻时，分别计算“不选首间”和“不选末间”两种线性情况。
- 房屋构成二叉树时，递归返回每个结点“选与不选”的两种状态。
- 若要求输出具体房屋下标，需要保存 DP 数组并从末尾回溯选择。
