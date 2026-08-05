import { readFile } from 'node:fs/promises'

const pages = [
  {
    path: 'assessments/cognitive-ability.md',
    itemPattern: /^## 题目 \d{2}/gmu,
    expectedItems: 8,
    answerPattern: /^### 答案$/gmu,
    expectedAnswers: 8
  },
  {
    path: 'assessments/personality-motivation.md',
    itemPattern: /^## 练习 \d{2}/gmu,
    expectedItems: 6,
    answerPattern: /^### (观察维度|作答原则)$/gmu,
    expectedAnswers: 12
  },
  {
    path: 'assessments/situational-judgement.md',
    itemPattern: /^## 题目 \d{2}/gmu,
    expectedItems: 6,
    answerPattern: /^### 建议判断$/gmu,
    expectedAnswers: 6
  },
  {
    path: 'assessments/professional-skills.md',
    itemPattern: /^## 题目 \d{2}/gmu,
    expectedItems: 8,
    answerPattern: /^### (答案|参考答案)$/gmu,
    expectedAnswers: 8
  },
  {
    path: 'assessments/ai-video-interview.md',
    itemPattern: /^## 题目 \d{2}/gmu,
    expectedItems: 6,
    answerPattern: /^### 回答结构$/gmu,
    expectedAnswers: 6
  },
  {
    path: 'assessments/ai-practical.md',
    itemPattern: /^## 题目 \d{2}/gmu,
    expectedItems: 5,
    answerPattern: /^### (答案|参考答案)$/gmu,
    expectedAnswers: 5
  },
  {
    path: 'assessments/game-based-simulations.md',
    itemPattern: /^## 任务 \d{2}/gmu,
    expectedItems: 7,
    answerPattern: /^### (参考答案|参考判断)$/gmu,
    expectedAnswers: 7
  }
]

const failures = []

for (const page of pages) {
  const content = await readFile(page.path, 'utf8')
  const itemCount = [...content.matchAll(page.itemPattern)].length
  const answerCount = [...content.matchAll(page.answerPattern)].length

  if (itemCount !== page.expectedItems) {
    failures.push(
      `${page.path} expected ${page.expectedItems} items, found ${itemCount}`
    )
  }

  if (answerCount !== page.expectedAnswers) {
    failures.push(
      `${page.path} expected ${page.expectedAnswers} answer sections, found ${answerCount}`
    )
  }

  if (!content.includes('原创')) {
    failures.push(`${page.path} is missing its original-content boundary`)
  }

  if (/^(?:-\s*)?[A-D]\.\s/gmu.test(content)) {
    failures.push(`${page.path} contains a loose A-D option line`)
  }

  const optionBlocks = [
    ...content.matchAll(
      /<ol class="assessment-options" type="A">([\s\S]*?)<\/ol>/gmu
    )
  ]

  for (const [index, block] of optionBlocks.entries()) {
    const optionCount = [...block[1].matchAll(/<li>[\s\S]*?<\/li>/gmu)].length
    if (optionCount < 2 || optionCount > 5) {
      failures.push(
        `${page.path} option block ${index + 1} contains ${optionCount} items`
      )
    }
  }
}

const sidebar = await readFile('.vitepress/sidebar.ts', 'utf8')
const config = await readFile('.vitepress/config.mts', 'utf8')

for (const page of pages) {
  const link = `/${page.path.replace(/\.md$/u, '')}`
  if (!sidebar.includes(link)) {
    failures.push(`${page.path} is missing from the sidebar`)
  }
}

if (!config.includes("{ text: '大厂测评', link: '/assessments/README' }")) {
  failures.push('The 大厂测评 navigation entry is missing')
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exitCode = 1
} else {
  const totalItems = pages.reduce((sum, page) => sum + page.expectedItems, 0)
  console.log(`Assessment content check passed for ${pages.length} pages and ${totalItems} items.`)
}
