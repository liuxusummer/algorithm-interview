<script setup lang="ts">
import {
  PhArrowRight,
  PhCalendarBlank,
  PhCaretDown,
  PhFunnel,
  PhMagnifyingGlass,
  PhSortAscending,
  PhSparkle,
  PhX
} from '@phosphor-icons/vue'
import { withBase } from 'vitepress'
import { computed, ref } from 'vue'
import { alibabaWrittenTests } from '../data/alibabaWrittenTests'
import { huaweiWrittenTests } from '../data/huaweiWrittenTests'
import { meituanWrittenTests } from '../data/meituanWrittenTests'
import { pinduoduoWrittenTests } from '../data/pinduoduoWrittenTests'

type SortOrder = 'date-desc' | 'date-asc' | 'company'

interface WrittenTestSession {
  id: string
  company: string
  role: string
  type: '算法笔试' | 'AI Coding'
  date: string
  year: string
  href: string
  difficulty: string
  topics: string[]
  questions: string[]
  questionHrefs?: string[]
  featured?: boolean
}

const sessions: WrittenTestSession[] = [
  ...alibabaWrittenTests.map((session) => ({
    ...session,
    type: '算法笔试' as const
  })),
  ...meituanWrittenTests.map((session) => ({
    ...session,
    type: '算法笔试' as const
  })),
  ...huaweiWrittenTests.map((session) => ({
    ...session,
    type: '算法笔试' as const
  })),
  ...pinduoduoWrittenTests.map((session) => ({
    ...session,
    type: '算法笔试' as const
  })),
  {
    id: 'ANT-AI-20260329',
    company: '蚂蚁集团',
    role: 'AI Coding',
    type: 'AI Coding',
    date: '2026-03-29',
    year: '2026',
    href: '/written-tests/ant-20260329-ai-coding',
    difficulty: '工程综合',
    topics: ['系统设计', '状态机', 'API', '测试交付'],
    questions: ['终端早餐店系统'],
    questionHrefs: ['/written-tests/ant-20260329-ai-coding'],
    featured: true
  },
  {
    id: 'NIO-GEN-20260726',
    company: '蔚来',
    role: '通用岗',
    type: '算法笔试',
    date: '2026-07-26',
    year: '2026',
    href: '/written-tests/nio-20260726-factorial-square',
    difficulty: '中等偏易',
    topics: ['数论', '预处理', '裴蜀定理'],
    questions: ['阶乘平方数', '线性组合计数'],
    questionHrefs: [
      '/written-tests/nio-20260726-factorial-square',
      '/written-tests/nio-20260726-linear-combination-count'
    ]
  },
  {
    id: 'ANT-DEV-20260326',
    company: '蚂蚁集团',
    role: '研发岗',
    type: '算法笔试',
    date: '2026-03-26',
    year: '2026',
    href: '/written-tests/ant-20260326-dev',
    difficulty: '中等偏难',
    topics: ['贪心', '多源 BFS', '位运算'],
    questions: ['排列拼接', '该回家了', '破译者']
  },
  {
    id: 'ANT-DEV-20260329',
    company: '蚂蚁集团',
    role: '研发岗',
    type: '算法笔试',
    date: '2026-03-29',
    year: '2026',
    href: '/written-tests/ant-20260329-dev',
    difficulty: '中等偏难',
    topics: ['排序贪心', '素数筛', '数位 DP'],
    questions: ['巴巴博弈', '质数合数', '位运算权值']
  },
  {
    id: 'ANT-DEV-20260402',
    company: '蚂蚁集团',
    role: '研发岗',
    type: '算法笔试',
    date: '2026-04-02',
    year: '2026',
    href: '/written-tests/ant-20260402-dev',
    difficulty: '中等偏难',
    topics: ['GCD', '按位统计', 'KMP'],
    questions: ['也许互质序列', '按位与权值和', '平方串']
  },
  {
    id: 'ANT-ALGO-20260409',
    company: '蚂蚁集团',
    role: '算法岗',
    type: '算法笔试',
    date: '2026-04-09',
    year: '2026',
    href: '/written-tests/ant-20260409-algo',
    difficulty: '中等偏难',
    topics: ['贪心', 'Viterbi', '数论 DFS'],
    questions: ['穿过黑暗之门', '离散型马尔可夫模型预测', '公倍数对和']
  },
  {
    id: 'ANT-DEV-20260416',
    company: '蚂蚁集团',
    role: '研发岗',
    type: '算法笔试',
    date: '2026-04-16',
    year: '2026',
    href: '/written-tests/ant-20260416-dev',
    difficulty: '困难',
    topics: ['构造', '动态有序集合', '容斥二分'],
    questions: ['仅含 1 和合数的数组', '剪绳子', '不互质元素下标']
  },
  {
    id: 'ANT-DEV-20260419',
    company: '蚂蚁集团',
    role: '研发岗',
    type: '算法笔试',
    date: '2026-04-19',
    year: '2026',
    href: '/written-tests/ant-20260419-dev',
    difficulty: '中等',
    topics: ['计数', '排序二分', '位运算'],
    questions: ['拼好房', '不降序序列', '二次幂变换 2']
  },
  {
    id: 'ANT-DEV-20260507',
    company: '蚂蚁集团',
    role: '开发岗',
    type: '算法笔试',
    date: '2026-05-07',
    year: '2026',
    href: '/written-tests/ant-20260507-dev',
    difficulty: '中等偏难',
    topics: ['前缀和', '多源 BFS', '期望 DP'],
    questions: ['好看的二进制字符串', '地图上的最短别墅距离', '最大化打铁次数的期望']
  }
]

const query = ref('')
const selectedCompany = ref('全部公司')
const selectedRole = ref('全部岗位')
const selectedType = ref('全部类型')
const selectedYear = ref('全部年份')
const sortOrder = ref<SortOrder>('date-desc')

const companies = ['全部公司', ...new Set(sessions.map((item) => item.company))]
const roles = ['全部岗位', ...new Set(sessions.map((item) => item.role))]
const types = ['全部类型', ...new Set(sessions.map((item) => item.type))]
const years = ['全部年份', ...new Set(sessions.map((item) => item.year))]

const filteredSessions = computed(() => {
  const keyword = query.value.trim().toLocaleLowerCase('zh-CN')

  return sessions
    .filter((session) => {
      const matchesKeyword = !keyword || [
        session.company,
        session.role,
        session.type,
        session.date,
        ...session.topics,
        ...session.questions
      ].some((value) => value.toLocaleLowerCase('zh-CN').includes(keyword))

      return (
        matchesKeyword
        && (selectedCompany.value === '全部公司' || session.company === selectedCompany.value)
        && (selectedRole.value === '全部岗位' || session.role === selectedRole.value)
        && (selectedType.value === '全部类型' || session.type === selectedType.value)
        && (selectedYear.value === '全部年份' || session.year === selectedYear.value)
      )
    })
    .sort((first, second) => {
      if (sortOrder.value === 'date-desc') {
        return second.date.localeCompare(first.date)
      }

      if (sortOrder.value === 'date-asc') {
        return first.date.localeCompare(second.date)
      }

      return (
        first.company.localeCompare(second.company, 'zh-CN')
        || second.date.localeCompare(first.date)
      )
    })
})

const hasFilters = computed(() => (
  query.value.length > 0
  || selectedCompany.value !== '全部公司'
  || selectedRole.value !== '全部岗位'
  || selectedType.value !== '全部类型'
  || selectedYear.value !== '全部年份'
))

function clearFilters() {
  query.value = ''
  selectedCompany.value = '全部公司'
  selectedRole.value = '全部岗位'
  selectedType.value = '全部类型'
  selectedYear.value = '全部年份'
}

function getQuestionHref(session: WrittenTestSession, index: number) {
  if (session.questionHrefs?.[index]) {
    return session.questionHrefs[index]
  }

  return `${session.href}#problem-${String(index + 1).padStart(2, '0')}`
}
</script>

<template>
  <section class="written-catalog" aria-labelledby="written-catalog-title">
    <header class="written-catalog__intro">
      <div>
        <span>EXAM SESSION INDEX / 2026</span>
        <h2 id="written-catalog-title">场次检索台</h2>
        <p>按公司、岗位、考试类型和年份筛选；时间支持正序或倒序排列。</p>
      </div>
      <div class="written-catalog__summary">
        <strong>{{ sessions.length }}</strong>
        <span>场已归档</span>
      </div>
    </header>

    <div class="written-catalog__toolbar">
      <label class="written-catalog__search">
        <span>搜索场次或题目</span>
        <span>
          <PhMagnifyingGlass :size="18" aria-hidden="true" />
          <input
            v-model="query"
            type="search"
            placeholder="公司、题目、考点"
            autocomplete="off"
          >
          <button v-if="query" type="button" aria-label="清空搜索词" @click="query = ''">
            <PhX :size="15" aria-hidden="true" />
          </button>
        </span>
      </label>

      <label class="written-catalog__sort">
        <span>排序</span>
        <span>
          <PhSortAscending :size="18" aria-hidden="true" />
          <select v-model="sortOrder">
            <option value="date-desc">时间：从新到旧</option>
            <option value="date-asc">时间：从旧到新</option>
            <option value="company">公司：聚合查看</option>
          </select>
          <PhCaretDown :size="14" aria-hidden="true" />
        </span>
      </label>
    </div>

    <div class="written-catalog__filters">
      <div class="written-catalog__filter-title">
        <span><PhFunnel :size="17" aria-hidden="true" /> 组合筛选</span>
        <button v-if="hasFilters" type="button" @click="clearFilters">
          重置
          <PhX :size="13" aria-hidden="true" />
        </button>
      </div>

      <div class="written-catalog__filter-grid">
        <label>
          <span>公司</span>
          <select v-model="selectedCompany">
            <option v-for="company in companies" :key="company">{{ company }}</option>
          </select>
        </label>
        <label>
          <span>岗位</span>
          <select v-model="selectedRole">
            <option v-for="role in roles" :key="role">{{ role }}</option>
          </select>
        </label>
        <label>
          <span>类型</span>
          <select v-model="selectedType">
            <option v-for="type in types" :key="type">{{ type }}</option>
          </select>
        </label>
        <label>
          <span>年份</span>
          <select v-model="selectedYear">
            <option v-for="year in years" :key="year">{{ year }}</option>
          </select>
        </label>
      </div>
    </div>

    <div class="written-catalog__result" aria-live="polite">
      <span>命中 <strong>{{ filteredSessions.length }}</strong> 场</span>
      <span>{{ hasFilters ? '已应用组合条件' : '当前展示全部场次' }}</span>
    </div>

    <div v-if="filteredSessions.length" class="written-catalog__grid">
      <article
        v-for="session in filteredSessions"
        :key="session.id"
        class="written-session-card"
        :class="{ 'written-session-card--featured': session.featured }"
      >
        <div class="written-session-card__rail">
          <span>{{ session.id }}</span>
          <strong>{{ session.date.slice(5).replace('-', '.') }}</strong>
        </div>

        <div class="written-session-card__body">
          <div class="written-session-card__meta">
            <span>{{ session.company }}</span>
            <span>{{ session.role }}</span>
            <span>{{ session.difficulty }}</span>
            <span v-if="session.featured" class="is-trend">
              <PhSparkle :size="13" weight="fill" aria-hidden="true" />
              新趋势重点
            </span>
          </div>

          <h3>
            <a :href="withBase(session.href)">
              {{ session.type === 'AI Coding' ? 'AI Coding 工程实战' : `${session.role}笔试真题` }}
            </a>
          </h3>

          <div class="written-session-card__questions">
            <a
              v-for="(question, index) in session.questions"
              :key="question"
              :href="withBase(getQuestionHref(session, index))"
            >
              {{ String(index + 1).padStart(2, '0') }} {{ question }}
            </a>
          </div>

          <footer>
            <div>
              <span v-for="topic in session.topics" :key="topic">{{ topic }}</span>
            </div>
            <a :href="withBase(session.href)">
              查看解析
              <PhArrowRight :size="16" aria-hidden="true" />
            </a>
          </footer>
        </div>
      </article>
    </div>

    <div v-else class="written-catalog__empty">
      <PhCalendarBlank :size="34" aria-hidden="true" />
      <strong>没有符合条件的场次</strong>
      <p>减少筛选条件，或者换一个题目关键词。</p>
      <button type="button" @click="clearFilters">恢复全部场次</button>
    </div>
  </section>
</template>

<style scoped>
.written-catalog {
  margin: 28px 0 60px;
  color: var(--vp-c-text-1);
}

.written-catalog__intro {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: 28px;
  padding-bottom: 22px;
  border-bottom: 2px solid var(--vp-c-text-1);
}

.written-catalog__intro > div:first-child > span,
.written-catalog__search > span:first-child,
.written-catalog__sort > span:first-child {
  color: var(--exam-blue);
  font-family: var(--vp-font-family-mono);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.1em;
}

.written-catalog__intro h2 {
  margin: 8px 0 0;
  border: 0;
  font-size: clamp(34px, 6vw, 58px);
  line-height: 1;
  letter-spacing: -0.055em;
}

.written-catalog__intro p {
  margin: 13px 0 0;
  color: var(--vp-c-text-2);
}

.written-catalog__summary {
  display: grid;
  min-width: 122px;
  padding: 16px 20px;
  border: 1px solid var(--vp-c-divider);
  text-align: right;
}

.written-catalog__summary strong {
  color: var(--exam-blue);
  font-family: var(--vp-font-family-mono);
  font-size: 38px;
  line-height: 1;
}

.written-catalog__summary span {
  margin-top: 5px;
  color: var(--vp-c-text-3);
  font-size: 11px;
}

.written-catalog__toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 240px;
  gap: 12px;
  margin-top: 20px;
}

.written-catalog__search,
.written-catalog__sort {
  display: grid;
  gap: 7px;
}

.written-catalog__search > span:last-child,
.written-catalog__sort > span:last-child {
  display: flex;
  align-items: center;
  min-height: 46px;
  padding: 0 13px;
  border: 1px solid var(--vp-c-text-1);
  background: var(--vp-c-bg);
}

.written-catalog__search input,
.written-catalog__sort select {
  flex: 1;
  min-width: 0;
  padding: 0 10px;
  border: 0;
  outline: 0;
  color: var(--vp-c-text-1);
  background: transparent;
  font: inherit;
}

.written-catalog__search button {
  display: grid;
  padding: 5px;
  border: 0;
  color: var(--vp-c-text-2);
  background: transparent;
  cursor: pointer;
}

.written-catalog__sort select {
  appearance: none;
}

.written-catalog__filters {
  margin-top: 12px;
  border: 1px solid var(--vp-c-divider);
  background: color-mix(in srgb, var(--vp-c-bg-alt) 72%, transparent);
}

.written-catalog__filter-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 13px;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 12px;
  font-weight: 800;
}

.written-catalog__filter-title span,
.written-catalog__filter-title button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.written-catalog__filter-title button {
  border: 0;
  color: var(--exam-blue);
  background: transparent;
  cursor: pointer;
  font-size: 11px;
  font-weight: 800;
}

.written-catalog__filter-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.written-catalog__filter-grid label {
  display: grid;
  gap: 5px;
  padding: 13px;
}

.written-catalog__filter-grid label + label {
  border-left: 1px solid var(--vp-c-divider);
}

.written-catalog__filter-grid span {
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 9px;
  font-weight: 900;
}

.written-catalog__filter-grid select {
  width: 100%;
  border: 0;
  outline: 0;
  color: var(--vp-c-text-1);
  background: transparent;
  font: inherit;
  font-weight: 700;
}

.written-catalog__result {
  display: flex;
  justify-content: space-between;
  margin-top: 18px;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 10px;
}

.written-catalog__result strong {
  color: var(--exam-blue);
  font-size: 15px;
}

.written-catalog__grid {
  display: grid;
  gap: 14px;
  margin-top: 12px;
}

.written-session-card {
  display: grid;
  grid-template-columns: 108px minmax(0, 1fr);
  border: 1px solid var(--vp-c-text-1);
  background: var(--vp-c-bg);
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.written-session-card:hover {
  transform: translate(-3px, -3px);
  box-shadow: 6px 6px 0 var(--exam-blue-soft);
}

.written-session-card--featured {
  border: 2px solid var(--exam-blue);
  background:
    linear-gradient(110deg, var(--exam-blue-soft), transparent 42%),
    var(--vp-c-bg);
}

.written-session-card__rail {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  padding: 18px 12px;
  border-right: 1px dashed var(--vp-c-text-1);
  background: color-mix(in srgb, var(--vp-c-bg-alt) 74%, transparent);
  writing-mode: vertical-rl;
}

.written-session-card__rail span {
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 9px;
  letter-spacing: 0.08em;
}

.written-session-card__rail strong {
  color: var(--exam-blue);
  font-family: var(--vp-font-family-mono);
  font-size: 23px;
  letter-spacing: 0.08em;
}

.written-session-card__body {
  min-width: 0;
  padding: 20px 24px;
}

.written-session-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.written-session-card__meta span,
.written-session-card__questions a,
.written-session-card footer div span {
  padding: 4px 7px;
  border: 1px solid var(--vp-c-divider);
  font-family: var(--vp-font-family-mono);
  font-size: 9px;
  font-weight: 800;
}

.written-session-card__meta .is-trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-color: var(--exam-blue);
  color: var(--exam-blue);
  background: var(--exam-blue-soft);
}

.written-session-card h3 {
  margin: 16px 0 0;
  font-size: clamp(23px, 4vw, 34px);
  letter-spacing: -0.035em;
}

.written-session-card h3 a {
  color: var(--vp-c-text-1);
  text-decoration: none;
}

.written-session-card__questions {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 14px;
}

.written-session-card__questions a {
  border-color: color-mix(in srgb, var(--exam-blue) 32%, var(--vp-c-divider));
  color: var(--exam-blue);
  text-decoration: none;
  transition: border-color 140ms ease, background 140ms ease, transform 140ms ease;
}

.written-session-card__questions a:hover {
  border-color: var(--exam-blue);
  background: var(--exam-blue-soft);
  transform: translateY(-1px);
}

.written-session-card footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  margin-top: 22px;
  padding-top: 14px;
  border-top: 1px solid var(--vp-c-divider);
}

.written-session-card footer > div {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.written-session-card footer > div span {
  border: 0;
  padding: 0;
  color: var(--vp-c-text-3);
}

.written-session-card footer > div span + span::before {
  margin-right: 6px;
  content: "·";
}

.written-session-card footer > a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  color: var(--exam-blue);
  font-size: 12px;
  font-weight: 900;
  text-decoration: none;
}

.written-catalog__empty {
  display: grid;
  justify-items: center;
  margin-top: 14px;
  padding: 44px 20px;
  border: 1px dashed var(--vp-c-text-1);
  color: var(--vp-c-text-2);
  text-align: center;
}

.written-catalog__empty strong {
  margin-top: 10px;
  color: var(--vp-c-text-1);
  font-size: 20px;
}

.written-catalog__empty p {
  margin: 5px 0 16px;
}

.written-catalog__empty button {
  padding: 8px 12px;
  border: 1px solid var(--vp-c-text-1);
  color: var(--vp-c-text-1);
  background: transparent;
  cursor: pointer;
  font-weight: 800;
}

@media (max-width: 760px) {
  .written-catalog__toolbar {
    grid-template-columns: 1fr;
  }

  .written-catalog__filter-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .written-catalog__filter-grid label:nth-child(3) {
    border-top: 1px solid var(--vp-c-divider);
    border-left: 0;
  }

  .written-catalog__filter-grid label:nth-child(4) {
    border-top: 1px solid var(--vp-c-divider);
  }
}

@media (max-width: 520px) {
  .written-catalog__intro {
    grid-template-columns: 1fr;
  }

  .written-catalog__summary {
    justify-self: start;
    text-align: left;
  }

  .written-catalog__filter-grid {
    grid-template-columns: 1fr;
  }

  .written-catalog__filter-grid label + label {
    border-top: 1px solid var(--vp-c-divider);
    border-left: 0;
  }

  .written-session-card {
    grid-template-columns: 1fr;
  }

  .written-session-card__rail {
    align-items: center;
    flex-direction: row;
    padding: 9px 13px;
    border-right: 0;
    border-bottom: 1px dashed var(--vp-c-text-1);
    writing-mode: initial;
  }

  .written-session-card__rail strong {
    font-size: 16px;
  }

  .written-session-card__body {
    padding: 18px;
  }

  .written-session-card footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
