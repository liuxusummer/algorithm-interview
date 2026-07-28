# 046 · 全排列

<ProblemMeta
  :tags="['Hot100', '大厂面试', '回溯']"
  difficulty="medium"
  :appearances="31"
  pass-rate="53%"
  source-url="https://leetcode.cn/problems/permutations/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n · n!)" space="O(n)" />

## 题目

给定一个不含重复数字的数组 `nums`，返回它的全部排列，答案顺序不限。

### 示例

```text
输入：nums = [1, 2, 3]
输出：[
  [1, 2, 3], [1, 3, 2],
  [2, 1, 3], [2, 3, 1],
  [3, 1, 2], [3, 2, 1]
]
```

## 搜索树怎么定义

路径 `path` 表示已经确定的排列前缀。每一层从所有尚未使用的数字中选择一个，加入路径；递归结束后撤销选择。

使用布尔数组 `used` 记录每个下标是否已在路径中。因为题目保证数字互不相同，不需要同层去重。

## Python 实现

```python
class Solution:
    def permute(self, nums: list[int]) -> list[list[int]]:
        answer: list[list[int]] = []
        path: list[int] = []
        used = [False] * len(nums)

        def backtrack() -> None:
            if len(path) == len(nums):
                answer.append(path.copy())
                return

            # used 按下标标记，path 始终保存当前排列的前缀。
            for index, value in enumerate(nums):
                if used[index]:
                    continue

                used[index] = True
                path.append(value)
                backtrack()
                path.pop()
                used[index] = False

        backtrack()
        return answer
```

## 为什么必须复制路径

`path` 是整个搜索过程中反复修改的同一个列表。如果直接把它加入答案，所有记录都会引用同一对象，最终随回溯变成空列表。`path.copy()` 保存的是当前叶子结点的快照。

## 正确性说明

每层选择一个尚未使用的下标，因此任意叶子路径包含所有数字且每个数字恰好出现一次，是合法排列。任意排列都能唯一对应到“依次选择它的第 1、2、… 个数字”的搜索路径，所以所有排列都会生成且不会重复。

## 复杂度

- 时间复杂度：`O(n · n!)`，共有 `n!` 个答案，每次复制长度为 `n` 的路径。
- 空间复杂度：`O(n)`，不计输出，路径、标记数组和递归栈均为线性。

## 边界用例

| 输入 | 预期 | 检查点 |
|---|---|---|
| `[1]` | `[[1]]` | 单元素 |
| `[0, 1]` | 2 个排列 | 基础分支 |
| `[1, 2, 3]` | 6 个排列 | 结果数量 |

## 90 秒面试表达

“全排列可以看成一棵深度为 `n` 的选择树。路径是当前排列前缀，每层遍历所有尚未使用的数字，用 `used` 标记选择，递归后撤销。路径长度达到 `n` 时复制进答案。每个排列对应唯一一条搜索路径，所以不重不漏。共有 `n!` 个结果，复制每个结果需要 `O(n)`，总时间 `O(n·n!)`，额外空间 `O(n)`。”

## 常见追问

- 数组含重复元素时，需要先排序，并在同一层跳过相同且前一个未使用的元素。
- 可以原地交换 `nums[first]` 与后续位置，省去 `used` 数组。
- 若只求第 `k` 个排列，可利用阶乘数制跳过整棵子树。
