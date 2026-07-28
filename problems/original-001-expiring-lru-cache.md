# 原创 01 · 带过期时间的 LRU 缓存

<ProblemMeta
  :tags="['本站原创', '字节面试题', '哈希表', '双向链表', '最小堆']"
  difficulty="hard"
  :appearances="25"
  pass-rate="36%"
/>

<ComplexityBadge
  time="get O(1)，put / count 均摊 O(log C)"
  space="O(C)"
/>

## 题目

设计并实现一个带 TTL（Time To Live，存活时间）的 LRU 缓存。

缓存最多保存 `capacity` 个未过期键，并提供以下操作：

- `get(key, now)`：若键存在且未过期，返回对应值，并把它标记为最近使用；否则返回 `-1`；
- `put(key, value, ttl, now)`：插入或更新键，过期时刻为 `now + ttl`，并把它标记为最近使用；
- `count(now)`：返回当前未过期键的数量。

还需要满足以下规则：

1. 当 `now >= expire_at` 时，缓存项视为已经过期；
2. 成功的 `get` 不会延长 TTL；
3. 更新已有键会覆盖它的值和过期时间；
4. 过期键不占用容量；
5. 清理过期键后容量仍满，才淘汰最久未使用的键。

为方便测试，当前时间由调用方显式传入，并保证所有操作中的 `now` 单调不减。

### 数据范围

- `1 <= capacity <= 10^5`；
- `0 <= key, value <= 10^9`；
- `1 <= ttl <= 10^9`；
- 最多执行 `2 × 10^5` 次操作。

## 示例

容量为 `2`，链表顺序按“最近使用 → 最久未使用”展示：

| 时刻 | 操作 | 返回 | 操作后的有效缓存 |
|---:|---|---:|---|
| 0 | `put(1, 10, 5, 0)` | — | `1`，键 1 在时刻 5 过期 |
| 1 | `put(2, 20, 100, 1)` | — | `2 → 1` |
| 2 | `get(1, 2)` | `10` | `1 → 2` |
| 6 | `put(3, 30, 100, 6)` | — | 键 1 已过期，得到 `3 → 2` |
| 6 | `get(1, 6)` | `-1` | `3 → 2` |
| 7 | `put(4, 40, 100, 7)` | — | 容量已满，淘汰键 2，得到 `4 → 3` |
| 8 | `count(8)` | `2` | `4 → 3` |

## 先拆清三个顺序

这道题同时维护三种关系：

| 目标 | 需要的结构 |
|---|---|
| 按 key 快速找到缓存项 | 哈希表 |
| 找到并更新最近使用顺序 | 双向链表 |
| 找到最早过期的缓存项 | 最小堆 |

只使用普通 LRU 的“哈希表 + 双向链表”还不够。

一个已经过期的结点可能位于链表中间，不能只检查链表尾部。若每次写入前遍历整条链表清理过期项，单次操作会退化到 `O(C)`。

## 最小堆为什么需要版本号

每次更新键时，它的过期时间可能改变。Python 标准库的 `heapq` 不支持按 key 原地修改堆中记录，因此采用惰性删除：

```text
(expire_at, key, version)
```

- 更新键时递增 `version`，并压入一条新的过期记录；
- 旧记录仍留在堆里，但版本号已经落后；
- 清理时只有与当前结点版本、过期时间都一致的记录才真正删除结点。

这样无需在堆中线性查找旧记录。

## Python 实现

```python
import heapq
from typing import Optional


class CacheNode:
    __slots__ = (
        "key",
        "value",
        "expire_at",
        "version",
        "previous",
        "next",
    )

    def __init__(
        self,
        key: int = 0,
        value: int = 0,
        expire_at: int = 0,
    ) -> None:
        self.key = key
        self.value = value
        self.expire_at = expire_at
        self.version = 1
        self.previous: Optional["CacheNode"] = None
        self.next: Optional["CacheNode"] = None


class ExpiringLRUCache:
    def __init__(self, capacity: int) -> None:
        self.capacity = capacity
        self.nodes: dict[int, CacheNode] = {}
        self.expiry_heap: list[tuple[int, int, int]] = []

        # 真实结点始终按“最近使用 → 最久未使用”排列。
        self.head = CacheNode()
        self.tail = CacheNode()
        self.head.next = self.tail
        self.tail.previous = self.head

    def get(self, key: int, now: int) -> int:
        node = self.nodes.get(key)
        if node is None:
            return -1

        # 命中过期键时立即删除；成功读取不会刷新 TTL。
        if node.expire_at <= now:
            self._delete(node)
            return -1

        self._move_to_front(node)
        return node.value

    def put(
        self,
        key: int,
        value: int,
        ttl: int,
        now: int,
    ) -> None:
        # 先清过期项，避免它们错误地占用容量。
        self._purge_expired(now)
        expire_at = now + ttl
        node = self.nodes.get(key)

        if node is not None:
            node.value = value
            node.expire_at = expire_at
            node.version += 1
            self._move_to_front(node)
        else:
            if len(self.nodes) == self.capacity:
                # 清理后仍满，才按 LRU 淘汰链表尾部结点。
                least_recent = self.tail.previous
                self._delete(least_recent)

            node = CacheNode(key, value, expire_at)
            self.nodes[key] = node
            self._add_to_front(node)

        heapq.heappush(
            self.expiry_heap,
            (node.expire_at, node.key, node.version),
        )
        self._compact_expiry_heap_if_needed()

    def count(self, now: int) -> int:
        self._purge_expired(now)
        return len(self.nodes)

    def _purge_expired(self, now: int) -> None:
        while self.expiry_heap and self.expiry_heap[0][0] <= now:
            expire_at, key, version = heapq.heappop(self.expiry_heap)
            node = self.nodes.get(key)

            # 旧版本、已淘汰键都只是失效的堆记录，直接跳过。
            if (
                node is not None
                and node.version == version
                and node.expire_at == expire_at
            ):
                self._delete(node)

    def _compact_expiry_heap_if_needed(self) -> None:
        # 惰性记录超过容量常数倍时重建，避免长期更新导致堆无限增长。
        if len(self.expiry_heap) <= 2 * self.capacity + 8:
            return

        self.expiry_heap = [
            (node.expire_at, node.key, node.version)
            for node in self.nodes.values()
        ]
        heapq.heapify(self.expiry_heap)

    def _move_to_front(self, node: CacheNode) -> None:
        self._unlink(node)
        self._add_to_front(node)

    def _add_to_front(self, node: CacheNode) -> None:
        node.previous = self.head
        node.next = self.head.next
        self.head.next.previous = node
        self.head.next = node

    def _unlink(self, node: CacheNode) -> None:
        node.previous.next = node.next
        node.next.previous = node.previous

    def _delete(self, node: CacheNode) -> None:
        self._unlink(node)
        del self.nodes[node.key]
```

## 三个核心不变量

### 1. 哈希表与链表一一对应

`nodes` 中每个键都对应链表中的唯一真实结点。新增和删除必须同时修改两个结构，不能留下“幽灵结点”。

### 2. 链表保持 LRU 顺序

新键、成功读取和更新已有键都会移动到头部，因此 `tail.previous` 始终是当前有效缓存中最久未使用的结点。

### 3. 每个有效结点都有当前过期记录

最小堆中可能存在历史记录，但当前结点一定有一条版本匹配的记录。清理时跳过失效版本，最终会到达并删除所有已经过期的有效结点。

## 为什么先清过期，再做 LRU 淘汰

假设容量为 2，缓存里有：

```text
A（已经过期） → B（仍有效）
```

此时插入 C，应该直接删除 A 并保留 B，而不是因为表面数量为 2 就按 LRU 淘汰 B。

因此 `put` 的顺序必须是：

1. 清理所有已经到期的有效记录；
2. 更新已有键，或判断是否真正达到容量；
3. 必要时淘汰 LRU；
4. 插入新键并登记过期时间。

## 正确性说明

`get` 只返回未过期结点，并在命中后维护最近使用顺序。`put` 先借助最小堆清理所有到期的当前版本记录，因此过期键不会占用容量；容量仍满时，链表尾部根据 LRU 不变量就是正确淘汰对象。

更新键会产生新版本，清理过程只有在 key、版本和过期时刻都与当前结点一致时才删除，因此历史堆记录不会误删新值。堆重建只保留当前有效结点的最新记录，不改变任何缓存语义。

综上，读取、过期、更新和容量淘汰都符合题意。

## 复杂度

令 `C` 为缓存容量。

- 未过期的 `get`：哈希查找和链表移动均为 `O(1)`；
- `put`：堆插入为 `O(log C)`；过期记录各自只会被弹出一次，因此批量清理按全部操作均摊；
- `count`：单次最坏可能清理多个到期项，均摊为 `O(log C)` 每条记录；
- 堆重建为 `O(C)`，只有积累了 `Ω(C)` 条惰性记录后才触发，均摊成本为 `O(1)` 每次更新；
- 空间复杂度：哈希表、链表和受限大小的过期堆均为 `O(C)`。

## 边界用例

| 场景 | 预期 |
|---|---|
| `now == expire_at` | 视为已过期 |
| 更新未过期键 | 覆盖值与 TTL，并移动到最近使用位置 |
| 重新插入已过期键 | 按新键处理 |
| 多个键同时过期 | 下一次 `put` 或 `count` 全部清理 |
| 过期键恰好是 LRU | 先按过期规则删除，不算容量淘汰 |
| 同一键频繁续期 | 历史堆记录被版本号识别，且堆会定期压缩 |
| 容量为 1 | 新增不同键时正确淘汰唯一有效旧键 |

## 90 秒面试表达

“普通 LRU 的哈希表和双向链表只能维护访问顺序，无法快速找到位于链表中间的过期项，所以我再加一个按过期时刻排序的最小堆。更新 TTL 时向堆中压入带版本号的新记录，旧记录采用惰性删除。写入前先从堆顶清理过期的当前版本，再在容量仍满时淘汰链表尾部的 LRU。哈希表负责按 key 定位，链表维护新旧顺序，堆维护时间顺序。有效 get 是 O(1)，put 均摊 O(log C)，空间 O(C)。”

## 常见追问

- 生产环境应使用单调时钟，避免系统时间回拨；
- 若 `get` 也要刷新 TTL，需要保存原 TTL，并在命中时产生新版本；
- 高并发实现必须让哈希表、链表和过期索引的修改保持原子性；
- 大规模缓存可使用时间轮降低定时清理成本，但时间精度和实现复杂度需要权衡；
- 可增加后台清理线程；惰性清理仍应保留，避免后台任务延迟时读到过期值。

## 来源与相似题

这是本站根据面试截图重新定义 API、约束、示例和解法的原创题面。LRU 与 TTL 本身都是常见缓存设计概念，不主张概念首创。

- [力扣 146 · LRU 缓存](https://leetcode.cn/problems/lru-cache/)：有容量与 LRU，没有 TTL；
- [力扣 2622 · 有时间限制的缓存](https://leetcode.cn/problems/cache-with-time-limit/)：有 TTL，没有容量淘汰与 LRU 顺序。

