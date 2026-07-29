# 004 · 寻找两个正序数组的中位数

<ProblemMeta
  :tags="['Hot100', '大厂面试', '分割线二分']"
  difficulty="hard"
  :appearances="19"
  pass-rate="34%"
  source-url="https://leetcode.cn/problems/median-of-two-sorted-arrays/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(log min(m, n))" space="O(1)" />

## 题目

给定两个分别升序排列的数组 `nums1` 和 `nums2`，返回两个数组合并后的中位数。

要求算法时间复杂度为 `O(log(m + n))`。

### 示例

```text
输入：nums1 = [1, 3], nums2 = [2]
输出：2.0

输入：nums1 = [1, 2], nums2 = [3, 4]
输出：2.5
```

## 从“找数”转成“找分割线”

在两个数组中各放一条分割线，把所有元素分成左右两部分，要求：

1. 左半部分元素数量等于右半，或只多一个；
2. 左半部分所有元素都不大于右半部分所有元素。

若 `nums1` 左侧取 `partition1` 个元素，则 `nums2` 左侧必须取：

```text
partition2 = (m + n + 1) // 2 - partition1
```

只需在较短数组中二分 `partition1`。

## Python 实现

```python
from typing import List


class Solution:
    def findMedianSortedArrays(
        self,
        nums1: List[int],
        nums2: List[int],
    ) -> float:
        # 始终在较短的数组 nums1 上二分。
        # 这样二分次数最少，也能保证 nums2 的分割位置 j 不会越界。
        if len(nums1) > len(nums2):
            nums1, nums2 = nums2, nums1

        m = len(nums1)
        n = len(nums2)

        # i 表示 nums1 左半部分包含的元素数量，范围是 [0, m]。
        left = 0
        right = m

        while left <= right:
            i = (left + right) // 2

            # 左半部分固定包含 (m + n + 1) // 2 个元素。
            # i 确定后，nums2 的分割位置 j 也随之确定。
            j = (m + n + 1) // 2 - i

            # 分割线可以落在数组两端。
            # 使用正负无穷作为哨兵，可以统一处理空数组和边界分割。
            nums1_left = float("-inf") if i == 0 else nums1[i - 1]
            nums1_right = float("inf") if i == m else nums1[i]

            nums2_left = float("-inf") if j == 0 else nums2[j - 1]
            nums2_right = float("inf") if j == n else nums2[j]

            # 两个交叉条件都成立，说明左半部分所有元素
            # 都不大于右半部分所有元素，当前分割合法。
            if (
                nums1_left <= nums2_right
                and nums2_left <= nums1_right
            ):
                if (m + n) % 2 == 1:
                    # 总长度为奇数时，左半部分比右半部分多一个元素。
                    return max(nums1_left, nums2_left)

                # 总长度为偶数时，中位数是：
                # 左半部分最大值与右半部分最小值的平均数。
                return (
                    max(nums1_left, nums2_left)
                    + min(nums1_right, nums2_right)
                ) / 2

            if nums1_left > nums2_right:
                # nums1 左边取多了，分割线向左移动。
                right = i - 1
            else:
                # nums1 左边取少了，分割线向右移动。
                left = i + 1
```

## 分割线如何移动

- `left1 > right2`：`nums1` 左边取多了，分割线左移；
- `left2 > right1`：`nums1` 左边取少了，分割线右移；
- 两个交叉条件都满足：左半全部不大于右半，找到合法分割。

无穷哨兵让分割线位于数组最左或最右时无需写额外比较分支。

## 中位数如何得到

- 总长度为奇数：左半多一个元素，中位数是两侧左边界最大值；
- 总长度为偶数：中位数是左半最大值与右半最小值的平均数。

## 正确性说明

左右元素数量由 `partition2` 的公式始终满足。二分只需寻找交叉有序条件：一数组左侧最大值不超过另一数组右侧最小值。条件成立时，两个数组内部各自有序，因此整个左半都不大于整个右半，中位数公式成立。条件不成立时，比较结果能唯一决定第一条分割线应左移还是右移，所以不会排除合法分割。

## 复杂度

- 时间复杂度：`O(log min(m, n))`。
- 空间复杂度：`O(1)`。

## 边界用例

| 输入 | 预期 | 检查点 |
|---|---:|---|
| `[1,3]`, `[2]` | `2.0` | 奇数总长度 |
| `[1,2]`, `[3,4]` | `2.5` | 偶数总长度 |
| `[]`, `[1]` | `1.0` | 一个数组为空 |
| `[0,0]`, `[0,0]` | `0.0` | 重复元素 |

## 90 秒面试表达

“不实际合并数组，而是在两个数组中找分割线。左半元素数量固定，所以短数组的分割位置确定后，另一个位置也随之确定。合法条件是两个数组左侧最大值都不超过对方右侧最小值；不满足时根据交叉比较移动短数组分割线。找到后，奇数长度取左半最大值，偶数长度再与右半最小值求平均。时间 `O(log min(m,n))`、空间 `O(1)`。”

## 常见追问

- 合并后取中位数是 `O(m+n)` 时间和空间，可作为基线方案。
- 也可以推广为寻找两个有序数组合并后的第 `k` 小元素。
- 二分较短数组是为了保证另一条分割线始终落在合法范围内。
