---
title: 二分查找系统详解
description: 从搜索区间和单调谓词出发，系统掌握精确查找、左右边界、答案二分、旋转数组、浮点二分与有序数组分割。
---

# 二分查找系统详解

很多人会背下面几行代码：

```python
while left <= right:
    middle = (left + right) // 2
```

但一遇到重复元素、左右边界、旋转数组或“最小可行答案”，就开始反复修改 `+1`、`-1`。

二分查找真正需要掌握的不是某一段模板，而是两件事：

1. **搜索空间中存在单调性；**
2. **每轮都能证明答案仍在保留区间内。**

只要搜索区间、不变量和返回值语义一致，边界就不会靠猜。

## 一、二分查找到底在做什么

假设候选位置或候选答案按顺序排列，并且判断结果呈现：

```text
False False False True True True
```

那么可以寻找：

```text
第一个 True
```

如果判断结果是：

```text
True True True False False False
```

那么可以寻找：

```text
最后一个 True
```

普通有序数组查找只是特殊情况。更一般地说：

> 二分查找是在一个有序或单调的候选空间中，定位真假分界点。

## 二、什么是单调谓词

谓词就是一个返回布尔值的判断函数：

```python
def feasible(answer: int) -> bool:
    ...
```

例如求整数平方根：

```python
def feasible(value: int) -> bool:
    return value * value <= x
```

当候选值增大时：

```text
1² <= x    True
2² <= x    True
3² <= x    True
4² <= x    False
5² <= x    False
```

结果只会从真变假一次，因此可以二分最后一个 `True`。

### 可以二分的三个条件

1. 候选空间能被排序或编号；
2. 判断结果具有单调分界；
3. 单次判断的成本足够低。

如果判断结果是：

```text
True False True False
```

就不存在单一分界点，不能直接二分。

## 三、先统一术语

| 术语 | 含义 |
|---|---|
| 搜索空间 | 所有可能下标或答案 |
| 搜索区间 | 当前还不能排除的候选范围 |
| 谓词 | 判断候选位于分界点哪一侧 |
| 不变量 | 每轮循环前后始终成立的事实 |
| 下界 `lower_bound` | 第一个大于等于目标的位置 |
| 上界 `upper_bound` | 第一个严格大于目标的位置 |
| 答案二分 | 不直接查数组值，而是在答案范围上二分 |

## 四、模板一：闭区间精确查找

[704 · 二分查找](../../problems/704-binary-search)要求在升序数组中寻找目标值。

搜索区间定义为：

```text
[left, right]
```

左右端点都属于尚未排除的候选。

```python
def binary_search(nums: list[int], target: int) -> int:
    left = 0
    right = len(nums) - 1

    while left <= right:
        middle = left + (right - left) // 2

        if nums[middle] == target:
            return middle

        if nums[middle] < target:
            # 中点已经确认不是答案，可以排除。
            left = middle + 1
        else:
            right = middle - 1

    return -1
```

### 为什么循环条件是 `left <= right`

闭区间 `[left, right]` 在：

```text
left == right
```

时仍然包含一个候选，必须检查。

只有：

```text
left > right
```

时区间才为空。

### 为什么更新必须跨过中点

中点已经比较过且不等于目标，因此不能继续保留：

```python
left = middle + 1
right = middle - 1
```

如果写成 `left = middle`，当区间只剩两个元素时，中点可能一直等于左端点，造成死循环。

## 五、精确查找逐步演算

```text
nums = [1, 3, 5, 7, 9, 11]
target = 9
```

| 轮次 | `left` | `right` | `middle` | 中点值 | 决策 |
|---:|---:|---:|---:|---:|---|
| 1 | 0 | 5 | 2 | 5 | 目标更大，保留 `[3, 5]` |
| 2 | 3 | 5 | 4 | 9 | 命中下标 4 |

未命中示例：

```text
target = 8
```

最终会出现：

```text
left = 4
right = 3
```

搜索区间为空，返回 `-1`。

## 六、模板二：左闭右开下界查找

边界问题更适合统一成：

```text
lower_bound(target)
= 第一个大于等于 target 的位置
```

搜索区间定义为：

```text
[left, right)
```

右端点不属于区间。

```python
def lower_bound(nums: list[int], target: int) -> int:
    left = 0
    right = len(nums)

    while left < right:
        middle = left + (right - left) // 2

        if nums[middle] < target:
            # middle 一定在下界左侧。
            left = middle + 1
        else:
            # middle 可能就是第一个 >= target 的位置。
            right = middle

    return left
```

### 为什么右端点初始化为 `len(nums)`

`lower_bound` 允许返回数组末尾之后的位置。

例如：

```text
nums = [1, 3, 5]
target = 8
```

第一个大于等于 8 的位置不存在，插入位置应该是：

```text
3 == len(nums)
```

因此初始候选区间需要包含这个虚拟位置。

### 为什么循环条件是 `left < right`

半开区间 `[left, right)` 在：

```text
left == right
```

时为空，循环结束。

## 七、下界不变量

执行过程中始终保持：

```text
left 左侧的位置都 < target
right 及其右侧的候选都 >= target
```

遇到：

```python
nums[middle] < target
```

说明中点一定在答案左侧，可以排除：

```python
left = middle + 1
```

否则中点可能就是答案，不能排除：

```python
right = middle
```

循环结束时 `left == right`，这个位置就是真假分界点。

## 八、例题一：查找目标的左右边界

[034 · 在排序数组中查找元素的第一个和最后一个位置](../../problems/034-find-first-and-last-position-of-element-in-sorted-array)要求：

```text
nums = [5, 7, 7, 8, 8, 10]
target = 8
输出 [3, 4]
```

可以定义：

```text
first = lower_bound(target)
after_last = lower_bound(target + 1)
last = after_last - 1
```

```python
def search_range(
    nums: list[int],
    target: int,
) -> list[int]:
    def lower_bound(value: int) -> int:
        left = 0
        right = len(nums)

        while left < right:
            middle = left + (right - left) // 2

            if nums[middle] < value:
                left = middle + 1
            else:
                right = middle

        return left

    first = lower_bound(target)

    if first == len(nums) or nums[first] != target:
        return [-1, -1]

    last = lower_bound(target + 1) - 1
    return [first, last]
```

### 为什么不能找到一个目标后向两边扫描

如果数组全是目标值，线性扩展会退化成：

```text
O(n)
```

两次边界二分仍然是：

```text
O(log n)
```

### 固定宽度整数如何避免 `target + 1` 溢出

可以单独实现：

```text
upper_bound(target)
= 第一个严格大于 target 的位置
```

Python 整数不会溢出，但面试中应该知道语言差异。

## 九、四种边界如何统一

假设数组非递减：

| 目标 | 单调谓词 | 查找类型 |
|---|---|---|
| 第一个 `>= target` | `nums[i] >= target` | 第一个 True |
| 第一个 `> target` | `nums[i] > target` | 第一个 True |
| 最后一个 `< target` | `nums[i] < target` | 最后一个 True |
| 最后一个 `<= target` | `nums[i] <= target` | 最后一个 True |

后两种可以通过前两种转换：

```text
最后一个 < target
= lower_bound(target) - 1
```

```text
最后一个 <= target
= upper_bound(target) - 1
```

实际编码时只要稳定掌握 `lower_bound` 和 `upper_bound`，就能覆盖大多数边界题。

## 十、Python 的 bisect

标准库已经提供边界二分：

```python
from bisect import bisect_left, bisect_right

left = bisect_left(nums, target)
right = bisect_right(nums, target)
```

语义：

```text
bisect_left  = 第一个 >= target
bisect_right = 第一个 > target
```

在工程代码中可以直接使用；在算法面试中，如果题目考察二分边界，通常仍要能手写并解释不变量。

## 十一、二分答案是什么

有些题目没有一个待查找的有序数组，但答案本身落在一个整数范围内。

例如：

```text
最小速度是多少？
最大允许距离是多少？
最少容量是多少？
最多能完成多少项任务？
```

这时可以：

1. 猜一个答案 `middle`；
2. 用 `feasible(middle)` 检查是否可行；
3. 根据单调性排除一半答案。

关键不在二分代码，而在于设计正确的可行性判断。

## 十二、例题二：整数平方根

[069 · x 的平方根](../../problems/069-sqrtx)要求寻找最大的整数 `value`，满足：

```text
value * value <= x
```

真假分布：

```text
True True True False False
```

要找最后一个 `True`。

```python
def integer_sqrt(x: int) -> int:
    if x < 2:
        return x

    left = 1
    right = x // 2
    answer = 1

    while left <= right:
        middle = left + (right - left) // 2

        if middle * middle <= x:
            # 当前值可行，记录后继续向右找更大值。
            answer = middle
            left = middle + 1
        else:
            right = middle - 1

    return answer
```

### `x = 8` 的演算

| 轮次 | 区间 | 中点 | `middle² <= 8` | 记录答案 |
|---:|---|---:|---|---:|
| 1 | `[1, 4]` | 2 | True | 2 |
| 2 | `[3, 4]` | 3 | False | 2 |

循环结束，答案是 2。

### 如何避免乘法溢出

固定宽度整数语言中，可以把：

```text
middle * middle <= x
```

改成：

```text
middle <= x // middle
```

## 十三、例题三：爱吃香蕉的珂珂

[875 · 爱吃香蕉的珂珂](../../problems/875-koko-eating-bananas)要求寻找完成所有香蕉堆的最小速度。

如果速度是 `speed`，吃完一堆需要：

```text
ceil(pile / speed)
```

使用整数计算：

```text
(pile + speed - 1) // speed
```

速度越快，所需总时间越短，因此可行性是单调的：

```text
低速：不可行
高速：可行
```

要找第一个 `True`。

```python
def min_eating_speed(
    piles: list[int],
    hours: int,
) -> int:
    def can_finish(speed: int) -> bool:
        required = 0

        for pile in piles:
            required += (pile + speed - 1) // speed

            # 已经超时，可以提前结束检查。
            if required > hours:
                return False

        return True

    left = 1
    right = max(piles)

    while left < right:
        middle = left + (right - left) // 2

        if can_finish(middle):
            # middle 可行，但可能还有更小的可行速度。
            right = middle
        else:
            left = middle + 1

    return left
```

### 如何确定上下界

- 最慢速度至少是 1；
- 每小时吃完最大的一堆一定足够，所以最大速度是 `max(piles)`。

答案二分的第一步通常不是写循环，而是找一个**一定包含答案**的上下界。

## 十四、答案二分的通用模板

### 找最小可行值

真假分布：

```text
False False False True True
```

```python
def first_feasible(left: int, right: int) -> int:
    while left < right:
        middle = left + (right - left) // 2

        if feasible(middle):
            right = middle
        else:
            left = middle + 1

    return left
```

### 找最大可行值

真假分布：

```text
True True True False False
```

向上取中点可以避免两元素区间死循环：

```python
def last_feasible(left: int, right: int) -> int:
    while left < right:
        middle = left + (right - left + 1) // 2

        if feasible(middle):
            left = middle
        else:
            right = middle - 1

    return left
```

### 为什么最大可行值要向上取中点

假设：

```text
left = 3
right = 4
```

向下取中点得到 3。如果 3 可行并执行：

```python
left = middle
```

区间仍是 `[3, 4]`，形成死循环。

向上取中点得到 4，就能保证区间缩小。

## 十五、如何设计可行性函数

一个好的 `feasible` 应该满足：

1. 判断含义明确；
2. 单调方向可以证明；
3. 单次检查复杂度可接受；
4. 不偷偷改变搜索条件。

### 常见设计方式

| 问题 | 猜测答案 | 可行性检查 |
|---|---|---|
| 最小速度 | 每单位时间处理量 | 是否能在时限内完成 |
| 最小容量 | 每天运输容量 | 是否能在限定天数运完 |
| 最大最小距离 | 选中点之间的最小间隔 | 是否能贪心选够数量 |
| 最小最大分组和 | 每组允许的最大和 | 是否能在组数限制内划分 |
| 最大平均值 | 猜测平均值 | 变换后是否存在非负区间和 |

很多答案二分题的难点其实是：

```text
二分 + 贪心验证
```

或者：

```text
二分 + 前缀和验证
```

## 十六、旋转数组为什么还能二分

有序数组在某个位置旋转后：

```text
[0, 1, 2, 4, 5, 6, 7]
→ [4, 5, 6, 7, 0, 1, 2]
```

整体不再有序，但每次从中点切开后，至少有一半仍然有序。

这就是新的可利用结构。

## 十七、例题四：搜索旋转排序数组

[033 · 搜索旋转排序数组](../../problems/033-search-in-rotated-sorted-array)假设元素互不相同。

```python
def search_rotated(
    nums: list[int],
    target: int,
) -> int:
    left = 0
    right = len(nums) - 1

    while left <= right:
        middle = left + (right - left) // 2

        if nums[middle] == target:
            return middle

        if nums[left] <= nums[middle]:
            # 左半区 [left, middle] 有序。
            if nums[left] <= target < nums[middle]:
                right = middle - 1
            else:
                left = middle + 1
        else:
            # 右半区 [middle, right] 有序。
            if nums[middle] < target <= nums[right]:
                left = middle + 1
            else:
                right = middle - 1

    return -1
```

### 示例演算

```text
nums = [4, 5, 6, 7, 0, 1, 2]
target = 0
```

第一轮：

```text
left = 0, middle = 3, right = 6
nums[middle] = 7
左半 [4, 5, 6, 7] 有序
目标 0 不在 [4, 7) 内
保留右半 [4, 6]
```

第二轮：

```text
left = 4, middle = 5, right = 6
nums[middle] = 1
左半 [0, 1] 有序
目标 0 落在 [0, 1) 内
保留 [4, 4]
```

第三轮中点是下标 4，命中目标 0。

### 重复元素为什么麻烦

如果：

```text
nums[left] == nums[middle] == nums[right]
```

无法判断哪一半有序，只能逐步收缩端点。最坏情况下会退化为 `O(n)`。

## 十八、例题五：寻找旋转数组最小值

[153 · 寻找旋转排序数组中的最小值](../../problems/153-find-minimum-in-rotated-sorted-array)可以比较中点和右端点：

```python
def find_min_rotated(nums: list[int]) -> int:
    left = 0
    right = len(nums) - 1

    while left < right:
        middle = left + (right - left) // 2

        if nums[middle] > nums[right]:
            # 最小值一定在 middle 右侧。
            left = middle + 1
        else:
            # middle 可能就是最小值，不能排除。
            right = middle

    return nums[left]
```

这里不能与左端比较后随意套用同样逻辑。右端点提供了一个稳定参照：

- 中点大于右端点，说明旋转断点在右侧；
- 中点小于右端点，说明中点到右端有序，最小值在左侧或就是中点。

## 十九、二维矩阵里的二分

矩阵题要先确认“有序”具体指什么：

### 每行有序，且下一行首元素大于上一行末元素

可以把矩阵视为一维数组：

```text
row = index // columns
column = index % columns
```

然后对 `[0, rows * columns)` 二分。

### 每行递增、每列递增

[240 · 搜索二维矩阵 II](../../problems/240-search-a-2d-matrix-ii)更适合从右上角或左下角线性排除一行 / 一列，时间 `O(rows + columns)`。

虽然也能逐行二分，但整体是：

```text
O(rows * log columns)
```

不一定优于利用二维单调性。

## 二十、两个有序数组中位数：二分分割线

[004 · 寻找两个正序数组的中位数](../../problems/004-median-of-two-sorted-arrays)是二分的高级形态。

二分的不是数组值，而是：

```text
较短数组左半部分应该取多少个元素
```

希望两条分割线满足：

```text
left_a <= right_b
left_b <= right_a
```

此时左半所有元素都不大于右半元素。

```python
def median_of_two_sorted_arrays(
    first: list[int],
    second: list[int],
) -> float:
    if not first and not second:
        raise ValueError("两个输入数组不能同时为空")

    if len(first) > len(second):
        first, second = second, first

    first_size = len(first)
    second_size = len(second)
    left_total = (first_size + second_size + 1) // 2

    left = 0
    right = first_size

    while left <= right:
        cut_first = left + (right - left) // 2
        cut_second = left_total - cut_first

        left_first = (
            float("-inf")
            if cut_first == 0
            else first[cut_first - 1]
        )
        right_first = (
            float("inf")
            if cut_first == first_size
            else first[cut_first]
        )
        left_second = (
            float("-inf")
            if cut_second == 0
            else second[cut_second - 1]
        )
        right_second = (
            float("inf")
            if cut_second == second_size
            else second[cut_second]
        )

        if (
            left_first <= right_second
            and left_second <= right_first
        ):
            left_maximum = max(left_first, left_second)

            if (first_size + second_size) % 2 == 1:
                return float(left_maximum)

            right_minimum = min(right_first, right_second)
            return (left_maximum + right_minimum) / 2

        if left_first > right_second:
            right = cut_first - 1
        else:
            left = cut_first + 1

    raise ValueError("输入数组必须有序且不能同时为空")
```

这道题体现了二分的本质：只要“分割位置是否合法”具有单调移动方向，就不必直接搜索某个目标值。

## 二十一、浮点二分

如果答案是实数，可以在区间上反复缩小：

```python
def square_root(value: float) -> float:
    if value < 0:
        raise ValueError("不能计算负数的实数平方根")

    left = 0.0
    right = max(1.0, value)

    for _ in range(100):
        middle = (left + right) / 2

        if middle * middle <= value:
            left = middle
        else:
            right = middle

    return (left + right) / 2
```

### 为什么用固定轮数

浮点数存在精度误差，直接写：

```python
while left < right:
```

可能无法稳定结束。

常见停止方式：

- 固定迭代次数；
- `right - left <= epsilon`。

固定 100 次对双精度浮点已经足够精细，而且没有边界死循环。

## 二十二、整数中点的细节

推荐：

```python
middle = left + (right - left) // 2
```

而不是：

```python
middle = (left + right) // 2
```

Python 不会整数溢出，但固定宽度语言中 `left + right` 可能溢出。

### 负数区间

不同语言的整数除法对负数取整方向可能不同。Python 的 `//` 向负无穷取整。

大多数数组下标和非负答案二分不受影响；如果在包含负数的答案空间中二分，应明确中点取整方向和更新规则。

## 二十三、最常见的死循环

### 错误一：保留中点却向下取整

```python
while left < right:
    middle = (left + right) // 2

    if feasible(middle):
        left = middle
```

当区间只剩两个数时，`middle == left`，区间不再缩小。

修复：

```python
middle = (left + right + 1) // 2
```

### 错误二：半开区间却使用闭区间循环

```python
right = len(nums)
while left <= right:
```

此时 `middle` 可能等于 `len(nums)`，导致越界。

### 错误三：命中边界就返回

查找第一个或最后一个目标时，命中中点只能说明目标存在，不能说明它是边界。

### 错误四：可行性方向写反

必须先画出：

```text
False ... False True ... True
```

或者：

```text
True ... True False ... False
```

再决定可行时向左还是向右。

## 二十四、二分查找常见错误清单

1. 没声明搜索区间是闭区间还是半开区间；
2. 循环条件与区间语义不匹配；
3. 中点已排除，却没有使用 `+1` 或 `-1`；
4. 返回 `left` 后没有检查目标是否真实存在；
5. 边界题命中就提前返回；
6. 答案二分没有证明单调性；
7. 上下界不能保证覆盖答案；
8. 可行性函数复杂度过高；
9. 乘法比较在固定宽度语言中溢出；
10. 旋转数组含重复元素，却仍假设能确定有序半区；
11. 浮点二分使用精确相等作为停止条件；
12. 最大可行值模板没有向上取中点。

## 二十五、如何测试二分代码

至少覆盖：

| 用例 | 检查点 |
|---|---|
| 空数组 | 初始区间是否正确 |
| 单元素命中 | `left == right` 是否检查 |
| 单元素未命中 | 能否正常退出 |
| 目标在第一个位置 | 左边界 |
| 目标在最后一个位置 | 右边界 |
| 目标小于所有元素 | 返回 0 或未命中 |
| 目标大于所有元素 | 返回 `len(nums)` 或未命中 |
| 全部元素相同 | 重复值边界 |
| 两元素数组 | 是否死循环 |
| 答案等于上下界 | 可行区间是否包含端点 |

二分错误经常只在两元素区间暴露，所以 `[1, 2]` 是非常重要的测试。

## 二十六、看到题目如何判断是否能二分

按顺序问：

1. 候选答案是什么？
2. 候选答案能否按大小排列？
3. 给定一个候选值，能否检查它是否可行？
4. 可行性是否只从真变假一次，或只从假变真一次？
5. 要找第一个可行，还是最后一个可行？
6. 上下界是什么？
7. 单次检查复杂度是多少？

如果第 4 问无法证明，就不要强行二分。

## 二十七、题型速查表

| 题型 | 搜索对象 | 推荐模板 |
|---|---|---|
| 有序数组找目标 | 下标 | 闭区间精确查找 |
| 插入位置 | 第一个 `>= target` | `lower_bound` |
| 重复元素左右边界 | 两个分界点 | `lower_bound` + `upper_bound` |
| 平方根 | 最大可行整数 | 最后一个 True |
| 最小速度 / 容量 | 最小可行答案 | 第一个 True |
| 最大最小距离 | 最大可行答案 | 最后一个 True |
| 旋转数组找目标 | 有序半区 | 闭区间变形 |
| 旋转数组最小值 | 旋转断点 | 与右端点比较 |
| 浮点根或精度答案 | 实数答案 | 固定轮数二分 |
| 两有序数组中位数 | 分割位置 | 较短数组上二分 |

## 二十八、配套训练题

### 基础与边界

1. [704 · 二分查找](../../problems/704-binary-search)
2. [034 · 查找元素的第一个和最后一个位置](../../problems/034-find-first-and-last-position-of-element-in-sorted-array)
3. [069 · x 的平方根](../../problems/069-sqrtx)

### 旋转数组

1. [033 · 搜索旋转排序数组](../../problems/033-search-in-rotated-sorted-array)
2. [153 · 寻找旋转排序数组中的最小值](../../problems/153-find-minimum-in-rotated-sorted-array)

### 答案二分

1. [875 · 爱吃香蕉的珂珂](../../problems/875-koko-eating-bananas)
2. [1011 · 在 D 天内送达包裹的能力](https://leetcode.cn/problems/capacity-to-ship-packages-within-d-days/)
3. [410 · 分割数组的最大值](https://leetcode.cn/problems/split-array-largest-sum/)
4. [1482 · 制作 m 束花所需的最少天数](https://leetcode.cn/problems/minimum-number-of-days-to-make-m-bouquets/)

### 高级

1. [004 · 寻找两个正序数组的中位数](../../problems/004-median-of-two-sorted-arrays)
2. [162 · 寻找峰值](https://leetcode.cn/problems/find-peak-element/)
3. [240 · 搜索二维矩阵 II](../../problems/240-search-a-2d-matrix-ii)

## 二十九、面试时如何完整表达

建议按下面顺序：

1. **搜索对象**：二分的是下标、答案还是分割位置；
2. **单调性**：为什么判断结果只有一个分界点；
3. **区间语义**：闭区间还是半开区间；
4. **不变量**：哪些位置已经确认在答案左侧或右侧；
5. **更新规则**：中点能否排除，为什么使用 `middle` 或 `middle ± 1`；
6. **返回语义**：返回命中下标、第一个可行还是最后一个可行；
7. **复杂度**：二分轮数乘以一次可行性检查成本。

以珂珂吃香蕉为例：

> 我二分的是速度。速度越大，吃完所需时间单调不增，因此可行性从假变真。速度下界是 1，上界是最大香蕉堆。对中点速度线性计算总时间；如果能完成，中点可能是答案，保留左半区，否则排除中点和更低速度。最终 `left` 是第一个可行速度。二分约 `log(maxPile)` 轮，每轮扫描所有堆，总时间 `O(n log maxPile)`。

## 三十、最后记住什么

如果只能记住四句话：

1. **先证明单调性，再写二分；**
2. **先声明区间语义，再决定循环条件；**
3. **中点能否排除，决定使用 `middle` 还是 `middle ± 1`；**
4. **边界二分的返回值是分界点，不一定真的等于目标。**

真正掌握二分查找，是遇到陌生问题时能自己构造单调谓词和搜索空间，而不是记住多少套 `left`、`right` 模板。
