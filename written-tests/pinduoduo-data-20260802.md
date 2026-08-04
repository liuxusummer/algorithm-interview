---
pageClass: exam-session-page
title: 拼多多秋招 · SQL 数据岗 2026-08-02
description: 拼多多 2026-08-02 数据分析与数据开发方向 SQL 笔试题，含完整题面、MySQL 8.0 题解与 Python ACM 等价实现
---

<div class="exam-session-banner">
  <div>
    <span>PINDUODUO / 2026.08.02 / SQL</span>
    <strong>拼多多 · 秋招 · 数据分析 / 数据开发岗</strong>
    <small>2026-08-02 · 3 题 SQL · 难度 中等偏上</small>
  </div>
  <div class="exam-session-banner__meta">
    <span>分组 TopN 与 ROW_NUMBER</span>
    <span>月度环比与 LAG</span>
    <span>RFM 聚合与 CASE WHEN</span>
  </div>
</div>

# 拼多多 2026-08-02 秋招 · SQL 数据岗笔试解析

本场面向数据分析与数据开发方向，三道题均为 SQL 查询题。正文以 MySQL 8.0 为主要作答语言，同时给出等价的 Python 3 ACM 程序，便于在没有数据库环境时复现样例、验证边界并理解窗口函数背后的数据处理过程。

> 资料说明：本场根据用户提供的公开资料长截图整理，截图署名为 `ak_coding`。题目表结构与样例数据按截图核对，讲解、SQL 边界处理与 Python 实现由本站重新编写。

## 本场考试概述

| 题号 | 题目 | 核心知识点 | 难度 |
|---|---|---|---|
| 01 | 各品类销售额最高商品 | 分组 TopN、`ROW_NUMBER()`、稳定排序 | 中等 |
| 02 | 月度 GMV 环比增长率 | 月度聚合、`LAG()`、时间排序 | 困难 |
| 03 | RFM 用户分层 | 分组聚合、指标打分、`CASE WHEN` | 困难 |

三题的共同主线是“先统一数据粒度，再做排名、比较或分类”：第一题先在品类内编号，第二题先汇总到月份，第三题先汇总到用户。窗口函数或条件表达式只是工具，真正决定查询是否正确的是中间表的一行代表什么。

---

## 01 · 各品类销售额最高商品 {#problem-01}

### 题目描述

某电商平台有一张商品销售记录表，每一行表示一笔商品销售记录。请查询每个品类中销售额 `sale_amount` 最高的那条记录，输出品类名称、商品名称和销售额。

如果同一品类存在多条并列最高记录，选择 `id` 较小的一条。最终结果按 `category_name` 升序排列。

返回字段：`category_name`、`product_name`、`sale_amount`。

### 表结构

表名：`c21_pdd_product_sales`

| 列名 | 类型 | 说明 |
|---|---|---|
| `id` | `INT` | 记录 ID，主键 |
| `product_name` | `VARCHAR(50)` | 商品名称 |
| `category_name` | `VARCHAR(50)` | 品类名称 |
| `sale_date` | `DATE` | 销售日期 |
| `sale_amount` | `DECIMAL(10,2)` | 销售额 |

### Python ACM 输入输出约定

第一行输入记录数 $n$。接下来 $n$ 行依次输入 `id product_name category_name sale_date sale_amount`，名称不包含空格。

每个品类输出一行 `category_name product_name sale_amount`，金额保留两位小数，结果按品类名称升序排列。

### 样例

**输入**

```text
7
1 手机A 电子 2024-01-01 5000.00
2 手机B 电子 2024-01-02 7000.00
3 相机C 电子 2024-01-03 7000.00
4 T恤A 服饰 2024-01-01 300.00
5 外套B 服饰 2024-01-05 900.00
6 零食A 食品 2024-02-01 150.00
7 零食B 食品 2024-02-02 150.00
```

**输出**

```text
服饰 外套B 900.00
电子 手机B 7000.00
食品 零食A 150.00
```

### 解题思路

#### 1. 为什么不能直接 `GROUP BY`

`MAX(sale_amount)` 能求出每个品类的最高金额，却不能可靠地返回产生这个金额的 `product_name`。如果把未聚合的商品名直接放进查询，在开启 `ONLY_FULL_GROUP_BY` 时会报错；关闭该模式时也只会得到不确定的一行。

本题不仅要最高金额，还规定并列时选 `id` 最小者，因此需要给品类内的每一条记录建立完整顺序。

#### 2. 用窗口函数做分组 TopN

按照 `category_name` 分区，在每个分区内按以下优先级排序：

1. `sale_amount DESC`：销售额大的排在前面；
2. `id ASC`：销售额相同时，ID 小的排在前面。

`ROW_NUMBER()` 会强制给并列记录不同编号，所以每个品类恰好有一条 `rn = 1`。如果误用 `RANK()`，并列最高的两条记录都会得到排名 $1$，最终会输出多行。

#### 3. 外层过滤窗口结果

MySQL 的逻辑执行顺序中，窗口函数晚于当前层的 `WHERE`，不能在同一层直接写 `WHERE ROW_NUMBER() ... = 1`。应先在 CTE 或派生表中计算 `rn`，再由外层查询过滤。

### MySQL 8.0 实现

```sql
WITH ranked AS (
    SELECT
        id,
        product_name,
        category_name,
        sale_amount,
        ROW_NUMBER() OVER (
            PARTITION BY category_name
            ORDER BY sale_amount DESC, id ASC
        ) AS rn
    FROM c21_pdd_product_sales
)
SELECT
    category_name,
    product_name,
    sale_amount
FROM ranked
WHERE rn = 1
ORDER BY category_name ASC;
```

### 正确性说明

对任意品类，窗口排序首先让销售额最大的记录排在最前；若最高金额出现多次，第二排序键又让其中 ID 最小者排在最前。因此该记录的 `rn` 必为 $1$，其余记录的 `rn` 均大于 $1$。外层保留 `rn = 1`，恰好得到每个品类唯一且符合题意的记录。

### Python 3 ACM 等价实现

```python
import sys
from decimal import Decimal


def money(value):
    return f"{value:.2f}"


def solve():
    input = sys.stdin.readline
    record_count = int(input())
    best_by_category = {}

    for _ in range(record_count):
        raw_id, product, category, _, raw_amount = input().split()
        record_id = int(raw_id)
        amount = Decimal(raw_amount)

        current = best_by_category.get(category)
        # 金额更大时替换；金额相等时保留 ID 更小的记录。
        if current is None or amount > current[0] or (
            amount == current[0] and record_id < current[1]
        ):
            best_by_category[category] = (amount, record_id, product)

    for category in sorted(best_by_category):
        amount, _, product = best_by_category[category]
        print(category, product, money(amount))


solve()
```

### 复杂度分析

- SQL：窗口函数通常需要按 `(category_name, sale_amount, id)` 排序，时间复杂度约为 $O(n\log n)$，中间结果空间为 $O(n)$。
- Python：扫描为 $O(n)$，对 $c$ 个品类名称排序为 $O(c\log c)$；空间复杂度为 $O(c)$。

### 易错点

- 不要通过 `GROUP BY category_name` 随意选取 `product_name`。
- 并列最高时必须使用 `id ASC` 作为第二排序键。
- 本题要求每组严格一行，应使用 `ROW_NUMBER()`，不是 `RANK()`。
- 窗口函数结果需要在外层查询过滤。

---

## 02 · 月度 GMV 环比增长率 {#problem-02}

### 题目描述

某电商平台有一张订单表，每行记录一笔订单。请按月统计 GMV，即当月全部订单金额之和，并计算与“上一个实际出现数据的月份”相比的环比增长率：

$$
growth\_rate
=
\frac{monthly\_gmv-prev\_month\_gmv}{prev\_month\_gmv}
\times 100
$$

环比增长率以百分比表示并保留两位小数。第一个有数据的月份没有上一行，`prev_month_gmv` 和 `growth_rate` 均为 `NULL`。

特别注意：数据中的月份可能不连续。例如只出现 1 月和 3 月时，3 月应与结果集上一行的 1 月比较，而不是补出一个 GMV 为 $0$ 的 2 月。

结果按月份升序排列，返回字段：`y_mth`、`monthly_gmv`、`prev_month_gmv`、`growth_rate`。

### 表结构

表名：`c21_pdd_gmv_orders`

| 列名 | 类型 | 说明 |
|---|---|---|
| `order_id` | `INT` | 订单 ID，主键 |
| `order_date` | `DATE` | 下单日期 |
| `amount` | `DECIMAL(10,2)` | 订单金额 |

### Python ACM 输入输出约定

第一行输入订单数 $n$。接下来 $n$ 行输入 `order_id order_date amount`。

每个实际出现的月份输出一行 `y_mth monthly_gmv prev_month_gmv growth_rate`。无法计算的字段输出 `NULL`，其余数值保留两位小数。

### 样例

**输入**

```text
8
1 2024-01-05 500.00
2 2024-01-20 500.00
3 2024-03-02 900.00
4 2024-03-18 600.00
5 2024-04-10 1200.00
6 2024-12-25 1200.00
7 2025-01-08 1000.00
8 2025-01-30 800.00
```

**输出**

```text
2024-01 1000.00 NULL NULL
2024-03 1500.00 1000.00 50.00
2024-04 1200.00 1500.00 -20.00
2024-12 1200.00 1200.00 0.00
2025-01 1800.00 1200.00 50.00
```

### 解题思路

#### 1. 先统一到“一个月一行”

原表是一笔订单一行，环比却要求月份之间比较。第一层查询使用 `DATE_FORMAT(order_date, '%Y-%m')` 截取年月，再按年月分组求 `SUM(amount)`。

必须先聚合再使用 `LAG()`。如果直接在订单明细上取上一行，得到的是上一笔订单金额，而不是上个月 GMV。

#### 2. 用 `LAG()` 取结果集上一月

对月表按照 `y_mth` 升序排列，`LAG(monthly_gmv)` 就能把上一行的 GMV 拉到当前行。

这里的“上一月”是**按时间排序后上一个有数据的月份**。`LAG()` 不会自动补齐缺失月份，恰好符合题目要求。`'%Y-%m'` 是零补齐格式，字符串顺序与年月顺序一致，也能正确跨年。

#### 3. 计算增长率并防止除零

第一行的 `prev_month_gmv` 为 `NULL`，参与运算后增长率自然也是 `NULL`。如果上一月 GMV 恰好为 $0$，增长率在数学上没有定义，使用 `NULLIF(prev_month_gmv, 0)` 避免除零，并返回 `NULL`。

### MySQL 8.0 实现

```sql
WITH monthly AS (
    SELECT
        DATE_FORMAT(order_date, '%Y-%m') AS y_mth,
        SUM(amount) AS monthly_gmv
    FROM c21_pdd_gmv_orders
    GROUP BY DATE_FORMAT(order_date, '%Y-%m')
),
with_previous AS (
    SELECT
        y_mth,
        monthly_gmv,
        LAG(monthly_gmv) OVER (ORDER BY y_mth) AS prev_month_gmv
    FROM monthly
)
SELECT
    y_mth,
    monthly_gmv,
    prev_month_gmv,
    ROUND(
        (monthly_gmv - prev_month_gmv)
        / NULLIF(prev_month_gmv, 0) * 100,
        2
    ) AS growth_rate
FROM with_previous
ORDER BY y_mth ASC;
```

### 正确性说明

`monthly` 保证每个实际出现的月份恰好一行，`monthly_gmv` 等于该月全部订单金额之和。`with_previous` 按时间顺序将上一行月度 GMV复制到当前行，所以每个非首月都拿到题目定义的比较基准。最后严格代入环比公式并保留两位小数，所得每行四个字段均符合定义。

### Python 3 ACM 等价实现

```python
import sys
from collections import defaultdict
from decimal import Decimal, ROUND_HALF_UP


def two_decimals(value):
    return str(value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def solve():
    input = sys.stdin.readline
    order_count = int(input())
    monthly = defaultdict(Decimal)

    for _ in range(order_count):
        _, order_date, raw_amount = input().split()
        # YYYY-MM-DD 的前 7 位就是可直接排序的 YYYY-MM。
        monthly[order_date[:7]] += Decimal(raw_amount)

    previous = None
    for month in sorted(monthly):
        current = monthly[month]
        if previous is None:
            print(month, two_decimals(current), "NULL", "NULL")
        elif previous == 0:
            print(month, two_decimals(current), two_decimals(previous), "NULL")
        else:
            growth = (current - previous) / previous * Decimal(100)
            print(
                month,
                two_decimals(current),
                two_decimals(previous),
                two_decimals(growth),
            )
        previous = current


solve()
```

### 复杂度分析

设订单数为 $n$、实际月份数为 $m$：

- SQL：分组与窗口排序通常为 $O(n+m\log m)$，中间月表空间为 $O(m)$。
- Python：聚合为 $O(n)$，月份排序为 $O(m\log m)$，空间复杂度为 $O(m)$。

### 易错点

- `LAG()` 必须作用在月度汇总结果上，不能作用在订单明细上。
- 不需要补齐缺失月份；3 月可以直接与上一行的 1 月比较。
- 月份格式应为 `%Y-%m`，避免不补零造成错误的字符串排序。
- 第一个月和上一月 GMV 为零时，增长率应输出 `NULL`。

---

## 03 · RFM 用户分层 {#problem-03}

### 题目描述

某电商平台有一张订单表，每行记录一笔订单。请基于 RFM 模型对用户进行分层：

- `R`（Recency）：最近一次下单日期不早于 `2024-10-01` 时得 $1$ 分，否则得 $0$ 分；
- `F`（Frequency）：累计订单数不少于 $3$ 次时得 $1$ 分，否则得 $0$ 分；
- `M`（Monetary）：累计消费金额不少于 $1000$ 元时得 $1$ 分，否则得 $0$ 分。

按照三个分值组合标签：

| R/F/M | 用户标签 |
|---|---|
| `1/1/1` | 核心用户 |
| `1/0/0` | 新用户 |
| `0/1/1` | 流失风险用户 |
| `0/0/0` | 流失用户 |
| 其他组合 | 普通用户 |

结果按 `user_id` 升序排列，返回字段：`user_id`、`last_order_date`、`order_count`、`total_amount`、`rfm_segment`。

### 表结构

表名：`c21_pdd_rfm_orders`

| 列名 | 类型 | 说明 |
|---|---|---|
| `order_id` | `INT` | 订单 ID，主键 |
| `user_id` | `INT` | 用户 ID |
| `order_date` | `DATE` | 下单日期 |
| `amount` | `DECIMAL(10,2)` | 订单金额 |

### Python ACM 输入输出约定

第一行输入订单数 $n$。接下来 $n$ 行输入 `order_id user_id order_date amount`。

按用户 ID 升序输出五个字段，金额保留两位小数。

### 样例

**输入**

```text
14
1 101 2024-11-01 500.00
2 101 2024-11-15 600.00
3 101 2024-12-01 400.00
4 102 2024-12-01 200.00
5 103 2024-01-01 800.00
6 103 2024-03-01 500.00
7 103 2024-06-01 600.00
8 104 2024-01-15 100.00
9 105 2024-11-01 800.00
10 105 2024-11-20 900.00
11 106 2024-08-01 200.00
12 106 2024-09-01 200.00
13 106 2024-10-01 300.00
14 107 2024-05-01 1000.00
```

**输出**

```text
101 2024-12-01 3 1500.00 核心用户
102 2024-12-01 1 200.00 新用户
103 2024-06-01 3 1900.00 流失风险用户
104 2024-01-15 1 100.00 流失用户
105 2024-11-20 2 1700.00 普通用户
106 2024-10-01 3 700.00 普通用户
107 2024-05-01 1 1000.00 普通用户
```

### 解题思路

#### 1. 先把订单明细压缩为用户指标

RFM 的判断对象是用户，原始表的粒度却是订单。因此第一层查询按 `user_id` 分组：

- `MAX(order_date)` 得到最近一次下单日期；
- `COUNT(*)` 得到累计订单数；
- `SUM(amount)` 得到累计消费金额。

这一步结束后，每个用户恰好一行，后续不再需要读取订单明细。

#### 2. 把三个指标分别变成 0/1

按照题目给出的阈值分别计算 `r`、`f`、`m`。三个条件都是“取等号”的：日期、次数和金额正好等于阈值时都应得 $1$ 分。

把打分放在单独的 CTE 中，既便于检查边界，也能避免在最终标签表达式中重复书写聚合逻辑。

#### 3. 显式匹配四个标签，其余落入 `ELSE`

三个二进制指标共有 $2^3=8$ 种组合，题目只单独定义了其中四种。最终 `CASE` 必须提供 `ELSE '普通用户'`，否则另外四种组合会得到 `NULL`。

### MySQL 8.0 实现

```sql
WITH user_stats AS (
    SELECT
        user_id,
        MAX(order_date) AS last_order_date,
        COUNT(*) AS order_count,
        SUM(amount) AS total_amount
    FROM c21_pdd_rfm_orders
    GROUP BY user_id
),
scored AS (
    SELECT
        user_id,
        last_order_date,
        order_count,
        total_amount,
        CASE WHEN last_order_date >= '2024-10-01' THEN 1 ELSE 0 END AS r,
        CASE WHEN order_count >= 3 THEN 1 ELSE 0 END AS f,
        CASE WHEN total_amount >= 1000 THEN 1 ELSE 0 END AS m
    FROM user_stats
)
SELECT
    user_id,
    last_order_date,
    order_count,
    total_amount,
    CASE
        WHEN r = 1 AND f = 1 AND m = 1 THEN '核心用户'
        WHEN r = 1 AND f = 0 AND m = 0 THEN '新用户'
        WHEN r = 0 AND f = 1 AND m = 1 THEN '流失风险用户'
        WHEN r = 0 AND f = 0 AND m = 0 THEN '流失用户'
        ELSE '普通用户'
    END AS rfm_segment
FROM scored
ORDER BY user_id ASC;
```

### 正确性说明

`user_stats` 对每个用户准确计算 RFM 所需的三项原始指标；`scored` 按题目阈值逐项得到唯一的 0/1 分值；最终 `CASE` 对四个指定组合输出对应标签，并让所有其他组合进入“普通用户”。因此每个有订单的用户恰好输出一行，统计值和标签都与题目定义一致。

### Python 3 ACM 等价实现

```python
import sys
from collections import defaultdict
from decimal import Decimal


def money(value):
    return f"{value:.2f}"


def classify(last_date, order_count, total_amount):
    r = int(last_date >= "2024-10-01")
    f = int(order_count >= 3)
    m = int(total_amount >= Decimal("1000"))

    labels = {
        (1, 1, 1): "核心用户",
        (1, 0, 0): "新用户",
        (0, 1, 1): "流失风险用户",
        (0, 0, 0): "流失用户",
    }
    return labels.get((r, f, m), "普通用户")


def solve():
    input = sys.stdin.readline
    order_count = int(input())
    users = defaultdict(lambda: ["", 0, Decimal(0)])

    for _ in range(order_count):
        _, raw_user_id, order_date, raw_amount = input().split()
        user_id = int(raw_user_id)
        stats = users[user_id]
        stats[0] = max(stats[0], order_date)
        stats[1] += 1
        stats[2] += Decimal(raw_amount)

    for user_id in sorted(users):
        last_date, count, amount = users[user_id]
        print(
            user_id,
            last_date,
            count,
            money(amount),
            classify(last_date, count, amount),
        )


solve()
```

### 复杂度分析

设订单数为 $n$、用户数为 $u$：

- SQL：哈希聚合通常为 $O(n)$，最终用户排序为 $O(u\log u)$，中间结果空间为 $O(u)$。
- Python：扫描为 $O(n)$，用户排序为 $O(u\log u)$，空间复杂度为 $O(u)$。

### 易错点

- `R`、`F`、`M` 三个阈值都包含等号。
- 下单次数按题意使用 `COUNT(*)`；若业务口径要求按下单日期去重，才改成 `COUNT(DISTINCT order_date)`。
- 另外四种未单独命名的组合必须归入“普通用户”。
- 外层不能直接引用同一层刚计算出的别名 `r`、`f`、`m`，应使用 CTE 或再套一层查询。

---

## 本场复盘

1. 分组 TopN 的标准模板是“窗口编号后外层过滤”，并列处理规则必须写进窗口的 `ORDER BY`；
2. 环比、同比等时间指标要先聚合到目标时间粒度，再用 `LAG()` 或自连接比较；
3. 用户分层题要把“明细聚合、指标打分、标签映射”拆成三层，避免在一个超长表达式中混合粒度；
4. 所有 SQL 都应主动检查并列、缺失月份、除零、阈值取等和兜底分类。
