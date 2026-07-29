import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDirectory, '..')
const dataDirectory = path.join(
  projectRoot,
  '.vitepress',
  'theme',
  'data'
)
const writtenTestDirectory = path.join(projectRoot, 'written-tests')

const dataFiles = [
  'alibabaWrittenTests.ts',
  'huaweiWrittenTests.ts',
  'meituanWrittenTests.ts',
  'pinduoduoWrittenTests.ts',
  'remainingWrittenTests.ts',
  'extraWrittenTests.ts'
]

const algorithmRules = [
  ['模拟', /模拟|按题意|逐步处理|线性扫描/iu],
  ['贪心', /贪心/iu],
  ['动态规划', /动态规划|\bDP\b|背包|状态压缩|状压|记忆化|Viterbi/iu],
  [
    '数学与数论',
    /数学|数论|组合数学|容斥|概率|期望|GCD|最大公约数|质数|素数|因数|约数|倍数|快速幂|逆元|裴蜀|博弈|奇偶性|公式推导|数学推导|递推/iu
  ],
  ['排序', /排序|有序|中位数/iu],
  ['二分', /二分/iu],
  ['前缀和与差分', /前缀和|后缀和|前后缀|差分|扫描线/iu],
  [
    '字符串',
    /字符串|KMP|回文|子序列|字典树|Trie|BPE|后缀数组|正则|字符匹配/iu
  ],
  ['DFS 与回溯', /\bDFS\b|深度优先|回溯|递归搜索/iu],
  ['BFS', /\bBFS\b|广度优先/iu],
  [
    '图论与最短路',
    /Dijkstra|最短路|拓扑排序|最小生成树|图建模|有向图|无向图|连通分量|网络流/iu
  ],
  ['并查集', /并查集|DSU|Union[\s-]?Find/iu],
  ['堆与优先队列', /优先队列|小根堆|大根堆|堆优化|堆排序/iu],
  ['树状数组与线段树', /树状数组|线段树|Fenwick/iu],
  ['哈希与计数', /哈希|计数|频次|频率|Counter/iu],
  ['位运算', /位运算|按位|异或|二进制|超集变换/iu],
  ['双指针与滑窗', /双指针|滑动窗口|滑窗|尺取/iu],
  ['枚举', /枚举|穷举|暴力/iu],
  ['构造', /构造/iu],
  ['树与树形算法', /树上|树形|二叉树|最近公共祖先|子树|红黑树/iu],
  [
    '机器学习与深度学习',
    /机器学习|深度学习|\bML\b|\bDL\b|梯度|回归|SVM|KNN|K-Means|聚类|LSTM|注意力|卷积|神经网络|决策树|随机森林|Transformer|CLIP|Adam|Softmax|感知机|MMR|sklearn|NumPy|优化器|损失函数|模型训练/iu
  ],
  [
    'SQL 与数据处理',
    /\bSQL\b|JOIN|窗口函数|分组聚合|Pandas|数据分析|数据清洗/iu
  ]
]

function loadArrayFromTypeScript(fileName) {
  const source = fs.readFileSync(
    path.join(dataDirectory, fileName),
    'utf8'
  )
  const start = source.indexOf('[')
  const end = source.lastIndexOf(']')

  if (start === -1 || end === -1 || end < start) {
    throw new Error(`无法读取数据数组：${fileName}`)
  }

  return JSON.parse(source.slice(start, end + 1))
}

function markdownPathFromHref(href) {
  const cleanHref = href
    .split('#')[0]
    .replace(/^\/written-tests\//u, '')

  return path.join(writtenTestDirectory, `${cleanHref}.md`)
}

function stripCodeBlocks(markdown) {
  return markdown.replace(/```[\s\S]*?```/gu, ' ')
}

function questionContext(session, questionIndex) {
  const href = (
    session.questionHrefs?.[questionIndex]
    ?? session.href
  )
  const markdownPath = markdownPathFromHref(href)

  if (!fs.existsSync(markdownPath)) {
    return ''
  }

  const source = fs.readFileSync(markdownPath, 'utf8')

  if (session.questionHrefs?.[questionIndex]) {
    return ''
  }

  const questionNumber = String(questionIndex + 1).padStart(2, '0')
  const sectionHeadings = [
    ...source.matchAll(/^## (\d{2})[^\n]*$/gmu)
  ]
  const headingIndex = sectionHeadings.findIndex(
    (match) => match[1] === questionNumber
  )

  if (headingIndex === -1) {
    return ''
  }

  const sectionStart = (
    sectionHeadings[headingIndex].index
    + sectionHeadings[headingIndex][0].length
  )
  const sectionEnd = (
    sectionHeadings[headingIndex + 1]?.index
    ?? source.length
  )
  const section = source.slice(sectionStart, sectionEnd)
  const solutionSection = section.match(
    /^### 解题思路([^\n]*)\n([\s\S]*?)(?=^### |(?![\s\S]))/mu
  )

  if (!solutionSection) {
    return ''
  }

  return stripCodeBlocks(
    `${solutionSection[1]}\n${solutionSection[2]}`
  ).slice(0, 2500)
}

function normalizeDifficulty(difficulty) {
  if (/困难/u.test(difficulty)) {
    return '困难'
  }

  if (/中等偏难|中等偏上/u.test(difficulty)) {
    return '中等偏难'
  }

  if (/中等偏易|简单/u.test(difficulty)) {
    return '简单/偏易'
  }

  return '中等'
}

function normalizeRole(role) {
  if (/AI|大模型|机器学习/iu.test(role)) {
    return 'AI / 大模型岗'
  }

  if (/算法/iu.test(role)) {
    return '算法岗'
  }

  if (/数据/iu.test(role)) {
    return '数据岗'
  }

  if (/研发|开发|后端/iu.test(role)) {
    return '研发 / 开发岗'
  }

  return '通用及其他岗位'
}

function matchedAlgorithms(text) {
  return algorithmRules
    .filter(([, pattern]) => pattern.test(text))
    .map(([name]) => name)
}

function increment(map, key, amount = 1) {
  map.set(key, (map.get(key) ?? 0) + amount)
}

function sortedEntries(map) {
  return [...map.entries()]
    .sort((first, second) => (
      second[1] - first[1]
      || first[0].localeCompare(second[0], 'zh-CN')
    ))
    .map(([name, count]) => ({ name, count }))
}

const sessions = dataFiles.flatMap(loadArrayFromTypeScript)
const sessionIds = new Set()

for (const session of sessions) {
  if (sessionIds.has(session.id)) {
    throw new Error(`场次 ID 重复：${session.id}`)
  }

  sessionIds.add(session.id)
  const questionTopics = session.questionTopics ?? session.topics

  if (questionTopics.length !== session.questions.length) {
    throw new Error(
      `${session.id} 的题目数与逐题标签数不一致`
    )
  }
}

const algorithmSessions = sessions.filter(
  (session) => session.type !== 'AI Coding'
)
const codingSessions = sessions.filter(
  (session) => session.type === 'AI Coding'
)

const questions = algorithmSessions.flatMap((session) => (
  session.questions.map((question, questionIndex) => {
    const topic = (
      session.questionTopics?.[questionIndex]
      ?? session.topics[questionIndex]
      ?? ''
    )
    const context = questionContext(session, questionIndex)
    const algorithms = matchedAlgorithms(
      `${topic}\n${question}\n${context}`
    )

    return {
      sessionId: session.id,
      company: session.company,
      role: session.role,
      roleGroup: normalizeRole(session.role),
      date: session.date,
      difficulty: normalizeDifficulty(session.difficulty),
      position: questionIndex + 1,
      question,
      topic,
      algorithms
    }
  })
))

const companyMap = new Map()
const difficultyMap = new Map()
const roleMap = new Map()
const roleDifficultyMap = new Map()
const algorithmMap = new Map()
const algorithmPairMap = new Map()
const sessionQuestionCountMap = new Map()

for (const session of algorithmSessions) {
  const company = companyMap.get(session.company) ?? {
    sessions: 0,
    questions: 0,
    difficulty: new Map(),
    roles: new Map(),
    algorithms: new Map()
  }

  company.sessions += 1
  company.questions += session.questions.length
  increment(sessionQuestionCountMap, session.questions.length)
  increment(
    company.difficulty,
    normalizeDifficulty(session.difficulty)
  )
  increment(company.roles, normalizeRole(session.role))
  companyMap.set(session.company, company)

  increment(difficultyMap, normalizeDifficulty(session.difficulty))
  const roleGroup = normalizeRole(session.role)
  increment(roleMap, roleGroup)

  const roleDifficulty = roleDifficultyMap.get(roleGroup) ?? new Map()
  increment(
    roleDifficulty,
    normalizeDifficulty(session.difficulty)
  )
  roleDifficultyMap.set(roleGroup, roleDifficulty)
}

for (const question of questions) {
  const company = companyMap.get(question.company)

  for (const algorithm of question.algorithms) {
    increment(algorithmMap, algorithm)
    increment(company.algorithms, algorithm)
  }

  for (
    let firstIndex = 0;
    firstIndex < question.algorithms.length;
    firstIndex += 1
  ) {
    for (
      let secondIndex = firstIndex + 1;
      secondIndex < question.algorithms.length;
      secondIndex += 1
    ) {
      const pair = [
        question.algorithms[firstIndex],
        question.algorithms[secondIndex]
      ].sort((first, second) => (
        first.localeCompare(second, 'zh-CN')
      ))

      increment(algorithmPairMap, pair.join(' + '))
    }
  }
}

const companies = [...companyMap.entries()]
  .map(([company, data]) => ({
    company,
    sessions: data.sessions,
    questions: data.questions,
    hardSessions: (
      (data.difficulty.get('困难') ?? 0)
      + (data.difficulty.get('中等偏难') ?? 0)
    ),
    hardRatePercent: Number(
      (
        (
          (data.difficulty.get('困难') ?? 0)
          + (data.difficulty.get('中等偏难') ?? 0)
        )
        / data.sessions
        * 100
      ).toFixed(1)
    ),
    questionSharePercent: Number(
      (data.questions / questions.length * 100).toFixed(1)
    ),
    roleGroups: sortedEntries(data.roles),
    topAlgorithms: sortedEntries(data.algorithms).slice(0, 6)
  }))
  .sort((first, second) => (
    second.sessions - first.sessions
    || second.questions - first.questions
    || first.company.localeCompare(second.company, 'zh-CN')
  ))

const roleAlgorithms = [...new Set(
  questions.map((question) => question.roleGroup)
)].map((roleGroup) => {
  const counts = new Map()
  const roleQuestions = questions.filter(
    (question) => question.roleGroup === roleGroup
  )

  for (const question of roleQuestions) {
    for (const algorithm of question.algorithms) {
      increment(counts, algorithm)
    }
  }

  return {
    roleGroup,
    sessions: roleMap.get(roleGroup) ?? 0,
    questions: roleQuestions.length,
    difficulty: sortedEntries(
      roleDifficultyMap.get(roleGroup) ?? new Map()
    ),
    topAlgorithms: sortedEntries(counts).slice(0, 8)
  }
})

const positionAnalysis = [1, 2, 3, 4].map((position) => {
  const positionQuestions = questions.filter(
    (question) => question.position === position
  )
  const counts = new Map()

  for (const question of positionQuestions) {
    for (const algorithm of question.algorithms) {
      increment(counts, algorithm)
    }
  }

  return {
    position,
    questions: positionQuestions.length,
    topAlgorithms: sortedEntries(counts).slice(0, 6)
  }
})

const dates = algorithmSessions
  .map((session) => session.date)
  .sort()
const taggedQuestions = questions.filter(
  (question) => question.algorithms.length > 0
)
const multiAlgorithmQuestions = questions.filter(
  (question) => question.algorithms.length >= 2
)

const summary = {
  generatedAt: new Date().toISOString(),
  methodology: {
    difficulty: '按场次 difficulty 字段归一化',
    algorithms: '按每题 topics 与题解思路关键词做多标签归类',
    note: '同一道题可命中多个算法标签，因此算法频次之和大于题目总数'
  },
  totals: {
    sessions: sessions.length,
    algorithmSessions: algorithmSessions.length,
    codingSessions: codingSessions.length,
    algorithmQuestions: questions.length,
    companies: companyMap.size,
    dateFrom: dates.at(0),
    dateTo: dates.at(-1),
    averageQuestionsPerSession: Number(
      (questions.length / algorithmSessions.length).toFixed(2)
    ),
    taggedQuestions: taggedQuestions.length,
    tagCoveragePercent: Number(
      (taggedQuestions.length / questions.length * 100).toFixed(1)
    ),
    multiAlgorithmQuestions: multiAlgorithmQuestions.length,
    multiAlgorithmPercent: Number(
      (
        multiAlgorithmQuestions.length
        / questions.length
        * 100
      ).toFixed(1)
    )
  },
  difficulty: sortedEntries(difficultyMap).map((item) => ({
    ...item,
    percent: Number(
      (
        item.count
        / algorithmSessions.length
        * 100
      ).toFixed(1)
    )
  })),
  algorithms: sortedEntries(algorithmMap).map((item) => ({
    ...item,
    percent: Number(
      (item.count / questions.length * 100).toFixed(1)
    )
  })),
  algorithmPairs: sortedEntries(algorithmPairMap)
    .slice(0, 20)
    .map((item) => ({
      ...item,
      percent: Number(
        (item.count / questions.length * 100).toFixed(1)
      )
    })),
  sessionQuestionCounts: [...sessionQuestionCountMap.entries()]
    .map(([questionsPerSession, count]) => ({
      questionsPerSession,
      sessions: count,
      percent: Number(
        (
          count
          / algorithmSessions.length
          * 100
        ).toFixed(1)
      )
    }))
    .sort((first, second) => (
      first.questionsPerSession - second.questionsPerSession
    )),
  positions: positionAnalysis,
  companies,
  roles: roleAlgorithms.sort((first, second) => (
    second.sessions - first.sessions
    || first.roleGroup.localeCompare(second.roleGroup, 'zh-CN')
  ))
}

console.log(JSON.stringify(summary, null, 2))
