import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()
const contentRoot = path.join(
  projectRoot,
  'modules',
  'company-interview-questions'
)

const contentFiles = [
  'operating-system.md',
  'network.md',
  'database.md',
  'redis-cache.md',
  'distributed.md',
  'system-design.md'
]

const requiredSections = [
  {
    label: '面试回答',
    pattern: /^### (?:面试回答|(?:60|90) 秒面试回答)$/m
  },
  {
    label: '常见误区',
    pattern: /^### 面试中容易说错$/m
  },
  {
    label: '追问',
    pattern: /^### 常见追问与回答$/m
  },
  {
    label: '自测',
    pattern: /^### 自测$/m
  },
  {
    label: '技术资料',
    pattern: /^### 技术资料$/m
  }
]

const questions = []
const failures = []

for (const fileName of contentFiles) {
  const absolutePath = path.join(contentRoot, fileName)
  const markdown = fs.readFileSync(absolutePath, 'utf8')
  const headingPattern = /^## CQ(\d{2}) · (.+)$/gm
  const headings = [...markdown.matchAll(headingPattern)]

  headings.forEach((heading, index) => {
    const start = heading.index
    const end = headings[index + 1]?.index ?? markdown.length
    const chunk = markdown.slice(start, end)
    const id = Number(heading[1])
    const title = heading[2].trim()

    questions.push({ id, title, fileName })

    for (const section of requiredSections) {
      if (!section.pattern.test(chunk)) {
        failures.push(`CQ${heading[1]} 缺少“${section.label}”：${fileName}`)
      }
    }

    if (!/https?:\/\//.test(chunk)) {
      failures.push(`CQ${heading[1]} 没有可追溯的外部技术资料：${fileName}`)
    }
  })
}

questions.sort((left, right) => left.id - right.id)

for (let index = 0; index < questions.length; index += 1) {
  const expectedId = index + 1
  const question = questions[index]

  if (question.id !== expectedId) {
    failures.push(
      `CQ 编号应连续：位置 ${expectedId} 实际为 CQ${String(question.id).padStart(2, '0')}`
    )
  }
}

const duplicateIds = questions
  .filter((question, index) => questions[index - 1]?.id === question.id)
  .map((question) => question.id)

for (const duplicateId of new Set(duplicateIds)) {
  failures.push(`CQ${String(duplicateId).padStart(2, '0')} 编号重复`)
}

const readme = fs.readFileSync(path.join(contentRoot, 'README.md'), 'utf8')
const declaredCountMatch = readme.match(/后端核心\s+(\d+)\s+道题总览/)
const declaredCount = Number(declaredCountMatch?.[1])

if (!declaredCountMatch) {
  failures.push('README 未声明“后端核心 N 道题总览”')
} else if (declaredCount !== questions.length) {
  failures.push(
    `README 声明 ${declaredCount} 题，实际解析到 ${questions.length} 题`
  )
}

if (failures.length > 0) {
  console.error('大厂面试真题内容检查失败：')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log(
  `大厂面试真题内容检查通过：${questions.length} 道 CQ 题目编号连续，结构与来源齐全。`
)
