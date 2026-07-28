# 207 · 课程表

<ProblemMeta
  :tags="['Hot100', '大厂面试', '拓扑排序']"
  difficulty="medium"
  :appearances="16"
  pass-rate="43%"
  source-url="https://leetcode.cn/problems/course-schedule/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(V + E)" space="O(V + E)" />

## 题目

有 `numCourses` 门课程，编号为 `0` 到 `numCourses - 1`。先修关系 `[course, prerequisite]` 表示学习 `course` 前必须先完成 `prerequisite`。

判断能否完成全部课程。

### 示例

```text
输入：numCourses = 2, prerequisites = [[1, 0]]
输出：True
```

```text
输入：numCourses = 2, prerequisites = [[1, 0], [0, 1]]
输出：False
```

## 图模型

将先修课指向后续课程，即建立边：

```text
prerequisite -> course
```

如果有向图中存在环，环上的每门课都在等待另一门先修课，无法开始；如果无环，就存在一种拓扑顺序可以完成全部课程。

## Kahn 拓扑排序

1. 统计每门课程的入度；
2. 把所有入度为零的课程加入队列；
3. 学完队首课程，并把它指向课程的入度减一；
4. 新出现的入度零课程继续入队；
5. 最终处理课程数等于总课程数时无环。

## Python 实现

```python
from collections import deque


class Solution:
    def canFinish(
        self,
        numCourses: int,
        prerequisites: list[list[int]],
    ) -> bool:
        graph: list[list[int]] = [[] for _ in range(numCourses)]
        indegree = [0] * numCourses

        for course, prerequisite in prerequisites:
            graph[prerequisite].append(course)
            indegree[course] += 1

        queue = deque(
            course
            for course in range(numCourses)
            if indegree[course] == 0
        )
        completed = 0

        while queue:
            prerequisite = queue.popleft()
            completed += 1

            for course in graph[prerequisite]:
                indegree[course] -= 1
                if indegree[course] == 0:
                    queue.append(course)

        return completed == numCourses
```

## 为什么处理数量能判断环

无环图中一定至少存在一个入度为零的结点。移除它及其出边后，剩余无环图仍满足这一性质，所以最终可以处理所有结点。

如果队列提前为空但仍有课程未处理，剩余子图中每个结点入度都大于零，这些依赖中必然存在环。

## 正确性说明

队列只包含当前没有未完成先修课的课程，所以每次取出的课程都可以合法完成。完成课程后删除它的出边，准确更新后续课程的剩余先修数量。无环时该过程能产生完整拓扑序；有环时环上结点永远无法降为零入度。因此 `completed == numCourses` 当且仅当可以完成所有课程。

## 复杂度

- 时间复杂度：`O(V + E)`，每门课程和每条先修关系各处理一次。
- 空间复杂度：`O(V + E)`，邻接表、入度数组和队列。

## 边界用例

| 场景 | 预期 | 检查点 |
|---|---|---|
| 无先修关系 | `True` | 全部零入度 |
| 单条依赖 | `True` | 基础拓扑序 |
| 两门课互相依赖 | `False` | 最小环 |
| 有独立课程和局部环 | `False` | 不能只看已处理部分 |

## 90 秒面试表达

“先把 `[课程, 先修课]` 建成先修课指向课程的有向边，问题等价于判断图是否有环。我用 Kahn 拓扑排序：统计入度，把所有零入度课程入队，每完成一门就删除它的出边，让后续课程入度减一。最后如果处理数量等于课程总数，说明存在完整拓扑序；否则剩余部分含环。时间和空间都是 `O(V+E)`。”

## 常见追问

- 要返回学习顺序，记录出队顺序即可。
- DFS 三色标记也能判环：未访问、搜索中、已完成。
- 若要找所有可行顺序，需要在零入度结点之间回溯选择，复杂度会显著上升。
