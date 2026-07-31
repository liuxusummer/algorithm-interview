<script setup lang="ts">
import { computed } from 'vue'
import AlgorithmPlayer from './AlgorithmPlayer.vue'
import {
  linkedListDemos,
  type LinkedListDemoVariant,
  type LinkedListState,
} from '../data/patternDemos'

const props = defineProps<{
  variant: LinkedListDemoVariant
}>()

const demo = computed(() => linkedListDemos[props.variant])

function stateAt(index: number): LinkedListState {
  return demo.value.steps[index].state
}

function nodeClasses(value: number, state: LinkedListState) {
  return {
    'is-active': state.active?.includes(value),
    'is-settled': state.settled?.includes(value),
    'is-muted': state.muted?.includes(value),
    'is-grouped': state.group?.includes(value),
  }
}

function pointersFor(value: number, state: LinkedListState) {
  return state.pointers.filter((pointer) => pointer.node === value)
}

function nullPointers(state: LinkedListState) {
  return state.pointers.filter((pointer) => pointer.node === null)
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
      <div class="linked-engine">
        <div class="linked-engine__meta">
          <span>POINTER TRACE</span>
          <strong>{{ stateAt(index).operation }}</strong>
        </div>

        <div class="linked-engine__track-wrap">
          <div
            class="linked-engine__track"
            :style="{ '--node-count': stateAt(index).order.length }"
            :aria-label="`当前链表顺序 ${stateAt(index).order.join('，')}`"
          >
            <template
              v-for="(value, nodeIndex) in stateAt(index).order"
              :key="value"
            >
              <div
                class="linked-engine__node-wrap"
                :class="{
                  'has-divider': stateAt(index).dividerAfter === value,
                }"
              >
                <div
                  class="linked-engine__pointers"
                  aria-hidden="true"
                >
                  <span
                    v-for="pointer in pointersFor(value, stateAt(index))"
                    :key="pointer.label"
                    :class="`is-${pointer.tone ?? 'accent'}`"
                  >
                    {{ pointer.label }}
                  </span>
                </div>
                <div
                  class="linked-engine__node"
                  :class="nodeClasses(value, stateAt(index))"
                >
                  <small>NODE</small>
                  <strong>{{ value }}</strong>
                </div>
                <span class="linked-engine__index">
                  {{ nodeIndex }}
                </span>
              </div>
              <span
                v-if="nodeIndex < stateAt(index).order.length - 1"
                class="linked-engine__arrow"
                aria-hidden="true"
              >
                →
              </span>
            </template>
            <span class="linked-engine__null">∅</span>
          </div>
        </div>

        <div class="linked-engine__legend">
          <span><i class="is-group" /> 当前处理组</span>
          <span><i class="is-active" /> 正在改指针</span>
          <span><i class="is-settled" /> 已固定</span>
        </div>

        <div class="linked-engine__pointer-board">
          <span
            v-for="pointer in stateAt(index).pointers"
            :key="pointer.label"
            :class="`is-${pointer.tone ?? 'accent'}`"
          >
            <small>{{ pointer.label }}</small>
            <strong>{{ pointer.node ?? 'dummy / None' }}</strong>
          </span>
        </div>

        <p
          v-if="nullPointers(stateAt(index)).length"
          class="linked-engine__null-note"
        >
          {{ nullPointers(stateAt(index)).map((item) => item.label).join('、') }}
          当前位于哨兵结点或空指针。
        </p>
      </div>
    </template>
  </AlgorithmPlayer>
</template>

<style scoped>
.linked-engine {
  width: min(100%, 520px);
}

.linked-engine__meta {
  display: grid;
  gap: 7px;
  margin-bottom: 44px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--vp-c-divider);
  font-family: var(--vp-font-family-mono);
}

.linked-engine__meta span {
  color: var(--algo-accent);
  font-size: 8px;
  font-weight: 950;
  letter-spacing: 0.12em;
}

.linked-engine__meta strong {
  color: var(--vp-c-text-2);
  font-size: 11px;
}

.linked-engine__track-wrap {
  overflow-x: auto;
  padding: 28px 4px 15px;
}

.linked-engine__track {
  display: flex;
  align-items: center;
  min-width: max-content;
}

.linked-engine__node-wrap {
  position: relative;
  display: grid;
  justify-items: center;
}

.linked-engine__node-wrap.has-divider::after {
  position: absolute;
  top: -22px;
  right: -19px;
  height: 94px;
  border-right: 2px dashed var(--algo-accent);
  content: "";
}

.linked-engine__pointers {
  position: absolute;
  bottom: calc(100% + 8px);
  display: flex;
  gap: 3px;
  white-space: nowrap;
}

.linked-engine__pointers span {
  padding: 3px 5px;
  border: 1px solid currentColor;
  background: var(--vp-c-bg);
  font-family: var(--vp-font-family-mono);
  font-size: 7px;
  font-weight: 950;
  letter-spacing: 0.04em;
}

.linked-engine__pointers span::after {
  display: block;
  width: 1px;
  height: 7px;
  margin: 2px auto -10px;
  background: currentColor;
  content: "";
}

.linked-engine__pointers .is-accent,
.linked-engine__pointer-board .is-accent {
  color: var(--algo-accent);
}

.linked-engine__pointers .is-lime,
.linked-engine__pointer-board .is-lime {
  color: var(--algo-lime);
}

.linked-engine__pointers .is-muted,
.linked-engine__pointer-board .is-muted {
  color: var(--vp-c-text-3);
}

.linked-engine__node {
  display: grid;
  width: 50px;
  height: 54px;
  border: 1px solid var(--vp-c-text-1);
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  transition:
    opacity 220ms ease,
    border-color 220ms ease,
    background-color 220ms ease,
    transform 220ms ease;
  place-items: center;
}

.linked-engine__node small {
  align-self: end;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 6px;
  letter-spacing: 0.08em;
}

.linked-engine__node strong {
  align-self: start;
  font-family: var(--vp-font-family-mono);
  font-size: 19px;
}

.linked-engine__node.is-grouped {
  box-shadow: inset 0 -4px 0 color-mix(in srgb, var(--algo-accent) 45%, transparent);
}

.linked-engine__node.is-active {
  border-color: var(--algo-accent);
  color: var(--algo-accent);
  background: color-mix(in srgb, var(--algo-accent) 12%, var(--vp-c-bg));
  transform: translateY(-3px);
}

.linked-engine__node.is-settled {
  border-color: var(--algo-lime);
  background: color-mix(in srgb, var(--algo-lime) 18%, var(--vp-c-bg));
}

.linked-engine__node.is-muted {
  opacity: 0.45;
}

.linked-engine__arrow {
  width: 27px;
  color: var(--vp-c-text-3);
  text-align: center;
  font-family: var(--vp-font-family-mono);
  font-size: 17px;
}

.linked-engine__null {
  margin-left: 10px;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 20px;
}

.linked-engine__index {
  margin-top: 4px;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 7px;
}

.linked-engine__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  margin: 19px 0;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 8px;
}

.linked-engine__legend span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.linked-engine__legend i {
  width: 10px;
  height: 10px;
  border: 1px solid currentColor;
}

.linked-engine__legend .is-group {
  box-shadow: inset 0 -3px var(--algo-accent);
}

.linked-engine__legend .is-active {
  border-color: var(--algo-accent);
  background: color-mix(in srgb, var(--algo-accent) 15%, transparent);
}

.linked-engine__legend .is-settled {
  border-color: var(--algo-lime);
  background: color-mix(in srgb, var(--algo-lime) 22%, transparent);
}

.linked-engine__pointer-board {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(92px, 1fr));
  gap: 5px;
}

.linked-engine__pointer-board > span {
  display: grid;
  gap: 2px;
  padding: 8px;
  border: 1px solid currentColor;
  background: color-mix(in srgb, currentColor 6%, var(--vp-c-bg));
  font-family: var(--vp-font-family-mono);
}

.linked-engine__pointer-board small {
  font-size: 7px;
  letter-spacing: 0.04em;
}

.linked-engine__pointer-board strong {
  font-size: 11px;
}

.linked-engine__null-note {
  margin: 10px 0 0;
  color: var(--vp-c-text-3);
  font-size: 11px;
}

@media (max-width: 640px) {
  .linked-engine__meta {
    margin-bottom: 34px;
  }

  .linked-engine__track-wrap {
    margin: 0 -4px;
  }

  .linked-engine__node {
    width: 44px;
    height: 49px;
  }

  .linked-engine__arrow {
    width: 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .linked-engine__node {
    transition: none;
  }
}
</style>
