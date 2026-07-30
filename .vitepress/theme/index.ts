import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'
import BinarySearchDemo from './components/BinarySearchDemo.vue'
import ComplexityBadge from './components/ComplexityBadge.vue'
import InorderTraversalDemo from './components/InorderTraversalDemo.vue'
import ProblemCatalog from './components/ProblemCatalog.vue'
import ProblemFrequencyNav from './components/ProblemFrequencyNav.vue'
import ProblemMeta from './components/ProblemMeta.vue'
import ReverseLinkedListDemo from './components/ReverseLinkedListDemo.vue'
import SlidingWindowDemo from './components/SlidingWindowDemo.vue'
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
    app.component('BinarySearchDemo', BinarySearchDemo)
    app.component('ComplexityBadge', ComplexityBadge)
    app.component('InorderTraversalDemo', InorderTraversalDemo)
    app.component('ProblemCatalog', ProblemCatalog)
    app.component('ProblemMeta', ProblemMeta)
    app.component('ReverseLinkedListDemo', ReverseLinkedListDemo)
    app.component('SlidingWindowDemo', SlidingWindowDemo)
    app.component('WrittenTestCatalog', WrittenTestCatalog)
  }
} satisfies Theme
