import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const sourceDirectory = process.argv[2]

if (!sourceDirectory) {
  throw new Error('请传入 Zero2Leetcode 的阿里巴巴 Markdown 目录')
}

const projectRoot = path.resolve(import.meta.dirname, '..')
const outputDirectory = path.join(projectRoot, 'written-tests')
const files = (await readdir(sourceDirectory))
  .filter((file) => file.endsWith('.md'))
  .sort()
const catalogSessions = []

await mkdir(outputDirectory, { recursive: true })

function readFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n/)
  const attributes = {}

  if (!match) {
    return { attributes, body: markdown }
  }

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
  const match = title.match(/^阿里(?:巴巴)?(.+?)\s+2026/)
  return match?.[1] ?? '算法岗'
}

function readDifficulty(body) {
  return body.match(/\*\*难度评级\*\*：([^\n]+)/)?.[1]?.trim() ?? '综合'
}

function readQuestions(body) {
  return [...body.matchAll(/^## (第一题|第二题|第三题)：(.+)$/gm)].map((match) => ({
    ordinal: { 第一题: '01', 第二题: '02', 第三题: '03' }[match[1]],
    title: match[2].trim()
  }))
}

function readTopics(body) {
  const topics = [...body.matchAll(
    /^\d+\.\s+(?:第一题|第二题|第三题)：(.+?)(?:（难度[^）]*）)?$/gm
  )].map((match) => match[1].trim().split(/[—（]/)[0].trim())

  if (topics.length >= 3) return topics.slice(0, 3)

  return readQuestions(body).map((question) => question.title)
}

const zeroToggleFenwickSolution = `import sys

input = sys.stdin.readline


def tri(length):
    return length * (length + 1) // 2


class Fenwick:
    def __init__(self, size):
        self.size = size
        self.tree = [0] * (size + 1)

    def add(self, index, delta):
        while index <= self.size:
            self.tree[index] += delta
            index += index & -index

    def prefix_sum(self, index):
        total = 0
        while index > 0:
            total += self.tree[index]
            index -= index & -index
        return total

    def kth(self, order):
        """返回第 order 个 0 所在的位置，order 从 1 开始。"""
        index = 0
        step = 1 << (self.size.bit_length() - 1)
        while step:
            next_index = index + step
            if next_index <= self.size and self.tree[next_index] < order:
                index = next_index
                order -= self.tree[next_index]
            step >>= 1
        return index + 1


def main():
    n, q = map(int, input().split())
    bits = list(input().strip())
    zeros = Fenwick(n)
    zero_count = 0

    total = 0
    run = 0
    for index, value in enumerate(bits, 1):
        if value == "0":
            zeros.add(index, 1)
            zero_count += 1
            total += tri(run)
            run = 0
        else:
            run += 1
    total += tri(run)

    def neighbors(position):
        # 统计左侧 0 的数量，再用 Fenwick 二分找到前驱和后继。
        left_count = zeros.prefix_sum(position - 1)
        left_zero = zeros.kth(left_count) if left_count else 0
        right_zero = zeros.kth(left_count + 1) if left_count < zero_count else n + 1
        return left_zero, right_zero

    answers = []
    for _ in range(q):
        position = int(input())

        if bits[position - 1] == "1":
            left_zero, right_zero = neighbors(position)
            left_length = position - left_zero - 1
            right_length = right_zero - position - 1
            total += (
                tri(left_length)
                + tri(right_length)
                - tri(left_length + right_length + 1)
            )
            zeros.add(position, 1)
            zero_count += 1
            bits[position - 1] = "0"
        else:
            # 先从集合删除当前位置，再查询两侧仍然存在的 0。
            zeros.add(position, -1)
            zero_count -= 1
            left_zero, right_zero = neighbors(position)
            left_length = position - left_zero - 1
            right_length = right_zero - position - 1
            total += (
                tri(left_length + right_length + 1)
                - tri(left_length)
                - tri(right_length)
            )
            bits[position - 1] = "1"

        answers.append(str(total))

    sys.stdout.write("\\n".join(answers))


main()`

function replaceSampleOutput(section, oldOutput, newOutput) {
  return section.replace(
    `**输出**\n\n\`\`\`\n${oldOutput}\n\`\`\``,
    `**输出**\n\n\`\`\`\n${newOutput}\n\`\`\``
  )
}

function applyVerifiedCorrections(stem, section) {
  if (stem === 'algo-20260325' && section.startsWith('## 01 · 三星数字')) {
    return replaceSampleOutput(section, '2 4\n3 5\n-1', '1 2\n7 14\n-1')
  }

  if (stem === 'algo-20260325' && section.startsWith('## 02 · 该博弈了')) {
    return replaceSampleOutput(section, '0', '1')
  }

  if (stem === 'algo-20260411' && section.startsWith('## 02 · 凑对')) {
    return replaceSampleOutput(
      section,
      '-1\n7 8 5 4 1 9 2 12 3 11 6 10',
      '-1\n1 7 3 9 5 11 2 8 4 10 6 12'
    )
  }

  if (stem === 'algo-20260418' && section.startsWith('## 02 · 最短就餐距离')) {
    return replaceSampleOutput(section, '0\n0\n3', '0\n1\n3')
  }

  if (stem === 'algo-20260418' && section.startsWith('## 03 · 最大权值')) {
    return replaceSampleOutput(section, '6\n14\n0', '9\n14\n0')
  }

  if (stem === 'algo-20260516' && section.startsWith('## 03 · 小红的 01 串操作')) {
    return section
      .replace(
        /```python\nimport sys\nfrom sortedcontainers[\s\S]*?\nmain\(\)\n```/,
        `\`\`\`python\n${zeroToggleFenwickSolution}\n\`\`\``
      )
      .replace(
        /\*\*时间复杂度\*\*：\$O\(\(n \+ q\) \\log n\)\$，每次操作在有序集合上做 \$O\(\\log n\)\$ 的查找\/插入\/删除。/,
        '**时间复杂度**：$O((n + q) \\log n)$，每次操作通过树状数组完成前驱、后继与单点更新。'
      )
      .replace(
        /\*\*空间复杂度\*\*：\$O\(n\)\$，存储有序集合。/,
        '**空间复杂度**：$O(n)$，存储字符串与树状数组。'
      )
      .replace(
        /用有序集合（`SortedList`）维护所有 \$0\$ 的位置，加入哨兵 \$0\$ 和 \$n\+1\$，这样任何位置的左右最近 \$0\$ 都能通过二分查找在 \$O\(\\log n\)\$ 时间内定位。/,
        '用树状数组维护每个位置是否为 $0$。前缀和给出左侧 $0$ 的数量，再用树状数组二分找到对应的前驱和后继；边界用虚拟位置 $0$ 与 $n+1$ 表示。'
      )
  }

  return section
}

function addChineseCodeHints(body, topics) {
  return body.split(/(?=^## 0[123] · )/gm).map((section) => {
    const heading = section.match(/^## (0[123]) · (.+?) \{#problem-/m)
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
    .replace(/^## (第一题|第二题|第三题)：(.+)$/gm, (_, ordinal, title) => {
      const number = { 第一题: '01', 第二题: '02', 第三题: '03' }[ordinal]
      return `## ${number} · ${title.trim()} {#problem-${number}}`
    })
    .replace(/^### 思路分析$/gm, '### 解题思路')
    .replace(/^### 题解代码$/gm, '### Python ACM 实现')
    .replace(/^### 题解：(.+)$/gm, '### 解题思路：$1')

  // 有一部分原文直接在“题解：...”后给出代码，补齐统一的实现标题。
  const sections = normalized.split(/(?=^## \d{2} · )/gm)
  normalized = sections.map((section) => {
    if (!/^## \d{2} · /m.test(section) || !section.includes('```python')) {
      return applyVerifiedCorrections(stem, section)
    }

    if (section.includes('### Python ACM 实现')) {
      return applyVerifiedCorrections(stem, section)
    }

    return applyVerifiedCorrections(stem, section.replace(
      '\n```python',
      '\n### Python ACM 实现\n\n```python'
    ))
  }).join('')

  // 统一代码入口说明，提醒读者这是完整 ACM 程序而非 LeetCode 函数模板。
  normalized = normalized.replace(
    /### Python ACM 实现\n\n```python\n/g,
    '### Python ACM 实现\n\n下面的程序可直接提交到 ACM 判题环境，严格按本题样例的标准输入顺序读取。\n\n```python\n'
  )
  normalized = normalized.replace('sys.setrecursionlimit(1)', 'sys.setrecursionlimit(1_000_000)')
  normalized = addChineseCodeHints(normalized, topics)

  if (questions.length !== 3) {
    throw new Error(`题目数量不是 3：${questions.map((item) => item.title).join('、')}`)
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
  const topics = readTopics(body)
  const sourceUrl = `https://onefly.top/zero2Leetcode/04_real_interviews/alibaba/${stem}/`
  const target = path.join(outputDirectory, `alibaba-${stem}.md`)
  const topicTags = topics.map((topic) => `    <span>${topic}</span>`).join('\n')
  const content = `---
pageClass: exam-session-page
title: 阿里巴巴${role} ${date}
description: 阿里巴巴 ${date} ${role}笔试真题，含三道 Python ACM 模式题解
---

<div class="exam-session-banner">
  <div>
    <span>ALIBABA / ${date.replaceAll('-', '.')} / ACM</span>
    <strong>阿里巴巴 · ${role}</strong>
    <small>${date} · 三题 ACM · 难度 ${difficulty}</small>
  </div>
  <div class="exam-session-banner__meta">
${topicTags}
  </div>
</div>

# 阿里巴巴 ${date} ${role}笔试解析

本场三道题均按原场次输入输出组织为完整 Python 程序，可直接在 ACM 环境运行。讲解重点包括建模、优化依据、实现细节与复杂度。

来源：[Zero2Leetcode · 阿里巴巴 ${date} ${role}](${sourceUrl})。

${normalizeBody(body, questions, topics, stem)}
`

  await writeFile(target, content)
  catalogSessions.push({
    id: `ALI-${stem.replace('alibaba-', '').toUpperCase()}`,
    company: '阿里巴巴',
    role: role.replace('AI研发岗', 'AI 研发岗').replace('AI算法岗', 'AI 算法岗'),
    date,
    year: date.slice(0, 4),
    href: `/written-tests/alibaba-${stem}`,
    difficulty,
    topics: topics.slice(0, 3),
    questions: questions.map((question) => question.title)
  })
  console.log(`generated ${path.relative(projectRoot, target)}`)
}

const dataDirectory = path.join(projectRoot, '.vitepress/theme/data')
await mkdir(dataDirectory, { recursive: true })
await writeFile(
  path.join(dataDirectory, 'alibabaWrittenTests.ts'),
  `// 由 scripts/import-alibaba.mjs 根据公开题面目录生成。
export const alibabaWrittenTests = ${JSON.stringify(catalogSessions, null, 2)}
`
)
