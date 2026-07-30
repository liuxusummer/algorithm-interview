<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'
import {
  PhArrowCounterClockwise,
  PhCaretLeft,
  PhCaretRight,
  PhPause,
  PhPlay,
} from '@phosphor-icons/vue'

interface WalkthroughStep {
  title: string
  description: string
  codeLines?: number[]
}

interface CodeLine {
  no: number
  text: string
}

const props = withDefaults(defineProps<{
  eyebrow: string
  title: string
  steps: WalkthroughStep[]
  codeLines: CodeLine[]
  interval?: number
}>(), {
  interval: 1900,
})

const activeIndex = ref(0)
const isPlaying = ref(false)
const reduceMotion = ref(false)
let timer: ReturnType<typeof setInterval> | undefined
let motionQuery: MediaQueryList | undefined

const activeStep = computed(() => (
  props.steps[activeIndex.value] ?? props.steps[0]
))

const progress = computed(() => {
  if (props.steps.length <= 1) {
    return 100
  }

  return (activeIndex.value / (props.steps.length - 1)) * 100
})

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = undefined
  }
}

function pause() {
  isPlaying.value = false
}

function previous() {
  pause()
  activeIndex.value = Math.max(0, activeIndex.value - 1)
}

function next() {
  pause()
  activeIndex.value = Math.min(props.steps.length - 1, activeIndex.value + 1)
}

function reset() {
  pause()
  activeIndex.value = 0
}

function togglePlayback() {
  if (isPlaying.value) {
    pause()
    return
  }

  if (activeIndex.value >= props.steps.length - 1) {
    activeIndex.value = 0
  }

  isPlaying.value = true
}

function selectStep(index: number) {
  pause()
  activeIndex.value = index
}

function handleMotionPreference(event: MediaQueryListEvent) {
  reduceMotion.value = event.matches
}

watch(isPlaying, (playing) => {
  stopTimer()

  if (!playing) {
    return
  }

  timer = setInterval(() => {
    if (activeIndex.value >= props.steps.length - 1) {
      pause()
      return
    }

    activeIndex.value += 1
  }, props.interval)
})

watch(() => props.steps.length, (length) => {
  if (activeIndex.value >= length) {
    activeIndex.value = Math.max(0, length - 1)
  }
})

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reduceMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionPreference)
})

onBeforeUnmount(() => {
  stopTimer()
  motionQuery?.removeEventListener('change', handleMotionPreference)
})
</script>

<template>
  <section
    class="algorithm-player"
    :class="{ 'algorithm-player--reduce-motion': reduceMotion }"
    tabindex="0"
    :aria-label="`${title}交互演示`"
    @keydown.left.self.prevent="previous"
    @keydown.right.self.prevent="next"
    @keydown.space.self.prevent="togglePlayback"
  >
    <header class="algorithm-player__header">
      <div>
        <p class="algorithm-player__eyebrow">
          {{ eyebrow }}
        </p>
        <h3>{{ title }}</h3>
      </div>
      <div class="algorithm-player__counter" aria-hidden="true">
        <span>STEP</span>
        <strong>{{ String(activeIndex + 1).padStart(2, '0') }}</strong>
        <span>/ {{ String(steps.length).padStart(2, '0') }}</span>
      </div>
    </header>

    <div class="algorithm-player__workspace">
      <div class="algorithm-player__stage">
        <div class="algorithm-player__stage-label">
          <span>LIVE TRACE</span>
          <span>{{ isPlaying ? 'RUNNING' : 'PAUSED' }}</span>
        </div>
        <div class="algorithm-player__canvas">
          <slot
            name="visual"
            :index="activeIndex"
            :step="activeStep"
          />
        </div>
      </div>

      <aside class="algorithm-player__code" aria-label="代码执行位置">
        <div class="algorithm-player__code-header">
          <span>PYTHON</span>
          <span>CURRENT TRACE</span>
        </div>
        <ol>
          <li
            v-for="line in codeLines"
            :key="line.no"
            :class="{
              'is-active': activeStep?.codeLines?.includes(line.no),
            }"
          >
            <span>{{ line.no }}</span>
            <code>{{ line.text || ' ' }}</code>
          </li>
        </ol>
      </aside>
    </div>

    <div class="algorithm-player__narration" aria-live="polite">
      <span class="algorithm-player__narration-index">
        {{ String(activeIndex + 1).padStart(2, '0') }}
      </span>
      <div>
        <strong>{{ activeStep?.title }}</strong>
        <p>{{ activeStep?.description }}</p>
      </div>
    </div>

    <footer class="algorithm-player__footer">
      <div class="algorithm-player__controls">
        <button
          type="button"
          aria-label="回到第一步"
          title="回到第一步"
          @click="reset"
        >
          <PhArrowCounterClockwise :size="18" weight="bold" />
        </button>
        <button
          type="button"
          aria-label="上一步"
          title="上一步"
          :disabled="activeIndex === 0"
          @click="previous"
        >
          <PhCaretLeft :size="18" weight="bold" />
        </button>
        <button
          type="button"
          class="algorithm-player__play"
          :aria-label="isPlaying ? '暂停演示' : '自动播放演示'"
          :title="isPlaying ? '暂停演示' : '自动播放演示'"
          @click="togglePlayback"
        >
          <PhPause v-if="isPlaying" :size="18" weight="fill" />
          <PhPlay v-else :size="18" weight="fill" />
          <span>{{ isPlaying ? '暂停' : '自动演示' }}</span>
        </button>
        <button
          type="button"
          aria-label="下一步"
          title="下一步"
          :disabled="activeIndex === steps.length - 1"
          @click="next"
        >
          <PhCaretRight :size="18" weight="bold" />
        </button>
      </div>

      <div class="algorithm-player__timeline" aria-label="演示进度">
        <span
          class="algorithm-player__timeline-fill"
          :style="{ width: `${progress}%` }"
        />
        <button
          v-for="(_, index) in steps"
          :key="index"
          type="button"
          :class="{ 'is-active': index === activeIndex }"
          :aria-label="`跳到第 ${index + 1} 步`"
          :aria-current="index === activeIndex ? 'step' : undefined"
          @click="selectStep(index)"
        />
      </div>
    </footer>
  </section>
</template>

<style scoped>
.algorithm-player {
  --player-coral: var(--algo-accent);
  --player-lime: var(--algo-lime);
  --player-ink: var(--vp-c-text-1);
  --player-paper: var(--vp-c-bg);
  --player-muted: var(--vp-c-text-2);
  position: relative;
  margin: 24px 0 34px;
  overflow: hidden;
  border: 2px solid var(--player-ink);
  border-radius: 5px;
  color: var(--player-ink);
  background: color-mix(in srgb, var(--vp-c-bg) 96%, transparent);
  box-shadow: 9px 9px 0 color-mix(in srgb, var(--player-ink) 18%, transparent);
  outline: none;
}

.algorithm-player:focus-visible {
  box-shadow:
    0 0 0 3px var(--player-paper),
    0 0 0 6px var(--player-coral),
    9px 9px 0 color-mix(in srgb, var(--player-ink) 18%, transparent);
}

.algorithm-player::before {
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  width: 6px;
  height: 100%;
  background: var(--player-coral);
  content: "";
}

.algorithm-player__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 22px 24px 19px 28px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.algorithm-player__eyebrow {
  margin: 0 0 5px !important;
  color: var(--player-coral);
  font-family: var(--vp-font-family-mono);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.16em;
}

.algorithm-player__header h3 {
  margin: 0;
  font-size: clamp(20px, 3.2vw, 27px);
  line-height: 1.18;
  letter-spacing: -0.045em;
}

.algorithm-player__counter {
  display: flex;
  align-items: baseline;
  gap: 5px;
  color: var(--player-muted);
  font-family: var(--vp-font-family-mono);
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
}

.algorithm-player__counter strong {
  color: var(--player-ink);
  font-size: 24px;
}

.algorithm-player__workspace {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(270px, 0.9fr);
  min-height: 330px;
}

.algorithm-player__stage {
  min-width: 0;
  border-right: 1px solid var(--vp-c-divider);
  background-image:
    linear-gradient(var(--algo-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--algo-grid) 1px, transparent 1px);
  background-size: 22px 22px;
}

.algorithm-player__stage-label,
.algorithm-player__code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 34px;
  padding: 0 14px;
  border-bottom: 1px solid var(--vp-c-divider);
  color: var(--player-muted);
  font-family: var(--vp-font-family-mono);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.algorithm-player__stage-label span:last-child::before {
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-right: 7px;
  border-radius: 50%;
  background: var(--player-lime);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--player-lime) 20%, transparent);
  content: "";
}

.algorithm-player__canvas {
  display: grid;
  min-height: 296px;
  padding: 26px 20px;
  place-items: center;
}

.algorithm-player__code {
  min-width: 0;
  background: color-mix(in srgb, var(--vp-c-bg-alt) 68%, var(--vp-c-bg));
}

.algorithm-player__code ol {
  margin: 0;
  padding: 13px 0;
  list-style: none;
}

.algorithm-player__code li {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr);
  min-height: 29px;
  margin: 0;
  padding: 4px 16px 4px 7px;
  border-left: 3px solid transparent;
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  line-height: 1.55;
  transition:
    color 180ms ease,
    border-color 180ms ease,
    background-color 180ms ease;
}

.algorithm-player__code li > span {
  color: var(--vp-c-text-3);
  text-align: right;
  user-select: none;
}

.algorithm-player__code code {
  overflow-x: auto;
  padding-left: 10px;
  color: var(--vp-c-text-2);
  background: transparent;
  font-size: inherit;
  white-space: pre;
}

.algorithm-player__code li.is-active {
  border-left-color: var(--player-coral);
  background: color-mix(in srgb, var(--player-coral) 11%, transparent);
}

.algorithm-player__code li.is-active > span,
.algorithm-player__code li.is-active code {
  color: var(--player-ink);
  font-weight: 850;
}

.algorithm-player__narration {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 13px;
  min-height: 92px;
  padding: 17px 23px 17px 28px;
  border-top: 1px solid var(--vp-c-divider);
  border-bottom: 1px solid var(--vp-c-divider);
  background: color-mix(in srgb, var(--player-lime) 10%, var(--vp-c-bg));
}

.algorithm-player__narration-index {
  color: var(--player-coral);
  font-family: var(--vp-font-family-mono);
  font-size: 27px;
  font-weight: 900;
  line-height: 1;
}

.algorithm-player__narration strong {
  display: block;
  margin-bottom: 3px;
  font-size: 14px;
}

.algorithm-player__narration p {
  margin: 0;
  color: var(--player-muted);
  font-size: 13px;
  line-height: 1.6;
}

.algorithm-player__footer {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 13px 18px 13px 26px;
  background: var(--vp-c-bg);
}

.algorithm-player__controls {
  display: flex;
  gap: 7px;
}

.algorithm-player__controls button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 9px;
  border: 1px solid var(--player-ink);
  border-radius: 2px;
  color: var(--player-ink);
  background: transparent;
  cursor: pointer;
  transition:
    color 150ms ease,
    background-color 150ms ease,
    transform 150ms ease;
}

.algorithm-player__controls button:hover:not(:disabled) {
  color: var(--vp-c-bg);
  background: var(--player-ink);
  transform: translateY(-1px);
}

.algorithm-player__controls button:focus-visible,
.algorithm-player__timeline button:focus-visible {
  outline: 2px solid var(--player-coral);
  outline-offset: 2px;
}

.algorithm-player__controls button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.algorithm-player__controls .algorithm-player__play {
  gap: 7px;
  min-width: 108px;
  border-color: var(--player-coral);
  color: var(--vp-c-bg);
  background: var(--player-coral);
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  font-weight: 900;
}

.algorithm-player__timeline {
  position: relative;
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  min-width: 100px;
  height: 18px;
}

.algorithm-player__timeline::before,
.algorithm-player__timeline-fill {
  position: absolute;
  top: 8px;
  left: 0;
  height: 2px;
  content: "";
}

.algorithm-player__timeline::before {
  width: 100%;
  background: var(--vp-c-divider);
}

.algorithm-player__timeline-fill {
  z-index: 1;
  background: var(--player-coral);
  transition: width 240ms ease;
}

.algorithm-player__timeline button {
  position: relative;
  z-index: 2;
  width: 10px;
  height: 10px;
  padding: 0;
  border: 2px solid var(--vp-c-text-3);
  border-radius: 50%;
  background: var(--vp-c-bg);
  cursor: pointer;
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    transform 160ms ease;
}

.algorithm-player__timeline button.is-active {
  border-color: var(--player-coral);
  background: var(--player-coral);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--player-coral) 14%, transparent);
  transform: scale(1.18);
}

.algorithm-player--reduce-motion *,
.algorithm-player--reduce-motion *::before,
.algorithm-player--reduce-motion *::after {
  scroll-behavior: auto !important;
  transition-duration: 0.001ms !important;
  animation-duration: 0.001ms !important;
}

@media (max-width: 760px) {
  .algorithm-player {
    margin-right: -4px;
    margin-left: -4px;
    box-shadow: 5px 5px 0 color-mix(in srgb, var(--player-ink) 18%, transparent);
  }

  .algorithm-player__header {
    padding: 18px 16px 16px 21px;
  }

  .algorithm-player__counter {
    display: none;
  }

  .algorithm-player__workspace {
    grid-template-columns: 1fr;
  }

  .algorithm-player__stage {
    border-right: 0;
    border-bottom: 1px solid var(--vp-c-divider);
  }

  .algorithm-player__canvas {
    min-height: 260px;
    padding: 20px 12px;
  }

  .algorithm-player__code li {
    grid-template-columns: 26px minmax(0, 1fr);
    padding-right: 10px;
    font-size: 10px;
  }

  .algorithm-player__narration {
    grid-template-columns: 36px minmax(0, 1fr);
    padding: 15px 15px 15px 20px;
  }

  .algorithm-player__narration-index {
    font-size: 22px;
  }

  .algorithm-player__footer {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    padding: 12px 13px 14px 18px;
  }

  .algorithm-player__controls {
    justify-content: center;
  }

  .algorithm-player__controls button {
    min-width: 44px;
    height: 44px;
  }

  .algorithm-player__controls .algorithm-player__play {
    min-width: 120px;
  }

  .algorithm-player__timeline {
    width: 100%;
  }

  .algorithm-player__timeline button {
    width: 16px;
    height: 16px;
  }
}
</style>
