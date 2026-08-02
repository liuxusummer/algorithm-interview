# 039 · 组合总和

<ProblemMeta
  :tags="['Hot100', '大厂面试', '回溯', '剪枝']"
  difficulty="medium"
  :appearances="96"
  pass-rate="73%"
  source-url="https://leetcode.cn/problems/combination-sum/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(S)" space="O(target / min)" />

## 题目

从互不相同的正整数 `candidates` 中选数，使总和等于 `target`。每个数字可重复使用，组合顺序不同不算新答案。

```text
candidates = [2, 3, 6, 7], target = 7
输出：[[2, 2, 3], [7]]
```

## 回溯状态

用 `start` 限制下一次只能从当前位置及其右侧选择，从结构上消除 `[2, 3, 2]` 之类的重复排列。选择 `candidates[index]` 后仍传入 `index`，表示该数字可以继续使用。

排序后，一旦当前数字大于剩余目标，后面的数字也不可能使用，可以直接剪枝。

## Python 实现

```python
from typing import List


class Solution:
    def combinationSum(
        self,
        candidates: List[int],
        target: int,
    ) -> List[List[int]]:
        candidates.sort()
        answer: List[List[int]] = []
        path: List[int] = []

        def backtrack(start: int, remaining: int) -> None:
            if remaining == 0:
                # path 后续还会撤销，必须复制当前答案。
                answer.append(path.copy())
                return

            for index in range(start, len(candidates)):
                value = candidates[index]
                if value > remaining:
                    break

                path.append(value)
                # 仍从 index 开始，允许重复选当前数字。
                backtrack(index, remaining - value)
                path.pop()

        backtrack(0, target)
        return answer
```

## 正确性说明

路径始终按候选数组下标非递减，因此每个组合只有一种生成顺序。每次递归精确扣除所选数字，到 `remaining = 0` 时得到合法组合；任何合法组合按排序后的顺序选择，都对应搜索树中的唯一一条路径，因此不会遗漏。

## 复杂度与边界

- `S` 表示实际搜索树规模；输出本身可能指数级。
- 递归深度最多 `target / min(candidates)`。
- 目标无法组成时返回空数组；所有候选数为正数是剪枝成立的前提。

## 面试追问

- 每个数字只能用一次：递归传 `index + 1`，并在同层跳过重复值。
- 只求方案数：通常改为完全背包动态规划。
