<script setup lang="ts">
import { computed } from 'vue'
import AlgorithmPlayer from './AlgorithmPlayer.vue'
import {
  binarySearchDemos,
  type BinaryDemoConfig,
  type BinaryRangeDemo,
  type BinarySearchDemoVariant,
  type BinaryStep,
} from '../data/binarySearchDemos'

const props = defineProps<{
  variant: BinarySearchDemoVariant
}>()

const demo = computed<BinaryDemoConfig>(() => binarySearchDemos[props.variant])

function stateAt(index: number) {
  return demo.value.steps[index]
}

function isInRange(
  itemIndex: number,
  state: BinaryStep,
  config: BinaryRangeDemo,
) {
  if (state.left === undefined || state.right === undefined) {
    return true
  }

  if (config.intervalType === 'half-open') {
    return itemIndex >= state.left && itemIndex < state.right
  }

  return itemIndex >= state.left && itemIndex <= state.right
}

function isPredicateTrue(value: number | string, config: BinaryRangeDemo) {
  if (
    config.truthBoundary === undefined
    || config.truthDirection === undefined
    || typeof value !== 'number'
  ) {
    return false
  }

  return config.truthDirection === 'at-most'
    ? value <= config.truthBoundary
    : value >= config.truthBoundary
}

function hasPredicate(config: BinaryRangeDemo) {
  return config.truthBoundary !== undefined
}

function cellClasses(
  itemIndex: number,
  value: number | string,
  state: BinaryStep,
  config: BinaryRangeDemo,
) {
  const inRange = isInRange(itemIndex, state, config)
  const isFound = state.found?.includes(itemIndex) ?? false

  return {
    'is-active': inRange,
    'is-discarded': !inRange && !isFound,
    'is-middle': state.middle === itemIndex,
    'is-found': isFound,
    'is-predicate-true': hasPredicate(config) && isPredicateTrue(value, config),
    'is-predicate-false': hasPredicate(config) && !isPredicateTrue(value, config),
  }
}

function displayPosition(
  itemIndex: number | undefined,
  config: BinaryRangeDemo,
) {
  if (itemIndex === undefined) {
    return '—'
  }

  if (itemIndex === config.values.length) {
    return 'END'
  }

  if (itemIndex < 0 || itemIndex >= config.values.length) {
    return String(itemIndex)
  }

  return config.metricMode === 'value'
    ? String(config.values[itemIndex])
    : String(itemIndex)
}

function cutPosition(partition: number | undefined, length: number) {
  if (partition === undefined || length === 0) {
    return '0%'
  }

  return `${(partition / length) * 100}%`
}
</script>

<template>
  <AlgorithmPlayer
    :eyebrow="demo.eyebrow"
    :title="demo.title"
    :steps="demo.steps"
    :code-lines="demo.codeLines"
    :interval="demo.interval"
  >
    <template #visual="{ index }">
      <div
        v-if="demo.kind === 'range'"
        class="binary-demo"
      >
        <div class="binary-demo__status">
          <span>{{ stateAt(index).pass }}</span>
          <strong>{{ demo.target }}</strong>
        </div>

        <div class="binary-demo__metrics">
          <span>
            <small>L</small>
            {{ displayPosition(stateAt(index).left, demo) }}
          </span>
          <span class="is-middle">
            <small>M</small>
            {{ displayPosition(stateAt(index).middle, demo) }}
          </span>
          <span>
            <small>R</small>
            {{ displayPosition(stateAt(index).right, demo) }}
          </span>
          <span
            v-if="stateAt(index).hours !== undefined"
            :class="stateAt(index).feasible ? 'is-feasible' : 'is-infeasible'"
          >
            <small>HOURS</small>
            {{ stateAt(index).hours }}
          </span>
        </div>

        <div class="binary-demo__rail-wrap">
          <div
            class="binary-demo__rail"
            :style="{ '--cell-count': demo.values.length }"
            :aria-label="`${demo.target} 的二分候选区间`"
          >
            <div
              v-for="(value, itemIndex) in demo.values"
              :key="`${value}-${itemIndex}`"
              class="binary-demo__cell"
              :class="cellClasses(itemIndex, value, stateAt(index), demo)"
            >
              <span
                v-if="stateAt(index).left === itemIndex"
                class="binary-demo__marker binary-demo__marker--left"
              >
                L
              </span>
              <span
                v-if="stateAt(index).middle === itemIndex"
                class="binary-demo__mid-label"
              >
                M
              </span>
              <strong>{{ value }}</strong>
              <small>{{ itemIndex }}</small>
              <span
                v-if="stateAt(index).right === itemIndex"
                class="binary-demo__marker binary-demo__marker--right"
              >
                R
              </span>
            </div>
          </div>

          <span
            v-if="demo.intervalType === 'half-open' && stateAt(index).right === demo.values.length"
            class="binary-demo__end-marker"
          >
            R · END
          </span>
        </div>

        <div
          v-if="hasPredicate(demo)"
          class="binary-demo__predicate"
        >
          <span><i class="is-true" /> True / 可行</span>
          <span><i class="is-false" /> False / 不可行</span>
          <strong>寻找真假分界点</strong>
        </div>

        <div class="binary-demo__decision">
          <div>
            <small>COMPARE</small>
            <strong>{{ stateAt(index).comparison || '—' }}</strong>
          </div>
          <span aria-hidden="true">→</span>
          <div>
            <small>DECISION</small>
            <strong>{{ stateAt(index).decision || stateAt(index).result || '建立搜索区间' }}</strong>
          </div>
        </div>

        <div
          v-if="stateAt(index).result"
          class="binary-demo__result"
        >
          {{ stateAt(index).result }}
        </div>
      </div>

      <div
        v-else
        class="binary-partition"
      >
        <div class="binary-demo__status">
          <span>{{ stateAt(index).pass }}</span>
          <strong>{{ demo.target }}</strong>
        </div>

        <div class="binary-partition__cuts">
          <span><small>i</small>{{ stateAt(index).partitionA }}</span>
          <span><small>j</small>{{ stateAt(index).partitionB }}</span>
          <strong>LEFT SIZE = 2</strong>
        </div>

        <div class="binary-partition__arrays">
          <div class="binary-partition__row">
            <span class="binary-partition__name">
              A
              <small>SHORT</small>
            </span>
            <div
              class="binary-partition__track"
              :style="{ '--partition-count': demo.valuesA.length }"
            >
              <span
                v-for="(value, itemIndex) in demo.valuesA"
                :key="value"
                :class="{ 'is-left': itemIndex < (stateAt(index).partitionA ?? 0) }"
              >
                {{ value }}
              </span>
              <i
                class="binary-partition__cut"
                :style="{ left: cutPosition(stateAt(index).partitionA, demo.valuesA.length) }"
              >
                i
              </i>
            </div>
          </div>

          <div class="binary-partition__row">
            <span class="binary-partition__name">
              B
              <small>LONG</small>
            </span>
            <div
              class="binary-partition__track"
              :style="{ '--partition-count': demo.valuesB.length }"
            >
              <span
                v-for="(value, itemIndex) in demo.valuesB"
                :key="value"
                :class="{ 'is-left': itemIndex < (stateAt(index).partitionB ?? 0) }"
              >
                {{ value }}
              </span>
              <i
                class="binary-partition__cut"
                :style="{ left: cutPosition(stateAt(index).partitionB, demo.valuesB.length) }"
              >
                j
              </i>
            </div>
          </div>
        </div>

        <div
          v-if="stateAt(index).boundaries"
          class="binary-partition__boundaries"
        >
          <span>
            <small>A_LEFT</small>
            {{ stateAt(index).boundaries?.aLeft }}
          </span>
          <span>
            <small>A_RIGHT</small>
            {{ stateAt(index).boundaries?.aRight }}
          </span>
          <span>
            <small>B_LEFT</small>
            {{ stateAt(index).boundaries?.bLeft }}
          </span>
          <span>
            <small>B_RIGHT</small>
            {{ stateAt(index).boundaries?.bRight }}
          </span>
        </div>

        <div class="binary-demo__decision">
          <div>
            <small>CROSS CHECK</small>
            <strong>{{ stateAt(index).comparison || '固定左半元素总数' }}</strong>
          </div>
          <span aria-hidden="true">→</span>
          <div>
            <small>DECISION</small>
            <strong>{{ stateAt(index).decision || stateAt(index).result }}</strong>
          </div>
        </div>

        <div
          v-if="stateAt(index).result"
          class="binary-demo__result"
        >
          {{ stateAt(index).result }}
        </div>
      </div>
    </template>
  </AlgorithmPlayer>
</template>

<style scoped>
.binary-demo,
.binary-partition {
  width: min(100%, 490px);
}

.binary-demo__status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 25px;
  padding-bottom: 9px;
  border-bottom: 1px solid var(--vp-c-divider);
  font-family: var(--vp-font-family-mono);
}

.binary-demo__status span {
  color: var(--algo-accent);
  font-size: 8px;
  font-weight: 950;
  letter-spacing: 0.1em;
}

.binary-demo__status strong {
  color: var(--vp-c-text-2);
  font-size: 10px;
}

.binary-demo__metrics,
.binary-partition__cuts {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-bottom: 36px;
  font-family: var(--vp-font-family-mono);
}

.binary-demo__metrics > span,
.binary-partition__cuts > span {
  display: flex;
  align-items: baseline;
  gap: 7px;
  min-width: 66px;
  padding: 6px 9px;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  font-size: 14px;
  font-weight: 950;
}

.binary-demo__metrics small,
.binary-partition__cuts small {
  color: var(--vp-c-text-3);
  font-size: 8px;
  letter-spacing: 0.08em;
}

.binary-demo__metrics .is-middle {
  border-color: var(--algo-accent);
  color: var(--algo-accent);
}

.binary-demo__metrics .is-feasible {
  border-color: var(--algo-lime);
}

.binary-demo__metrics .is-infeasible {
  border-color: var(--algo-accent);
}

.binary-demo__rail-wrap {
  position: relative;
  margin-bottom: 35px;
}

.binary-demo__rail {
  display: grid;
  grid-template-columns: repeat(var(--cell-count), minmax(0, 1fr));
  gap: 4px;
}

.binary-demo__cell {
  position: relative;
  display: grid;
  min-width: 0;
  aspect-ratio: 1;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  background: color-mix(in srgb, var(--vp-c-bg) 86%, transparent);
  place-items: center;
  transition:
    opacity 210ms ease,
    transform 210ms ease,
    color 210ms ease,
    border-color 210ms ease,
    background-color 210ms ease;
}

.binary-demo__cell strong {
  overflow: hidden;
  max-width: 100%;
  font-family: var(--vp-font-family-mono);
  font-size: clamp(10px, 3.5vw, 18px);
  text-overflow: ellipsis;
}

.binary-demo__cell > small {
  position: absolute;
  right: 3px;
  bottom: 1px;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 6px;
}

.binary-demo__cell.is-active {
  border-color: var(--vp-c-text-1);
  color: var(--vp-c-text-1);
  background: color-mix(in srgb, var(--algo-lime) 18%, var(--vp-c-bg));
}

.binary-demo__cell.is-discarded {
  opacity: 0.28;
  background:
    repeating-linear-gradient(
      -45deg,
      transparent 0,
      transparent 5px,
      var(--vp-c-divider) 5px,
      var(--vp-c-divider) 6px
    );
  transform: scale(0.94);
}

.binary-demo__cell.is-middle {
  z-index: 2;
  border-width: 2px;
  border-color: var(--algo-accent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--algo-accent) 13%, transparent);
  transform: translateY(-4px);
}

.binary-demo__cell.is-found {
  border-color: var(--algo-accent);
  color: var(--vp-c-bg);
  background: var(--algo-accent);
  box-shadow: 5px 5px 0 color-mix(in srgb, var(--algo-lime) 72%, transparent);
  opacity: 1;
  transform: translateY(-4px);
}

.binary-demo__cell.is-predicate-true:not(.is-middle, .is-found) {
  background: color-mix(in srgb, var(--algo-lime) 36%, var(--vp-c-bg));
}

.binary-demo__cell.is-predicate-false:not(.is-middle, .is-found) {
  background: color-mix(in srgb, var(--algo-accent) 9%, var(--vp-c-bg));
}

.binary-demo__marker {
  position: absolute;
  left: 50%;
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 8px;
  font-weight: 950;
  transform: translateX(-50%);
}

.binary-demo__marker::after {
  display: block;
  width: 1px;
  height: 7px;
  margin: 2px auto 0;
  background: currentColor;
  content: "";
}

.binary-demo__marker--left {
  bottom: calc(100% + 5px);
}

.binary-demo__marker--right {
  top: calc(100% + 5px);
}

.binary-demo__marker--right::after {
  position: absolute;
  bottom: calc(100% + 2px);
  left: 50%;
  margin: 0;
}

.binary-demo__mid-label {
  position: absolute;
  top: 3px;
  left: 4px;
  color: var(--algo-accent);
  font-family: var(--vp-font-family-mono);
  font-size: 7px;
  font-weight: 950;
}

.binary-demo__end-marker {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
  font-size: 7px;
  font-weight: 900;
}

.binary-demo__predicate {
  display: flex;
  align-items: center;
  gap: 11px;
  margin: -4px 0 13px;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 7px;
  font-weight: 850;
}

.binary-demo__predicate span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.binary-demo__predicate i {
  width: 9px;
  height: 9px;
  border: 1px solid var(--vp-c-divider);
}

.binary-demo__predicate i.is-true {
  background: color-mix(in srgb, var(--algo-lime) 55%, var(--vp-c-bg));
}

.binary-demo__predicate i.is-false {
  background: color-mix(in srgb, var(--algo-accent) 16%, var(--vp-c-bg));
}

.binary-demo__predicate strong {
  margin-left: auto;
  color: var(--vp-c-text-2);
  font-size: 8px;
}

.binary-demo__decision {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1.25fr);
  align-items: stretch;
  gap: 8px;
}

.binary-demo__decision > div {
  min-width: 0;
  padding: 8px 9px;
  border: 1px solid var(--vp-c-divider);
  background: color-mix(in srgb, var(--vp-c-bg) 84%, transparent);
}

.binary-demo__decision small {
  display: block;
  margin-bottom: 4px;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 7px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.binary-demo__decision strong {
  display: block;
  color: var(--vp-c-text-1);
  font-size: 10px;
  line-height: 1.45;
}

.binary-demo__decision > span {
  align-self: center;
  color: var(--algo-accent);
  font-family: var(--vp-font-family-mono);
  font-size: 18px;
}

.binary-demo__result {
  margin-top: 10px;
  padding: 7px 10px;
  border-left: 3px solid var(--algo-lime);
  color: var(--vp-c-text-1);
  background: color-mix(in srgb, var(--algo-lime) 16%, transparent);
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  font-weight: 950;
}

.binary-partition__cuts {
  align-items: center;
  margin-bottom: 22px;
}

.binary-partition__cuts > strong {
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 8px;
  letter-spacing: 0.08em;
}

.binary-partition__arrays {
  display: grid;
  gap: 24px;
  margin: 5px 0 28px;
}

.binary-partition__row {
  display: flex;
  align-items: center;
  gap: 18px;
}

.binary-partition__name {
  display: grid;
  width: 43px;
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 16px;
  font-weight: 950;
}

.binary-partition__name small {
  color: var(--vp-c-text-3);
  font-size: 6px;
  letter-spacing: 0.08em;
}

.binary-partition__track {
  --partition-count: 1;
  position: relative;
  display: grid;
  grid-template-columns: repeat(var(--partition-count), 58px);
  gap: 4px;
  width: fit-content;
}

.binary-partition__track > span {
  display: grid;
  width: 58px;
  height: 50px;
  border: 1px solid var(--vp-c-text-1);
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  font-family: var(--vp-font-family-mono);
  font-size: 17px;
  font-weight: 950;
  place-items: center;
  transition: background-color 220ms ease;
}

.binary-partition__track > span.is-left {
  background: color-mix(in srgb, var(--algo-lime) 43%, var(--vp-c-bg));
}

.binary-partition__cut {
  position: absolute;
  z-index: 2;
  top: -9px;
  width: 2px;
  height: 68px;
  color: var(--algo-accent);
  background: var(--algo-accent);
  font-family: var(--vp-font-family-mono);
  font-size: 8px;
  font-style: normal;
  font-weight: 950;
  line-height: 1;
  text-indent: 5px;
  transition: left 260ms ease;
}

.binary-partition__boundaries {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
  margin-bottom: 14px;
}

.binary-partition__boundaries > span {
  display: grid;
  padding: 6px 7px;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  background: color-mix(in srgb, var(--vp-c-bg) 86%, transparent);
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  font-weight: 900;
  text-align: center;
}

.binary-partition__boundaries small {
  color: var(--vp-c-text-3);
  font-size: 6px;
  letter-spacing: 0.06em;
}

@media (max-width: 520px) {
  .binary-demo__status {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }

  .binary-demo__metrics,
  .binary-partition__cuts {
    gap: 4px;
  }

  .binary-demo__metrics > span,
  .binary-partition__cuts > span {
    min-width: 0;
    padding: 5px 6px;
    font-size: 12px;
  }

  .binary-demo__rail {
    gap: 2px;
  }

  .binary-demo__cell strong {
    font-size: clamp(9px, 3.6vw, 14px);
  }

  .binary-demo__predicate {
    flex-wrap: wrap;
  }

  .binary-demo__predicate strong {
    width: 100%;
    margin-left: 0;
  }

  .binary-demo__decision {
    grid-template-columns: 1fr;
  }

  .binary-demo__decision > span {
    display: none;
  }

  .binary-partition__row {
    gap: 10px;
  }

  .binary-partition__track {
    grid-template-columns: repeat(var(--partition-count), 50px);
  }

  .binary-partition__track > span {
    width: 50px;
    height: 46px;
  }

  .binary-partition__boundaries {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
