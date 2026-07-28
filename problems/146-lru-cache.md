# 146 · LRU 缓存

<ProblemMeta
  :tags="['Hot100', '大厂面试', '数据结构设计']"
  difficulty="medium"
  :appearances="72"
  pass-rate="54%"
  source-url="https://leetcode.cn/problems/lru-cache/"
  source-label="力扣原题"
/>

<ComplexityBadge time="O(1) / 操作" space="O(capacity)" />

## 题目

设计一个满足 LRU（Least Recently Used，最近最少使用）策略的缓存：

- `get(key)`：键存在时返回值，并把它标记为最近使用；不存在返回 `-1`；
- `put(key, value)`：插入或更新键，并标记为最近使用；
- 容量满时插入新键，需要淘汰最久没有被使用的键。

要求 `get` 和 `put` 的平均时间复杂度都是 `O(1)`。

## 为什么需要两种数据结构

单独一种常见结构无法同时满足两个目标：

| 需求 | 数据结构 |
|---|---|
| 根据 key 常数时间找到缓存项 | 哈希表 |
| 常数时间移动、插入、删除任意缓存项 | 双向链表 |

双向链表从头到尾按“新 → 旧”排列：

- 头部是真实结点中的最近使用项；
- 尾部是真实结点中的最久未使用项；
- `get` 或更新后把结点移动到头部；
- 超容量时删除尾部结点。

## Python 实现

```python
class DoublyLinkedNode:
    __slots__ = ("key", "value", "previous", "next")

    def __init__(self, key: int = 0, value: int = 0) -> None:
        self.key = key
        self.value = value
        self.previous = None
        self.next = None


class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.nodes: dict[int, DoublyLinkedNode] = {}

        self.head = DoublyLinkedNode()
        self.tail = DoublyLinkedNode()
        self.head.next = self.tail
        self.tail.previous = self.head

    def get(self, key: int) -> int:
        node = self.nodes.get(key)

        if node is None:
            return -1

        self._move_to_front(node)
        return node.value

    def put(self, key: int, value: int) -> None:
        node = self.nodes.get(key)

        if node is not None:
            node.value = value
            self._move_to_front(node)
            return

        node = DoublyLinkedNode(key, value)
        self.nodes[key] = node
        self._add_to_front(node)

        if len(self.nodes) > self.capacity:
            least_recent = self.tail.previous
            self._remove(least_recent)
            del self.nodes[least_recent.key]

    def _move_to_front(self, node: DoublyLinkedNode) -> None:
        self._remove(node)
        self._add_to_front(node)

    def _add_to_front(self, node: DoublyLinkedNode) -> None:
        node.previous = self.head
        node.next = self.head.next
        self.head.next.previous = node
        self.head.next = node

    def _remove(self, node: DoublyLinkedNode) -> None:
        node.previous.next = node.next
        node.next.previous = node.previous
```

## 哨兵节点有什么用

`head` 和 `tail` 不保存真实缓存数据，只固定表示链表两端。

有了哨兵：

- 插入最近使用项永远发生在 `head` 之后；
- 淘汰项永远是 `tail.previous`；
- 删除第一个或最后一个真实结点与删除中间结点使用同一段代码；
- 空缓存时 `head.next is tail`，不需要额外维护空指针分支。

## `put` 的两条路径

### 键已经存在

更新原结点的值并移动到头部。不能新建第二个同 key 结点，否则哈希表和链表会失去一一对应关系。

### 键不存在

新建结点，加入哈希表和链表头部。如果缓存数量超过容量，再同时从链表尾部与哈希表删除最旧结点。

淘汰时必须更新两种数据结构，只删链表会在哈希表中留下失效结点。

## 正确性说明

链表始终按最后访问时间从新到旧排列。新结点加入头部；每次命中的 `get` 和已有键的 `put` 都把对应结点移到头部，因此顺序不变量持续成立。哈希表始终与所有真实链表结点一一对应。超容量时，`tail.previous` 正是最后访问时间最早的结点，删除它实现 LRU 淘汰。因此所有读取、更新和淘汰结果都符合题意。

## 复杂度

- `get`：哈希查找与固定次数链表修改，平均 `O(1)`。
- `put`：哈希更新与固定次数链表修改，平均 `O(1)`。
- 空间复杂度：`O(capacity)`。

## 操作示例

容量为 2，链表顺序从最近到最久：

| 操作 | 缓存顺序 | 返回 |
|---|---|---:|
| `put(1, 1)` | `1` | — |
| `put(2, 2)` | `2 → 1` | — |
| `get(1)` | `1 → 2` | `1` |
| `put(3, 3)` | `3 → 1` | 淘汰 `2` |
| `get(2)` | `3 → 1` | `-1` |
| `put(4, 4)` | `4 → 3` | 淘汰 `1` |

## 90 秒面试表达

“LRU 同时需要按 key 常数时间定位，以及常数时间更新使用顺序，所以组合哈希表和双向链表。哈希表映射 key 到结点；链表头部是最近使用，尾部是最久未使用。命中的 get、已有 key 的 put 都把结点移到头部；插入新结点后若超容量，就删除尾部结点，并同步从哈希表删除。我用头尾哨兵统一边界操作。get 和 put 平均 `O(1)`，空间 `O(capacity)`。”

## 常见追问

- LFU 需要同时维护访问频次和同频次内的最近使用顺序，结构更复杂。
- 并发场景需要保护哈希表与链表的原子一致性。
- 支持过期时间时，还需要时间索引、惰性删除或后台清理机制。
- Python 的 `OrderedDict` 可以简化工程实现，但面试通常要求手写核心结构。
