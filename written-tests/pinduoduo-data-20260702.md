---
pageClass: exam-session-page
title: 拼多多暑期实习 · 数据岗 2026-07-02
description: 拼多多 2026-07-02 暑期实习 · 数据岗笔试真题，含 3 道 Python ACM 模式题解
---

<div class="exam-session-banner">
  <div>
    <span>PINDUODUO / 2026.07.02 / ACM</span>
    <strong>拼多多 · 暑期实习 · 数据岗</strong>
    <small>2026-07-02 · 3 题 ACM · 难度 简单到中等</small>
  </div>
  <div class="exam-session-banner__meta">
    <span>各品类商品定价区间统计</span>
    <span>新商家前3单广告激励金统计</span>
    <span>用户会员等级升级日期与天数统计</span>
  </div>
</div>

# 拼多多 2026-07-02 暑期实习 · 数据岗笔试解析

本场仅整理需要编程实现的题目，并统一为完整 Python ACM 程序。每题保留标准输入输出、建模过程、正确性依据、复杂度、易错点和关键中文注释；数据岗原 SQL 题也补充了等价的 Python 标准输入输出版本。

来源：[Zero2Leetcode · 拼多多 2026-07-02 暑期实习 · 数据岗](https://onefly.top/zero2Leetcode/04_real_interviews/pinduoduo/data-20260702/)。

## 本场考试概述

**考试时间**：2026年7月2日
**考试岗位**：数据岗（数据分析／数据开发）
**难度评级**：简单到中等

**考点分析**：

1. 第一题：各品类商品定价区间统计——LEFT JOIN 连表（难度简单）
2. 第二题：新商家前3单广告激励金统计——ROW_NUMBER 分组 TopN（难度中等）
3. 第三题：用户会员等级升级日期与天数统计——窗口函数累计求和（难度中等）

**建议策略**：

1. 三题都围绕「主表要全保留 + 分组聚合」，`LEFT JOIN` 保空组、`COUNT(列名)` 数真实值是通用套路
2. 第二三题用窗口函数：`ROW_NUMBER()` 分组叫号取 TopN、`SUM() OVER()` 累计求首次达标日，把 `PARTITION BY / ORDER BY` 填空模板练熟即可
3. 注意空组处理：没有商品的品类用 `COUNT(列名)` 得 0，不要用 `COUNT(*)`；不够 3 单的商家跨越天数填 NULL

---

## 01 · 各品类商品定价区间统计 {#problem-01}

### 题目描述

**Python ACM 输入输出约定**：第一行输入品类数 `C` 和商品数 `G`。接下来 `C` 行为 `category_id category_name`，再接下来 `G` 行为 `goods_id category_id price`。名称不含空格。每行输出一个品类的名称、商品数、最高价、最低价和平均价；空品类的三个价格字段输出 `NULL`。

统计每个品类的商品总数、最高售价、最低售价、平均售价。没有商品的品类也要展示（商品总数为 0，售价字段为 NULL）。平均售价四舍五入保留 2 位小数，结果按品类名称字典序升序排列。

**表结构**：
- `c21_pdd_category`：品类表（category_id, category_name）
- `c21_pdd_goods`：商品表（goods_id, goods_name, category_id, price）

### 样例

**输入**

```text
4 6
C1 数码
C2 服饰
C3 图书
C4 家居
G1 C1 3999
G2 C1 299
G3 C1 19.9
G4 C2 89
G5 C2 219
G6 C3 45.5
```

**输出**

```text
图书 1 45.50 45.50 45.50
家居 0 NULL NULL NULL
数码 3 3999.00 19.90 1439.30
服饰 2 219.00 89.00 154.00
```

### 解题思路

**从表查询到 ACM 程序**：在 Python ACM 中，用字典保存品类主表，再扫描商品完成分组聚合；这与 SQL 的 `LEFT JOIN + GROUP BY` 等价，关键是先创建所有品类的空统计桶。

**第一步：为什么用 LEFT JOIN**

如果用普通 JOIN，"家居"这个没有商品的品类在商品表里找不到对应行，整行被丢掉——结果里看不到它。改用 LEFT JOIN，品类表每行都保留，商品表没对应的填 NULL。

**第二步：COUNT(列名) vs COUNT(\*)**

家居那行虽然商品是空的，行却还在。`COUNT(*)` 会把它数成 1；而 `COUNT(g.goods_id)` 只数真实存在的值，家居正好得 0。

**第三步：聚合函数遇到全 NULL**

MAX、MIN、AVG 对全 NULL 的分组自动返回 NULL，无需额外处理。

### Python ACM 实现

下面给出完整标准输入、标准输出程序，可直接在 Python 3 ACM 环境运行。

```python
import sys
from decimal import Decimal, ROUND_HALF_UP


def money(value):
    """按财务口径四舍五入到两位小数。"""
    return str(value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def solve():
    input = sys.stdin.readline
    category_count, goods_count = map(int, input().split())
    categories = {}
    for _ in range(category_count):
        category_id, name = input().split()
        # 预建空桶，保证没有商品的品类仍会输出。
        categories[category_id] = {"name": name, "prices": []}

    for _ in range(goods_count):
        _, category_id, raw_price = input().split()
        categories[category_id]["prices"].append(Decimal(raw_price))

    rows = sorted(categories.values(), key=lambda item: item["name"])
    for item in rows:
        prices = item["prices"]
        if not prices:
            print(item["name"], 0, "NULL", "NULL", "NULL")
            continue
        average = sum(prices, Decimal(0)) / len(prices)
        print(
            item["name"],
            len(prices),
            money(max(prices)),
            money(min(prices)),
            money(average),
        )


solve()
```

### 复杂度分析

**时间复杂度**：$O(n)$，$n$ 为商品总数，一次扫描即可完成连接与聚合。
**空间复杂度**：$O(m)$，$m$ 为品类数，存储分组结果。

---

## 02 · 新商家前3单广告激励金统计 {#problem-02}

### 题目描述

**Python ACM 输入输出约定**：第一行输入商家数 `S` 和订单数 `O`。接下来 `S` 行为 `seller_id seller_name`，再接下来 `O` 行为 `order_id seller_id YYYY-MM-DD status`，其中 `status` 为 `completed` 或 `refunded`。输出至少有一笔有效订单的商家、奖金总额和首单到第三单的天数；不足三单输出 `NULL`。

"新商家前 3 单广告激励金"规则：第 1 单奖 100 元、第 2 单奖 80 元、第 3 单奖 50 元。退款订单（status='refunded'）不计入、不参与排序。统计每个商家的激励金总额和从第 1 单到第 3 单的跨越天数。

- 只统计至少有 1 单有效订单的商家
- 有效订单不足 3 单时跨越天数为 NULL
- 结果按激励金降序，总额相同按商家名称字典序升序

**表结构**：
- `c21_pdd_seller`：商家表（seller_id, seller_name）
- `c21_pdd_seller_order`：订单表（order_id, seller_id, order_time, amount, status）

### 样例

**输入**

```text
5 10
S1 优选生鲜
S2 百味小吃
S3 潮流服饰
S4 数码优品
S5 居家优选
O1 S1 2026-01-01 completed
O2 S1 2026-01-03 refunded
O3 S1 2026-01-04 completed
O4 S1 2026-01-06 completed
O5 S2 2026-02-01 completed
O6 S2 2026-02-01 completed
O7 S2 2026-02-04 completed
O8 S3 2026-03-01 completed
O9 S3 2026-03-05 completed
O10 S4 2026-04-01 completed
```

**输出**

```text
优选生鲜 230 5
百味小吃 230 3
潮流服饰 180 NULL
数码优品 100 NULL
```

### 解题思路

**从表查询到 ACM 程序**：在 Python ACM 中，先过滤退款单，再按 `(日期, 订单号)` 排序。每个商家的前三笔有效订单分别贡献 100、80、50 元，等价于 `ROW_NUMBER()` 后的条件聚合。

**第一步：先剔除退款，再叫号**

退款单不参与排序——必须在 `ROW_NUMBER()` 之前用 `WHERE status='completed'` 过滤。如果退款单参与叫号，它会占掉号码，"第 1 单"可能变成退款单。

**第二步：用 ROW_NUMBER 给有效订单编号**

按商家分组，按下单时间排序，每个商家的有效订单从 1 开始编号。同一天有多单时补个 `order_id` 作为第二排序键，避免名次飘忽。

**第三步：取前 3 号，名次换钱**

`CASE rn WHEN 1 THEN 100 WHEN 2 THEN 80 WHEN 3 THEN 50 END` 再 SUM，就是激励金总额。跨越天数用 `TIMESTAMPDIFF(DAY, 第1单时间, 第3单时间)`，不够 3 单给 NULL。

### Python ACM 实现

下面给出完整标准输入、标准输出程序，可直接在 Python 3 ACM 环境运行。

```python
import sys
from collections import defaultdict
from datetime import date


def solve():
    input = sys.stdin.readline
    seller_count, order_count = map(int, input().split())
    seller_names = {}
    for _ in range(seller_count):
        seller_id, name = input().split()
        seller_names[seller_id] = name

    valid_orders = defaultdict(list)
    for _ in range(order_count):
        order_id, seller_id, order_date, status = input().split()
        # 退款订单既不计奖，也不能占据“前 3 单”的名次。
        if status == "completed":
            valid_orders[seller_id].append((order_date, order_id))

    bonuses = [100, 80, 50]
    rows = []
    for seller_id, orders in valid_orders.items():
        orders.sort()
        first_three = orders[:3]
        total_bonus = sum(bonuses[:len(first_three)])
        span = "NULL"
        if len(first_three) == 3:
            first_day = date.fromisoformat(first_three[0][0])
            third_day = date.fromisoformat(first_three[2][0])
            span = str((third_day - first_day).days)
        rows.append((seller_names[seller_id], total_bonus, span))

    rows.sort(key=lambda item: (-item[1], item[0]))
    for name, bonus, span in rows:
        print(name, bonus, span)


solve()
```

### 复杂度分析

**时间复杂度**：$O(n \log n)$，窗口函数需要按商家分组排序。
**空间复杂度**：$O(n)$，存储中间排序结果。

---

## 03 · 用户会员等级升级日期与天数统计 {#problem-03}

### 题目描述

**Python ACM 输入输出约定**：第一行输入用户数 `U` 和订单数 `O`。接下来 `U` 行为 `user_id register_date`，再接下来 `O` 行为 `order_id user_id order_date amount`。按用户 ID 输出银卡、金卡、钻石首次达标日，以及三个阶段的天数；未达标字段输出 `NULL`。

会员等级由累计消费决定：累计 1000 元升银卡、5000 元升金卡、20000 元升钻石。累计额首次达到门槛的当天即升级。统计每位用户达到各等级的日期，以及注册→银卡、银卡→金卡、金卡→钻石各阶段天数。

- 未达门槛的日期和天数为 NULL
- 每位用户都要输出（无订单也要展示）
- 按用户 ID 升序排列

**表结构**：
- `c21_pdd_member`：用户表（user_id, register_date）
- `c21_pdd_member_order`：订单表（order_id, user_id, order_date, amount）

### 样例

**输入**

```text
4 9
U01 2026-01-01
U02 2026-02-01
U03 2026-03-01
U04 2026-04-01
O1 U01 2026-01-05 600
O2 U01 2026-01-10 500
O3 U01 2026-02-01 4000
O4 U01 2026-03-01 15000
O5 U02 2026-02-10 1200
O6 U02 2026-02-20 4000
O7 U02 2026-03-15 3000
O8 U03 2026-03-05 300
O9 U03 2026-03-06 400
```

**输出**

```text
U01 2026-01-10 2026-02-01 2026-03-01 9 22 28
U02 2026-02-10 2026-02-20 NULL 9 10 NULL
U03 NULL NULL NULL NULL NULL NULL
U04 NULL NULL NULL NULL NULL NULL
```

### 解题思路

**从表查询到 ACM 程序**：在 Python ACM 中，先按用户和日期合并同日订单，再按日期累加。累计额第一次跨过 1000、5000、20000 时记录日期，等价于窗口累计和后的 `MIN(CASE WHEN ...)`。

**第一步：按天累加消费**

同一天可能多笔订单，先按 `(user_id, order_date)` 合并成日级汇总，再用窗口函数 `SUM(day_amt) OVER (PARTITION BY user_id ORDER BY order_date)` 做累计求和。累计只增不减（消费不可能为负），这是后续逻辑成立的前提。

**第二步：取首次达标日**

因为累计只增不减，一旦够线后面天天都够。所以 `MIN(CASE WHEN running_total >= 门槛 THEN order_date END)` 就能挑出满足条件的最早日期。

**第三步：LEFT JOIN 保留无订单用户**

U04 一单都没下，前面几步根本没有它的行。以用户表为主做 LEFT JOIN 把它捞回来，整行自动填 NULL。天数用 `DATEDIFF`，遇到 NULL 自动返回 NULL。

### Python ACM 实现

下面给出完整标准输入、标准输出程序，可直接在 Python 3 ACM 环境运行。

```python
# 核心步骤：用户会员等级升级日期与天数统计；按题面读取标准输入并输出唯一结果。
import sys
from collections import defaultdict
from datetime import date
from decimal import Decimal


def days_between(later, earlier):
    if later is None or earlier is None:
        return "NULL"
    return str((date.fromisoformat(later) - date.fromisoformat(earlier)).days)


def solve():
    input = sys.stdin.readline
    user_count, order_count = map(int, input().split())
    register_date = {}
    for _ in range(user_count):
        user_id, registered = input().split()
        register_date[user_id] = registered

    daily_amount = defaultdict(lambda: defaultdict(Decimal))
    for _ in range(order_count):
        _, user_id, order_date, raw_amount = input().split()
        daily_amount[user_id][order_date] += Decimal(raw_amount)

    thresholds = [Decimal("1000"), Decimal("5000"), Decimal("20000")]
    for user_id in sorted(register_date):
        reached = [None, None, None]
        running_total = Decimal(0)
        for order_date in sorted(daily_amount[user_id]):
            running_total += daily_amount[user_id][order_date]
            for index, threshold in enumerate(thresholds):
                if reached[index] is None and running_total >= threshold:
                    reached[index] = order_date

        dates = [value or "NULL" for value in reached]
        durations = [
            days_between(reached[0], register_date[user_id]),
            days_between(reached[1], reached[0]),
            days_between(reached[2], reached[1]),
        ]
        print(user_id, *dates, *durations)


solve()
```

### 复杂度分析

**时间复杂度**：$O(n \log n)$，窗口函数累计求和需排序。
**空间复杂度**：$O(n)$，存储日级汇总和累计结果。

---

## 小结

- 第一题是 LEFT JOIN 的经典应用，核心是 `COUNT(列名)` 区分空组和 `COUNT(*)`
- 第二题考查 ROW_NUMBER 分组 TopN 模式，关键是退款要在叫号之前过滤，排序键要唯一
- 第三题用窗口函数做累计求和，再利用"累计只增不减"的性质用 MIN + CASE WHEN 取首次达标日
