<script setup lang="ts">
import { computed } from 'vue'
import { normalizeProblemTags } from '../utils/problemTags'

type Difficulty = 'easy' | 'medium' | 'hard'

const props = defineProps<{
  tags: string[]
  difficulty: Difficulty
  appearances: number
  passRate: string
  sourceUrl?: string
  sourceLabel?: string
}>()

const difficultyText = computed(() => ({
  easy: '简单',
  medium: '中等',
  hard: '困难'
})[props.difficulty])

const displayTags = computed(() => normalizeProblemTags(props.tags))
</script>

<template>
  <section class="problem-meta" aria-label="题目信息">
    <div class="problem-meta__tags">
      <span v-for="tag in displayTags" :key="tag" class="problem-tag">{{ tag }}</span>
      <a
        v-if="sourceUrl"
        class="problem-source"
        :href="sourceUrl"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ sourceLabel ?? '查看原题' }} <span aria-hidden="true">↗</span>
      </a>
    </div>
    <div class="problem-meta__stats">
      <span class="problem-difficulty" :class="`problem-difficulty--${difficulty}`">
        {{ difficultyText }}
      </span>
      <span><small>面试记录</small>出现 {{ appearances }} 次</span>
      <span><small>通过率</small>{{ passRate }}</span>
    </div>
  </section>
</template>
