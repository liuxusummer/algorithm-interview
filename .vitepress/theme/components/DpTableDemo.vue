<script setup lang="ts">
import { computed } from 'vue'
import AlgorithmPlayer from './AlgorithmPlayer.vue'
import {
  dpTableDemos,
  type DpTableDemoVariant,
  type DpTableState,
} from '../data/patternDemos'

const props = defineProps<{
  variant: DpTableDemoVariant
}>()

const demo = computed(() => dpTableDemos[props.variant])

function stateAt(index: number): DpTableState {
  return demo.value.steps[index].state
}

function keyOf(row: number, column: number) {
  return `${row}-${column}`
}

function cellClasses(row: number, column: number, state: DpTableState) {
  const key = keyOf(row, column)

  return {
    'is-active': state.active === key,
    'is-source': state.sources?.includes(key),
    'is-highlight': state.highlights?.includes(key),
    'is-empty': state.values[row]?.[column] === null,
    'is-false': state.values[row]?.[column] === '×',
    'is-true': state.values[row]?.[column] === '✓',
  }
}
</script>

<template>
  <AlgorithmPlayer
    :eyebrow="demo.eyebrow"
    :title="demo.title"
    :steps="demo.steps"
    :code-lines="demo.codeLines"
    :interval="2400"
  >
    <template #visual="{ index }">
      <div class="dp-engine">
        <div class="dp-engine__status">
          <span>STATE TABLE</span>
          <div>
            <small>BEST</small>
            <strong>{{ stateAt(index).best }}</strong>
          </div>
        </div>

        <div class="dp-engine__scroll">
          <div
            class="dp-engine__table"
            :style="{ '--dp-columns': demo.columnLabels.length }"
            role="table"
            :aria-label="`${demo.title} 当前动态规划状态表`"
          >
            <div class="dp-engine__corner">
              {{ demo.cornerLabel }}
            </div>
            <div
              v-for="label in demo.columnLabels"
              :key="`column-${label}`"
              class="dp-engine__column-label"
              role="columnheader"
            >
              {{ label }}
            </div>

            <template
              v-for="(row, rowIndex) in stateAt(index).values"
              :key="`row-${rowIndex}`"
            >
              <div
                class="dp-engine__row-label"
                role="rowheader"
              >
                {{ demo.rowLabels[rowIndex] }}
              </div>
              <div
                v-for="(value, columnIndex) in row"
                :key="`${rowIndex}-${columnIndex}`"
                class="dp-engine__cell"
                :class="cellClasses(rowIndex, columnIndex, stateAt(index))"
                role="cell"
              >
                <small>{{ rowIndex }},{{ columnIndex }}</small>
                <strong>{{ value ?? '·' }}</strong>
              </div>
            </template>
          </div>
        </div>

        <div class="dp-engine__legend">
          <span><i class="is-source" /> 本格依赖</span>
          <span><i class="is-active" /> 当前计算</span>
          <span><i class="is-highlight" /> 最优路径 / 区间</span>
        </div>

        <div class="dp-engine__formula">
          <small>TRANSITION</small>
          <strong>{{ stateAt(index).formula }}</strong>
        </div>
      </div>
    </template>
  </AlgorithmPlayer>
</template>

<style scoped>
.dp-engine {
  width: min(100%, 520px);
}

.dp-engine__status {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 15px;
  padding-bottom: 9px;
  border-bottom: 1px solid var(--vp-c-divider);
  font-family: var(--vp-font-family-mono);
}

.dp-engine__status > span {
  color: var(--algo-accent);
  font-size: 8px;
  font-weight: 950;
  letter-spacing: 0.12em;
}

.dp-engine__status > div {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.dp-engine__status small {
  color: var(--vp-c-text-3);
  font-size: 7px;
}

.dp-engine__status strong {
  color: var(--algo-lime);
  font-size: 16px;
}

.dp-engine__scroll {
  overflow-x: auto;
  padding: 2px 2px 8px;
}

.dp-engine__table {
  display: grid;
  grid-template-columns: 45px repeat(var(--dp-columns), minmax(47px, 1fr));
  min-width: calc(45px + var(--dp-columns) * 47px);
  border-top: 1px solid var(--vp-c-divider);
  border-left: 1px solid var(--vp-c-divider);
}

.dp-engine__corner,
.dp-engine__column-label,
.dp-engine__row-label,
.dp-engine__cell {
  border-right: 1px solid var(--vp-c-divider);
  border-bottom: 1px solid var(--vp-c-divider);
}

.dp-engine__corner,
.dp-engine__column-label,
.dp-engine__row-label {
  display: grid;
  min-height: 33px;
  color: var(--vp-c-text-3);
  background: color-mix(in srgb, var(--vp-c-bg) 82%, var(--vp-c-divider));
  font-family: var(--vp-font-family-mono);
  font-size: 9px;
  font-weight: 850;
  place-items: center;
}

.dp-engine__cell {
  position: relative;
  display: grid;
  min-height: 45px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  transition:
    color 180ms ease,
    background-color 180ms ease,
    transform 180ms ease;
  place-items: center;
}

.dp-engine__cell small {
  position: absolute;
  top: 3px;
  left: 4px;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 5px;
}

.dp-engine__cell strong {
  font-family: var(--vp-font-family-mono);
  font-size: 14px;
}

.dp-engine__cell.is-empty {
  color: var(--vp-c-text-3);
  background:
    repeating-linear-gradient(
      135deg,
      transparent,
      transparent 5px,
      color-mix(in srgb, var(--vp-c-divider) 36%, transparent) 5px,
      color-mix(in srgb, var(--vp-c-divider) 36%, transparent) 6px
    );
}

.dp-engine__cell.is-source {
  background: color-mix(in srgb, var(--algo-lime) 12%, var(--vp-c-bg));
  box-shadow: inset 0 0 0 1px var(--algo-lime);
}

.dp-engine__cell.is-highlight {
  color: var(--vp-c-text-1);
  background: color-mix(in srgb, var(--algo-lime) 25%, var(--vp-c-bg));
}

.dp-engine__cell.is-active {
  z-index: 1;
  color: var(--vp-c-bg);
  background: var(--algo-accent);
  box-shadow: 4px 4px 0 color-mix(in srgb, var(--vp-c-text-1) 26%, transparent);
  transform: translate(-2px, -2px);
}

.dp-engine__cell.is-false:not(.is-active) {
  color: color-mix(in srgb, var(--algo-accent) 72%, var(--vp-c-text-2));
}

.dp-engine__cell.is-true:not(.is-active) {
  color: var(--algo-lime);
}

.dp-engine__legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 15px;
  margin: 13px 0 16px;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 7px;
}

.dp-engine__legend span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.dp-engine__legend i {
  width: 10px;
  height: 10px;
  border: 1px solid currentColor;
}

.dp-engine__legend .is-source {
  border-color: var(--algo-lime);
  background: color-mix(in srgb, var(--algo-lime) 12%, transparent);
}

.dp-engine__legend .is-active {
  border-color: var(--algo-accent);
  background: var(--algo-accent);
}

.dp-engine__legend .is-highlight {
  border-color: var(--algo-lime);
  background: color-mix(in srgb, var(--algo-lime) 28%, transparent);
}

.dp-engine__formula {
  display: grid;
  gap: 4px;
  padding: 10px 12px;
  border: 1px solid var(--vp-c-text-1);
  border-left: 4px solid var(--algo-accent);
  background: color-mix(in srgb, var(--vp-c-bg) 85%, transparent);
  font-family: var(--vp-font-family-mono);
}

.dp-engine__formula small {
  color: var(--vp-c-text-3);
  font-size: 7px;
  letter-spacing: 0.08em;
}

.dp-engine__formula strong {
  overflow-wrap: anywhere;
  font-size: 11px;
}

@media (max-width: 640px) {
  .dp-engine__scroll {
    margin-right: -5px;
    margin-left: -5px;
  }

  .dp-engine__table {
    grid-template-columns: 38px repeat(var(--dp-columns), minmax(42px, 1fr));
    min-width: calc(38px + var(--dp-columns) * 42px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .dp-engine__cell {
    transition: none;
  }
}
</style>
