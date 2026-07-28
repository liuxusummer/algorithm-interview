# 015 · 三数之和

<ProblemMeta
  :tags="['Hot100', '大厂面试', '双指针']"
  difficulty="medium"
  :appearances="44"
  pass-rate="43%"
  source-url="https://leetcode.cn/problems/3sum/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n²)" space="O(n)" />

## 题目

给定一个整数数组 `nums`，返回所有和为 `0` 且下标互不相同的三元组。

答案中不能包含重复三元组，三元组内部和结果列表的顺序不限。

### 示例

```text
输入：nums = [-1, 0, 1, 2, -1, -4]
输出：[[-1, -1, 2], [-1, 0, 1]]
```

### 约束观察

- 三个元素必须来自不同下标，但答案按数值去重。
- 排序后，相同数值相邻，便于统一去重。
- 固定第一个数后，问题转化为有序数组中的“两数之和”。

## 先说暴力解

使用三层循环枚举所有下标组合，检查三数之和是否为零，再把排序后的三元组放入集合去重。

一共有 `O(n³)` 个组合。即使去重正确，输入规模稍大就无法接受。

## 优化抓手

先排序数组，再枚举第一个数 `numbers[index]`。剩余目标是：

```text
numbers[left] + numbers[right] = -numbers[index]
```

在有序区间中使用左右双指针：

- 总和小于 `0`：左指针右移，让总和变大；
- 总和大于 `0`：右指针左移，让总和变小；
- 总和等于 `0`：记录答案，并跳过两侧重复值。

## Python 实现

```python
class Solution:
    def threeSum(self, nums: list[int]) -> list[list[int]]:
        numbers = sorted(nums)
        triplets: list[list[int]] = []
        length = len(numbers)

        for index in range(length - 2):
            if numbers[index] > 0:
                break

            if index > 0 and numbers[index] == numbers[index - 1]:
                continue

            left = index + 1
            right = length - 1

            while left < right:
                total = numbers[index] + numbers[left] + numbers[right]

                if total < 0:
                    left += 1
                elif total > 0:
                    right -= 1
                else:
                    triplets.append(
                        [numbers[index], numbers[left], numbers[right]]
                    )
                    left += 1
                    right -= 1

                    while left < right and numbers[left] == numbers[left - 1]:
                        left += 1
                    while left < right and numbers[right] == numbers[right + 1]:
                        right -= 1

        return triplets
```

## 三处去重分别在做什么

### 固定值去重

```python
if index > 0 and numbers[index] == numbers[index - 1]:
    continue
```

相同的第一个数会产生相同搜索空间，所以只处理第一次出现的位置。

### 左右指针去重

找到答案后跳过左右两侧的相同值，避免重复加入同一个三元组。

### 为什么不能一开始就跳过左右重复值

左右指针尚未形成答案时，移动方向由当前总和决定。提前跳过虽然有时可行，但会让逻辑更复杂；在命中答案后统一去重最清晰。

## 正确性说明

排序后固定 `numbers[index]`，左右指针覆盖剩余区间。若当前总和偏小，右指针左侧的值不会比当前右值更大，因此只有左移 `left` 才可能达到目标；总和偏大时同理只能左移 `right`。命中后跳过相同数值只删除重复答案，不会删除新的数值组合。枚举每个不重复固定值后，所有合法三元组都会被找到一次。

## 复杂度

- 时间复杂度：`O(n²)`。排序为 `O(n log n)`，外层枚举与双指针扫描为 `O(n²)`。
- 空间复杂度：`O(n)`。代码使用 `sorted` 创建副本；不计返回结果。

## 边界用例

| 输入 | 预期 | 检查点 |
|---|---|---|
| `[-1, 0, 1, 2, -1, -4]` | `[[-1,-1,2],[-1,0,1]]` | 多组答案 |
| `[0, 0, 0, 0]` | `[[0,0,0]]` | 重复值去重 |
| `[1, 2, -2, -1]` | `[]` | 无解 |
| `[-2, 0, 1, 1, 2]` | `[[-2,0,2],[-2,1,1]]` | 同值可使用不同下标 |
| `[]` | `[]` | 空数组 |

## 90 秒面试表达

“三层枚举是 `O(n³)`。我先排序，枚举第一个数，再用左右双指针寻找另外两个数。当前和偏小就移动左指针，偏大就移动右指针，等于零时记录三元组。去重有三处：外层跳过重复固定值，找到答案后分别跳过左右重复值。如果固定值已经大于零，后面的数都非负，可以提前结束。整体时间 `O(n²)`；这里用排序副本，所以额外空间 `O(n)`。”

## 常见追问

- 如果允许修改输入，可以使用 `nums.sort()`，省去排序副本。
- 如果目标不是 `0`，把比较值改为给定 `target` 即可。
- 四数之和可以再固定一层，继续使用双指针，时间复杂度为 `O(n³)`。
