<script setup lang="ts">
import { computed } from 'vue'
import AlgorithmPlayer from './AlgorithmPlayer.vue'
import {
  stackQueueDemos,
  type StackQueueDemoVariant,
  type StackQueueState,
} from '../data/patternDemos'

const props = defineProps<{
  variant: StackQueueDemoVariant
}>()

const demo = computed(() => stackQueueDemos[props.variant])

const isDeque = computed(() => props.variant === 'sliding-window-maximum')

function stateAt(index: number): StackQueueState {
  return demo.value.steps[index].state
}

function tokenClasses(tokenIndex: number, state: StackQueueState) {
  const inWindow = state.window
    ? tokenIndex >= state.window[0] && tokenIndex <= state.window[1]
    : false

  return {
    'is-cursor': tokenIndex === state.cursor,
    'is-window': inWindow,
    'is-active': state.active?.includes(tokenIndex),
    'is-past': tokenIndex < state.cursor,
  }
}
</script>

<template>
  <AlgorithmPlayer
    :eyebrow="demo.eyebrow"
    :title="demo.title"
    :steps="demo.steps"
    :code-lines="demo.codeLines"
    :interval="2250"
  >
    <template #visual="{ index }">
      <div class="stack-engine">
        <div class="stack-engine__meta">
          <span>STREAM</span>
          <strong>{{ stateAt(index).metric }}</strong>
        </div>

        <div class="stack-engine__input-scroll">
          <div
            class="stack-engine__input"
            :style="{ '--token-count': demo.input.length }"
            :aria-label="`当前输入位置 ${stateAt(index).cursor}`"
          >
            <div
              v-for="(token, tokenIndex) in demo.input"
              :key="`${token}-${tokenIndex}`"
              class="stack-engine__token"
              :class="tokenClasses(tokenIndex, stateAt(index))"
            >
              <span
                v-if="tokenIndex === stateAt(index).cursor"
                class="stack-engine__cursor"
              >
                CUR
              </span>
              <strong>{{ token }}</strong>
              <small>{{ tokenIndex }}</small>
            </div>
          </div>
        </div>

        <div class="stack-engine__workspace">
          <div class="stack-engine__container">
            <div class="stack-engine__container-title">
              <span>{{ stateAt(index).stackLabel }}</span>
              <small>{{ isDeque ? 'FRONT → BACK' : 'BOTTOM → TOP' }}</small>
            </div>

            <div
              class="stack-engine__items"
              :class="{ 'is-deque': isDeque }"
            >
              <span
                v-if="!stateAt(index).stack.length"
                class="stack-engine__empty"
              >
                EMPTY
              </span>
              <span
                v-for="(item, itemIndex) in stateAt(index).stack"
                :key="`${item}-${itemIndex}`"
                class="stack-engine__item"
                :class="{ 'is-top': itemIndex === stateAt(index).stack.length - 1 }"
              >
                <small>{{ isDeque && itemIndex === 0 ? 'FRONT' : itemIndex }}</small>
                <strong>{{ item }}</strong>
              </span>
            </div>

            <div
              v-if="stateAt(index).removed?.length"
              class="stack-engine__removed"
            >
              <small>REMOVED</small>
              <span>{{ stateAt(index).removed?.join(' · ') }}</span>
            </div>
          </div>

          <div class="stack-engine__result">
            <small>OUTPUT / STATE</small>
            <div>
              <span
                v-for="(item, outputIndex) in stateAt(index).output"
                :key="`${item}-${outputIndex}`"
              >
                {{ item }}
              </span>
              <em v-if="!stateAt(index).output.length">—</em>
            </div>
          </div>
        </div>

        <div class="stack-engine__operation">
          <small>CURRENT OPERATION</small>
          <strong>{{ stateAt(index).operation }}</strong>
        </div>
      </div>
    </template>
  </AlgorithmPlayer>
</template>

<style scoped>
.stack-engine {
  width: min(100%, 520px);
}

.stack-engine__meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 26px;
  padding-bottom: 9px;
  border-bottom: 1px solid var(--vp-c-divider);
  font-family: var(--vp-font-family-mono);
}

.stack-engine__meta span {
  color: var(--algo-accent);
  font-size: 8px;
  font-weight: 950;
  letter-spacing: 0.12em;
}

.stack-engine__meta strong {
  color: var(--algo-lime);
  font-size: 12px;
}

.stack-engine__input-scroll {
  overflow-x: auto;
  padding: 16px 2px 11px;
}

.stack-engine__input {
  display: grid;
  grid-template-columns: repeat(var(--token-count), minmax(42px, 1fr));
  gap: 4px;
  min-width: calc(var(--token-count) * 42px);
}

.stack-engine__token {
  position: relative;
  display: grid;
  min-height: 48px;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  transition:
    opacity 180ms ease,
    color 180ms ease,
    background-color 180ms ease,
    transform 180ms ease;
  place-items: center;
}

.stack-engine__token strong {
  font-family: var(--vp-font-family-mono);
  font-size: 15px;
}

.stack-engine__token small {
  position: absolute;
  right: 4px;
  bottom: 3px;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 6px;
}

.stack-engine__token.is-past:not(.is-window) {
  opacity: 0.48;
}

.stack-engine__token.is-window {
  background: color-mix(in srgb, var(--algo-lime) 12%, var(--vp-c-bg));
  box-shadow: inset 0 -3px var(--algo-lime);
}

.stack-engine__token.is-active {
  border-color: var(--algo-lime);
}

.stack-engine__token.is-cursor {
  color: var(--vp-c-bg);
  background: var(--algo-accent);
  border-color: var(--algo-accent);
  transform: translateY(-3px);
}

.stack-engine__cursor {
  position: absolute;
  bottom: calc(100% + 3px);
  color: var(--algo-accent);
  font-family: var(--vp-font-family-mono);
  font-size: 7px;
  font-weight: 950;
}

.stack-engine__cursor::after {
  display: block;
  width: 1px;
  height: 5px;
  margin: 1px auto -4px;
  background: currentColor;
  content: "";
}

.stack-engine__workspace {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(120px, 0.65fr);
  gap: 7px;
  margin-top: 14px;
}

.stack-engine__container,
.stack-engine__result {
  min-width: 0;
  padding: 10px;
  border: 1px solid var(--vp-c-divider);
  background: color-mix(in srgb, var(--vp-c-bg) 87%, transparent);
}

.stack-engine__container-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 9px;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 7px;
  letter-spacing: 0.05em;
}

.stack-engine__items {
  display: flex;
  flex-direction: column-reverse;
  gap: 3px;
  min-height: 118px;
  padding: 7px;
  border-right: 2px solid var(--vp-c-text-2);
  border-bottom: 2px solid var(--vp-c-text-2);
  border-left: 2px solid var(--vp-c-text-2);
}

.stack-engine__items.is-deque {
  flex-direction: row;
  align-items: center;
  min-height: 70px;
  overflow-x: auto;
  border-top: 2px solid var(--vp-c-text-2);
}

.stack-engine__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
  padding: 6px 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  font-family: var(--vp-font-family-mono);
}

.is-deque .stack-engine__item {
  flex: 0 0 auto;
  min-width: 62px;
  min-height: 41px;
}

.stack-engine__item.is-top {
  border-color: var(--algo-accent);
  background: color-mix(in srgb, var(--algo-accent) 12%, var(--vp-c-bg));
}

.is-deque .stack-engine__item:first-of-type {
  border-color: var(--algo-lime);
  background: color-mix(in srgb, var(--algo-lime) 14%, var(--vp-c-bg));
}

.stack-engine__item small {
  color: var(--vp-c-text-3);
  font-size: 6px;
}

.stack-engine__item strong {
  overflow-wrap: anywhere;
  font-size: 10px;
}

.stack-engine__empty {
  margin: auto;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 9px;
  letter-spacing: 0.1em;
}

.stack-engine__removed {
  display: flex;
  flex-wrap: wrap;
  gap: 5px 8px;
  margin-top: 7px;
  color: var(--algo-accent);
  font-family: var(--vp-font-family-mono);
  font-size: 7px;
}

.stack-engine__result {
  display: grid;
  align-content: start;
  gap: 9px;
}

.stack-engine__result > small {
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 7px;
  letter-spacing: 0.06em;
}

.stack-engine__result > div {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.stack-engine__result span,
.stack-engine__result em {
  padding: 4px 6px;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  font-family: var(--vp-font-family-mono);
  font-size: 8px;
  font-style: normal;
}

.stack-engine__operation {
  display: grid;
  gap: 4px;
  margin-top: 7px;
  padding: 9px 11px;
  border: 1px solid var(--vp-c-text-1);
  border-left: 4px solid var(--algo-accent);
  font-family: var(--vp-font-family-mono);
}

.stack-engine__operation small {
  color: var(--vp-c-text-3);
  font-size: 7px;
}

.stack-engine__operation strong {
  overflow-wrap: anywhere;
  font-size: 10px;
}

@media (max-width: 640px) {
  .stack-engine__workspace {
    grid-template-columns: 1fr;
  }

  .stack-engine__items {
    min-height: 92px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .stack-engine__token {
    transition: none;
  }
}
</style>
