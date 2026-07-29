export type ProblemTagGroup = 'source' | 'topic' | 'technique'

const tagAliases: Record<string, string> = {
  腾讯面试: '腾讯面试题',
  归并: '归并排序',
  普通数组: '数组',
  普通数组与矩阵: '数组与矩阵',
  模板: '模板题'
}

const topicTags = new Set([
  '哈希表',
  '双指针',
  '字符串',
  '数组',
  '数组与矩阵',
  '矩阵',
  '链表',
  '二叉树',
  '搜索与图论',
  '图论',
  '栈',
  '栈与队列',
  '贪心',
  '动态规划',
  '回溯',
  '二分查找',
  '排序',
  '排序与堆',
  '设计',
  '数学',
  '技巧'
])

export function normalizeProblemTag(tag: string): string {
  return tagAliases[tag] ?? tag
}

export function normalizeProblemTags(tags: string[]): string[] {
  return [...new Set(tags.map(normalizeProblemTag))]
}

export function getProblemTagGroup(tag: string): ProblemTagGroup {
  if (
    tag === 'Hot100'
    || tag.includes('面试')
    || tag.includes('原创')
    || tag.includes('模板题')
  ) {
    return 'source'
  }

  return topicTags.has(tag) ? 'topic' : 'technique'
}
