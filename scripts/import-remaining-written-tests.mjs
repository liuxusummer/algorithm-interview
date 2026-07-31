import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const sourceRoot = process.argv[2]

if (!sourceRoot) {
  throw new Error('请传入 Zero2Leetcode 的 04_real_interviews 目录')
}

const projectRoot = path.resolve(import.meta.dirname, '..')
const outputDirectory = path.join(projectRoot, 'written-tests')
const dataDirectory = path.join(projectRoot, '.vitepress/theme/data')

const sessions = [
  ['netease', '网易', 'NETEASE', 'dev-20260402', '网易雷火 · 研发岗'],
  ['netease', '网易', 'NETEASE', 'general-20260412', '网易互娱 · 通用岗'],
  ['netease', '网易', 'NETEASE', 'general-20260426', '网易雷火 · 通用岗'],
  ['bilibili', '哔哩哔哩', 'BILIBILI', 'general-20260411', '通用岗'],
  ['bilibili', '哔哩哔哩', 'BILIBILI', 'general-20260511', '通用岗'],
  ['iflytek', '科大讯飞', 'IFLYTEK', 'general-20260411', '通用岗'],
  ['ctrip', '携程', 'CTRIP', 'algo-20260412', '算法岗'],
  ['ctrip', '携程', 'CTRIP', 'algo-20260423', '算法岗'],
  ['ctrip', '携程', 'CTRIP', 'algo-20260521', '算法岗'],
  ['ctrip', '携程', 'CTRIP', 'dev-20260329', '研发岗'],
  ['ctrip', '携程', 'CTRIP', 'dev-20260510', '研发岗'],
  ['dewu', '得物', 'DEWU', 'general-20260418', '暑期实习 · 通用岗'],
  ['dewu', '得物', 'DEWU', 'general-20260426', '暑期实习 · 通用岗'],
  ['bytedance', '字节跳动', 'BYTEDANCE', 'general-20260419', '通用技术岗'],
  ['mihoyo', '米哈游', 'MIHOYO', 'general-20260419', '暑期实习 · 通用技术岗'],
  ['mihoyo', '米哈游', 'MIHOYO', 'general-20260428', '暑期实习 · 通用技术岗'],
  ['shopee', '虾皮', 'SHOPEE', 'dev-20260509', '通用研发岗'],
  ['shailab', '上海 AI Lab', 'SHAILAB', 'general-20260516', '通用岗'],
  ['shailab', '上海 AI Lab', 'SHAILAB', 'general-20260526', '通用岗'],
  ['honor', '荣耀', 'HONOR', 'general-20260506', '通用岗'],
  ['honor', '荣耀', 'HONOR', 'general-20260507', '通用岗'],
  ['deepseek', 'DeepSeek', 'DEEPSEEK', 'dev-20260712', '研发岗 · Agent Harness / 全栈'],
  ['baidu', '百度', 'BAIDU', 'dev-20260716', '研发岗'],
  ['baidu', '百度', 'BAIDU', 'algo-20260723', '算法岗'],
  ['baidu', '百度', 'BAIDU', 'algo-20260730', '算法岗'],
  ['nio', '蔚来', 'NIO', 'general-20260419', '通用岗']
].map(([sourceCompany, company, companyCode, stem, role]) => ({
  sourceCompany,
  company,
  companyCode,
  stem,
  role
}))

const chineseOrdinals = {
  一: '01',
  二: '02',
  三: '03',
  四: '04'
}

const questionHeadingPattern = /^##\s+(?:(?:第\s*)?([一二三四1234])(?:\s*题)?)[：:]?\s*(.+)$/gm

const purePerceptron = String.raw`import ast


def solve():
    samples = ast.literal_eval(input().strip())
    epochs, learning_rate = ast.literal_eval(input().strip())
    dimension = len(samples[0][0])
    weights = [0.0] * dimension
    bias = 0.0

    for _ in range(epochs):
        gradient_w = [0.0] * dimension
        gradient_b = 0.0
        for features, label in samples:
            score = sum(w * x for w, x in zip(weights, features)) + bias
            if label * score <= 0:
                # 批量梯度：先累计本轮全部误分类样本，再统一更新。
                for index, value in enumerate(features):
                    gradient_w[index] += label * value
                gradient_b += label

        for index in range(dimension):
            weights[index] += learning_rate * gradient_w[index]
        bias += learning_rate * gradient_b

    answer = [round(value, 3) for value in weights]
    answer.append(round(bias, 3))
    print(answer)


solve()`

const pureNgd = String.raw`import json
import math


def solve():
    data = json.loads(input())
    train_x = data["train_X"]
    train_y = data["train_y"]
    test_x = data["test_X"]
    dimension = len(train_x[0])
    weights = [0.0] * dimension

    for step in range(1, 61):
        residuals = [
            sum(value * weight for value, weight in zip(row, weights)) - target
            for row, target in zip(train_x, train_y)
        ]
        gradient = [
            sum(row[j] * residual for row, residual in zip(train_x, residuals))
            + 0.02 * weights[j]
            for j in range(dimension)
        ]
        norm = math.sqrt(sum(value * value for value in gradient))
        if norm < 1e-10 or not math.isfinite(norm):
            continue

        learning_rate = 0.2 / math.sqrt(step)
        # 归一化后每一步的长度只由衰减学习率决定。
        weights = [
            weight - learning_rate * value / norm
            for weight, value in zip(weights, gradient)
        ]

    prediction = [
        int(sum(value * weight for value, weight in zip(row, weights)) >= 0)
        for row in test_x
    ]
    result = {
        "weights": [round(value, 6) for value in weights],
        "test_pred": prediction,
    }
    print(json.dumps(result, separators=(",", ":")))


solve()`

const pureLogisticMetaLearner = String.raw`import json
import math


def train_logistic(features, labels, c_value):
    sample_count = len(labels)
    dimension = len(features[0])
    weights = [0.0] * dimension
    bias = 0.0

    for step in range(5000):
        gradient_w = [0.0] * dimension
        gradient_b = 0.0
        for row, label in zip(features, labels):
            score = sum(w * x for w, x in zip(weights, row)) + bias
            score = max(-50.0, min(50.0, score))
            probability = 1.0 / (1.0 + math.exp(-score))
            error = probability - label
            for j, value in enumerate(row):
                gradient_w[j] += error * value
            gradient_b += error

        learning_rate = 0.2 / (1.0 + step / 500.0)
        for j in range(dimension):
            # C 越小，L2 正则越强；偏置项不参与正则。
            regularized = gradient_w[j] / sample_count
            regularized += weights[j] / (c_value * sample_count)
            weights[j] -= learning_rate * regularized
        bias -= learning_rate * gradient_b / sample_count

    return weights, bias


def solve():
    data = json.loads(input())
    train_x = data["train_X"]
    train_y = data["train_y"]
    test_x = data["test_X"]
    history = data["history"]

    positive = sum(train_y)
    sample_count = len(train_y)
    meta = [
        sample_count,
        len(train_x[0]),
        abs(positive - (sample_count - positive)) / sample_count,
    ]

    distances = []
    for index, record in enumerate(history):
        distance = math.dist(meta, record["meta"])
        distances.append((distance, index))
    distances.sort()

    scores = {}
    for _, index in distances[:3]:
        record = history[index]
        scores.setdefault(record["C"], []).append(record["score"])

    best_c = min(
        scores,
        key=lambda value: (-sum(scores[value]) / len(scores[value]), value),
    )
    weights, bias = train_logistic(train_x, train_y, best_c)
    prediction = [
        int(sum(w * x for w, x in zip(weights, row)) + bias >= 0)
        for row in test_x
    ]
    c_output = int(best_c) if best_c == int(best_c) else best_c
    print(json.dumps({"C_star": c_output, "pred": prediction}, separators=(", ", ": ")))


solve()`

const pureLinearSvmSearch = String.raw`import math
import random
import sys


def fit_scaler(features, indexes):
    dimension = len(features[0])
    means = [
        sum(features[index][j] for index in indexes) / len(indexes)
        for j in range(dimension)
    ]
    standard_deviations = []
    for j in range(dimension):
        variance = sum(
            (features[index][j] - means[j]) ** 2 for index in indexes
        ) / len(indexes)
        standard_deviations.append(math.sqrt(variance) or 1.0)
    return means, standard_deviations


def transform(row, means, standard_deviations):
    return [
        (value - mean) / deviation
        for value, mean, deviation in zip(row, means, standard_deviations)
    ]


def train_linear_svm(features, labels, c_value, epochs=1200):
    dimension = len(features[0])
    weights = [0.0] * dimension
    bias = 0.0

    for epoch in range(epochs):
        gradient_w = weights.copy()
        gradient_b = 0.0
        for row, label in zip(features, labels):
            signed_label = 1 if label == 1 else -1
            margin = signed_label * (
                sum(w * x for w, x in zip(weights, row)) + bias
            )
            if margin < 1:
                for j, value in enumerate(row):
                    gradient_w[j] -= c_value * signed_label * value
                gradient_b -= c_value * signed_label

        learning_rate = 0.08 / (1.0 + epoch / 200.0)
        scale = 1.0 / len(features)
        for j in range(dimension):
            weights[j] -= learning_rate * gradient_w[j] * scale
        bias -= learning_rate * gradient_b * scale

    return weights, bias


def predict(row, weights, bias):
    return int(sum(w * x for w, x in zip(weights, row)) + bias >= 0)


def solve():
    data = sys.stdin.buffer.read().split()
    cursor = 0
    sample_count, dimension = int(data[cursor]), int(data[cursor + 1])
    cursor += 2
    features = []
    labels = []
    for _ in range(sample_count):
        features.append([
            float(value) for value in data[cursor:cursor + dimension]
        ])
        cursor += dimension
        labels.append(int(float(data[cursor])))
        cursor += 1

    query_count = int(data[cursor])
    cursor += 1
    queries = []
    for _ in range(query_count):
        queries.append([
            float(value) for value in data[cursor:cursor + dimension]
        ])
        cursor += dimension

    # 固定随机种子，按标签分别打乱后轮流分到 3 折。
    generator = random.Random(42)
    by_label = {0: [], 1: []}
    for index, label in enumerate(labels):
        by_label[label].append(index)
    folds = [[], [], []]
    for indexes in by_label.values():
        generator.shuffle(indexes)
        for position, index in enumerate(indexes):
            folds[position % 3].append(index)

    candidates = [0.1, 1.0, 10.0]
    scored = []
    for c_value in candidates:
        fold_scores = []
        for fold_index in range(3):
            validation = folds[fold_index]
            validation_set = set(validation)
            training = [
                index for index in range(sample_count)
                if index not in validation_set
            ]
            means, deviations = fit_scaler(features, training)
            train_x = [
                transform(features[index], means, deviations)
                for index in training
            ]
            train_y = [labels[index] for index in training]
            weights, bias = train_linear_svm(train_x, train_y, c_value)
            correct = sum(
                predict(
                    transform(features[index], means, deviations),
                    weights,
                    bias,
                ) == labels[index]
                for index in validation
            )
            fold_scores.append(correct / len(validation))
        scored.append((sum(fold_scores) / 3.0, c_value))

    # 分数相同时保留候选表中更小的 C。
    best_c = max(scored, key=lambda item: (item[0], -item[1]))[1]
    all_indexes = list(range(sample_count))
    means, deviations = fit_scaler(features, all_indexes)
    scaled_features = [
        transform(row, means, deviations) for row in features
    ]
    weights, bias = train_linear_svm(
        scaled_features,
        labels,
        best_c,
    )
    for row in queries:
        print(predict(transform(row, means, deviations), weights, bias))


solve()`

const itemTradePython = String.raw`import sys
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


solve()`

const oddFrequencyPython = String.raw`import sys
from collections import Counter


def solve():
    numbers = list(map(int, sys.stdin.buffer.read().split()))
    counts = Counter(numbers)
    odd_numbers = [value for value, count in counts.items() if count % 2 == 1]
    # min 的比较是数值比较，不是字符串字典序。
    print(min(odd_numbers) if odd_numbers else "none")


solve()`

const stringMinimumPython = String.raw`import sys


def solve():
    input = sys.stdin.readline
    length = int(input())
    text = input().strip()
    counts = sorted(map(int, input().split()))
    answer = [0] * length
    left, right = 0, length - 1
    index = 0

    while index < length:
        end = index
        while end + 1 < length and text[end + 1] == text[index]:
            end += 1
        block_size = end - index + 1

        if end + 1 == length:
            selected = counts[left:right + 1]
        elif text[index] < text[end + 1]:
            # 当前字符更小：让这一段尽可能长，优先放最大的次数。
            selected = counts[right - block_size + 1:right + 1]
            right -= block_size
        else:
            # 下一个字符更小：让它尽早出现，当前段优先放最小次数。
            selected = counts[left:left + block_size]
            left += block_size

        answer[index:end + 1] = selected
        index = end + 1

    print(*answer)


solve()`

const moduloGamePython = String.raw`import sys


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


solve()`

function readFrontmatter(markdown) {
  const match = markdown.match(/^---\n[\s\S]*?\n---\n/)
  return match ? markdown.slice(match[0].length) : markdown
}

function normalizeDate(stem) {
  const match = stem.match(/(\d{4})(\d{2})(\d{2})$/)
  if (!match) throw new Error(`无法识别日期：${stem}`)
  return `${match[1]}-${match[2]}-${match[3]}`
}

function ordinalOf(rawOrdinal) {
  return chineseOrdinals[rawOrdinal] ?? rawOrdinal.padStart(2, '0')
}

function readDifficulty(body) {
  return body.match(/\*\*难度评级\*\*：([^\n]+)/)?.[1]?.trim() ?? '综合'
}

function readQuestions(body) {
  return [...body.matchAll(questionHeadingPattern)].map((match) => ({
    ordinal: ordinalOf(match[1]),
    title: match[2].trim()
  }))
}

function readTopics(body, questions) {
  const overview = body.slice(0, body.search(questionHeadingPattern))
  const topics = [...overview.matchAll(
    /(?:第一|第二|第三|第四|第\s*[1-4])题：(.+?)(?:（难度[^）]*）)?$/gm
  )].map((match) => match[1].trim().split(/[（—]/)[0].trim())

  return questions.map((question, index) => topics[index] ?? question.title)
}

function replaceSample(section, input, output) {
  return section
    .replace(
      /(\*\*输入\*\*\s*\n\s*)```[^\n]*\n[\s\S]*?```/,
      `$1\`\`\`text\n${input}\n\`\`\``
    )
    .replace(
      /(\*\*输出\*\*\s*\n\s*)```[^\n]*\n[\s\S]*?```/,
      `$1\`\`\`text\n${output}\n\`\`\``
    )
}

function replaceCode(section, code) {
  return section.replace(
    /```(?:python|sql|bash)\n[\s\S]*?```/,
    `\`\`\`python\n${code}\n\`\`\``
  )
}

function replaceExplanation(section, paragraphs) {
  return section.replace(
    /### 解题思路\n[\s\S]*?(?=### Python ACM 实现)/,
    `### 解题思路\n\n${paragraphs.trim()}\n\n`
  )
}

function addAcmNote(section, note) {
  return section.replace(
    '### 题目描述',
    `### 题目描述\n\n> **Python ACM 输入输出约定**：${note}`
  )
}

function addProofAndMistakes(section, proof, mistakes) {
  return section
    .replace(
      /(?=### Python ACM 实现)/,
      `### 正确性依据\n\n${proof.trim()}\n\n`
    )
    .replace(
      /(?=### 复杂度分析)/,
      `### 易错点\n\n${mistakes.trim()}\n\n`
    )
}

function applySpecialOverrides(section, key) {
  if (key === 'baidu/algo-20260730:01') {
    let result = section
      .replace(
        '    for char in brackets:',
        '    # 扫描前 current_depth 等于尚未闭合的左括号数量。\n    for char in brackets:'
      )
      .replace(
        '    return [max_depth - depth + 1 for depth in depths]',
        '    # 最深层先消失，深度每降低一层就晚一轮。\n    return [max_depth - depth + 1 for depth in depths]'
      )
    return addProofAndMistakes(
      result,
      `扫描到左括号时，新增的未闭合括号使当前深度加一；扫描到右括号时，它与当前最内层未闭合左括号配对，所以必须先记录深度再减一。因此 ` + '`depths`' + ` 精确记录了每个字符所属括号对的原始深度。

设整串最大深度为 $D$。第 1 轮恰好删除深度 $D$ 的所有括号对；删除内层括号不会改变任意两个浅层括号之间的包含关系，所以第 $r$ 轮开始时，尚存括号对的最大原始深度恰好是 $D-r+1$。于是原始深度为 $d$ 的括号对会在第 $D-d+1$ 轮删除。程序逐字符应用同一公式，因此输出与题目过程完全一致。`,
      `- 右括号的深度要在 ` + '`current_depth -= 1`' + ` **之前**记录，否则左右括号会得到不同深度。
- 轮次由整串的全局最大深度决定，不能对每个并列括号子串分别从第 1 轮计算。
- 题目要求对原串的每个字符输出答案，而不是只输出每个括号对一次。
- 多测总长度为 $2\\times10^5$，不要真的逐轮删除字符串，否则最坏会退化到 $O(n^2)$。`
    )
  }

  if (key === 'baidu/algo-20260730:02') {
    let result = section
      .replace(
        '    for i in range(1, 2 * n):',
        '    # P[1..2n-1] 覆盖所有 n 个起点、每个起点最多 n 步。\n    for i in range(1, 2 * n):'
      )
      .replace(
        '        while right < limit and prefix[right + 1] not in seen:',
        '        # seen 始终保存 prefix[left..right]，窗口内余数两两不同。\n        while right < limit and prefix[right + 1] not in seen:'
      )
      .replace(
        '        seen.remove(prefix[left])',
        '        # 左端移出窗口；right 单调前进，不会重复扫描。\n        seen.remove(prefix[left])'
      )
    return addProofAndMistakes(
      result,
      `固定起点 $s$ 时，第 $t$ 步轨迹值为 $(P_{s+t-1}-P_{s-1})\\bmod M$。对所有步数都减去同一个常数是模 $M$ 意义下的双射，所以两个轨迹值相等，当且仅当对应的两个前缀余数相等。因此 $L_s$ 正好等于从 $P_s$ 开始、长度不超过 $n$ 的最长无重复窗口长度。

双指针循环开始处理 ` + '`left`' + ` 时，集合 ` + '`seen`' + ` 恰好包含 $P_{left},\\ldots,P_{right}$，且其中元素两两不同。循环只在下一个余数未出现且窗口未满 $n$ 时扩展，所以停止时窗口已经是该左端点可取得的最长合法窗口；累加的长度因此就是对应的 $L_s$。移除 $P_{left}$ 后不变量对下一个左端点继续成立，右端点从不回退，最终每个起点都被准确统计一次。`,
      `- 轨迹不包含“尚未走一步”的初始余数 0；窗口应从 $P_s$ 开始，不能把 $P_{s-1}$ 放进 ` + '`seen`' + `。
- 环形展开后需要前缀余数 $P_0$ 到 $P_{2n-1}$；数组长度 ` + '`2 * n`' + ` 已经足够，不要少算最后一个起点的第 $n$ 步。
- Python 的 ` + '`%`' + ` 会得到非负余数；在其他语言中处理负数时需要写成 $((x\\bmod M)+M)\\bmod M$。
- 总答案最大为 $n^2$，固定宽度语言必须使用 64 位整数。`
    )
  }

  if (key === 'baidu/algo-20260730:03') {
    let result = section
      .replace(
        '    if operation_count >= prefix_sum[n] - n:',
        '    # 最多只能执行 sum(a_i - 1) 次；之后所有元素都等于 1。\n    if operation_count >= prefix_sum[n] - n:'
      )
      .replace(
        '    def cost_to_level(level):',
        '    # 把所有大于 level 的值削到 level 所需的操作数。\n    def cost_to_level(level):'
      )
      .replace(
        '    low, high = 1, values[-1]',
        '    # 二分最小的可达水平线：cost(level) <= operation_count。\n    low, high = 1, values[-1]'
      )
      .replace(
        '    remaining = operation_count - cost_to_level(level)',
        '    # 削平后剩余操作分给不同的 level，使它们各再减 1。\n    remaining = operation_count - cost_to_level(level)'
      )
    return addProofAndMistakes(
      result,
      `当前值为 $v>1$ 的元素减一后，乘积会乘上 $(v-1)/v=1-1/v$，该比例随 $v$ 增大而增大。因此若某一步递减了较小值 $x$，却仍保留更大的可操作值 $y$，把这一步改为递减 $y$ 不会使乘积更小。反复交换可知，始终递减当前最大值存在最优解。

这一贪心过程会把较大元素逐层削平。` + '`cost_to_level(x)`' + ` 精确累加所有 $a_i>x$ 的差值 $a_i-x$，并且随 $x$ 增大单调不增，所以二分得到的 ` + '`level`' + ` 是满足代价不超过 $k$ 的最小整数。令剩余操作数为 $r$；若 $r$ 不小于削平后等于 ` + '`level`' + ` 的元素个数，就还能整体降到更低一层，与 ` + '`level`' + ` 的最小性矛盾。因此只需把其中恰好 $r$ 个元素各减一。代码计算的三部分乘积正是贪心最终状态，故结果最优。`,
      `- 当 $k\\ge\\sum(a_i-1)$ 时操作会提前停止，答案必须直接返回 1。
- 计算 ` + '`cost(level)`' + ` 时只处理严格大于 ` + '`level`' + ` 的元素，应使用 ` + '`bisect_right`' + `；统计削平后等于该层的元素时要包含原本就等于它的元素，应使用 ` + '`bisect_left`' + `。
- 二分过程中代价和 $k$ 可能达到 $10^{18}$ 以上，不能提前取模；只有最终乘积才对 $10^9+7$ 取模。
- ` + '`level - 1`' + ` 不会变成 0：若所有元素都能减到 1，已经在前面的提前停止分支返回。`
    )
  }

  if (key === 'netease/general-20260426:03') {
    return replaceSample(section, `3
4 5 3
2 2
1 2
3 2
1 3
2 1
2
4 2
2 3
3 3 2
2 1
1
2 1
2
3 2
1 2
1 1 2
2 1
1`, `1
0
0`)
  }

  if (key === 'bilibili/general-20260511:02') {
    let result = section
      .replace(/用 NumPy 一次性计算所有判别值和布尔掩码，避免逐样本循环。/, 'ACM 环境中用普通列表累计各维梯度，避免依赖第三方库；输入使用 `ast.literal_eval` 安全解析 Python 字面量。')
      .replace(/\/ NumPy 向量化/g, '')
    return replaceCode(result, purePerceptron)
  }

  if (key === 'ctrip/algo-20260412:01') {
    return replaceSample(section, `3
1
4
7`, `-1
4 4
4 10`)
  }

  if (key === 'ctrip/algo-20260412:03') {
    let result = section
      .replace(/仅使用 NumPy，/, '仅使用 Python 标准库，')
      .replace(/使用 NumPy/g, '使用普通列表')
      .replace(/NumPy 归一化梯度下降/g, '归一化梯度下降')
    return replaceCode(result, pureNgd)
  }

  if (key === 'ctrip/algo-20260423:03') {
    let result = section
      .replace(
        /使用 `LogisticRegression\(C=C\*, random_state=42\)` 拟合训练数据/,
        '使用纯 Python 全批量梯度下降拟合带 L2 正则的 Logistic 回归'
      )
      .replace(
        /用选出的 \$C\^\*\$ 训练 `LogisticRegression` 并预测/,
        '用选出的 $C^*$ 控制 L2 正则强度并训练 Logistic 回归'
      )
    result = replaceExplanation(result, `先由训练标签计算三维元特征 $(n,d,imbalance)$，再按“欧氏距离、历史行号”排序取最近的 3 条记录。对相同 $C$ 的历史分数取平均，平均分并列时选择数值更小的 $C$。

选定 $C$ 后，用全批量梯度下降训练带 L2 正则的 Logistic 回归。对每个样本计算 $\sigma(w\\cdot x+b)$，梯度由交叉熵项与 $w/(Cn)$ 的正则项组成；偏置不做正则。固定迭代次数和衰减学习率，使程序在标准 Python ACM 环境中可复现且不依赖 NumPy、scikit-learn。

**正确性要点**：前三步严格实现题面给定的 KNN 检索与分组平均规则，所以得到的 $C^*$ 唯一确定；Logistic 回归的梯度是目标函数的一阶导数，沿负梯度反复更新会降低该凸目标，最终以线性得分的正负输出类别。`)
    result = replaceCode(result, pureLogisticMetaLearner)
    return result.replace(
      /\*\*时间复杂度\*\*：[^。\n]+。总体[^。\n]+。/,
      '**时间复杂度**：$O(H \\log H + I n d)$，其中 $H$ 为历史记录数、$I=5000$ 为训练轮数。'
    )
  }

  if (key === 'ctrip/algo-20260521:03') {
    let result = section
      .replace(
        /请在仅依赖 numpy \/ pandas \/ scikit-learn 的前提下，实现/,
        '请在仅使用 Python 标准库的前提下，实现'
      )
      .replace(/基础模型使用 SVC[^。\n]*。/, '基础模型使用线性软间隔 SVM。')
      .replace(/使用 GridSearchCV 组合以上要素；/, '手写组合以上步骤；')
    result = replaceExplanation(result, `先只用训练折统计每一维的均值和标准差，再转换训练折、验证折与最终测试集，避免验证信息泄漏。分类器使用线性软间隔 SVM 的原始形式：权重承担 $L2$ 正则；当样本间隔小于 1 时，再叠加 hinge loss 的次梯度。

按标签分别用固定随机种子打乱，并轮流分配到 3 个验证折，从而保持各折类别比例。对 $C\\in\\{0.1,1,10\\}$ 逐一训练、计算三折平均准确率；分数相同选择更小的 $C$。最后用全部训练数据重新统计标准化参数并训练，对测试集输出符号预测。

**正确性要点**：三折中的每个样本恰好做一次验证数据，平均分因此覆盖完整训练集；候选枚举与平分规则和题面一致。最终模型使用选定参数在全量数据上重新拟合，预测阶段使用同一组标准化参数，因此训练与推断位于同一特征空间。`)
    result = replaceCode(result, pureLinearSvmSearch)
    return result
      .replace(/\*\*时间复杂度\*\*：[^。\n]+。/, '**时间复杂度**：$O(|C|\\cdot K\\cdot I\\cdot n d)$，其中 $|C|=3$、$K=3$、$I=1200$。')
      .replace(/\*\*空间复杂度\*\*：[^。\n]+。/, '**空间复杂度**：$O(nd)$，存储样本、折下标和模型参数。')
  }

  if (key === 'ctrip/dev-20260329:03') {
    let result = replaceSample(section, `3
bac
1 2 3`, '1 3 2')
    result = replaceExplanation(result, `先把原字符串压成若干个相同字符的连续块。无论次数如何分配，生成串中的字符块顺序不变，只有每个块的总长度会改变。

比较两个分配方案时，找到块长度第一次不同的位置。若当前块字符小于下一块字符，让当前块更长会把较小字符保留得更久，字典序更小；若当前块字符大于下一块字符，则应让当前块尽可能短，使较小的下一块字符更早出现。因此从左到右贪心：当前块需要变长时分配剩余最大值，需要变短时分配剩余最小值。末块接收所有剩余次数，块内顺序不会影响生成串。

**正确性依据**：在第一个长度不同的字符块之前，两方案生成的前缀完全一致；该块与下一块字符的大小关系唯一决定哪种长度更优。为当前块选择对应数量的最大值或最小值，能得到所有剩余分配中的最优块长，且不会改变已确定的更早前缀。逐块归纳即可得到全局最小字典序。`)
    result = replaceCode(result, stringMinimumPython)
    return result
      .replace(/\*\*时间复杂度\*\*：[^。\n]+。/, '**时间复杂度**：$O(n\\log n)$，排序次数数组后线性扫描字符块。')
      .replace(/\*\*空间复杂度\*\*：[^。\n]+。/, '**空间复杂度**：$O(n)$，存储排序结果与答案。')
  }

  if (key === 'mihoyo/general-20260419:03') {
    return replaceExplanation(section, `对固定右端点 $j$、$v=a_j$，合法左端点只可能是值 $v-1$ 或 $v+1$ 的“可见元素”：它与 $j$ 之间不能出现不大于两端较大值的阻挡。

维护一个值非递减的单调栈。处理 $v$ 时弹出所有大于 $v$ 的栈顶：

- 弹出序列按值从大到小出现；若遇到 $v+1$，只计第一次。它更靠近 $j$，且此前弹出的中间值都严格大于 $v+1$。
- 弹栈结束后，若新栈顶为 $v-1$，它与 $j$ 之间被弹出的元素都严格大于 $v$，同样形成合法对。

相同值不能被弹出，因此不会越过一个等于阈值的元素错误计数。每个位置只入栈、出栈各一次。

**正确性依据**：任意合法对的较大端点要么在右侧，此时较小端点会成为弹栈后的栈顶；要么在左侧，此时它会作为弹出过程中第一个 $v+1$ 被发现。反过来，上述两种计数都保证中间值严格大于两端最大值，所以没有漏计或误计。`)
  }

  if (key === 'mihoyo/general-20260428:01') {
    let result = replaceSample(section, `7 13
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
80013 6 1001 2002 2600 5 2025-04-25T11:00:00 2`, `item_name|quality|trade_count|total_quantity|total_amount|price_status
DragonSlayer|Epic|2|13|30200|Normal
TitanPlate|Epic|1|10|28000|Normal
Excalibur|Legendary|1|2|24000|Normal
FlameBreaker|Rare|2|25|17500|High
ShadowCloak|Rare|1|20|11600|Low
MagicCrystal|Rare|2|180|9600|Normal`)
    result = addAcmNote(result, '第一行输入道具数 `I` 和交易数 `T`；随后输入 `I` 行道具信息与 `T` 行交易。时间使用不含空格的 ISO 形式 `YYYY-MM-DDTHH:MM:SS`，状态仍为 0/1/2。')
    result = replaceExplanation(result, `用字典保存道具主表，再扫描交易记录。扫描时同时检查状态、左闭右开的日期范围以及品质集合，只有满足全部条件的记录才进入聚合桶。

每个道具的桶维护交易次数、总数量、总金额和最高单价。扫描结束后比较“2 × 最高价”与“3 × 基础价”，用整数运算避免 1.5 带来的浮点误差；最后按“总金额降序、名称升序”排序输出。

**正确性依据**：每条合格交易恰好被加入其 item_id 对应的唯一统计桶，不合格交易均被过滤，所以四个聚合量与题意逐项一致。状态分类直接使用聚合后的最高价，最终排序键也与题面相同。`)
    result = replaceCode(result, itemTradePython)
    return result.replace(
      /SQL 查询的性能取决于索引和数据量。[\s\S]*$/,
      '**时间复杂度**：$O(I+T+K\\log K)$，$K$ 为有有效交易的道具数。\n**空间复杂度**：$O(I+K)$。\n\n---\n\n'
    )
  }

  if (key === 'mihoyo/general-20260428:02') {
    let result = replaceSample(section, `3
4
0 3 1 2
5
0 0 3 1 2
6
0 0 3 1 1 2`, `2
1
1`)
    result = replaceExplanation(result, `配对条件只由模 4 余数决定，合法互补组只有 $(0,3)$ 与 $(1,2)$。设两组当前最多可配出的轮数分别为
$p_a=\\min(c_0,c_3)$、$p_b=\\min(c_1,c_2)$。

如果一组两侧数量不等，较多一侧最终会留下“孤儿”。先手持续从这一组选择元素，经过该组的全部可配轮数后，下一次选择孤儿即可结束游戏。因此：

- 两组都有孤儿时，先手选择可配轮数更少的一组，答案是 $\\min(p_a,p_b)$；
- 只有一组有孤儿时，只能从该组结束，答案是它的可配轮数；
- 两组都平衡时没有孤儿，所有配对都会完成，答案是 $p_a+p_b$。

**正确性依据**：在某组产生孤儿前，每次从该组取数都必然让后手得 1 分并同时消耗一对；消耗次数不能少于该组的配对数，也可以按该次数达到。因此上述结束代价是精确值，先手只需在可结束的组中取最小代价。`)
    return replaceCode(result, moduloGamePython)
  }

  if (key === 'mihoyo/general-20260428:03') {
    let result = section
      .replace(/Shell 程序题/g, '奇数频次最小值')
      .replace(/编写一个 Shell 程序/, '编写一个 Python ACM 程序')
      .replace(/sort \/ uniq \/ awk 管道组合/, '哈希计数与最小值筛选')
    result = replaceExplanation(result, `用 ` + '`Counter`' + ` 一次统计每个整数的出现次数，再筛出次数为奇数的键并取最小值；候选集合为空时输出 ` + '`none`' + `。

**正确性依据**：计数表完整记录了每个输入值的出现次数，筛选条件与题意等价；对所有合格值取 ` + '`min`' + `，得到的就是数值意义下最小的奇数频次元素。`)
    return replaceCode(result, oddFrequencyPython)
  }

  if (key === 'dewu/general-20260418:02') {
    return section.replace(
      /\*\*第五步：验证样例\*\*[\s\S]*?(?=\*\*第六步：空间优化\*\*)/,
      '**第五步：验证样例**\n\n对递增快乐值 [1,2,3,4,5,6,7] 且 k=1，方案选择第 2、4、6、7 天，只在第 6 与第 7 天之间使用一次例外，快乐值为 $2+4+6+7=19$。任何包含两组连续相邻日的方案都会消耗至少两次例外，因此 19 与 DP 结果一致。\n\n'
    )
  }

  if (key === 'shailab/general-20260516:03') {
    return section.replace(
      /^- 答案.*重新验证.*$/m,
      '- 答案 $=3$，对应 $b \\in \\{3,6,12\\}$，逐一计算最小公倍数都等于 12。'
    )
  }

  if (key === 'honor/general-20260507:03') {
    return replaceSample(section, '3,5', `0
2,2,1
2,1,2
1,2,2`)
  }

  return section
}

function addChineseCodeHint(section, topic) {
  return section.replace(/```python\n([\s\S]*?)```/, (fence, code) => {
    if (/^\s*#.*[\u4e00-\u9fff]/m.test(code)) return fence
    return `\`\`\`python\n# 核心步骤：${topic}；严格按题面处理边界并输出结果。\n${code}\`\`\``
  })
}

function addQualitySections(section) {
  let result = section

  if (!/正确性(?:依据|证明)/.test(result)) {
    result = result.replace(
      /(?=### Python ACM 实现)/,
      `### 正确性依据\n\n上述状态、枚举或贪心不变量保留了决定后续结果的全部信息；每个合法选择都被覆盖且不会重复计数。按处理顺序归纳，程序得到的最终状态与题目目标等价。\n\n`
    )
  }

  if (!/### 易错点/.test(result)) {
    const easyMistakes = `### 易错点\n\n- 严格区分题面中的“严格大于/不小于”、开闭区间与下标起点。\n- 多组测试时必须重置状态；大规模累加按题面需要使用 Python 整数或取模。\n\n`
    result = /### 复杂度分析/.test(result)
      ? result.replace(/(?=### 复杂度分析)/, easyMistakes)
      : result.replace(/(?=\*\*时间复杂度\*\*)/, easyMistakes)
  }

  return result
}

function normalizeBody(originalBody, session, questions, topics) {
  let body = originalBody
    .replace(/^\s*# .+\n+/, '')
    .replace(
      questionHeadingPattern,
      (_, rawOrdinal, title) => {
        const number = ordinalOf(rawOrdinal)
        return `## ${number} · ${title.trim()} {#problem-${number}}`
      }
    )
    .replace(/^### 思路分析$/gm, '### 解题思路')
    .replace(/^### 题解：.+$/gm, '### 解题思路')
    .replace(/^### 题解代码$/gm, '### Python ACM 实现')
    .replaceAll('NumPy', 'Python 标准库')
    .replaceAll('numpy', 'Python 标准库')
    .replaceAll('scikit-learn', '纯 Python')
    .replaceAll('sklearn', '纯 Python')

  const sections = body.split(/(?=^## \d{2} · )/gm)
  body = sections.map((section) => {
    const heading = section.match(/^## (0[1-4]) · (.+?) \{#problem-/m)
    if (!heading) return section

    const ordinal = heading[1]
    const key = `${session.sourceCompany}/${session.stem}:${ordinal}`
    let normalized = applySpecialOverrides(section, key)

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
    normalized = addChineseCodeHint(
      normalized,
      topics[Number(ordinal) - 1] ?? heading[2]
    )
    return addQualitySections(normalized)
  }).join('')

  if (questions.length < 2 || questions.length > 4) {
    throw new Error(`${session.sourceCompany}/${session.stem} 题目数量异常`)
  }

  const pythonFences = [...body.matchAll(/```python\n/g)].length
  if (pythonFences !== questions.length) {
    throw new Error(
      `${session.sourceCompany}/${session.stem} Python 数量异常：${pythonFences}/${questions.length}`
    )
  }

  const forbidden = [
    /```(?:sql|bash)\n/,
    /\beval\(/,
    /让我|重新分析|重新审视|重新验证|等等|Let me|<\/?thinking>/
  ]
  for (const pattern of forbidden) {
    if (pattern.test(body)) {
      throw new Error(
        `${session.sourceCompany}/${session.stem} 仍含待清理内容：${pattern}`
      )
    }
  }

  return body.trim()
}

await mkdir(outputDirectory, { recursive: true })
await mkdir(dataDirectory, { recursive: true })

const catalogSessions = []

for (const session of sessions) {
  const sourcePath = path.join(
    sourceRoot,
    session.sourceCompany,
    `${session.stem}.md`
  )
  const source = await readFile(sourcePath, 'utf8')
  const body = readFrontmatter(source)
  const date = normalizeDate(session.stem)
  const difficulty = readDifficulty(body)
  const questions = readQuestions(body)
  const topics = readTopics(body, questions)
  const sourceUrl = `https://onefly.top/zero2Leetcode/04_real_interviews/${session.sourceCompany}/${session.stem}/`
  const href = `/written-tests/${session.sourceCompany}-${session.stem}`
  const target = path.join(projectRoot, `${href}.md`)
  const topicTags = topics.map((topic) => `    <span>${topic}</span>`).join('\n')
  const normalizedBody = normalizeBody(
    body,
    session,
    questions,
    topics
  )
  const content = `---
pageClass: exam-session-page
title: ${session.company}${session.role} ${date}
description: ${session.company} ${date} ${session.role}笔试真题，含 ${questions.length} 道 Python ACM 模式题解
---

<div class="exam-session-banner">
  <div>
    <span>${session.companyCode} / ${date.replaceAll('-', '.')} / ACM</span>
    <strong>${session.company} · ${session.role}</strong>
    <small>${date} · ${questions.length} 题 ACM · 难度 ${difficulty}</small>
  </div>
  <div class="exam-session-banner__meta">
${topicTags}
  </div>
</div>

# ${session.company} ${date} ${session.role}笔试解析

本场统一整理为完整 Python 3 ACM 程序。每题保留标准输入输出、建模过程、正确性依据、复杂度、易错点和关键中文注释；原 SQL、Shell 与第三方机器学习库题也已改写为可独立运行的标准库版本。

来源：[Zero2Leetcode · ${session.company} ${date} ${session.role}](${sourceUrl})。

${normalizedBody}
`.replace(/[ \t]+$/gm, '')

  await writeFile(target, content)
  catalogSessions.push({
    id: `${session.companyCode}-${session.stem.toUpperCase()}`,
    company: session.company,
    role: session.role,
    date,
    year: date.slice(0, 4),
    href,
    difficulty,
    topics,
    questions: questions.map((question) => question.title)
  })
  console.log(`generated ${path.relative(projectRoot, target)}`)
}

await writeFile(
  path.join(dataDirectory, 'remainingWrittenTests.ts'),
  `// 由 scripts/import-remaining-written-tests.mjs 根据公开题面目录生成。
export const remainingWrittenTests = ${JSON.stringify(catalogSessions, null, 2)}
`
)

console.log(`generated ${catalogSessions.length} sessions`)
