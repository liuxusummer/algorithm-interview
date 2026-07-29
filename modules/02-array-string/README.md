# 02 · 数组、字符串与双指针

数组与字符串是面试中最常见的输入形式，也是学习“用索引维护状态”的起点。

## 专题深入

[二分查找系统详解](./binary-search)从搜索区间和单调谓词出发，系统讲解精确查找、左右边界、答案二分、旋转数组、浮点二分和有序数组分割，并配有逐步演算与完整 Python 例题。

## 本模块目标

- 能明确索引、窗口和搜索区间的语义；
- 能区分精确二分、边界二分和答案二分；
- 能利用旋转数组至少一半有序的性质；
- 能解释排序算法的稳定性、最坏复杂度和空间成本；
- 能在双指针、滑动窗口、前缀和与二分之间选择合适模式。

## 二分与排序学习顺序

### 1. 闭区间精确查找

| 题目 | 搜索对象 | 区间语义 |
|---|---|---|
| [704 · 二分查找](/problems/704-binary-search) | 已排序数组中的目标值 | 闭区间 `[left,right]` |

命中中点后可以直接返回。未命中时，中点已经排除，边界必须跨过中点，使用 `middle + 1` 或 `middle - 1`。

### 2. 边界与答案二分

| 题目 | 要找的边界 | 核心谓词 |
|---|---|---|
| [034 · 查找元素的第一个和最后一个位置](/problems/034-find-first-and-last-position-of-element-in-sorted-array) | 第一个大于等于目标的位置 | `nums[index] >= target` |
| [069 · x 的平方根](/problems/069-sqrtx) | 最后一个平方不超过 `x` 的整数 | `value² <= x` |

二分不只是在数组中找某个值。只要候选答案上的真假具有单调边界，就可以二分答案。

### 3. 旋转数组

| 题目 | 比较方式 | 保留区间 |
|---|---|---|
| [153 · 寻找旋转排序数组中的最小值](/problems/153-find-minimum-in-rotated-sorted-array) | 中点与右端比较 | 保留旋转断点所在侧 |
| [033 · 搜索旋转排序数组](/problems/033-search-in-rotated-sorted-array) | 先确定有序半区 | 按目标值域选择一半 |

旋转数组整体不再有序，但每次从中点切开后，至少一半仍有序。无重复元素是能够稳定判断的关键条件。

### 4. 两个有序数组的分割线

| 题目 | 二分变量 | 合法条件 |
|---|---|---|
| [004 · 寻找两个正序数组的中位数](/problems/004-median-of-two-sorted-arrays) | 较短数组左半元素数量 | 两侧左最大值不超过对方右最小值 |

这类题二分的不是某个数组值，而是分割位置。元素总数约束先确定另一条分割线，再用交叉边界判断移动方向。

### 5. 手写稳定排序

| 题目 | 实现 | 特性 |
|---|---|---|
| [912 · 排序数组](/problems/912-sort-an-array) | 自底向上归并排序 | 最坏 `O(n log n)`、稳定、无递归栈 |
| [088 · 合并两个有序数组](/problems/088-merge-sorted-array) | 逆向双指针归并 | 利用目标数组尾部空间 |
| [075 · 颜色分类](/problems/075-sort-colors) | 荷兰国旗三指针 | 原地维护 0、1、2 三段区域 |

## 其他核心模式

| 模式 | 代表题 |
|---|---|
| 滑动窗口 | [003 · 无重复字符的最长子串](/problems/003-longest-substring-without-repeating-characters)、[076 · 最小覆盖子串](/problems/076-minimum-window-substring)、[209 · 长度最小的子数组](/problems/209-minimum-size-subarray-sum) |
| 排序 + 双指针 | [015 · 三数之和](/problems/015-three-sum)、[042 · 接雨水](/problems/042-trapping-rain-water) |
| 边界模拟 | [054 · 螺旋矩阵](/problems/054-spiral-matrix)、[056 · 合并区间](/problems/056-merge-intervals) |
| 单调矩阵搜索 | [240 · 搜索二维矩阵 II](/problems/240-search-a-2d-matrix-ii) |
| 字符串模拟 | [043 · 字符串相乘](/problems/043-multiply-strings)、[165 · 比较版本号](/problems/165-compare-version-numbers)、[415 · 字符串相加](/problems/415-add-strings)、[443 · 压缩字符串](/problems/443-string-compression) |
| 值域映射 | [442 · 数组中重复的数据](/problems/442-find-all-duplicates-in-an-array) |

## 华为高频补充

| 模式 | 代表题 |
|---|---|
| 双指针 | [011 · 盛最多水的容器](/problems/011-container-with-most-water)、[016 · 最接近的三数之和](/problems/016-3sum-closest)、[344 · 反转字符串](/problems/344-reverse-string) |
| 答案二分 | [875 · 爱吃香蕉的珂珂](/problems/875-koko-eating-bananas) |
| 字符串解析 | [008 · 字符串转换整数（atoi）](/problems/008-string-to-integer-atoi)、[065 · 有效数字](/problems/065-valid-number) |
| 计数与前缀 | [451 · 根据字符出现频率排序](/problems/451-sort-characters-by-frequency)、[554 · 砖墙](/problems/554-brick-wall)、[1160 · 拼写单词](/problems/1160-find-words-that-can-be-formed-by-characters) |
| 滑动窗口 | [1423 · 可获得的最大点数](/problems/1423-maximum-points-you-can-obtain-from-cards) |
| 排序与投票 | [169 · 多数元素](/problems/169-majority-element)、[179 · 最大数](/problems/179-largest-number) |

## 二分实现检查表

- 当前维护的是闭区间还是半开区间；
- 循环条件应为 `left <= right` 还是 `left < right`；
- 中点是否已经被排除；
- 返回的是命中位置、可行左边界还是可行右边界；
- 重复元素是否会让有序半区判断失效；
- 乘法比较是否可能溢出；
- 空数组、单元素和未旋转数组是否正确。

## 后续扩展

- 前缀和与差分数组；
- 快速选择与 Top K；
- 计数排序、基数排序与值域约束；
- 二分答案配合贪心验证；
- 外部排序与大数据归并。
