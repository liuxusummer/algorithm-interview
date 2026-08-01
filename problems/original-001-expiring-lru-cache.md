# 原创 01 · 带过期时间的 LRU 缓存

<ProblemMeta
  :tags="['本站原创', '字节面试题', '哈希表', '双向链表', '最小堆']"
  difficulty="hard"
  :appearances="25"
  pass-rate="36%"
/>

<ComplexityBadge
  time="完整版 put 均摊 O(log C)，简化版均摊 O(1)"
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

## Python 实现（完整版本：独立 TTL + 最小堆）

```python
import heapq
from typing import Optional


class CacheNode:
    # __slots__ 避免为大量缓存结点创建 __dict__，降低对象开销。
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
        # key 用于从链表删除结点时同步清理哈希表。
        self.key = key
        self.value = value

        # expire_at 是绝对过期时刻；now >= expire_at 即为过期。
        self.expire_at = expire_at

        # 同一个 key 每次更新 TTL 都递增版本号。
        # 堆中的旧记录无法原地删除，清理时靠版本号识别并跳过。
        self.version = 1

        # previous / next 只负责维护 LRU 顺序，不参与过期排序。
        self.previous: Optional["CacheNode"] = None
        self.next: Optional["CacheNode"] = None


class ExpiringLRUCache:
    def __init__(self, capacity: int) -> None:
        self.capacity = capacity

        # 哈希表负责 O(1) 按 key 定位真实结点。
        self.nodes: dict[int, CacheNode] = {}

        # 元组依次为（过期时刻、key、版本号）。
        # 堆中允许保留旧版本记录，真正删除采用惰性校验。
        self.expiry_heap: list[tuple[int, int, int]] = []

        # 头尾哨兵不保存业务数据，消除空链表、首结点和尾结点特判。
        # 真实结点始终按“最近使用 → 最久未使用”排列在两者之间。
        self.head = CacheNode()
        self.tail = CacheNode()
        self.head.next = self.tail
        self.tail.previous = self.head

    def get(self, key: int, now: int) -> int:
        # 第一步只查哈希表，不需要遍历双向链表。
        node = self.nodes.get(key)
        if node is None:
            return -1

        # 命中过期键时必须同时从哈希表和链表删除。
        # 完整版采用绝对过期时刻，成功读取只更新 LRU，不刷新 TTL。
        if node.expire_at <= now:
            self._delete(node)
            return -1

        # 有效命中后移动到头部，表示它刚刚被使用。
        self._move_to_front(node)
        return node.value

    def put(
        self,
        key: int,
        value: int,
        ttl: int,
        now: int,
    ) -> None:
        # 写入前先清理所有到期的“当前版本”记录。
        # 过期项不应占用容量，更不能挤掉仍然有效的 LRU 结点。
        self._purge_expired(now)
        expire_at = now + ttl
        node = self.nodes.get(key)

        if node is not None:
            # 更新已有键：覆盖值和过期时刻，并产生一个新版本。
            # 旧版本的过期记录仍留在堆中，后续会被惰性跳过。
            node.value = value
            node.expire_at = expire_at
            node.version += 1
            self._move_to_front(node)
        else:
            if len(self.nodes) == self.capacity:
                # 清理后仍满，才按 LRU 淘汰链表尾部结点。
                least_recent = self.tail.previous
                self._delete(least_recent)

            # 新结点先登记到哈希表，再插入链表头部。
            node = CacheNode(key, value, expire_at)
            self.nodes[key] = node
            self._add_to_front(node)

        # 无论新增还是更新，都为当前版本登记一条过期记录。
        heapq.heappush(
            self.expiry_heap,
            (node.expire_at, node.key, node.version),
        )

        # 频繁更新同一个 key 会留下许多历史堆记录，必要时统一压缩。
        self._compact_expiry_heap_if_needed()

    def count(self, now: int) -> int:
        # 先清理再计数，保证返回的是未过期键数量。
        self._purge_expired(now)
        return len(self.nodes)

    def _purge_expired(self, now: int) -> None:
        # 堆顶始终是尚未处理的最早过期记录。
        while self.expiry_heap and self.expiry_heap[0][0] <= now:
            expire_at, key, version = heapq.heappop(self.expiry_heap)
            node = self.nodes.get(key)

            # 以下三项同时匹配，才说明这条记录仍代表当前真实结点：
            # 1. key 尚未被容量淘汰；
            # 2. 版本号没有落后；
            # 3. 过期时刻仍与结点一致。
            # 否则它只是旧版本或已淘汰键留下的失效记录。
            if (
                node is not None
                and node.version == version
                and node.expire_at == expire_at
            ):
                self._delete(node)

    def _compact_expiry_heap_if_needed(self) -> None:
        # 惰性记录超过容量常数倍时，只用当前真实结点重建最小堆。
        # 这避免频繁续期让历史记录无限增长，同时保持均摊复杂度。
        if len(self.expiry_heap) <= 2 * self.capacity + 8:
            return

        self.expiry_heap = [
            (node.expire_at, node.key, node.version)
            for node in self.nodes.values()
        ]
        heapq.heapify(self.expiry_heap)

    def _move_to_front(self, node: CacheNode) -> None:
        # 先从原位置摘除，再作为最近使用结点插到头部。
        self._unlink(node)
        self._add_to_front(node)

    def _add_to_front(self, node: CacheNode) -> None:
        # 插入前：head <-> first
        # 插入后：head <-> node <-> first
        node.previous = self.head
        node.next = self.head.next
        self.head.next.previous = node
        self.head.next = node

    def _unlink(self, node: CacheNode) -> None:
        # 双向跨过 node；调用方保证 node 是链表中的真实结点。
        node.previous.next = node.next
        node.next.previous = node.previous

    def _delete(self, node: CacheNode) -> None:
        # 删除操作必须同步维护链表和哈希表，保持一一对应。
        # 堆中的相关记录不立即查找删除，留给 _purge_expired 惰性处理。
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

## 简化实现：固定 TTL + 访问续期

如果面试官给出的语义更接近下面这组规则，就不需要最小堆：

1. 整个缓存共用同一个固定 `ttl`；
2. 新增、更新和成功的 `get` 都刷新 `last_access_time`；
3. 过期条件为 `now - last_access_time >= ttl`；
4. 仍然使用哈希表定位结点、双向链表维护 LRU。

关键观察是：每次刷新时间戳时，结点也会移动到链表头部。因此链表从头到尾不仅是“最近使用 → 最久未使用”，也同时是“最晚过期 → 最早过期”。所有过期结点必然形成链表尾部的一段连续后缀。

所以写入前只需从尾部连续清理过期结点，直到尾结点仍有效，无需额外维护过期堆。

### Python 实现

```python
from typing import Optional


class SimpleCacheNode:
    def __init__(
        self,
        key: int = 0,
        value: int = 0,
        last_access_time: int = 0,
    ) -> None:
        self.key = key
        self.value = value

        # 固定 TTL 从最近一次成功访问或写入时刻重新计时。
        self.last_access_time = last_access_time
        self.previous: Optional["SimpleCacheNode"] = None
        self.next: Optional["SimpleCacheNode"] = None


class SimpleExpiringLRUCache:
    def __init__(self, capacity: int, ttl: int) -> None:
        self.capacity = capacity
        self.ttl = ttl

        # map 保证 get / put 能够 O(1) 找到结点。
        self.nodes: dict[int, SimpleCacheNode] = {}

        # 哨兵之间保存真实结点：head 后面最新，tail 前面最旧。
        self.head = SimpleCacheNode()
        self.tail = SimpleCacheNode()
        self.head.next = self.tail
        self.tail.previous = self.head

    def get(self, key: int, now: int) -> int:
        node = self.nodes.get(key)
        if node is None:
            return -1

        if self._is_expired(node, now):
            # 修复常见遗漏：过期结点要同时移出链表和哈希表。
            self._delete(node)
            return -1

        # 本简化版采用滑动过期：有效访问会刷新 TTL。
        node.last_access_time = now
        self._move_to_front(node)
        return node.value

    def put(self, key: int, value: int, now: int) -> None:
        # 固定 TTL + 访问续期使过期顺序与 LRU 顺序一致，
        # 所以过期结点一定集中在尾部，可以连续清理。
        self._purge_expired_from_tail(now)
        node = self.nodes.get(key)

        if node is not None:
            # 已有键仍有效：覆盖值、刷新 TTL，并标记为最近使用。
            node.value = value
            node.last_access_time = now
            self._move_to_front(node)
            return

        if len(self.nodes) == self.capacity:
            # 过期项已经清理完，仍满时才淘汰真正的 LRU。
            self._delete(self.tail.previous)

        new_node = SimpleCacheNode(key, value, now)
        self.nodes[key] = new_node
        self._add_to_front(new_node)

    def count(self, now: int) -> int:
        self._purge_expired_from_tail(now)
        return len(self.nodes)

    def _is_expired(
        self,
        node: SimpleCacheNode,
        now: int,
    ) -> bool:
        # 到达边界时立即过期，使用 >= 而不是 >。
        return now - node.last_access_time >= self.ttl

    def _purge_expired_from_tail(self, now: int) -> None:
        # tail.previous 是最久未访问、也最早过期的真实结点。
        # 如果它尚未过期，前面的所有结点一定也未过期。
        while (
            self.tail.previous is not self.head
            and self._is_expired(self.tail.previous, now)
        ):
            self._delete(self.tail.previous)

    def _add_to_front(self, node: SimpleCacheNode) -> None:
        node.previous = self.head
        node.next = self.head.next
        self.head.next.previous = node
        self.head.next = node

    def _remove_node(self, node: SimpleCacheNode) -> None:
        node.previous.next = node.next
        node.next.previous = node.previous

    def _move_to_front(self, node: SimpleCacheNode) -> None:
        self._remove_node(node)
        self._add_to_front(node)

    def _delete(self, node: SimpleCacheNode) -> None:
        self._remove_node(node)
        del self.nodes[node.key]
```

### 简化版为什么不需要 `current_count`

哈希表与链表始终一一对应，所以 `len(self.nodes)` 就是真实结点数量。单独维护 `current_count` 会增加同步负担：任何过期、淘汰或更新分支漏改一次，计数就会失真。

### 简化版复杂度

- `get`：`O(1)`；
- `put` / `count`：单次可能连续清理多个过期结点，但每个结点只会被删除一次，均摊 `O(1)`；
- 空间复杂度：`O(C)`。

### 两个版本如何选择

| 需求 | 推荐实现 |
|---|---|
| 每个键可以有不同 TTL | 完整版：哈希表 + 双向链表 + 最小堆 |
| 成功读取不延长 TTL | 完整版：绝对过期时刻 |
| 全缓存固定 TTL，访问会续期 | 简化版：哈希表 + 双向链表 |
| 需要主动按过期时间批量清理 | 完整版或时间轮 |

不能在“每个键 TTL 不同”或“访问不续期”的语义下直接套简化版。此时过期顺序与 LRU 顺序不一致，链表中间也可能先出现过期结点，只检查尾部会漏删。

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
