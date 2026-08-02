# 283 · 移动零

<ProblemMeta
  :tags="['Hot100', '大厂面试', '数组', '双指针']"
  difficulty="easy"
  :appearances="67"
  pass-rate="64%"
  source-url="https://leetcode.cn/problems/move-zeroes/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(1)" />

## 题目

把数组中的所有零移动到末尾，同时保持非零元素相对顺序，要求原地完成。

### 示例

```text
输入：nums = [0, 1, 0, 3, 12]
输出：[1, 3, 12, 0, 0]
解释：非零元素 1、3、12 的相对顺序保持不变，所有零被移动到末尾。
```

## 读写双指针

`read` 扫描所有元素，`write` 指向下一个非零元素应放置的位置。读到非零数时与 `write` 位置交换，并推进 `write`。

## Python 实现

```python
from typing import List


class Solution:
    def moveZeroes(self, nums: List[int]) -> None:
        write = 0

        for read in range(len(nums)):
            if nums[read] == 0:
                continue

            # 非零元素按读取顺序写入，因此相对顺序不会改变。
            nums[write], nums[read] = nums[read], nums[write]
            write += 1
```

## 循环不变量

扫描到 `read` 前，`nums[:write]` 是已经遇到的全部非零元素且顺序不变；`write..read-1` 都是零。交换后该性质继续成立。扫描结束时所有非零元素位于前缀，其余位置自然为零。

## 复杂度与边界

时间 `O(n)`、额外空间 `O(1)`。全零、无零和空数组都由同一逻辑处理。若关注写入次数，可以先覆盖非零前缀，再统一填零。
