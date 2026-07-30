<script setup lang="ts">
import AlgorithmPlayer from './AlgorithmPlayer.vue'

interface TreeNodeLayout {
  value: number
  x: number
  y: number
}

interface TraversalState {
  active: number | null
  stack: number[]
  visited: number[]
  phase: 'enter' | 'descend' | 'visit' | 'return' | 'done'
}

const treeNodes: TreeNodeLayout[] = [
  { value: 4, x: 260, y: 38 },
  { value: 2, x: 145, y: 110 },
  { value: 6, x: 375, y: 110 },
  { value: 1, x: 82, y: 196 },
  { value: 3, x: 208, y: 196 },
  { value: 5, x: 312, y: 196 },
  { value: 7, x: 438, y: 196 },
]

const edges = [
  [4, 2],
  [4, 6],
  [2, 1],
  [2, 3],
  [6, 5],
  [6, 7],
]

const codeLines = [
  { no: 1, text: 'result = []' },
  { no: 2, text: 'def traverse(node):' },
  { no: 3, text: '    if node is None: return' },
  { no: 4, text: '    traverse(node.left)' },
  { no: 5, text: '    result.append(node.val)' },
  { no: 6, text: '    traverse(node.right)' },
  { no: 7, text: 'traverse(root)' },
  { no: 8, text: 'return result' },
]

const steps = [
  {
    title: '从根结点 4 进入递归',
    description: '调用 traverse(4)。当前结点进入调用栈，但还不能访问，因为中序遍历必须先完成左子树。',
    codeLines: [2, 7],
  },
  {
    title: '沿左边进入结点 2',
    description: '执行 traverse(node.left)，调用栈变成 4 → 2。结点 4 保持等待状态。',
    codeLines: [4, 2],
  },
  {
    title: '继续抵达最左结点 1',
    description: '结点 2 仍先递归左子树，于是结点 1 入栈。它已经没有非空左孩子。',
    codeLines: [4, 2, 3],
  },
  {
    title: '第一次访问：记录 1',
    description: '1 的左子树为空并返回，现在执行 result.append(1)。这正是“左 → 根 → 右”中的根。',
    codeLines: [3, 5],
  },
  {
    title: '返回结点 2 并访问',
    description: '结点 1 的右子树也为空，递归返回到 2。2 的左子树已经完成，因此把 2 加入结果。',
    codeLines: [6, 3, 5],
  },
  {
    title: '进入并访问结点 3',
    description: '接着遍历 2 的右子树。3 没有左孩子，可以访问；此时左半棵树的结果是 [1, 2, 3]。',
    codeLines: [6, 2, 4, 3, 5],
  },
  {
    title: '左子树完成，访问根 4',
    description: 'traverse(2) 完整返回后，根结点 4 的左子树已经全部处理，现在才轮到 4。',
    codeLines: [6, 5],
  },
  {
    title: '转入右子树，先处理 5',
    description: '进入结点 6 后仍然先递归它的左子树，因此 5 会比 6 更早写入结果。',
    codeLines: [6, 2, 4, 3, 5],
  },
  {
    title: '回到结点 6',
    description: '5 的左右子树都完成，返回并访问 6。调用栈展示了递归“从哪里回来”。',
    codeLines: [6, 5],
  },
  {
    title: '访问最右结点 7',
    description: '最后遍历 6 的右子树并访问 7。所有结点恰好访问一次。',
    codeLines: [6, 2, 4, 3, 5],
  },
  {
    title: '得到完整中序序列',
    description: '调用栈清空，最终结果为 [1, 2, 3, 4, 5, 6, 7]。对于二叉搜索树，它天然是有序序列。',
    codeLines: [6, 8],
  },
]

const states: TraversalState[] = [
  {
    active: 4,
    stack: [4],
    visited: [],
    phase: 'enter',
  },
  {
    active: 2,
    stack: [4, 2],
    visited: [],
    phase: 'descend',
  },
  {
    active: 1,
    stack: [4, 2, 1],
    visited: [],
    phase: 'descend',
  },
  {
    active: 1,
    stack: [4, 2, 1],
    visited: [1],
    phase: 'visit',
  },
  {
    active: 2,
    stack: [4, 2],
    visited: [1, 2],
    phase: 'return',
  },
  {
    active: 3,
    stack: [4, 2, 3],
    visited: [1, 2, 3],
    phase: 'visit',
  },
  {
    active: 4,
    stack: [4],
    visited: [1, 2, 3, 4],
    phase: 'return',
  },
  {
    active: 5,
    stack: [4, 6, 5],
    visited: [1, 2, 3, 4, 5],
    phase: 'descend',
  },
  {
    active: 6,
    stack: [4, 6],
    visited: [1, 2, 3, 4, 5, 6],
    phase: 'return',
  },
  {
    active: 7,
    stack: [4, 6, 7],
    visited: [1, 2, 3, 4, 5, 6, 7],
    phase: 'visit',
  },
  {
    active: null,
    stack: [],
    visited: [1, 2, 3, 4, 5, 6, 7],
    phase: 'done',
  },
]

function nodePosition(value: number) {
  return treeNodes.find(node => node.value === value)!
}

function visitOrder(value: number, state: TraversalState) {
  const order = state.visited.indexOf(value)
  return order < 0 ? null : order + 1
}
</script>

<template>
  <AlgorithmPlayer
    eyebrow="RECURSION TRACE · LEFT → ROOT → RIGHT"
    title="递归调用栈里到底发生了什么"
    :steps="steps"
    :code-lines="codeLines"
    :interval="2100"
  >
    <template #visual="{ index }">
      <div class="tree-demo">
        <svg
          class="tree-demo__tree"
          viewBox="0 0 520 238"
          role="img"
          :aria-label="`当前访问结点 ${states[index].active ?? '无'}，结果为 ${states[index].visited.join('、') || '空'}`"
        >
          <line
            v-for="([from, to]) in edges"
            :key="`${from}-${to}`"
            :x1="nodePosition(from).x"
            :y1="nodePosition(from).y"
            :x2="nodePosition(to).x"
            :y2="nodePosition(to).y"
            class="tree-demo__edge"
            :class="{
              'is-traversed': states[index].visited.includes(to),
            }"
          />

          <g
            v-for="node in treeNodes"
            :key="node.value"
            class="tree-demo__node"
            :class="{
              'is-active': states[index].active === node.value,
              'is-visited': states[index].visited.includes(node.value),
              'is-on-stack': states[index].stack.includes(node.value),
            }"
            :transform="`translate(${node.x} ${node.y})`"
          >
            <circle r="24" />
            <text
              text-anchor="middle"
              dominant-baseline="central"
            >
              {{ node.value }}
            </text>
            <g
              v-if="visitOrder(node.value, states[index])"
              class="tree-demo__order"
              transform="translate(20 -20)"
            >
              <circle r="9" />
              <text
                text-anchor="middle"
                dominant-baseline="central"
              >
                {{ visitOrder(node.value, states[index]) }}
              </text>
            </g>
          </g>
        </svg>

        <div class="tree-demo__trace">
          <div class="tree-demo__stack">
            <span class="tree-demo__label">CALL STACK</span>
            <div>
              <span
                v-for="value in states[index].stack"
                :key="value"
              >
                {{ value }}
              </span>
              <em v-if="states[index].stack.length === 0">empty</em>
            </div>
          </div>
          <div class="tree-demo__result">
            <span class="tree-demo__label">RESULT</span>
            <strong>
              [{{ states[index].visited.join(', ') }}]
            </strong>
          </div>
        </div>
      </div>
    </template>
  </AlgorithmPlayer>
</template>

<style scoped>
.tree-demo {
  width: min(100%, 500px);
}

.tree-demo__tree {
  display: block;
  width: 100%;
  overflow: visible;
}

.tree-demo__edge {
  stroke: var(--vp-c-divider);
  stroke-width: 3;
  transition:
    stroke 220ms ease,
    stroke-width 220ms ease;
}

.tree-demo__edge.is-traversed {
  stroke: color-mix(in srgb, var(--algo-lime) 72%, var(--vp-c-text-1));
  stroke-width: 4;
}

.tree-demo__node circle {
  fill: var(--vp-c-bg);
  stroke: var(--vp-c-text-1);
  stroke-width: 2.5;
  transition:
    fill 240ms ease,
    stroke 240ms ease,
    stroke-width 240ms ease,
    filter 240ms ease;
}

.tree-demo__node > text {
  fill: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 17px;
  font-weight: 950;
  transition: fill 240ms ease;
}

.tree-demo__node.is-on-stack circle {
  stroke-dasharray: 4 3;
}

.tree-demo__node.is-visited circle {
  fill: color-mix(in srgb, var(--algo-lime) 55%, var(--vp-c-bg));
  stroke-dasharray: none;
}

.tree-demo__node.is-active circle {
  fill: var(--algo-accent);
  stroke: var(--algo-accent);
  stroke-width: 4;
  stroke-dasharray: none;
  filter: drop-shadow(0 0 8px color-mix(in srgb, var(--algo-accent) 42%, transparent));
  animation: active-node 850ms ease-in-out infinite alternate;
}

.tree-demo__node.is-active > text {
  fill: var(--vp-c-bg);
}

.tree-demo__order circle {
  fill: var(--vp-c-text-1);
  stroke: var(--vp-c-bg);
  stroke-width: 2;
}

.tree-demo__order text {
  fill: var(--vp-c-bg);
  font-family: var(--vp-font-family-mono);
  font-size: 8px;
  font-weight: 900;
}

.tree-demo__trace {
  display: grid;
  grid-template-columns: minmax(150px, 0.8fr) minmax(180px, 1.2fr);
  gap: 8px;
  margin-top: 4px;
}

.tree-demo__stack,
.tree-demo__result {
  min-height: 60px;
  padding: 8px 10px;
  border: 1px solid var(--vp-c-divider);
  background: color-mix(in srgb, var(--vp-c-bg) 82%, transparent);
}

.tree-demo__label {
  display: block;
  margin-bottom: 7px;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 7px;
  font-weight: 900;
  letter-spacing: 0.1em;
}

.tree-demo__stack > div {
  display: flex;
  flex-direction: row-reverse;
  justify-content: flex-end;
  gap: 4px;
}

.tree-demo__stack > div span {
  display: grid;
  width: 25px;
  height: 25px;
  border: 1px solid var(--vp-c-text-1);
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  font-family: var(--vp-font-family-mono);
  font-size: 10px;
  font-weight: 900;
  place-items: center;
}

.tree-demo__stack > div span:last-child {
  color: var(--vp-c-bg);
  background: var(--algo-accent);
}

.tree-demo__stack em {
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 10px;
}

.tree-demo__result strong {
  color: var(--algo-accent);
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
}

@keyframes active-node {
  from {
    transform: scale(0.97);
  }
  to {
    transform: scale(1.04);
  }
}

@media (max-width: 520px) {
  .tree-demo__trace {
    grid-template-columns: 1fr;
  }

  .tree-demo__tree {
    margin: -10px 0;
  }
}
</style>
