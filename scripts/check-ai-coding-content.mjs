import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(scriptDirectory, '..')

const cases = [
  'ant-secure-mail.md',
  'ant-resume-ranking.md',
  'meituan-repository-change.md',
  'meituan-customer-service.md',
  'microsoft-load-balancer.md',
  'codebase-debugging.md'
]

const requiredPatterns = [
  [/^## 资料边界$/mu, '资料边界'],
  [/^## 训练题目$/mu, '训练题目'],
  [/```python/u, 'Python 示例'],
  [/(测试|验收)/u, '测试或验收说明'],
  [/(AI 协作|向 AI 提问|AI 环境)/u, 'AI 协作说明'],
  [/(来源|https:\/\/)/u, '公开来源']
]

const failures = []

for (const filename of cases) {
  const path = resolve(projectRoot, 'ai-coding', filename)
  if (!existsSync(path)) {
    failures.push(`${filename} 不存在`)
    continue
  }

  const content = readFileSync(path, 'utf8')
  for (const [pattern, label] of requiredPatterns) {
    if (!pattern.test(content)) {
      failures.push(`${filename} 缺少 ${label}`)
    }
  }

  const pythonBlocks = content.match(/```python\n[\s\S]*?```/gu) ?? []
  if (pythonBlocks.length < 3) {
    failures.push(`${filename} 的 Python 示例少于 3 组`)
  }

  pythonBlocks.forEach((fencedBlock, index) => {
    const source = fencedBlock
      .replace(/^```python\n/u, '')
      .replace(/```$/u, '')
    const validation = spawnSync(
      'python3',
      ['-c', 'import sys; compile(sys.stdin.read(), "<markdown>", "exec")'],
      { input: source, encoding: 'utf8' }
    )
    if (validation.status !== 0) {
      failures.push(
        `${filename} 的第 ${index + 1} 个 Python 示例语法错误：${validation.stderr.trim()}`
      )
    }
  })

  if (!/(训练版|本站编写|本站训练规则|重新组织讲解)/u.test(content)) {
    failures.push(`${filename} 没有说明公开资料与本站训练内容的边界`)
  }
}

const indexPath = resolve(projectRoot, 'ai-coding', 'README.md')
const indexContent = readFileSync(indexPath, 'utf8')
for (const filename of cases) {
  const slug = filename.replace(/\.md$/u, '')
  if (!indexContent.includes(`./${slug}`)) {
    failures.push(`专题首页缺少 ${slug} 的入口`)
  }
}

const configContent = readFileSync(
  resolve(projectRoot, '.vitepress', 'config.mts'),
  'utf8'
)
const sidebarContent = readFileSync(
  resolve(projectRoot, '.vitepress', 'sidebar.ts'),
  'utf8'
)

if (!configContent.includes("{ text: 'AI Coding', link: '/ai-coding/README' }")) {
  failures.push('顶部导航缺少 AI Coding')
}

if (!sidebarContent.includes("text: 'AI Coding'")) {
  failures.push('侧边栏缺少 AI Coding 分组')
}

if (failures.length > 0) {
  console.error('AI Coding 内容检查失败')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log(`AI Coding 内容检查通过，共 ${cases.length} 个案例。`)
