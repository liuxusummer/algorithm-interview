<script setup lang="ts">
import { computed } from 'vue'
import AlgorithmPlayer from './AlgorithmPlayer.vue'
import {
  pointerArrayDemos,
  type PointerArrayDemoVariant,
  type PointerArrayState,
} from '../data/patternDemos'

const props = defineProps<{
  variant: PointerArrayDemoVariant
}>()

const demo = computed(() => pointerArrayDemos[props.variant])

function stateAt(index: number): PointerArrayState {
  return demo.value.steps[index].state
}

function pointersAt(itemIndex: number, state: PointerArrayState) {
  return state.pointers?.filter((pointer) => pointer.index === itemIndex) ?? []
}

function numberClasses(itemIndex: number, state: PointerArrayState) {
  return {
    'is-active': state.active?.includes(itemIndex),
    'is-muted': state.muted?.includes(itemIndex),
    'has-pointer': pointersAt(itemIndex, state).length > 0,
  }
}

function maxHeight(state: PointerArrayState) {
  return Math.max(...(state.heights ?? [1]))
}

function barHeight(value: number, state: PointerArrayState) {
  return `${Math.max(7, (value / maxHeight(state)) * 100)}%`
}

function waterHeight(itemIndex: number, state: PointerArrayState) {
  const water = state.water?.[itemIndex] ?? 0
  return `${(water / maxHeight(state)) * 100}%`
}

function intervalPosition(
  interval: [number, number],
  state: PointerArrayState,
) {
  const all = [
    ...(state.intervals ?? []),
    ...(state.merged ?? []),
  ]
  const maximum = Math.max(1, ...all.map((item) => item[1]))

  return {
    left: `${(interval[0] / maximum) * 100}%`,
    width: `${((interval[1] - interval[0]) / maximum) * 100}%`,
  }
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
      <div class="pointer-engine">
        <div class="pointer-engine__status">
          <span>{{ demo.kind.toUpperCase() }} TRACE</span>
          <strong>{{ stateAt(index).result }}</strong>
        </div>

        <div
          v-if="demo.kind === 'numbers'"
          class="pointer-engine__numbers-scroll"
        >
          <div
            class="pointer-engine__numbers"
            :style="{ '--value-count': stateAt(index).values?.length ?? 1 }"
          >
            <div
              v-for="(value, itemIndex) in stateAt(index).values"
              :key="`${value}-${itemIndex}`"
              class="pointer-engine__number"
              :class="numberClasses(itemIndex, stateAt(index))"
            >
              <div class="pointer-engine__markers">
                <span
                  v-for="pointer in pointersAt(itemIndex, stateAt(index))"
                  :key="pointer.label"
                  :class="`is-${pointer.tone ?? 'accent'}`"
                >
                  {{ pointer.label }}
                </span>
              </div>
              <strong>{{ value }}</strong>
              <small>{{ itemIndex }}</small>
            </div>
          </div>
        </div>

        <div
          v-else-if="demo.kind === 'bars'"
          class="pointer-engine__bars"
          :style="{ '--bar-count': stateAt(index).heights?.length ?? 1 }"
          aria-label="接雨水柱状图"
        >
          <div
            v-for="(height, itemIndex) in stateAt(index).heights"
            :key="itemIndex"
            class="pointer-engine__bar-column"
            :class="{ 'is-active': stateAt(index).active?.includes(itemIndex) }"
          >
            <div class="pointer-engine__bar-space">
              <span
                class="pointer-engine__water"
                :style="{
                  height: waterHeight(itemIndex, stateAt(index)),
                  bottom: barHeight(height, stateAt(index)),
                }"
              />
              <span
                class="pointer-engine__bar"
                :style="{ height: barHeight(height, stateAt(index)) }"
              >
                <small>{{ height }}</small>
              </span>
              <div class="pointer-engine__bar-pointers">
                <span
                  v-for="pointer in pointersAt(itemIndex, stateAt(index))"
                  :key="pointer.label"
                  :class="`is-${pointer.tone ?? 'accent'}`"
                >
                  {{ pointer.label }}
                </span>
              </div>
            </div>
            <small>{{ itemIndex }}</small>
          </div>
        </div>

        <div
          v-else
          class="pointer-engine__interval-workspace"
        >
          <div class="pointer-engine__interval-list">
            <div
              v-for="(interval, intervalIndex) in stateAt(index).intervals"
              :key="interval.join('-')"
              :class="{
                'is-active': stateAt(index).active?.includes(intervalIndex),
                'is-past': intervalIndex < (stateAt(index).active?.[0] ?? 0),
              }"
            >
              <small>#{{ intervalIndex }}</small>
              <span>
                <i :style="intervalPosition(interval, stateAt(index))" />
              </span>
              <strong>[{{ interval.join(',') }}]</strong>
            </div>
          </div>

          <div class="pointer-engine__merged">
            <small>MERGED</small>
            <div>
              <span
                v-for="interval in stateAt(index).merged"
                :key="interval.join('-')"
              >
                [{{ interval.join(',') }}]
              </span>
              <em v-if="!stateAt(index).merged?.length">EMPTY</em>
            </div>
          </div>
        </div>

        <div class="pointer-engine__decision">
          <div>
            <small>COMPARE</small>
            <strong>{{ stateAt(index).comparison }}</strong>
          </div>
          <span aria-hidden="true">→</span>
          <div>
            <small>MOVE / MERGE</small>
            <strong>{{ stateAt(index).operation }}</strong>
          </div>
        </div>
      </div>
    </template>
  </AlgorithmPlayer>
</template>

<style scoped>
.pointer-engine {
  width: min(100%, 520px);
}

.pointer-engine__status {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 38px;
  padding-bottom: 9px;
  border-bottom: 1px solid var(--vp-c-divider);
  font-family: var(--vp-font-family-mono);
}

.pointer-engine__status span {
  color: var(--algo-accent);
  font-size: 8px;
  font-weight: 950;
  letter-spacing: 0.12em;
}

.pointer-engine__status strong {
  max-width: 70%;
  color: var(--algo-lime);
  font-size: 10px;
  text-align: right;
}

.pointer-engine__numbers-scroll {
  overflow-x: auto;
  padding: 21px 2px 10px;
}

.pointer-engine__numbers {
  display: grid;
  grid-template-columns: repeat(var(--value-count), minmax(52px, 1fr));
  gap: 4px;
  min-width: calc(var(--value-count) * 52px);
}

.pointer-engine__number {
  position: relative;
  display: grid;
  min-height: 62px;
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

.pointer-engine__number strong {
  font-family: var(--vp-font-family-mono);
  font-size: 17px;
}

.pointer-engine__number > small {
  position: absolute;
  right: 4px;
  bottom: 3px;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 6px;
}

.pointer-engine__number.is-active {
  border-color: var(--algo-accent);
  color: var(--algo-accent);
  background: color-mix(in srgb, var(--algo-accent) 12%, var(--vp-c-bg));
  transform: translateY(-3px);
}

.pointer-engine__number.has-pointer:not(.is-active) {
  border-color: var(--algo-lime);
}

.pointer-engine__number.is-muted {
  opacity: 0.3;
}

.pointer-engine__markers {
  position: absolute;
  bottom: calc(100% + 5px);
  display: flex;
  gap: 3px;
}

.pointer-engine__markers span,
.pointer-engine__bar-pointers span {
  display: grid;
  min-width: 20px;
  height: 18px;
  padding: 0 4px;
  border: 1px solid currentColor;
  background: var(--vp-c-bg);
  font-family: var(--vp-font-family-mono);
  font-size: 7px;
  font-weight: 950;
  place-items: center;
}

.pointer-engine__markers .is-accent,
.pointer-engine__bar-pointers .is-accent {
  color: var(--algo-accent);
}

.pointer-engine__markers .is-lime,
.pointer-engine__bar-pointers .is-lime {
  color: var(--algo-lime);
}

.pointer-engine__markers .is-muted,
.pointer-engine__bar-pointers .is-muted {
  color: var(--vp-c-text-3);
}

.pointer-engine__bars {
  display: grid;
  grid-template-columns: repeat(var(--bar-count), minmax(14px, 1fr));
  gap: 3px;
  height: 190px;
  padding: 8px 4px 0;
  border-bottom: 2px solid var(--vp-c-text-2);
}

.pointer-engine__bar-column {
  display: grid;
  grid-template-rows: 1fr 13px;
  gap: 4px;
  min-width: 0;
}

.pointer-engine__bar-column > small {
  color: var(--vp-c-text-3);
  text-align: center;
  font-family: var(--vp-font-family-mono);
  font-size: 6px;
}

.pointer-engine__bar-space {
  position: relative;
  display: flex;
  align-items: flex-end;
  min-height: 0;
}

.pointer-engine__bar {
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: 3px;
  border: 1px solid var(--vp-c-text-1);
  background: color-mix(in srgb, var(--vp-c-text-1) 24%, var(--vp-c-bg));
  transition: height 240ms ease;
}

.pointer-engine__bar small {
  position: absolute;
  bottom: 2px;
  width: 100%;
  color: var(--vp-c-text-1);
  text-align: center;
  font-family: var(--vp-font-family-mono);
  font-size: 6px;
}

.pointer-engine__water {
  position: absolute;
  right: 0;
  left: 0;
  min-height: 0;
  border-top: 1px dashed var(--algo-lime);
  background:
    repeating-linear-gradient(
      -45deg,
      color-mix(in srgb, var(--algo-lime) 28%, transparent),
      color-mix(in srgb, var(--algo-lime) 28%, transparent) 3px,
      color-mix(in srgb, var(--algo-lime) 10%, transparent) 3px,
      color-mix(in srgb, var(--algo-lime) 10%, transparent) 6px
    );
  transition:
    height 240ms ease,
    bottom 240ms ease;
}

.pointer-engine__bar-column.is-active .pointer-engine__bar {
  border-color: var(--algo-accent);
  background: color-mix(in srgb, var(--algo-accent) 38%, var(--vp-c-bg));
}

.pointer-engine__bar-pointers {
  position: absolute;
  bottom: calc(100% + 5px);
  left: 50%;
  z-index: 2;
  display: flex;
  transform: translateX(-50%);
}

.pointer-engine__interval-workspace {
  display: grid;
  gap: 12px;
}

.pointer-engine__interval-list {
  display: grid;
  gap: 4px;
}

.pointer-engine__interval-list > div {
  display: grid;
  grid-template-columns: 24px 1fr 58px;
  align-items: center;
  gap: 7px;
  min-height: 31px;
  opacity: 0.68;
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.pointer-engine__interval-list > div.is-active {
  opacity: 1;
  transform: translateX(4px);
}

.pointer-engine__interval-list > div.is-past {
  opacity: 0.35;
}

.pointer-engine__interval-list small,
.pointer-engine__interval-list strong {
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 7px;
}

.pointer-engine__interval-list strong {
  color: var(--vp-c-text-2);
  font-size: 9px;
}

.pointer-engine__interval-list span {
  position: relative;
  height: 12px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.pointer-engine__interval-list i {
  position: absolute;
  bottom: -1px;
  min-width: 3px;
  height: 10px;
  border: 1px solid var(--vp-c-text-2);
  background: color-mix(in srgb, var(--vp-c-text-1) 16%, var(--vp-c-bg));
}

.pointer-engine__interval-list .is-active i {
  border-color: var(--algo-accent);
  background: color-mix(in srgb, var(--algo-accent) 25%, var(--vp-c-bg));
}

.pointer-engine__merged {
  display: grid;
  gap: 6px;
  padding: 10px;
  border: 1px solid var(--algo-lime);
  background: color-mix(in srgb, var(--algo-lime) 8%, var(--vp-c-bg));
}

.pointer-engine__merged > small {
  color: var(--algo-lime);
  font-family: var(--vp-font-family-mono);
  font-size: 7px;
  letter-spacing: 0.08em;
}

.pointer-engine__merged > div {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.pointer-engine__merged span,
.pointer-engine__merged em {
  padding: 4px 7px;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  font-family: var(--vp-font-family-mono);
  font-size: 9px;
  font-style: normal;
}

.pointer-engine__decision {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 18px minmax(0, 1fr);
  align-items: stretch;
  gap: 5px;
  margin-top: 19px;
}

.pointer-engine__decision > div {
  display: grid;
  gap: 4px;
  padding: 9px;
  border: 1px solid var(--vp-c-divider);
  font-family: var(--vp-font-family-mono);
}

.pointer-engine__decision > span {
  align-self: center;
  color: var(--algo-accent);
  text-align: center;
}

.pointer-engine__decision small {
  color: var(--vp-c-text-3);
  font-size: 7px;
}

.pointer-engine__decision strong {
  overflow-wrap: anywhere;
  font-size: 9px;
}

@media (max-width: 640px) {
  .pointer-engine__status {
    margin-bottom: 31px;
  }

  .pointer-engine__bars {
    height: 155px;
  }

  .pointer-engine__decision {
    grid-template-columns: 1fr;
  }

  .pointer-engine__decision > span {
    transform: rotate(90deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .pointer-engine__number,
  .pointer-engine__bar,
  .pointer-engine__water,
  .pointer-engine__interval-list > div {
    transition: none;
  }
}
</style>
