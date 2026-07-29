---
title: 单调栈与单调队列系统详解
description: 从候选淘汰、不变量和均摊分析出发，系统掌握单调栈、单调队列、最近更值、区间贡献和滑动窗口最值。
---

# 单调栈与单调队列系统详解

单调栈和单调队列看起来像两个“背模板”的技巧，实际上它们共享同一个核心思想：

> 当一个新元素出现后，如果某些旧元素比它更差、位置还更早，那么这些旧元素以后永远不可能成为答案，可以立刻淘汰。

这种关系叫作**支配关系**。理解“谁支配谁”，比记住 `while stack` 或 `while deque` 更重要。

## 一、它们分别解决什么问题

### 单调栈

单调栈主要处理：

- 每个元素左边或右边第一个更大 / 更小元素；
- 以某个元素为最小值或最大值时，它能控制的区间边界；
- 柱状图、接雨水、子数组最值贡献；
- 需要把双重扫描降为线性扫描的问题。

典型信号：

```text
右侧第一个更大
左侧最近更小
某个元素能向两边扩展多远
每个元素作为最小值贡献多少次
```

### 单调队列

单调队列主要处理：

- 固定长度滑动窗口的最大值 / 最小值；
- 元素会过期的在线最值查询；
- 某些动态规划中，只允许从最近一段区间转移，并要快速取区间最优值。

典型信号：

```text
窗口每次右移一格
反复查询最近 k 个元素的最大值
候选有明确过期时间
dp[i] 只依赖一个滑动区间中的最优状态
```

## 二、先分清栈和队列

| 对比项 | 单调栈 | 单调队列 |
|---|---|---|
| 主要查询 | 最近更大 / 更小、边界 | 当前窗口最大 / 最小 |
| 新元素淘汰位置 | 栈顶 | 队尾 |
| 旧元素过期 | 通常不单独处理 | 从队首删除 |
| 常用结构 | Python `list` | `collections.deque` |
| 常见空间 | `O(n)` | `O(k)` |
| 核心顺序 | 下标按扫描顺序入栈 | 下标既按时间又按值维护 |

单调队列并不是“整个队列的数值随便保持单调”。它通常是一个**双端队列**：

- 队首负责删除已经离开窗口的旧下标；
- 队尾负责删除被新元素支配的候选；
- 队首同时提供当前最优值。

## 三、方向怎么判断

最容易记反的是“找更大，栈到底递增还是递减”。可以从“栈里保存谁”来推：

> 栈里保存的是还没有找到答案的元素。

| 目标 | 栈内从底到顶 | 当前元素触发弹栈的条件 |
|---|---|---|
| 右侧第一个严格更大 | 单调不增 | `nums[stack[-1]] < value` |
| 右侧第一个大于等于 | 严格递减 | `nums[stack[-1]] <= value` |
| 右侧第一个严格更小 | 单调不减 | `nums[stack[-1]] > value` |
| 右侧第一个小于等于 | 严格递增 | `nums[stack[-1]] >= value` |
| 滑动窗口最大值 | 队列值单调递减 | 队尾 `<= value` 时删除 |
| 滑动窗口最小值 | 队列值单调递增 | 队尾 `>= value` 时删除 |

不要只背“更大对应递减”。真正需要确认的是：

1. 答案是否允许相等；
2. 重复值应该保留旧下标还是新下标；
3. 当前元素是在为旧元素结算答案，还是在寻找自己的答案。

## 四、为什么通常保存下标

保存下标可以同时获得四种信息：

- 用 `nums[index]` 比较数值；
- 用 `current - index` 计算距离；
- 判断元素是否离开窗口；
- 计算左右边界和区间长度。

只有在明确不需要位置、距离和过期判断时，才考虑只保存数值。

```python
# 推荐：保存下标
stack.append(index)

# 比较时再取值
while stack and nums[stack[-1]] < nums[index]:
    previous = stack.pop()
```

## 五、单调栈基础模板：右侧第一个更大

给定数组，为每个位置找到右侧第一个严格更大的元素下标；不存在时记为 `-1`。

```python
def next_greater_indices(nums: list[int]) -> list[int]:
    answer = [-1] * len(nums)
    stack: list[int] = []

    for index, value in enumerate(nums):
        # 当前值可以解决所有比它小的“待处理位置”。
        while stack and nums[stack[-1]] < value:
            previous = stack.pop()
            answer[previous] = index

        stack.append(index)

    return answer
```

### 栈中的不变量

扫描到任意位置时：

1. 栈内下标严格递增；
2. 对应数值从栈底到栈顶单调不增；
3. 栈中每个位置都还没有遇到右侧严格更大值。

### 为什么当前元素是“第一个”

位置 `previous` 一直留在栈中，说明此前扫描过的元素都没有比它大。当前元素第一次满足更大条件，因此当前下标就是它右侧第一个严格更大位置。

### 例题：找右侧第一个更大值

给定：

```text
nums = [2, 1, 2, 4, 3]
```

要求返回每个位置右侧第一个严格更大的**数值**，不存在时返回 `-1`：

```text
[4, 2, 4, -1, -1]
```

逐步演算：

| 扫描位置 | 当前值 | 弹栈与结算 | 入栈后的下标 | 栈中对应值 |
|---:|---:|---|---|---|
| 0 | 2 | 无 | `[0]` | `[2]` |
| 1 | 1 | 无 | `[0, 1]` | `[2, 1]` |
| 2 | 2 | 弹出 1，答案为 2 | `[0, 2]` | `[2, 2]` |
| 3 | 4 | 弹出 2、0，答案都为 4 | `[3]` | `[4]` |
| 4 | 3 | 无 | `[3, 4]` | `[4, 3]` |

这里最关键的是位置 0：

- 位置 2 的值也是 2，不是严格更大，所以位置 0 不能出栈；
- 直到位置 3 的值 4 出现，位置 0 才第一次找到答案；
- 因此比较条件必须是 `<`，不能写成 `<=`。

```python
def next_greater_values(nums: list[int]) -> list[int]:
    answer = [-1] * len(nums)
    stack: list[int] = []

    for index, value in enumerate(nums):
        while stack and nums[stack[-1]] < value:
            previous = stack.pop()
            answer[previous] = value

        stack.append(index)

    return answer
```

## 六、完整例子：每日温度

[739 · 每日温度](../../problems/739-daily-temperatures)要求计算每一天距离下一个更高温度还有几天。

输入：

```text
[73, 74, 75, 71, 69, 72, 76, 73]
```

前几步变化：

| 当前下标 | 温度 | 栈变化 | 新确定答案 |
|---:|---:|---|---|
| 0 | 73 | `[0]` | — |
| 1 | 74 | 弹出 0，压入 1 | `answer[0] = 1` |
| 2 | 75 | 弹出 1，压入 2 | `answer[1] = 1` |
| 3 | 71 | `[2, 3]` | — |
| 4 | 69 | `[2, 3, 4]` | — |
| 5 | 72 | 弹出 4、3，再压入 5 | `answer[4] = 1`，`answer[3] = 2` |

```python
def daily_temperatures(temperatures: list[int]) -> list[int]:
    answer = [0] * len(temperatures)
    stack: list[int] = []

    for today, temperature in enumerate(temperatures):
        while (
            stack
            and temperatures[stack[-1]] < temperature
        ):
            colder_day = stack.pop()
            answer[colder_day] = today - colder_day

        stack.append(today)

    return answer
```

相同温度不能弹出，因为题目找的是**严格更高**温度。

## 七、从“找答案”升级为“找边界”

单调栈的第二种重要用法，是寻找每个元素能控制的区间：

```text
left[i]  = i 左侧第一个比 nums[i] 小的位置
right[i] = i 右侧第一个比 nums[i] 小的位置
```

那么 `nums[i]` 作为区间最小值可以覆盖：

```text
(left[i], right[i])
```

宽度是：

```text
right[i] - left[i] - 1
```

这正是柱状图最大矩形、子数组最小值之和等问题的基础。

### 柱状图最大矩形模板

在数组两端加入高度 `0` 的哨兵，可以让剩余柱子在结尾统一出栈。

```python
def largest_rectangle_area(heights: list[int]) -> int:
    extended = [0, *heights, 0]
    stack: list[int] = [0]
    best = 0

    for right in range(1, len(extended)):
        # 当前柱更矮，说明栈顶柱子的右边界已经确定。
        while extended[stack[-1]] > extended[right]:
            middle = stack.pop()
            left = stack[-1]
            width = right - left - 1
            best = max(best, extended[middle] * width)

        stack.append(right)

    return best
```

出栈后：

- `middle` 是当前结算高度；
- 新栈顶 `left` 是它左侧第一个更小位置；
- 当前 `right` 是它右侧第一个更小位置。

## 八、重复值为什么麻烦

计算“每个元素作为最小值的贡献”时，如果左右两侧都使用严格小于，重复最小值可能被重复计算；如果两侧都使用小于等于，又可能漏算。

常用的不对称策略：

```text
左边找严格更小
右边找小于等于
```

或者反过来：

```text
左边找小于等于
右边找严格更小
```

只要一边严格、一边非严格，就能让相等元素按固定方向归属。

假设：

```text
left_less[i]       = 左侧第一个严格小于 nums[i] 的位置
right_less_equal[i] = 右侧第一个小于等于 nums[i] 的位置
```

那么 `nums[i]` 作为子数组最小值出现的次数是：

```text
(i - left_less[i]) * (right_less_equal[i] - i)
```

这一段是单调栈从“最近更值”进阶到“区间贡献”的关键。

## 九、循环数组怎么处理

循环数组中的“右侧”可能绕回开头。常用方法是遍历两遍，但只在第一遍压栈：

```python
def next_greater_circular(nums: list[int]) -> list[int]:
    n = len(nums)
    answer = [-1] * n
    stack: list[int] = []

    for step in range(2 * n):
        index = step % n

        while stack and nums[stack[-1]] < nums[index]:
            previous = stack.pop()
            answer[previous] = nums[index]

        # 第二遍只负责结算，不能重复加入相同位置。
        if step < n:
            stack.append(index)

    return answer
```

遍历两遍仍是 `O(n)`，因为每个下标只入栈一次、出栈一次。

## 十、单调队列模板：滑动窗口最大值

[239 · 滑动窗口最大值](../../problems/239-sliding-window-maximum)是单调队列的标准题。

```python
from collections import deque


def max_sliding_window(nums: list[int], k: int) -> list[int]:
    candidates: deque[int] = deque()
    answer: list[int] = []

    for right, value in enumerate(nums):
        left = right - k + 1

        # 队首下标已经离开窗口，必须先删除。
        while candidates and candidates[0] < left:
            candidates.popleft()

        # 新元素更大且更晚过期，旧的较小候选失去价值。
        while candidates and nums[candidates[-1]] <= value:
            candidates.pop()

        candidates.append(right)

        if left >= 0:
            answer.append(nums[candidates[0]])

    return answer
```

### 例题逐步演算

对于：

```text
nums = [1, 3, -1, -3, 5, 3, 6, 7]
k = 3
```

队列中保存的是下标。为了更直观，下面同时展示下标对应的值：

| `right` | 当前值 | 删除过期 | 从队尾淘汰 | 队列值 | 本轮输出 |
|---:|---:|---|---|---|---:|
| 0 | 1 | 无 | 无 | `[1]` | — |
| 1 | 3 | 无 | 删除 1 | `[3]` | — |
| 2 | -1 | 无 | 无 | `[3, -1]` | 3 |
| 3 | -3 | 无 | 无 | `[3, -1, -3]` | 3 |
| 4 | 5 | 下标 1 过期 | 删除 -3、-1 | `[5]` | 5 |
| 5 | 3 | 无 | 无 | `[5, 3]` | 5 |
| 6 | 6 | 无 | 删除 3、5 | `[6]` | 6 |
| 7 | 7 | 无 | 删除 6 | `[7]` | 7 |

最终结果：

```text
[3, 3, 5, 5, 6, 7]
```

以 `right = 4` 为例，当前窗口是 `[-1, -3, 5]`：

1. 原队首下标 1 已经不在窗口 `[2, 4]`，先过期删除；
2. 新值 5 比队尾的 -3、-1 都大，而且位置更靠右；
3. -3 和 -1 以后不可能战胜 5，因此从队尾永久删除；
4. 队首 5 就是当前窗口最大值。

### 队列中的两个顺序

队列同时维护：

1. **时间顺序**：下标从队首到队尾递增；
2. **价值顺序**：对应数值从队首到队尾递减。

因此：

- 最旧的候选一定在队首，便于判断过期；
- 最大的候选也在队首，可以 `O(1)` 查询。

## 十一、为什么队尾元素可以永久删除

假设队尾旧元素是：

```text
下标 old，值 nums[old]
```

新元素是：

```text
下标 new，值 nums[new]
```

如果：

```text
old < new
nums[old] <= nums[new]
```

那么旧元素被新元素完全支配：

- 新元素不小于旧元素；
- 新元素位置更靠右，会更晚离开窗口；
- 只要旧元素还在窗口，新元素也一定在窗口。

因此旧元素以后绝不可能成为窗口最大值，可以永久删除。

## 十二、同时维护窗口最大值和最小值

最大值使用单调递减队列，最小值使用单调递增队列：

```python
from collections import deque


def window_ranges(nums: list[int], k: int) -> list[int]:
    maximums: deque[int] = deque()
    minimums: deque[int] = deque()
    answer: list[int] = []

    for right, value in enumerate(nums):
        left = right - k + 1

        while maximums and maximums[0] < left:
            maximums.popleft()
        while minimums and minimums[0] < left:
            minimums.popleft()

        while maximums and nums[maximums[-1]] <= value:
            maximums.pop()
        while minimums and nums[minimums[-1]] >= value:
            minimums.pop()

        maximums.append(right)
        minimums.append(right)

        if left >= 0:
            answer.append(
                nums[maximums[0]] - nums[minimums[0]]
            )

    return answer
```

这类模板常用于判断窗口内极差、满足 `max - min <= limit` 的最长区间等问题。

## 十三、单调队列优化动态规划

如果状态转移是：

```text
dp[i] = value[i] + max(dp[j])
其中 i - k <= j < i
```

直接枚举每个 `j` 是 `O(nk)`。维护最近 `k` 个 `dp[j]` 的单调递减队列，就能把转移降到 `O(n)`。

```python
from collections import deque


def bounded_transition(values: list[int], k: int) -> list[int]:
    dp = [0] * len(values)
    candidates: deque[int] = deque()

    for index, value in enumerate(values):
        while candidates and candidates[0] < index - k:
            candidates.popleft()

        best_previous = dp[candidates[0]] if candidates else 0
        dp[index] = value + best_previous

        while candidates and dp[candidates[-1]] <= dp[index]:
            candidates.pop()

        candidates.append(index)

    return dp
```

识别关键不是“题目有没有窗口”四个字，而是状态转移是否反复查询一个**会移动、会过期的区间最值**。

### 小例子：最近两步的最大得分

假设：

```text
values = [1, -1, 4, -2, 3]
k = 2
```

定义 `dp[i]` 为到达位置 `i` 的最大得分，每次只能从前面最多两步跳来：

```text
dp[i] = values[i] + max(dp[i - 2], dp[i - 1])
```

逐步得到：

| `i` | `values[i]` | 可选前驱 `dp` | `dp[i]` |
|---:|---:|---|---:|
| 0 | 1 | 无 | 1 |
| 1 | -1 | `[1]` | 0 |
| 2 | 4 | `[1, 0]` | 5 |
| 3 | -2 | `[0, 5]` | 3 |
| 4 | 3 | `[5, 3]` | 8 |

普通写法每次扫描最近 `k` 个状态；单调队列只保存其中仍可能成为最大值的状态下标。这里队列维护的是 `dp` 单调递减，而不是 `values` 单调递减。

## 十四、为什么嵌套 `while` 仍然是 O(n)

看到循环中套 `while`，很容易误判为 `O(n²)`。均摊分析要看元素一生经历多少次操作：

- 每个下标最多入栈 / 入队一次；
- 每个下标最多从栈顶或队尾被删除一次；
- 单调队列中的下标还可能从队首过期一次，但它不会再从队尾删除。

所以所有 `while` 的总弹出次数不超过 `n`，总时间是 `O(n)`。

面试表达可以直接说：

> 外层循环虽然包含弹出循环，但每个元素最多入结构一次、离开结构一次，因此所有弹出操作的总次数是 `O(n)`，整体时间复杂度仍是 `O(n)`。

## 十五、单调队列、堆和普通窗口怎么选

| 方案 | 单次最值查询 | 删除过期元素 | 适用场景 |
|---|---:|---:|---|
| 每次扫描窗口 | `O(k)` | 无需额外结构 | 数据很小 |
| 最大堆 / 最小堆 | `O(1)` 看堆顶 | 常需延迟删除 | 候选可任意插入，或还要 Top-K |
| 单调队列 | `O(1)` | 队首 `O(1)` 均摊 | 固定方向滑动窗口最值 |
| 平衡树 / 有序多重集合 | `O(1)` 看端点 | `O(log k)` | 需要中位数、分位数或任意删除 |

单调队列之所以能做到 `O(n)`，是因为它只保留可能成为最值的候选；如果题目还要求第二大、排名或中位数，单调队列通常就不够了。

## 十六、常见错误

### 1. 值和下标混用

需要距离、窗口过期或区间宽度时，必须保存下标。

### 2. 单调方向写反

不要从“找最大所以递增”猜方向。问自己：结构里保留的是哪些尚未失效的候选？

### 3. 相等元素处理不一致

- 找严格更大：通常用 `<` 弹栈；
- 窗口最大值：通常用 `<=` 删除旧队尾，保留更新的相同值；
- 贡献计数：左右边界必须一边严格、一边非严格。

### 4. 单调队列忘记删除过期下标

只维护数值单调而不检查队首是否离开窗口，会返回历史最大值。

### 5. 只弹一次

新元素可能一次解决多个旧候选，必须使用 `while`，不能只写 `if`。

### 6. 结尾没有清栈

边界型单调栈可以：

- 在循环结束后额外清栈；
- 或加入哨兵，让所有元素在主循环内统一结算。

## 十七、识别问题的四步法

遇到数组或序列题时，依次问：

1. 是否要为每个位置寻找最近的更大 / 更小元素？
2. 是否要知道某个值作为最值能向左右延伸多远？
3. 是否反复查询一个向右移动区间的最大值 / 最小值？
4. 新元素出现后，是否能让一批更旧、更差的候选永久失效？

前两问通常指向单调栈，后两问通常指向单调队列。

## 十八、训练题单

### 单调栈入门

1. [739 · 每日温度](../../problems/739-daily-temperatures)：右侧第一个严格更大；
2. [496 · 下一个更大元素 I](https://leetcode.cn/problems/next-greater-element-i/)：值映射与单调栈；
3. [503 · 下一个更大元素 II](https://leetcode.cn/problems/next-greater-element-ii/)：循环数组。

### 单调栈进阶

1. [042 · 接雨水](../../problems/042-trapping-rain-water)：按凹槽分层结算；
2. [084 · 柱状图中最大的矩形](https://leetcode.cn/problems/largest-rectangle-in-histogram/)：左右更小边界；
3. [907 · 子数组的最小值之和](https://leetcode.cn/problems/sum-of-subarray-minimums/)：边界与贡献计数。

### 单调队列

1. [239 · 滑动窗口最大值](../../problems/239-sliding-window-maximum)：标准单调双端队列；
2. [1438 · 绝对差不超过限制的最长连续子数组](https://leetcode.cn/problems/longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit/)：同时维护最大值和最小值；
3. [1696 · 跳跃游戏 VI](https://leetcode.cn/problems/jump-game-vi/)：单调队列优化 DP。

## 十九、面试时如何完整讲

可以按下面的顺序表达：

1. **暴力瓶颈**：每个位置向后找答案，或每个窗口重新扫描，时间是 `O(n²)` / `O(nk)`；
2. **候选定义**：结构中保存还没有确定答案、或仍可能成为窗口最值的下标；
3. **单调不变量**：说明对应数值从底到顶、或从队首到队尾的单调方向；
4. **淘汰理由**：新元素更优且更晚过期，旧候选以后不可能成为答案；
5. **复杂度**：每个下标最多进入和离开一次，因此均摊 `O(n)`；
6. **边界**：说明相等元素、哨兵、循环数组或窗口过期如何处理。

如果这六点都能讲清楚，就不再只是“背会了一段模板”，而是真正掌握了单调结构。

## 二十、速查模板

```python
# 右侧第一个严格更大：单调不增栈
while stack and nums[stack[-1]] < nums[index]:
    previous = stack.pop()
    answer[previous] = index
stack.append(index)
```

```python
# 滑动窗口最大值：单调递减队列
while queue and queue[0] < left:
    queue.popleft()
while queue and nums[queue[-1]] <= nums[right]:
    queue.pop()
queue.append(right)
maximum = nums[queue[0]]
```

最后只记一句：

> 单调栈解决“谁先让我出栈”，单调队列解决“谁还有资格留在窗口里”。
