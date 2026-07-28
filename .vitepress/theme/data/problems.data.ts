import { createContentLoader } from 'vitepress'

export type ProblemDifficulty = 'easy' | 'medium' | 'hard'

export interface ProblemCatalogItem {
  id: string
  title: string
  fullTitle: string
  url: string
  tags: string[]
  difficulty: ProblemDifficulty
  appearances: number
  passRate: string
  sourceUrl?: string
}

function readAttribute(source: string, name: string): string | undefined {
  return source.match(new RegExp(`${name}="([^"]*)"`))?.[1]
}

function readTags(source: string): string[] {
  const expression = readAttribute(source, ':tags')

  return expression
    ? [...expression.matchAll(/['"]([^'"]+)['"]/g)].map((match) => match[1])
    : []
}

function splitTitle(fullTitle: string): Pick<ProblemCatalogItem, 'id' | 'title'> {
  const [id, ...titleParts] = fullTitle.split('·')

  return {
    id: id.trim(),
    title: titleParts.join('·').trim() || fullTitle
  }
}

export default createContentLoader<ProblemCatalogItem[]>('problems/*.md', {
  includeSrc: true,
  transform(pages) {
    return pages
      .flatMap((page) => {
        const source = page.src

        if (
          !source
          || page.url.endsWith('/README')
          || page.url.endsWith('/TEMPLATE')
          || !source.includes('<ProblemMeta')
        ) {
          return []
        }

        const fullTitle = source.match(/^#\s+(.+)$/m)?.[1]?.trim()
        const difficulty = readAttribute(source, 'difficulty')
        const appearances = readAttribute(source, ':appearances')
        const passRate = readAttribute(source, 'pass-rate')

        if (
          !fullTitle
          || !difficulty
          || !appearances
          || !passRate
          || !['easy', 'medium', 'hard'].includes(difficulty)
        ) {
          throw new Error(`题目元数据不完整：${page.url}`)
        }

        return [{
          ...splitTitle(fullTitle),
          fullTitle,
          url: page.url,
          tags: readTags(source),
          difficulty: difficulty as ProblemDifficulty,
          appearances: Number(appearances),
          passRate,
          sourceUrl: readAttribute(source, 'source-url')
        }]
      })
      .sort((first, second) => (
        first.url.localeCompare(second.url, 'zh-CN', {
          numeric: true
        })
      ))
  }
})
