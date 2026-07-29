import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDirectory, '..')
const problemDirectory = path.join(projectRoot, 'problems')

const tagAliases = {
  腾讯面试: '腾讯面试题',
  归并: '归并排序',
  普通数组: '数组',
  普通数组与矩阵: '数组与矩阵',
  模板: '模板题'
}

const companyTags = [
  '华为面试题',
  '字节面试题',
  '腾讯面试题'
]

const sourceTags = new Set([
  'Hot100',
  '大厂面试',
  '华为面试题',
  '字节面试题',
  '腾讯面试题',
  '腾讯原创题单',
  '字节原创题单',
  '华为原创题单',
  '本站原创',
  '原创单',
  '模板题'
])

const algorithmFamilies = [
  [
    '双指针与滑动窗口',
    /双指针|快慢指针|滑动窗口|综合指针|双向扫描|指针分组|Floyd 判圈/u
  ],
  ['链表', /链表|局部反转|分组反转/u],
  ['字符串', /字符串|匹配|KMP|回文/u],
  ['动态规划', /动态规划|\bDP\b|背包|状态机|余数状态/iu],
  ['贪心', /贪心|摩尔投票/u],
  ['哈希与计数', /哈希|计数|频次|原地标记/u],
  ['栈与队列', /栈|队列/u],
  ['排序', /排序|归并/u],
  ['树与递归', /二叉树|树遍历|树构造|递归|中序|树形/u],
  [
    '搜索与图论',
    /回溯|\bDFS\b|\bBFS\b|搜索|图论|拓扑|Dijkstra|并查集/iu
  ],
  ['二分查找', /二分|旋转数组/u],
  ['数组与矩阵', /数组|矩阵/u],
  ['数学与概率', /数学|数论|概率|随机|拒绝采样/u],
  ['堆与优先队列', /堆|优先队列/u],
  ['前缀和', /前缀和/u],
  ['模拟', /模拟/u],
  ['数据结构设计', /设计|缓存/u]
]

function readAttribute(source, name) {
  return source.match(new RegExp(`${name}="([^"]*)"`))?.[1]
}

function normalizeTags(tags) {
  return [...new Set(tags.map((tag) => tagAliases[tag] ?? tag))]
}

function readTags(source) {
  const expression = readAttribute(source, ':tags')

  return expression
    ? normalizeTags(
        [...expression.matchAll(/['"]([^'"]+)['"]/g)]
          .map((match) => match[1])
      )
    : []
}

function parsePassRate(value) {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : null
}

function median(values) {
  const sorted = [...values].sort((first, second) => first - second)
  const middle = Math.floor(sorted.length / 2)

  return sorted.length % 2 === 1
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function percentage(count, total) {
  return Number((count / total * 100).toFixed(1))
}

function countBy(items, keySelector) {
  const counts = new Map()

  for (const item of items) {
    const key = keySelector(item)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return Object.fromEntries(
    [...counts.entries()]
      .sort((first, second) => second[1] - first[1])
  )
}

function topTags(problems, limit = 15) {
  const counts = new Map()

  for (const problem of problems) {
    for (const tag of problem.tags) {
      if (sourceTags.has(tag) || tag.includes('面试')) {
        continue
      }

      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }

  return [...counts.entries()]
    .sort((first, second) => (
      second[1] - first[1]
      || first[0].localeCompare(second[0], 'zh-CN')
    ))
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }))
}

function algorithmFamilyNames(problem) {
  const tagText = problem.tags.join('\n')

  return algorithmFamilies
    .filter(([, pattern]) => pattern.test(tagText))
    .map(([family]) => family)
}

function topAlgorithmFamilies(problems, limit = 15) {
  const counts = new Map()

  for (const problem of problems) {
    for (const family of algorithmFamilyNames(problem)) {
      counts.set(family, (counts.get(family) ?? 0) + 1)
    }
  }

  return [...counts.entries()]
    .sort((first, second) => (
      second[1] - first[1]
      || first[0].localeCompare(second[0], 'zh-CN')
    ))
    .slice(0, limit)
    .map(([algorithm, count]) => ({
      algorithm,
      count,
      share: percentage(count, problems.length)
    }))
}

function pearsonCorrelation(pairs) {
  const xMean = average(pairs.map(([x]) => x))
  const yMean = average(pairs.map(([, y]) => y))

  let numerator = 0
  let xSquareSum = 0
  let ySquareSum = 0

  for (const [x, y] of pairs) {
    const xDelta = x - xMean
    const yDelta = y - yMean
    numerator += xDelta * yDelta
    xSquareSum += xDelta ** 2
    ySquareSum += yDelta ** 2
  }

  return numerator / Math.sqrt(xSquareSum * ySquareSum)
}

const problems = fs.readdirSync(problemDirectory)
  .filter((fileName) => (
    fileName.endsWith('.md')
    && fileName !== 'README.md'
    && fileName !== 'TEMPLATE.md'
  ))
  .flatMap((fileName) => {
    const source = fs.readFileSync(
      path.join(problemDirectory, fileName),
      'utf8'
    )

    if (!source.includes('<ProblemMeta')) {
      return []
    }

    const fullTitle = source.match(/^#\s+(.+)$/m)?.[1]?.trim()
    const difficulty = readAttribute(source, 'difficulty')
    const appearances = Number(readAttribute(source, ':appearances'))
    const passRateText = readAttribute(source, 'pass-rate')

    if (
      !fullTitle
      || !['easy', 'medium', 'hard'].includes(difficulty)
      || !Number.isFinite(appearances)
      || !passRateText
    ) {
      throw new Error(`题目元数据不完整：${fileName}`)
    }

    return [{
      fileName,
      title: fullTitle,
      url: `/problems/${fileName.replace(/\.md$/, '')}`,
      tags: readTags(source),
      difficulty,
      appearances,
      passRate: parsePassRate(passRateText)
    }]
  })

const appearanceValues = problems.map((problem) => problem.appearances)
const knownPassRates = problems
  .filter((problem) => problem.passRate !== null)
const passRateValues = knownPassRates
  .map((problem) => problem.passRate)
const appearanceMedian = median(appearanceValues)
const passRateMedian = median(passRateValues)

const difficultyOrder = ['easy', 'medium', 'hard']
const difficulty = Object.fromEntries(
  difficultyOrder.map((level) => {
    const matches = problems.filter((problem) => problem.difficulty === level)
    const knownRates = matches
      .filter((problem) => problem.passRate !== null)
      .map((problem) => problem.passRate)

    return [level, {
      count: matches.length,
      share: percentage(matches.length, problems.length),
      averageAppearances: Number(average(
        matches.map((problem) => problem.appearances)
      ).toFixed(1)),
      averagePassRate: Number(average(knownRates).toFixed(1))
    }]
  })
)

const companyCoverage = Object.fromEntries(
  companyTags.map((companyTag) => {
    const matches = problems.filter((problem) => (
      problem.tags.includes(companyTag)
    ))

    return [companyTag, {
      count: matches.length,
      share: percentage(matches.length, problems.length),
      difficulty: countBy(matches, (problem) => problem.difficulty),
      topAlgorithms: topAlgorithmFamilies(matches, 8),
      topTags: topTags(matches, 8)
    }]
  })
)

const overlapCounts = new Map()

for (const problem of problems) {
  const companies = companyTags.filter((tag) => problem.tags.includes(tag))
  const key = companies.length === 0 ? '未标注具体公司' : companies.join(' + ')
  overlapCounts.set(key, (overlapCounts.get(key) ?? 0) + 1)
}

const highFrequencyLowPass = problems
  .filter((problem) => (
    problem.passRate !== null
    && problem.appearances >= appearanceMedian
    && problem.passRate <= passRateMedian
  ))
  .sort((first, second) => (
    second.appearances - first.appearances
    || first.passRate - second.passRate
  ))

const report = {
  scope: {
    totalProblems: problems.length,
    appearanceRecords: appearanceValues.reduce(
      (sum, value) => sum + value,
      0
    ),
    knownPassRates: knownPassRates.length,
    unknownPassRates: problems.length - knownPassRates.length,
    algorithmTaggedProblems: problems.filter(
      (problem) => algorithmFamilyNames(problem).length > 0
    ).length,
    algorithmTagCoverage: percentage(
      problems.filter(
        (problem) => algorithmFamilyNames(problem).length > 0
      ).length,
      problems.length
    )
  },
  appearances: {
    mean: Number(average(appearanceValues).toFixed(1)),
    median: appearanceMedian,
    minimum: Math.min(...appearanceValues),
    maximum: Math.max(...appearanceValues),
    bands: {
      '50 次及以上': problems.filter((problem) => (
        problem.appearances >= 50
      )).length,
      '20～49 次': problems.filter((problem) => (
        problem.appearances >= 20
        && problem.appearances < 50
      )).length,
      '10～19 次': problems.filter((problem) => (
        problem.appearances >= 10
        && problem.appearances < 20
      )).length,
      '10 次以下': problems.filter((problem) => (
        problem.appearances < 10
      )).length
    }
  },
  passRates: {
    mean: Number(average(passRateValues).toFixed(1)),
    median: passRateMedian,
    minimum: Math.min(...passRateValues),
    maximum: Math.max(...passRateValues),
    appearanceCorrelation: Number(
      pearsonCorrelation(
        knownPassRates.map((problem) => [
          problem.appearances,
          problem.passRate
        ])
      ).toFixed(3)
    )
  },
  difficulty,
  companyCoverage,
  companyOverlap: Object.fromEntries(
    [...overlapCounts.entries()]
      .sort((first, second) => second[1] - first[1])
  ),
  topAlgorithms: topAlgorithmFamilies(problems),
  topTags: topTags(problems),
  topProblems: [...problems]
    .sort((first, second) => (
      second.appearances - first.appearances
      || first.title.localeCompare(second.title, 'zh-CN')
    ))
    .slice(0, 20),
  highFrequencyLowPass
}

console.log(JSON.stringify(report, null, 2))
