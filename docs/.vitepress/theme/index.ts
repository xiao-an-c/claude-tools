import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import mermaid from 'mermaid'

import './style.css'

export default {
  extends: DefaultTheme,

  setup() {
    const route = useRoute()

    const initMermaid = () => {
      // 初始化 mermaid
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        gitGraph: {
          rotateCommitLabel: true
        }
      })

      // 查找所有 mermaid 容器
      const mermaidElements = document.querySelectorAll('.mermaid')
      mermaidElements.forEach(async (el, index) => {
        const code = el.textContent?.trim()
        if (code) {
          try {
            const id = `mermaid-${index}`
            const { svg } = await mermaid.render(id, code)
            el.innerHTML = svg
          } catch (error) {
            console.error('Mermaid render error:', error)
            el.innerHTML = `<pre style="color: red;">Mermaid 渲染错误</pre>`
          }
        }
      })
    }

    onMounted(() => {
      initMermaid()
    })

    watch(
      () => route.path,
      () => {
        nextTick(() => {
          initMermaid()
        })
      }
    )
  }
} satisfies Theme
