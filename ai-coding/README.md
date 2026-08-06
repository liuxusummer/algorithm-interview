---
layout: page
sidebar: true
aside: false
pageClass: ai-coding-hub
title: AI Coding
description: 用真实工程任务训练需求拆解、代码库理解、Prompt 迭代、AI 输出审查与交付复盘。
---

<div class="ai-coding-hero">
  <div class="ai-coding-hero__copy">
    <p>AI PAIR PROGRAMMING / FIELD MANUAL / 2026</p>
    <h1>AI Coding<br><em>实战档案</em></h1>
    <div class="ai-coding-hero__rule"></div>
    <p class="ai-coding-hero__lead">拿到陌生需求，先定义完成条件；让 AI 给出建议之后，用事实、反例和验证证据决定下一步。</p>
  </div>
  <div class="ai-coding-hero__console" aria-label="AI Coding 训练流程">
    <span>01 / READ</span><strong>读需求与仓库</strong>
    <span>02 / PLAN</span><strong>拆任务与风险</strong>
    <span>03 / PROMPT</span><strong>分轮提问</strong>
    <span>04 / VERIFY</span><strong>测试与解释</strong>
    <i>READY FOR REVIEW</i>
  </div>
</div>

<div class="ai-coding-manifesto">
  <strong>专题目标</strong>
  <p>这里不展示可以复制的成品代码。每个案例都拆解人的前置判断、分轮 Prompt、AI 输出中的风险、下一步观察动作、验收证据与面试复述。</p>
</div>

## 案例目录

公开面经提供的信息完整程度不同。本专题将案例分为“公开题目拆解”和“公开形式训练版”。
前者可以核对到较完整的任务描述，后者只采用公开出现过的考查形式，训练情境与解题过程由本站重新设计。

<div class="ai-coding-case-grid">
  <a href="./ant-secure-mail">
    <span>CASE 01 · 公开题目拆解</span>
    <h3>安全邮件系统</h3>
    <p>从双服务隔离、邮件投递和附件处理，走到鉴权、限流、威胁模型与验收测试。</p>
    <small>蚂蚁集团 · 在线 IDE · 项目交付</small>
  </a>
  <a href="./ant-resume-ranking">
    <span>CASE 02 · 公开记录扩展</span>
    <h3>简历筛选与排序</h3>
    <p>拆解特征提取、同义词归一化、可解释评分、稳定排序与结果 JSON。</p>
    <small>蚂蚁集团 · README 驱动 · 数据处理</small>
  </a>
  <a href="./meituan-repository-change">
    <span>CASE 03 · 公开形式训练版</span>
    <h3>真实仓库需求变更</h3>
    <p>从只读探索、失败复现到影响面评审，逐轮控制分页修复和幂等需求的修改范围。</p>
    <small>美团 · 候选人仓库 · 现场修改</small>
  </a>
  <a href="./meituan-customer-service">
    <span>CASE 04 · 公开记录扩展</span>
    <h3>智能客服 MVP</h3>
    <p>两小时内完成意图路由、知识检索、人工转接、会话记录与降级策略。</p>
    <small>美团 · AI 编辑器 · 限时产品原型</small>
  </a>
  <a href="./microsoft-load-balancer">
    <span>CASE 05 · 社区面经训练版</span>
    <h3>最小负载调度器</h3>
    <p>用状态不变量和手算反例，定位 AI 建议中的时间推进、同时释放和并列规则错误。</p>
    <small>Microsoft · Live Coding · AI 辅助</small>
  </a>
  <a href="./codebase-debugging">
    <span>CASE 06 · 海外形式训练版</span>
    <h3>多文件代码库排错</h3>
    <p>根据失败测试定位四类缺陷，练习受限 AI 环境下的代码阅读和验证。</p>
    <small>Meta / Stripe 类形式 · Code Repo · Debug</small>
  </a>
</div>

## 牛客公开题单训练档案

下面 15 个案例来自牛客 AI Coding 公开题单在 2026 年 8 月展示的题目卡片。公开页只披露任务摘要、标签、时长与语言，没有公开完整仓库和全部规则；因此这些页面保留公开考点，用新的训练约束讲解需求澄清、分轮 Prompt、AI 输出审查和验收方法。

<div class="ai-coding-case-grid">
  <a href="./nowcoder-batch-migration-scheduler">
    <span>CASE 07 · 公开卡片训练版</span>
    <h3>批量任务迁移调度引擎</h3>
    <p>先证明可行性单调，再拆出匹配判定器、见证验证和 5,000 规模复杂度预算。</p>
    <small>调度 · Hall 定理 · 匹配见证</small>
  </a>
  <a href="./nowcoder-crdt-store">
    <span>CASE 08 · 公开卡片训练版</span>
    <h3>CRDT 数据类型存储</h3>
    <p>用交换、结合、幂等性质审查四类 CRDT，重点处理唯一标签和稳定冲突决胜。</p>
    <small>分布式系统 · 最终一致性 · 性质测试</small>
  </a>
  <a href="./nowcoder-payroll-calculator">
    <span>CASE 09 · 公开卡片训练版</span>
    <h3>薪资计算器</h3>
    <p>把累计预扣、社保、加班和舍入拆成可版本化、可解释、可对账的金额流水线。</p>
    <small>业务规则 · 金额精度 · 边界金样</small>
  </a>
  <a href="./nowcoder-snake-debugging">
    <span>CASE 10 · 公开卡片训练版</span>
    <h3>贪吃蛇引擎排错</h3>
    <p>用确定性轨迹定位 tick 时序、碰撞、增长、随机食物和重复定时器缺陷。</p>
    <small>游戏引擎 · Debug · 状态机</small>
  </a>
  <a href="./nowcoder-saas-renewal-prediction">
    <span>CASE 11 · 公开卡片训练版</span>
    <h3>SaaS 客户续约预测</h3>
    <p>从标签时间和客户穿越入手审查泄漏，用可信切分、简单基线和消融面对隐藏集。</p>
    <small>数据科学 · 时间切分 · 隐藏 Holdout</small>
  </a>
  <a href="./nowcoder-parking-tui">
    <span>CASE 12 · 公开卡片训练版</span>
    <h3>停车场管理系统</h3>
    <p>三个终端共享权威状态，练习联合状态机、幂等命令、断线恢复和并发不变量。</p>
    <small>多端 TUI · 网络通信 · 幂等</small>
  </a>
  <a href="./nowcoder-hospital-queue-tui">
    <span>CASE 13 · 公开卡片训练版</span>
    <h3>医院叫号系统</h3>
    <p>围绕多诊室并发叫号、队列公平性、只读候诊屏、审计与隐私设计交付证据。</p>
    <small>共享队列 · 并发裁决 · 审计</small>
  </a>
  <a href="./nowcoder-2048-variant">
    <span>CASE 14 · 公开卡片训练版</span>
    <h3>2048 变体规则推断</h3>
    <p>从动画建立观察账本，用区分实验、单行决策表、不变量与变形测试确认规则。</p>
    <small>规格推断 · 游戏逻辑 · 变形测试</small>
  </a>
  <a href="./nowcoder-online-ordering">
    <span>CASE 15 · 公开卡片训练版</span>
    <h3>在线点餐系统 Web 版</h3>
    <p>先固定 VIP、起送和配送费的计算顺序，再做前后端契约、购物车状态与纵向闭环。</p>
    <small>Web 产品 · 价格规则 · 契约测试</small>
  </a>
  <a href="./nowcoder-tob-event-planning">
    <span>CASE 16 · 公开卡片训练版</span>
    <h3>ToB 企业活动策划</h3>
    <p>把空泛活动方案压实为目标树、受众旅程、运行手册、风险演练和复盘指标。</p>
    <small>写作任务 · 行业沙龙 · 落地执行</small>
  </a>
  <a href="./nowcoder-camp-coloring-api">
    <span>CASE 17 · 公开卡片训练版</span>
    <h3>阵营涂色 API 服务</h3>
    <p>从棋盘观察轨迹推断投放、移动和吞并规则，再定义原子 HTTP 命令与性质测试。</p>
    <small>观察式题面 · API · 状态转换</small>
  </a>
  <a href="./nowcoder-camp-coloring-java-biz">
    <span>CASE 18 · 公开卡片训练版</span>
    <h3>阵营涂色 Java Biz</h3>
    <p>在控制层锁定条件下做契约考古、领域变化集、更新模式审查和最小 Diff 验证。</p>
    <small>Java 骨架 · Biz 层 · 锁定接口</small>
  </a>
  <a href="./nowcoder-contact-prefix-api">
    <span>CASE 19 · 公开卡片训练版</span>
    <h3>通讯录前缀查询 API</h3>
    <p>从号码规范化和批量语义出发选择索引，再用慢基线差分验证增删计数。</p>
    <small>前缀索引 · 批处理 · 差分测试</small>
  </a>
  <a href="./nowcoder-contacts-api">
    <span>CASE 20 · 公开卡片训练版</span>
    <h3>通讯录系统 API</h3>
    <p>维护联系人主记录与分类、首字母、号码前缀三个派生索引的一致性。</p>
    <small>CRUD · 多索引 · 更新事务</small>
  </a>
  <a href="./nowcoder-werewolf-intelligence-api">
    <span>CASE 21 · 公开卡片训练版</span>
    <h3>狼人杀情报甄别 API</h3>
    <p>拒绝用游戏常识补题，练习规则证据、批量回放、版本化判定和历史审计。</p>
    <small>规则推断 · 在线判定 · 审计历史</small>
  </a>
</div>

## 一次完整作答应该留下什么

<div class="ai-coding-delivery-matrix" role="table" aria-label="AI Coding 完整作答流程">
  <div class="ai-coding-delivery-matrix__head" role="row">
    <span role="columnheader">阶段</span>
    <span role="columnheader">你要完成的动作</span>
    <span role="columnheader">可以检查的产物</span>
  </div>
  <div class="ai-coding-delivery-matrix__row" role="row">
    <strong role="cell"><i>01</i>读题</strong>
    <span role="cell">圈出输入、输出、约束和交付物</span>
    <span role="cell">一页任务清单</span>
  </div>
  <div class="ai-coding-delivery-matrix__row" role="row">
    <strong role="cell"><i>02</i>探索</strong>
    <span role="cell">找入口、数据结构、测试和运行命令</span>
    <span role="cell">仓库地图</span>
  </div>
  <div class="ai-coding-delivery-matrix__row" role="row">
    <strong role="cell"><i>03</i>计划</strong>
    <span role="cell">拆出最小闭环和可推迟内容</span>
    <span role="cell">有顺序的 TODO</span>
  </div>
  <div class="ai-coding-delivery-matrix__row" role="row">
    <strong role="cell"><i>04</i>协作</strong>
    <span role="cell">给 AI 必要上下文和修改边界</span>
    <span role="cell">可复查的提示记录</span>
  </div>
  <div class="ai-coding-delivery-matrix__row" role="row">
    <strong role="cell"><i>05</i>迭代</strong>
    <span role="cell">一次验证一个假设，根据证据调整 Prompt</span>
    <span role="cell">提问、回答与纠正记录</span>
  </div>
  <div class="ai-coding-delivery-matrix__row" role="row">
    <strong role="cell"><i>06</i>验证</strong>
    <span role="cell">运行测试并补充边界用例</span>
    <span role="cell">命令、输出和失败记录</span>
  </div>
  <div class="ai-coding-delivery-matrix__row" role="row">
    <strong role="cell"><i>07</i>交付</strong>
    <span role="cell">解释实现、取舍、风险和下一步</span>
    <span role="cell">README 与复盘</span>
  </div>
</div>

## 评分视角

题目做得多不等于 AI Coding 表现好。训练时按下面六项逐一打分，每项 0 到 2 分。

<div class="ai-coding-score-grid">
  <article><span>01 · 0—2 分</span><strong>需求理解</strong><p>把含糊描述改写成可以验证的条件。</p></article>
  <article><span>02 · 0—2 分</span><strong>仓库理解</strong><p>快速找到真正需要修改的文件和调用关系。</p></article>
  <article><span>03 · 0—2 分</span><strong>任务拆解</strong><p>先跑通最小闭环，再增加功能和质量。</p></article>
  <article><span>04 · 0—2 分</span><strong>AI 驾驶</strong><p>提供上下文、限制范围，并纠正不合适的建议。</p></article>
  <article><span>05 · 0—2 分</span><strong>验证能力</strong><p>覆盖正常路径、边界、失败路径和回归风险。</p></article>
  <article><span>06 · 0—2 分</span><strong>技术表达</strong><p>独立解释判断、取舍、证据以及没有完成的部分。</p></article>
</div>

<div class="ai-coding-score-note">
  <strong>9 / 12</strong><span>可以完成基本工程任务</span>
  <strong>11 / 12</strong><span>验证证据完整、取舍清楚，并且没有无法解释的 AI 结论</span>
</div>

<section class="ai-coding-sources" aria-labelledby="ai-coding-sources-title">
  <header class="ai-coding-sources__head">
    <span>SOURCE LEDGER / EVIDENCE FIRST</span>
    <h2 id="ai-coding-sources-title">资料边界</h2>
    <p>每条案例先说明信息来自哪里，再决定能还原到什么程度。点击卡片可以回到公开记录核对。</p>
  </header>
  <div class="ai-coding-sources__grid">
    <a href="https://aicoding.nowcoder.com/questionlist" target="_blank" rel="noreferrer">
      <span>公开题单 · 牛客</span><strong>15 道 AI Coding 训练档案</strong><small>NOWCODER ↗</small>
    </a>
    <a href="https://www.nowcoder.com/discuss/865336111655051264?sourceSSR=subject" target="_blank" rel="noreferrer">
      <span>公开记录 · 蚂蚁</span><strong>安全邮箱 AI Coding</strong><small>NOWCODER ↗</small>
    </a>
    <a href="https://www.nowcoder.com/feed/main/detail/6671d50b92f24a229d0e89e5dd19d9bf?urlSource=home-api" target="_blank" rel="noreferrer">
      <span>公开笔经 · 蚂蚁</span><strong>简历筛选与排序</strong><small>NOWCODER ↗</small>
    </a>
    <a href="https://www.nowcoder.com/feed/main/detail/3e0b975bc77d4379bcdd710130f1105f" target="_blank" rel="noreferrer">
      <span>公开面经 · 美团</span><strong>真实仓库需求修改</strong><small>NOWCODER ↗</small>
    </a>
    <a href="https://www.nowcoder.com/feed/main/detail/171cdf9e44f8469e873e0ba74f4cac81" target="_blank" rel="noreferrer">
      <span>公开记录 · 美团</span><strong>智能客服 AI Coding</strong><small>NOWCODER ↗</small>
    </a>
    <a href="https://www.reddit.com/r/leetcode/comments/1sfgtu3/ai_assisted_coding_interview_experience_microsoft/" target="_blank" rel="noreferrer">
      <span>社区复盘 · Microsoft</span><strong>AI 辅助现场编码</strong><small>REDDIT ↗</small>
    </a>
    <a href="https://coderpad.io/blog/hiring-developers/ai-in-the-interview-is-not-cheating-it-is-the-job-according-to-meta/" target="_blank" rel="noreferrer">
      <span>平台观察 · Meta</span><strong>AI 编码面试试点</strong><small>CODERPAD ↗</small>
    </a>
    <a href="https://support.hackerrank.com/articles/5821380141-ai-assisted-interviews" target="_blank" rel="noreferrer">
      <span>官方说明 · HackerRank</span><strong>AI-Assisted Interviews</strong><small>HACKERRANK ↗</small>
    </a>
    <a href="https://support.codesignal.com/hc/en-us/articles/38841637349015-How-can-I-use-Agentic-Interviewing-in-my-recruiting-process" target="_blank" rel="noreferrer">
      <span>官方说明 · CodeSignal</span><strong>Agentic Interviewing</strong><small>CODESIGNAL ↗</small>
    </a>
  </div>
  <div class="ai-coding-boundary-note">
    <strong>使用边界</strong>
    <p>公司、岗位和批次会改变题目与工具权限。页面中的“训练版”由本站根据公开考查形式重新命题，不宣称是对应公司的完整原题。正式面试能否使用外部 AI，以邀请邮件和面试官说明为准。</p>
  </div>
</section>
