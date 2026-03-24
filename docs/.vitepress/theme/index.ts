import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import Mermaid from '../components/Mermaid.vue'

import './style.css'

export default {
  extends: DefaultTheme,

  enhanceApp({ app }) {
    // 注册全局 Mermaid 组件
    app.component('Mermaid', Mermaid)
  }
} satisfies Theme
