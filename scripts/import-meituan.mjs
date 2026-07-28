import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const sourceDirectory = process.argv[2]

if (!sourceDirectory) {
  throw new Error('请传入 Zero2Leetcode 的美团 Markdown 目录')
}

const projectRoot = path.resolve(import.meta.dirname, '..')
const outputDirectory = path.join(projectRoot, 'written-tests')
const files = (await readdir(sourceDirectory))
  .filter((file) => file.endsWith('.md'))
  .sort()
const catalogSessions = []

const ordinalNumbers = {
  第一题: '01',
  第二题: '02',
  第三题: '03',
  第四题: '04'
}

await mkdir(outputDirectory, { recursive: true })

function readFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n/)
  const attributes = {}

  if (!match) return { attributes, body: markdown }

  for (const line of match[1].split('\n')) {
    const separator = line.indexOf(':')
    if (separator === -1) continue
    attributes[line.slice(0, separator).trim()] = line.slice(separator + 1).trim()
  }

  return {
    attributes,
    body: markdown.slice(match[0].length)
  }
}

function normalizeDate(stem) {
  const match = stem.match(/(\d{4})(\d{2})(\d{2})$/)
  if (!match) throw new Error(`无法识别日期：${stem}`)
  return `${match[1]}-${match[2]}-${match[3]}`
}

function readRole(title) {
  return title.match(/^美团(.+?)\s+2026/)?.[1] ?? '算法岗'
}

function readDifficulty(body) {
  return body.match(/\*\*难度评级\*\*：([^\n]+)/)?.[1]?.trim() ?? '综合'
}

function readQuestions(body) {
  return [...body.matchAll(/^## (第一题|第二题|第三题|第四题)：(.+)$/gm)].map(
    (match) => ({
      ordinal: ordinalNumbers[match[1]],
      title: match[2].trim()
    })
  )
}

function readTopics(body, questions) {
  const topics = [...body.matchAll(
    /^(?:\d+\.|\*)\s+(?:第一题|第二题|第三题|第四题)：(.+?)(?:（难度[^）]*）)?$/gm
  )].map((match) => match[1].trim().split(/[—（]/)[0].trim())

  return topics.length >= questions.length
    ? topics.slice(0, questions.length)
    : questions.map((question) => question.title)
}

function replaceSampleOutput(section, oldOutput, newOutput) {
  return section.replace(
    `**输出**\n\n\`\`\`\n${oldOutput}\n\`\`\``,
    `**输出**\n\n\`\`\`\n${newOutput}\n\`\`\``
  )
}

const svmAcmCode = `import json
import sys

import numpy as np
from sklearn.metrics import f1_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.svm import OneClassSVM


def main():
    payload = json.loads(sys.stdin.read())
    data = np.asarray(payload["train"], dtype=float)
    test_data = np.asarray(payload["test"], dtype=float)
    nu_list = payload["nu"]
    gamma_list = payload["gamma"]

    features, labels = data[:, :-1], data[:, -1]
    normal = features[labels == 1]
    anomaly = features[labels == -1]

    # 标准化参数只能由训练折计算，避免验证数据泄漏。
    x_train, x_val = train_test_split(
        normal, test_size=0.25, random_state=42
    )
    scaler = StandardScaler()
    x_train = scaler.fit_transform(x_train)
    x_val = scaler.transform(x_val)
    x_anomaly = scaler.transform(anomaly)

    x_eval = np.vstack([x_val, x_anomaly])
    y_eval = np.array([1] * len(x_val) + [-1] * len(x_anomaly))
    results = []

    for nu in nu_list:
        for gamma in gamma_list:
            model = OneClassSVM(kernel="rbf", nu=nu, gamma=gamma)
            model.fit(x_train)
            scores = model.decision_function(x_eval)
            predictions = model.predict(x_eval)
            auc = roc_auc_score(y_eval, scores)
            f1 = f1_score(y_eval, predictions, pos_label=1)
            results.append((auc, f1, nu, gamma))

    # 指标优先级完全按题面规定，保证并列时选择稳定。
    results.sort(key=lambda item: (-item[0], -item[1], item[2], str(item[3])))
    best_auc, best_f1, best_nu, best_gamma = results[0]

    final_scaler = StandardScaler()
    all_normal = final_scaler.fit_transform(normal)
    transformed_test = final_scaler.transform(test_data)
    final_model = OneClassSVM(
        kernel="rbf", nu=best_nu, gamma=best_gamma
    )
    final_model.fit(all_normal)

    output = {
        "nu": best_nu,
        "gamma": best_gamma,
        "auc": round(float(best_auc), 6),
        "f1": round(float(best_f1), 6),
        "predictions": final_model.predict(transformed_test).tolist()
    }
    print(json.dumps(output, ensure_ascii=False))


main()`

function applyVerifiedCorrections(stem, section) {
  if (stem === 'algo-20260328' && section.startsWith('## 01 · 风不吹雨')) {
    return replaceSampleOutput(section, '35', '38')
  }

  if (stem === 'algo-20260328' && section.startsWith('## 02 · SVM异常检测')) {
    return section
      .replace(
        '### 题目描述',
        `### 题目描述

**ACM 输入约定**：标准输入为一个 JSON 对象，包含 \`train\`、\`test\`、\`nu\` 和 \`gamma\`。训练样本最后一列为标签（\`1\` 表示正常、\`-1\` 表示异常）；标准输出为最优参数、验证指标及测试集预测。`
      )
      .replace(/```python\n[\s\S]*?```/, `\`\`\`python\n${svmAcmCode}\n\`\`\``)
  }

  if (stem === 'algo-20260328' && section.startsWith('## 03 · 红黑树浇水')) {
    return section.replace(
      '目标：最小化 红树高度 - 黑树高度 。',
      '目标：最小化红树与黑树最终高度差的绝对值。'
    )
  }

  return section
}

function addChineseCodeHints(body, topics) {
  return body.split(/(?=^## 0[1-4] · )/gm).map((section) => {
    const heading = section.match(/^## (0[1-4]) · (.+?) \{#problem-/m)
    if (!heading) return section

    const topic = topics[Number(heading[1]) - 1] ?? heading[2]
    return section.replace(/```python\n([\s\S]*?)```/, (fence, code) => {
      if (/^\s*#/m.test(code)) return fence

      const hint = `# 核心步骤：${topic}；实现顺序与上文推导保持一致。`
      const inputAssignment = /^(input\s*=\s*sys\.stdin\.readline[^\n]*\n)/m

      if (inputAssignment.test(code)) {
        return `\`\`\`python\n${code.replace(inputAssignment, `$1\n${hint}\n`)}\`\`\``
      }

      return `\`\`\`python\n${hint}\n${code}\`\`\``
    })
  }).join('')
}

function normalizeBody(body, questions, topics, stem) {
  let normalized = body
    .replace(/^\s*# .+\n+/, '')
    .replace(
      /^## (第一题|第二题|第三题|第四题)：(.+)$/gm,
      (_, ordinal, title) => {
        const number = ordinalNumbers[ordinal]
        return `## ${number} · ${title.trim()} {#problem-${number}}`
      }
    )
    .replace(/^### 思路分析$/gm, '### 解题思路')
    .replace(/^### 题解代码$/gm, '### Python ACM 实现')
    .replace(/^### 题解：(.+)$/gm, '### 解题思路：$1')

  const sections = normalized.split(/(?=^## \d{2} · )/gm)
  normalized = sections.map((section) => {
    if (!/^## \d{2} · /m.test(section) || !section.includes('```python')) {
      return applyVerifiedCorrections(stem, section)
    }

    const corrected = applyVerifiedCorrections(stem, section)
    if (corrected.includes('### Python ACM 实现')) return corrected

    return corrected.replace(
      '\n```python',
      '\n### Python ACM 实现\n\n```python'
    )
  }).join('')

  normalized = normalized.replace(
    /### Python ACM 实现\n\n```python\n/g,
    '### Python ACM 实现\n\n下面给出完整标准输入、标准输出程序；除题面明确要求的机器学习库外，可直接提交到 Python ACM 环境。\n\n```python\n'
  )
  normalized = addChineseCodeHints(normalized, topics)

  if (questions.length < 3 || questions.length > 4) {
    throw new Error(`题目数量异常：${questions.map((item) => item.title).join('、')}`)
  }

  return normalized.trim()
}

for (const file of files) {
  const source = await readFile(path.join(sourceDirectory, file), 'utf8')
  const { attributes, body } = readFrontmatter(source)
  const stem = path.basename(file, '.md')
  const date = normalizeDate(stem)
  const role = readRole(attributes.title ?? '')
  const difficulty = readDifficulty(body)
  const questions = readQuestions(body)
  const topics = readTopics(body, questions)
  const sourceUrl = `https://onefly.top/zero2Leetcode/04_real_interviews/meituan/${stem}/`
  const target = path.join(outputDirectory, `meituan-${stem}.md`)
  const topicTags = topics.slice(0, 4).map((topic) => `    <span>${topic}</span>`).join('\n')
  const content = `---
pageClass: exam-session-page
title: 美团${role} ${date}
description: 美团 ${date} ${role}笔试真题，含 ${questions.length} 道 Python ACM 模式题解
---

<div class="exam-session-banner">
  <div>
    <span>MEITUAN / ${date.replaceAll('-', '.')} / ACM</span>
    <strong>美团 · ${role}</strong>
    <small>${date} · ${questions.length} 题 ACM · 难度 ${difficulty}</small>
  </div>
  <div class="exam-session-banner__meta">
${topicTags}
  </div>
</div>

# 美团 ${date} ${role}笔试解析

本场题目按原考试输入输出整理为完整 Python 程序。每题依次说明建模依据、状态或数据结构、正确性理由、边界处理与复杂度。

来源：[Zero2Leetcode · 美团 ${date} ${role}](${sourceUrl})。

${normalizeBody(body, questions, topics, stem)}
`

  await writeFile(target, content)
  catalogSessions.push({
    id: `MT-${stem.toUpperCase()}`,
    company: '美团',
    role,
    date,
    year: date.slice(0, 4),
    href: `/written-tests/meituan-${stem}`,
    difficulty,
    topics: topics.slice(0, 4),
    questions: questions.map((question) => question.title)
  })
  console.log(`generated ${path.relative(projectRoot, target)}`)
}

const dataDirectory = path.join(projectRoot, '.vitepress/theme/data')
await mkdir(dataDirectory, { recursive: true })
await writeFile(
  path.join(dataDirectory, 'meituanWrittenTests.ts'),
  `// 由 scripts/import-meituan.mjs 根据公开题面目录生成。
export const meituanWrittenTests = ${JSON.stringify(catalogSessions, null, 2)}
`
)
