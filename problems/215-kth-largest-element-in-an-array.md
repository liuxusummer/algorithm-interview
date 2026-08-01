# 215 · 数组中的第 K 个最大元素

<ProblemMeta
  :tags="['Hot100', '大厂面试', '最小堆', 'Quickselect', '华为面试题']"
  difficulty="medium"
  :appearances="138"
  pass-rate="53%"
  source-url="https://leetcode.cn/problems/kth-largest-element-in-an-array/"
  source-label="力扣原题"
/>

<ComplexityBadge time="最小堆 O(n log k)，Quickselect 平均 O(n)" space="最小堆 O(k)，Quickselect O(1)" />

## 题目

给定整数数组 `nums` 和整数 `k`，返回数组排序后第 `k` 个最大的元素。

注意求的是排序位置，不是第 `k` 个不同的值。

### 示例

```text
输入：nums = [3, 2, 1, 5, 6, 4], k = 2
输出：5
```

```text
输入：nums = [3, 2, 3, 1, 2, 4, 5, 5, 6], k = 4
输出：4
```

## 解法一：大小为 K 的最小堆

### 为什么维护大小为 K 的最小堆

堆中始终保存已经扫描元素里最大的 `k` 个：

- 堆不足 `k` 个时直接加入；
- 堆满后，新值大于堆顶才替换；
- 最小堆顶是这 `k` 个大数里最小的，也就是当前第 `k` 大。

Python 的 `heapq` 默认就是最小堆。

### Python 实现

```python
import heapq


class Solution:
    def findKthLargest(self, nums: list[int], k: int) -> int:
        heap: list[int] = []

        # 小根堆只保留当前最大的 k 个数，堆顶即第 k 大。
        for value in nums:
            if len(heap) < k:
                heapq.heappush(heap, value)
            elif value > heap[0]:
                heapq.heapreplace(heap, value)

        return heap[0]
```

### 堆不变量

扫描任意前缀后，堆中保存该前缀最大的 `min(k, prefix_length)` 个元素。

当堆已满：

- 新值不大于堆顶，它不可能进入前 `k` 大；
- 新值大于堆顶，就移除当前第 `k` 大并加入新值，仍然保留前 `k` 大。

### 正确性说明

由堆不变量，扫描完整个数组后，堆中恰好保存全数组最大的 `k` 个元素。最小堆顶是这组元素中最小的一个，在全数组排序中正好处于倒数第 `k` 个位置，因此返回值就是第 `k` 大元素。重复值也按出现次数自然保留。

### 复杂度

- 时间复杂度：`O(n log k)`，每次堆操作最多处理 `k` 个元素。
- 空间复杂度：`O(k)`。

## 解法二：随机化 Quickselect

排序后第 `k` 大元素的下标是：

```text
target = len(nums) - k
```

Quickselect 不需要把整个数组排好，只需通过分区判断目标下标位于哪一侧：

1. 随机选择一个主元 `pivot`；
2. 三路分区成“小于、等于、大于”三段；
3. 目标落在小于段，就只处理左侧；
4. 目标落在大于段，就只处理右侧；
5. 目标落在等于段，答案就是 `pivot`。

使用三路分区后，大量重复值会一次进入中间段，不会反复参与后续选择。

### Python 实现

```python
from random import randrange


class Solution:
    def findKthLargest(self, nums: list[int], k: int) -> int:
        target = len(nums) - k
        left = 0
        right = len(nums) - 1

        while left <= right:
            pivot = nums[randrange(left, right + 1)]
            less = left
            current = left
            greater = right

            # 三路分区：左侧小于 pivot，中间等于 pivot，右侧大于 pivot。
            while current <= greater:
                if nums[current] < pivot:
                    nums[less], nums[current] = (
                        nums[current],
                        nums[less],
                    )
                    less += 1
                    current += 1
                elif nums[current] > pivot:
                    nums[current], nums[greater] = (
                        nums[greater],
                        nums[current],
                    )
                    greater -= 1
                    # 换回来的元素还未分类，current 暂时不移动。
                else:
                    current += 1

            if target < less:
                right = less - 1
            elif target > greater:
                left = greater + 1
            else:
                # target 落在等值区间，其中任意元素都是目标排名。
                return nums[target]

        raise ValueError("k 超出数组长度")
```

### 为什么只保留一侧

分区结束后，`[left, less)` 中的元素全部小于主元，`[less, greater]` 全部等于主元，`(greater, right]` 全部大于主元。这三段在完整排序中的相对位置已经确定。

因此目标下标若在某一侧，另一侧所有元素都不可能成为答案，可以整体丢弃。这也是 Quickselect 比完整快速排序少做工作的原因。

### 正确性说明

每次三路分区都把当前区间划分成严格有序的三个值域。若目标落在左段或右段，算法保留的区间一定包含排序后目标位置；若落在中段，中段所有值相等，直接返回即为正确排名。区间每轮严格缩小，最终必然命中目标。

### 复杂度

- 期望时间复杂度：`O(n)`。随机主元下，待处理区间通常按比例缩小，总工作量形成几何级数。
- 最坏时间复杂度：`O(n²)`。连续选到极端主元时仍可能退化。
- 额外空间复杂度：`O(1)`。算法迭代执行并原地分区。

Quickselect 会改变输入数组的元素顺序；如果接口要求保留原数组，需要先复制，此时额外空间变为 `O(n)`。数据流场景无法反复原地分区，应继续使用大小为 `k` 的最小堆。

## 边界用例

| 场景 | 预期 | 检查点 |
|---|---|---|
| `k = 1` | 最大值 | 堆大小为一 |
| `k = n` | 最小值 | 保存全部元素 |
| 含重复值 | 按排序位置返回 | 不是去重排名 |
| 含负数 | 正确比较 | 不依赖值范围 |

## 90 秒面试表达

“数据流或希望复杂度稳定时，我维护大小为 `k` 的最小堆，时间 `O(n log k)`。如果是一次性数组并允许修改，我会用随机化 Quickselect：把第 `k` 大转成下标 `n-k`，三路分区后只保留目标所在的一侧，目标落在等值段就直接返回。它平均 `O(n)`、额外空间 `O(1)`，但理论最坏是 `O(n²)`。”

## 常见追问

- Quickselect 使用三路分区能避免重复元素不断进入后续区间。
- 数据流场景下，大小为 `k` 的最小堆可以持续维护第 `k` 大。
- 如果值域很小，可使用计数数组从大到小累计频次。
