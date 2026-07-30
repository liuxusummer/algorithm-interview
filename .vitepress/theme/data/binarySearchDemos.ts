export type BinarySearchDemoVariant =
  | 'classic'
  | 'lower-bound'
  | 'sqrt'
  | 'rotated-search'
  | 'rotated-min'
  | 'median-partition'
  | 'koko'

export interface BinaryCodeLine {
  no: number
  text: string
}

export interface BinaryStep {
  title: string
  description: string
  codeLines: number[]
  left?: number
  right?: number
  middle?: number
  found?: number[]
  pass?: string
  comparison?: string
  decision?: string
  result?: string
  hours?: number
  feasible?: boolean
  partitionA?: number
  partitionB?: number
  boundaries?: {
    aLeft: string
    aRight: string
    bLeft: string
    bRight: string
  }
}

interface BinaryDemoBase {
  eyebrow: string
  title: string
  interval: number
  codeLines: BinaryCodeLine[]
  steps: BinaryStep[]
}

export interface BinaryRangeDemo extends BinaryDemoBase {
  kind: 'range'
  values: Array<number | string>
  target: string
  intervalType: 'closed' | 'half-open'
  metricMode?: 'index' | 'value'
  truthBoundary?: number
  truthDirection?: 'at-most' | 'at-least'
}

export interface BinaryPartitionDemo extends BinaryDemoBase {
  kind: 'partition'
  valuesA: number[]
  valuesB: number[]
  target: string
}

export type BinaryDemoConfig = BinaryRangeDemo | BinaryPartitionDemo

export const binarySearchDemos: Record<BinarySearchDemoVariant, BinaryDemoConfig> = {
  classic: {
    kind: 'range',
    eyebrow: 'BINARY LAB · CLOSED INTERVAL',
    title: '每次排除一半，目标为什么不会丢',
    interval: 1850,
    values: [-1, 0, 3, 5, 9, 12],
    target: 'target = 9',
    intervalType: 'closed',
    codeLines: [
      { no: 1, text: 'left = 0' },
      { no: 2, text: 'right = len(nums) - 1' },
      { no: 3, text: 'while left <= right:' },
      { no: 4, text: '    middle = left + (right - left) // 2' },
      { no: 5, text: '    if nums[middle] == target:' },
      { no: 6, text: '        return middle' },
      { no: 7, text: '    if nums[middle] < target:' },
      { no: 8, text: '        left = middle + 1' },
      { no: 9, text: '    else:' },
      { no: 10, text: '        right = middle - 1' },
      { no: 11, text: 'return -1' },
    ],
    steps: [
      {
        title: '先声明闭区间语义',
        description: '目标若存在，一定在 [left, right] 内。左右端点都是有效候选，所以循环条件必须包含等号。',
        codeLines: [1, 2, 3],
        left: 0,
        right: 5,
        pass: '闭区间 [L, R]',
        decision: '候选共有 6 个',
      },
      {
        title: '第一次检查中点 3',
        description: 'middle = 2，nums[2] = 3 小于目标 9。数组递增，因此下标 0 到 2 都不可能是答案。',
        codeLines: [3, 4, 5, 7, 8],
        left: 0,
        right: 5,
        middle: 2,
        pass: 'ROUND 1',
        comparison: '3 < 9',
        decision: '排除 [0, 2]，令 left = 3',
      },
      {
        title: '第二次检查中点 9',
        description: '新区间是 [3, 5]，middle = 4。中点值恰好等于目标，不需要再收缩区间。',
        codeLines: [3, 4, 5],
        left: 3,
        right: 5,
        middle: 4,
        pass: 'ROUND 2',
        comparison: '9 == 9',
        decision: '命中目标',
      },
      {
        title: '返回目标下标 4',
        description: '二分只检查了两个中点，就从 6 个候选中定位到答案。每轮候选规模至少减半。',
        codeLines: [6],
        left: 3,
        right: 5,
        middle: 4,
        found: [4],
        pass: 'FOUND',
        result: 'return 4',
      },
    ],
  },

  'lower-bound': {
    kind: 'range',
    eyebrow: 'BOUNDARY LAB · [LEFT, RIGHT)',
    title: '两次 lower_bound 怎样夹出目标区间',
    interval: 1900,
    values: [5, 7, 7, 8, 8, 10],
    target: 'target = 8',
    intervalType: 'half-open',
    codeLines: [
      { no: 1, text: 'def lower_bound(value):' },
      { no: 2, text: '    left, right = 0, len(nums)' },
      { no: 3, text: '    while left < right:' },
      { no: 4, text: '        middle = left + (right - left) // 2' },
      { no: 5, text: '        if nums[middle] < value:' },
      { no: 6, text: '            left = middle + 1' },
      { no: 7, text: '        else:' },
      { no: 8, text: '            right = middle' },
      { no: 9, text: '    return left' },
      { no: 10, text: 'first = lower_bound(target)' },
      { no: 11, text: 'last = lower_bound(target + 1) - 1' },
    ],
    steps: [
      {
        title: '第一趟：寻找第一个 ≥ 8 的位置',
        description: 'lower_bound 使用左闭右开区间 [0, 6)。right 可以等于数组长度，表示末尾之后的位置。',
        codeLines: [1, 2, 3, 10],
        left: 0,
        right: 6,
        pass: 'PASS 1 · lower_bound(8)',
        decision: '目标：第一个 ≥ 8',
      },
      {
        title: '中点值 8 满足条件',
        description: 'middle = 3，nums[3] = 8。它可能就是第一个 8，所以不能排除中点，只能令 right = middle。',
        codeLines: [3, 4, 5, 7, 8],
        left: 0,
        right: 6,
        middle: 3,
        pass: 'PASS 1',
        comparison: '8 ≥ 8',
        decision: '保留中点，right = 3',
      },
      {
        title: '中点值 7 太小',
        description: '在 [0, 3) 中取 middle = 1。7 小于 8，中点及其左侧都可排除，left 移到 2。',
        codeLines: [3, 4, 5, 6],
        left: 0,
        right: 3,
        middle: 1,
        pass: 'PASS 1',
        comparison: '7 < 8',
        decision: 'left = 2',
      },
      {
        title: '继续跨过最后一个 7',
        description: 'middle = 2 仍然小于 8，令 left = 3。此时 left == right，左边界确定为 3。',
        codeLines: [3, 4, 5, 6, 9],
        left: 2,
        right: 3,
        middle: 2,
        pass: 'PASS 1 · DONE',
        comparison: '7 < 8',
        result: 'first = 3',
      },
      {
        title: '第二趟：寻找第一个 ≥ 9 的位置',
        description: '所有等于 8 的元素都小于 9，因此 lower_bound(9) 会落在整段 8 的右边。',
        codeLines: [1, 2, 3, 11],
        left: 0,
        right: 6,
        pass: 'PASS 2 · lower_bound(9)',
        decision: '目标：第一个 > 8',
      },
      {
        title: '中点 8 小于 9',
        description: 'middle = 3 的值为 8，必须跨过它，令 left = 4。',
        codeLines: [3, 4, 5, 6],
        left: 0,
        right: 6,
        middle: 3,
        pass: 'PASS 2',
        comparison: '8 < 9',
        decision: 'left = 4',
      },
      {
        title: '中点 10 已经足够大',
        description: '在 [4, 6) 中取 middle = 5。10 ≥ 9，中点仍可能是边界，因此 right 收缩到 5。',
        codeLines: [3, 4, 5, 7, 8],
        left: 4,
        right: 6,
        middle: 5,
        pass: 'PASS 2',
        comparison: '10 ≥ 9',
        decision: 'right = 5',
      },
      {
        title: '跨过最后一个 8',
        description: 'middle = 4 的值仍是 8，令 left = 5。第二条边界落在 5，所以最后一个 8 的位置是 5 - 1。',
        codeLines: [3, 4, 5, 6, 9, 11],
        left: 4,
        right: 5,
        middle: 4,
        pass: 'PASS 2 · DONE',
        comparison: '8 < 9',
        decision: 'lower_bound(9) = 5',
      },
      {
        title: '两条边界组成答案',
        description: '第一次得到 first = 3，第二次得到边界 5，减一得到 last = 4。',
        codeLines: [10, 11],
        left: 3,
        right: 5,
        found: [3, 4],
        pass: 'RESULT',
        result: '[3, 4]',
      },
    ],
  },

  sqrt: {
    kind: 'range',
    eyebrow: 'ANSWER SPACE · x = 8',
    title: '不是找数组，而是找最后一个可行答案',
    interval: 1900,
    values: [1, 2, 3, 4],
    target: 'predicate: value² ≤ 8',
    intervalType: 'closed',
    metricMode: 'value',
    truthBoundary: 2,
    truthDirection: 'at-most',
    codeLines: [
      { no: 1, text: 'left, right = 1, x // 2' },
      { no: 2, text: 'answer = 1' },
      { no: 3, text: 'while left <= right:' },
      { no: 4, text: '    middle = left + (right - left) // 2' },
      { no: 5, text: '    if middle * middle <= x:' },
      { no: 6, text: '        answer = middle' },
      { no: 7, text: '        left = middle + 1' },
      { no: 8, text: '    else:' },
      { no: 9, text: '        right = middle - 1' },
      { no: 10, text: 'return answer' },
    ],
    steps: [
      {
        title: '把候选答案排成单调序列',
        description: '对 x = 8，候选整数是 1 到 4。谓词 value² ≤ 8 会先为真、后为假，答案就是最后一个 True。',
        codeLines: [1, 2, 3],
        left: 0,
        right: 3,
        pass: 'LAST TRUE',
        decision: '搜索值域 [1, 4]',
      },
      {
        title: '候选 2 可行，继续向右',
        description: '2² = 4 ≤ 8，先把 answer 记录为 2。但右侧可能还有更大的可行整数，所以令 left = 3。',
        codeLines: [3, 4, 5, 6, 7],
        left: 0,
        right: 3,
        middle: 1,
        pass: 'CHECK 2',
        comparison: '2² = 4 ≤ 8',
        decision: 'answer = 2，继续找更大值',
      },
      {
        title: '候选 3 不可行，向左收缩',
        description: '3² = 9 > 8。由单调性可知 3 以及更大的候选都不可能，right 回到 2。',
        codeLines: [3, 4, 5, 8, 9],
        left: 2,
        right: 3,
        middle: 2,
        pass: 'CHECK 3',
        comparison: '3² = 9 > 8',
        decision: '排除 3 及其右侧',
      },
      {
        title: '区间为空，返回最后一个 True',
        description: 'left 已经越过 right，搜索结束。被记录的最大可行值是 2，也就是 ⌊√8⌋。',
        codeLines: [3, 10],
        left: 2,
        right: 1,
        found: [1],
        pass: 'RESULT',
        result: '⌊√8⌋ = 2',
      },
    ],
  },

  'rotated-search': {
    kind: 'range',
    eyebrow: 'ROTATED ARRAY · target = 0',
    title: '整体无序，为什么仍能排除一半',
    interval: 1950,
    values: [4, 5, 6, 7, 0, 1, 2],
    target: 'target = 0',
    intervalType: 'closed',
    codeLines: [
      { no: 1, text: 'left, right = 0, len(nums) - 1' },
      { no: 2, text: 'while left <= right:' },
      { no: 3, text: '    middle = left + (right - left) // 2' },
      { no: 4, text: '    if nums[middle] == target: return middle' },
      { no: 5, text: '    if nums[left] <= nums[middle]:' },
      { no: 6, text: '        if nums[left] <= target < nums[middle]:' },
      { no: 7, text: '            right = middle - 1' },
      { no: 8, text: '        else: left = middle + 1' },
      { no: 9, text: '    else:' },
      { no: 10, text: '        if nums[middle] < target <= nums[right]:' },
      { no: 11, text: '            left = middle + 1' },
      { no: 12, text: '        else: right = middle - 1' },
    ],
    steps: [
      {
        title: '旋转数组仍保留局部有序',
        description: '数组整体在 7 与 0 之间断开，但每次从 middle 切开，至少有一半仍然严格有序。',
        codeLines: [1, 2],
        left: 0,
        right: 6,
        pass: 'ROTATED SEARCH',
        decision: '先识别哪一半有序',
      },
      {
        title: '左半 [4, 5, 6, 7] 有序',
        description: 'middle = 3，nums[left] ≤ nums[middle]，所以左半有序。目标 0 不在值域 [4, 7) 中，只能去右半。',
        codeLines: [2, 3, 4, 5, 6, 8],
        left: 0,
        right: 6,
        middle: 3,
        pass: 'ROUND 1',
        comparison: '4 ≤ 7，但 0 ∉ [4, 7)',
        decision: 'left = 4',
      },
      {
        title: '新区间左半 [0, 1] 有序',
        description: '在 [4, 6] 中取 middle = 5。目标 0 落在有序左半 [0, 1) 中，因此保留下标 4。',
        codeLines: [2, 3, 4, 5, 6, 7],
        left: 4,
        right: 6,
        middle: 5,
        pass: 'ROUND 2',
        comparison: '0 ∈ [0, 1)',
        decision: 'right = 4',
      },
      {
        title: '命中旋转点上的目标',
        description: '只剩下标 4，nums[4] = 0，直接返回。旋转并没有破坏“每轮可排除一半”的能力。',
        codeLines: [2, 3, 4],
        left: 4,
        right: 4,
        middle: 4,
        found: [4],
        pass: 'FOUND',
        comparison: '0 == 0',
        result: 'return 4',
      },
    ],
  },

  'rotated-min': {
    kind: 'range',
    eyebrow: 'ROTATION POINT · COMPARE WITH RIGHT',
    title: '比较右端点，锁定旋转断点',
    interval: 1900,
    values: [4, 5, 6, 7, 0, 1, 2],
    target: 'find minimum',
    intervalType: 'closed',
    codeLines: [
      { no: 1, text: 'left, right = 0, len(nums) - 1' },
      { no: 2, text: 'while left < right:' },
      { no: 3, text: '    middle = left + (right - left) // 2' },
      { no: 4, text: '    if nums[middle] > nums[right]:' },
      { no: 5, text: '        left = middle + 1' },
      { no: 6, text: '    else:' },
      { no: 7, text: '        right = middle' },
      { no: 8, text: 'return nums[left]' },
    ],
    steps: [
      {
        title: '最小值始终留在闭区间内',
        description: '与普通查找不同，这里用 middle 和 right 的值判断旋转断点位于哪一侧。',
        codeLines: [1, 2],
        left: 0,
        right: 6,
        pass: 'FIND ROTATION POINT',
        decision: '最小值一定在 [L, R]',
      },
      {
        title: '7 > 2，断点严格在右侧',
        description: 'middle = 3 的值大于右端值，说明 middle 仍在旋转前的大数段。middle 不可能是最小值，可以排除。',
        codeLines: [2, 3, 4, 5],
        left: 0,
        right: 6,
        middle: 3,
        pass: 'ROUND 1',
        comparison: '7 > 2',
        decision: 'left = 4',
      },
      {
        title: '1 < 2，中点可能就是最小值',
        description: 'middle = 5 到 right 单调有序，旋转断点不在中点右侧。中点仍可能是答案，所以令 right = middle。',
        codeLines: [2, 3, 4, 6, 7],
        left: 4,
        right: 6,
        middle: 5,
        pass: 'ROUND 2',
        comparison: '1 < 2',
        decision: 'right = 5，保留中点',
      },
      {
        title: '0 < 1，再次保留中点',
        description: 'middle = 4 的值小于右端值 1，最小值位于中点或其左侧。right 收缩到 4。',
        codeLines: [2, 3, 4, 6, 7],
        left: 4,
        right: 5,
        middle: 4,
        pass: 'ROUND 3',
        comparison: '0 < 1',
        decision: 'right = 4',
      },
      {
        title: '左右边界在旋转点相遇',
        description: 'left == right == 4，唯一候选就是最小值 0。注意可行分支使用 right = middle，不能跨过中点。',
        codeLines: [2, 8],
        left: 4,
        right: 4,
        found: [4],
        pass: 'RESULT',
        result: 'nums[4] = 0',
      },
    ],
  },

  'median-partition': {
    kind: 'partition',
    eyebrow: 'PARTITION LAB · O(log min(m, n))',
    title: '两条分割线如何找到中位数',
    interval: 2200,
    valuesA: [2],
    valuesB: [1, 3],
    target: 'nums1 = [1, 3], nums2 = [2]',
    codeLines: [
      { no: 1, text: 'if len(nums1) > len(nums2): swap(nums1, nums2)' },
      { no: 2, text: 'left, right = 0, len(nums1)' },
      { no: 3, text: 'while left <= right:' },
      { no: 4, text: '    i = (left + right) // 2' },
      { no: 5, text: '    j = (m + n + 1) // 2 - i' },
      { no: 6, text: '    a_left  = -inf if i == 0 else nums1[i - 1]' },
      { no: 7, text: '    a_right = +inf if i == m else nums1[i]' },
      { no: 8, text: '    b_left  = -inf if j == 0 else nums2[j - 1]' },
      { no: 9, text: '    b_right = +inf if j == n else nums2[j]' },
      { no: 10, text: '    if a_left <= b_right and b_left <= a_right:' },
      { no: 11, text: '        return max(a_left, b_left)' },
      { no: 12, text: '    if a_left > b_right: right = i - 1' },
      { no: 13, text: '    else: left = i + 1' },
    ],
    steps: [
      {
        title: '先让 nums1 成为较短数组',
        description: '原输入 [1, 3] 与 [2] 会先交换。只在更短的 [2] 上二分分割位置 i，另一条分割线 j 随之确定。',
        codeLines: [1, 2],
        left: 0,
        right: 1,
        partitionA: 0,
        partitionB: 2,
        pass: 'NORMALIZE',
        decision: '短数组 A = [2]，长数组 B = [1, 3]',
        boundaries: {
          aLeft: '−∞',
          aRight: '2',
          bLeft: '3',
          bRight: '+∞',
        },
      },
      {
        title: '第一次分割：A 左边取 0 个',
        description: 'i = 0 时，为保持左半元素总数为 2，j 必须等于 2。此时 B 左最大值 3 大于 A 右最小值 2。',
        codeLines: [3, 4, 5, 6, 7, 8, 9, 10],
        left: 0,
        right: 1,
        partitionA: 0,
        partitionB: 2,
        pass: 'CUT 1',
        comparison: 'B_left = 3 > A_right = 2',
        decision: 'A 左边取少了，left = i + 1',
        boundaries: {
          aLeft: '−∞',
          aRight: '2',
          bLeft: '3',
          bRight: '+∞',
        },
      },
      {
        title: '第二次分割满足交叉有序',
        description: 'i = 1、j = 1。A_left = 2 ≤ B_right = 3，并且 B_left = 1 ≤ A_right = +∞，分割合法。',
        codeLines: [3, 4, 5, 6, 7, 8, 9, 10],
        left: 1,
        right: 1,
        partitionA: 1,
        partitionB: 1,
        pass: 'CUT 2 · VALID',
        comparison: '2 ≤ 3 且 1 ≤ +∞',
        decision: '左半全部 ≤ 右半',
        boundaries: {
          aLeft: '2',
          aRight: '+∞',
          bLeft: '1',
          bRight: '3',
        },
      },
      {
        title: '总长度为奇数，取左半最大值',
        description: '三个元素的左半比右半多一个，因此中位数就是 max(A_left, B_left) = max(2, 1) = 2。',
        codeLines: [10, 11],
        left: 1,
        right: 1,
        partitionA: 1,
        partitionB: 1,
        found: [0],
        pass: 'MEDIAN',
        result: 'median = 2.0',
        boundaries: {
          aLeft: '2',
          aRight: '+∞',
          bLeft: '1',
          bRight: '3',
        },
      },
    ],
  },

  koko: {
    kind: 'range',
    eyebrow: 'ANSWER SPACE · piles = [3, 6, 7, 11]',
    title: '把“能否按时吃完”变成真假边界',
    interval: 1950,
    values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    target: 'h = 8',
    intervalType: 'closed',
    metricMode: 'value',
    truthBoundary: 4,
    truthDirection: 'at-least',
    codeLines: [
      { no: 1, text: 'left, right = 1, max(piles)' },
      { no: 2, text: 'while left < right:' },
      { no: 3, text: '    speed = (left + right) // 2' },
      { no: 4, text: '    hours = sum(ceil(pile / speed) for pile in piles)' },
      { no: 5, text: '    if hours <= h:' },
      { no: 6, text: '        right = speed' },
      { no: 7, text: '    else:' },
      { no: 8, text: '        left = speed + 1' },
      { no: 9, text: 'return left' },
    ],
    steps: [
      {
        title: '速度越大，总耗时越短',
        description: '候选速度是 1 到 11。“能在 8 小时内吃完”会从 False 变成 True，目标是第一个 True。',
        codeLines: [1, 2],
        left: 0,
        right: 10,
        pass: 'FIRST TRUE',
        decision: '搜索最小可行速度',
      },
      {
        title: '速度 6 可行，尝试更慢',
        description: '以 6 根/小时计算，总耗时为 6 小时，不超过 h。6 可能是答案，但更小速度也可能可行，因此保留左半。',
        codeLines: [2, 3, 4, 5, 6],
        left: 0,
        right: 10,
        middle: 5,
        pass: 'CHECK k = 6',
        comparison: 'hours = 6 ≤ 8',
        decision: '可行，right = 6',
        hours: 6,
        feasible: true,
      },
      {
        title: '速度 3 不可行，排除更慢速度',
        description: '总耗时为 10 小时。由单调性可知速度 1、2、3 都不可能，left 直接跳到 4。',
        codeLines: [2, 3, 4, 5, 7, 8],
        left: 0,
        right: 5,
        middle: 2,
        pass: 'CHECK k = 3',
        comparison: 'hours = 10 > 8',
        decision: '不可行，left = 4',
        hours: 10,
        feasible: false,
      },
      {
        title: '速度 5 可行，继续压低上界',
        description: '速度 5 需要 8 小时，刚好可行。第一个 True 仍可能在左边，所以 right = 5。',
        codeLines: [2, 3, 4, 5, 6],
        left: 3,
        right: 5,
        middle: 4,
        pass: 'CHECK k = 5',
        comparison: 'hours = 8 ≤ 8',
        decision: '可行，right = 5',
        hours: 8,
        feasible: true,
      },
      {
        title: '速度 4 仍然可行',
        description: '速度 4 的总耗时也是 8 小时，因此 right 收缩到 4。此时左右边界相遇。',
        codeLines: [2, 3, 4, 5, 6],
        left: 3,
        right: 4,
        middle: 3,
        pass: 'CHECK k = 4',
        comparison: 'hours = 8 ≤ 8',
        decision: 'right = 4',
        hours: 8,
        feasible: true,
      },
      {
        title: '找到第一个可行速度 4',
        description: 'left == right == 4。速度 3 不可行而速度 4 可行，因此 4 正是最小答案。',
        codeLines: [2, 9],
        left: 3,
        right: 3,
        found: [3],
        pass: 'RESULT',
        result: 'minimum speed = 4',
        hours: 8,
        feasible: true,
      },
    ],
  },
}
