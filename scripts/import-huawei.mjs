import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const sourceDirectory = process.argv[2]

if (!sourceDirectory) {
  throw new Error('请传入 Zero2Leetcode 的华为 Markdown 目录')
}

const projectRoot = path.resolve(import.meta.dirname, '..')
const outputDirectory = path.join(projectRoot, 'written-tests')
const files = (await readdir(sourceDirectory))
  .filter((file) => /^(ai|dev)-\d{8}\.md$/.test(file))
  .sort()
const catalogSessions = []

const chineseOrdinals = {
  第一: '01',
  第二: '02',
  第三: '03',
  第四: '04'
}

const questionHeadingPattern = /^## (?:(第一|第二|第三|第四)题|第\s*([1-4])\s*题)：(.+)$/gm

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

function readRole(body, stem) {
  return body.match(/\*\*考试岗位\*\*：([^\n]+)/)?.[1]?.trim()
    ?? (stem.startsWith('ai-') ? 'AI岗' : '研发岗')
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
    /^\d+\.\s+(?:(?:第一|第二|第三|第四)题|第\s*[1-4]\s*题)：(.+?)(?:（难度[^）]*）)?$/gm
  )].map((match) => match[1].trim().split(/[—；。]/)[0].trim())

  return topics.length >= questions.length
    ? topics.slice(0, questions.length)
    : questions.map((question) => question.title)
}

function removeChoiceQuestions(body) {
  const selectionStart = body.search(/^## 选择题[^\n]*$/m)
  const codingStart = body.search(questionHeadingPattern)

  if (selectionStart === -1 || codingStart === -1 || selectionStart > codingStart) {
    return body
  }

  return `${body.slice(0, selectionStart).trimEnd()}\n\n${body.slice(codingStart)}`
}

function addChineseCodeHint(section, topic) {
  return section.replace(/```python\n([\s\S]*?)```/, (fence, code) => {
    if (/^\s*#/m.test(code)) return fence

    const hint = `# 核心步骤：${topic}；按题意读取标准输入并输出结果。`
    const inputAssignment = /^(input\s*=\s*sys\.stdin\.readline[^\n]*\n)/m

    if (inputAssignment.test(code)) {
      return `\`\`\`python\n${code.replace(inputAssignment, `$1\n${hint}\n`)}\`\`\``
    }

    return `\`\`\`python\n${hint}\n${code}\`\`\``
  })
}

function normalizeBody(originalBody, questions, topics, stem) {
  let body = removeChoiceQuestions(originalBody)
    .replace(/^\s*# .+\n+/, '')
    .replace(
      /^## (?:(第一|第二|第三|第四)题|第\s*([1-4])\s*题)：(.+)$/gm,
      (_, chinese, digit, title) => {
        const number = chinese ? chineseOrdinals[chinese] : digit.padStart(2, '0')
        return `## ${number} · ${title.trim()} {#problem-${number}}`
      }
    )
    .replace(/^### 思路分析$/gm, '### 解题思路')
    .replace(/^### 题解：(.+)$/gm, '### 解题思路\n\n**方法**：$1')
    .replace(/^### 题解$/gm, '### 解题思路')
    .replace(/^### 题解代码[^\n]*\n*/gm, '')

  const sections = body.split(/(?=^## \d{2} · )/gm)
  body = sections.map((section) => {
    const heading = section.match(/^## (0[1-4]) · (.+?) \{#problem-/m)
    if (!heading) return section

    let normalized = section
    if (stem === 'dev-20260415' && heading[1] === '03') {
      normalized = normalized
        .replace(
          'createWindow window3 70 90 50 3',
          'createWindow window3 70 90 50 50 3'
        )
        .replace(
          'true\ntrue\ntrue\ntrue\nfalse\ntrue\nfalse\ntrue\nwindow3;window1',
          'true\ntrue\ntrue\ntrue\ntrue\nfalse\ntrue\nwindow3;window1'
        )
        .replace(
          '        line = input().strip()\n        if not line:\n            continue',
          '        line = input()\n        if not line:\n            break\n        line = line.strip()\n        if not line:\n            continue'
        )
    }

    if (!normalized.includes('### 复杂度分析') && normalized.includes('**时间复杂度**')) {
      normalized = normalized.replace(
        '\n**时间复杂度**',
        '\n### 复杂度分析\n\n**时间复杂度**'
      )
    }

    if (!normalized.includes('### Python ACM 实现')) {
      normalized = normalized.replace(
        '\n```python',
        '\n### Python ACM 实现\n\n```python'
      )
    }

    normalized = normalized.replace(
      /### Python ACM 实现\n\n```python\n/g,
      '### Python ACM 实现\n\n下面给出完整标准输入、标准输出程序，可直接提交到对应的 Python ACM 环境；题面明确要求机器学习库时按要求安装依赖。\n\n```python\n'
    )

    const topic = topics[Number(heading[1]) - 1] ?? heading[2]
    return addChineseCodeHint(normalized, topic)
  }).join('')

  if (questions.length < 2 || questions.length > 3) {
    throw new Error(`题目数量异常：${questions.map((item) => item.title).join('、')}`)
  }

  return body.trim()
}

for (const file of files) {
  const source = await readFile(path.join(sourceDirectory, file), 'utf8')
  const { body } = readFrontmatter(source)
  const stem = path.basename(file, '.md')
  const date = normalizeDate(stem)
  const role = readRole(body, stem)
  const difficulty = readDifficulty(body)
  const questions = readQuestions(body)
  const topics = readTopics(body, questions)
  const sourceUrl = `https://onefly.top/zero2Leetcode/04_real_interviews/huawei/${stem}/`
  const target = path.join(outputDirectory, `huawei-${stem}.md`)
  const topicTags = topics.map((topic) => `    <span>${topic}</span>`).join('\n')
  const content = `---
pageClass: exam-session-page
title: 华为${role} ${date}
description: 华为 ${date} ${role}笔试真题，含 ${questions.length} 道 Python ACM 模式题解
---

<div class="exam-session-banner">
  <div>
    <span>HUAWEI / ${date.replaceAll('-', '.')} / ACM</span>
    <strong>华为 · ${role}</strong>
    <small>${date} · ${questions.length} 题 ACM · 难度 ${difficulty}</small>
  </div>
  <div class="exam-session-banner__meta">
${topicTags}
  </div>
</div>

# 华为 ${date} ${role}笔试解析

本场仅整理需要编程实现的题目，并统一为完整 Python ACM 程序。每题保留标准输入输出、解题依据、关键实现、复杂度与中文注释；AI 岗的选择题不混入本模块。

来源：[Zero2Leetcode · 华为 ${date} ${role}](${sourceUrl})。

${normalizeBody(body, questions, topics, stem)}
`

  await writeFile(target, content)
  catalogSessions.push({
    id: `HW-WRITTEN-${stem.toUpperCase()}`,
    company: '华为',
    role,
    date,
    year: date.slice(0, 4),
    href: `/written-tests/huawei-${stem}`,
    difficulty,
    topics,
    questions: questions.map((question) => question.title)
  })
  console.log(`generated ${path.relative(projectRoot, target)}`)
}

const dataDirectory = path.join(projectRoot, '.vitepress/theme/data')
await mkdir(dataDirectory, { recursive: true })
await writeFile(
  path.join(dataDirectory, 'huaweiWrittenTests.ts'),
  `// 由 scripts/import-huawei.mjs 根据公开题面目录生成。
export const huaweiWrittenTests = ${JSON.stringify(catalogSessions, null, 2)}
`
)
