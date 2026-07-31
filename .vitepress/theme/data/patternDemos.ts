export interface DemoCodeLine {
  no: number
  text: string
}

export interface DemoTraceStep<State> {
  title: string
  description: string
  codeLines?: number[]
  state: State
}

export interface DemoConfig<State> {
  eyebrow: string
  title: string
  codeLines: DemoCodeLine[]
  steps: DemoTraceStep<State>[]
}

export type LinkedListDemoVariant =
  | 'reverse-k-group'
  | 'reverse-between'
  | 'reorder-list'

export interface LinkedListPointer {
  label: string
  node: number | null
  tone?: 'accent' | 'lime' | 'muted'
}

export interface LinkedListState {
  order: number[]
  active?: number[]
  settled?: number[]
  muted?: number[]
  group?: number[]
  dividerAfter?: number
  pointers: LinkedListPointer[]
  operation: string
}

export const linkedListDemos: Record<
  LinkedListDemoVariant,
  DemoConfig<LinkedListState>
> = {
  'reverse-k-group': {
    eyebrow: 'LINK LAB · GROUP REVERSAL',
    title: '一组一组翻转，连接关系如何保持完整',
    codeLines: [
      { no: 1, text: 'dummy = ListNode(0, head)' },
      { no: 2, text: 'group_previous = dummy' },
      { no: 3, text: 'while True:' },
      { no: 4, text: '    kth = get_kth(group_previous, k)' },
      { no: 5, text: '    if kth is None: break' },
      { no: 6, text: '    group_next = kth.next' },
      { no: 7, text: '    previous, current = group_next, group_previous.next' },
      { no: 8, text: '    while current is not group_next:' },
      { no: 9, text: '        following = current.next' },
      { no: 10, text: '        current.next = previous' },
      { no: 11, text: '        previous, current = current, following' },
      { no: 12, text: '    old_head = group_previous.next' },
      { no: 13, text: '    group_previous.next = kth' },
      { no: 14, text: '    group_previous = old_head' },
    ],
    steps: [
      {
        title: '先确认当前组确实有 k 个结点',
        description: '从 dummy 后面数到第 k 个结点。只有找到 kth，才允许开始改指针。',
        codeLines: [1, 2, 4],
        state: {
          order: [1, 2, 3, 4, 5],
          group: [1, 2],
          pointers: [
            { label: 'group_prev', node: null, tone: 'muted' },
            { label: 'kth', node: 2, tone: 'accent' },
          ],
          operation: '锁定第一组 [1, 2]，下一组入口是 3',
        },
      },
      {
        title: '保存组外的安全出口',
        description: 'group_next 指向 3。翻转过程中 previous 从组外开始，保证新尾结点最终能接回剩余链表。',
        codeLines: [6, 7],
        state: {
          order: [1, 2, 3, 4, 5],
          active: [1, 2],
          group: [1, 2],
          pointers: [
            { label: 'prev', node: 3, tone: 'lime' },
            { label: 'curr', node: 1, tone: 'accent' },
            { label: 'group_next', node: 3, tone: 'muted' },
          ],
          operation: '先把 1 的 next 改为 3，再继续处理 2',
        },
      },
      {
        title: '第一组完成局部翻转',
        description: '组内顺序变为 2 → 1，旧头 1 成为新尾并已经连接到 3。',
        codeLines: [8, 9, 10, 11],
        state: {
          order: [2, 1, 3, 4, 5],
          settled: [1, 2],
          group: [1, 2],
          pointers: [
            { label: 'new head', node: 2, tone: 'lime' },
            { label: 'old head', node: 1, tone: 'accent' },
          ],
          operation: 'dummy → 2 → 1 → 3，链表没有断开',
        },
      },
      {
        title: '把上一组的尾巴当作新哨兵',
        description: 'group_previous 移到旧头 1，下一轮从结点 3 开始检查第二组。',
        codeLines: [12, 13, 14, 4],
        state: {
          order: [2, 1, 3, 4, 5],
          settled: [1, 2],
          group: [3, 4],
          pointers: [
            { label: 'group_prev', node: 1, tone: 'muted' },
            { label: 'kth', node: 4, tone: 'accent' },
          ],
          operation: '锁定第二组 [3, 4]',
        },
      },
      {
        title: '第二组使用完全相同的动作',
        description: '3、4 翻转后连接到 5。最后不足 k 个的结点保持原顺序。',
        codeLines: [6, 7, 8, 10, 13, 14],
        state: {
          order: [2, 1, 4, 3, 5],
          settled: [1, 2, 3, 4],
          muted: [5],
          pointers: [
            { label: 'tail', node: 3, tone: 'accent' },
            { label: 'remain', node: 5, tone: 'muted' },
          ],
          operation: '最终结果：2 → 1 → 4 → 3 → 5',
        },
      },
    ],
  },
  'reverse-between': {
    eyebrow: 'LINK LAB · HEAD INSERTION',
    title: '头插法如何只翻转链表中间的一段',
    codeLines: [
      { no: 1, text: 'dummy = ListNode(0, head)' },
      { no: 2, text: 'previous = dummy' },
      { no: 3, text: 'for _ in range(left - 1):' },
      { no: 4, text: '    previous = previous.next' },
      { no: 5, text: 'current = previous.next' },
      { no: 6, text: 'for _ in range(right - left):' },
      { no: 7, text: '    moving = current.next' },
      { no: 8, text: '    current.next = moving.next' },
      { no: 9, text: '    moving.next = previous.next' },
      { no: 10, text: '    previous.next = moving' },
      { no: 11, text: 'return dummy.next' },
    ],
    steps: [
      {
        title: '让 previous 停在翻转区间前一位',
        description: '区间 [2, 4] 的前驱是结点 1。current 固定为区间旧头 2。',
        codeLines: [1, 2, 3, 4, 5],
        state: {
          order: [1, 2, 3, 4, 5],
          group: [2, 3, 4],
          pointers: [
            { label: 'prev', node: 1, tone: 'muted' },
            { label: 'curr', node: 2, tone: 'accent' },
          ],
          operation: '待翻转区间：[2, 3, 4]',
        },
      },
      {
        title: '摘下 current 后面的结点 3',
        description: '先令 2 直接连接 4，结点 3 暂时从原位置脱离。',
        codeLines: [6, 7, 8],
        state: {
          order: [1, 2, 4, 5, 3],
          active: [2, 3, 4],
          pointers: [
            { label: 'prev', node: 1, tone: 'muted' },
            { label: 'curr', node: 2, tone: 'accent' },
            { label: 'moving', node: 3, tone: 'lime' },
          ],
          operation: '2 → 4，moving = 3',
        },
      },
      {
        title: '把 3 插到区间最前面',
        description: '3 接到 2 前面，区间局部顺序变成 3 → 2 → 4。',
        codeLines: [9, 10],
        state: {
          order: [1, 3, 2, 4, 5],
          group: [2, 3, 4],
          settled: [3],
          pointers: [
            { label: 'prev', node: 1, tone: 'muted' },
            { label: 'curr', node: 2, tone: 'accent' },
          ],
          operation: '第一次头插完成：1 → 3 → 2 → 4 → 5',
        },
      },
      {
        title: '再次摘下 current 后面的结点 4',
        description: 'current 始终不动，继续把它后面的 4 摘下并插到区间最前面。',
        codeLines: [7, 8, 9, 10],
        state: {
          order: [1, 4, 3, 2, 5],
          group: [2, 3, 4],
          settled: [3, 4],
          pointers: [
            { label: 'prev', node: 1, tone: 'muted' },
            { label: 'curr', node: 2, tone: 'accent' },
            { label: 'moving', node: 4, tone: 'lime' },
          ],
          operation: '第二次头插完成：4 → 3 → 2',
        },
      },
      {
        title: '区间外的连接始终没有改变',
        description: '前缀 1 和后缀 5 都被保留，只重排了指定区间中的结点。',
        codeLines: [11],
        state: {
          order: [1, 4, 3, 2, 5],
          settled: [2, 3, 4],
          pointers: [
            { label: 'head', node: 1, tone: 'muted' },
            { label: 'tail', node: 5, tone: 'muted' },
          ],
          operation: '最终结果：1 → 4 → 3 → 2 → 5',
        },
      },
    ],
  },
  'reorder-list': {
    eyebrow: 'LINK LAB · SPLIT / REVERSE / WEAVE',
    title: '重排链表的三段式操作',
    codeLines: [
      { no: 1, text: 'slow = fast = head' },
      { no: 2, text: 'while fast and fast.next:' },
      { no: 3, text: '    slow, fast = slow.next, fast.next.next' },
      { no: 4, text: 'second = reverse(slow.next)' },
      { no: 5, text: 'slow.next = None' },
      { no: 6, text: 'first = head' },
      { no: 7, text: 'while second:' },
      { no: 8, text: '    first_next, second_next = first.next, second.next' },
      { no: 9, text: '    first.next = second' },
      { no: 10, text: '    second.next = first_next' },
      { no: 11, text: '    first, second = first_next, second_next' },
    ],
    steps: [
      {
        title: '快慢指针寻找中点',
        description: 'fast 每次走两步，slow 每次走一步。fast 到尾部时，slow 停在中点 3。',
        codeLines: [1, 2, 3],
        state: {
          order: [1, 2, 3, 4, 5],
          pointers: [
            { label: 'slow', node: 3, tone: 'accent' },
            { label: 'fast', node: 5, tone: 'lime' },
          ],
          operation: '链表即将从 3 和 4 之间断开',
        },
      },
      {
        title: '把链表切成前后两半',
        description: '第一段是 1 → 2 → 3，第二段是 4 → 5。',
        codeLines: [4, 5],
        state: {
          order: [1, 2, 3, 4, 5],
          dividerAfter: 3,
          active: [4, 5],
          pointers: [
            { label: 'first', node: 1, tone: 'muted' },
            { label: 'second', node: 4, tone: 'accent' },
          ],
          operation: '断开 slow.next，避免后续形成环',
        },
      },
      {
        title: '翻转后半段',
        description: '第二段由 4 → 5 变成 5 → 4，准备从链表尾部依次抽取结点。',
        codeLines: [4],
        state: {
          order: [1, 2, 3, 5, 4],
          dividerAfter: 3,
          settled: [4, 5],
          pointers: [
            { label: 'first', node: 1, tone: 'muted' },
            { label: 'second', node: 5, tone: 'lime' },
          ],
          operation: '两条链：1 → 2 → 3 ｜ 5 → 4',
        },
      },
      {
        title: '交替接入第一个尾部结点',
        description: '把 5 插入 1 与 2 之间，同时保存两条链各自的 next。',
        codeLines: [6, 7, 8, 9, 10],
        state: {
          order: [1, 5, 2, 3, 4],
          active: [1, 5, 2],
          pointers: [
            { label: 'first', node: 2, tone: 'accent' },
            { label: 'second', node: 4, tone: 'lime' },
          ],
          operation: '前缀已经固定为 1 → 5',
        },
      },
      {
        title: '继续交替编织两条链',
        description: '把 4 插入 2 与 3 之间，第二条链耗尽。',
        codeLines: [8, 9, 10, 11],
        state: {
          order: [1, 5, 2, 4, 3],
          settled: [1, 2, 4, 5],
          pointers: [
            { label: 'first', node: 3, tone: 'accent' },
            { label: 'second', node: null, tone: 'muted' },
          ],
          operation: '最终结果：1 → 5 → 2 → 4 → 3',
        },
      },
    ],
  },
}

export type GridSearchDemoVariant =
  | 'word-search'
  | 'number-of-islands'
  | 'max-area-of-island'
  | 'rotting-oranges'

export interface GridSearchState {
  active?: string
  path?: string[]
  visited?: string[]
  frontier?: string[]
  completed?: string[]
  failed?: string[]
  metricLabel: string
  metricValue: string
  queue?: string[]
  operation: string
}

export interface GridSearchConfig extends DemoConfig<GridSearchState> {
  board: string[][]
}

export const gridSearchDemos: Record<GridSearchDemoVariant, GridSearchConfig> = {
  'word-search': {
    eyebrow: 'GRID LAB · DFS + BACKTRACK',
    title: '单词搜索怎样走路，又怎样撤销选择',
    board: [
      ['A', 'B', 'C', 'E'],
      ['S', 'F', 'C', 'S'],
      ['A', 'D', 'E', 'E'],
    ],
    codeLines: [
      { no: 1, text: 'def dfs(row, column, index):' },
      { no: 2, text: '    if index == len(word): return True' },
      { no: 3, text: '    if out_of_range or board[row][column] != word[index]:' },
      { no: 4, text: '        return False' },
      { no: 5, text: '    char = board[row][column]' },
      { no: 6, text: '    board[row][column] = \"#\"' },
      { no: 7, text: '    found = any(dfs(next_row, next_col, index + 1))' },
      { no: 8, text: '    board[row][column] = char' },
      { no: 9, text: '    return found' },
    ],
    steps: [
      {
        title: '从第一个匹配 A 的格子出发',
        description: '目标是 ABCCED。路径中的格子临时标记为已使用，当前递归层匹配下标 0。',
        codeLines: [1, 3, 5, 6],
        state: {
          active: '0-0',
          path: ['0-0'],
          metricLabel: 'MATCH',
          metricValue: 'A',
          operation: 'A ✓，下一步寻找相邻的 B',
        },
      },
      {
        title: '向右找到 B，再找到 C',
        description: '递归只允许上下左右移动，并且不能重复使用已经在路径上的格子。',
        codeLines: [7],
        state: {
          active: '0-2',
          path: ['0-0', '0-1', '0-2'],
          visited: ['0-0', '0-1'],
          metricLabel: 'PREFIX',
          metricValue: 'ABC',
          operation: '当前路径：(0,0) → (0,1) → (0,2)',
        },
      },
      {
        title: '第二个 C 只能向下走',
        description: '上、左已经使用，右侧 E 与目标 C 不符，因此选择下方的 C。',
        codeLines: [3, 4, 7],
        state: {
          active: '1-2',
          path: ['0-0', '0-1', '0-2', '1-2'],
          failed: ['0-3'],
          metricLabel: 'PREFIX',
          metricValue: 'ABCC',
          operation: '错误邻居会立即返回 False',
        },
      },
      {
        title: '沿着 E、D 完成整个单词',
        description: '从第二个 C 向下到 E，再向左到 D，index 到达单词长度。',
        codeLines: [2, 7],
        state: {
          active: '2-1',
          path: ['0-0', '0-1', '0-2', '1-2', '2-2', '2-1'],
          completed: ['0-0', '0-1', '0-2', '1-2', '2-2', '2-1'],
          metricLabel: 'WORD',
          metricValue: 'ABCCED',
          operation: '找到完整路径，逐层返回 True',
        },
      },
      {
        title: '回溯时恢复棋盘',
        description: '无论成功或失败，每一层离开前都恢复字符，保证其他起点看到原始棋盘。',
        codeLines: [8, 9],
        state: {
          visited: [],
          metricLabel: 'RESULT',
          metricValue: 'True',
          operation: '临时标记全部撤销，输入不被修改',
        },
      },
    ],
  },
  'number-of-islands': {
    eyebrow: 'GRID LAB · CONNECTED COMPONENTS',
    title: '一次 DFS 为什么只会数到一座岛',
    board: [
      ['1', '1', '0', '0', '0'],
      ['1', '1', '0', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '0', '0', '1', '1'],
    ],
    codeLines: [
      { no: 1, text: 'island_count = 0' },
      { no: 2, text: 'for row in range(rows):' },
      { no: 3, text: '    for column in range(columns):' },
      { no: 4, text: '        if grid[row][column] != \"1\": continue' },
      { no: 5, text: '        island_count += 1' },
      { no: 6, text: '        grid[row][column] = \"0\"' },
      { no: 7, text: '        stack = [(row, column)]' },
      { no: 8, text: '        while stack:' },
      { no: 9, text: '            current_row, current_column = stack.pop()' },
      { no: 10, text: '            for next_cell in neighbors:' },
      { no: 11, text: '                mark_water_and_push(next_cell)' },
    ],
    steps: [
      {
        title: '扫描到第一块尚未访问的陆地',
        description: '只有在主循环遇到新陆地时 island_count 才加一，随后显式栈负责淹没整座岛。',
        codeLines: [1, 2, 3, 4, 5, 6, 7],
        state: {
          active: '0-0',
          frontier: ['0-0'],
          metricLabel: 'ISLANDS',
          metricValue: '1',
          operation: '从 (0,0) 启动第一次洪水填充',
        },
      },
      {
        title: '显式栈扩散到所有相邻陆地',
        description: '相邻陆地入栈前就标记为水，保证每一格最多入栈一次。',
        codeLines: [8, 9, 10, 11],
        state: {
          active: '1-1',
          visited: ['0-0', '0-1', '1-0'],
          frontier: ['1-1'],
          metricLabel: 'ISLANDS',
          metricValue: '1',
          operation: '第一座岛的四个格子属于同一连通分量',
        },
      },
      {
        title: '第一座岛已经完整标记',
        description: '主循环继续扫描时，这四格都已访问，不会重复计数。',
        codeLines: [2, 3, 4],
        state: {
          completed: ['0-0', '0-1', '1-0', '1-1'],
          active: '2-2',
          metricLabel: 'ISLANDS',
          metricValue: '2',
          operation: '在 (2,2) 遇到第二个新连通分量',
        },
      },
      {
        title: '第三次 DFS 覆盖右下角岛屿',
        description: '右下两个陆地相邻，因此只增加一次计数。',
        codeLines: [5, 6, 7, 8, 9, 10, 11],
        state: {
          completed: ['0-0', '0-1', '1-0', '1-1', '2-2'],
          active: '3-3',
          frontier: ['3-3', '3-4'],
          metricLabel: 'ISLANDS',
          metricValue: '3',
          operation: '(3,3) 与 (3,4) 被同一次 DFS 消化',
        },
      },
      {
        title: '扫描结束得到连通分量数量',
        description: '每个陆地格子最多访问一次，网格上的所有陆地都已归属某座岛。',
        codeLines: [2, 3],
        state: {
          completed: ['0-0', '0-1', '1-0', '1-1', '2-2', '3-3', '3-4'],
          metricLabel: 'RESULT',
          metricValue: '3',
          operation: '共找到 3 座岛',
        },
      },
    ],
  },
  'max-area-of-island': {
    eyebrow: 'GRID LAB · AREA ACCUMULATION',
    title: '显式栈如何累计一整座岛的面积',
    board: [
      ['0', '1', '1', '0', '0'],
      ['0', '1', '0', '1', '1'],
      ['1', '1', '0', '1', '0'],
      ['0', '0', '0', '1', '1'],
    ],
    codeLines: [
      { no: 1, text: 'maximum_area = 0' },
      { no: 2, text: 'for each unvisited land:' },
      { no: 3, text: '    grid[row][column] = 0' },
      { no: 4, text: '    stack = [(row, column)]' },
      { no: 5, text: '    current_area = 0' },
      { no: 6, text: '    while stack:' },
      { no: 7, text: '        current_cell = stack.pop()' },
      { no: 8, text: '        current_area += 1' },
      { no: 9, text: '        mark_and_push_unvisited_neighbors()' },
      { no: 10, text: '    maximum_area = max(maximum_area, current_area)' },
    ],
    steps: [
      {
        title: '面积从起点的一格开始',
        description: '遇到新岛屿后建立显式栈，面积从 0 开始，在结点出栈时累计。',
        codeLines: [1, 2, 3, 4, 5],
        state: {
          active: '0-1',
          frontier: ['0-1'],
          metricLabel: 'AREA',
          metricValue: '1',
          operation: '第一座岛从 (0,1) 开始',
        },
      },
      {
        title: '每弹出一个陆地，面积增加一',
        description: '相邻陆地入栈前已经标记，因此每个连通格子恰好贡献一次面积。',
        codeLines: [6, 7, 8, 9],
        state: {
          active: '2-1',
          visited: ['0-1', '0-2', '1-1'],
          frontier: ['2-1', '2-0'],
          metricLabel: 'AREA',
          metricValue: '5',
          operation: '第一座岛最终面积为 5',
        },
      },
      {
        title: '用本岛面积更新全局最大值',
        description: '一次 DFS 完成后再与 answer 比较，面积统计不会与下一座岛混在一起。',
        codeLines: [10],
        state: {
          completed: ['0-1', '0-2', '1-1', '2-1', '2-0'],
          metricLabel: 'MAX AREA',
          metricValue: '5',
          operation: 'answer = max(0, 5)',
        },
      },
      {
        title: '继续搜索第二座岛',
        description: '右侧岛屿同样独立累计，不需要保存所有岛屿面积。',
        codeLines: [2, 3, 4, 5, 6, 7, 8, 9],
        state: {
          completed: ['0-1', '0-2', '1-1', '2-1', '2-0'],
          active: '3-4',
          visited: ['1-3', '1-4', '2-3', '3-3'],
          frontier: ['3-4'],
          metricLabel: 'AREA',
          metricValue: '5',
          operation: '第二座岛面积也为 5',
        },
      },
      {
        title: '最终答案只保留最大面积',
        description: '每个格子最多访问一次，额外状态只来自递归栈。',
        codeLines: [10],
        state: {
          completed: ['0-1', '0-2', '1-1', '2-1', '2-0', '1-3', '1-4', '2-3', '3-3', '3-4'],
          metricLabel: 'RESULT',
          metricValue: '5',
          operation: '最大岛屿面积为 5',
        },
      },
    ],
  },
  'rotting-oranges': {
    eyebrow: 'GRID LAB · MULTI-SOURCE BFS',
    title: '多源 BFS 怎样一层代表一分钟',
    board: [
      ['2', '1', '1'],
      ['1', '1', '0'],
      ['0', '1', '1'],
    ],
    codeLines: [
      { no: 1, text: 'queue = deque(all_rotten_oranges)' },
      { no: 2, text: 'fresh = count_fresh_oranges()' },
      { no: 3, text: 'minutes = 0' },
      { no: 4, text: 'while queue and fresh > 0:' },
      { no: 5, text: '    for _ in range(len(queue)):' },
      { no: 6, text: '        row, column = queue.popleft()' },
      { no: 7, text: '        for neighbor in neighbors:' },
      { no: 8, text: '            if neighbor is fresh:' },
      { no: 9, text: '                mark_rotten_and_enqueue(neighbor)' },
      { no: 10, text: '                fresh -= 1' },
      { no: 11, text: '    minutes += 1' },
    ],
    steps: [
      {
        title: '所有腐烂橘子同时进入队列',
        description: '它们是同一分钟的多个传播源，不能逐个源分别做 BFS。',
        codeLines: [1, 2, 3],
        state: {
          active: '0-0',
          frontier: ['0-0'],
          queue: ['(0,0)'],
          metricLabel: 'MINUTE',
          metricValue: '0',
          operation: '新鲜橘子还剩 6 个',
        },
      },
      {
        title: '处理当前层，感染距离为 1 的格子',
        description: '进入本轮时先固定 queue 的长度，新增橘子只能留到下一分钟处理。',
        codeLines: [4, 5, 6, 7, 8, 9, 10],
        state: {
          completed: ['0-0'],
          frontier: ['0-1', '1-0'],
          queue: ['(0,1)', '(1,0)'],
          metricLabel: 'MINUTE',
          metricValue: '1',
          operation: '本轮感染 2 个，fresh = 4',
        },
      },
      {
        title: '第二层从两个位置同时扩散',
        description: '同一层的节点拥有相同最短时间，BFS 天然按分钟推进。',
        codeLines: [5, 6, 7, 9, 11],
        state: {
          completed: ['0-0', '0-1', '1-0'],
          frontier: ['0-2', '1-1'],
          queue: ['(0,2)', '(1,1)'],
          metricLabel: 'MINUTE',
          metricValue: '2',
          operation: 'fresh = 2',
        },
      },
      {
        title: '继续沿唯一通道传播',
        description: '障碍 0 不进入队列，第三分钟只能感染 (2,1)。',
        codeLines: [7, 8, 9, 10, 11],
        state: {
          completed: ['0-0', '0-1', '1-0', '0-2', '1-1'],
          frontier: ['2-1'],
          queue: ['(2,1)'],
          metricLabel: 'MINUTE',
          metricValue: '3',
          operation: 'fresh = 1',
        },
      },
      {
        title: '最后一个新鲜橘子被感染',
        description: 'fresh 变成 0 后立即结束，不必继续处理已经腐烂的队列。',
        codeLines: [9, 10, 11],
        state: {
          completed: ['0-0', '0-1', '1-0', '0-2', '1-1', '2-1', '2-2'],
          active: '2-2',
          queue: ['(2,2)'],
          metricLabel: 'RESULT',
          metricValue: '4 min',
          operation: '所有橘子腐烂所需最短时间为 4',
        },
      },
    ],
  },
}

export type DpTableDemoVariant =
  | 'longest-palindrome'
  | 'edit-distance'
  | 'maximal-square'
  | 'repeated-subarray'
  | 'longest-common-subsequence'

export interface DpTableState {
  values: Array<Array<string | number | null>>
  active?: string
  sources?: string[]
  highlights?: string[]
  best: string
  formula: string
}

export interface DpTableConfig extends DemoConfig<DpTableState> {
  rowLabels: string[]
  columnLabels: string[]
  cornerLabel: string
}

export const dpTableDemos: Record<DpTableDemoVariant, DpTableConfig> = {
  'longest-palindrome': {
    eyebrow: 'DP LAB · INTERVAL TABLE',
    title: '回文状态为什么要按区间长度填表',
    cornerLabel: 'i\\j',
    rowLabels: ['b₀', 'a₁', 'b₂', 'a₃', 'd₄'],
    columnLabels: ['b₀', 'a₁', 'b₂', 'a₃', 'd₄'],
    codeLines: [
      { no: 1, text: 'dp = [[False] * n for _ in range(n)]' },
      { no: 2, text: 'for i in range(n): dp[i][i] = True' },
      { no: 3, text: 'for length in range(2, n + 1):' },
      { no: 4, text: '    for left in range(n - length + 1):' },
      { no: 5, text: '        right = left + length - 1' },
      { no: 6, text: '        if s[left] == s[right]:' },
      { no: 7, text: '            dp[left][right] = length == 2 or dp[left + 1][right - 1]' },
      { no: 8, text: '            if dp[left][right]: update_answer()' },
    ],
    steps: [
      {
        title: '长度为 1 的子串天然是回文',
        description: '先填主对角线，这也是更长区间向内查询时的基础状态。',
        codeLines: [1, 2],
        state: {
          values: [
            ['✓', null, null, null, null],
            [null, '✓', null, null, null],
            [null, null, '✓', null, null],
            [null, null, null, '✓', null],
            [null, null, null, null, '✓'],
          ],
          highlights: ['0-0', '1-1', '2-2', '3-3', '4-4'],
          best: 'b',
          formula: 'dp[i][i] = True',
        },
      },
      {
        title: '按长度 2 检查相邻字符',
        description: '长度为 2 时没有内部区间，只需判断左右字符是否相等。',
        codeLines: [3, 4, 5, 6, 7],
        state: {
          values: [
            ['✓', '×', null, null, null],
            [null, '✓', '×', null, null],
            [null, null, '✓', '×', null],
            [null, null, null, '✓', '×'],
            [null, null, null, null, '✓'],
          ],
          active: '3-4',
          sources: ['3-3', '4-4'],
          best: 'b',
          formula: 's[i] == s[j]',
        },
      },
      {
        title: '长度为 3 时复用内部区间',
        description: '区间 bab 两端都是 b，内部 a 已知为回文，所以整个区间为回文。',
        codeLines: [6, 7, 8],
        state: {
          values: [
            ['✓', '×', '✓', null, null],
            [null, '✓', '×', '✓', null],
            [null, null, '✓', '×', '×'],
            [null, null, null, '✓', '×'],
            [null, null, null, null, '✓'],
          ],
          active: '0-2',
          sources: ['1-1'],
          highlights: ['0-2', '1-3'],
          best: 'bab',
          formula: 's[0] == s[2] and dp[1][1]',
        },
      },
      {
        title: '更长区间依赖更短区间',
        description: '按长度递增保证 dp[i+1][j-1] 在使用前已经计算完成。',
        codeLines: [3, 4, 5, 7],
        state: {
          values: [
            ['✓', '×', '✓', '×', '×'],
            [null, '✓', '×', '✓', '×'],
            [null, null, '✓', '×', '×'],
            [null, null, null, '✓', '×'],
            [null, null, null, null, '✓'],
          ],
          active: '0-4',
          sources: ['1-3'],
          highlights: ['0-2', '1-3'],
          best: 'bab',
          formula: '两端不同 ⇒ False',
        },
      },
      {
        title: '所有候选区间都已覆盖',
        description: '最长回文可以是 bab 或 aba；当前实现保留最先遇到的 bab。',
        codeLines: [8],
        state: {
          values: [
            ['✓', '×', '✓', '×', '×'],
            [null, '✓', '×', '✓', '×'],
            [null, null, '✓', '×', '×'],
            [null, null, null, '✓', '×'],
            [null, null, null, null, '✓'],
          ],
          highlights: ['0-2'],
          best: 'bab',
          formula: 'answer = s[0:3]',
        },
      },
    ],
  },
  'edit-distance': {
    eyebrow: 'DP LAB · PREFIX TRANSFORMATION',
    title: '编辑距离的一格如何从三个方向得来',
    cornerLabel: '↘',
    rowLabels: ['∅', 'h', 'o', 'r', 's', 'e'],
    columnLabels: ['∅', 'r', 'o', 's'],
    codeLines: [
      { no: 1, text: 'dp = [[0] * (n + 1) for _ in range(m + 1)]' },
      { no: 2, text: 'dp[row][0] = row' },
      { no: 3, text: 'dp[0][column] = column' },
      { no: 4, text: 'for row in range(1, m + 1):' },
      { no: 5, text: '    for column in range(1, n + 1):' },
      { no: 6, text: '        if word1[row - 1] == word2[column - 1]:' },
      { no: 7, text: '            dp[row][column] = dp[row - 1][column - 1]' },
      { no: 8, text: '        else:' },
      { no: 9, text: '            dp[row][column] = 1 + min(delete, insert, replace)' },
    ],
    steps: [
      {
        title: '空串边界表示连续插入或删除',
        description: 'horse 变成空串需要逐个删除；空串变成 ros 需要逐个插入。',
        codeLines: [1, 2, 3],
        state: {
          values: [
            [0, 1, 2, 3],
            [1, null, null, null],
            [2, null, null, null],
            [3, null, null, null],
            [4, null, null, null],
            [5, null, null, null],
          ],
          highlights: ['0-0', '0-1', '0-2', '0-3', '1-0', '2-0', '3-0', '4-0', '5-0'],
          best: '初始化',
          formula: 'dp[i][0] = i, dp[0][j] = j',
        },
      },
      {
        title: 'h 与 r 不同，选择三种操作最小值',
        description: '左、上、左上分别对应插入、删除、替换，取最小值再加一。',
        codeLines: [4, 5, 6, 8, 9],
        state: {
          values: [
            [0, 1, 2, 3],
            [1, 1, 2, 3],
            [2, null, null, null],
            [3, null, null, null],
            [4, null, null, null],
            [5, null, null, null],
          ],
          active: '1-1',
          sources: ['0-0', '0-1', '1-0'],
          best: '1',
          formula: '1 + min(1, 1, 0) = 1',
        },
      },
      {
        title: '相同字符直接继承左上角',
        description: '处理 ho 与 ro 时，末尾字符 o 相同，不需要新增操作。',
        codeLines: [6, 7],
        state: {
          values: [
            [0, 1, 2, 3],
            [1, 1, 2, 3],
            [2, 2, 1, 2],
            [3, null, null, null],
            [4, null, null, null],
            [5, null, null, null],
          ],
          active: '2-2',
          sources: ['1-1'],
          highlights: ['2-2'],
          best: '1',
          formula: 'o == o ⇒ dp[2][2] = dp[1][1]',
        },
      },
      {
        title: '逐行填满所有前缀组合',
        description: '每个状态只依赖左、上、左上，因此按行或按列遍历都满足依赖顺序。',
        codeLines: [4, 5, 9],
        state: {
          values: [
            [0, 1, 2, 3],
            [1, 1, 2, 3],
            [2, 2, 1, 2],
            [3, 2, 2, 2],
            [4, 3, 3, 2],
            [5, 4, 4, 3],
          ],
          active: '5-3',
          sources: ['4-2', '4-3', '5-2'],
          best: '3',
          formula: 'horse → ros',
        },
      },
      {
        title: '右下角就是完整字符串的答案',
        description: 'horse 经过替换 h→r、删除 r、删除 e，共 3 步变为 ros。',
        codeLines: [9],
        state: {
          values: [
            [0, 1, 2, 3],
            [1, 1, 2, 3],
            [2, 2, 1, 2],
            [3, 2, 2, 2],
            [4, 3, 3, 2],
            [5, 4, 4, 3],
          ],
          highlights: ['5-3'],
          best: '3',
          formula: 'answer = dp[5][3]',
        },
      },
    ],
  },
  'maximal-square': {
    eyebrow: 'DP LAB · SQUARE GROWTH',
    title: '一个格子怎样决定右下角正方形边长',
    cornerLabel: 'DP',
    rowLabels: ['0', '1', '2', '3'],
    columnLabels: ['0', '1', '2', '3', '4'],
    codeLines: [
      { no: 1, text: 'dp = [[0] * (columns + 1) for _ in range(rows + 1)]' },
      { no: 2, text: 'maximum_side = 0' },
      { no: 3, text: 'for row in range(1, rows + 1):' },
      { no: 4, text: '    for column in range(1, columns + 1):' },
      { no: 5, text: '        if matrix[row - 1][column - 1] == \"1\":' },
      { no: 6, text: '            dp[row][column] = 1 + min(top, left, diagonal)' },
      { no: 7, text: '            maximum_side = max(maximum_side, dp[row][column])' },
    ],
    steps: [
      {
        title: 'dp 表示以当前位置为右下角的最大边长',
        description: '原矩阵为 1 时才可能形成正方形，第一行最多只能得到边长 1。',
        codeLines: [1, 2, 3, 4, 5],
        state: {
          values: [
            [1, 0, 1, 0, 0],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null],
          ],
          highlights: ['0-0', '0-2'],
          best: 'side = 1',
          formula: 'matrix[r][c] == 1',
        },
      },
      {
        title: '三个方向都至少为 1 才能扩成 2×2',
        description: '上、左、左上共同限制正方形边长，短板决定能扩多大。',
        codeLines: [5, 6, 7],
        state: {
          values: [
            [1, 0, 1, 0, 0],
            [1, 0, 1, 1, 1],
            [1, 1, 1, 2, 2],
            [null, null, null, null, null],
          ],
          active: '2-3',
          sources: ['1-2', '1-3', '2-2'],
          highlights: ['1-2', '1-3', '2-2', '2-3'],
          best: 'side = 2',
          formula: '1 + min(1, 1, 1) = 2',
        },
      },
      {
        title: '相邻位置也能形成另一个 2×2',
        description: '状态记录的是右下角，不需要枚举每个正方形的左上角。',
        codeLines: [6, 7],
        state: {
          values: [
            [1, 0, 1, 0, 0],
            [1, 0, 1, 1, 1],
            [1, 1, 1, 2, 2],
            [1, 0, 0, 1, 0],
          ],
          active: '2-4',
          sources: ['1-3', '1-4', '2-3'],
          highlights: ['1-3', '1-4', '2-3', '2-4'],
          best: 'side = 2',
          formula: '1 + min(1, 2, 1) = 2',
        },
      },
      {
        title: '最大面积等于最大边长的平方',
        description: '遍历结束只需保存最大边长，不必保存正方形的全部坐标。',
        codeLines: [7],
        state: {
          values: [
            [1, 0, 1, 0, 0],
            [1, 0, 1, 1, 1],
            [1, 1, 1, 2, 2],
            [1, 0, 0, 1, 0],
          ],
          highlights: ['2-3'],
          best: 'area = 4',
          formula: 'maximum_side² = 2²',
        },
      },
    ],
  },
  'repeated-subarray': {
    eyebrow: 'DP LAB · SUFFIX MATCH',
    title: '最长重复子数组为什么从左上角延伸',
    cornerLabel: '↘',
    rowLabels: ['1', '2', '3', '2', '1'],
    columnLabels: ['3', '2', '1', '4', '7'],
    codeLines: [
      { no: 1, text: 'dp = [[0] * (n + 1) for _ in range(m + 1)]' },
      { no: 2, text: 'answer = 0' },
      { no: 3, text: 'for row in range(1, m + 1):' },
      { no: 4, text: '    for column in range(1, n + 1):' },
      { no: 5, text: '        if nums1[row - 1] == nums2[column - 1]:' },
      { no: 6, text: '            dp[row][column] = dp[row - 1][column - 1] + 1' },
      { no: 7, text: '            answer = max(answer, dp[row][column])' },
    ],
    steps: [
      {
        title: '相等元素可以开始长度为 1 的公共后缀',
        description: 'nums1[0] = 1 与 nums2[2] = 1 相等，因此当前匹配长度是 1。',
        codeLines: [1, 2, 3, 4, 5, 6],
        state: {
          values: [
            [0, 0, 1, 0, 0],
            [0, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null],
          ],
          active: '0-2',
          best: '1',
          formula: '0 + 1',
        },
      },
      {
        title: '连续匹配必须沿左上方向继承',
        description: '2 与 2 相等，但前一个位置并不连续匹配时，长度仍然只能从 1 开始。',
        codeLines: [5, 6, 7],
        state: {
          values: [
            [0, 0, 1, 0, 0],
            [0, 1, 0, 0, 0],
            [1, 0, 0, 0, 0],
            [0, 1, 0, 0, 0],
            [0, 0, null, null, null],
          ],
          active: '3-1',
          sources: ['2-0'],
          best: '1',
          formula: 'dp[3][1] = dp[2][0] + 1',
        },
      },
      {
        title: '匹配链从 3 开始向右下延伸',
        description: '公共连续片段 [3,2,1] 对应表格中的一条右下对角线。',
        codeLines: [5, 6, 7],
        state: {
          values: [
            [0, 0, 1, 0, 0],
            [0, 1, 0, 0, 0],
            [1, 0, 0, 0, 0],
            [0, 2, 0, 0, 0],
            [0, 0, 3, 0, 0],
          ],
          active: '4-2',
          sources: ['3-1'],
          highlights: ['2-0', '3-1', '4-2'],
          best: '3',
          formula: '2 + 1 = 3',
        },
      },
      {
        title: '不相等时当前连续长度归零',
        description: '这里不能从上或左继承，否则会把不连续的元素拼在一起。',
        codeLines: [4, 5],
        state: {
          values: [
            [0, 0, 1, 0, 0],
            [0, 1, 0, 0, 0],
            [1, 0, 0, 0, 0],
            [0, 2, 0, 0, 0],
            [0, 0, 3, 0, 0],
          ],
          active: '4-3',
          highlights: ['2-0', '3-1', '4-2'],
          best: '3',
          formula: '1 != 4 ⇒ 0',
        },
      },
      {
        title: '最大单元格就是最长连续匹配',
        description: '答案 3 对应公共子数组 [3, 2, 1]。',
        codeLines: [7],
        state: {
          values: [
            [0, 0, 1, 0, 0],
            [0, 1, 0, 0, 0],
            [1, 0, 0, 0, 0],
            [0, 2, 0, 0, 0],
            [0, 0, 3, 0, 0],
          ],
          highlights: ['2-0', '3-1', '4-2'],
          best: '3',
          formula: '[3, 2, 1]',
        },
      },
    ],
  },
  'longest-common-subsequence': {
    eyebrow: 'DP LAB · TWO PREFIXES',
    title: '最长公共子序列如何在两个前缀间选择',
    cornerLabel: '↘',
    rowLabels: ['a', 'b', 'c', 'd', 'e'],
    columnLabels: ['a', 'c', 'e'],
    codeLines: [
      { no: 1, text: 'dp = [[0] * (n + 1) for _ in range(m + 1)]' },
      { no: 2, text: 'for row in range(1, m + 1):' },
      { no: 3, text: '    for column in range(1, n + 1):' },
      { no: 4, text: '        if text1[row - 1] == text2[column - 1]:' },
      { no: 5, text: '            dp[row][column] = dp[row - 1][column - 1] + 1' },
      { no: 6, text: '        else:' },
      { no: 7, text: '            dp[row][column] = max(dp[row - 1][column], dp[row][column - 1])' },
    ],
    steps: [
      {
        title: '首字符相同，公共长度增加一',
        description: 'a 与 a 匹配，状态从左上角空前缀继承并加一。',
        codeLines: [1, 2, 3, 4, 5],
        state: {
          values: [
            [1, 1, 1],
            [1, null, null],
            [null, null, null],
            [null, null, null],
            [null, null, null],
          ],
          active: '0-0',
          best: '1',
          formula: '0 + 1',
        },
      },
      {
        title: '字符不同，丢掉一侧末尾再比较',
        description: 'b 与 c 不同，最优答案来自上方或左方较大的状态。',
        codeLines: [4, 6, 7],
        state: {
          values: [
            [1, 1, 1],
            [1, 1, 1],
            [1, null, null],
            [null, null, null],
            [null, null, null],
          ],
          active: '1-1',
          sources: ['0-1', '1-0'],
          best: '1',
          formula: 'max(1, 1)',
        },
      },
      {
        title: '遇到 c 后匹配长度变为 2',
        description: 'c 与 c 相同，公共子序列从 a 延伸为 ac。',
        codeLines: [4, 5],
        state: {
          values: [
            [1, 1, 1],
            [1, 1, 1],
            [1, 2, 2],
            [1, null, null],
            [null, null, null],
          ],
          active: '2-1',
          sources: ['1-0'],
          highlights: ['0-0', '2-1'],
          best: '2',
          formula: '1 + 1 = 2',
        },
      },
      {
        title: '不匹配状态传播已有最优值',
        description: 'd 不在 text2 中，但此前得到的 ac 仍然是当前前缀的最优答案。',
        codeLines: [6, 7],
        state: {
          values: [
            [1, 1, 1],
            [1, 1, 1],
            [1, 2, 2],
            [1, 2, 2],
            [1, 2, null],
          ],
          active: '3-2',
          sources: ['2-2', '3-1'],
          best: '2',
          formula: 'max(2, 2)',
        },
      },
      {
        title: '最后匹配 e，得到完整答案 ace',
        description: '右下角记录两个完整字符串的最长公共子序列长度。',
        codeLines: [4, 5],
        state: {
          values: [
            [1, 1, 1],
            [1, 1, 1],
            [1, 2, 2],
            [1, 2, 2],
            [1, 2, 3],
          ],
          active: '4-2',
          sources: ['3-1'],
          highlights: ['0-0', '2-1', '4-2'],
          best: '3',
          formula: 'LCS = ace',
        },
      },
    ],
  },
}

export type StackQueueDemoVariant =
  | 'valid-parentheses'
  | 'sliding-window-maximum'
  | 'decode-string'
  | 'daily-temperatures'

export interface StackQueueState {
  cursor: number
  stack: string[]
  stackLabel: string
  window?: [number, number]
  active?: number[]
  removed?: string[]
  output: string[]
  metric: string
  operation: string
}

export interface StackQueueConfig extends DemoConfig<StackQueueState> {
  input: string[]
}

export const stackQueueDemos: Record<StackQueueDemoVariant, StackQueueConfig> = {
  'valid-parentheses': {
    eyebrow: 'STACK LAB · EXPECTED CLOSERS',
    title: '栈顶为什么代表下一个必须匹配的括号',
    input: ['{', '[', '(', ')', ']', '}'],
    codeLines: [
      { no: 1, text: 'stack = []' },
      { no: 2, text: 'pairs = {\"(\": \")\", \"[\": \"]\", \"{\": \"}\"}' },
      { no: 3, text: 'for char in s:' },
      { no: 4, text: '    if char in pairs:' },
      { no: 5, text: '        stack.append(pairs[char])' },
      { no: 6, text: '    elif not stack or stack.pop() != char:' },
      { no: 7, text: '        return False' },
      { no: 8, text: 'return not stack' },
    ],
    steps: [
      {
        title: '读到左括号时压入期望的右括号',
        description: '遇到 {，真正需要记住的是未来必须出现的 }。',
        codeLines: [1, 2, 3, 4, 5],
        state: {
          cursor: 0,
          stack: ['}'],
          stackLabel: 'EXPECTED',
          output: [],
          metric: 'depth = 1',
          operation: 'push \"}\"',
        },
      },
      {
        title: '嵌套越深，期望越后进先出',
        description: '[ 和 ( 依次进入，最近打开的括号必须最先关闭。',
        codeLines: [3, 4, 5],
        state: {
          cursor: 2,
          stack: ['}', ']', ')'],
          stackLabel: 'EXPECTED',
          output: [],
          metric: 'depth = 3',
          operation: '栈顶期望 \")\"',
        },
      },
      {
        title: '右括号必须与栈顶相同',
        description: '当前字符 ) 与栈顶期望一致，弹出后继续检查外层。',
        codeLines: [6],
        state: {
          cursor: 3,
          stack: ['}', ']'],
          stackLabel: 'EXPECTED',
          removed: [')'],
          output: ['() ✓'],
          metric: 'matched',
          operation: 'pop \")\"',
        },
      },
      {
        title: '外层括号按相反顺序闭合',
        description: '] 匹配后只剩最外层的 }。',
        codeLines: [6],
        state: {
          cursor: 4,
          stack: ['}'],
          stackLabel: 'EXPECTED',
          removed: [')', ']'],
          output: ['() ✓', '[] ✓'],
          metric: 'depth = 1',
          operation: 'pop \"]\"',
        },
      },
      {
        title: '扫描结束且栈为空才有效',
        description: '最后一个 } 匹配，既没有多余右括号，也没有未闭合左括号。',
        codeLines: [6, 8],
        state: {
          cursor: 5,
          stack: [],
          stackLabel: 'EXPECTED',
          removed: [')', ']', '}'],
          output: ['() ✓', '[] ✓', '{} ✓'],
          metric: 'True',
          operation: 'stack is empty',
        },
      },
    ],
  },
  'sliding-window-maximum': {
    eyebrow: 'DEQUE LAB · MONOTONIC CANDIDATES',
    title: '单调队列为什么能随时给出窗口最大值',
    input: ['1', '3', '-1', '-3', '5', '3', '6', '7'],
    codeLines: [
      { no: 1, text: 'queue = deque()' },
      { no: 2, text: 'for right, value in enumerate(nums):' },
      { no: 3, text: '    while queue and nums[queue[-1]] <= value:' },
      { no: 4, text: '        queue.pop()' },
      { no: 5, text: '    queue.append(right)' },
      { no: 6, text: '    if queue[0] <= right - k: queue.popleft()' },
      { no: 7, text: '    if right >= k - 1: answer.append(nums[queue[0]])' },
    ],
    steps: [
      {
        title: '队列只保存仍可能成为最大值的下标',
        description: '1 入队后，队首和队尾都是下标 0。',
        codeLines: [1, 2, 5],
        state: {
          cursor: 0,
          stack: ['1@0'],
          stackLabel: 'DEQUE · HIGH → LOW',
          window: [0, 0],
          output: [],
          metric: 'front = 1',
          operation: 'append index 0',
        },
      },
      {
        title: '更大的新元素淘汰队尾小元素',
        description: '3 比 1 大，而且寿命更长，1 不可能再成为后续窗口最大值。',
        codeLines: [3, 4, 5],
        state: {
          cursor: 1,
          stack: ['3@1'],
          stackLabel: 'DEQUE · HIGH → LOW',
          window: [0, 1],
          removed: ['1@0'],
          output: [],
          metric: 'front = 3',
          operation: 'pop 1, append 3',
        },
      },
      {
        title: '第一个完整窗口产生答案',
        description: '-1 小于队尾 3，保留为后备候选；队首 3 就是窗口最大值。',
        codeLines: [3, 5, 7],
        state: {
          cursor: 2,
          stack: ['3@1', '-1@2'],
          stackLabel: 'DEQUE · HIGH → LOW',
          window: [0, 2],
          output: ['3'],
          metric: 'max = 3',
          operation: 'answer ← queue.front',
        },
      },
      {
        title: '窗口右移时先清理过期下标',
        description: '窗口变成 [1,3]，下标 1 仍在窗口内，所以队首 3 继续作为答案。',
        codeLines: [5, 6, 7],
        state: {
          cursor: 3,
          stack: ['3@1', '-1@2', '-3@3'],
          stackLabel: 'DEQUE · HIGH → LOW',
          window: [1, 3],
          output: ['3', '3'],
          metric: 'max = 3',
          operation: '所有候选仍未过期',
        },
      },
      {
        title: '5 清空所有较小候选',
        description: '5 到来后，3、-1、-3 都失去成为未来最大值的机会。',
        codeLines: [3, 4, 5, 7],
        state: {
          cursor: 4,
          stack: ['5@4'],
          stackLabel: 'DEQUE · HIGH → LOW',
          window: [2, 4],
          removed: ['-3@3', '-1@2', '3@1'],
          output: ['3', '3', '5'],
          metric: 'max = 5',
          operation: '队列重新保持严格递减',
        },
      },
      {
        title: '同一规则扫描到结尾',
        description: '每个下标最多入队和出队一次，因此总时间是 O(n)。',
        codeLines: [2, 3, 4, 5, 6, 7],
        state: {
          cursor: 7,
          stack: ['7@7'],
          stackLabel: 'DEQUE · HIGH → LOW',
          window: [5, 7],
          removed: ['6@6'],
          output: ['3', '3', '5', '5', '6', '7'],
          metric: 'done',
          operation: '最终答案 [3,3,5,5,6,7]',
        },
      },
    ],
  },
  'decode-string': {
    eyebrow: 'STACK LAB · SUSPENDED CONTEXT',
    title: '遇到方括号时，栈保存了什么上下文',
    input: ['3', '[', 'a', '2', '[', 'c', ']', ']'],
    codeLines: [
      { no: 1, text: 'stack = []' },
      { no: 2, text: 'number = 0' },
      { no: 3, text: 'current = \"\"' },
      { no: 4, text: 'for char in s:' },
      { no: 5, text: '    if char.isdigit(): number = number * 10 + int(char)' },
      { no: 6, text: '    elif char == \"[\":' },
      { no: 7, text: '        stack.append((current, number))' },
      { no: 8, text: '        current, number = \"\", 0' },
      { no: 9, text: '    elif char == \"]\":' },
      { no: 10, text: '        prefix, repeat = stack.pop()' },
      { no: 11, text: '        current = prefix + current * repeat' },
      { no: 12, text: '    else: current += char' },
    ],
    steps: [
      {
        title: '先累计重复次数 3',
        description: '数字可能有多位，因此每读一位都用 number × 10 累加。',
        codeLines: [1, 2, 3, 4, 5],
        state: {
          cursor: 0,
          stack: [],
          stackLabel: 'CONTEXT STACK',
          output: ['number = 3'],
          metric: 'current = \"\"',
          operation: '读取数字 3',
        },
      },
      {
        title: '左括号把外层上下文压栈',
        description: '保存当前前缀和重复次数，然后清空 current 开始解析括号内部。',
        codeLines: [6, 7, 8],
        state: {
          cursor: 1,
          stack: ['(\"\", 3)'],
          stackLabel: 'CONTEXT STACK',
          output: ['current = \"\"'],
          metric: 'depth = 1',
          operation: 'push (prefix=\"\", repeat=3)',
        },
      },
      {
        title: '嵌套括号再次保存当前层',
        description: '读到 a2[ 时，把前缀 a 和次数 2 压入第二层。',
        codeLines: [5, 6, 7, 8, 12],
        state: {
          cursor: 4,
          stack: ['(\"\", 3)', '(\"a\", 2)'],
          stackLabel: 'CONTEXT STACK',
          output: ['current = \"\"'],
          metric: 'depth = 2',
          operation: '等待解析最内层字符串',
        },
      },
      {
        title: '右括号完成最内层解码',
        description: '弹出 (a,2)，把当前 c 重复两次并接在前缀 a 后面。',
        codeLines: [9, 10, 11],
        state: {
          cursor: 6,
          stack: ['(\"\", 3)'],
          stackLabel: 'CONTEXT STACK',
          removed: ['(\"a\", 2)'],
          output: ['current = \"acc\"'],
          metric: 'depth = 1',
          operation: '\"a\" + \"c\" × 2',
        },
      },
      {
        title: '最后一次出栈完成外层重复',
        description: 'acc 重复三次，得到最终字符串 accaccacc。',
        codeLines: [9, 10, 11],
        state: {
          cursor: 7,
          stack: [],
          stackLabel: 'CONTEXT STACK',
          removed: ['(\"\", 3)'],
          output: ['accaccacc'],
          metric: 'done',
          operation: '\"acc\" × 3',
        },
      },
    ],
  },
  'daily-temperatures': {
    eyebrow: 'STACK LAB · NEXT GREATER',
    title: '单调栈怎样等待下一个更高温度',
    input: ['73', '74', '75', '71', '69', '72', '76', '73'],
    codeLines: [
      { no: 1, text: 'answer = [0] * len(temperatures)' },
      { no: 2, text: 'stack = []' },
      { no: 3, text: 'for index, temperature in enumerate(temperatures):' },
      { no: 4, text: '    while stack and temperatures[stack[-1]] < temperature:' },
      { no: 5, text: '        previous = stack.pop()' },
      { no: 6, text: '        answer[previous] = index - previous' },
      { no: 7, text: '    stack.append(index)' },
    ],
    steps: [
      {
        title: '栈保存仍在等待答案的日期',
        description: '第一天 73℃ 暂时没有更高温度，把下标 0 压栈。',
        codeLines: [1, 2, 3, 7],
        state: {
          cursor: 0,
          stack: ['73@0'],
          stackLabel: 'DECREASING STACK',
          output: ['0', '0', '0', '0', '0', '0', '0', '0'],
          metric: 'waiting = 1',
          operation: 'push day 0',
        },
      },
      {
        title: '74℃ 解决了 73℃ 的等待',
        description: '当前温度更高，弹出下标 0，等待天数是 1 - 0。',
        codeLines: [4, 5, 6, 7],
        state: {
          cursor: 1,
          stack: ['74@1'],
          stackLabel: 'DECREASING STACK',
          removed: ['73@0'],
          output: ['1', '0', '0', '0', '0', '0', '0', '0'],
          metric: 'answer[0] = 1',
          operation: 'pop 73, push 74',
        },
      },
      {
        title: '较低温度继续压栈等待',
        description: '75 后面的 71、69 都不能解决栈内日期，栈保持从底到顶单调递减。',
        codeLines: [3, 4, 7],
        state: {
          cursor: 4,
          stack: ['75@2', '71@3', '69@4'],
          stackLabel: 'DECREASING STACK',
          output: ['1', '1', '0', '0', '0', '0', '0', '0'],
          metric: 'waiting = 3',
          operation: '75 > 71 > 69',
        },
      },
      {
        title: '72℃ 连续解决两个较低温度',
        description: '依次弹出 69 和 71，分别计算等待 1 天和 2 天；75 仍然更高，继续等待。',
        codeLines: [4, 5, 6, 7],
        state: {
          cursor: 5,
          stack: ['75@2', '72@5'],
          stackLabel: 'DECREASING STACK',
          removed: ['69@4', '71@3'],
          output: ['1', '1', '0', '2', '1', '0', '0', '0'],
          metric: 'resolved = 2',
          operation: 'while 循环一次解决多个下标',
        },
      },
      {
        title: '76℃ 清空此前所有等待者',
        description: '76 比栈内 72、75 都高，它们的第一个更高温度都在今天。',
        codeLines: [4, 5, 6, 7],
        state: {
          cursor: 6,
          stack: ['76@6'],
          stackLabel: 'DECREASING STACK',
          removed: ['72@5', '75@2'],
          output: ['1', '1', '4', '2', '1', '1', '0', '0'],
          metric: 'resolved = 2',
          operation: '每个下标最多出栈一次',
        },
      },
      {
        title: '栈中剩余日期没有更高温度',
        description: '扫描结束后仍在栈中的位置保持答案 0。',
        codeLines: [3, 7],
        state: {
          cursor: 7,
          stack: ['76@6', '73@7'],
          stackLabel: 'DECREASING STACK',
          output: ['1', '1', '4', '2', '1', '1', '0', '0'],
          metric: 'done',
          operation: '最终答案完成',
        },
      },
    ],
  },
}

export type PointerArrayDemoVariant =
  | 'three-sum'
  | 'trapping-rain-water'
  | 'merge-intervals'

export interface ArrayPointer {
  label: string
  index: number
  tone?: 'accent' | 'lime' | 'muted'
}

export interface PointerArrayState {
  values?: number[]
  heights?: number[]
  water?: number[]
  intervals?: Array<[number, number]>
  pointers?: ArrayPointer[]
  active?: number[]
  muted?: number[]
  merged?: Array<[number, number]>
  result: string
  comparison: string
  operation: string
}

export interface PointerArrayConfig extends DemoConfig<PointerArrayState> {
  kind: 'numbers' | 'bars' | 'intervals'
}

export const pointerArrayDemos: Record<
  PointerArrayDemoVariant,
  PointerArrayConfig
> = {
  'three-sum': {
    kind: 'numbers',
    eyebrow: 'POINTER LAB · SORT + TWO POINTERS',
    title: '固定一个数后，另外两个指针怎么移动',
    codeLines: [
      { no: 1, text: 'nums.sort()' },
      { no: 2, text: 'answer = []' },
      { no: 3, text: 'for first in range(len(nums) - 2):' },
      { no: 4, text: '    if first > 0 and nums[first] == nums[first - 1]: continue' },
      { no: 5, text: '    left, right = first + 1, len(nums) - 1' },
      { no: 6, text: '    while left < right:' },
      { no: 7, text: '        total = nums[first] + nums[left] + nums[right]' },
      { no: 8, text: '        if total < 0: left += 1' },
      { no: 9, text: '        elif total > 0: right -= 1' },
      { no: 10, text: '        else: record_and_skip_duplicates()' },
    ],
    steps: [
      {
        title: '排序后才能根据和的大小定向移动',
        description: '数组变成 [-4,-1,-1,0,1,2]，先固定最左侧 -4。',
        codeLines: [1, 2, 3, 5],
        state: {
          values: [-4, -1, -1, 0, 1, 2],
          pointers: [
            { label: 'F', index: 0, tone: 'muted' },
            { label: 'L', index: 1, tone: 'accent' },
            { label: 'R', index: 5, tone: 'lime' },
          ],
          active: [0, 1, 5],
          result: '[]',
          comparison: '-4 + -1 + 2 = -3',
          operation: '和太小，只能让 left 右移',
        },
      },
      {
        title: '固定 -4 时始终无法得到 0',
        description: 'left 右移会让和变大；直到左右相遇仍小于 0，这一轮结束。',
        codeLines: [6, 7, 8],
        state: {
          values: [-4, -1, -1, 0, 1, 2],
          pointers: [
            { label: 'F', index: 0, tone: 'muted' },
            { label: 'L', index: 4, tone: 'accent' },
            { label: 'R', index: 5, tone: 'lime' },
          ],
          muted: [1, 2, 3],
          result: '[]',
          comparison: '-4 + 1 + 2 = -1',
          operation: '本轮没有解',
        },
      },
      {
        title: '固定 -1 后第一次命中',
        description: '-1 + -1 + 2 = 0，记录三元组并同时收缩左右指针。',
        codeLines: [3, 5, 6, 7, 10],
        state: {
          values: [-4, -1, -1, 0, 1, 2],
          pointers: [
            { label: 'F', index: 1, tone: 'muted' },
            { label: 'L', index: 2, tone: 'accent' },
            { label: 'R', index: 5, tone: 'lime' },
          ],
          active: [1, 2, 5],
          result: '[[-1,-1,2]]',
          comparison: '-1 + -1 + 2 = 0',
          operation: '记录后跳过相同的 left/right 值',
        },
      },
      {
        title: '继续在同一固定值下寻找',
        description: 'left=0、right=1 时再次命中 [-1,0,1]。',
        codeLines: [6, 7, 10],
        state: {
          values: [-4, -1, -1, 0, 1, 2],
          pointers: [
            { label: 'F', index: 1, tone: 'muted' },
            { label: 'L', index: 3, tone: 'accent' },
            { label: 'R', index: 4, tone: 'lime' },
          ],
          active: [1, 3, 4],
          result: '[[-1,-1,2], [-1,0,1]]',
          comparison: '-1 + 0 + 1 = 0',
          operation: '第二个答案加入结果',
        },
      },
      {
        title: '固定值本身也要去重',
        description: '下一个 first 仍是 -1，直接跳过，否则会生成重复三元组。',
        codeLines: [4],
        state: {
          values: [-4, -1, -1, 0, 1, 2],
          pointers: [
            { label: 'F', index: 2, tone: 'accent' },
          ],
          muted: [2],
          result: '[[-1,-1,2], [-1,0,1]]',
          comparison: 'nums[2] == nums[1]',
          operation: '跳过重复固定值，搜索完成',
        },
      },
    ],
  },
  'trapping-rain-water': {
    kind: 'bars',
    eyebrow: 'POINTER LAB · WATERLINE',
    title: '为什么移动较矮的一侧就能确定水量',
    codeLines: [
      { no: 1, text: 'left, right = 0, len(height) - 1' },
      { no: 2, text: 'left_max = right_max = 0' },
      { no: 3, text: 'answer = 0' },
      { no: 4, text: 'while left < right:' },
      { no: 5, text: '    if height[left] <= height[right]:' },
      { no: 6, text: '        left_max = max(left_max, height[left])' },
      { no: 7, text: '        answer += left_max - height[left]' },
      { no: 8, text: '        left += 1' },
      { no: 9, text: '    else:' },
      { no: 10, text: '        right_max = max(right_max, height[right])' },
      { no: 11, text: '        answer += right_max - height[right]' },
      { no: 12, text: '        right -= 1' },
    ],
    steps: [
      {
        title: '左右边界从最外侧向中间夹',
        description: '较矮的一侧决定当前水位上限，因为另一侧至少有一根更高的柱子兜底。',
        codeLines: [1, 2, 3, 4, 5],
        state: {
          heights: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1],
          water: Array(12).fill(0),
          pointers: [
            { label: 'L', index: 0, tone: 'accent' },
            { label: 'R', index: 11, tone: 'lime' },
          ],
          result: 'water = 0',
          comparison: '0 ≤ 1',
          operation: '处理左侧并移动 L',
        },
      },
      {
        title: '左侧最高柱更新为 1',
        description: '走到下标 2 的凹槽时，右侧存在更高边界，因此这里确定能接 1 格水。',
        codeLines: [5, 6, 7, 8],
        state: {
          heights: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1],
          water: [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          pointers: [
            { label: 'L', index: 2, tone: 'accent' },
            { label: 'R', index: 11, tone: 'lime' },
          ],
          active: [2],
          result: 'water = 1',
          comparison: 'left_max 1 - height 0',
          operation: '该位置水量已经不会再改变',
        },
      },
      {
        title: '右侧较矮时改为处理右边',
        description: '右侧从 11 向左移动，right_max 逐步更新为 2。',
        codeLines: [9, 10, 11, 12],
        state: {
          heights: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1],
          water: [0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
          pointers: [
            { label: 'L', index: 3, tone: 'accent' },
            { label: 'R', index: 9, tone: 'lime' },
          ],
          active: [9],
          result: 'water = 2',
          comparison: 'right_max 2 - height 1',
          operation: '下标 9 确定接 1 格水',
        },
      },
      {
        title: '两侧最大值分别约束当前位置',
        description: '左指针继续推进，在高度 1、0、1 的凹槽中累计水量。',
        codeLines: [5, 6, 7, 8],
        state: {
          heights: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1],
          water: [0, 0, 1, 0, 1, 2, 1, 0, 0, 1, 0, 0],
          pointers: [
            { label: 'L', index: 6, tone: 'accent' },
            { label: 'R', index: 9, tone: 'lime' },
          ],
          active: [4, 5, 6],
          result: 'water = 6',
          comparison: 'left_max = 2',
          operation: '每个位置只在离开时结算一次',
        },
      },
      {
        title: '指针相遇时所有位置都已结算',
        description: '总水量为 6，时间 O(n)，额外空间 O(1)。',
        codeLines: [4],
        state: {
          heights: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1],
          water: [0, 0, 1, 0, 1, 2, 1, 0, 0, 1, 0, 0],
          pointers: [
            { label: 'L/R', index: 7, tone: 'accent' },
          ],
          result: 'water = 6',
          comparison: 'left == right',
          operation: '扫描完成',
        },
      },
    ],
  },
  'merge-intervals': {
    kind: 'intervals',
    eyebrow: 'INTERVAL LAB · SORT + SWEEP',
    title: '排序以后为什么只需比较最后一个区间',
    codeLines: [
      { no: 1, text: 'intervals.sort(key=lambda interval: interval[0])' },
      { no: 2, text: 'merged = []' },
      { no: 3, text: 'for start, end in intervals:' },
      { no: 4, text: '    if not merged or merged[-1][1] < start:' },
      { no: 5, text: '        merged.append([start, end])' },
      { no: 6, text: '    else:' },
      { no: 7, text: '        merged[-1][1] = max(merged[-1][1], end)' },
    ],
    steps: [
      {
        title: '先按起点排序所有区间',
        description: '排序后新区间的起点只会向右移动，因此只可能与结果中的最后一个区间重叠。',
        codeLines: [1, 2],
        state: {
          intervals: [[1, 3], [2, 6], [8, 10], [15, 18]],
          active: [0],
          merged: [],
          result: 'merged = []',
          comparison: '按 start 升序',
          operation: '准备扫描 [1,3]',
        },
      },
      {
        title: '结果为空时直接加入第一个区间',
        description: '[1,3] 成为当前合并结果的最后一段。',
        codeLines: [3, 4, 5],
        state: {
          intervals: [[1, 3], [2, 6], [8, 10], [15, 18]],
          active: [0],
          merged: [[1, 3]],
          result: '[[1,3]]',
          comparison: 'merged is empty',
          operation: 'append [1,3]',
        },
      },
      {
        title: '新区间起点落在最后区间内',
        description: '[2,6] 与 [1,3] 重叠，把最后区间的终点扩展到更大的 6。',
        codeLines: [3, 4, 6, 7],
        state: {
          intervals: [[1, 3], [2, 6], [8, 10], [15, 18]],
          active: [1],
          merged: [[1, 6]],
          result: '[[1,6]]',
          comparison: '2 ≤ 3',
          operation: '[1,3] ∪ [2,6] = [1,6]',
        },
      },
      {
        title: '完全分离的区间开启新段',
        description: '[8,10] 的起点大于最后终点 6，不可能与更早区间重叠。',
        codeLines: [4, 5],
        state: {
          intervals: [[1, 3], [2, 6], [8, 10], [15, 18]],
          active: [2],
          merged: [[1, 6], [8, 10]],
          result: '[[1,6], [8,10]]',
          comparison: '8 > 6',
          operation: 'append [8,10]',
        },
      },
      {
        title: '扫描结束得到互不重叠的结果',
        description: '[15,18] 同样开启新段，所有区间只处理一次。',
        codeLines: [3, 4, 5],
        state: {
          intervals: [[1, 3], [2, 6], [8, 10], [15, 18]],
          active: [3],
          merged: [[1, 6], [8, 10], [15, 18]],
          result: '[[1,6], [8,10], [15,18]]',
          comparison: '15 > 10',
          operation: '合并完成',
        },
      },
    ],
  },
}
