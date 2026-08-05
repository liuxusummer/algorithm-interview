---
pageClass: ai-coding-page
title: 最小负载调度器
description: 用两个最小堆完成服务器调度，并审查 AI 代码中的时间推进和并列规则。
---

<div class="exam-session-banner">
  <div>
    <span>CASE 05 / MICROSOFT / LIVE CODING</span>
    <strong>最小负载调度器</strong>
    <small>AI 辅助现场编码 · 双堆 · Python · 社区面经训练版</small>
  </div>
  <div class="exam-session-banner__meta">
    <span>最小堆</span>
    <span>事件推进</span>
    <span>AI 代码审查</span>
  </div>
</div>

# 最小负载调度器

<div class="ai-trend-callout">
  <strong>任务画像</strong>
  <p>知道“双堆”只是起点。面试官还会观察你如何向 AI 描述并列规则、怎样发现时间边界错误，以及能不能独立解释每一次入堆和出堆。</p>
</div>

## 资料边界

一份 Microsoft SDE2 社区面经记录了 AI 辅助现场编码中的负载均衡题。候选人使用 Claude，
面试官关注澄清问题、调试和纠正 AI 输出。原帖没有公开完整题干，本页依据“双最小堆”线索
设计等价训练题。

来源为[Microsoft AI assisted coding interview experience](https://www.reddit.com/r/leetcode/comments/1sfgtu3/ai_assisted_coding_interview_experience_microsoft/)。

## 训练题目

有 `n` 台服务器，第 `i` 台服务器的权重为 `weights[i]`。服务器编号从 `0` 开始。
第 `j` 个请求在时间 `j` 到达，处理时长为 `tasks[j]`。

分配规则如下。

1. 请求到达时，优先选择当前空闲且权重最小的服务器。
2. 权重相同时，选择编号较小的服务器。
3. 如果没有空闲服务器，请求等待到最早有服务器完成任务的时刻。
4. 同一时刻释放多台服务器时，仍按权重和编号选择。
5. 服务器从开始时刻连续处理 `duration`，在 `start + duration` 时重新空闲。

返回每个请求被分配到的服务器编号。

### 示例

```text
weights = [3, 3, 2]
tasks   = [1, 2, 3, 2, 1, 2]
输出     = [2, 2, 0, 2, 1, 2]
```

## 为什么一个堆不够

调度过程中有两套不同排序。

- 空闲服务器按照 `(weight, server_id)` 排序。
- 忙碌服务器按照 `(finish_time, weight, server_id)` 排序。

同一个堆无法同时高效回答“谁最适合接任务”和“谁最早完成”。因此维护两个最小堆。

```text
available                  busy
(weight, id)               (finish, weight, id)
       │                          │
       └── 分配任务 ─────────────>│
       │<──────── 完成任务 ───────┘
```

## 循环不变量

处理第 `j` 个请求之前，维持下面三件事。

1. `current_time` 不早于请求的到达时间 `j`。
2. `available` 只包含完成时间不晚于 `current_time` 的服务器。
3. `busy` 只包含完成时间晚于 `current_time` 的服务器。

每轮先释放服务器，再选择服务器，最后把它放入忙碌堆。这个顺序不能交换。

## 一份常见的 AI 错误代码

```python
import heapq


def assign_tasks(weights: list[int], tasks: list[int]) -> list[int]:
    available = [(weight, server_id) for server_id, weight in enumerate(weights)]
    heapq.heapify(available)
    busy = []
    answer = []

    for current_time, duration in enumerate(tasks):
        while busy and busy[0][0] < current_time:
            finish, weight, server_id = heapq.heappop(busy)
            heapq.heappush(available, (weight, server_id))

        if not available:
            current_time = busy[0][0]

        weight, server_id = heapq.heappop(available)
        heapq.heappush(busy, (current_time + duration, weight, server_id))
        answer.append(server_id)

    return answer
```

这里至少有两个错误。

1. 完成时间等于当前时间的服务器已经空闲，条件必须是 `<=`，不是 `<`。
2. 没有空闲服务器时只推进时间，没有把此时已经完成的服务器移回空闲堆，下一行仍会从
   空堆弹出。

这正是 AI Coding 面试会观察的部分。生成代码看起来像标准模板，你仍要用不变量和测试判断
它是否真的满足题目。

## 正确实现

```python
import heapq


def assign_tasks(weights: list[int], tasks: list[int]) -> list[int]:
    if not weights:
        raise ValueError("至少需要一台服务器")
    if any(weight <= 0 for weight in weights):
        raise ValueError("服务器权重必须为正数")
    if any(duration <= 0 for duration in tasks):
        raise ValueError("任务时长必须为正数")

    available = [
        (weight, server_id)
        for server_id, weight in enumerate(weights)
    ]
    heapq.heapify(available)

    busy: list[tuple[int, int, int]] = []
    assignment: list[int] = []
    current_time = 0

    for arrival_time, duration in enumerate(tasks):
        current_time = max(current_time, arrival_time)

        # 当前时刻已经完成的服务器全部回到空闲堆。
        while busy and busy[0][0] <= current_time:
            finish_time, weight, server_id = heapq.heappop(busy)
            heapq.heappush(available, (weight, server_id))

        if not available:
            # 请求必须等待到最早完成时刻。
            current_time = busy[0][0]

            # 同一时刻可能释放多台服务器，必须全部加入候选集合。
            while busy and busy[0][0] <= current_time:
                finish_time, weight, server_id = heapq.heappop(busy)
                heapq.heappush(available, (weight, server_id))

        weight, server_id = heapq.heappop(available)
        finish_time = current_time + duration
        heapq.heappush(
            busy,
            (finish_time, weight, server_id),
        )
        assignment.append(server_id)

    return assignment
```

## 手算示例

使用 `weights = [3, 3, 2]` 和 `tasks = [1, 2, 3, 2, 1, 2]`。

| 请求 | 到达 | 释放后的空闲服务器 | 选择 | 完成时间 |
|---:|---:|---|---:|---:|
| 0 | 0 | `(2,2) (3,0) (3,1)` | 2 | 1 |
| 1 | 1 | 2 已释放，另有 0、1 | 2 | 3 |
| 2 | 2 | 0、1 | 0 | 5 |
| 3 | 3 | 2 已释放，另有 1 | 2 | 5 |
| 4 | 4 | 1 | 1 | 5 |
| 5 | 5 | 0、1、2 同时释放 | 2 | 7 |

最后一步必须先释放全部三台服务器，随后才能依据权重选择服务器 2。

## 复杂度

每台服务器初始化进入一次空闲堆。每个任务让一台服务器从空闲堆进入忙碌堆，并在未来最多
返回一次。

- 时间复杂度为 `O((n + m) log n)`，其中 `m` 为任务数。
- 空间复杂度为 `O(n + m)`，`m` 部分来自返回结果。

## 测试设计

```python
def test_example() -> None:
    assert assign_tasks(
        [3, 3, 2],
        [1, 2, 3, 2, 1, 2],
    ) == [2, 2, 0, 2, 1, 2]


def test_server_finishing_at_arrival_is_available() -> None:
    assert assign_tasks([1], [1, 1, 1]) == [0, 0, 0]


def test_releases_all_servers_with_same_finish_time() -> None:
    # 请求 0 和 1 分别占用服务器 0、1，并在时间 2 同时完成。
    # 第三个请求等待到时间 2 后，应选择权重更小的服务器 1。
    assert assign_tasks([5, 1], [2, 1, 1]) == [1, 0, 1]


def test_tie_breaks_by_server_id() -> None:
    assert assign_tasks([2, 2], [3, 3, 1]) == [0, 1, 0]


def test_rejects_invalid_input() -> None:
    for weights, tasks in [([], [1]), ([1], [0]), ([0], [1])]:
        try:
            assign_tasks(weights, tasks)
        except ValueError:
            pass
        else:
            raise AssertionError("非法输入必须失败")
```

第三个测试值得重新手算。请求 0 在时间 0 先选择权重为 1 的服务器 1，于时间 2 完成；请求 1
在时间 1 选择服务器 0，于时间 2 完成。请求 2 到达时间 2 时，两台服务器同时释放，服务器 1
因权重更小再次被选中。

## 如何向 AI 提问

### 先给规则，不直接要代码

```text
请把这道调度题改写成两个优先队列的状态机。
只说明每个堆的元素、排序键、循环不变量和时间推进规则。
特别解释完成时间等于当前时间，以及多台服务器同时完成时应该发生什么。
```

### 生成后要求逐行验证

```text
对照下面五条验收规则审查实现。
每一条都给出一个最小反例，并手算期望输出。
不要因为代码使用了两个堆就默认正确。
```

### 出错后让 AI 定位根因

```text
测试输入为 weights=[5,1], tasks=[2,1,1]。
实际输出与期望不同。请输出每轮 available、busy 和 current_time，找到第一次偏离不变量的位置。
只修复根因，不重写整个函数。
```

## 面试中的表达

可以先用一句话讲方案。

> 我用空闲堆按权重和编号选服务器，用忙碌堆按完成时间释放服务器。每个请求到达时先释放所有
> 已完成服务器；若仍没有空闲服务器，就把时间推进到最早完成时刻，并一次释放这个时刻的全部
> 服务器，再按规则分配。

随后解释两个边界测试。面试官看到的重点是你能够控制 AI、发现错误并用证据修正，而不是
提示词写得有多长。
