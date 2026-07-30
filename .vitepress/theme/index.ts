import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'
import ComplexityBadge from './components/ComplexityBadge.vue'
import ProblemCatalog from './components/ProblemCatalog.vue'
import ProblemFrequencyNav from './components/ProblemFrequencyNav.vue'
import ProblemMeta from './components/ProblemMeta.vue'
import WrittenTestCatalog from './components/WrittenTestCatalog.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'doc-after': () => h(ProblemFrequencyNav)
    })
  },
  enhanceApp({ app }) {
    app.component('ComplexityBadge', ComplexityBadge)
    app.component('ProblemCatalog', ProblemCatalog)
    app.component('ProblemMeta', ProblemMeta)
    app.component('WrittenTestCatalog', WrittenTestCatalog)
  }
} satisfies Theme
