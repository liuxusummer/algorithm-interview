# 347 · 前 K 个高频元素

<ProblemMeta
  :tags="['Hot100', '腾讯面试', '哈希表', '桶排序']"
  difficulty="medium"
  :appearances="21"
  pass-rate="62%"
  source-url="https://leetcode.cn/problems/top-k-frequent-elements/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(n)" space="O(n)" />

## 题目

给定整数数组 `nums` 和整数 `k`，返回出现频率最高的 `k` 个元素。答案可以按任意顺序返回。

题目保证答案唯一。

### 示例

```text
输入：nums = [1, 1, 1, 2, 2, 3], k = 2
输出：[1, 2]
```

## 为什么可以使用频次桶

一个元素的出现次数最多是 `n`。先用哈希表统计频次，再建立 `n+1` 个桶：

```text
buckets[f] = 所有出现 f 次的元素
```

最后从频次 `n` 向下扫描，收集到 `k` 个元素即可。这样避免对所有不同元素按频次排序。

## Python 实现

```python
from collections import Counter


class Solution:
    def topKFrequent(
        self,
        nums: list[int],
        k: int,
    ) -> list[int]:
        frequency = Counter(nums)
        buckets: list[list[int]] = [
            [] for _ in range(len(nums) + 1)
        ]

        for value, count in frequency.items():
            buckets[count].append(value)

        answer: list[int] = []
        for count in range(len(nums), 0, -1):
            # 从高频桶向低频桶收集，先拿到的一定更高频。
            for value in buckets[count]:
                answer.append(value)
                if len(answer) == k:
                    return answer

        return answer
```

## 正确性说明

统计结束后，每个不同元素恰好位于与其真实出现次数相同的桶中。算法按频次从高到低遍历，所以在任意时刻，已经收集的元素频次都不小于尚未访问元素的频次。

首次收集满 `k` 个元素时，它们正是全体元素中频次最高的 `k` 个，因此返回结果正确。

## 复杂度

- 时间复杂度：`O(n)`，统计、建桶和扫描桶均为线性；
- 空间复杂度：`O(n)`。

## 边界用例

| 场景 | 预期 |
|---|---|
| `k = 1` | 返回最高频元素 |
| 所有元素相同 | 返回该元素 |
| 含负数 | 正常统计 |
| `k = 不同元素数` | 返回所有不同元素 |

## 90 秒面试表达

“先用哈希表统计每个值的频次。频次最大不超过数组长度，所以我创建 `n+1` 个桶，把元素放到对应频次桶中，再从高频向低频收集，满 `k` 个立即返回。这样不用给所有键排序，时间和空间都是 `O(n)`。”

## 常见追问

- 大小为 `k` 的最小堆需要 `O(m log k)`，`m` 是不同元素数；
- 数据流场景更适合堆或支持更新的有序结构；
- 若要求稳定顺序，需要明确同频元素的二级排序规则。
