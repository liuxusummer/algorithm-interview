<script setup lang="ts">
import { computed } from 'vue'
import AlgorithmPlayer from './AlgorithmPlayer.vue'
import {
  gridSearchDemos,
  type GridSearchDemoVariant,
  type GridSearchState,
} from '../data/patternDemos'

const props = defineProps<{
  variant: GridSearchDemoVariant
}>()

const demo = computed(() => gridSearchDemos[props.variant])

function stateAt(index: number): GridSearchState {
  return demo.value.steps[index].state
}

function keyOf(row: number, column: number) {
  return `${row}-${column}`
}

function cellClasses(row: number, column: number, state: GridSearchState) {
  const key = keyOf(row, column)

  return {
    'is-active': state.active === key,
    'is-path': state.path?.includes(key),
    'is-visited': state.visited?.includes(key),
    'is-frontier': state.frontier?.includes(key),
    'is-completed': state.completed?.includes(key),
    'is-failed': state.failed?.includes(key),
    'is-blocked': demo.value.board[row][column] === '0',
  }
}

function pathOrder(row: number, column: number, state: GridSearchState) {
  const order = state.path?.indexOf(keyOf(row, column)) ?? -1
  return order >= 0 ? order + 1 : ''
}
</script>

<template>
  <AlgorithmPlayer
    :eyebrow="demo.eyebrow"
    :title="demo.title"
    :steps="demo.steps"
    :code-lines="demo.codeLines"
    :interval="2300"
  >
    <template #visual="{ index }">
      <div class="grid-engine">
        <div class="grid-engine__heading">
          <span>LIVE GRID</span>
          <div>
            <small>{{ stateAt(index).metricLabel }}</small>
            <strong>{{ stateAt(index).metricValue }}</strong>
          </div>
        </div>

        <div
          class="grid-engine__board"
          :style="{
            '--grid-columns': demo.board[0].length,
            '--grid-rows': demo.board.length,
          }"
          :aria-label="`${demo.title} 当前网格状态`"
        >
          <template
            v-for="(row, rowIndex) in demo.board"
            :key="rowIndex"
          >
            <div
              v-for="(cell, columnIndex) in row"
              :key="`${rowIndex}-${columnIndex}`"
              class="grid-engine__cell"
              :class="cellClasses(rowIndex, columnIndex, stateAt(index))"
            >
              <span class="grid-engine__coordinate">
                {{ rowIndex }},{{ columnIndex }}
              </span>
              <strong>{{ cell }}</strong>
              <i
                v-if="pathOrder(rowIndex, columnIndex, stateAt(index))"
                class="grid-engine__path-order"
              >
                {{ pathOrder(rowIndex, columnIndex, stateAt(index)) }}
              </i>
            </div>
          </template>
        </div>

        <div class="grid-engine__legend">
          <span><i class="is-frontier" /> frontier / 当前层</span>
          <span><i class="is-visited" /> 已访问</span>
          <span><i class="is-completed" /> 已归档</span>
          <span><i class="is-failed" /> 不可走</span>
        </div>

        <div class="grid-engine__operation">
          <div>
            <small>OPERATION</small>
            <strong>{{ stateAt(index).operation }}</strong>
          </div>
          <div v-if="stateAt(index).queue?.length">
            <small>QUEUE</small>
            <strong>{{ stateAt(index).queue?.join(' → ') }}</strong>
          </div>
        </div>
      </div>
    </template>
  </AlgorithmPlayer>
</template>

<style scoped>
.grid-engine {
  width: min(100%, 500px);
}

.grid-engine__heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
  padding-bottom: 9px;
  border-bottom: 1px solid var(--vp-c-divider);
  font-family: var(--vp-font-family-mono);
}

.grid-engine__heading > span {
  color: var(--algo-accent);
  font-size: 8px;
  font-weight: 950;
  letter-spacing: 0.12em;
}

.grid-engine__heading > div {
  display: flex;
  align-items: baseline;
  gap: 9px;
}

.grid-engine__heading small {
  color: var(--vp-c-text-3);
  font-size: 7px;
  letter-spacing: 0.08em;
}

.grid-engine__heading strong {
  color: var(--algo-lime);
  font-size: 16px;
}

.grid-engine__board {
  display: grid;
  grid-template-columns: repeat(var(--grid-columns), minmax(0, 1fr));
  width: min(100%, calc(var(--grid-columns) * 72px));
  margin: 0 auto;
  border-top: 1px solid var(--vp-c-divider);
  border-left: 1px solid var(--vp-c-divider);
}

.grid-engine__cell {
  position: relative;
  display: grid;
  aspect-ratio: 1.08;
  overflow: hidden;
  border-right: 1px solid var(--vp-c-divider);
  border-bottom: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  background:
    linear-gradient(135deg, transparent 68%, color-mix(in srgb, var(--vp-c-divider) 55%, transparent) 68%);
  transition:
    color 220ms ease,
    background-color 220ms ease,
    opacity 220ms ease,
    transform 220ms ease;
  place-items: center;
}

.grid-engine__cell strong {
  font-family: var(--vp-font-family-mono);
  font-size: clamp(15px, 4vw, 22px);
}

.grid-engine__coordinate {
  position: absolute;
  top: 4px;
  left: 5px;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 6px;
}

.grid-engine__cell.is-blocked {
  opacity: 0.28;
  background: repeating-linear-gradient(
    135deg,
    color-mix(in srgb, var(--vp-c-text-3) 18%, transparent),
    color-mix(in srgb, var(--vp-c-text-3) 18%, transparent) 3px,
    transparent 3px,
    transparent 7px
  );
}

.grid-engine__cell.is-path {
  box-shadow: inset 0 0 0 2px var(--algo-lime);
}

.grid-engine__cell.is-visited {
  color: var(--vp-c-text-2);
  background-color: color-mix(in srgb, var(--algo-lime) 10%, var(--vp-c-bg));
}

.grid-engine__cell.is-frontier {
  color: var(--algo-accent);
  background-color: color-mix(in srgb, var(--algo-accent) 17%, var(--vp-c-bg));
  box-shadow: inset 0 0 0 2px var(--algo-accent);
  transform: translateY(-2px);
}

.grid-engine__cell.is-active {
  color: var(--vp-c-bg);
  background: var(--algo-accent);
  box-shadow: inset 0 0 0 2px var(--vp-c-text-1);
}

.grid-engine__cell.is-completed {
  color: var(--vp-c-text-1);
  background: color-mix(in srgb, var(--algo-lime) 28%, var(--vp-c-bg));
}

.grid-engine__cell.is-failed {
  color: var(--algo-accent);
  background:
    linear-gradient(45deg, transparent 47%, var(--algo-accent) 48%, var(--algo-accent) 52%, transparent 53%),
    linear-gradient(-45deg, transparent 47%, var(--algo-accent) 48%, var(--algo-accent) 52%, transparent 53%);
}

.grid-engine__path-order {
  position: absolute;
  right: 4px;
  bottom: 4px;
  display: grid;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  color: var(--vp-c-bg);
  background: var(--algo-lime);
  font-family: var(--vp-font-family-mono);
  font-size: 7px;
  font-style: normal;
  font-weight: 950;
  place-items: center;
}

.grid-engine__legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 13px;
  margin: 15px 0 18px;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 7px;
}

.grid-engine__legend span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.grid-engine__legend i {
  width: 9px;
  height: 9px;
  border: 1px solid currentColor;
}

.grid-engine__legend .is-frontier {
  border-color: var(--algo-accent);
  background: color-mix(in srgb, var(--algo-accent) 22%, transparent);
}

.grid-engine__legend .is-visited {
  border-color: var(--algo-lime);
  background: color-mix(in srgb, var(--algo-lime) 12%, transparent);
}

.grid-engine__legend .is-completed {
  border-color: var(--algo-lime);
  background: color-mix(in srgb, var(--algo-lime) 35%, transparent);
}

.grid-engine__legend .is-failed {
  border-color: var(--algo-accent);
  background: linear-gradient(45deg, transparent 42%, var(--algo-accent) 43%, var(--algo-accent) 57%, transparent 58%);
}

.grid-engine__operation {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 5px;
}

.grid-engine__operation > div {
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 9px 10px;
  border: 1px solid var(--vp-c-divider);
  background: color-mix(in srgb, var(--vp-c-bg) 87%, transparent);
  font-family: var(--vp-font-family-mono);
}

.grid-engine__operation small {
  color: var(--vp-c-text-3);
  font-size: 7px;
  letter-spacing: 0.07em;
}

.grid-engine__operation strong {
  overflow-wrap: anywhere;
  font-size: 10px;
}

@media (max-width: 640px) {
  .grid-engine__cell {
    aspect-ratio: 1;
  }

  .grid-engine__coordinate {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .grid-engine__cell {
    transition: none;
  }
}
</style>
