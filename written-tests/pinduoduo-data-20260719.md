---
pageClass: exam-session-page
title: 拼多多秋招 · 数据分析岗 2026-07-19
description: 拼多多 2026-07-19 秋招 · 数据分析岗笔试真题，含 3 道 Python ACM 模式题解
---

<div class="exam-session-banner">
  <div>
    <span>PINDUODUO / 2026.07.19 / ACM</span>
    <strong>拼多多 · 秋招 · 数据分析岗</strong>
    <small>2026-07-19 · 3 题 ACM · 难度 中等偏难</small>
  </div>
  <div class="exam-session-banner__meta">
    <span>`LEFT JOIN` 与分组聚合</span>
    <span>两级聚合与条件聚合</span>
    <span>窗口函数与分组孤岛</span>
  </div>
</div>

# 拼多多 2026-07-19 秋招 · 数据分析岗笔试解析

本场仅整理需要编程实现的题目，并统一为完整 Python ACM 程序。每题保留标准输入输出、建模过程、正确性依据、复杂度、易错点和关键中文注释；数据岗原 SQL 题也补充了等价的 Python 标准输入输出版本。

来源：[Zero2Leetcode · 拼多多 2026-07-19 秋招 · 数据分析岗](https://onefly.top/zero2Leetcode/04_real_interviews/pinduoduo/data-20260719/)。

## 本场考试概述

**考试时间**：2026年7月19日

**考试岗位**：数据分析岗

**考试方向**：SQL（MySQL 8.0）

**难度评级**：中等偏难

**考点分析**：

- 第一题：`LEFT JOIN` 与分组聚合（难度中等）
- 第二题：两级聚合与条件聚合（难度困难）
- 第三题：窗口函数与分组孤岛（难度困难）

**建议策略**：

- 第一题先抓住“未使用的优惠券也要展示”，以优惠券表为主表做左连接
- 第二题先把参团流水压缩到“一团一行”，再回到活动粒度统计成团率，避免混淆聚合层级
- 第三题先用 `LAG` 判断相邻调价记录是否降价，再用双行号之差划分连续区间

> 本文 SQL 按 MySQL 8.0 编写。第三题使用 CTE 和窗口函数，MySQL 5.7 无法直接执行。

---

## 01 · 优惠券使用情况统计 {#problem-01}

### 题目描述

**Python ACM 输入输出约定**：第一行输入优惠券数 `C` 和订单数 `O`。接下来 `C` 行为 `coupon_id coupon_name face_value`，再接下来 `O` 行为 `order_id coupon_id pay_amount`。按使用次数降序、优惠券 ID 升序输出五个字段。

某电商平台需要复盘优惠券投放效果。统计每种优惠券的使用次数、相关订单实付总金额和总优惠金额。没有被使用过的优惠券也必须展示，三个统计值均显示为 $0$。

- 使用次数：订单表中使用该优惠券的订单数
- 订单总金额：这些订单的 `pay_amount` 之和
- 总优惠金额：使用次数乘以优惠券面值
- 排序规则：使用次数降序，次数相同时按优惠券 ID 升序

返回字段：`coupon_id`、`coupon_name`、`use_count`、`total_order_amount`、`total_discount`。

**表结构**：

- `c21_pdd_coupon(coupon_id, coupon_name, face_value)`：全量优惠券表，`coupon_id` 为主键
- `c21_pdd_coupon_order(order_id, coupon_id, pay_amount)`：优惠券订单表，`order_id` 为主键

### 样例

**输入**

```text
4 7
CP001 满100减10 10
CP002 满200减30 30
CP003 新人立减5 5
CP004 会员专享15 15
OD001 CP001 90
OD002 CP001 190
OD003 CP001 90
OD004 CP002 170
OD005 CP002 270
OD006 CP002 170
OD007 CP003 45
```

**输出**

```text
CP001 满100减10 3 370.00 30.00
CP002 满200减30 3 610.00 90.00
CP003 新人立减5 1 45.00 5.00
CP004 会员专享15 0 0.00 0.00
```

### 解题思路

**从表查询到 ACM 程序**：在 Python ACM 中，先为每张优惠券建立计数和金额桶，再逐笔累加订单；预建空桶保证未使用优惠券也会被输出。

**第一步：从必须保留的表出发**

题目要求未使用的优惠券也出现。如果从订单表出发，或者使用普通内连接，像 `CP004` 这样没有关联订单的优惠券会直接消失。

因此必须以全量优惠券表为主表，使用 `LEFT JOIN` 连接订单表。没有订单时，优惠券这一行仍被保留，只是右表的字段为 `NULL`。

**第二步：正确统计使用次数**

左连接后，未使用优惠券也会产生一行结果，所以不能使用 `COUNT(*)`。它会把这行算进去，让使用次数错误地变成 $1$。

`COUNT(o.order_id)` 只统计非 `NULL` 的订单 ID。未使用优惠券对应的 `order_id` 为 `NULL`，因此计数自然为 $0$。

**第三步：处理空分组金额**

`SUM(o.pay_amount)` 对全是 `NULL` 的分组会返回 `NULL`。题目要求显示 $0$，需要使用 `COALESCE` 兜底。

总优惠金额直接用订单数乘以面值。查询最后按 `use_count` 降序、优惠券 ID 升序排序。

### Python ACM 实现

下面给出完整标准输入、标准输出程序，可直接在 Python 3 ACM 环境运行。

```python
# 核心步骤：`LEFT JOIN` 与分组聚合；按题面读取标准输入并输出唯一结果。
import sys
from decimal import Decimal, ROUND_HALF_UP


def money(value):
    return str(value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def solve():
    input = sys.stdin.readline
    coupon_count, order_count = map(int, input().split())
    coupons = {}
    for _ in range(coupon_count):
        coupon_id, name, raw_face_value = input().split()
        coupons[coupon_id] = {
            "name": name,
            "face": Decimal(raw_face_value),
            "count": 0,
            "amount": Decimal(0),
        }

    for _ in range(order_count):
        _, coupon_id, raw_amount = input().split()
        coupons[coupon_id]["count"] += 1
        coupons[coupon_id]["amount"] += Decimal(raw_amount)

    rows = sorted(
        coupons.items(),
        key=lambda item: (-item[1]["count"], item[0]),
    )
    for coupon_id, item in rows:
        total_discount = item["face"] * item["count"]
        print(
            coupon_id,
            item["name"],
            item["count"],
            money(item["amount"]),
            money(total_discount),
        )


solve()
```

### 复杂度分析

**时间复杂度**：典型哈希连接与哈希聚合下为 $O(C+O)$，其中 $C$ 是优惠券数，$O$ 是订单数。

**空间复杂度**：$O(C)$，用于保存优惠券粒度的分组结果。

---

## 02 · 拼团活动成团率统计 {#problem-02}

### 题目描述

**Python ACM 输入输出约定**：第一行输入活动数 `A`、团数 `G` 和支付记录数 `R`。接下来依次输入 `A` 行 `activity_id activity_name threshold`、`G` 行 `group_id activity_id`、`R` 行 `record_id group_id user_id pay_amount`。输出成团率大于 0 的前 5 个活动。

平台的每个拼团活动有一个成团门槛。一个活动可以发起多个团，每个团包含多条参团支付记录。团内去重用户数达到或超过活动门槛时，该团成团成功；否则拼团失败并退款。

统计成团率大于 $0$ 的前 $5$ 名活动：

- 发起团数：活动下不同 `group_id` 的数量
- 成团团数：去重参与用户数达到门槛的团数
- 成团率：成团团数除以发起团数，四舍五入保留两位小数
- 成团支付总金额：只累加成功团的全部支付流水，失败团不计入
- 排序规则：成团率降序，成团率相同时按活动 ID 升序

同一用户在同一团中出现多条记录时，人数只计算一次，但支付金额仍按支付流水逐条累加。

返回字段：`activity_id`、`activity_name`、`launch_count`、`success_count`、`success_rate`、`success_pay_amount`。

**表结构**：

- `c21_pdd_gb_activity(activity_id, activity_name, threshold_num)`：活动表
- `c21_pdd_gb_group(group_id, activity_id)`：团信息表
- `c21_pdd_gb_record(record_id, group_id, user_id, pay_amount)`：参团支付记录表

### 样例

以下按“团号: 去重人数/支付合计”压缩展示样例中的 $40$ 条参团记录。

**输入**

```text
3 6 11
A01 手机壳 2
A02 水果 3
A03 新人团 2
G01 A01
G02 A01
G03 A02
G04 A02
G05 A03
G06 A03
R01 G01 U01 19.9
R02 G01 U02 19.9
R03 G02 U03 19.9
R04 G03 U04 29.9
R05 G03 U05 29.9
R06 G03 U06 29.9
R07 G04 U07 29.9
R08 G04 U08 29.9
R09 G05 U09 9.9
R10 G05 U10 9.9
R11 G06 U11 9.9
```

**输出**

```text
A01 手机壳 2 1 0.50 39.80
A02 水果 2 1 0.50 89.70
A03 新人团 2 1 0.50 19.80
```

### 解题思路

**从表查询到 ACM 程序**：实现时先把每条支付流水压缩为“一团一行”，再汇总到活动层。分两级聚合可以避免把成员数、团数和支付金额混在同一粒度上。

**第一步：先确定统计粒度**

成团与否是在“团”这一层判断的，但原始记录是一条支付流水一行。如果直接在活动层连接三张表，同一个团会被展开成多行，发起团数、成团团数和金额很容易相互干扰。

先在 `group_stats` 中按 `group_id` 聚合，让每个团只保留一行，同时得到去重成员数和支付合计。这是整道题最关键的粒度转换。

**第二步：在团粒度判定是否成团**

团级中间表连接活动表后，每个团都能拿到对应的 `threshold_num`。使用 `CASE WHEN member_count >= threshold_num THEN ... END` 即可做条件聚合。发起团数直接用团级行数；满足门槛时给成团数贡献 $1$，并把该团的支付合计加入成功金额。

**第三步：回到活动粒度汇总**

按活动分组后计算发起团数、成团团数、成团率和成团金额。成团率显式转成 `DECIMAL(5,2)`，保证 `1` 以 `1.00` 的形式展示。

最后排除 `success_count = 0` 的活动，排序后取前 $5$ 名。样例中的 `A07` 并非完全失败，它的成团率约为 $0.33$，只是排在第 $6$ 名而被 `LIMIT 5` 截掉。

### Python ACM 实现

下面给出完整标准输入、标准输出程序，可直接在 Python 3 ACM 环境运行。

```python
import sys
from collections import defaultdict
from decimal import Decimal, ROUND_HALF_UP


def two_decimals(value):
    return str(value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def solve():
    input = sys.stdin.readline
    activity_count, group_count, record_count = map(int, input().split())
    activities = {}
    for _ in range(activity_count):
        activity_id, name, threshold = input().split()
        activities[activity_id] = (name, int(threshold))

    group_activity = {}
    groups_by_activity = defaultdict(list)
    for _ in range(group_count):
        group_id, activity_id = input().split()
        group_activity[group_id] = activity_id
        groups_by_activity[activity_id].append(group_id)

    members = defaultdict(set)
    pay_amount = defaultdict(Decimal)
    for _ in range(record_count):
        _, group_id, user_id, raw_amount = input().split()
        # 人数按用户去重，金额仍按每条支付流水累加。
        members[group_id].add(user_id)
        pay_amount[group_id] += Decimal(raw_amount)

    rows = []
    for activity_id, (name, threshold) in activities.items():
        group_ids = groups_by_activity[activity_id]
        if not group_ids:
            continue
        successful = [
            group_id
            for group_id in group_ids
            if len(members[group_id]) >= threshold
        ]
        if not successful:
            continue
        launch_count = len(group_ids)
        success_count = len(successful)
        rate = Decimal(success_count) / Decimal(launch_count)
        amount = sum((pay_amount[group_id] for group_id in successful), Decimal(0))
        rows.append((
            activity_id,
            name,
            launch_count,
            success_count,
            rate,
            amount,
        ))

    rows.sort(key=lambda item: (-item[4], item[0]))
    for row in rows[:5]:
        print(
            row[0],
            row[1],
            row[2],
            row[3],
            two_decimals(row[4]),
            two_decimals(row[5]),
        )


solve()
```

### 复杂度分析

**时间复杂度**：典型哈希聚合下为 $O(R+G+A\log A)$，其中 $R$ 是参团记录数，$G$ 是团数，$A$ 是活动数；排序发生在活动结果集上。

**空间复杂度**：$O(G+A)$，用于团级和活动级聚合结果。

---

## 03 · 商品连续降价预警 {#problem-03}

### 题目描述

**Python ACM 输入输出约定**：第一行输入商品数 `G` 和调价记录数 `P`。接下来 `G` 行为 `goods_id goods_name`，再接下来 `P` 行为 `goods_id YYYY-MM-DD price`。每个连续降价至少 3 次的区间输出一行。

平台需要监控商品价格异动。当某个商品连续降价达到 $3$ 次及以上时触发预警。一次降价指当前调价记录的价格严格小于该商品的上一条调价记录；持平或上涨都会打断连续区间。

这里的“连续”指相邻调价记录连续下降，不要求两个调价日期在自然日上相邻。

每个达标区间输出一行：

- 降价起始日：第一次下降前的上一调价日
- 降价结束日：该区间最后一次下降的调价日
- 降价次数：区间内连续下降的次数
- 总降价金额：起始价格减去结束价格

同一商品可能出现多个达标区间。结果按降价次数降序、商品 ID 升序排列；本文额外按起始日升序保证同商品同次数时结果稳定。

返回字段：`goods_id`、`goods_name`、`decline_start_date`、`decline_end_date`、`decline_count`、`total_drop`。

**表结构**：

- `c21_pdd_price_goods(goods_id, goods_name)`：商品信息表
- `c21_pdd_price_track(goods_id, price_date, price)`：调价记录表，`(goods_id, price_date)` 为联合主键

### 样例

**输入**

```text
3 18
G001 碎花连衣裙
G002 透气运动鞋
G003 降噪蓝牙耳机
G001 2026-06-01 200
G001 2026-06-02 180
G001 2026-06-03 160
G001 2026-06-04 150
G001 2026-06-05 130
G002 2026-06-01 300
G002 2026-06-02 280
G002 2026-06-03 260
G002 2026-06-04 250
G002 2026-06-05 270
G002 2026-06-06 260
G002 2026-06-07 250
G003 2026-06-01 100
G003 2026-06-02 90
G003 2026-06-03 90
G003 2026-06-04 80
G003 2026-06-05 70
G003 2026-06-06 60
```

**输出**

```text
G001 碎花连衣裙 2026-06-01 2026-06-05 4 70.00
G002 透气运动鞋 2026-06-01 2026-06-04 3 50.00
G003 降噪蓝牙耳机 2026-06-03 2026-06-06 3 30.00
```

### 解题思路

**从表查询到 ACM 程序**：Python 中按商品和日期排序后做一次线性扫描即可：下降则延长当前段，持平或上涨则结算并清空。起始日必须记录为第一次下降前的那条调价日。

**第一步：让每条记录看到上一条价格**

使用 `LAG` 按商品分区、按调价日期排序，取出 `previous_date` 和 `previous_price`。当前价格严格小于上一价格时，这一行才是降价记录。

先保留全部记录并编号十分重要。如果一开始就过滤出降价行，中间的持平或上涨记录会消失，两个本应断开的区间可能被错误拼在一起。

**第二步：用双行号之差划分连续区间**

给全部调价记录编号 `all_row_number`，再只对降价记录编号。对于没有被持平或上涨打断的一段连续降价，两套行号每次都同步加 $1$，二者之差保持不变。

以 `G005` 为例：

```
price_date | price | all_row_number | decline_row_number | segment_id
06-02      | 480   | 2              | 1                  | 1
06-03      | 450   | 3              | 2                  | 1
06-04      | 420   | 4              | 3                  | 1
06-05      | 400   | 5              | 4                  | 1
06-07      | 410   | 7              | 5                  | 2
06-08      | 390   | 8              | 6                  | 2
06-09      | 370   | 9              | 7                  | 2
```

`06-06` 的价格从 $400$ 回升到 $430$，它不是降价行，却让全量行号多前进了一步。因此之后的行号差从 $1$ 变成 $2$，新的连续段自然被分开。

**第三步：按区间聚合首尾信息**

按 `(goods_id, segment_id)` 分组：

- `COUNT(*)` 是降价次数
- `MIN(previous_date)` 是区间起始日
- `MAX(price_date)` 是区间结束日
- 区间严格递减，所以 `MAX(previous_price) - MIN(price)` 就是总降幅

最后使用 `HAVING COUNT(*) >= 3` 只保留达到预警门槛的区间。

### Python ACM 实现

下面给出完整标准输入、标准输出程序，可直接在 Python 3 ACM 环境运行。

```python
# 核心步骤：窗口函数与分组孤岛；按题面读取标准输入并输出唯一结果。
import sys
from collections import defaultdict
from decimal import Decimal, ROUND_HALF_UP


def money(value):
    return str(value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def solve():
    input = sys.stdin.readline
    goods_count, price_count = map(int, input().split())
    goods_names = {}
    for _ in range(goods_count):
        goods_id, name = input().split()
        goods_names[goods_id] = name

    tracks = defaultdict(list)
    for _ in range(price_count):
        goods_id, price_date, raw_price = input().split()
        tracks[goods_id].append((price_date, Decimal(raw_price)))

    segments = []
    for goods_id, records in tracks.items():
        records.sort()
        start_index = 0
        decline_count = 0

        def finish(end_index):
            if decline_count < 3:
                return
            start_date, start_price = records[start_index]
            end_date, end_price = records[end_index]
            segments.append((
                -decline_count,
                goods_id,
                start_date,
                end_date,
                start_price - end_price,
            ))

        for index in range(1, len(records)):
            if records[index][1] < records[index - 1][1]:
                if decline_count == 0:
                    start_index = index - 1
                decline_count += 1
            else:
                finish(index - 1)
                decline_count = 0
        finish(len(records) - 1)

    segments.sort(key=lambda item: (item[0], item[1], item[2]))
    for negative_count, goods_id, start_date, end_date, drop in segments:
        print(
            goods_id,
            goods_names[goods_id],
            start_date,
            end_date,
            -negative_count,
            money(drop),
        )


solve()
```

### 复杂度分析

**时间复杂度**：$O(P\log P)$，其中 $P$ 是调价记录数；窗口函数需要按商品和日期排序。

**空间复杂度**：$O(P)$，用于窗口排序和中间 CTE 结果。

---

## 小结

- 第一题用 `LEFT JOIN` 保留未使用优惠券，`COUNT(列名)` 与 `COALESCE` 分别处理空计数和空金额
- 第二题先把支付流水聚合到团粒度，再用条件聚合计算活动成团率，核心是始终明确当前统计粒度
- 第三题用 `LAG` 构造相邻比较，再用全量行号与降价行号的差值识别连续区间
