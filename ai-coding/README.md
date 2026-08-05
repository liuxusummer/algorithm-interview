---
layout: page
sidebar: true
aside: false
pageClass: ai-coding-hub
title: AI Coding
description: 用真实工程任务训练需求拆解、代码库理解、AI 协作、测试验证与交付复盘。
---

<div class="ai-coding-hero">
  <div class="ai-coding-hero__copy">
    <p>AI PAIR PROGRAMMING / FIELD MANUAL / 2026</p>
    <h1>AI Coding<br><em>实战档案</em></h1>
    <div class="ai-coding-hero__rule"></div>
    <p class="ai-coding-hero__lead">拿到陌生需求，先定义完成条件；让 AI 动手之后，用代码审查、测试和证据决定能不能交付。</p>
  </div>
  <div class="ai-coding-hero__console" aria-label="AI Coding 训练流程">
    <span>01 / READ</span><strong>读需求与仓库</strong>
    <span>02 / PLAN</span><strong>拆任务与风险</strong>
    <span>03 / BUILD</span><strong>小步实现</strong>
    <span>04 / VERIFY</span><strong>测试与解释</strong>
    <i>READY FOR REVIEW</i>
  </div>
</div>

<div class="ai-coding-manifesto">
  <strong>专题目标</strong>
  <p>这里不评选“最会写提示词的人”。每个案例都要求你在有限时间里留下可以运行的代码、可以复现的测试、可以说明的取舍，以及没有被 AI 悄悄带入项目的错误假设。</p>
</div>

## 案例目录

公开面经提供的信息完整程度不同。本专题将案例分为“公开题目拆解”和“公开形式训练版”。
前者可以核对到较完整的任务描述，后者只采用公开出现过的考查形式，训练需求和代码由本站重新设计。

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
    <p>在已有 Python 服务中修复分页缺陷、加入幂等写入，并控制修改范围。</p>
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
    <p>用堆维护服务器负载，检查 AI 代码中的陈旧节点、并列规则和输入边界。</p>
    <small>Microsoft · Live Coding · AI 辅助</small>
  </a>
  <a href="./codebase-debugging">
    <span>CASE 06 · 海外形式训练版</span>
    <h3>多文件代码库排错</h3>
    <p>根据失败测试定位四类缺陷，练习受限 AI 环境下的代码阅读和验证。</p>
    <small>Meta / Stripe 类形式 · Code Repo · Debug</small>
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
    <strong role="cell"><i>05</i>实现</strong>
    <span role="cell">一次完成一个可验证的小改动</span>
    <span role="cell">小范围 diff</span>
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
  <article><span>06 · 0—2 分</span><strong>技术表达</strong><p>独立解释提交的代码以及没有完成的部分。</p></article>
</div>

<div class="ai-coding-score-note">
  <strong>9 / 12</strong><span>可以完成基本工程任务</span>
  <strong>11 / 12</strong><span>测试证据完整、取舍清楚，并且没有无法解释的生成代码</span>
</div>

## 资料边界

- [蚂蚁集团安全邮箱 AI Coding 公开记录](https://www.nowcoder.com/discuss/865336111655051264?sourceSSR=subject)
- [蚂蚁集团简历筛选 AI Coding 笔经](https://www.nowcoder.com/feed/main/detail/6671d50b92f24a229d0e89e5dd19d9bf?urlSource=home-api)
- [美团全栈实习 AI Coding 面经](https://www.nowcoder.com/feed/main/detail/3e0b975bc77d4379bcdd710130f1105f)
- [美团智能客服 AI Coding 记录](https://www.nowcoder.com/feed/main/detail/171cdf9e44f8469e873e0ba74f4cac81)
- [Microsoft AI 辅助编码社区复盘](https://www.reddit.com/r/leetcode/comments/1sfgtu3/ai_assisted_coding_interview_experience_microsoft/)
- [CoderPad 对 Meta AI 编码试点的介绍](https://coderpad.io/blog/hiring-developers/ai-in-the-interview-is-not-cheating-it-is-the-job-according-to-meta/)
- [HackerRank AI 辅助面试说明](https://support.hackerrank.com/articles/5821380141-ai-assisted-interviews)
- [CodeSignal Agentic Interviewing 说明](https://support.codesignal.com/hc/en-us/articles/38841637349015-How-can-I-use-Agentic-Interviewing-in-my-recruiting-process)

公司、岗位和批次会改变题目与工具权限。页面中的“训练版”是本站根据公开形式重新命题，
用于练习，不宣称是对应公司的完整原题。正式面试中是否允许使用外部 AI，以邀请邮件和
面试官说明为准。
