import { readFile, readdir } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const projectRoot = path.resolve(import.meta.dirname, '..')
const writtenTests = path.join(projectRoot, 'written-tests')
const files = (await readdir(writtenTests))
  .filter((file) => file.startsWith('meituan-') && file.endsWith('.md'))
  .sort()
const results = []

function normalize(output) {
  return output
    .trim()
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
}

function validateConstructiveOutput(title, inputText, outputText) {
  if (title === '最长非重复子串') {
    const [n, k] = inputText.trim().split(/\s+/).map(Number)
    const candidate = outputText.trim()
    if (candidate.length !== n || !/^[a-z]+$/.test(candidate)) return false

    let longest = 0
    let count = 0
    for (let left = 0; left < n; left += 1) {
      const seen = new Set()
      for (let right = left; right < n; right += 1) {
        if (seen.has(candidate[right])) break
        seen.add(candidate[right])
        const length = right - left + 1
        if (length > longest) {
          longest = length
          count = 1
        } else if (length === longest) {
          count += 1
        }
      }
    }
    return count === k
  }

  if (title === '正整数矩阵') {
    const input = inputText.trim().split(/\s+/).map(Number)
    const output = outputText.trim().split(/\s+/)
    let inputIndex = 1
    let outputIndex = 0

    for (let caseIndex = 0; caseIndex < input[0]; caseIndex += 1) {
      const n = input[inputIndex]
      const m = input[inputIndex + 1]
      inputIndex += 2
      let total = 0
      for (let i = 0; i < n * m; i += 1) total += input[inputIndex + i]
      inputIndex += n * m

      const possible = n % 2 === 1 && m % 2 === 1
        ? true
        : n % 2 === 1 || m % 2 === 1
          ? total % 2 === 0
          : total % 4 === 0

      if (output[outputIndex] === '-1') {
        if (possible) return false
        outputIndex += 1
        continue
      }
      if (!possible || outputIndex + n * m > output.length) return false

      const matrix = Array.from({ length: n }, () => Array(m))
      let candidateTotal = 0
      for (let i = 0; i < n; i += 1) {
        for (let j = 0; j < m; j += 1) {
          const value = Number(output[outputIndex])
          if (!Number.isInteger(value) || value < 0) return false
          outputIndex += 1
          matrix[i][j] = value
          candidateTotal += value
        }
      }
      if (candidateTotal !== total) return false
      for (let i = 0; i < n; i += 1) {
        for (let j = 0; j < m; j += 1) {
          if (
            matrix[i][j] !== matrix[n - 1 - i][j]
            || matrix[i][j] !== matrix[i][m - 1 - j]
          ) return false
        }
      }
    }

    return outputIndex === output.length
  }

  return null
}

for (const file of files) {
  const markdown = await readFile(path.join(writtenTests, file), 'utf8')
  const sections = markdown.split(/(?=^## 0[1-4] · )/gm)

  for (const section of sections) {
    const title = section.match(/^## (0[1-4]) · (.+?) \{#problem-\d{2}\}$/m)
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
      timeout: 8000,
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
      && /ModuleNotFoundError: No module named '(numpy|sklearn)'/.test(execution.stderr)
    ) {
      results.push({
        label,
        status: 'SKIP',
        detail: '本机未安装题面指定的 NumPy / scikit-learn 依赖'
      })
      continue
    }

    if (execution.status !== 0) {
      results.push({ label, status: 'ERROR', detail: normalize(execution.stderr) })
      continue
    }

    const expected = normalize(examples[1][2])
    const actual = normalize(execution.stdout)
    const constructiveResult = validateConstructiveOutput(
      title[2],
      examples[0][2],
      execution.stdout
    )
    const passed = constructiveResult ?? actual === expected
    results.push({
      label,
      status: passed ? 'PASS' : 'MISMATCH',
      detail: passed
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
