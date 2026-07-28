---
pageClass: exam-session-page
title: 米哈游暑期实习 · 通用技术岗 2026-04-28
description: 米哈游 2026-04-28 暑期实习 · 通用技术岗笔试真题，含 3 道 Python ACM 模式题解
---

<div class="exam-session-banner">
  <div>
    <span>MIHOYO / 2026.04.28 / ACM</span>
    <strong>米哈游 · 暑期实习 · 通用技术岗</strong>
    <small>2026-04-28 · 3 题 ACM · 难度 中等</small>
  </div>
  <div class="exam-session-banner__meta">
    <span>SQL 多表关联查询 + CASE WHEN 聚合</span>
    <span>博弈贪心 + 余数配对</span>
    <span>Shell 管道编程</span>
  </div>
</div>

# 米哈游 2026-04-28 暑期实习 · 通用技术岗笔试解析

本场统一整理为完整 Python 3 ACM 程序。每题保留标准输入输出、建模过程、正确性依据、复杂度、易错点和关键中文注释；原 SQL、Shell 与第三方机器学习库题也已改写为可独立运行的标准库版本。

来源：[Zero2Leetcode · 米哈游 2026-04-28 暑期实习 · 通用技术岗](https://onefly.top/zero2Leetcode/04_real_interviews/mihoyo/general-20260428/)。

## 本场考试概述

**考试时间**：2026年4月28日
**考试岗位**：暑期实习（通用技术岗）
**难度评级**：中等

**考点分析**：

1. 第一题：SQL 多表关联查询 + CASE WHEN 聚合（难度中等）
2. 第二题：博弈贪心 + 余数配对（难度中等）
3. 第三题：Shell 管道编程（难度简单）

**建议策略**：

1. 第一题考 SQL 基本功，注意 CASE WHEN 内嵌聚合函数 MAX 的用法，以及"超过150%"的数学翻译
2. 第二题是博弈分析，核心是把数组元素按余数分组后，分析先手如何用"孤儿元素"终结游戏
3. 第三题 Shell 脚本送分题，熟练使用 sort / uniq / awk 管道组合即可

---

## 01 · 游戏道具交易数据分析 {#problem-01}

### 题目描述

> **Python ACM 输入输出约定**：第一行输入道具数 `I` 和交易数 `T`；随后输入 `I` 行道具信息与 `T` 行交易。时间使用不含空格的 ISO 形式 `YYYY-MM-DDTHH:MM:SS`，状态仍为 0/1/2。

某款开放世界游戏运营团队需要对 2025 年 4 月份的玩家道具交易情况进行数据分析。系统中有两张相关数据表：

**item_info（道具信息表）**

| 字段 | 类型 | 说明 |
|------|------|------|
| item_id | INT | 道具ID，主键 |
| item_name | VARCHAR(50) | 道具名称 |
| item_type | VARCHAR(20) | 道具类型（Weapon, Armor, Material, Consumable） |
| quality | VARCHAR(10) | 道具品质（Common, Rare, Epic, Legendary） |
| base_price | INT | 基础价格（游戏金币） |

**trade_record（交易记录表）**

| 字段 | 类型 | 说明 |
|------|------|------|
| trade_id | BIGINT | 交易ID，主键 |
| item_id | INT | 道具ID |
| seller_id | BIGINT | 卖家玩家ID |
| buyer_id | BIGINT | 买家玩家ID |
| trade_price | INT | 成交价格（游戏金币） |
| trade_quantity | INT | 交易数量 |
| trade_time | DATETIME | 交易时间 |
| trade_status | TINYINT | 交易状态（0-已取消，1-已完成，2-已申诉） |

查询 2025 年 4 月 1 日至 2025 年 4 月 30 日期间，满足以下条件的道具交易统计信息：

1. 只统计已完成（trade_status=1）的交易记录
2. 只统计品质为 Rare、Epic 或 Legendary 的道具
3. 输出字段：道具名称（item_name）、道具品质（quality）、交易总次数（trade_count）、交易总数量（total_quantity）、交易总金额（total_amount，即 trade_price × trade_quantity 之和）、价格波动（price_status：最高成交单价超过基础价格 150% 为 High，低于基础价格为 Low，否则为 Normal）

按交易总金额降序排列，若交易总金额相同则按道具名称升序排列。

### 样例

**输入**

```text
7 13
1 IronSword Weapon Common 100
2 FlameBreaker Weapon Rare 500
3 DragonSlayer Weapon Epic 2000
4 Excalibur Weapon Legendary 10000
5 ShadowCloak Armor Rare 600
6 TitanPlate Armor Epic 2500
7 MagicCrystal Material Rare 50
80001 2 1001 2001 550 10 2025-04-01T10:00:00 1
80002 2 1002 2002 800 15 2025-04-03T11:00:00 1
80003 3 1001 2003 2200 5 2025-04-05T12:00:00 1
80004 3 1003 2001 2400 8 2025-04-07T13:00:00 1
80005 4 1002 2002 12000 2 2025-04-09T14:00:00 1
80006 5 1001 2003 580 20 2025-04-11T15:00:00 1
80007 6 1003 2001 2800 10 2025-04-13T16:00:00 1
80008 7 1002 2002 60 100 2025-04-15T17:00:00 1
80009 7 1001 2003 45 80 2025-04-17T18:00:00 1
80010 1 1001 2003 120 50 2025-04-20T21:00:00 1
80011 4 1003 2001 11000 1 2025-04-22T22:00:00 0
80012 3 1002 2002 2300 4 2025-03-30T10:00:00 1
80013 6 1001 2002 2600 5 2025-04-25T11:00:00 2
```

**输出**

```text
item_name|quality|trade_count|total_quantity|total_amount|price_status
DragonSlayer|Epic|2|13|30200|Normal
TitanPlate|Epic|1|10|28000|Normal
Excalibur|Legendary|1|2|24000|Normal
FlameBreaker|Rare|2|25|17500|High
ShadowCloak|Rare|1|20|11600|Low
MagicCrystal|Rare|2|180|9600|Normal
```

### 解题思路

用字典保存道具主表，再扫描交易记录。扫描时同时检查状态、左闭右开的日期范围以及品质集合，只有满足全部条件的记录才进入聚合桶。

每个道具的桶维护交易次数、总数量、总金额和最高单价。扫描结束后比较“2 × 最高价”与“3 × 基础价”，用整数运算避免 1.5 带来的浮点误差；最后按“总金额降序、名称升序”排序输出。

**正确性依据**：每条合格交易恰好被加入其 item_id 对应的唯一统计桶，不合格交易均被过滤，所以四个聚合量与题意逐项一致。状态分类直接使用聚合后的最高价，最终排序键也与题面相同。

### Python ACM 实现

下面给出完整标准输入、标准输出程序，可直接在 Python 3 ACM 环境运行。

```python
# 核心步骤：SQL 多表关联查询 + CASE WHEN 聚合；严格按题面处理边界并输出结果。
import sys
from collections import defaultdict


def solve():
    input = sys.stdin.readline
    item_count, trade_count = map(int, input().split())
    items = {}
    for _ in range(item_count):
        item_id, name, item_type, quality, base_price = input().split()
        items[item_id] = {
            "name": name,
            "type": item_type,
            "quality": quality,
            "base_price": int(base_price),
        }

    statistics = defaultdict(lambda: {
        "count": 0,
        "quantity": 0,
        "amount": 0,
        "max_price": 0,
    })
    allowed_quality = {"Rare", "Epic", "Legendary"}
    for _ in range(trade_count):
        parts = input().split()
        _, item_id, _, _, price, quantity, trade_time, status = parts
        item = items[item_id]
        if (
            status != "1"
            or not ("2025-04-01" <= trade_time[:10] < "2025-05-01")
            or item["quality"] not in allowed_quality
        ):
            continue

        price = int(price)
        quantity = int(quantity)
        row = statistics[item_id]
        row["count"] += 1
        row["quantity"] += quantity
        row["amount"] += price * quantity
        row["max_price"] = max(row["max_price"], price)

    result = []
    for item_id, row in statistics.items():
        item = items[item_id]
        if row["max_price"] * 2 > item["base_price"] * 3:
            price_status = "High"
        elif row["max_price"] < item["base_price"]:
            price_status = "Low"
        else:
            price_status = "Normal"
        result.append((
            -row["amount"],
            item["name"],
            item["quality"],
            row,
            price_status,
        ))

    result.sort(key=lambda value: (value[0], value[1]))
    print("item_name|quality|trade_count|total_quantity|total_amount|price_status")
    for _, name, quality, row, price_status in result:
        print(
            name,
            quality,
            row["count"],
            row["quantity"],
            row["amount"],
            price_status,
            sep="|",
        )


solve()
```

### 易错点

- 严格区分题面中的“严格大于/不小于”、开闭区间与下标起点。
- 多组测试时必须重置状态；大规模累加按题面需要使用 Python 整数或取模。

### 复杂度分析

**时间复杂度**：$O(I+T+K\log K)$，$K$ 为有有效交易的道具数。
**空间复杂度**：$O(I+K)$。

---

## 02 · 数组博弈 {#problem-02}

### 题目描述

给定一个长度为 $n$ 的数组，两人轮流从数组中取元素进行博弈。先手方希望使你（后手）的得分尽可能少。每轮先手取出元素 $x$ 后，你需要找到满足 $(x + y) \bmod 4 = 3$ 的元素 $y$ 来配对得分。如果找不到满足条件的 $y$，游戏结束。求你的最终得分。

### 样例

**输入**

```text
3
4
0 3 1 2
5
0 0 3 1 2
6
0 0 3 1 1 2
```

**输出**

```text
2
1
1
```

### 解题思路

配对条件只由模 4 余数决定，合法互补组只有 $(0,3)$ 与 $(1,2)$。设两组当前最多可配出的轮数分别为
$p_a=\min(c_0,c_3)$、$p_b=\min(c_1,c_2)$。

如果一组两侧数量不等，较多一侧最终会留下“孤儿”。先手持续从这一组选择元素，经过该组的全部可配轮数后，下一次选择孤儿即可结束游戏。因此：

- 两组都有孤儿时，先手选择可配轮数更少的一组，答案是 $\min(p_a,p_b)$；
- 只有一组有孤儿时，只能从该组结束，答案是它的可配轮数；
- 两组都平衡时没有孤儿，所有配对都会完成，答案是 $p_a+p_b$。

**正确性依据**：在某组产生孤儿前，每次从该组取数都必然让后手得 1 分并同时消耗一对；消耗次数不能少于该组的配对数，也可以按该次数达到。因此上述结束代价是精确值，先手只需在可结束的组中取最小代价。

### Python ACM 实现

下面给出完整标准输入、标准输出程序，可直接在 Python 3 ACM 环境运行。

```python
# 核心步骤：博弈贪心 + 余数配对；严格按题面处理边界并输出结果。
import sys


def solve():
    input = sys.stdin.readline
    test_count = int(input())
    for _ in range(test_count):
        length = int(input())
        counts = [0, 0, 0, 0]
        for value in map(int, input().split()):
            counts[value % 4] += 1

        pair_a = min(counts[0], counts[3])
        pair_b = min(counts[1], counts[2])
        orphan_a = counts[0] != counts[3]
        orphan_b = counts[1] != counts[2]

        if orphan_a and orphan_b:
            print(min(pair_a, pair_b))
        elif orphan_a:
            print(pair_a)
        elif orphan_b:
            print(pair_b)
        else:
            print(pair_a + pair_b)


solve()
```

### 易错点

- 严格区分题面中的“严格大于/不小于”、开闭区间与下标起点。
- 多组测试时必须重置状态；大规模累加按题面需要使用 Python 整数或取模。

### 复杂度分析

**时间复杂度**：$O(n)$，遍历数组统计余数。
**空间复杂度**：$O(1)$，只用 4 个计数变量。

---

## 03 · 奇数频次最小值 {#problem-03}

### 题目描述

有一组整数数据，数和数之间使用空格隔开，编写一个 Python ACM 程序，找出这组数中出现次数为奇数的最小数。如果没有任何数出现奇数次，则输出 `none`。

### 样例

**输入**

```
3 2 3 2 1 1 1
```

**输出**

```
1
```

### 解题思路

用 `Counter` 一次统计每个整数的出现次数，再筛出次数为奇数的键并取最小值；候选集合为空时输出 `none`。

**正确性依据**：计数表完整记录了每个输入值的出现次数，筛选条件与题意等价；对所有合格值取 `min`，得到的就是数值意义下最小的奇数频次元素。

### Python ACM 实现

下面给出完整标准输入、标准输出程序，可直接在 Python 3 ACM 环境运行。

```python
import sys
from collections import Counter


def solve():
    numbers = list(map(int, sys.stdin.buffer.read().split()))
    counts = Counter(numbers)
    odd_numbers = [value for value, count in counts.items() if count % 2 == 1]
    # min 的比较是数值比较，不是字符串字典序。
    print(min(odd_numbers) if odd_numbers else "none")


solve()
```

### 易错点

- 严格区分题面中的“严格大于/不小于”、开闭区间与下标起点。
- 多组测试时必须重置状态；大规模累加按题面需要使用 Python 整数或取模。

### 复杂度分析

**时间复杂度**：$O(n \log n)$，排序为主要开销。
**空间复杂度**：$O(n)$，存储中间数据。

---

## 小结

- 第一题是 SQL 基本功考察，核心是 INNER JOIN + GROUP BY + CASE WHEN 内嵌聚合函数的组合运用。注意"超过150%"意味着 `MAX(price) > base_price * 1.5`，以及用左闭右开区间处理时间范围
- 第二题是博弈分析，关键洞察是 $(x + y) \bmod 4 = 3$ 只取决于余数，将元素按余数分为 (0,3) 和 (1,2) 两组，然后根据孤儿元素的分布情况分三种局面讨论
- 第三题是 Shell 管道编程的签到题，`tr | sort -n | uniq -c | awk` 是处理"统计并筛选"类问题的经典组合，注意在 awk 中处理无结果时输出 `none`
