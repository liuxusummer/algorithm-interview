# 075 · 颜色分类

<ProblemMeta
  :tags="['Hot100', '腾讯面试', '数组', '双指针']"
  difficulty="medium"
  :appearances="9"
  pass-rate="48%"
  source-url="https://leetcode.cn/problems/sort-colors/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(1)" />

## 题目

给定只包含 `0`、`1`、`2` 的数组 `nums`，原地把相同数字排在一起，并按 `0`、`1`、`2` 的顺序排列。

要求不能调用库排序函数。

### 示例

```text
输入：[2, 0, 2, 1, 1, 0]
输出：[0, 0, 1, 1, 2, 2]
```

## 荷兰国旗三指针

维护三个区域：

```text
[0, left)       全是 0
[left, current) 全是 1
[current, right] 尚未检查
(right, n)      全是 2
```

检查 `nums[current]`：

- 是 `0`：与 `left` 交换，`left`、`current` 都右移；
- 是 `1`：位置正确，只移动 `current`；
- 是 `2`：与 `right` 交换，`right` 左移，但 `current` 不能动，因为换回来的数字尚未检查。

## Python 实现

```python
class Solution:
    def sortColors(self, nums: list[int]) -> None:
        left = 0
        current = 0
        right = len(nums) - 1

        while current <= right:
            if nums[current] == 0:
                # 把 0 扩展到左侧已完成区域。
                nums[left], nums[current] = (
                    nums[current],
                    nums[left],
                )
                left += 1
                current += 1
            elif nums[current] == 1:
                current += 1
            else:
                # 右侧换回来的值未知，current 暂时不能前进。
                nums[current], nums[right] = (
                    nums[right],
                    nums[current],
                )
                right -= 1
```

## 为什么换到左边后可以前进

当 `current >= left` 时，`left` 位置要么等于 `current`，要么位于已经检查过的中间区域，所以那里只能是 `1`。把 `0` 换过去后，换回当前位置的是已经分类过的 `1`，可以直接前进。

而 `right` 位于尚未检查区域，换回来的值可能是 `0`、`1` 或 `2`，必须留在当前指针再次判断。

## 正确性说明

循环始终保持四段区域不变量。每轮会把当前数字放入对应的 `0`、`1` 或 `2` 区域，并至少缩小一个未检查位置。循环在 `current > right` 时结束，此时未检查区域为空，数组依次由全 `0`、全 `1`、全 `2` 三段组成，因此分类正确。

## 复杂度

- 时间复杂度：`O(n)`，每个位置至多被检查常数次；
- 空间复杂度：`O(1)`，原地交换。

## 边界用例

| 输入 | 预期 |
|---|---|
| `[]` | `[]` |
| `[1]` | `[1]` |
| `[0, 0, 0]` | 不变 |
| `[2, 1, 0]` | `[0, 1, 2]` |
| `[2, 0, 2, 1, 1, 0]` | `[0, 0, 1, 1, 2, 2]` |

## 90 秒面试表达

“我维护左侧全 0、已扫描中间全 1、右侧全 2，`current` 扫描未知区域。遇到 0 与左边界交换并一起右移；遇到 1 直接前进；遇到 2 与右边界交换，只收缩右边界，因为换回来的数还没检查。循环结束时未知区域为空。时间 `O(n)`、空间 `O(1)`。”

## 常见追问

- 计数后覆盖数组也能做到 `O(n)`，但需要两次遍历；
- 若颜色种类变多，可使用计数排序；
- 最容易写错的是处理 `2` 后错误地移动 `current`。
