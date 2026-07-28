# 011 · 盛最多水的容器

<ProblemMeta
  :tags="['Hot100', '华为面试题', '双指针']"
  difficulty="medium"
  :appearances="9"
  pass-rate="68%"
  source-url="https://leetcode.cn/problems/container-with-most-water/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(1)" />

## 题目

给定长度为 `n` 的整数数组 `height`。第 `i` 条竖线端点为 `(i, 0)` 和 `(i, height[i])`。

选择两条竖线与横轴组成容器，返回能够容纳的最大水量。

```text
输入：height = [1,8,6,2,5,4,8,3,7]
输出：49
```

## 思路：向内移动短板

左右指针从数组两端开始。当前面积为：

```text
(right - left) × min(height[left], height[right])
```

宽度每次都会缩小。要让面积有机会变大，只能尝试提高短板，因此移动高度较小的一侧；移动长板无法突破原来的短板高度，面积一定不会更大。

## Python 实现

```python
class Solution:
    def maxArea(self, height: list[int]) -> int:
        left = 0
        right = len(height) - 1
        best = 0

        while left < right:
            width = right - left
            current_height = min(height[left], height[right])
            best = max(best, width * current_height)

            # 容量由短板限制，只移动短板才可能提高有效高度。
            if height[left] <= height[right]:
                left += 1
            else:
                right -= 1

        return best
```

## 正确性说明

假设左板不高于右板。保持左板、把右指针向内移动时，宽度变小，而有效高度最多仍是左板高度，因此不可能得到更大面积。丢弃左板不会漏掉最优解。右板较短时同理。

算法每次安全地排除一条不可能参与更优答案的边，最终考察到最优组合。

## 复杂度

- 两个指针一共移动不超过 `n` 次，时间 `O(n)`；
- 只使用常数变量，空间 `O(1)`。

## 常见追问

- 为什么不是移动高板：高板移动后短板仍限制高度，宽度还变小；
- 两边相等时移动任意一边都安全；
- 本题不能使用接雨水的逐位置累计方式，两题目标不同。
