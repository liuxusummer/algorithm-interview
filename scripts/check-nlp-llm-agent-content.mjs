import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const specialtyDirectory = path.join(root, 'modules/nlp-llm-agent')
const chapterFiles = [
  'nlp-transformer.md',
  'pretraining-data.md',
  'posttraining-peft.md',
  'rag-search.md',
  'inference-systems.md'
]
const allFiles = ['README.md', ...chapterFiles]

const requiredSections = [
  '90 秒面试回答',
  '失败案例',
  '常见误区',
  '递进追问',
  '自测',
  '权威资料'
]

const requiredCoverage = [
  'Tokenization',
  'Transformer',
  '预训练',
  '数据治理',
  'SFT',
  'RLHF',
  'DPO',
  'LoRA',
  'QLoRA',
  'RAG',
  'Agent Runtime',
  '上下文',
  '结构化输出',
  'Agent 评估',
  '最小权限',
  'KV Cache',
  'MCP',
  'A2A',
  '多 Agent'
]

const errors = []
const documents = new Map()

for (const relativeFile of allFiles) {
  const absoluteFile = path.join(specialtyDirectory, relativeFile)

  if (!fs.existsSync(absoluteFile)) {
    errors.push(`缺少专题文件：${relativeFile}`)
    continue
  }

  documents.set(relativeFile, fs.readFileSync(absoluteFile, 'utf8'))
}

for (const relativeFile of chapterFiles) {
  const document = documents.get(relativeFile)
  if (!document) continue

  for (const section of requiredSections) {
    if (!document.includes(section)) {
      errors.push(`${relativeFile} 缺少章节：${section}`)
    }
  }

  if (!document.includes('```python')) {
    errors.push(`${relativeFile} 缺少 Python 示例`)
  }

  const externalReferences = document.match(/\]\(https:\/\/[^)]+\)/g) ?? []
  if (externalReferences.length < 4) {
    errors.push(`${relativeFile} 的权威外部资料少于 4 条`)
  }
}

const combinedContent = [...documents.values()].join('\n')

for (const topic of requiredCoverage) {
  if (!combinedContent.includes(topic)) {
    errors.push(`专题没有覆盖关键主题：${topic}`)
  }
}

const markdownLinkPattern = /\]\(([^)]+)\)/g
for (const [relativeFile, document] of documents) {
  const sourceDirectory = path.dirname(
    path.join(specialtyDirectory, relativeFile)
  )

  for (const match of document.matchAll(markdownLinkPattern)) {
    const target = match[1]
    if (
      target.startsWith('http://')
      || target.startsWith('https://')
      || target.startsWith('#')
      || target.startsWith('mailto:')
    ) {
      continue
    }

    const pathWithoutAnchor = target.split('#')[0]
    if (!pathWithoutAnchor) continue

    const resolvedPath = path.resolve(sourceDirectory, pathWithoutAnchor)
    const candidates = path.extname(resolvedPath)
      ? [resolvedPath]
      : [
          resolvedPath,
          `${resolvedPath}.md`,
          path.join(resolvedPath, 'README.md')
        ]

    if (!candidates.some((candidate) => fs.existsSync(candidate))) {
      errors.push(`${relativeFile} 包含无效内部链接：${target}`)
    }
  }
}

if (errors.length > 0) {
  console.error('NLP / LLM / Agent 专题检查失败：')
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log(
  `NLP / LLM / Agent 专题检查通过：${allFiles.length} 个页面，`
  + `${requiredCoverage.length} 个关键主题。`
)
