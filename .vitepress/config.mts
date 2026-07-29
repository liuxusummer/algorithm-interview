import { defineConfig } from 'vitepress'
import { sidebar } from './sidebar'

const base = process.env.DEPLOY_BASE ?? '/'

export default defineConfig({
  base,
  lang: 'zh-CN',
  title: '解题现场',
  titleTemplate: ':title · 解题现场',
  description: '面向技术面试的算法题拆解、计算机基础问答、模式归纳与复盘网站',
  cleanUrls: true,

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}favicon.svg` }],
    ['meta', { name: 'theme-color', content: '#11100e' }],
    ['meta', { name: 'color-scheme', content: 'light dark' }]
  ],

  themeConfig: {
    logo: '/favicon.svg',
    siteTitle: '解题现场',

    nav: [
      { text: '开始刷题', link: '/START_HERE' },
      { text: '学习路线', link: '/ROADMAP' },
      { text: '专题模块', link: '/modules/01-complexity/README' },
      { text: '面试真题', link: '/modules/company-interview-questions/README' },
      { text: '笔试真题', link: '/written-tests/README' },
      { text: '题目拆解', link: '/problems/README' },
      {
        text: '面试工具',
        items: [
          { text: '真题数据分析', link: '/ANALYSIS' },
          { text: '高频题单', link: '/tracks/top-interview' },
          { text: '解题模板', link: '/problems/TEMPLATE' },
          { text: '复盘笔记', link: '/notes/SOLUTION_NOTE_TEMPLATE' },
          { text: '学习进度', link: '/progress/DASHBOARD' }
        ]
      }
    ],

    sidebar,

    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索题目、问答与模式',
            buttonAriaLabel: '搜索题目、问答与模式'
          },
          modal: {
            displayDetails: '显示详细结果',
            noResultsText: '没有找到相关内容',
            resetButtonTitle: '清除搜索',
            backButtonTitle: '关闭搜索',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭'
            }
          }
        }
      }
    },

    outline: {
      level: [2, 3],
      label: '本题目录'
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    footer: {
      message: '代码要能运行，思路要能讲清，复杂度要能算对。',
      copyright: '从识别模式，到独立写出。'
    },

    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    sidebarMenuLabel: '训练目录',
    returnToTopLabel: '返回顶部',
    skipToContentLabel: '跳到正文',
    externalLinkIcon: true
  }
})
