import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const problemsDirectory = path.join(root, 'problems')
const problemFiles = []

function collectMarkdownFiles(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      collectMarkdownFiles(absolutePath)
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      problemFiles.push(absolutePath)
    }
  }
}

collectMarkdownFiles(problemsDirectory)

const errors = []
let checkedCount = 0

for (const absolutePath of problemFiles.sort()) {
  const document = fs.readFileSync(absolutePath, 'utf8')

  // 只校验会出现在题单中的真实题目页，排除目录与写作模板。
  if (
    path.basename(absolutePath) === 'TEMPLATE.md' ||
    !document.includes('<ProblemMeta')
  ) {
    continue
  }

  checkedCount += 1
  const relativePath = path.relative(root, absolutePath)

  if (
    !/^#{2,3}\s+示例(?:\s*\d+|[一二三四五六七八九十]+)?\s*$/m.test(
      document
    )
  ) {
    errors.push(`${relativePath}：缺少“示例”标题`)
  }

  if (!document.includes('输入：')) {
    errors.push(`${relativePath}：示例缺少“输入：”`)
  }

  if (!document.includes('输出：')) {
    errors.push(`${relativePath}：示例缺少“输出：”`)
  }
}

if (errors.length > 0) {
  console.error('面试手撕题示例检查失败：')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log(
  `面试手撕题示例检查通过：${checkedCount} 道题均包含示例、输入与输出。`
)
