# 554 · 砖墙

<ProblemMeta
  :tags="['华为面试题', '哈希表', '前缀和']"
  difficulty="medium"
  :appearances="3"
  pass-rate="59%"
  source-url="https://leetcode.cn/problems/brick-wall/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(B)" space="O(B)" />

## 题目

一面矩形砖墙由多行砖块组成，每行总宽度相同。画一条从顶部到底部的竖线，求它穿过的最少砖块数。

竖线可以经过砖块之间的缝隙，但不能沿着墙的左右边缘。

```text
输入：wall = [
  [1, 2, 2, 1],
  [3, 1, 2],
  [1, 3, 2],
  [2, 4],
  [3, 1, 2],
  [1, 3, 1, 1]
]
输出：2
```

## 思路：寻找最多缝隙

竖线穿过的砖块数等于：

```text
总行数 - 竖线经过的内部缝隙数
```

对每一行计算砖块宽度前缀和，它代表内部缝隙的横坐标。用哈希表统计每个横坐标出现于多少行，取最大值即可。

最后一块砖后的前缀和是墙的右边缘，必须排除。

## Python 实现

```python
from collections import defaultdict


class Solution:
    def leastBricks(self, wall: list[list[int]]) -> int:
        gap_counts: dict[int, int] = defaultdict(int)

        for row in wall:
            position = 0

            # 不统计最后一块砖之后的墙体右边缘。
            for width in row[:-1]:
                position += width
                gap_counts[position] += 1

        most_gaps = max(gap_counts.values(), default=0)
        return len(wall) - most_gaps
```

## 正确性说明

对于任意内部横坐标，每一行要么在这里存在缝隙，要么竖线穿过一块砖。哈希表记录存在缝隙的行数，因此 `行数 - 缝隙数` 正是穿过的砖块数。选择缝隙数最多的位置，就等价于让穿过砖块数最少。

## 复杂度

令砖块总数为 `B`：

- 每块非末尾砖只处理一次，时间复杂度 `O(B)`；
- 最多记录 `O(B)` 个不同缝隙位置。

## 边界

- 每行只有一块砖时，没有内部缝隙，答案为总行数；
- 多行缝隙完全对齐时，答案可能为 `0`；
- 不要把每行总宽度记录为候选，否则会错误选择墙体右边缘。
