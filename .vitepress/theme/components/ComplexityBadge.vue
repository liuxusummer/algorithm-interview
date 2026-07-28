<script setup lang="ts">
withDefaults(defineProps<{
  time: string
  space: string
  label?: string
}>(), {
  label: '复杂度'
})
</script>

<template>
  <div class="complexity-badge" role="note" :aria-label="`${label}：时间 ${time}，空间 ${space}`">
    <span class="complexity-badge__label">{{ label }}</span>
    <span><small>TIME</small>{{ time }}</span>
    <span><small>SPACE</small>{{ space }}</span>
  </div>
</template>
