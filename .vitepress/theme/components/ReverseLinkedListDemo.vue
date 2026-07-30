<script setup lang="ts">
import AlgorithmPlayer from './AlgorithmPlayer.vue'

interface ListState {
  previous: number | null
  current: number | null
  next: number | null
  reversedThrough: number
  phase: 'init' | 'save' | 'reverse' | 'advance' | 'done'
}

const nodes = [1, 2, 3, 4]

const codeLines = [
  { no: 1, text: 'previous = None' },
  { no: 2, text: 'current = head' },
  { no: 3, text: 'while current:' },
  { no: 4, text: '    next_node = current.next' },
  { no: 5, text: '    current.next = previous' },
  { no: 6, text: '    previous = current' },
  { no: 7, text: '    current = next_node' },
  { no: 8, text: 'return previous' },
]

const steps = [
  {
    title: '把链表切成两段',
    description: 'previous 代表已经反转的前缀，current 指向尚未处理后缀的第一个结点。初始时前缀为空。',
    codeLines: [1, 2],
  },
  {
    title: '先保存后继',
    description: 'next_node 暂存结点 2。接下来 current.next 会被覆盖，这一步是不断链的关键。',
    codeLines: [3, 4],
  },
  {
    title: '反转当前指针',
    description: '把结点 1 的 next 改为 previous，也就是 None。结点 1 现在成为已反转前缀。',
    codeLines: [5],
  },
  {
    title: '整体向前推进',
    description: 'previous 来到结点 1，current 恢复为刚才保存的结点 2，下一轮仍保持相同不变量。',
    codeLines: [6, 7],
  },
  {
    title: '再次保存后继',
    description: '处理结点 2 前，先把结点 3 保存到 next_node；未处理后缀仍然可以被找到。',
    codeLines: [3, 4],
  },
  {
    title: '让 2 指回 1',
    description: '执行 current.next = previous，箭头方向反转为 2 → 1，已反转前缀长度增加一。',
    codeLines: [5],
  },
  {
    title: '三指针继续右移',
    description: 'previous 指向 2，current 指向 3。每轮只做“保存、反转、推进”三件事。',
    codeLines: [6, 7],
  },
  {
    title: '重复动作直到链尾',
    description: '结点 3、4 继续执行同样操作。每个结点只被访问一次，额外只使用三个指针。',
    codeLines: [3, 4, 5, 6, 7],
  },
  {
    title: 'previous 就是新头结点',
    description: 'current 变为 None 时循环结束。previous 指向 4，整条链表已经变成 4 → 3 → 2 → 1。',
    codeLines: [3, 8],
  },
]

const states: ListState[] = [
  {
    previous: null,
    current: 0,
    next: null,
    reversedThrough: -1,
    phase: 'init',
  },
  {
    previous: null,
    current: 0,
    next: 1,
    reversedThrough: -1,
    phase: 'save',
  },
  {
    previous: null,
    current: 0,
    next: 1,
    reversedThrough: 0,
    phase: 'reverse',
  },
  {
    previous: 0,
    current: 1,
    next: null,
    reversedThrough: 0,
    phase: 'advance',
  },
  {
    previous: 0,
    current: 1,
    next: 2,
    reversedThrough: 0,
    phase: 'save',
  },
  {
    previous: 0,
    current: 1,
    next: 2,
    reversedThrough: 1,
    phase: 'reverse',
  },
  {
    previous: 1,
    current: 2,
    next: null,
    reversedThrough: 1,
    phase: 'advance',
  },
  {
    previous: 2,
    current: 3,
    next: null,
    reversedThrough: 2,
    phase: 'advance',
  },
  {
    previous: 3,
    current: null,
    next: null,
    reversedThrough: 3,
    phase: 'done',
  },
]

function edgeDirection(gapIndex: number, state: ListState) {
  if (gapIndex + 1 <= state.reversedThrough) {
    return 'left'
  }

  if (
    gapIndex === state.reversedThrough
    && state.reversedThrough >= 0
    && state.reversedThrough < nodes.length - 1
  ) {
    return 'split'
  }

  return 'right'
}

function pointerValue(pointer: number | null) {
  return pointer === null ? 'None' : String(nodes[pointer])
}
</script>

<template>
  <AlgorithmPlayer
    eyebrow="POINTER LAB · 1 → 2 → 3 → 4"
    title="三根指针怎样做到不断链"
    :steps="steps"
    :code-lines="codeLines"
    :interval="2100"
  >
    <template #visual="{ index }">
      <div class="linked-demo">
        <div class="linked-demo__variables">
          <span class="is-previous">
            <small>previous</small>
            {{ pointerValue(states[index].previous) }}
          </span>
          <span class="is-current">
            <small>current</small>
            {{ pointerValue(states[index].current) }}
          </span>
          <span class="is-next">
            <small>next_node</small>
            {{ pointerValue(states[index].next) }}
          </span>
        </div>

        <div class="linked-demo__track">
          <template
            v-for="(node, nodeIndex) in nodes"
            :key="node"
          >
            <div
              class="linked-demo__node-wrap"
              :class="{
                'is-reversed': nodeIndex <= states[index].reversedThrough,
              }"
            >
              <div class="linked-demo__pointers">
                <span
                  v-if="states[index].previous === nodeIndex"
                  class="is-previous"
                >
                  prev
                </span>
                <span
                  v-if="states[index].current === nodeIndex"
                  class="is-current"
                >
                  cur
                </span>
                <span
                  v-if="states[index].next === nodeIndex"
                  class="is-next"
                >
                  next
                </span>
              </div>
              <div
                class="linked-demo__node"
                :class="{
                  'is-previous': states[index].previous === nodeIndex,
                  'is-current': states[index].current === nodeIndex,
                  'is-next': states[index].next === nodeIndex,
                  'is-new-head': states[index].phase === 'done' && nodeIndex === 3,
                }"
              >
                {{ node }}
              </div>
              <small v-if="states[index].phase === 'done' && nodeIndex === 3">
                NEW HEAD
              </small>
            </div>

            <div
              v-if="nodeIndex < nodes.length - 1"
              class="linked-demo__edge"
              :class="`is-${edgeDirection(nodeIndex, states[index])}`"
              aria-hidden="true"
            >
              <span v-if="edgeDirection(nodeIndex, states[index]) === 'left'">←</span>
              <span v-else-if="edgeDirection(nodeIndex, states[index]) === 'right'">→</span>
              <span v-else>×</span>
            </div>
          </template>
        </div>

        <div class="linked-demo__legend">
          <span>
            <i class="is-reversed" />
            已反转
          </span>
          <span>
            <i class="is-unprocessed" />
            未处理
          </span>
          <strong v-if="states[index].phase === 'reverse'">
            current.next = previous
          </strong>
          <strong v-else-if="states[index].phase === 'done'">
            4 → 3 → 2 → 1 → None
          </strong>
        </div>
      </div>
    </template>
  </AlgorithmPlayer>
</template>

<style scoped>
.linked-demo {
  width: min(100%, 460px);
}

.linked-demo__variables {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-bottom: 44px;
  font-family: var(--vp-font-family-mono);
}

.linked-demo__variables > span {
  display: grid;
  min-width: 82px;
  padding: 6px 8px;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  font-size: 13px;
  font-weight: 900;
  text-align: center;
}

.linked-demo__variables small {
  color: var(--vp-c-text-3);
  font-size: 7px;
  letter-spacing: 0.08em;
}

.linked-demo__variables .is-previous {
  border-color: var(--algo-lime);
}

.linked-demo__variables .is-current {
  border-color: var(--algo-accent);
}

.linked-demo__variables .is-next {
  border-style: dashed;
  border-color: var(--vp-c-text-2);
}

.linked-demo__track {
  display: grid;
  grid-template-columns:
    minmax(43px, 1fr) 28px
    minmax(43px, 1fr) 28px
    minmax(43px, 1fr) 28px
    minmax(43px, 1fr);
  align-items: center;
  width: 100%;
}

.linked-demo__node-wrap {
  position: relative;
  display: grid;
  justify-items: center;
}

.linked-demo__pointers {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  display: flex;
  gap: 3px;
  min-height: 17px;
  transform: translateX(-50%);
}

.linked-demo__pointers span {
  padding: 2px 4px;
  color: var(--vp-c-bg);
  font-family: var(--vp-font-family-mono);
  font-size: 7px;
  font-weight: 900;
  white-space: nowrap;
}

.linked-demo__pointers .is-previous {
  color: var(--vp-c-text-1);
  background: var(--algo-lime);
}

.linked-demo__pointers .is-current {
  background: var(--algo-accent);
}

.linked-demo__pointers .is-next {
  color: var(--vp-c-bg);
  background: var(--vp-c-text-2);
}

.linked-demo__node {
  display: grid;
  width: clamp(42px, 9vw, 56px);
  aspect-ratio: 1;
  border: 2px solid var(--vp-c-text-1);
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  font-family: var(--vp-font-family-mono);
  font-size: clamp(16px, 4vw, 22px);
  font-weight: 950;
  place-items: center;
  transition:
    color 230ms ease,
    background-color 230ms ease,
    border-color 230ms ease,
    transform 230ms ease,
    box-shadow 230ms ease;
}

.linked-demo__node-wrap.is-reversed .linked-demo__node {
  background: color-mix(in srgb, var(--algo-lime) 48%, var(--vp-c-bg));
}

.linked-demo__node.is-current {
  border-color: var(--algo-accent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--algo-accent) 14%, transparent);
  transform: translateY(-3px);
}

.linked-demo__node.is-next {
  border-style: dashed;
}

.linked-demo__node.is-new-head {
  color: var(--vp-c-bg);
  background: var(--algo-accent);
}

.linked-demo__node-wrap > small {
  position: absolute;
  top: calc(100% + 6px);
  color: var(--algo-accent);
  font-family: var(--vp-font-family-mono);
  font-size: 7px;
  font-weight: 900;
  white-space: nowrap;
}

.linked-demo__edge {
  display: grid;
  height: 26px;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
  font-size: 24px;
  font-weight: 400;
  place-items: center;
  transition:
    color 200ms ease,
    transform 200ms ease;
}

.linked-demo__edge.is-left {
  color: var(--algo-accent);
}

.linked-demo__edge.is-split {
  color: var(--vp-c-text-3);
  font-size: 16px;
  transform: rotate(7deg);
}

.linked-demo__legend {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 38px;
  padding-top: 11px;
  border-top: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 8px;
  font-weight: 850;
}

.linked-demo__legend span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.linked-demo__legend i {
  display: inline-block;
  width: 10px;
  height: 10px;
  border: 1px solid var(--vp-c-text-2);
}

.linked-demo__legend i.is-reversed {
  background: color-mix(in srgb, var(--algo-lime) 48%, var(--vp-c-bg));
}

.linked-demo__legend strong {
  margin-left: auto;
  color: var(--algo-accent);
  font-size: 9px;
}

@media (max-width: 520px) {
  .linked-demo__variables {
    gap: 3px;
  }

  .linked-demo__variables > span {
    min-width: 0;
    padding: 5px;
    font-size: 11px;
  }

  .linked-demo__track {
    grid-template-columns:
      minmax(36px, 1fr) 18px
      minmax(36px, 1fr) 18px
      minmax(36px, 1fr) 18px
      minmax(36px, 1fr);
  }

  .linked-demo__edge {
    font-size: 19px;
  }

  .linked-demo__legend {
    flex-wrap: wrap;
    gap: 7px 11px;
  }

  .linked-demo__legend strong {
    width: 100%;
    margin-left: 0;
  }
}
</style>
