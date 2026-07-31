import { readFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const projectRoot = path.resolve(import.meta.dirname, '..')
const writtenTests = path.join(projectRoot, 'written-tests')
const catalogPath = path.join(
  projectRoot,
  '.vitepress',
  'theme',
  'data',
  'remainingWrittenTests.ts'
)
const catalogSource = await readFile(catalogPath, 'utf8')
const arrayStart = catalogSource.indexOf('[')
const arrayEnd = catalogSource.lastIndexOf(']')
const sessions = JSON.parse(
  catalogSource.slice(arrayStart, arrayEnd + 1)
)
const files = sessions
  .map((session) => (
    `${session.href.replace(/^\/written-tests\//u, '')}.md`
  ))
  .sort()
const expectedQuestionCount = sessions.reduce(
  (total, session) => total + session.questions.length,
  0
)

function normalize(output) {
  return output
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .join('\n')
}

function readLabeledFence(section, label) {
  const pattern = new RegExp(
    `\\*\\*${label}\\*\\*\\s*\\n\\s*\`\`\`[^\\n]*\\n([\\s\\S]*?)\`\`\``
  )
  return section.match(pattern)?.[1]
}

const results = []

for (const file of files) {
  const markdown = await readFile(path.join(writtenTests, file), 'utf8')
  const sections = markdown.split(/(?=^## 0[1-4] · )/gm)

  for (const section of sections) {
    const title = section.match(
      /^## (0[1-4]) · (.+?) \{#problem-\d{2}\}$/m
    )
    if (!title) continue

    const code = section.match(/```python\n([\s\S]*?)```/)?.[1]
    const sampleInput = readLabeledFence(section, '输入')
    const sampleOutput = readLabeledFence(section, '输出')
    const label = `${file} / ${title[1]} ${title[2]}`

    if (!code || sampleInput === undefined || sampleOutput === undefined) {
      results.push({
        label,
        status: 'ERROR',
        detail: '缺少 Python 代码或完整样例'
      })
      continue
    }

    const execution = spawnSync('python3', ['-c', code], {
      input: sampleInput,
      encoding: 'utf8',
      timeout: 20000,
      maxBuffer: 16 * 1024 * 1024
    })

    if (execution.error) {
      results.push({
        label,
        status: execution.error.code === 'ETIMEDOUT' ? 'TIMEOUT' : 'ERROR',
        detail: execution.error.message
      })
      continue
    }

    if (execution.status !== 0) {
      results.push({
        label,
        status: 'ERROR',
        detail: normalize(execution.stderr)
      })
      continue
    }

    const expected = normalize(sampleOutput)
    const actual = normalize(execution.stdout)
    results.push({
      label,
      status: actual === expected ? 'PASS' : 'MISMATCH',
      detail: actual === expected
        ? ''
        : `expected=${JSON.stringify(expected)} actual=${JSON.stringify(actual)}`
    })
  }
}

for (const result of results) {
  console.log(
    `${result.status.padEnd(8)} ${result.label}`
    + (result.detail ? ` — ${result.detail}` : '')
  )
}

const counts = Object.groupBy(results, (result) => result.status)
console.log(`\n${Object.entries(counts)
  .map(([status, items]) => `${status}=${items.length}`)
  .join(' ')}`)

if (
  files.length !== sessions.length
  || results.length !== expectedQuestionCount
) {
  console.error(
    `覆盖数异常：files=${files.length}/${sessions.length}`
    + ` questions=${results.length}/${expectedQuestionCount}`
  )
  process.exitCode = 1
}

if (results.some((result) => result.status !== 'PASS')) {
  process.exitCode = 1
}
