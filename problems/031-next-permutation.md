# 031 · 下一个排列

<ProblemMeta
  :tags="['Hot100', '大厂面试', '数组', '双指针']"
  difficulty="medium"
  :appearances="136"
  pass-rate="39%"
  source-url="https://leetcode.cn/problems/next-permutation/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(1)" />

## 题目

把整数数组原地改成字典序中的下一个排列；如果当前已经是最大排列，就改成最小排列。

```text
[1, 2, 3] → [1, 3, 2]
[3, 2, 1] → [1, 2, 3]
[1, 1, 5] → [1, 5, 1]
```

## 从右侧寻找“还能变大”的位置

从右往左找到第一个 `nums[i] < nums[i + 1]`。它右侧必然是非递增序列，说明只改后缀已经不可能得到更大的排列。

为了让增幅最小，应在右侧找到最靠右、且严格大于 `nums[i]` 的元素与它交换。交换后，后缀仍是非递增的，把它反转为非递减序列，就得到最小后缀。

## Python 实现

```python
from typing import List


class Solution:
    def nextPermutation(self, nums: List[int]) -> None:
        n = len(nums)
        pivot = n - 2

        # 找到从右向左第一个还能被更大数字替换的位置。
        while pivot >= 0 and nums[pivot] >= nums[pivot + 1]:
            pivot -= 1

        if pivot >= 0:
            successor = n - 1
            # 后缀非递增，因此最靠右的大于 pivot 的数就是最小可用值。
            while nums[successor] <= nums[pivot]:
                successor -= 1
            nums[pivot], nums[successor] = nums[successor], nums[pivot]

        # 交换后的后缀仍为非递增；原地反转得到最小字典序后缀。
        left, right = pivot + 1, n - 1
        while left < right:
            nums[left], nums[right] = nums[right], nums[left]
            left += 1
            right -= 1
```

## 正确性说明

`pivot` 右侧是不能单独变大的最大排列，所以必须提高 `nums[pivot]`。用右侧最小的更大值替换它，使第一处变化最小；随后选择最小后缀，得到所有更大排列中的最小者。若不存在 `pivot`，整个数组非递增，反转后就是最小排列。

## 复杂度与边界

- 时间 `O(n)`，最多进行三次线性扫描；额外空间 `O(1)`。
- 重复元素必须使用严格比较；单元素数组无需特殊分支。

## 90 秒面试表达

“下一个排列要让高位尽量晚变化、变化幅度尽量小。我从右侧找第一个上升断点，右侧已经是最大排列；再用右侧最小的更大元素替换断点，最后把后缀反转成最小排列。整个过程原地完成，时间 `O(n)`、空间 `O(1)`。”
