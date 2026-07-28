# 1423 · 可获得的最大点数

<ProblemMeta
  :tags="['华为面试题', '双指针', '滑动窗口']"
  difficulty="medium"
  :appearances="3"
  pass-rate="40%"
  source-url="https://leetcode.cn/problems/maximum-points-you-can-obtain-from-cards/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(1)" />

## 题目

一排卡牌的点数由数组 `cardPoints` 表示。每次只能从开头或末尾拿一张牌，必须拿恰好 `k` 张，返回可获得的最大点数。

```text
输入：cardPoints = [1,2,3,4,5,6,1], k = 3
输出：12
```

## 思维转换

从两端拿走 `k` 张，等价于在中间留下一个长度为 `n - k` 的连续子数组。

要让拿走的点数最大，就要让留下的连续子数组点数最小：

```text
答案 = 所有卡牌总和 - 长度为 n-k 的最小窗口和
```

## Python 实现

```python
class Solution:
    def maxScore(
        self,
        cardPoints: list[int],
        k: int,
    ) -> int:
        total = sum(cardPoints)
        window_size = len(cardPoints) - k

        if window_size == 0:
            return total

        window_sum = sum(cardPoints[:window_size])
        minimum_window = window_sum

        for right in range(window_size, len(cardPoints)):
            left = right - window_size
            window_sum += cardPoints[right] - cardPoints[left]
            minimum_window = min(minimum_window, window_sum)

        return total - minimum_window
```

## 正确性说明

任意合法拿牌方案都会留下且只会留下一个长度为 `n-k` 的连续区间；反过来，任意这样的连续区间都对应一种从两端拿牌的方案。因此所有方案与固定长度窗口一一对应。

算法枚举全部这类窗口并选择点数和最小者，其补集点数和必然最大。

## 复杂度

- 固定长度窗口扫描一次，时间 `O(n)`；
- 只维护窗口和，额外空间 `O(1)`。

## 另一种写法

也可以先取左侧 `k` 张，再逐张用右侧卡牌替换左侧卡牌，枚举“左取 `i` 张、右取 `k-i` 张”的全部组合，同样是 `O(k)` 时间。
