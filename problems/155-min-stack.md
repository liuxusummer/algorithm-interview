# 155 · 最小栈

<ProblemMeta
  :tags="['Hot100', '大厂面试', '辅助栈']"
  difficulty="medium"
  :appearances="10"
  pass-rate="68%"
  source-url="https://leetcode.cn/problems/min-stack/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(1) / 操作" space="O(n)" />

## 题目

设计一个支持 `push`、`pop`、`top` 和 `getMin` 的栈，并让所有操作都在 `O(1)` 时间内完成。

## 设计难点

普通栈能常数时间访问栈顶，却不能在删除当前最小值后立即知道“上一个最小值”。

使用两个同步栈：

- `values` 保存全部元素；
- `minimums` 保存每个深度对应的前缀最小值。

压入新元素时，同时压入 `min(value, minimums[-1])`。弹出时两个栈一起弹出。

## Python 实现

```python
class MinStack:
    def __init__(self) -> None:
        self.values: list[int] = []
        self.minimums: list[int] = []

    def push(self, value: int) -> None:
        self.values.append(value)

        # minimums 与 values 等长，栈顶同步保存当前最小值。
        if not self.minimums:
            self.minimums.append(value)
        else:
            self.minimums.append(min(value, self.minimums[-1]))

    def pop(self) -> None:
        self.values.pop()
        self.minimums.pop()

    def top(self) -> int:
        return self.values[-1]

    def getMin(self) -> int:
        return self.minimums[-1]
```

## 为什么最小值也要重复入栈

假设连续压入多个相同最小值。如果辅助栈只在出现“更小值”时更新，弹出其中一个最小值时还需要额外判断。

让两个栈始终等长，每层都保存对应前缀最小值，`pop` 就可以无条件同步执行，状态更简单，也不容易出错。

## 正确性说明

对任意栈深度 `i`，`minimums[i]` 在压入时被设置为当前值与上一层最小值的较小者，因此它等于 `values[0:i+1]` 的最小值。两个栈同步弹出后，这个性质仍然成立。所以 `getMin` 返回辅助栈顶时，恰好得到当前全部元素的最小值。

## 复杂度

- `push`、`pop`、`top`、`getMin` 时间复杂度均为 `O(1)`。
- 空间复杂度：`O(n)`，辅助栈与数据栈等长。

## 操作示例

| 操作 | 数据栈 | 最小值栈 | 返回 |
|---|---|---|---|
| `push(-2)` | `[-2]` | `[-2]` | — |
| `push(0)` | `[-2, 0]` | `[-2, -2]` | — |
| `push(-3)` | `[-2, 0, -3]` | `[-2, -2, -3]` | — |
| `getMin()` | — | — | `-3` |
| `pop()` | `[-2, 0]` | `[-2, -2]` | — |
| `top()` | — | — | `0` |

## 90 秒面试表达

“普通栈删除最小值后无法常数时间找到上一个最小值，所以我增加一个同步辅助栈。数据栈每压入一个值，最小值栈就压入‘当前值和上一层最小值的较小者’，因此辅助栈顶始终是当前最小值。弹出时两个栈一起弹出。所有操作都是 `O(1)`，额外空间 `O(n)`。”

## 常见追问

- 可以只在新值小于等于当前最小值时压入辅助栈，但 `pop` 需要比较。
- 可用一个栈保存 `(value, current_minimum)` 二元组。
- 若还要 `getMax`，再同步维护前缀最大值即可。
