# 算法面试讲解站

这是一个面向技术面试的算法学习与讲解网站。项目重点不是堆积题目数量，而是为每道题保留一条可检查的推理链：

[在线访问](https://liuxusummer.github.io/algorithm-interview/)

[大厂真题数据分析](./ANALYSIS)基于 123 道高频面试题与 105 场真实笔试，整理出现次数、难度分布、算法频次和公司侧重点。

```text
读懂约束 → 给出暴力方案 → 找到优化抓手
         → 写出正确代码 → 验证边界 → 分析复杂度 → 面试复述
```

## 技术栈

- VitePress 1.6
- Vue 3 与 TypeScript（站点主题）
- Python 3（全部算法实现）
- pnpm workspace
- Markdown 内容驱动
- 自定义 VitePress 主题与 Vue 讲解组件

## 本地开发

项目通过 `.npmrc` 固定使用 npm 官方公共仓库，不依赖任何公司内部 registry。

```bash
pnpm install
pnpm docs:dev
```

构建与预览：

```bash
pnpm docs:build
pnpm docs:preview
```

## 目录说明

| 目录 | 用途 |
|---|---|
| `.vitepress/` | 站点配置、导航、主题和 Vue 组件 |
| `modules/` | 按知识结构组织的专题讲解 |
| `problems/` | 单题拆解与统一题解模板 |
| `written-tests/` | 大厂笔试场次、ACM 模式题解与完整 Python 程序 |
| `tracks/` | 高频题单与岗位训练路径 |
| `notes/` | 个人复盘和口述练习模板 |
| `progress/` | 学习进度、复习计划和通关记录 |
| `docs/` | 内容标准与项目说明 |
| `public/` | 图标和静态资源 |
