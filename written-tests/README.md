---
pageClass: written-test-home
title: 大厂笔试真题
---

<div class="written-test-hero">
  <div class="written-test-hero__copy">
    <span class="written-test-kicker">ACM / REAL INTERVIEWS / PYTHON</span>
    <h1>大厂笔试<br><em>真题档案</em></h1>
    <p>按“公司 → 日期与岗位 → 具体题目”三级归档。算法场次全部从标准输入读取、向标准输出写入；AI Coding 单独记录系统设计、工程实现与交付过程。</p>
    <div class="written-test-actions">
      <a href="#场次检索">浏览全部场次</a>
      <a class="is-ghost" href="./ANALYSIS">查看数据分析</a>
      <a class="is-ghost" href="#统一-acm-规范">查看答题规范</a>
    </div>
  </div>
  <div class="written-test-hero__ticket" aria-label="当前收录统计">
    <span>EXAM ARCHIVE</span>
    <strong>106</strong>
    <small>场真实笔试</small>
    <strong>311</strong>
    <small>道算法题</small>
    <strong>01</strong>
    <small>场 AI Coding</small>
  </div>
</div>

<div class="written-test-hierarchy" aria-label="真题三级目录结构">
  <span><small>LEVEL 01</small><strong>公司</strong></span>
  <i>→</i>
  <span><small>LEVEL 02</small><strong>日期 · 岗位</strong></span>
  <i>→</i>
  <span><small>LEVEL 03</small><strong>具体题目</strong></span>
</div>

## 场次检索

<WrittenTestCatalog />

## 真题数据分析

本站对全部 **106 场笔试、311 道算法题**做了统一统计，包含难度分布、算法频次、常见算法组合、公司侧重点、岗位差异和四周备考计划。

[查看《大厂笔试真题数据分析》 →](./ANALYSIS)

## AI Coding 趋势观察

AI Coding 已经从“补全一个函数”转向“在限定时间内交付一个可以运行、可以测试、可以说明的完整工程”。本站把这类题与传统算法笔试分开，重点训练：

- 先把自然语言需求拆成数据模型、状态机、接口与验收标准；
- 让 AI 分模块实现，每一步都提供明确输入、输出和完成条件；
- 优先保证主链路可运行，再补异常处理、持久化、权限和界面；
- 最后用自动化测试与 README 证明交付物真实可用。

第一份专题：[蚂蚁 AI Coding · 终端早餐店系统](./ant-20260329-ai-coding)。

## 统一 ACM 规范

本模块与力扣函数模式分开：每道题的最终代码都是一个完整程序，并遵循以下约定。

| 项目 | 统一要求 |
|---|---|
| 输入 | 与原场次保持一致；全部 106 场均提供完整 `stdin` 读取流程 |
| 输出 | 严格按题面逐行 `print()`，需要批量输出时使用 `"\\n".join(...)` |
| 入口 | 单测题调用一次 `solve()`；多测题先读取 `T`，再逐组调用 |
| 类型 | 根据数据范围主动判断是否需要 64 位整数或大整数 |
| 样例 | 展示完整标准输入和标准输出，不省略测试组数 |
| 讲解 | 包含建模、优化抓手、正确性证明、复杂度和易错点 |
| 语言 | 全部使用 Python 3，关键逻辑配中文注释 |

## 推荐训练方式

1. 先只阅读题目、输入输出和数据范围；
2. 用 5 分钟写出暴力方案并估算复杂度；
3. 再阅读“关键观察”，确认优化来自哪个数学性质；
4. 关闭题解，独立写出完整 `solve()`；
5. 用样例、最小边界和极值数据验证输入输出；
6. 最后用 90 秒讲清正确性与复杂度。

> 题面根据公开笔试资料重新整理，并统一为本站的三级目录和 Python ACM 阅读格式。参考来源：[Zero2Leetcode · 大厂笔试真题目录](https://onefly.top/zero2Leetcode/04_real_interviews/)，覆盖阿里、蚂蚁、美团、华为、拼多多、网易、哔哩哔哩、科大讯飞、携程、得物、字节跳动、米哈游、虾皮、上海 AI Lab、荣耀、DeepSeek、百度和蔚来；每个场次页均保留对应公开来源链接。
