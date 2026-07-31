import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const specialtyDirectory = path.join(root, 'modules/nlp-llm-agent')
const agentCoreDirectory = path.join(
  root,
  'modules/company-interview-questions/agent-core'
)
const chapterFiles = [
  'nlp-transformer.md',
  'pretraining-data.md',
  'posttraining-peft.md',
  'rag-search.md',
  'inference-systems.md'
]
const allFiles = ['README.md', ...chapterFiles]
const agentCoreFiles = [
  'README.md',
  'runtime-harness.md',
  'tool-engineering.md',
  'context-memory.md',
  'evaluation.md',
  'security-governance.md',
  'observability-cost.md',
  'protocols-multi-agent.md'
]

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

const chapterCoverage = {
  'nlp-transformer.md': [
    'Tokenization',
    'Scaled Dot-Product Attention',
    'MLA',
    'NSA',
    'DSA',
    'MoBA',
    'KDA',
    'Attention Residuals',
    'Gated DeltaNet'
  ],
  'pretraining-data.md': [
    'Perplexity',
    '数据混合',
    'Benchmark 污染',
    'Chinchilla',
    '混合精度',
    '分布式并行',
    '训练稳定性'
  ],
  'posttraining-peft.md': [
    'SFT',
    'Reward Model',
    'PPO',
    'DPO',
    'GRPO',
    'RLVR',
    'DeepSeek-R1',
    'Kimi k1.5',
    'Qwen3',
    'LoRA',
    'QLoRA'
  ],
  'rag-search.md': [
    'BM25',
    'Dense Retrieval',
    'ANN',
    'RRF',
    'Reranker',
    '权限',
    '引用',
    '分层评估'
  ],
  'inference-systems.md': [
    'Prefill',
    'Decode',
    'KV Cache',
    'Continuous Batching',
    'PagedAttention',
    'FlashAttention',
    '量化',
    'Speculative Decoding',
    '容量规划'
  ],
  'agent-core/runtime-harness.md': [
    'Agent Loop',
    '检查点',
    '暂停、审批与恢复',
    '幂等',
    '预算'
  ],
  'agent-core/tool-engineering.md': [
    '工具契约',
    '结构化错误',
    '策略引擎',
    '最小权限',
    '审批',
    '沙箱',
    'MCP'
  ],
  'agent-core/context-memory.md': [
    'Context Builder',
    '渐进式披露',
    '结构化摘要',
    '长期记忆',
    '冲突、纠错与遗忘',
    '上下文污染'
  ],
  'agent-core/evaluation.md': [
    '最终结果评估',
    '轨迹与过程评估',
    '组件评估',
    'LLM-as-judge',
    '切片',
    '发布门禁',
    '线上闭环'
  ],
  'agent-core/security-governance.md': [
    'Prompt Injection',
    '越权',
    '数据泄漏',
    'SSRF',
    '记忆污染',
    '供应链',
    'OWASP Agentic Top 10'
  ],
  'agent-core/observability-cost.md': [
    'Trace',
    'Span',
    'Metric',
    'SLO',
    '预算控制',
    '成本'
  ],
  'agent-core/protocols-multi-agent.md': [
    '函数调用',
    'MCP',
    'A2A',
    '多 Agent',
    'Orchestrator–Worker',
    '身份与授权',
    '取消'
  ]
}

const agentRequiredSections = [
  '90 秒面试回答',
  '常见失败设计',
  '最佳实践清单',
  '高频追问',
  '自测',
  '权威资料'
]

const errors = []
const documents = new Map()
const documentPaths = new Map()

for (const relativeFile of allFiles) {
  const absoluteFile = path.join(specialtyDirectory, relativeFile)

  if (!fs.existsSync(absoluteFile)) {
    errors.push(`缺少专题文件：${relativeFile}`)
    continue
  }

  documents.set(relativeFile, fs.readFileSync(absoluteFile, 'utf8'))
  documentPaths.set(relativeFile, absoluteFile)
}

for (const relativeFile of agentCoreFiles) {
  const documentKey = `agent-core/${relativeFile}`
  const absoluteFile = path.join(agentCoreDirectory, relativeFile)

  if (!fs.existsSync(absoluteFile)) {
    errors.push(`缺少 Agent 核心工程文件：${relativeFile}`)
    continue
  }

  documents.set(documentKey, fs.readFileSync(absoluteFile, 'utf8'))
  documentPaths.set(documentKey, absoluteFile)
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

for (const relativeFile of agentCoreFiles.slice(1)) {
  const documentKey = `agent-core/${relativeFile}`
  const document = documents.get(documentKey)
  if (!document) continue

  for (const section of agentRequiredSections) {
    if (!document.includes(section)) {
      errors.push(`${documentKey} 缺少章节：${section}`)
    }
  }

  if (!document.includes('```python')) {
    errors.push(`${documentKey} 缺少 Python 示例`)
  }

  const externalReferences = document.match(/\]\(https:\/\/[^)]+\)/g) ?? []
  if (externalReferences.length < 4) {
    errors.push(`${documentKey} 的权威外部资料少于 4 条`)
  }
}

for (const [documentKey, topics] of Object.entries(chapterCoverage)) {
  const document = documents.get(documentKey)
  if (!document) continue

  for (const topic of topics) {
    if (!document.includes(topic)) {
      errors.push(`${documentKey} 没有覆盖核心主题：${topic}`)
    }
  }
}

const combinedContent = [...documents.values()].join('\n')

for (const topic of requiredCoverage) {
  if (!combinedContent.includes(topic)) {
    errors.push(`专题没有覆盖关键主题：${topic}`)
  }
}

const markdownLinkPattern = /\]\(([^)]+)\)/g
for (const [documentKey, document] of documents) {
  const absoluteFile = documentPaths.get(documentKey)
  if (!absoluteFile) continue

  const sourceDirectory = path.dirname(absoluteFile)

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
      errors.push(`${documentKey} 包含无效内部链接：${target}`)
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
  `NLP / LLM / Agent 专题检查通过：${documents.size} 个页面，`
  + `${requiredCoverage.length} 个全局主题，`
  + `${Object.keys(chapterCoverage).length} 个章节覆盖矩阵。`
)
