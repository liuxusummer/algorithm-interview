# 并查集：从连通性模板到大厂真题

并查集（Disjoint Set Union，简称 DSU）解决的是一类非常稳定的问题：

> 一开始每个元素各自独立，随后不断加入“连接关系”，需要快速判断两个元素是否属于同一组，并维护连通分量数量、大小或其他分量信息。

它不负责找最短路，也不负责还原具体路径。它最擅长回答的是：

- `x` 和 `y` 现在连通吗？
- 加入一条边后，是否第一次把两个集合连起来？
- 当前还有多少个连通分量？
- 某个连通分量有多少个元素？
- 一条边是否让无向图形成环？

面试中看到“等价关系、朋友圈、阵营、连通块、动态合并、冗余边、阈值逐渐放宽”等描述，就应该想到并查集。

## 1. 从集合问题理解并查集

假设有 `0～5` 六个元素，初始时它们互不连通：

```text
{0} {1} {2} {3} {4} {5}
```

依次加入三个关系：

```text
union(0, 1)
union(1, 2)
union(3, 4)
```

集合会变成：

```text
{0, 1, 2} {3, 4} {5}
```

此时：

```text
connected(0, 2) == True
connected(0, 4) == False
components == 3
```

如果再执行 `union(2, 4)`，前两个集合会合并：

```text
{0, 1, 2, 3, 4} {5}
```

并查集不保存集合中的完整边，也不关心 `0` 到 `4` 具体经过哪些结点。它只维护“这些元素是否属于同一个连通分量”。

## 2. 两个核心操作

并查集只有两个核心操作。

### `find(x)`：查找代表元

每个集合选择一个根结点作为代表元。`find(x)` 沿父指针向上寻找根结点。

如果：

```text
0 → 1 → 2
        ↑
        根
```

那么：

```text
find(0) == find(1) == find(2) == 2
```

两个元素属于同一集合，当且仅当它们的代表元相同：

```python
find(x) == find(y)
```

### `union(x, y)`：合并两个集合

合并时不能直接修改 `x` 或 `y` 的父结点，而要先找到两个集合的根：

```python
root_x = find(x)
root_y = find(y)
```

- 如果两个根相同，说明本来就在一个集合中，无需合并；
- 如果两个根不同，让一个根指向另一个根，两个集合就被连接起来。

这条规则很重要：

> `union` 合并的是两棵树的根，不是输入结点本身。

## 3. 为什么要做两项优化

朴素实现可能退化成一条很长的链：

```text
0 → 1 → 2 → 3 → 4 → 5
```

此时一次 `find(0)` 就需要走 `O(n)` 步。标准并查集通过两项优化避免这种情况。

### 优化一：路径压缩

调用 `find(0)` 找到根 `5` 后，把沿途结点直接挂到根下面：

```text
0 ─┐
1 ─┤
2 ─┤
3 ─┼→ 5
4 ─┘
```

之后再查询这些结点，几乎一步就能找到根。

### 优化二：按大小合并

合并两棵树时，把较小的树挂到较大的树下面，避免树高快速增长：

```python
if size[root_x] < size[root_y]:
    root_x, root_y = root_y, root_x

parent[root_y] = root_x
size[root_x] += size[root_y]
```

也可以按秩（rank）合并。面试中任选一种写熟即可，不必同时维护 `size` 和 `rank`。

## 4. Python 通用模板

下面这个版本使用迭代 `find`，避免 Python 深递归风险，同时维护连通分量数量和集合大小。

```python
class UnionFind:
    def __init__(self, n: int):
        # 每个结点初始时都是自己的根。
        self.parent = list(range(n))
        self.size = [1] * n
        self.components = n

    def find(self, x: int) -> int:
        root = x

        # 第一遍向上找到整棵树的根。
        while self.parent[root] != root:
            root = self.parent[root]

        # 第二遍把沿途结点全部直接连接到根。
        while x != root:
            next_node = self.parent[x]
            self.parent[x] = root
            x = next_node

        return root

    def union(self, x: int, y: int) -> bool:
        root_x = self.find(x)
        root_y = self.find(y)

        if root_x == root_y:
            return False

        # 小树挂到大树下，控制树高。
        if self.size[root_x] < self.size[root_y]:
            root_x, root_y = root_y, root_x

        self.parent[root_y] = root_x
        self.size[root_x] += self.size[root_y]
        self.components -= 1
        return True

    def connected(self, x: int, y: int) -> bool:
        return self.find(x) == self.find(y)

    def component_size(self, x: int) -> int:
        return self.size[self.find(x)]
```

### 为什么让 `union` 返回布尔值

这个设计非常实用：

- 返回 `True`：两个原本不同的集合刚刚被合并；
- 返回 `False`：两个结点原本已经连通。

因此可以直接用它：

- 维护连通分量数量；
- 判断一条边是否形成环；
- 只在真正合并时更新分量答案；
- 在 Kruskal 最小生成树中判断是否选择当前边。

## 5. 正确性与复杂度

### 正确性不变量

并查集始终保持以下不变量：

1. 每个结点沿父指针最终都能到达唯一根结点；
2. 同一集合中的所有结点拥有相同根；
3. 不同集合的根不同；
4. `union` 只连接两个集合的根，因此不会拆散原有集合；
5. 路径压缩只缩短到根的路径，不会改变集合归属。

所以 `find(x) == find(y)` 与“`x`、`y` 属于同一连通分量”等价。

### 复杂度

设一共有 `n` 个元素，执行 `m` 次操作。

- 初始化：`O(n)`；
- 单次 `find` 或 `union` 的均摊复杂度：`O(α(n))`；
- 空间复杂度：`O(n)`。

`α(n)` 是反阿克曼函数，增长极慢。在现实数据规模中通常不超过 `5`，因此面试时可以表达为“均摊接近 `O(1)`”。

注意不要直接说严格 `O(1)`；更准确的说法是：

> 路径压缩配合按大小合并后，单次操作均摊 `O(α(n))`，工程上近似常数。

## 6. 力扣基础题一：547 省份数量

[力扣 547 · 省份数量 ↗](https://leetcode.cn/problems/number-of-provinces/)

### 题目如何映射成并查集

邻接矩阵 `isConnected[i][j] == 1` 表示城市 `i` 与城市 `j` 直接相连。直接或间接相连的城市属于同一个省份。

这正是等价类划分：

- 元素：每座城市；
- 关系：两座城市直接相连；
- 集合：一个省份；
- 答案：最终连通分量数量。

### Python 实现

```python
class Solution:
    def findCircleNum(self, isConnected: list[list[int]]) -> int:
        n = len(isConnected)
        parent = list(range(n))
        size = [1] * n
        components = n

        def find(x: int) -> int:
            while parent[x] != x:
                # 路径减半：让当前结点跳过一层祖先。
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        def union(x: int, y: int) -> bool:
            nonlocal components

            root_x = find(x)
            root_y = find(y)
            if root_x == root_y:
                return False

            if size[root_x] < size[root_y]:
                root_x, root_y = root_y, root_x

            parent[root_y] = root_x
            size[root_x] += size[root_y]
            components -= 1
            return True

        # 矩阵关于主对角线对称，只扫描上三角即可。
        for city_a in range(n):
            for city_b in range(city_a + 1, n):
                if isConnected[city_a][city_b] == 1:
                    union(city_a, city_b)

        return components
```

### 复杂度

- 时间复杂度：`O(n² · α(n))`，主要开销是扫描邻接矩阵；
- 空间复杂度：`O(n)`。

这道题也能用 DFS/BFS。选择并查集的意义不在于静态情况下复杂度一定更优，而在于它自然表达“不断加入关系并合并等价类”。

## 7. 力扣基础题二：684 冗余连接

[力扣 684 · 冗余连接 ↗](https://leetcode.cn/problems/redundant-connection/)

一棵 `n` 个结点的树应当恰好有 `n - 1` 条边。题目多给了一条边，要求找出导致环出现的那条边。

按输入顺序处理每条无向边 `(u, v)`：

- 如果 `u`、`v` 原本不连通，这条边连接了两个分量，可以保留；
- 如果 `u`、`v` 原本已经连通，再加入这条边必然形成环，它就是冗余边。

### Python 实现

```python
class Solution:
    def findRedundantConnection(
        self,
        edges: list[list[int]],
    ) -> list[int]:
        n = len(edges)
        parent = list(range(n + 1))
        size = [1] * (n + 1)

        def find(x: int) -> int:
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        def union(x: int, y: int) -> bool:
            root_x = find(x)
            root_y = find(y)
            if root_x == root_y:
                return False

            if size[root_x] < size[root_y]:
                root_x, root_y = root_y, root_x

            parent[root_y] = root_x
            size[root_x] += size[root_y]
            return True

        for node_a, node_b in edges:
            # 合并失败，说明两个端点此前已经存在一条路径。
            if not union(node_a, node_b):
                return [node_a, node_b]

        return []
```

### 为什么只能直接判断无向图环

无向图中，两个端点已经连通时再加入一条边，一定形成环。

有向图的环与入度、方向和祖先关系有关，不能直接套这个判断。课程依赖一类有向图问题通常使用拓扑排序或三色 DFS。

## 8. 力扣题型扩展

掌握前两题后，可以按下面的顺序扩展：

| 题目 | 并查集角色 | 关键变化 |
|---|---|---|
| [547 · 省份数量](https://leetcode.cn/problems/number-of-provinces/) | 统计连通分量 | 最基础的合并模板 |
| [684 · 冗余连接](https://leetcode.cn/problems/redundant-connection/) | 无向图判环 | `union` 失败即形成环 |
| [990 · 等式方程的可满足性](https://leetcode.cn/problems/satisfiability-of-equality-equations/) | 合并等价关系 | 先处理 `==`，再验证 `!=` |
| [721 · 账户合并](https://leetcode.cn/problems/accounts-merge/) | 字符串映射到集合 | 邮箱与编号映射 |
| [200 · 岛屿数量](/problems/200-number-of-islands) | 网格连通分量 | 静态题优先 DFS；动态加陆地时考虑并查集 |

它们分别对应面试中最常见的五种信号：分组、判环、约束、实体归并和动态连通。

## 9. 大厂真题如何把并查集“藏起来”

真实笔试通常不会直接写“请实现并查集”，而是把它藏在业务关系或动态过程里。

| 真题 | 隐藏的集合 | 并查集负责什么 |
|---|---|---|
| [阿里后端 · 列车相对静止](/written-tests/alibaba-backend-20260328#problem-01) | 相对静止的列车 | 划分等价类并统计最大、最小分量 |
| [阿里算法 · 弦上生花](/written-tests/alibaba-algo-20260328#problem-03) | 当前阈值下可连通的相邻位置 | 离线排序后逐步激活边 |
| [阿里 AI · 连连看](/written-tests/alibaba-ai-20260415#problem-03) | 颜色相同的连续区间 | 动态合并区间并维护端点 |
| [阿里开发 · 迷宫](/written-tests/alibaba-dev-20260513#problem-03) | 同颜色边构成的连通块 | 压缩成超级节点，再运行 Dijkstra |
| [携程算法 · 序列倍数交换](/written-tests/ctrip-algo-20260423#problem-04) | 能通过倍数关系互换的位置 | 倍数筛建隐式边并合并分量 |

下面把这些真题抽象成可迁移的套路。

## 10. 真题套路一：等价关系分组

“列车相对静止”中，相对静止关系满足：

- 自反性：一列车与自己相对静止；
- 对称性：`A` 相对 `B` 静止，则 `B` 相对 `A` 静止；
- 传递性：`A` 与 `B`、`B` 与 `C` 相对静止，则三者属于同一组。

一旦识别出等价关系，解法就很直接：

1. 每列车初始化为独立集合；
2. 对所有相对静止关系执行 `union`；
3. 统计每个根对应的集合大小；
4. 根据题目要求取最大、最小或集合数量。

这和力扣 547 的建模完全相同，只是“城市”换成了“列车”。

## 11. 真题套路二：排序 + 离线并查集

“弦上生花”这一类题具有明显的单调性：

> 随着阈值 `k` 增大，能够加入的边只会变多，连通分量只会合并，不会拆分。

假设相邻位置 `i` 和 `i + 1` 的连接代价为：

```python
cost = abs(nums[i + 1] - nums[i])
```

当 `cost <= k` 时，这条边才被激活。可以：

1. 把所有边按 `cost` 从小到大排序；
2. 把查询阈值也离线排序；
3. 扫描阈值时，不断把新满足条件的边加入并查集；
4. 每次成功合并后更新最大连通块。

核心框架如下：

```python
def max_component_sizes(
    nums: list[int],
    queries: list[int],
) -> list[int]:
    n = len(nums)
    parent = list(range(n))
    size = [1] * n

    def find(x: int) -> int:
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(x: int, y: int) -> int:
        root_x = find(x)
        root_y = find(y)
        if root_x == root_y:
            return size[root_x]

        if size[root_x] < size[root_y]:
            root_x, root_y = root_y, root_x

        parent[root_y] = root_x
        size[root_x] += size[root_y]
        return size[root_x]

    edges = sorted(
        (abs(nums[index + 1] - nums[index]), index, index + 1)
        for index in range(n - 1)
    )
    ordered_queries = sorted(
        (threshold, index)
        for index, threshold in enumerate(queries)
    )

    answer = [1] * len(queries)
    edge_index = 0
    largest = 1 if n else 0

    for threshold, query_index in ordered_queries:
        while (
            edge_index < len(edges)
            and edges[edge_index][0] <= threshold
        ):
            _, left, right = edges[edge_index]
            largest = max(largest, union(left, right))
            edge_index += 1

        answer[query_index] = largest

    return answer
```

这类题的识别关键词是：

- 多个阈值查询；
- 条件随阈值增大而放宽；
- 边只增加、不删除；
- 问连通性、最大分量或分量数量。

## 12. 真题套路三：在根上维护额外信息

标准并查集只维护 `parent` 和 `size`。实际题目经常要求每个分量携带更多信息，例如：

- 连续区间的左端点、右端点；
- 分量颜色；
- 最大值、最小值或权重和；
- 是否包含特殊结点；
- 分量内某类元素的数量。

维护原则是：

> 分量信息只在根上有效；合并后只更新新根。

例如维护区间端点：

```python
left[root_x] = min(left[root_x], left[root_y])
right[root_x] = max(right[root_x], right[root_y])
```

任何时候读取分量信息前，都先执行：

```python
root = find(x)
```

不要继续读取已经被挂到其他根下的旧根信息。

阿里“连连看”正是这个模式：并查集维护同色连续段，根结点额外保存区间边界和颜色；一次合并后还要检查新分量是否能与左侧同色段继续级联合并。

## 13. 真题套路四：先缩点，再运行其他算法

并查集并不一定直接产生最终答案，它也可以作为预处理工具。

阿里“迷宫”中，同一种颜色的边会形成若干连通块。先用并查集把每个同色连通块压缩成“超级节点”，再在原结点和超级节点组成的新图上运行 Dijkstra。

整体结构是：

```text
原始同色边
    ↓
并查集合并同色连通块
    ↓
每个连通块建立超级节点
    ↓
在压缩后的图上运行最短路
```

这个组合体现了算法分工：

- 并查集回答“哪些结点属于同一块”；
- Dijkstra 回答“从起点到终点的最小代价”。

如果题目既有等价关系，又有路径代价，通常不是在并查集和最短路之间二选一，而是把两者组合起来。

## 14. 真题套路五：隐式图与批量建边

携程“序列倍数交换”中，两个位置能否交换取决于数值的倍数关系。

如果暴力枚举所有位置对，需要 `O(n²)`。题解没有显式建立所有边，而是：

1. 记录每个值出现的代表位置；
2. 枚举值 `v` 的倍数 `2v、3v……`；
3. 把 `v` 与各倍数的代表位置合并；
4. 最终在每个连通分量内部重新排列元素。

倍数枚举总量近似：

```text
n/1 + n/2 + n/3 + ... + n/n = O(n log n)
```

这里并查集只负责维护连通性，真正降低复杂度的关键是利用数论结构批量生成必要的连接关系。

## 15. 并查集与 DFS/BFS 怎么选

| 问题特征 | 优先选择 |
|---|---|
| 静态图，只需统计一次连通分量 | DFS、BFS、并查集都可以 |
| 边不断加入，并反复查询连通性 | 并查集 |
| 需要得到具体路径 | DFS/BFS 或最短路 |
| 需要最短步数或最小代价 | BFS、0-1 BFS、Dijkstra |
| 无向图按顺序加边，需要判断何时成环 | 并查集 |
| 有向图依赖或判环 | 拓扑排序、三色 DFS |
| 需要频繁删除边 | 普通并查集不适合 |
| 阈值单调增大、边只会逐渐激活 | 离线排序 + 并查集 |

以 [200 · 岛屿数量](/problems/200-number-of-islands) 为例：

- 地图一次性给出，只求一次岛屿数：DFS 更直接；
- 陆地不断动态加入，每次都要输出岛屿数：并查集更合适；
- 如果还要支持删除陆地：普通并查集无法直接处理，需要离线逆序、可撤销并查集或更复杂的数据结构。

## 16. 高频错误

### 错误一：直接连接输入结点

```python
# 错误：可能破坏已有树结构。
parent[y] = x
```

必须连接根：

```python
root_x = find(x)
root_y = find(y)
parent[root_y] = root_x
```

### 错误二：重复合并仍然减少分量数

只有两个根不同时，连通分量数量才减一：

```python
if root_x == root_y:
    return False

components -= 1
```

### 错误三：分量大小记在非根结点上

`size[x]` 不一定有效。应当读取：

```python
size[find(x)]
```

### 错误四：下标没有统一

力扣图结点经常从 `1` 开始，数组下标通常从 `0` 开始。初始化前先决定：

```python
parent = list(range(n))      # 0 ～ n-1
parent = list(range(n + 1))  # 1 ～ n
```

### 错误五：把并查集当成最短路

`connected(x, y)` 只能说明存在路径，不能告诉你：

- 路径经过哪些结点；
- 路径长度；
- 最小花费；
- 有多少条路径。

遇到这些目标，应改用搜索或最短路算法。

## 17. 面试时怎么讲

可以按下面的顺序表达：

> “这道题只关心元素是否属于同一个连通分量，而且连接关系会不断加入，不需要还原具体路径，所以我使用并查集。`find` 返回集合代表元，并做路径压缩；`union` 先找到两个根，再按集合大小把小树挂到大树下面。两个根相同表示已经连通，否则合并并更新分量数量或分量信息。单次操作均摊 `O(α(n))`，整体接近线性。”

如果是进阶题，再补充真正的转化：

- “把查询按阈值离线排序，逐步激活边”；
- “在根上维护区间左右端点”；
- “先把等价结点缩成超级节点，再跑 Dijkstra”；
- “利用倍数筛生成隐式边，避免 `O(n²)` 枚举”。

面试官真正关注的通常不只是模板，而是你为什么能识别出“集合只合并、不拆分”的结构。

## 18. 推荐训练路线

### 第一阶段：写熟模板

1. [547 · 省份数量](https://leetcode.cn/problems/number-of-provinces/)
2. [684 · 冗余连接](https://leetcode.cn/problems/redundant-connection/)

目标：不看资料写出路径压缩、按大小合并、分量计数。

### 第二阶段：理解建模变化

1. [990 · 等式方程的可满足性](https://leetcode.cn/problems/satisfiability-of-equality-equations/)
2. [721 · 账户合并](https://leetcode.cn/problems/accounts-merge/)
3. [200 · 岛屿数量](/problems/200-number-of-islands) 的动态加陆地追问

目标：学会把字符、邮箱、网格位置映射成并查集编号。

### 第三阶段：大厂真题组合

1. [列车相对静止](/written-tests/alibaba-backend-20260328#problem-01)：等价类；
2. [弦上生花](/written-tests/alibaba-algo-20260328#problem-03)：离线排序；
3. [连连看](/written-tests/alibaba-ai-20260415#problem-03)：分量元数据；
4. [迷宫](/written-tests/alibaba-dev-20260513#problem-03)：缩点 + 最短路；
5. [序列倍数交换](/written-tests/ctrip-algo-20260423#problem-04)：隐式图。

目标：从题目业务描述中主动识别并查集，而不是等待题目直接给出“连通分量”四个字。

## 19. 最终检查清单

写完并查集代码后逐项检查：

- 元素编号范围是 `0～n-1` 还是 `1～n`？
- `find` 是否进行了路径压缩？
- `union` 是否合并两个根？
- 是否按大小或秩合并？
- 重复合并时是否错误更新了答案？
- 分量信息是否只维护在根上？
- `components` 是否只在成功合并时减一？
- 题目是否需要具体路径或最短距离？
- 是否存在删边操作，导致普通并查集不适用？
- 阈值是否具有单调性，可以离线排序处理？

把这十个问题说清楚，并查集题通常就不会在实现细节上失分。
