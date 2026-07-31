# 739 · 每日温度

<ProblemMeta
  :tags="['Hot100', '华为面试题', '栈与队列', '单调栈']"
  difficulty="medium"
  :appearances="7"
  pass-rate="61%"
  source-url="https://leetcode.cn/problems/daily-temperatures/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(n)" />

## 题目

给定每天的温度，返回一个数组，其中第 `i` 项表示还要等待多少天才会出现更高温度；若之后不会升温，则为 `0`。

### 示例

```text
输入：temperatures = [73,74,75,71,69,72,76,73]
输出：[1,1,4,2,1,1,0,0]
```

### 约束观察

- 每个位置寻找的是右侧第一个严格更大的温度；
- 只需要等待天数，因此栈中保存下标而不是温度值；
- 当前温度可以一次解决多个较冷日期的答案。

## 先说暴力解

对每一天向右扫描，直到找到第一个更高温度，最坏时间为 `O(n²)`。扫描中那些“还没有找到更暖日”的日期可以统一保存在单调栈中。

## 单调栈思路

维护存放日期下标的单调递减栈。当前温度高于栈顶日期时，当前日期就是栈顶日期等待的第一个更暖日。

## 动画拆解

下面展示仍在等待更高温度的下标栈。当前温度升高时，一个 `while` 循环可能同时解决多个历史日期。

<StackQueueDemo variant="daily-temperatures" />

## Python 实现

```python
from typing import List


class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        answer = [0] * len(temperatures)
        stack = []

        for today, temperature in enumerate(temperatures):
            while stack and temperatures[stack[-1]] < temperature:
                previous = stack.pop()
                # 当前日期是 previous 右侧第一个更高温度
                answer[previous] = today - previous
            stack.append(today)

        return answer
```

## 正确性说明

栈内温度始终单调不增。下标出栈时，当前温度比它高，而中间所有尚未让它出栈的温度都不比它高，所以当前日期正是第一个更暖日。未出栈的日期右侧不存在更高温度，答案保持 `0`。

### 前五天的栈变化

| 今天 | 温度 | 操作 | 已确定答案 |
|---:|---:|---|---|
| `0` | `73` | 入栈 `[0]` | — |
| `1` | `74` | 弹出 `0`，再入栈 `1` | `answer[0] = 1` |
| `2` | `75` | 弹出 `1`，再入栈 `2` | `answer[1] = 1` |
| `3` | `71` | 入栈 `[2, 3]` | — |
| `4` | `69` | 入栈 `[2, 3, 4]` | — |

## 复杂度

- 时间：`O(n)`，每个下标最多入栈、出栈各一次
- 空间：`O(n)`

## 边界用例

| 输入 | 输出 | 检查点 |
|---|---|---|
| `[30]` | `[0]` | 单天 |
| `[30, 40, 50]` | `[1, 1, 0]` | 严格递增 |
| `[50, 40, 30]` | `[0, 0, 0]` | 严格递减 |
| `[30, 30, 31]` | `[2, 1, 0]` | 相等不算更高 |

## 90 秒面试表达

这是一道“右侧第一个更大元素”。我用单调递减栈保存还没找到答案的日期；新温度更高时不断弹栈，并用下标差填写等待天数。

## 常见追问

- 栈里必须保存下标，才能计算等待天数；
- 比较条件是严格小于，相同温度不能出栈；
- 每个下标最多入栈、出栈一次，所以嵌套循环仍是 `O(n)`。
