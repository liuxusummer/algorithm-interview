import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import ComplexityBadge from './components/ComplexityBadge.vue'
import ProblemMeta from './components/ProblemMeta.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('ComplexityBadge', ComplexityBadge)
    app.component('ProblemMeta', ProblemMeta)
  }
} satisfies Theme
