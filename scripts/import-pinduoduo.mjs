import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const sourceDirectory = process.argv[2]

if (!sourceDirectory) {
  throw new Error('请传入 Zero2Leetcode 的拼多多 Markdown 目录')
}

const projectRoot = path.resolve(import.meta.dirname, '..')
const outputDirectory = path.join(projectRoot, 'written-tests')
const files = (await readdir(sourceDirectory))
  .filter((file) => /^(algo|data|general)-\d{8}\.md$/.test(file))
  .sort()
const catalogSessions = []

const chineseOrdinals = {
  第一: '01',
  第二: '02',
  第三: '03',
  第四: '04'
}

const questionHeadingPattern = /^## (?:(第一|第二|第三|第四)题|第\s*([1-4])\s*题)：(.+)$/gm

const roleByStem = {
  'general-20260412': '暑期实习 · 通用岗',
  'general-20260426': '暑期实习 · 通用岗',
  'general-20260517': '暑期实习 · 通用岗',
  'data-20260702': '暑期实习 · 数据岗',
  'algo-20260702': '暑期实习 · 大模型算法岗',
  'general-20260719': '云弧计划提前批 · 通用岗',
  'data-20260719': '秋招 · 数据分析岗'
}

const decimalHelpers = `from decimal import Decimal, ROUND_HALF_UP


def money(value):
    """按财务口径四舍五入到两位小数。"""
    return str(value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))`

const dataAcmConfigs = {
  'data-20260702:01': {
    inputNote: '第一行输入品类数 `C` 和商品数 `G`。接下来 `C` 行为 `category_id category_name`，再接下来 `G` 行为 `goods_id category_id price`。名称不含空格。每行输出一个品类的名称、商品数、最高价、最低价和平均价；空品类的三个价格字段输出 `NULL`。',
    sampleInput: `4 6
C1 数码
C2 服饰
C3 图书
C4 家居
G1 C1 3999
G2 C1 299
G3 C1 19.9
G4 C2 89
G5 C2 219
G6 C3 45.5`,
    sampleOutput: `图书 1 45.50 45.50 45.50
家居 0 NULL NULL NULL
数码 3 3999.00 19.90 1439.30
服饰 2 219.00 89.00 154.00`,
    bridge: '在 Python ACM 中，用字典保存品类主表，再扫描商品完成分组聚合；这与 SQL 的 `LEFT JOIN + GROUP BY` 等价，关键是先创建所有品类的空统计桶。',
    code: `import sys
${decimalHelpers}


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


solve()`
  },
  'data-20260702:02': {
    inputNote: '第一行输入商家数 `S` 和订单数 `O`。接下来 `S` 行为 `seller_id seller_name`，再接下来 `O` 行为 `order_id seller_id YYYY-MM-DD status`，其中 `status` 为 `completed` 或 `refunded`。输出至少有一笔有效订单的商家、奖金总额和首单到第三单的天数；不足三单输出 `NULL`。',
    sampleInput: `5 10
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
O10 S4 2026-04-01 completed`,
    sampleOutput: `优选生鲜 230 5
百味小吃 230 3
潮流服饰 180 NULL
数码优品 100 NULL`,
    bridge: '在 Python ACM 中，先过滤退款单，再按 `(日期, 订单号)` 排序。每个商家的前三笔有效订单分别贡献 100、80、50 元，等价于 `ROW_NUMBER()` 后的条件聚合。',
    code: `import sys
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


solve()`
  },
  'data-20260702:03': {
    inputNote: '第一行输入用户数 `U` 和订单数 `O`。接下来 `U` 行为 `user_id register_date`，再接下来 `O` 行为 `order_id user_id order_date amount`。按用户 ID 输出银卡、金卡、钻石首次达标日，以及三个阶段的天数；未达标字段输出 `NULL`。',
    sampleInput: `4 9
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
O9 U03 2026-03-06 400`,
    sampleOutput: `U01 2026-01-10 2026-02-01 2026-03-01 9 22 28
U02 2026-02-10 2026-02-20 NULL 9 10 NULL
U03 NULL NULL NULL NULL NULL NULL
U04 NULL NULL NULL NULL NULL NULL`,
    bridge: '在 Python ACM 中，先按用户和日期合并同日订单，再按日期累加。累计额第一次跨过 1000、5000、20000 时记录日期，等价于窗口累计和后的 `MIN(CASE WHEN ...)`。',
    code: `import sys
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


solve()`
  },
  'data-20260719:01': {
    inputNote: '第一行输入优惠券数 `C` 和订单数 `O`。接下来 `C` 行为 `coupon_id coupon_name face_value`，再接下来 `O` 行为 `order_id coupon_id pay_amount`。按使用次数降序、优惠券 ID 升序输出五个字段。',
    sampleInput: `4 7
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
OD007 CP003 45`,
    sampleOutput: `CP001 满100减10 3 370.00 30.00
CP002 满200减30 3 610.00 90.00
CP003 新人立减5 1 45.00 5.00
CP004 会员专享15 0 0.00 0.00`,
    bridge: '在 Python ACM 中，先为每张优惠券建立计数和金额桶，再逐笔累加订单；预建空桶保证未使用优惠券也会被输出。',
    code: `import sys
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


solve()`
  },
  'data-20260719:02': {
    inputNote: '第一行输入活动数 `A`、团数 `G` 和支付记录数 `R`。接下来依次输入 `A` 行 `activity_id activity_name threshold`、`G` 行 `group_id activity_id`、`R` 行 `record_id group_id user_id pay_amount`。输出成团率大于 0 的前 5 个活动。',
    sampleInput: `3 6 11
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
R11 G06 U11 9.9`,
    sampleOutput: `A01 手机壳 2 1 0.50 39.80
A02 水果 2 1 0.50 89.70
A03 新人团 2 1 0.50 19.80`,
    bridge: '实现时先把每条支付流水压缩为“一团一行”，再汇总到活动层。分两级聚合可以避免把成员数、团数和支付金额混在同一粒度上。',
    code: `import sys
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


solve()`
  },
  'data-20260719:03': {
    inputNote: '第一行输入商品数 `G` 和调价记录数 `P`。接下来 `G` 行为 `goods_id goods_name`，再接下来 `P` 行为 `goods_id YYYY-MM-DD price`。每个连续降价至少 3 次的区间输出一行。',
    sampleInput: `3 18
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
G003 2026-06-06 60`,
    sampleOutput: `G001 碎花连衣裙 2026-06-01 2026-06-05 4 70.00
G002 透气运动鞋 2026-06-01 2026-06-04 3 50.00
G003 降噪蓝牙耳机 2026-06-03 2026-06-06 3 30.00`,
    bridge: 'Python 中按商品和日期排序后做一次线性扫描即可：下降则延长当前段，持平或上涨则结算并清空。起始日必须记录为第一次下降前的那条调价日。',
    code: `import sys
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


solve()`
  }
}

await mkdir(outputDirectory, { recursive: true })

function readFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n/)
  if (!match) return markdown
  return markdown.slice(match[0].length)
}

function normalizeDate(stem) {
  const match = stem.match(/(\d{4})(\d{2})(\d{2})$/)
  if (!match) throw new Error(`无法识别日期：${stem}`)
  return `${match[1]}-${match[2]}-${match[3]}`
}

function readDifficulty(body) {
  return body.match(/\*\*难度评级\*\*：([^\n]+)/)?.[1]?.trim() ?? '综合'
}

function readQuestions(body) {
  return [...body.matchAll(questionHeadingPattern)].map((match) => ({
    ordinal: match[1] ? chineseOrdinals[match[1]] : match[2].padStart(2, '0'),
    title: match[3].trim()
  }))
}

function readTopics(body, questions) {
  const topics = [...body.matchAll(
    /^(?:\d+\.|-)\s+(?:(?:第一|第二|第三|第四)题|第\s*[1-4]\s*题)：(.+?)(?:（难度[^）]*）)?$/gm
  )].map((match) => match[1].trim().split(/[—（]/)[0].trim())

  return topics.length >= questions.length
    ? topics.slice(0, questions.length)
    : questions.map((question) => question.title)
}

function replaceFirstTwoFences(section, sampleInput, sampleOutput) {
  let count = 0
  return section.replace(/```[^\n]*\n[\s\S]*?```/g, (fence) => {
    count += 1
    if (count === 1) return `\`\`\`text\n${sampleInput}\n\`\`\``
    if (count === 2) return `\`\`\`text\n${sampleOutput}\n\`\`\``
    return fence
  })
}

function adaptDataQuestion(section, stem, ordinal) {
  const config = dataAcmConfigs[`${stem}:${ordinal}`]
  if (!config) return section

  let normalized = replaceFirstTwoFences(
    section,
    config.sampleInput,
    config.sampleOutput
  )
  normalized = normalized
    .replace(
      '### 题目描述',
      `### 题目描述\n\n**Python ACM 输入输出约定**：${config.inputNote}`
    )
    .replace(
      '### 解题思路',
      `### 解题思路\n\n**从表查询到 ACM 程序**：${config.bridge}`
    )
    .replace(/```sql\n[\s\S]*?```/, `\`\`\`python\n${config.code}\n\`\`\``)

  return normalized
}

function applyVerifiedCorrections(section, stem, ordinal) {
  if (stem === 'algo-20260702' && ordinal === '04') {
    const purePython = `import json
import math
import sys


def solve():
    data = json.loads(sys.stdin.read())
    image_embeds = data["image_embeds"]
    text_embeds = data["text_embeds"]
    temperature = float(data["temperature"])
    sample_count = len(image_embeds)

    # 用纯 Python 计算 N×N 相似度矩阵，输入仍保持来源题面的 JSON 格式。
    logits = [
        [
            sum(x * y for x, y in zip(image, text)) / temperature
            for text in text_embeds
        ]
        for image in image_embeds
    ]

    def cross_entropy(matrix):
        total = 0.0
        for index, row in enumerate(matrix):
            # 减去行最大值，避免 exp 在大数上溢出。
            row_max = max(row)
            log_sum_exp = row_max + math.log(
                sum(math.exp(value - row_max) for value in row)
            )
            total += log_sum_exp - row[index]
        return total / sample_count

    transposed = [list(column) for column in zip(*logits)]
    loss = (cross_entropy(logits) + cross_entropy(transposed)) / 2
    print(f"{loss:.6f}")


solve()`

    return section
      .replace('输出最终损失值，保留 6 位小数。仅使用 NumPy。', '输出最终损失值，保留 6 位小数。实现仅使用 Python 标准库。')
      .replace(/```python\n[\s\S]*?```/, `\`\`\`python\n${purePython}\n\`\`\``)
  }

  return section
}

function addChineseCodeHint(section, topic) {
  return section.replace(/```python\n([\s\S]*?)```/, (fence, code) => {
    if (/^\s*#/m.test(code)) return fence

    const hint = `# 核心步骤：${topic}；按题面读取标准输入并输出唯一结果。`
    const inputAssignment = /^(input\s*=\s*sys\.stdin\.readline[^\n]*\n)/m

    if (inputAssignment.test(code)) {
      return `\`\`\`python\n${code.replace(inputAssignment, `$1\n${hint}\n`)}\`\`\``
    }

    return `\`\`\`python\n${hint}\n${code}\`\`\``
  })
}

function normalizeBody(originalBody, questions, topics, stem) {
  let body = originalBody
    .replace(/^\s*# .+\n+/, '')
    .replace(
      /^## (?:(第一|第二|第三|第四)题|第\s*([1-4])\s*题)：(.+)$/gm,
      (_, chinese, digit, title) => {
        const number = chinese ? chineseOrdinals[chinese] : digit.padStart(2, '0')
        return `## ${number} · ${title.trim()} {#problem-${number}}`
      }
    )
    .replace(/^### 思路分析$/gm, '### 解题思路')
    .replace(/^### 题解代码$/gm, '### Python ACM 实现')

  const sections = body.split(/(?=^## \d{2} · )/gm)
  body = sections.map((section) => {
    const heading = section.match(/^## (0[1-4]) · (.+?) \{#problem-/m)
    if (!heading) return section

    const ordinal = heading[1]
    let normalized = adaptDataQuestion(section, stem, ordinal)
    normalized = applyVerifiedCorrections(normalized, stem, ordinal)

    if (!normalized.includes('### Python ACM 实现') && normalized.includes('```python')) {
      normalized = normalized.replace(
        '\n```python',
        '\n### Python ACM 实现\n\n```python'
      )
    }

    normalized = normalized.replace(
      /### Python ACM 实现\n\n```python\n/g,
      '### Python ACM 实现\n\n下面给出完整标准输入、标准输出程序，可直接在 Python 3 ACM 环境运行。\n\n```python\n'
    )

    const topic = topics[Number(ordinal) - 1] ?? heading[2]
    return addChineseCodeHint(normalized, topic)
  }).join('')

  if (questions.length < 3 || questions.length > 4) {
    throw new Error(`题目数量异常：${questions.map((item) => item.title).join('、')}`)
  }

  const pythonFences = [...body.matchAll(/```python\n/g)].length
  if (pythonFences !== questions.length) {
    throw new Error(`${stem} Python 代码数量异常：${pythonFences}/${questions.length}`)
  }

  if (/```sql\n/.test(body)) {
    throw new Error(`${stem} 仍残留 SQL 代码`)
  }

  return body.trim()
}

for (const file of files) {
  const source = await readFile(path.join(sourceDirectory, file), 'utf8')
  const body = readFrontmatter(source)
  const stem = path.basename(file, '.md')
  const date = normalizeDate(stem)
  const role = roleByStem[stem]
  if (!role) throw new Error(`缺少岗位映射：${stem}`)
  const difficulty = readDifficulty(body)
  const questions = readQuestions(body)
  const topics = readTopics(body, questions)
  const sourceUrl = `https://onefly.top/zero2Leetcode/04_real_interviews/pinduoduo/${stem}/`
  const target = path.join(outputDirectory, `pinduoduo-${stem}.md`)
  const topicTags = topics.map((topic) => `    <span>${topic}</span>`).join('\n')
  const content = `---
pageClass: exam-session-page
title: 拼多多${role} ${date}
description: 拼多多 ${date} ${role}笔试真题，含 ${questions.length} 道 Python ACM 模式题解
---

<div class="exam-session-banner">
  <div>
    <span>PINDUODUO / ${date.replaceAll('-', '.')} / ACM</span>
    <strong>拼多多 · ${role}</strong>
    <small>${date} · ${questions.length} 题 ACM · 难度 ${difficulty}</small>
  </div>
  <div class="exam-session-banner__meta">
${topicTags}
  </div>
</div>

# 拼多多 ${date} ${role}笔试解析

本场仅整理需要编程实现的题目，并统一为完整 Python ACM 程序。每题保留标准输入输出、建模过程、正确性依据、复杂度、易错点和关键中文注释；数据岗原 SQL 题也补充了等价的 Python 标准输入输出版本。

来源：[Zero2Leetcode · 拼多多 ${date} ${role}](${sourceUrl})。

${normalizeBody(body, questions, topics, stem)}
`

  await writeFile(target, content)
  catalogSessions.push({
    id: `PDD-${stem.toUpperCase()}`,
    company: '拼多多',
    role,
    date,
    year: date.slice(0, 4),
    href: `/written-tests/pinduoduo-${stem}`,
    difficulty,
    topics,
    questions: questions.map((question) => question.title)
  })
  console.log(`generated ${path.relative(projectRoot, target)}`)
}

const dataDirectory = path.join(projectRoot, '.vitepress/theme/data')
await mkdir(dataDirectory, { recursive: true })
await writeFile(
  path.join(dataDirectory, 'pinduoduoWrittenTests.ts'),
  `// 由 scripts/import-pinduoduo.mjs 根据公开题面目录生成。
export const pinduoduoWrittenTests = ${JSON.stringify(catalogSessions, null, 2)}
`
)
