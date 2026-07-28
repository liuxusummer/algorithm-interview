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

## 思路

维护存放日期下标的单调递减栈。当前温度高于栈顶日期时，当前日期就是栈顶日期等待的第一个更暖日。

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

## 复杂度

- 时间：`O(n)`，每个下标最多入栈、出栈各一次
- 空间：`O(n)`

## 60 秒口述

这是一道“右侧第一个更大元素”。我用单调递减栈保存还没找到答案的日期；新温度更高时不断弹栈，并用下标差填写等待天数。
