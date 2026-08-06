import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(scriptDirectory, '..')

const cases = [
  'ant-secure-mail.md',
  'ant-resume-ranking.md',
  'meituan-repository-change.md',
  'meituan-customer-service.md',
  'microsoft-load-balancer.md',
  'codebase-debugging.md',
  'nowcoder-batch-migration-scheduler.md',
  'nowcoder-crdt-store.md',
  'nowcoder-payroll-calculator.md',
  'nowcoder-snake-debugging.md',
  'nowcoder-saas-renewal-prediction.md',
  'nowcoder-parking-tui.md',
  'nowcoder-hospital-queue-tui.md',
  'nowcoder-2048-variant.md',
  'nowcoder-online-ordering.md',
  'nowcoder-tob-event-planning.md',
  'nowcoder-camp-coloring-api.md',
  'nowcoder-camp-coloring-java-biz.md',
  'nowcoder-contact-prefix-api.md',
  'nowcoder-contacts-api.md',
  'nowcoder-werewolf-intelligence-api.md'
]

const requiredPatterns = [
  [/^## 资料边界$/mu, '资料边界'],
  [/^## 训练题目$/mu, '训练题目'],
  [/(Prompt|提示词)/u, 'Prompt 设计'],
  [/(审查|拒绝|纠正)/u, 'AI 输出审查'],
  [/(验证|验收|证据)/u, '验证证据'],
  [/(复述|复盘)/u, '面试复述或复盘'],
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

  const promptBlocks = content.match(/::: tip (?:调试 )?Prompt[^\n]*\n[\s\S]*?:::/gu) ?? []
  if (promptBlocks.length < 5) {
    failures.push(`${filename} 的分阶段 Prompt 少于 5 组`)
  }

  if (/```(?:python|javascript|typescript|java|cpp|c|go|rust|bash|sh)\b/u.test(content)) {
    failures.push(`${filename} 不应包含成品实现代码，专题应聚焦思路、Prompt 和验证过程`)
  }

  if (!/(不声称|训练版|本站.*(?:训练|设计|组织)|重新组织|重新设计)/u.test(content)) {
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
