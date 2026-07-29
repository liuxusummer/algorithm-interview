<script setup lang="ts">
import {
  PhArrowRight,
  PhArrowSquareOut,
  PhCaretDown,
  PhFunnel,
  PhMagnifyingGlass,
  PhSortAscending,
  PhX
} from '@phosphor-icons/vue'
import { withBase } from 'vitepress'
import { computed, ref } from 'vue'
import { data as problems } from '../data/problems.data'
import {
  getProblemTagGroup,
  normalizeProblemTags,
  type ProblemTagGroup
} from '../utils/problemTags'

type SortOrder = 'frequency-desc' | 'frequency-asc' | 'default'

const difficultyText = {
  easy: '简单',
  medium: '中等',
  hard: '困难'
}

const query = ref('')
const selectedTags = ref<Set<string>>(new Set())
const showAllTags = ref(false)
const sortOrder = ref<SortOrder>('frequency-desc')

const problemTags = (tags: string[]) => normalizeProblemTags(tags)

const tagStats = computed(() => {
  const counts = new Map<string, number>()

  for (const problem of problems) {
    for (const tag of problemTags(problem.tags)) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }

  return [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((first, second) => (
      second.count - first.count
      || first.name.localeCompare(second.name, 'zh-CN')
    ))
})

const tagGroupLabels: Record<ProblemTagGroup, string> = {
  source: '来源与题单',
  topic: '核心分类',
  technique: '技巧与变体'
}

const tagGroupOrder: ProblemTagGroup[] = ['source', 'topic', 'technique']

const groupedTags = computed(() => tagGroupOrder.map((group) => ({
  group,
  label: tagGroupLabels[group],
  tags: tagStats.value.filter((tag) => getProblemTagGroup(tag.name) === group)
})))

const visibleTags = computed(() => {
  if (showAllTags.value) {
    return tagStats.value
  }

  const featured = tagStats.value.slice(0, 16)
  const visibleNames = new Set(featured.map((tag) => tag.name))

  return [
    ...featured,
    ...tagStats.value.filter((tag) => (
      selectedTags.value.has(tag.name)
      && !visibleNames.has(tag.name)
    ))
  ]
})

const filteredProblems = computed(() => {
  const keyword = query.value.trim().toLocaleLowerCase('zh-CN')
  const activeTags = [...selectedTags.value]

  return problems
    .filter((problem) => {
      const matchesQuery = !keyword || [
        problem.id,
        problem.title,
        problem.fullTitle,
        ...problemTags(problem.tags)
      ].some((value) => value.toLocaleLowerCase('zh-CN').includes(keyword))

      const matchesTags = activeTags.every((tag) => (
        problemTags(problem.tags).includes(tag)
      ))

      return matchesQuery && matchesTags
    })
    .sort((first, second) => {
      if (sortOrder.value === 'frequency-desc') {
        return (
          second.appearances - first.appearances
          || first.url.localeCompare(second.url, 'zh-CN', { numeric: true })
        )
      }

      if (sortOrder.value === 'frequency-asc') {
        return (
          first.appearances - second.appearances
          || first.url.localeCompare(second.url, 'zh-CN', { numeric: true })
        )
      }

      return first.url.localeCompare(second.url, 'zh-CN', { numeric: true })
    })
})

const hasFilters = computed(() => (
  query.value.trim().length > 0
  || selectedTags.value.size > 0
))

function toggleTag(tag: string) {
  const nextTags = new Set(selectedTags.value)

  if (nextTags.has(tag)) {
    nextTags.delete(tag)
  } else {
    nextTags.add(tag)
  }

  selectedTags.value = nextTags
}

function clearFilters() {
  query.value = ''
  selectedTags.value = new Set()
}
</script>

<template>
  <section class="problem-catalog" aria-labelledby="problem-catalog-title">
    <header class="problem-catalog__intro">
      <div>
        <span class="problem-catalog__eyebrow">INTERVIEW PROBLEM INDEX</span>
        <h2 id="problem-catalog-title">训练控制台</h2>
        <p>用标签缩小训练范围，再按面试出现次数安排刷题优先级。</p>
      </div>
      <div class="problem-catalog__total">
        <strong>{{ problems.length }}</strong>
        <span>道完整题解</span>
      </div>
    </header>

    <div class="problem-catalog__controls">
      <label class="problem-search">
        <span class="problem-control-label">搜索</span>
        <span class="problem-search__field">
          <PhMagnifyingGlass :size="18" aria-hidden="true" />
          <input
            v-model="query"
            type="search"
            aria-label="搜索题目、编号或标签"
            placeholder="题目、编号或标签"
            autocomplete="off"
          >
          <button
            v-if="query"
            type="button"
            aria-label="清空搜索"
            @click="query = ''"
          >
            <PhX :size="16" aria-hidden="true" />
          </button>
        </span>
      </label>

      <label class="problem-sort">
        <span class="problem-control-label">排序</span>
        <span class="problem-sort__field">
          <PhSortAscending :size="18" aria-hidden="true" />
          <select v-model="sortOrder" aria-label="题目排序方式">
            <option value="frequency-desc">出现次数：从高到低</option>
            <option value="frequency-asc">出现次数：从低到高</option>
            <option value="default">题号顺序</option>
          </select>
          <PhCaretDown :size="14" aria-hidden="true" />
        </span>
      </label>
    </div>

    <div class="problem-tag-filter">
      <div class="problem-tag-filter__heading">
        <span>
          <PhFunnel :size="17" aria-hidden="true" />
          标签筛选
          <small>多选时需同时满足</small>
        </span>
        <button
          v-if="hasFilters"
          type="button"
          class="problem-filter-clear"
          @click="clearFilters"
        >
          清空筛选
          <PhX :size="14" aria-hidden="true" />
        </button>
      </div>

      <div v-if="!showAllTags" class="problem-tag-filter__list">
        <button
          v-for="tag in visibleTags"
          :key="tag.name"
          type="button"
          class="problem-filter-tag"
          :class="{ 'problem-filter-tag--active': selectedTags.has(tag.name) }"
          :aria-pressed="selectedTags.has(tag.name)"
          @click="toggleTag(tag.name)"
        >
          <span>{{ tag.name }}</span>
          <small>{{ tag.count }}</small>
        </button>
      </div>

      <div v-else class="problem-tag-filter__groups">
        <section
          v-for="tagGroup in groupedTags"
          :key="tagGroup.group"
          class="problem-tag-filter__group"
          :aria-labelledby="`problem-tag-group-${tagGroup.group}`"
        >
          <span
            :id="`problem-tag-group-${tagGroup.group}`"
            class="problem-tag-filter__group-label"
          >
            {{ tagGroup.label }}
          </span>
          <div class="problem-tag-filter__list">
            <button
              v-for="tag in tagGroup.tags"
              :key="tag.name"
              type="button"
              class="problem-filter-tag"
              :class="{ 'problem-filter-tag--active': selectedTags.has(tag.name) }"
              :aria-pressed="selectedTags.has(tag.name)"
              @click="toggleTag(tag.name)"
            >
              <span>{{ tag.name }}</span>
              <small>{{ tag.count }}</small>
            </button>
          </div>
        </section>

      </div>

      <button
        type="button"
        class="problem-filter-more"
        :aria-expanded="showAllTags"
        @click="showAllTags = !showAllTags"
      >
        {{ showAllTags ? '收起标签' : `全部标签 ${tagStats.length}` }}
        <PhCaretDown
          :size="14"
          aria-hidden="true"
          :class="{ 'is-open': showAllTags }"
        />
      </button>
    </div>

    <div class="problem-catalog__result-bar" aria-live="polite">
      <span>
        当前命中
        <strong>{{ filteredProblems.length }}</strong>
        道
      </span>
      <span v-if="selectedTags.size" class="problem-catalog__active">
        <span
          v-for="tag in selectedTags"
          :key="tag"
          class="problem-catalog__active-tag"
        >
          {{ tag }}
        </span>
      </span>
      <span v-else>点击标签即可开始筛选</span>
    </div>

    <div v-if="filteredProblems.length" class="problem-catalog__grid">
      <article
        v-for="problem in filteredProblems"
        :key="problem.url"
        class="problem-card"
      >
        <div class="problem-card__top">
          <span class="problem-card__id">{{ problem.id }}</span>
          <span
            class="problem-card__difficulty"
            :class="`problem-card__difficulty--${problem.difficulty}`"
          >
            {{ difficultyText[problem.difficulty] }}
          </span>
        </div>

        <h3>
          <a :href="withBase(problem.url)">{{ problem.title }}</a>
        </h3>

        <div class="problem-card__tags">
          <button
            v-for="tag in problemTags(problem.tags)"
            :key="tag"
            type="button"
            :aria-label="`筛选标签：${tag}`"
            @click="toggleTag(tag)"
          >
            {{ tag }}
          </button>
        </div>

        <footer class="problem-card__footer">
          <div class="problem-card__stats">
            <span>
              <strong>{{ problem.appearances }}</strong>
              次出现
            </span>
            <span>
              <strong>{{ problem.passRate }}</strong>
              通过率
            </span>
          </div>
          <div class="problem-card__links">
            <a
              v-if="problem.sourceUrl"
              :href="problem.sourceUrl"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="打开原题"
            >
              原题
              <PhArrowSquareOut :size="14" aria-hidden="true" />
            </a>
            <a :href="withBase(problem.url)">
              题解
              <PhArrowRight :size="15" aria-hidden="true" />
            </a>
          </div>
        </footer>
      </article>
    </div>

    <div v-else class="problem-catalog__empty">
      <span>0</span>
      <strong>没有同时满足这些条件的题目</strong>
      <p>减少标签组合，或者换一个搜索词再试。</p>
      <button type="button" @click="clearFilters">恢复全部题目</button>
    </div>
  </section>
</template>

<style scoped>
.problem-catalog {
  --catalog-border: var(--vp-c-text-1);
  margin: 30px 0 42px;
  color: var(--vp-c-text-1);
}

.problem-catalog__intro {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 28px;
  padding: 26px 28px;
  border: 2px solid var(--catalog-border);
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--algo-accent) 10%, var(--vp-c-bg)) 0 42%,
      var(--vp-c-bg) 42%
    );
  box-shadow: 8px 8px 0 var(--catalog-border);
}

.problem-catalog__eyebrow {
  color: var(--algo-accent);
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.problem-catalog__intro h2 {
  margin: 5px 0 8px;
  padding: 0;
  border: 0;
  font-size: clamp(28px, 5vw, 44px);
  line-height: 1;
}

.problem-catalog__intro p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.problem-catalog__total {
  display: flex;
  align-items: baseline;
  gap: 8px;
  white-space: nowrap;
}

.problem-catalog__total strong {
  color: var(--algo-accent);
  font-family: var(--vp-font-family-mono);
  font-size: 52px;
  line-height: 0.85;
}

.problem-catalog__total span {
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  font-weight: 800;
}

.problem-catalog__controls {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) minmax(240px, 0.72fr);
  gap: 12px;
  margin-top: 24px;
}

.problem-search,
.problem-sort {
  display: grid;
  gap: 7px;
}

.problem-control-label {
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.problem-search__field,
.problem-sort__field {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 48px;
  border: 1px solid var(--vp-c-divider);
  background: color-mix(in srgb, var(--vp-c-bg) 94%, transparent);
}

.problem-search__field > svg,
.problem-sort__field > svg:first-child {
  flex: 0 0 auto;
  margin-left: 15px;
  color: var(--algo-accent);
}

.problem-search input,
.problem-sort select {
  width: 100%;
  min-width: 0;
  height: 46px;
  padding: 0 42px 0 12px;
  border: 0;
  outline: 0;
  color: var(--vp-c-text-1);
  background: transparent;
  font: 700 13px/1 var(--vp-font-family-mono);
}

.problem-search input::placeholder {
  color: var(--vp-c-text-3);
}

.problem-search input::-webkit-search-cancel-button {
  display: none;
  appearance: none;
}

.problem-search__field:focus-within,
.problem-sort__field:focus-within {
  border-color: var(--algo-accent);
  box-shadow: 3px 3px 0 var(--algo-accent);
}

.problem-search button {
  position: absolute;
  right: 9px;
  display: grid;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  place-items: center;
  color: var(--vp-c-text-2);
  background: transparent;
  cursor: pointer;
}

.problem-sort select {
  appearance: none;
  cursor: pointer;
}

.problem-sort__field > svg:last-child {
  position: absolute;
  right: 14px;
  pointer-events: none;
}

.problem-tag-filter {
  margin-top: 18px;
  padding: 17px;
  border: 1px solid var(--vp-c-divider);
  background: color-mix(in srgb, var(--vp-c-bg-alt) 72%, transparent);
}

.problem-tag-filter__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 13px;
}

.problem-tag-filter__heading > span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  font-weight: 850;
}

.problem-tag-filter__heading small {
  color: var(--vp-c-text-3);
  font-size: 10px;
  font-weight: 650;
}

.problem-filter-clear {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0;
  border: 0;
  border-bottom: 1px solid currentColor;
  color: var(--algo-accent);
  background: transparent;
  font-family: var(--vp-font-family-mono);
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
}

.problem-tag-filter__list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.problem-tag-filter__groups {
  display: grid;
  gap: 18px;
}

.problem-tag-filter__group {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  align-items: start;
  gap: 12px;
}

.problem-tag-filter__group-label {
  padding-top: 8px;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
  font-size: 10px;
  font-weight: 850;
  letter-spacing: 0.06em;
}

.problem-filter-tag,
.problem-filter-more {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 10px;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  font-weight: 750;
  cursor: pointer;
  transition:
    color 140ms ease,
    border-color 140ms ease,
    background 140ms ease,
    transform 140ms ease;
}

.problem-filter-tag {
  gap: 7px;
}

.problem-filter-tag small {
  display: grid;
  min-width: 19px;
  height: 19px;
  padding: 0 4px;
  border-radius: 20px;
  place-items: center;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-alt);
  font-size: 9px;
}

.problem-filter-tag:hover,
.problem-filter-more:hover {
  border-color: var(--algo-accent);
  color: var(--algo-accent);
  transform: translateY(-1px);
}

.problem-filter-tag--active {
  border-color: var(--vp-c-text-1);
  color: var(--vp-c-bg);
  background: var(--vp-c-text-1);
  box-shadow: 3px 3px 0 var(--algo-lime);
}

.problem-filter-tag--active small {
  color: var(--vp-c-text-1);
  background: var(--algo-lime);
}

.problem-filter-more {
  gap: 6px;
  margin-top: 10px;
  border-style: dashed;
}

.problem-filter-more svg {
  transition: transform 160ms ease;
}

.problem-filter-more svg.is-open {
  transform: rotate(180deg);
}

.problem-catalog__result-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  min-height: 42px;
  margin-top: 24px;
  padding: 0 2px 9px;
  border-bottom: 2px solid var(--vp-c-text-1);
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
}

.problem-catalog__result-bar strong {
  margin: 0 3px;
  color: var(--algo-accent);
  font-size: 20px;
}

.problem-catalog__active {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 5px;
}

.problem-catalog__active-tag {
  padding: 2px 6px;
  color: var(--vp-c-text-1);
  background: var(--algo-lime);
  font-size: 9px;
  font-weight: 850;
}

.problem-catalog__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 13px;
  margin-top: 16px;
}

.problem-card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 224px;
  padding: 18px;
  border: 1px solid var(--vp-c-divider);
  background: color-mix(in srgb, var(--vp-c-bg) 95%, transparent);
  transition:
    border-color 160ms ease,
    transform 160ms ease,
    box-shadow 160ms ease;
}

.problem-card::before {
  position: absolute;
  top: -1px;
  left: -1px;
  width: 4px;
  height: 42px;
  background: var(--algo-accent);
  content: "";
}

.problem-card:hover {
  border-color: var(--vp-c-text-1);
  box-shadow: 5px 5px 0 var(--vp-c-divider);
  transform: translate(-2px, -2px);
}

.problem-card__top,
.problem-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.problem-card__id {
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 10px;
  font-weight: 850;
  letter-spacing: 0.04em;
}

.problem-card__difficulty {
  padding: 2px 7px;
  border: 1px solid currentColor;
  border-radius: 99px;
  font-family: var(--vp-font-family-mono);
  font-size: 9px;
  font-weight: 850;
}

.problem-card__difficulty--easy {
  color: #3f9c4b;
}

.problem-card__difficulty--medium {
  color: #d77a16;
}

.problem-card__difficulty--hard {
  color: #cf3f3f;
}

.problem-card h3 {
  margin: 17px 0 13px;
  font-size: 19px;
  line-height: 1.28;
}

.problem-card h3 a {
  color: var(--vp-c-text-1);
  text-decoration: none;
}

.problem-card h3 a:hover {
  color: var(--algo-accent);
}

.problem-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 20px;
}

.problem-card__tags button {
  padding: 2px 6px;
  border: 1px solid color-mix(in srgb, var(--algo-accent) 28%, transparent);
  border-radius: 2px;
  color: var(--algo-accent);
  background: var(--vp-c-brand-soft);
  font-family: var(--vp-font-family-mono);
  font-size: 9px;
  font-weight: 800;
  cursor: pointer;
}

.problem-card__tags button:hover {
  border-color: var(--algo-accent);
}

.problem-card__footer {
  margin-top: auto;
  padding-top: 13px;
  border-top: 1px solid var(--vp-c-divider);
}

.problem-card__stats,
.problem-card__links,
.problem-card__links a {
  display: flex;
  align-items: center;
}

.problem-card__stats {
  gap: 12px;
}

.problem-card__stats span {
  display: grid;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
  font-size: 9px;
}

.problem-card__stats strong {
  color: var(--vp-c-text-1);
  font-size: 14px;
}

.problem-card__links {
  gap: 9px;
}

.problem-card__links a {
  gap: 3px;
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 10px;
  font-weight: 850;
  text-decoration: none;
}

.problem-card__links a:hover {
  color: var(--algo-accent);
}

.problem-catalog__empty {
  display: grid;
  min-height: 300px;
  margin-top: 16px;
  border: 1px dashed var(--vp-c-divider);
  place-content: center;
  justify-items: center;
  text-align: center;
}

.problem-catalog__empty > span {
  color: var(--algo-accent);
  font-family: var(--vp-font-family-mono);
  font-size: 58px;
  font-weight: 900;
  line-height: 1;
}

.problem-catalog__empty strong {
  margin-top: 10px;
  font-size: 17px;
}

.problem-catalog__empty p {
  margin: 5px 0 15px;
  color: var(--vp-c-text-3);
  font-size: 12px;
}

.problem-catalog__empty button {
  min-height: 38px;
  padding: 0 13px;
  border: 1px solid var(--vp-c-text-1);
  color: var(--vp-c-bg);
  background: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
}

@media (max-width: 720px) {
  .problem-catalog__intro {
    align-items: start;
    grid-template-columns: 1fr;
  }

  .problem-catalog__total {
    justify-content: flex-start;
  }

  .problem-catalog__controls,
  .problem-catalog__grid {
    grid-template-columns: 1fr;
  }

  .problem-catalog__result-bar {
    align-items: flex-start;
    flex-direction: column;
  }

  .problem-catalog__active {
    justify-content: flex-start;
  }
}

@media (max-width: 460px) {
  .problem-catalog__intro {
    padding: 21px;
    box-shadow: 5px 5px 0 var(--catalog-border);
  }

  .problem-tag-filter__heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .problem-tag-filter__heading small {
    display: block;
  }

  .problem-tag-filter__group {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .problem-tag-filter__group-label {
    padding-top: 0;
  }

  .problem-card__footer {
    align-items: flex-end;
  }
}

@media (prefers-reduced-motion: reduce) {
  .problem-card,
  .problem-filter-tag,
  .problem-filter-more,
  .problem-filter-more svg {
    transition: none;
  }
}
</style>
