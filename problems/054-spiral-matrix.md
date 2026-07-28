# 054 · 螺旋矩阵

<ProblemMeta
  :tags="['Hot100', '大厂面试', '矩阵']"
  difficulty="medium"
  :appearances="23"
  pass-rate="47%"
  source-url="https://leetcode.cn/problems/spiral-matrix/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(mn)" space="O(1) 额外" />

## 题目

给定一个 `m × n` 的矩阵，按照顺时针螺旋顺序返回矩阵中的所有元素。

### 示例

```text
输入：
[
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
]

输出：[1, 2, 3, 6, 9, 8, 7, 4, 5]
```

```text
输入：
[
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9,10,11,12]
]

输出：[1,2,3,4,8,12,11,10,9,5,6,7]
```

### 约束观察

- 每一圈都按“上、右、下、左”四条边访问。
- 访问完一条边后，对应边界向内收缩。
- 当矩阵只剩一行或一列时，必须避免重复访问。

## 使用访问标记

可以模拟行走方向，遇到边界或已访问位置就顺时针转向，并用布尔矩阵记录访问状态。

这种方法时间复杂度为 `O(mn)`，但需要 `O(mn)` 额外空间，而且方向切换逻辑较容易出错。

## 优化抓手

用四个变量表示当前尚未访问区域：

```text
top, bottom, left, right
```

每一轮依次：

1. 从左到右访问 `top`；
2. 从上到下访问 `right`；
3. 如果仍有剩余行，从右到左访问 `bottom`；
4. 如果仍有剩余列，从下到上访问 `left`。

## Python 实现

```python
class Solution:
    def spiralOrder(self, matrix: list[list[int]]) -> list[int]:
        if not matrix or not matrix[0]:
            return []

        top = 0
        bottom = len(matrix) - 1
        left = 0
        right = len(matrix[0]) - 1
        order: list[int] = []

        while top <= bottom and left <= right:
            for column in range(left, right + 1):
                order.append(matrix[top][column])
            top += 1

            for row in range(top, bottom + 1):
                order.append(matrix[row][right])
            right -= 1

            if top <= bottom:
                for column in range(right, left - 1, -1):
                    order.append(matrix[bottom][column])
                bottom -= 1

            if left <= right:
                for row in range(bottom, top - 1, -1):
                    order.append(matrix[row][left])
                left += 1

        return order
```

## 为什么下边和左边需要额外判断

访问上边和右边后，剩余区域可能已经为空：

- 单行矩阵访问完上边后，不应再反向访问同一行；
- 单列矩阵访问完右边后，不应再向上访问同一列。

因此访问下边前检查 `top <= bottom`，访问左边前检查 `left <= right`。

## 边界收缩顺序

每访问完一条边立即收缩对应边界。后续方向只访问新的未处理区域：

```text
上边完成 → top += 1
右边完成 → right -= 1
下边完成 → bottom -= 1
左边完成 → left += 1
```

这样不需要额外的访问标记。

## 正确性说明

每轮开始时，四个边界恰好围住所有未访问元素。算法沿外围四条边按顺时针顺序访问，并在访问后收缩边界；条件判断确保退化为单行或单列时每个位置只访问一次。因此每轮都完整删除一层且不重复、不遗漏，最终返回整个矩阵的螺旋顺序。

## 复杂度

- 时间复杂度：`O(mn)`。每个矩阵元素恰好访问一次。
- 空间复杂度：不计返回结果为 `O(1)`。

## 边界用例

| 输入 | 预期 | 检查点 |
|---|---|---|
| `[[1]]` | `[1]` | 单元素 |
| `[[1,2,3]]` | `[1,2,3]` | 单行 |
| `[[1],[2],[3]]` | `[1,2,3]` | 单列 |
| `[[1,2],[3,4]]` | `[1,2,4,3]` | 偶数方阵 |
| `[]` | `[]` | 空矩阵 |

## 90 秒面试表达

“我用 `top、bottom、left、right` 表示未访问区域。每轮依次访问上边、右边、下边和左边，并在访问后收缩对应边界。关键是访问下边和左边前再次检查边界，避免单行或单列的最后一层被重复访问。每个元素只进入结果一次，时间 `O(mn)`；不计返回数组，额外空间 `O(1)`。”

## 常见追问

- 逆时针遍历只需调整四条边的访问顺序和方向。
- 如果要原地按螺旋顺序写入数值，可以沿用相同边界框架。
- 生成螺旋矩阵是逆过程：按边界顺序把递增数字写入矩阵。
