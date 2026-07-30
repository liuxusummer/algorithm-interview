<script setup lang="ts">
import AlgorithmPlayer from './AlgorithmPlayer.vue'

interface WindowState {
  left: number
  right: number
  active: number[]
  values: string[]
  answer: number
  phase: 'idle' | 'grow' | 'conflict' | 'shrink' | 'done'
  windowLabel: string
}

const characters = [...'abcabcbb']

const codeLines = [
  { no: 1, text: 'window = set()' },
  { no: 2, text: 'left = 0' },
  { no: 3, text: 'ans = 0' },
  { no: 4, text: 'for right in range(len(s)):' },
  { no: 5, text: '    while s[right] in window:' },
  { no: 6, text: '        window.remove(s[left])' },
  { no: 7, text: '        left += 1' },
  { no: 8, text: '    window.add(s[right])' },
  { no: 9, text: '    ans = max(ans, right - left + 1)' },
]

const steps = [
  {
    title: '窗口从空集出发',
    description: 'left 指向 0，right 还没有进入字符串。集合负责维护“窗口内没有重复字符”这一条不变量。',
    codeLines: [1, 2, 3],
  },
  {
    title: '纳入字符 a',
    description: 'a 不在集合中，可以直接加入。合法窗口变成 [0, 0]，当前答案更新为 1。',
    codeLines: [4, 5, 8, 9],
  },
  {
    title: '继续向右扩张',
    description: 'b 与窗口中的字符不同，右边界继续前进；窗口扩大为 ab，答案更新为 2。',
    codeLines: [4, 5, 8, 9],
  },
  {
    title: '得到长度为 3 的窗口',
    description: 'c 仍未重复。此时窗口 abc 合法，ans 更新为 3，也是本题最终的最大长度。',
    codeLines: [4, 5, 8, 9],
  },
  {
    title: '右侧命中重复字符',
    description: 'right 来到第二个 a。因为 a 已在集合中，不能立即加入，必须进入 while 收缩窗口。',
    codeLines: [4, 5],
  },
  {
    title: '从左侧移走旧 a',
    description: '先删除 s[left]，再把 left 右移到 1。旧 a 离开后，窗口重新满足无重复约束。',
    codeLines: [5, 6, 7],
  },
  {
    title: '把新 a 放入窗口',
    description: '新 a 现在可以安全加入，窗口变成 bca。长度仍为 3，因此 ans 不变。',
    codeLines: [8, 9],
  },
  {
    title: '同一规则扫描到底',
    description: '左右指针都只向右移动。后续重复字符仍按同样方式处理，最终答案保持为 3。',
    codeLines: [4, 5, 6, 7, 8, 9],
  },
]

const states: WindowState[] = [
  {
    left: 0,
    right: -1,
    active: [],
    values: [],
    answer: 0,
    phase: 'idle',
    windowLabel: '∅',
  },
  {
    left: 0,
    right: 0,
    active: [0],
    values: ['a'],
    answer: 1,
    phase: 'grow',
    windowLabel: 'a',
  },
  {
    left: 0,
    right: 1,
    active: [0, 1],
    values: ['a', 'b'],
    answer: 2,
    phase: 'grow',
    windowLabel: 'ab',
  },
  {
    left: 0,
    right: 2,
    active: [0, 1, 2],
    values: ['a', 'b', 'c'],
    answer: 3,
    phase: 'grow',
    windowLabel: 'abc',
  },
  {
    left: 0,
    right: 3,
    active: [0, 1, 2],
    values: ['a', 'b', 'c'],
    answer: 3,
    phase: 'conflict',
    windowLabel: 'abc + a?',
  },
  {
    left: 1,
    right: 3,
    active: [1, 2],
    values: ['b', 'c'],
    answer: 3,
    phase: 'shrink',
    windowLabel: 'bc',
  },
  {
    left: 1,
    right: 3,
    active: [1, 2, 3],
    values: ['b', 'c', 'a'],
    answer: 3,
    phase: 'grow',
    windowLabel: 'bca',
  },
  {
    left: 7,
    right: 7,
    active: [7],
    values: ['b'],
    answer: 3,
    phase: 'done',
    windowLabel: 'b',
  },
]

function cellClasses(index: number, state: WindowState) {
  return {
    'is-window': state.active.includes(index),
    'is-cursor': state.right === index,
    'is-conflict': state.phase === 'conflict' && state.right === index,
    'is-scanned': index <= state.right,
    'is-future': index > state.right,
  }
}
</script>

<template>
  <AlgorithmPlayer
    eyebrow="SLIDING WINDOW · s = &quot;abcabcbb&quot;"
    title="窗口为什么只向右走"
    :steps="steps"
    :code-lines="codeLines"
  >
    <template #visual="{ index }">
      <div class="sliding-demo">
        <div class="sliding-demo__metrics">
          <span><small>LEFT</small>{{ states[index].left }}</span>
          <span><small>RIGHT</small>{{ states[index].right < 0 ? '—' : states[index].right }}</span>
          <span class="is-answer"><small>ANS</small>{{ states[index].answer }}</span>
        </div>

        <div class="sliding-demo__rail" aria-label="字符串滑动窗口">
          <div
            v-for="(character, characterIndex) in characters"
            :key="characterIndex"
            class="sliding-demo__cell"
            :class="cellClasses(characterIndex, states[index])"
          >
            <span
              v-if="characterIndex === states[index].left"
              class="sliding-demo__marker sliding-demo__marker--left"
            >
              L
            </span>
            <strong>{{ character }}</strong>
            <small>{{ characterIndex }}</small>
            <span
              v-if="characterIndex === states[index].right"
              class="sliding-demo__marker sliding-demo__marker--right"
            >
              R
            </span>
          </div>
        </div>

        <div class="sliding-demo__set">
          <span class="sliding-demo__set-label">WINDOW SET</span>
          <div class="sliding-demo__set-values">
            <span
              v-for="value in states[index].values"
              :key="value"
            >
              {{ value }}
            </span>
            <em v-if="states[index].values.length === 0">empty</em>
          </div>
          <strong>{{ states[index].windowLabel }}</strong>
        </div>

        <div
          v-if="states[index].phase === 'conflict'"
          class="sliding-demo__alert"
        >
          重复命中：a 已在 window 中
        </div>
        <div
          v-else-if="states[index].phase === 'done'"
          class="sliding-demo__answer"
        >
          最长合法窗口：<strong>abc</strong> · 长度 <strong>3</strong>
        </div>
      </div>
    </template>
  </AlgorithmPlayer>
</template>

<style scoped>
.sliding-demo {
  width: min(100%, 430px);
}

.sliding-demo__metrics {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 35px;
}

.sliding-demo__metrics > span {
  display: flex;
  align-items: baseline;
  gap: 7px;
  min-width: 74px;
  padding: 6px 9px;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  font-family: var(--vp-font-family-mono);
  font-size: 15px;
  font-weight: 900;
}

.sliding-demo__metrics small {
  color: var(--vp-c-text-3);
  font-size: 8px;
  letter-spacing: 0.08em;
}

.sliding-demo__metrics .is-answer {
  border-color: var(--algo-accent);
  color: var(--algo-accent);
}

.sliding-demo__rail {
  display: grid;
  grid-template-columns: repeat(8, minmax(34px, 1fr));
  gap: 5px;
  width: 100%;
}

.sliding-demo__cell {
  position: relative;
  display: grid;
  aspect-ratio: 1;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-3);
  background: color-mix(in srgb, var(--vp-c-bg) 82%, transparent);
  place-items: center;
  transition:
    color 220ms ease,
    border-color 220ms ease,
    background-color 220ms ease,
    transform 220ms ease,
    opacity 220ms ease;
}

.sliding-demo__cell strong {
  font-family: var(--vp-font-family-mono);
  font-size: clamp(16px, 4vw, 22px);
}

.sliding-demo__cell small {
  position: absolute;
  right: 4px;
  bottom: 1px;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 7px;
}

.sliding-demo__cell.is-window {
  border-color: var(--vp-c-text-1);
  color: var(--vp-c-text-1);
  background: color-mix(in srgb, var(--algo-lime) 45%, var(--vp-c-bg));
  transform: translateY(-3px);
}

.sliding-demo__cell.is-cursor {
  border-width: 2px;
  border-color: var(--algo-accent);
}

.sliding-demo__cell.is-conflict {
  color: var(--vp-c-bg);
  background:
    repeating-linear-gradient(
      -45deg,
      var(--algo-accent) 0,
      var(--algo-accent) 6px,
      color-mix(in srgb, var(--algo-accent) 80%, var(--vp-c-bg)) 6px,
      color-mix(in srgb, var(--algo-accent) 80%, var(--vp-c-bg)) 12px
    );
  animation: conflict-pulse 720ms ease-in-out infinite alternate;
}

.sliding-demo__cell.is-future {
  opacity: 0.52;
}

.sliding-demo__marker {
  position: absolute;
  left: 50%;
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 9px;
  font-weight: 950;
  line-height: 1;
  transform: translateX(-50%);
}

.sliding-demo__marker::after {
  display: block;
  width: 1px;
  height: 7px;
  margin: 3px auto 0;
  background: currentColor;
  content: "";
}

.sliding-demo__marker--left {
  bottom: calc(100% + 5px);
}

.sliding-demo__marker--right {
  top: calc(100% + 5px);
  color: var(--algo-accent);
}

.sliding-demo__marker--right::after {
  position: absolute;
  bottom: calc(100% + 3px);
  left: 50%;
  margin: 0;
}

.sliding-demo__set {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  margin-top: 40px;
  padding: 10px 12px;
  border-top: 1px solid var(--vp-c-divider);
  border-bottom: 1px solid var(--vp-c-divider);
  font-family: var(--vp-font-family-mono);
}

.sliding-demo__set-label {
  color: var(--vp-c-text-3);
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.1em;
}

.sliding-demo__set-values {
  display: flex;
  gap: 5px;
}

.sliding-demo__set-values span {
  display: grid;
  width: 26px;
  height: 26px;
  border: 1px solid var(--vp-c-text-1);
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  font-size: 12px;
  font-style: normal;
  font-weight: 900;
  place-items: center;
}

.sliding-demo__set-values em {
  color: var(--vp-c-text-3);
  font-size: 10px;
}

.sliding-demo__set > strong {
  color: var(--algo-accent);
  font-size: 11px;
}

.sliding-demo__alert,
.sliding-demo__answer {
  margin-top: 12px;
  padding: 7px 10px;
  border-left: 3px solid var(--algo-accent);
  color: var(--algo-accent);
  background: color-mix(in srgb, var(--algo-accent) 9%, transparent);
  font-family: var(--vp-font-family-mono);
  font-size: 10px;
  font-weight: 900;
}

.sliding-demo__answer {
  border-left-color: var(--algo-lime);
  color: var(--vp-c-text-1);
  background: color-mix(in srgb, var(--algo-lime) 15%, transparent);
}

@keyframes conflict-pulse {
  from {
    transform: translateY(-1px) rotate(-1deg);
  }
  to {
    transform: translateY(-5px) rotate(1deg);
  }
}

@media (max-width: 520px) {
  .sliding-demo__metrics {
    gap: 5px;
  }

  .sliding-demo__metrics > span {
    min-width: 0;
    padding: 5px 7px;
    font-size: 13px;
  }

  .sliding-demo__rail {
    gap: 3px;
  }

  .sliding-demo__set {
    grid-template-columns: auto 1fr;
  }

  .sliding-demo__set > strong {
    grid-column: 1 / -1;
  }
}
</style>
