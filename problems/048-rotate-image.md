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

        # 第一步：沿主对角线翻转（矩阵转置）。
        # 只遍历主对角线上方，避免同一对元素被交换两次。
        for i in range(n):
            for j in range(i + 1, n):
                matrix[i][j], matrix[j][i] = (
                    matrix[j][i],
                    matrix[i][j],
                )

        # 第二步：将每一行左右翻转。
        # list.reverse() 会原地修改当前行，不会创建新的矩阵。
        for row in matrix:
            row.reverse()
```

## 正确性与复杂度

任意元素经两步操作后都从 `(r,c)` 到达 `(c,n-1-r)`，这正是顺时针旋转 90° 的定义，因此整个矩阵正确。每个元素处理常数次，时间 `O(n²)`；所有交换都在原矩阵中完成，额外空间 `O(1)`。

## 常见追问

- 逆时针旋转：转置后反转每一列。
- 非方阵无法在保持原容器尺寸的前提下原地旋转 90°。
- 四元环交换同样是 `O(1)` 空间，但下标更容易写错。
