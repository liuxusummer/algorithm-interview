import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import ComplexityBadge from './components/ComplexityBadge.vue'
import ProblemCatalog from './components/ProblemCatalog.vue'
import ProblemMeta from './components/ProblemMeta.vue'
import WrittenTestCatalog from './components/WrittenTestCatalog.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('ComplexityBadge', ComplexityBadge)
    app.component('ProblemCatalog', ProblemCatalog)
    app.component('ProblemMeta', ProblemMeta)
    app.component('WrittenTestCatalog', WrittenTestCatalog)
  }
} satisfies Theme
