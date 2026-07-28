# 232 · 用栈实现队列

<ProblemMeta
  :tags="['字节面试题', '栈', '设计']"
  difficulty="medium"
  :appearances="17"
  pass-rate="48%"
  source-url="https://leetcode.cn/problems/implement-queue-using-stacks/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(1) 均摊" space="O(n)" />

## 题目

只使用栈的基本操作实现先进先出的队列，支持：

- `push(x)`：将元素加入队尾；
- `pop()`：移除并返回队首；
- `peek()`：返回队首；
- `empty()`：判断队列是否为空。

## 两个栈如何反转顺序

- `input_stack` 负责接收新元素；
- `output_stack` 负责弹出队首元素。

当需要读取队首且输出栈为空时，把输入栈的全部元素依次弹出并压入输出栈。一次整体转移会把顺序反转，使最早进入的元素位于输出栈顶。

只在输出栈为空时转移，不能每次读取都来回倒腾。

## Python 实现

```python
class MyQueue:
    def __init__(self) -> None:
        self.input_stack: list[int] = []
        self.output_stack: list[int] = []

    def push(self, value: int) -> None:
        self.input_stack.append(value)

    def pop(self) -> int:
        self._move_if_needed()
        return self.output_stack.pop()

    def peek(self) -> int:
        self._move_if_needed()
        return self.output_stack[-1]

    def empty(self) -> bool:
        return not self.input_stack and not self.output_stack

    def _move_if_needed(self) -> None:
        if self.output_stack:
            return

        # 仅当输出栈为空时整体倒序，保证每个元素最多搬运一次。
        while self.input_stack:
            self.output_stack.append(self.input_stack.pop())
```

## 为什么是均摊 O(1)

单次 `pop` 可能触发 `O(n)` 的整体转移，但每个元素在整个生命周期中：

1. 压入输入栈一次；
2. 从输入栈转移到输出栈一次；
3. 从输出栈弹出一次。

每个元素只经历常数次栈操作，所以连续 `m` 次队列操作总成本是 `O(m)`，平均每次 `O(1)`。

## 正确性说明

输出栈非空时，其栈顶始终是队列中最早加入且尚未移除的元素，新元素进入输入栈不会改变这一点。输出栈为空时，将输入栈整体转移会反转元素顺序，使输入栈中最早加入的元素到达输出栈顶。因此 `pop` 和 `peek` 始终访问正确的队首，`push` 则保持队尾顺序。

## 复杂度

- `push`：`O(1)`。
- `pop`、`peek`：均摊 `O(1)`，单次最坏 `O(n)`。
- `empty`：`O(1)`。
- 空间复杂度：`O(n)`。

## 操作示例

| 操作 | 输入栈 | 输出栈 | 返回 |
|---|---|---|---|
| `push(1)` | `[1]` | `[]` | — |
| `push(2)` | `[1, 2]` | `[]` | — |
| `peek()` | `[]` | `[2, 1]` | `1` |
| `pop()` | `[]` | `[2]` | `1` |
| `empty()` | `[]` | `[2]` | `False` |

## 90 秒面试表达

“用输入栈负责入队，输出栈负责出队。读取队首时，如果输出栈为空，就把输入栈全部倒入输出栈，顺序反转后最早加入的元素来到栈顶；输出栈不为空时绝不转移，保证旧元素先出。虽然某次转移是线性的，但每个元素只会从输入栈转到输出栈一次，所以操作均摊 `O(1)`、空间 `O(n)`。”

## 常见追问

- “均摊”不等于每次严格 `O(1)`，需要能解释聚合分析。
- 用队列实现栈时，可以在入栈或出栈阶段旋转队列。
- 并发环境下需要为两个栈及转移过程设计同步策略。
