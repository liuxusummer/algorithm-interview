# 腾讯原创题单 08 · 手写小根堆

<ProblemMeta
  :tags="['腾讯原创题单', '腾讯面试题', '栈与队列', '优先队列']"
  difficulty="medium"
  :appearances="7"
  pass-rate="20%"
/>

<ComplexityBadge
  time="建堆 O(n)，插入 / 删除 O(log n)，查询 O(1)"
  space="O(n)"
/>

> 小根堆是经典数据结构；“原创”沿用截图中的腾讯原创题单分类。公开题库中没有与本页接口完全相同的力扣题，因此不附“力扣原题”按钮。

## 题目

不使用 Python 的 `heapq`，手写一个小根堆 `MinHeap`。

需要支持以下操作：

- `MinHeap(values)`：用可选的初始序列建堆；
- `push(value)`：插入一个整数；
- `peek()`：返回堆顶最小值，但不删除；
- `pop()`：删除并返回堆顶最小值；
- `size()`：返回元素个数；
- `is_empty()`：判断堆是否为空。

当空堆调用 `peek()` 或 `pop()` 时，抛出 `IndexError`。

### 接口约定

```text
heap = MinHeap([5, 2, 8])
heap.push(1)
heap.peek()     -> 1
heap.pop()      -> 1
heap.size()     -> 3
heap.is_empty() -> False
```

### 数据范围

- 初始序列和后续插入值均为整数；
- 操作总数不超过 `10^5`；
- 允许负数和重复元素。

## 示例

```text
输入：依次执行以下操作
heap = MinHeap([7, 2, 5, 2])
heap.push(1)
heap.push(6)
heap.pop()
heap.pop()
heap.peek()

输出：
1
2
2
```

## 数组如何表示完全二叉树

堆是一棵完全二叉树，适合紧凑地存进数组。下标从 `0` 开始时，对于位置 `index`：

```text
父节点       (index - 1) // 2
左孩子       2 * index + 1
右孩子       2 * index + 2
```

小根堆只要求每个父节点不大于两个孩子，不要求整棵数组全局有序。因此：

- 最小值一定在数组下标 `0`；
- 任意插入或删除只会破坏一条根到叶子的路径；
- 沿这条路径恢复堆序即可。

## 两个核心调整操作

### 1. 向上调整

新元素先追加到数组末尾，完全二叉树的形状没有改变。

如果新元素小于父节点，就交换两者并继续向上，直到：

- 到达根节点；或
- 父节点已经不大于当前节点。

### 2. 向下调整

删除堆顶后，把数组末尾元素放到根节点，避免破坏完全二叉树的形状。

每次在“当前节点、左孩子、右孩子”中选最小者：

- 当前节点最小，调整结束；
- 否则与最小的孩子交换，再从新位置继续向下。

必须和更小的孩子交换。只和左孩子交换可能让右孩子仍然小于新的父节点。

## Python 实现

```python
from collections.abc import Iterable


class MinHeap:
    def __init__(
        self,
        values: Iterable[int] | None = None,
    ) -> None:
        self._data = (
            list(values)
            if values is not None
            else []
        )

        # 最后一个非叶子节点开始向前下沉，可以在线性时间内建堆。
        last_parent = (len(self._data) - 2) // 2
        for index in range(last_parent, -1, -1):
            self._sift_down(index)

    def push(self, value: int) -> None:
        self._data.append(value)

        # 新元素只可能破坏它到根节点这一条路径上的堆序。
        self._sift_up(len(self._data) - 1)

    def peek(self) -> int:
        if not self._data:
            raise IndexError("小根堆为空")
        return self._data[0]

    def pop(self) -> int:
        if not self._data:
            raise IndexError("小根堆为空")

        minimum = self._data[0]
        last_value = self._data.pop()

        if self._data:
            # 用末尾元素补到根节点，再向下恢复小根堆性质。
            self._data[0] = last_value
            self._sift_down(0)

        return minimum

    def size(self) -> int:
        return len(self._data)

    def is_empty(self) -> bool:
        return not self._data

    def _sift_up(self, index: int) -> None:
        while index > 0:
            parent = (index - 1) // 2

            if self._data[parent] <= self._data[index]:
                break

            self._data[parent], self._data[index] = (
                self._data[index],
                self._data[parent],
            )
            index = parent

    def _sift_down(self, index: int) -> None:
        size = len(self._data)

        while True:
            left = 2 * index + 1
            right = left + 1
            smallest = index

            if (
                left < size
                and self._data[left] < self._data[smallest]
            ):
                smallest = left

            if (
                right < size
                and self._data[right] < self._data[smallest]
            ):
                smallest = right

            if smallest == index:
                return

            self._data[index], self._data[smallest] = (
                self._data[smallest],
                self._data[index],
            )
            index = smallest
```

## 为什么批量建堆是 `O(n)`

如果把 `n` 个元素逐个调用 `push`，上界是 `O(n log n)`。

自底向上建堆时，大量节点位于树的底部：

- 约一半节点是叶子，不需要移动；
- 约四分之一节点最多下沉一层；
- 约八分之一节点最多下沉两层。

总工作量可以写成：

```text
n/4 × 1 + n/8 × 2 + n/16 × 3 + ... = O(n)
```

因此构造函数从最后一个非叶子节点开始调用 `_sift_down`，整体为线性时间。

## 正确性说明

### 插入

插入前数组满足小根堆性质。新元素放到末尾后，只有新元素与祖先之间可能逆序。

`_sift_up` 不断把较小的新元素与父节点交换：

- 每次交换都会修复当前父子关系；
- 其他子树没有发生变化，仍然满足堆序；
- 停止时父节点不大于当前节点，整条路径恢复有序。

所以 `push` 后仍是小根堆。

### 删除

删除根节点后，末尾元素被移动到根节点。此时只有它向下的一条路径可能违反堆序。

`_sift_down` 每次选择两个孩子中更小的一个交换，使当前位置重新取得三者最小值。继续处理交换后的子树，直到当前节点已经不大于孩子。

因此调整结束后所有父节点都不大于孩子，`pop` 删除的又是原堆顶，所以它正确返回全局最小值。

## 复杂度

| 操作 | 时间复杂度 | 原因 |
|---|---:|---|
| 批量建堆 | `O(n)` | 自底向上下沉 |
| `push` | `O(log n)` | 最多沿树高上移 |
| `peek` | `O(1)` | 直接访问根节点 |
| `pop` | `O(log n)` | 最多沿树高下移 |
| `size` / `is_empty` | `O(1)` | 读取数组长度 |

底层数组占用 `O(n)` 空间，调整过程只使用常数个变量。

## 边界用例

| 场景 | 预期 |
|---|---|
| 空序列建堆 | 得到空堆 |
| 单元素堆弹出 | 返回该元素，堆变空 |
| 全部元素相等 | 正常插入和弹出 |
| 包含负数 | 最小负数位于堆顶 |
| 重复最小值 | 按次数逐个弹出 |
| 空堆 `peek` / `pop` | 抛出 `IndexError` |

## 60～90 秒口述稿

我用数组保存完全二叉树。下标 `i` 的左右孩子是 `2i + 1` 和 `2i + 2`，父节点是 `(i - 1) // 2`。

插入时先追加到数组末尾，再不断和父节点比较并向上调整；删除最小值时取出根节点，用末尾元素补到根，再与两个孩子中的较小者交换并向下调整。两种调整都只经过一条树高路径，所以插入和删除是 `O(log n)`，查看堆顶是 `O(1)`。

构造时不逐个插入，而是从最后一个非叶子节点开始向前下沉。因为越靠近叶子的节点越多、可下沉高度越小，所以批量建堆总复杂度是 `O(n)`。

## 常见追问

### 1. 如何改成大根堆？

把所有大小比较方向反过来即可，根节点就会保存最大值。

### 2. 为什么不能每次弹出后重新排序？

重新排序需要 `O(n log n)`，而堆只需沿一条路径恢复局部不变量，删除为 `O(log n)`。

### 3. 如何用它解决 Top K？

维护一个大小不超过 `k` 的小根堆：

- 新元素先入堆；
- 超过 `k` 个时弹出最小值；
- 最终堆中保留最大的 `k` 个元素。

[数组中的第 K 个最大元素 215](https://leetcode.cn/problems/kth-largest-element-in-an-array/)是相关练习，但不是本页手写完整堆接口的同题。
