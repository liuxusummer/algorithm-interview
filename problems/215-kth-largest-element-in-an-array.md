# 215 · 数组中的第 K 个最大元素

<ProblemMeta
  :tags="['Hot100', '大厂面试', '最小堆', '华为面试题']"
  difficulty="medium"
  :appearances="138"
  pass-rate="53%"
  source-url="https://leetcode.cn/problems/kth-largest-element-in-an-array/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n log k)" space="O(k)" />

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

## 为什么维护大小为 K 的最小堆

堆中始终保存已经扫描元素里最大的 `k` 个：

- 堆不足 `k` 个时直接加入；
- 堆满后，新值大于堆顶才替换；
- 最小堆顶是这 `k` 个大数里最小的，也就是当前第 `k` 大。

Python 的 `heapq` 默认就是最小堆。

## Python 实现

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

## 堆不变量

扫描任意前缀后，堆中保存该前缀最大的 `min(k, prefix_length)` 个元素。

当堆已满：

- 新值不大于堆顶，它不可能进入前 `k` 大；
- 新值大于堆顶，就移除当前第 `k` 大并加入新值，仍然保留前 `k` 大。

## 正确性说明

由堆不变量，扫描完整个数组后，堆中恰好保存全数组最大的 `k` 个元素。最小堆顶是这组元素中最小的一个，在全数组排序中正好处于倒数第 `k` 个位置，因此返回值就是第 `k` 大元素。重复值也按出现次数自然保留。

## 复杂度

- 时间复杂度：`O(n log k)`，每次堆操作最多处理 `k` 个元素。
- 空间复杂度：`O(k)`。

## 边界用例

| 场景 | 预期 | 检查点 |
|---|---|---|
| `k = 1` | 最大值 | 堆大小为一 |
| `k = n` | 最小值 | 保存全部元素 |
| 含重复值 | 按排序位置返回 | 不是去重排名 |
| 含负数 | 正确比较 | 不依赖值范围 |

## 90 秒面试表达

“完整排序要 `O(n log n)`，但只关心最大的 `k` 个。我维护大小最多为 `k` 的最小堆：未满时入堆，满后只有新值大于堆顶才替换。扫描结束时堆里是全局最大的 `k` 个元素，堆顶就是其中最小的，也就是第 `k` 大。时间 `O(n log k)`、空间 `O(k)`。”

## 常见追问

- Quickselect 平均时间 `O(n)`、最坏 `O(n²)`，通常会随机化主元。
- 数据流场景下，大小为 `k` 的最小堆可以持续维护第 `k` 大。
- 如果值域很小，可使用计数数组从大到小累计频次。
