# 048 · 旋转图像

<ProblemMeta
  :tags="['Hot100', '大厂面试', '矩阵', '原地算法']"
  difficulty="medium"
  :appearances="84"
  pass-rate="76%"
  source-url="https://leetcode.cn/problems/rotate-image/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n²)" space="O(1)" />

## 题目

把 `n × n` 矩阵原地顺时针旋转 90°。

```text
1 2 3      7 4 1
4 5 6  ->  8 5 2
7 8 9      9 6 3
```

## 两步变换

顺时针旋转后的映射是 `(row, col) → (col, n-1-row)`。与其直接做四元环交换，更容易讲清的写法是：

1. 沿主对角线转置；
2. 反转每一行。

转置把 `(row, col)` 移到 `(col, row)`，行反转再移到 `(col, n-1-row)`，恰好得到目标位置。

## Python 实现

```python
from typing import List


class Solution:
    def rotate(self, matrix: List[List[int]]) -> None:
        n = len(matrix)

        # 只处理主对角线上方，避免同一对元素交换两次。
        for row in range(n):
            for col in range(row + 1, n):
                matrix[row][col], matrix[col][row] = (
                    matrix[col][row],
                    matrix[row][col],
                )

        # 转置后逐行翻转，完成顺时针旋转。
        for row in matrix:
            left, right = 0, n - 1
            while left < right:
                row[left], row[right] = row[right], row[left]
                left += 1
                right -= 1
```

## 正确性与复杂度

任意元素经两步操作后都从 `(r,c)` 到达 `(c,n-1-r)`，这正是顺时针旋转 90° 的定义，因此整个矩阵正确。每个元素处理常数次，时间 `O(n²)`；所有交换都在原矩阵中完成，额外空间 `O(1)`。

## 常见追问

- 逆时针旋转：转置后反转每一列。
- 非方阵无法在保持原容器尺寸的前提下原地旋转 90°。
- 四元环交换同样是 `O(1)` 空间，但下标更容易写错。
