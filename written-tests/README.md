---
pageClass: written-test-home
title: 大厂笔试真题
---

<div class="written-test-hero">
  <div class="written-test-hero__copy">
    <span class="written-test-kicker">ACM / REAL INTERVIEWS / PYTHON</span>
    <h1>大厂笔试<br><em>真题档案</em></h1>
    <p>按真实考试场次归档。没有预设函数签名，所有示例都从标准输入读取、向标准输出写入，代码可直接提交到 ACM 评测系统。</p>
    <div class="written-test-actions">
      <a href="./nio-20260726-factorial-square">开始第一题</a>
      <a class="is-ghost" href="#统一-acm-规范">查看答题规范</a>
    </div>
  </div>
  <div class="written-test-hero__ticket" aria-label="当前收录统计">
    <span>EXAM ARCHIVE</span>
    <strong>01</strong>
    <small>场笔试</small>
    <strong>02</strong>
    <small>道完整题解</small>
    <strong>PY</strong>
    <small>统一语言</small>
  </div>
</div>

## 当前场次

<div class="written-test-session">
  <div class="written-test-session__head">
    <span>SESSION 001</span>
    <div>
      <strong>蔚来 · 通用岗</strong>
      <small>2026-07-26 · 数论专题 · 中等偏易</small>
    </div>
  </div>
  <div class="written-test-session__grid">
    <a href="./nio-20260726-factorial-square">
      <span>01 / 数论预处理</span>
      <strong>阶乘平方数</strong>
      <p>阶乘增长、完全平方数判定、批量查询。</p>
      <small>预计 25 分钟 →</small>
    </a>
    <a href="./nio-20260726-linear-combination-count">
      <span>02 / 数论计数</span>
      <strong>线性组合计数</strong>
      <p>裴蜀定理、最大公约数、闭区间倍数统计。</p>
      <small>预计 15 分钟 →</small>
    </a>
  </div>
</div>

## 统一 ACM 规范

本模块与力扣函数模式分开：每道题的最终代码都是一个完整程序，并遵循以下约定。

| 项目 | 统一要求 |
|---|---|
| 输入 | 使用 `sys.stdin.buffer.read()` 或 `sys.stdin.buffer.readline()` |
| 输出 | 使用 `print()` 或一次性 `sys.stdout.write()` |
| 入口 | 把主要流程放入 `solve()`，文件末尾显式调用 |
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

> 题面根据公开笔试资料重新整理，解析、证明和 Python 实现均为本站独立编写。当前场次参考：[Zero2Leetcode · 蔚来通用岗 7.26](https://onefly.top/zero2Leetcode/04_real_interviews/nio/general-20260726/index.html)。
