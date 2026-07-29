import type { DefaultTheme } from 'vitepress'
import { huaweiWrittenTests } from './theme/data/huaweiWrittenTests'
import { meituanWrittenTests } from './theme/data/meituanWrittenTests'
import { pinduoduoWrittenTests } from './theme/data/pinduoduoWrittenTests'
import { remainingWrittenTests } from './theme/data/remainingWrittenTests'

const moduleGroup = (
  number: string,
  title: string,
  slug: string,
  extraItems: DefaultTheme.SidebarItem[] = []
): DefaultTheme.SidebarItem => ({
  text: `${number} · ${title}`,
  collapsed: true,
  items: [
    { text: '专题说明', link: `/modules/${slug}/README` },
    ...extraItems
  ]
})

const writtenTestSession = (
  date: string,
  role: string,
  items: DefaultTheme.SidebarItem[]
): DefaultTheme.SidebarItem => ({
  text: `${date} · ${role}`,
  collapsed: true,
  items
})

const remainingCompanyOrder = [
  '网易',
  '哔哩哔哩',
  '科大讯飞',
  '携程',
  '得物',
  '字节跳动',
  '米哈游',
  '虾皮',
  '上海 AI Lab',
  '荣耀',
  'DeepSeek',
  '百度'
]

const remainingWrittenTestSidebarGroups: DefaultTheme.SidebarItem[] =
  remainingCompanyOrder.map((company) => ({
    text: company,
    collapsed: true,
    items: remainingWrittenTests
      .filter((session) => session.company === company)
      .map((session) => writtenTestSession(
        session.date,
        session.role,
        session.questions.map((question, index) => ({
          text: `${String(index + 1).padStart(2, '0')} ${question}`,
          link: `${session.href}#problem-${String(index + 1).padStart(2, '0')}`
        }))
      ))
  }))

export const sidebar: DefaultTheme.SidebarItem[] = [
  {
    text: '训练入口',
    collapsed: false,
    items: [
      { text: '项目说明', link: '/README' },
      { text: '开始刷题', link: '/START_HERE' },
      { text: '完整学习路线', link: '/ROADMAP' },
      { text: '大厂真题数据分析', link: '/ANALYSIS' }
    ]
  },
  moduleGroup('01', '复杂度与解题流程', '01-complexity'),
  moduleGroup('02', '数组、字符串与双指针', '02-array-string', [
    {
      text: '二分查找系统详解',
      link: '/modules/02-array-string/binary-search'
    }
  ]),
  moduleGroup('03', '链表', '03-linked-list'),
  moduleGroup('04', '栈、队列与哈希', '04-stack-queue-hash', [
    {
      text: '单调栈与单调队列',
      link: '/modules/04-stack-queue-hash/monotonic-stack-queue'
    }
  ]),
  moduleGroup('05', '二叉树与递归', '05-tree-recursion', [
    {
      text: '二叉树与递归系统详解',
      link: '/modules/05-tree-recursion/tree-recursion'
    }
  ]),
  moduleGroup('06', '图、搜索与并查集', '06-graph-search', [
    {
      text: '并查集系统详解',
      link: '/modules/06-graph-search/union-find'
    }
  ]),
  moduleGroup('07', '动态规划与贪心', '07-dp-greedy'),
  moduleGroup('08', '综合面试模式', '08-interview-patterns'),
  {
    text: '大厂面试真题',
    collapsed: true,
    items: [
      {
        text: '模块说明',
        link: '/modules/company-interview-questions/README'
      },
      {
        text: '操作系统与并发',
        link: '/modules/company-interview-questions/operating-system'
      },
      {
        text: '网络协议',
        link: '/modules/company-interview-questions/network'
      },
      {
        text: '数据库',
        link: '/modules/company-interview-questions/database'
      },
      {
        text: 'Redis 与缓存',
        link: '/modules/company-interview-questions/redis-cache'
      },
      {
        text: '消息与分布式',
        link: '/modules/company-interview-questions/distributed'
      },
      {
        text: '场景设计与排障',
        link: '/modules/company-interview-questions/system-design'
      },
      {
        text: 'Agent 开发',
        link: '/modules/company-interview-questions/agent-development'
      }
    ]
  },
  {
    text: '大厂笔试真题',
    collapsed: true,
    items: [
      { text: '模块说明与 ACM 规范', link: '/written-tests/README' },
      { text: '真题数据分析', link: '/written-tests/ANALYSIS' },
      {
        text: '阿里巴巴',
        collapsed: true,
        items: [
          writtenTestSession('2026-03-25', '研发岗', [
            { text: '01 圣诞老人分糖果', link: '/written-tests/alibaba-dev-20260325#problem-01' },
            { text: '02 公共子序列', link: '/written-tests/alibaba-dev-20260325#problem-02' },
            { text: '03 喜欢的正整数', link: '/written-tests/alibaba-dev-20260325#problem-03' }
          ]),
          writtenTestSession('2026-03-25', '算法岗', [
            { text: '01 三星数字', link: '/written-tests/alibaba-algo-20260325#problem-01' },
            { text: '02 该博弈了', link: '/written-tests/alibaba-algo-20260325#problem-02' },
            { text: '03 铁路修建', link: '/written-tests/alibaba-algo-20260325#problem-03' }
          ]),
          writtenTestSession('2026-03-28', '研发岗', [
            { text: '01 值', link: '/written-tests/alibaba-dev-20260328#problem-01' },
            { text: '02 不稳定 or 相似', link: '/written-tests/alibaba-dev-20260328#problem-02' },
            { text: '03 递增', link: '/written-tests/alibaba-dev-20260328#problem-03' }
          ]),
          writtenTestSession('2026-03-28', '算法岗', [
            { text: '01 回合制游戏', link: '/written-tests/alibaba-algo-20260328#problem-01' },
            { text: '02 完全平方数', link: '/written-tests/alibaba-algo-20260328#problem-02' },
            { text: '03 弦上生花', link: '/written-tests/alibaba-algo-20260328#problem-03' }
          ]),
          writtenTestSession('2026-03-28', '后端开发岗', [
            { text: '01 列车相对静止', link: '/written-tests/alibaba-backend-20260328#problem-01' },
            { text: '02 隐式素数', link: '/written-tests/alibaba-backend-20260328#problem-02' },
            { text: '03 二进制操作', link: '/written-tests/alibaba-backend-20260328#problem-03' }
          ]),
          writtenTestSession('2026-04-01', '研发岗', [
            { text: '01 数组对齐', link: '/written-tests/alibaba-dev-20260401#problem-01' },
            { text: '02 约束差值数组', link: '/written-tests/alibaba-dev-20260401#problem-02' },
            { text: '03 中，太中了', link: '/written-tests/alibaba-dev-20260401#problem-03' }
          ]),
          writtenTestSession('2026-04-01', '算法岗', [
            { text: '01 等步长交换', link: '/written-tests/alibaba-algo-20260401#problem-01' },
            { text: '02 找质数', link: '/written-tests/alibaba-algo-20260401#problem-02' },
            { text: '03 字符串分段压缩', link: '/written-tests/alibaba-algo-20260401#problem-03' }
          ]),
          writtenTestSession('2026-04-08', '研发岗', [
            { text: '01 可删去的字符串', link: '/written-tests/alibaba-dev-20260408#problem-01' },
            { text: '02 网格路径最大和', link: '/written-tests/alibaba-dev-20260408#problem-02' },
            { text: '03 相邻等值对贡献和', link: '/written-tests/alibaba-dev-20260408#problem-03' }
          ]),
          writtenTestSession('2026-04-11', 'AI 研发岗', [
            { text: '01 模乘循环数', link: '/written-tests/alibaba-ai-20260411#problem-01' },
            { text: '02 逆转', link: '/written-tests/alibaba-ai-20260411#problem-02' },
            { text: '03 果酱平衡', link: '/written-tests/alibaba-ai-20260411#problem-03' }
          ]),
          writtenTestSession('2026-04-11', '算法岗', [
            { text: '01 轮转', link: '/written-tests/alibaba-algo-20260411#problem-01' },
            { text: '02 凑对', link: '/written-tests/alibaba-algo-20260411#problem-02' },
            { text: '03 模 k 最大子序列', link: '/written-tests/alibaba-algo-20260411#problem-03' }
          ]),
          writtenTestSession('2026-04-15', 'AI 算法岗', [
            { text: '01 富豪', link: '/written-tests/alibaba-ai-20260415#problem-01' },
            { text: '02 何物为真', link: '/written-tests/alibaba-ai-20260415#problem-02' },
            { text: '03 连连看', link: '/written-tests/alibaba-ai-20260415#problem-03' }
          ]),
          writtenTestSession('2026-04-18', '算法岗', [
            { text: '01 这是什么博弈', link: '/written-tests/alibaba-algo-20260418#problem-01' },
            { text: '02 最短就餐距离', link: '/written-tests/alibaba-algo-20260418#problem-02' },
            { text: '03 最大权值', link: '/written-tests/alibaba-algo-20260418#problem-03' }
          ]),
          writtenTestSession('2026-04-25', 'AI 研发岗', [
            { text: '01 蝴蝶乐园', link: '/written-tests/alibaba-ai-20260425#problem-01' },
            { text: '02 按位与', link: '/written-tests/alibaba-ai-20260425#problem-02' },
            { text: '03 区间第 k 小', link: '/written-tests/alibaba-ai-20260425#problem-03' }
          ]),
          writtenTestSession('2026-04-25', '算法岗', [
            { text: '01 插入顺序', link: '/written-tests/alibaba-algo-20260425#problem-01' },
            { text: '02 矩阵计数', link: '/written-tests/alibaba-algo-20260425#problem-02' },
            { text: '03 取模仪式', link: '/written-tests/alibaba-algo-20260425#problem-03' }
          ]),
          writtenTestSession('2026-05-09', '算法岗', [
            { text: '01 有符号型排列', link: '/written-tests/alibaba-algo-20260509#problem-01' },
            { text: '02 迷宫指示牌', link: '/written-tests/alibaba-algo-20260509#problem-02' },
            { text: '03 xab', link: '/written-tests/alibaba-algo-20260509#problem-03' }
          ]),
          writtenTestSession('2026-05-09', 'AI 研发岗', [
            { text: '01 最大数位之和', link: '/written-tests/alibaba-ai-20260509#problem-01' },
            { text: '02 充电桩阈值', link: '/written-tests/alibaba-ai-20260509#problem-02' },
            { text: '03 游历 n 个城市', link: '/written-tests/alibaba-ai-20260509#problem-03' }
          ]),
          writtenTestSession('2026-05-13', '工程岗', [
            { text: '01 二次幂变换', link: '/written-tests/alibaba-dev-20260513#problem-01' },
            { text: '02 字符串计数', link: '/written-tests/alibaba-dev-20260513#problem-02' },
            { text: '03 迷宫', link: '/written-tests/alibaba-dev-20260513#problem-03' }
          ]),
          writtenTestSession('2026-05-16', '工程岗', [
            { text: '01 逆序对构造', link: '/written-tests/alibaba-dev-20260516#problem-01' },
            { text: '02 传送门最短路', link: '/written-tests/alibaba-dev-20260516#problem-02' },
            { text: '03 子区间最小值和', link: '/written-tests/alibaba-dev-20260516#problem-03' }
          ]),
          writtenTestSession('2026-05-16', '算法岗', [
            { text: '01 分组计数', link: '/written-tests/alibaba-algo-20260516#problem-01' },
            { text: '02 坏掉的键盘', link: '/written-tests/alibaba-algo-20260516#problem-02' },
            { text: '03 小红的 01 串操作', link: '/written-tests/alibaba-algo-20260516#problem-03' }
          ]),
          writtenTestSession('2026-05-16', 'AI 研发岗', [
            { text: '01 密钥密码', link: '/written-tests/alibaba-ai-20260516#problem-01' },
            { text: '02 按位或最大化', link: '/written-tests/alibaba-ai-20260516#problem-02' },
            { text: '03 最小陡峭值', link: '/written-tests/alibaba-ai-20260516#problem-03' }
          ]),
          writtenTestSession('2026-05-23', '算法岗', [
            { text: '01 荆棘林的最优砍断计划', link: '/written-tests/alibaba-algo-20260523#problem-01' },
            { text: '02 多约束条件下的元素匹配统计', link: '/written-tests/alibaba-algo-20260523#problem-02' },
            { text: '03 寻找满足条件的最优子序列', link: '/written-tests/alibaba-algo-20260523#problem-03' }
          ]),
          writtenTestSession('2026-05-30', 'AI 研发岗', [
            { text: '01 数组中的沉默元素计数', link: '/written-tests/alibaba-ai-20260530#problem-01' },
            { text: '02 矩阵两次取线最大收益', link: '/written-tests/alibaba-ai-20260530#problem-02' },
            { text: '03 字符串等频递增变换', link: '/written-tests/alibaba-ai-20260530#problem-03' }
          ])
        ]
      },
      {
        text: '美团',
        collapsed: true,
        items: meituanWrittenTests.map((session) => writtenTestSession(
          session.date,
          session.role,
          session.questions.map((question, index) => ({
            text: `${String(index + 1).padStart(2, '0')} ${question}`,
            link: `${session.href}#problem-${String(index + 1).padStart(2, '0')}`
          }))
        ))
      },
      {
        text: '华为',
        collapsed: true,
        items: huaweiWrittenTests.map((session) => writtenTestSession(
          session.date,
          session.role,
          session.questions.map((question, index) => ({
            text: `${String(index + 1).padStart(2, '0')} ${question}`,
            link: `${session.href}#problem-${String(index + 1).padStart(2, '0')}`
          }))
        ))
      },
      {
        text: '拼多多',
        collapsed: true,
        items: pinduoduoWrittenTests.map((session) => writtenTestSession(
          session.date,
          session.role,
          session.questions.map((question, index) => ({
            text: `${String(index + 1).padStart(2, '0')} ${question}`,
            link: `${session.href}#problem-${String(index + 1).padStart(2, '0')}`
          }))
        ))
      },
      ...remainingWrittenTestSidebarGroups,
      {
        text: '蚂蚁集团',
        collapsed: true,
        items: [
          writtenTestSession('2026-03-26', '研发岗', [
            { text: '01 排列拼接', link: '/written-tests/ant-20260326-dev#problem-01' },
            { text: '02 该回家了', link: '/written-tests/ant-20260326-dev#problem-02' },
            { text: '03 破译者', link: '/written-tests/ant-20260326-dev#problem-03' }
          ]),
          writtenTestSession('2026-03-29', '研发岗', [
            { text: '01 巴巴博弈', link: '/written-tests/ant-20260329-dev#problem-01' },
            { text: '02 质数合数', link: '/written-tests/ant-20260329-dev#problem-02' },
            { text: '03 位运算权值', link: '/written-tests/ant-20260329-dev#problem-03' }
          ]),
          writtenTestSession('2026-03-29', 'AI Coding', [
            { text: '01 终端早餐店系统 · 重点', link: '/written-tests/ant-20260329-ai-coding' }
          ]),
          writtenTestSession('2026-04-02', '研发岗', [
            { text: '01 也许互质序列', link: '/written-tests/ant-20260402-dev#problem-01' },
            { text: '02 按位与权值和', link: '/written-tests/ant-20260402-dev#problem-02' },
            { text: '03 平方串', link: '/written-tests/ant-20260402-dev#problem-03' }
          ]),
          writtenTestSession('2026-04-09', '算法岗', [
            { text: '01 穿过黑暗之门', link: '/written-tests/ant-20260409-algo#problem-01' },
            { text: '02 离散型马尔可夫模型预测', link: '/written-tests/ant-20260409-algo#problem-02' },
            { text: '03 公倍数对和', link: '/written-tests/ant-20260409-algo#problem-03' }
          ]),
          writtenTestSession('2026-04-16', '研发岗', [
            { text: '01 仅含 1 和合数的数组', link: '/written-tests/ant-20260416-dev#problem-01' },
            { text: '02 剪绳子', link: '/written-tests/ant-20260416-dev#problem-02' },
            { text: '03 不互质元素下标', link: '/written-tests/ant-20260416-dev#problem-03' }
          ]),
          writtenTestSession('2026-04-19', '研发岗', [
            { text: '01 拼好房', link: '/written-tests/ant-20260419-dev#problem-01' },
            { text: '02 不降序序列', link: '/written-tests/ant-20260419-dev#problem-02' },
            { text: '03 二次幂变换 2', link: '/written-tests/ant-20260419-dev#problem-03' }
          ]),
          writtenTestSession('2026-05-07', '开发岗', [
            { text: '01 好看的二进制字符串', link: '/written-tests/ant-20260507-dev#problem-01' },
            { text: '02 地图上的最短别墅距离', link: '/written-tests/ant-20260507-dev#problem-02' },
            { text: '03 最大化打铁次数的期望', link: '/written-tests/ant-20260507-dev#problem-03' }
          ])
        ]
      },
      {
        text: '蔚来',
        collapsed: true,
        items: [
          ...remainingWrittenTests
            .filter((session) => session.company === '蔚来')
            .map((session) => writtenTestSession(
              session.date,
              session.role,
              session.questions.map((question, index) => ({
                text: `${String(index + 1).padStart(2, '0')} ${question}`,
                link: `${session.href}#problem-${String(index + 1).padStart(2, '0')}`
              }))
            )),
          writtenTestSession('2026-07-26', '通用岗', [
            { text: '01 阶乘平方数', link: '/written-tests/nio-20260726-factorial-square' },
            { text: '02 线性组合计数', link: '/written-tests/nio-20260726-linear-combination-count' }
          ])
        ]
      }
    ]
  },
  {
    text: '题目与题单',
    collapsed: true,
    items: [
      { text: '题目索引', link: '/problems/README' },
      { text: '001 两数之和', link: '/problems/001-two-sum' },
      { text: '002 两数相加', link: '/problems/002-add-two-numbers' },
      { text: '003 无重复字符的最长子串', link: '/problems/003-longest-substring-without-repeating-characters' },
      { text: '004 寻找两个正序数组的中位数', link: '/problems/004-median-of-two-sorted-arrays' },
      { text: '005 最长回文子串', link: '/problems/005-longest-palindromic-substring' },
      { text: '008 字符串转换整数（atoi）', link: '/problems/008-string-to-integer-atoi' },
      { text: '011 盛最多水的容器', link: '/problems/011-container-with-most-water' },
      { text: '015 三数之和', link: '/problems/015-three-sum' },
      { text: '016 最接近的三数之和', link: '/problems/016-3sum-closest' },
      { text: '017 电话号码的字母组合', link: '/problems/017-letter-combinations-of-a-phone-number' },
      { text: '019 删除链表的倒数第 N 个结点', link: '/problems/019-remove-nth-node-from-end-of-list' },
      { text: '020 有效的括号', link: '/problems/020-valid-parentheses' },
      { text: '021 合并两个有序链表', link: '/problems/021-merge-two-sorted-lists' },
      { text: '022 括号生成', link: '/problems/022-generate-parentheses' },
      { text: '023 合并 K 个升序链表', link: '/problems/023-merge-k-sorted-lists' },
      { text: '024 两两交换链表中的节点', link: '/problems/024-swap-nodes-in-pairs' },
      { text: '025 K 个一组翻转链表', link: '/problems/025-reverse-nodes-in-k-group' },
      { text: '032 最长有效括号', link: '/problems/032-longest-valid-parentheses' },
      { text: '033 搜索旋转排序数组', link: '/problems/033-search-in-rotated-sorted-array' },
      { text: '034 查找元素的第一个和最后一个位置', link: '/problems/034-find-first-and-last-position-of-element-in-sorted-array' },
      { text: '042 接雨水', link: '/problems/042-trapping-rain-water' },
      { text: '043 字符串相乘', link: '/problems/043-multiply-strings' },
      { text: '046 全排列', link: '/problems/046-permutations' },
      { text: '053 最大子数组和', link: '/problems/053-maximum-subarray' },
      { text: '054 螺旋矩阵', link: '/problems/054-spiral-matrix' },
      { text: '055 跳跃游戏', link: '/problems/055-jump-game' },
      { text: '056 合并区间', link: '/problems/056-merge-intervals' },
      { text: '062 不同路径', link: '/problems/062-unique-paths' },
      { text: '064 最小路径和', link: '/problems/064-minimum-path-sum' },
      { text: '065 有效数字', link: '/problems/065-valid-number' },
      { text: '069 x 的平方根', link: '/problems/069-sqrtx' },
      { text: '070 爬楼梯', link: '/problems/070-climbing-stairs' },
      { text: '072 编辑距离', link: '/problems/072-edit-distance' },
      { text: '075 颜色分类', link: '/problems/075-sort-colors' },
      { text: '076 最小覆盖子串', link: '/problems/076-minimum-window-substring' },
      { text: '078 子集', link: '/problems/078-subsets' },
      { text: '079 单词搜索', link: '/problems/079-word-search' },
      { text: '082 删除排序链表中的重复元素 II', link: '/problems/082-remove-duplicates-from-sorted-list-ii' },
      { text: '088 合并两个有序数组', link: '/problems/088-merge-sorted-array' },
      { text: '092 反转链表 II', link: '/problems/092-reverse-linked-list-ii' },
      { text: '093 复原 IP 地址', link: '/problems/093-restore-ip-addresses' },
      { text: '094 二叉树的中序遍历', link: '/problems/094-binary-tree-inorder-traversal' },
      { text: '101 对称二叉树', link: '/problems/101-symmetric-tree' },
      { text: '102 二叉树的层序遍历', link: '/problems/102-binary-tree-level-order-traversal' },
      { text: '103 二叉树的锯齿形层序遍历', link: '/problems/103-binary-tree-zigzag-level-order-traversal' },
      { text: '104 二叉树的最大深度', link: '/problems/104-maximum-depth-of-binary-tree' },
      { text: '105 从前序与中序遍历构造二叉树', link: '/problems/105-construct-binary-tree-from-preorder-and-inorder-traversal' },
      { text: '121 买卖股票的最佳时机', link: '/problems/121-best-time-to-buy-and-sell-stock' },
      { text: '122 买卖股票的最佳时机 II', link: '/problems/122-best-time-to-buy-and-sell-stock-ii' },
      { text: '124 二叉树中的最大路径和', link: '/problems/124-binary-tree-maximum-path-sum' },
      { text: '135 分发糖果', link: '/problems/135-candy' },
      { text: '139 单词拆分', link: '/problems/139-word-break' },
      { text: '141 环形链表', link: '/problems/141-linked-list-cycle' },
      { text: '142 环形链表 II', link: '/problems/142-linked-list-cycle-ii' },
      { text: '143 重排链表', link: '/problems/143-reorder-list' },
      { text: '146 LRU 缓存', link: '/problems/146-lru-cache' },
      { text: '148 排序链表', link: '/problems/148-sort-list' },
      { text: '152 乘积最大子数组', link: '/problems/152-maximum-product-subarray' },
      { text: '153 寻找旋转排序数组中的最小值', link: '/problems/153-find-minimum-in-rotated-sorted-array' },
      { text: '155 最小栈', link: '/problems/155-min-stack' },
      { text: '160 相交链表', link: '/problems/160-intersection-of-two-linked-lists' },
      { text: '165 比较版本号', link: '/problems/165-compare-version-numbers' },
      { text: '169 多数元素', link: '/problems/169-majority-element' },
      { text: '179 最大数', link: '/problems/179-largest-number' },
      { text: '198 打家劫舍', link: '/problems/198-house-robber' },
      { text: '199 二叉树的右视图', link: '/problems/199-binary-tree-right-side-view' },
      { text: '200 岛屿数量', link: '/problems/200-number-of-islands' },
      { text: '206 反转链表', link: '/problems/206-reverse-linked-list' },
      { text: '207 课程表', link: '/problems/207-course-schedule' },
      { text: '209 长度最小的子数组', link: '/problems/209-minimum-size-subarray-sum' },
      { text: '215 数组中的第 K 个最大元素', link: '/problems/215-kth-largest-element-in-an-array' },
      { text: '221 最大正方形', link: '/problems/221-maximal-square' },
      { text: '224 基本计算器', link: '/problems/224-basic-calculator' },
      { text: '226 翻转二叉树', link: '/problems/226-invert-binary-tree' },
      { text: '230 二叉搜索树中第 K 小的元素', link: '/problems/230-kth-smallest-element-in-a-bst' },
      { text: '232 用栈实现队列', link: '/problems/232-implement-queue-using-stacks' },
      { text: '234 回文链表', link: '/problems/234-palindrome-linked-list' },
      { text: '236 二叉树的最近公共祖先', link: '/problems/236-lowest-common-ancestor-of-a-binary-tree' },
      { text: '239 滑动窗口最大值', link: '/problems/239-sliding-window-maximum' },
      { text: '240 搜索二维矩阵 II', link: '/problems/240-search-a-2d-matrix-ii' },
      { text: '287 寻找重复数', link: '/problems/287-find-the-duplicate-number' },
      { text: '300 最长递增子序列', link: '/problems/300-longest-increasing-subsequence' },
      { text: '322 零钱兑换', link: '/problems/322-coin-change' },
      { text: '328 奇偶链表', link: '/problems/328-odd-even-linked-list' },
      { text: '331 验证二叉树的前序序列化', link: '/problems/331-verify-preorder-serialization-of-a-binary-tree' },
      { text: '344 反转字符串', link: '/problems/344-reverse-string' },
      { text: '347 前 K 个高频元素', link: '/problems/347-top-k-frequent-elements' },
      { text: '394 字符串解码', link: '/problems/394-decode-string' },
      { text: '402 移掉 K 位数字', link: '/problems/402-remove-k-digits' },
      { text: '406 根据身高重建队列', link: '/problems/406-queue-reconstruction-by-height' },
      { text: '415 字符串相加', link: '/problems/415-add-strings' },
      { text: '416 分割等和子集', link: '/problems/416-partition-equal-subset-sum' },
      { text: '442 数组中重复的数据', link: '/problems/442-find-all-duplicates-in-an-array' },
      { text: '443 压缩字符串', link: '/problems/443-string-compression' },
      { text: '451 根据字符出现频率排序', link: '/problems/451-sort-characters-by-frequency' },
      { text: '470 用 Rand7() 实现 Rand10()', link: '/problems/470-implement-rand10-using-rand7' },
      { text: '543 二叉树的直径', link: '/problems/543-diameter-of-binary-tree' },
      { text: '554 砖墙', link: '/problems/554-brick-wall' },
      { text: '560 和为 K 的子数组', link: '/problems/560-subarray-sum-equals-k' },
      { text: '572 另一棵树的子树', link: '/problems/572-subtree-of-another-tree' },
      { text: '662 二叉树最大宽度', link: '/problems/662-maximum-width-of-binary-tree' },
      { text: '695 岛屿的最大面积', link: '/problems/695-max-area-of-island' },
      { text: '704 二分查找', link: '/problems/704-binary-search' },
      { text: '718 最长重复子数组', link: '/problems/718-maximum-length-of-repeated-subarray' },
      { text: '739 每日温度', link: '/problems/739-daily-temperatures' },
      { text: '875 爱吃香蕉的珂珂', link: '/problems/875-koko-eating-bananas' },
      { text: '912 排序数组', link: '/problems/912-sort-an-array' },
      { text: '994 腐烂的橘子', link: '/problems/994-rotting-oranges' },
      { text: '1143 最长公共子序列', link: '/problems/1143-longest-common-subsequence' },
      { text: '1160 拼写单词', link: '/problems/1160-find-words-that-can-be-formed-by-characters' },
      { text: '1190 反转每对括号间的子串', link: '/problems/1190-reverse-substrings-between-each-pair-of-parentheses' },
      { text: '1262 可被三整除的最大和', link: '/problems/1262-greatest-sum-divisible-by-three' },
      { text: '1423 可获得的最大点数', link: '/problems/1423-maximum-points-you-can-obtain-from-cards' },
      {
        text: '原创面试题',
        collapsed: true,
        items: [
          { text: '原创 01 带过期时间的 LRU 缓存', link: '/problems/original-001-expiring-lru-cache' },
          { text: '原创题单 02 最小整数 I', link: '/problems/original-002-minimum-integer-i' },
          { text: '腾讯原创 03 蓄水池抽样', link: '/problems/original-003-reservoir-sampling' },
          { text: '腾讯原创 04 错排问题', link: '/problems/original-004-derangement' },
          { text: '腾讯原创 05 微信红包随机分配', link: '/problems/original-005-random-red-packet-allocation' },
          { text: '腾讯原创 06 单源最短路径', link: '/problems/original-006-single-source-shortest-path' },
          { text: '腾讯原创 07 迷宫最短路径', link: '/problems/original-007-maze-shortest-path' },
          { text: '腾讯原创 08 手写小根堆', link: '/problems/original-008-handwritten-min-heap' },
          { text: '腾讯原创 09 消消乐', link: '/problems/original-009-digit-elimination' },
          { text: '华为手写 10 快速排序', link: '/problems/original-010-quicksort' }
        ]
      },
      { text: '题解模板', link: '/problems/TEMPLATE' },
      { text: '高频面试题单', link: '/tracks/top-interview' }
    ]
  },
  {
    text: '学习工作台',
    collapsed: true,
    items: [
      { text: '进度看板', link: '/progress/DASHBOARD' },
      { text: '解题笔记模板', link: '/notes/SOLUTION_NOTE_TEMPLATE' },
      { text: '内容规范', link: '/docs/CONTENT_STYLE_GUIDE' }
    ]
  }
]
