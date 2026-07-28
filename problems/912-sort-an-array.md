# 912 · 排序数组

<ProblemMeta
  :tags="['字节面试题', '排序', '归并排序']"
  difficulty="medium"
  :appearances="30"
  pass-rate="54%"
  source-url="https://leetcode.cn/problems/sort-an-array/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n log n)" space="O(n)" />

## 题目

给定整数数组 `nums`，将数组按升序排列并返回。

本题实现不调用语言内置排序，使用自底向上的归并排序。

### 示例

```text
输入：nums = [5,2,3,1]
输出：[1,2,3,5]

输入：nums = [5,1,1,2,0,0]
输出：[0,0,1,1,2,5]
```

## 为什么选择归并排序

- 最坏时间复杂度稳定为 `O(n log n)`；
- 不依赖输入是否接近有序；
- 不会像随机化不足的快速排序那样退化到 `O(n²)`；
- 自底向上实现不使用递归栈。

算法先把每个单元素看作有序段，再依次合并长度为 `1、2、4、8...` 的相邻有序段。

## Python 实现

```python
class Solution:
    def sortArray(self, nums: list[int]) -> list[int]:
        length = len(nums)
        source = nums.copy()
        target = [0] * length
        width = 1

        while width < length:
            for left in range(0, length, width * 2):
                middle = min(left + width, length)
                right = min(left + width * 2, length)
                first = left
                second = middle
                write = left

                while first < middle and second < right:
                    if source[first] <= source[second]:
                        target[write] = source[first]
                        first += 1
                    else:
                        target[write] = source[second]
                        second += 1
                    write += 1

                while first < middle:
                    target[write] = source[first]
                    first += 1
                    write += 1

                while second < right:
                    target[write] = source[second]
                    second += 1
                    write += 1

            source, target = target, source
            width *= 2

        return source
```

## 双缓冲为什么不会丢数据

每一轮都从 `source` 读取两个上一轮已经有序的相邻段，把完整合并结果写入 `target` 的同一区间。

整轮结束后交换两个数组的角色，下一轮读取刚完成的结果。所有位置每轮都会被恰好覆盖一次，因此旧的 `target` 内容无需清空。

## 稳定性

两个元素相等时优先取左段元素，保持相等元素原有相对顺序，因此该实现是稳定排序。

本题只包含整数，稳定性不会影响返回值，但这是归并排序的重要性质。

## 正确性说明

初始宽度为 1，每个单元素段有序。假设一轮开始时所有长度不超过 `width` 的分段有序，合并操作按序选取两段最小剩余元素，产生有序的长度不超过 `2 × width` 的分段。由归纳法，每轮结束后有序段宽度翻倍；当宽度覆盖数组长度时，整个数组有序。

## 复杂度

- 时间复杂度：`O(n log n)`，共 `log n` 轮，每轮处理 `n` 个元素。
- 空间复杂度：`O(n)`，使用辅助数组。

## 边界用例

| 输入 | 预期 | 检查点 |
|---|---|---|
| `[]` | `[]` | 空数组 |
| `[1]` | `[1]` | 单元素 |
| `[5,2,3,1]` | `[1,2,3,5]` | 常规乱序 |
| `[5,1,1,2,0,0]` | `[0,0,1,1,2,5]` | 重复值 |
| `[4,3,2,1]` | `[1,2,3,4]` | 逆序 |

## 90 秒面试表达

“我不用内置排序，采用自底向上的归并排序。先把每个元素视作长度 1 的有序段，依次合并宽度为 1、2、4 的相邻段。使用 source 和 target 两个数组做双缓冲，每轮合并完成后交换角色，避免递归。每轮线性处理全部元素，共 `log n` 轮，所以时间 `O(n log n)`、空间 `O(n)`。”

## 常见追问

- 堆排序可以做到最坏 `O(n log n)` 且额外空间 `O(1)`，但不稳定。
- 快速排序平均 `O(n log n)`，应随机化主元并注意最坏情况。
- 链表排序适合归并，因为合并时无需额外数组且不需要随机访问。
