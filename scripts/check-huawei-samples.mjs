import { readFile, readdir } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const projectRoot = path.resolve(import.meta.dirname, '..')
const writtenTests = path.join(projectRoot, 'written-tests')
const files = (await readdir(writtenTests))
  .filter((file) => file.startsWith('huawei-') && file.endsWith('.md'))
  .sort()
const results = []

function normalize(output) {
  return output
    .trim()
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
}

for (const file of files) {
  const markdown = await readFile(path.join(writtenTests, file), 'utf8')
  const sections = markdown.split(/(?=^## 0[1-3] · )/gm)

  for (const section of sections) {
    const title = section.match(/^## (0[1-3]) · (.+?) \{#problem-\d{2}\}$/m)
    if (!title) continue

    const fences = [...section.matchAll(/```([^\n]*)\n([\s\S]*?)```/g)]
    const pythonFence = fences.find((fence) => fence[1].trim() === 'python')
    const examples = fences.filter((fence) => fence[1].trim() !== 'python')
    const label = `${file} / ${title[1]} ${title[2]}`

    if (!pythonFence || examples.length < 2) {
      results.push({ label, status: 'SKIP', detail: '缺少可执行代码或完整样例' })
      continue
    }

    const execution = spawnSync('python3', ['-c', pythonFence[2]], {
      input: examples[0][2],
      encoding: 'utf8',
      timeout: 12000,
      maxBuffer: 8 * 1024 * 1024
    })

    if (execution.error) {
      results.push({
        label,
        status: execution.error.code === 'ETIMEDOUT' ? 'TIMEOUT' : 'ERROR',
        detail: execution.error.message
      })
      continue
    }

    if (
      execution.status !== 0
      && /ModuleNotFoundError: No module named '(numpy|pandas|sklearn|scipy|torch|hdbscan)'/.test(execution.stderr)
    ) {
      results.push({
        label,
        status: 'SKIP',
        detail: '本机未安装题面指定的机器学习依赖'
      })
      continue
    }

    if (execution.status !== 0) {
      results.push({ label, status: 'ERROR', detail: normalize(execution.stderr) })
      continue
    }

    const expected = normalize(examples[1][2])
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
  console.log(`${result.status.padEnd(8)} ${result.label}${result.detail ? ` — ${result.detail}` : ''}`)
}

const counts = Object.groupBy(results, (result) => result.status)
console.log(`\n${Object.entries(counts)
  .map(([status, items]) => `${status}=${items.length}`)
  .join(' ')}`)

if (results.some((result) => ['MISMATCH', 'ERROR', 'TIMEOUT'].includes(result.status))) {
  process.exitCode = 1
}
