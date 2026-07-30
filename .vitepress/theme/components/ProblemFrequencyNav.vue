<script setup lang="ts">
import {
  PhArrowLeft,
  PhArrowRight,
  PhChartLineUp,
  PhListNumbers
} from '@phosphor-icons/vue'
import { useData, withBase } from 'vitepress'
import { computed } from 'vue'
import {
  data as problems,
  type ProblemCatalogItem
} from '../data/problems.data'

const { page } = useData()

const rankedProblems = [...problems].sort((first, second) => (
  second.appearances - first.appearances
  || first.url.localeCompare(second.url, 'zh-CN', { numeric: true })
))

function routeFromRelativePath(relativePath: string) {
  return `/${relativePath.replace(/(?:index)?\.md$/, '').replace(/\/$/, '')}`
}

const currentIndex = computed(() => (
  rankedProblems.findIndex((problem) => (
    problem.url === routeFromRelativePath(page.value.relativePath)
  ))
))

const currentProblem = computed(() => (
  currentIndex.value >= 0 ? rankedProblems[currentIndex.value] : undefined
))

const previousProblem = computed<ProblemCatalogItem | undefined>(() => (
  currentIndex.value > 0
    ? rankedProblems[currentIndex.value - 1]
    : undefined
))

const nextProblem = computed<ProblemCatalogItem | undefined>(() => (
  currentIndex.value >= 0 && currentIndex.value < rankedProblems.length - 1
    ? rankedProblems[currentIndex.value + 1]
    : undefined
))

const progress = computed(() => (
  currentIndex.value >= 0
    ? Math.round(((currentIndex.value + 1) / rankedProblems.length) * 100)
    : 0
))

function problemLabel(problem: ProblemCatalogItem) {
  return `${problem.id} · ${problem.title}`
}
</script>

<template>
  <nav
    v-if="currentProblem"
    class="frequency-nav"
    aria-labelledby="frequency-nav-title"
  >
    <header class="frequency-nav__header">
      <div class="frequency-nav__heading">
        <span class="frequency-nav__eyebrow">
          <PhChartLineUp :size="15" weight="bold" aria-hidden="true" />
          FREQUENCY ROUTE
        </span>
        <h2 id="frequency-nav-title">按出现次数刷题</h2>
        <p>从高频向低频推进；出现次数相同时，按题号排序。</p>
      </div>

      <a
        class="frequency-nav__catalog-link"
        :href="withBase('/problems/README')"
      >
        <PhListNumbers :size="17" weight="bold" aria-hidden="true" />
        返回频次题单
      </a>
    </header>

    <div class="frequency-nav__status">
      <span>
        当前频次排名
        <strong>
          {{ String(currentIndex + 1).padStart(2, '0') }}
          /
          {{ String(rankedProblems.length).padStart(2, '0') }}
        </strong>
      </span>
      <span>
        本题出现
        <strong>{{ currentProblem.appearances }}</strong>
        次
      </span>
      <div
        class="frequency-nav__progress"
        role="progressbar"
        aria-label="按出现次数刷题进度"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="progress"
      >
        <span :style="{ width: `${progress}%` }" />
      </div>
    </div>

    <div class="frequency-nav__pagers">
      <a
        v-if="previousProblem"
        class="frequency-nav__pager frequency-nav__pager--previous"
        :href="withBase(previousProblem.url)"
        :aria-label="`上一题，更高频：${problemLabel(previousProblem)}`"
      >
        <PhArrowLeft :size="21" weight="bold" aria-hidden="true" />
        <span>
          <small>上一题 · 更高频</small>
          <strong>{{ problemLabel(previousProblem) }}</strong>
          <em>出现 {{ previousProblem.appearances }} 次</em>
        </span>
      </a>
      <span
        v-else
        class="frequency-nav__pager frequency-nav__pager--disabled"
        aria-disabled="true"
      >
        <PhArrowLeft :size="21" weight="bold" aria-hidden="true" />
        <span>
          <small>上一题 · 更高频</small>
          <strong>已到最高频题目</strong>
          <em>从这里开始最合适</em>
        </span>
      </span>

      <a
        v-if="nextProblem"
        class="frequency-nav__pager frequency-nav__pager--next"
        :href="withBase(nextProblem.url)"
        :aria-label="`下一题，继续降频：${problemLabel(nextProblem)}`"
      >
        <span>
          <small>下一题 · 继续降频</small>
          <strong>{{ problemLabel(nextProblem) }}</strong>
          <em>出现 {{ nextProblem.appearances }} 次</em>
        </span>
        <PhArrowRight :size="21" weight="bold" aria-hidden="true" />
      </a>
      <span
        v-else
        class="frequency-nav__pager frequency-nav__pager--next frequency-nav__pager--disabled"
        aria-disabled="true"
      >
        <span>
          <small>下一题 · 继续降频</small>
          <strong>本轮题单已完成</strong>
          <em>回到题单选择新的训练标签</em>
        </span>
        <PhArrowRight :size="21" weight="bold" aria-hidden="true" />
      </span>
    </div>
  </nav>
</template>

<style scoped>
.frequency-nav {
  --frequency-border: var(--vp-c-text-1);
  position: relative;
  margin-top: 64px;
  padding: 24px;
  border: 2px solid var(--frequency-border);
  color: var(--vp-c-text-1);
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--algo-accent) 9%, var(--vp-c-bg)) 0 31%,
      transparent 31%
    ),
    var(--vp-c-bg);
  box-shadow: 8px 8px 0 var(--algo-lime);
}

.frequency-nav::before {
  position: absolute;
  inset: -2px auto -2px -2px;
  width: 6px;
  background: var(--algo-accent);
  content: "";
}

.frequency-nav__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.frequency-nav__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--algo-accent);
  font-family: var(--vp-font-family-mono);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.11em;
}

.frequency-nav__heading h2 {
  margin: 7px 0 6px;
  padding: 0;
  border: 0;
  font-size: 24px;
  line-height: 1.15;
  letter-spacing: -0.035em;
}

.frequency-nav__heading p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.6;
}

.frequency-nav__catalog-link {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 7px;
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid var(--frequency-border);
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  font-weight: 850;
  text-decoration: none;
  transition: transform 140ms ease, box-shadow 140ms ease;
}

.frequency-nav__catalog-link:hover {
  color: var(--vp-c-text-1);
  transform: translate(-2px, -2px);
  box-shadow: 3px 3px 0 var(--algo-accent);
}

.frequency-nav__status {
  display: grid;
  grid-template-columns: auto auto minmax(120px, 1fr);
  align-items: center;
  gap: 14px 20px;
  margin-top: 22px;
  padding: 11px 13px;
  border: 1px solid var(--vp-c-divider);
  background: color-mix(in srgb, var(--vp-c-bg-alt) 76%, transparent);
  font-family: var(--vp-font-family-mono);
  font-size: 10px;
  font-weight: 750;
}

.frequency-nav__status > span {
  color: var(--vp-c-text-2);
  white-space: nowrap;
}

.frequency-nav__status strong {
  margin-left: 4px;
  color: var(--vp-c-text-1);
  font-size: 12px;
}

.frequency-nav__progress {
  overflow: hidden;
  height: 7px;
  border: 1px solid var(--frequency-border);
  background: var(--vp-c-bg);
}

.frequency-nav__progress > span {
  display: block;
  height: 100%;
  background: var(--algo-accent);
  transition: width 240ms ease;
}

.frequency-nav__pagers {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.frequency-nav__pager {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  min-height: 104px;
  padding: 15px;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  background: color-mix(in srgb, var(--vp-c-bg) 94%, transparent);
  text-decoration: none;
  transition:
    border-color 140ms ease,
    transform 140ms ease,
    box-shadow 140ms ease;
}

a.frequency-nav__pager:hover {
  border-color: var(--frequency-border);
  color: var(--vp-c-text-1);
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0 var(--frequency-border);
}

.frequency-nav__pager > svg {
  flex: 0 0 auto;
  color: var(--algo-accent);
}

.frequency-nav__pager > span {
  display: grid;
  min-width: 0;
  gap: 5px;
}

.frequency-nav__pager small {
  color: var(--algo-accent);
  font-family: var(--vp-font-family-mono);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.07em;
}

.frequency-nav__pager strong {
  overflow: hidden;
  font-size: 14px;
  font-weight: 850;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.frequency-nav__pager em {
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 10px;
  font-style: normal;
  font-weight: 700;
}

.frequency-nav__pager--next {
  justify-content: flex-end;
  text-align: right;
}

.frequency-nav__pager--disabled {
  opacity: 0.48;
}

.frequency-nav :focus-visible {
  outline: 3px solid var(--algo-accent);
  outline-offset: 3px;
}

@media (max-width: 680px) {
  .frequency-nav {
    padding: 19px;
    box-shadow: 6px 6px 0 var(--algo-lime);
  }

  .frequency-nav__header {
    align-items: stretch;
    flex-direction: column;
    gap: 16px;
  }

  .frequency-nav__catalog-link {
    align-self: flex-start;
  }

  .frequency-nav__status {
    grid-template-columns: repeat(2, 1fr);
  }

  .frequency-nav__progress {
    grid-column: 1 / -1;
  }

  .frequency-nav__pagers {
    grid-template-columns: 1fr;
  }

  .frequency-nav__pager {
    min-height: 92px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .frequency-nav__catalog-link,
  .frequency-nav__pager,
  .frequency-nav__progress > span {
    transition: none;
  }
}
</style>
