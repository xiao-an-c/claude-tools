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

    const initMermaid = async () => {
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

      for (let index = 0; index < mermaidElements.length; index++) {
        const el = mermaidElements[index] as HTMLElement
        const code = el.textContent?.trim()
        if (code) {
          try {
            const id = `mermaid-${Date.now()}-${index}`
            const { svg } = await mermaid.render(id, code)
            // 创建新的 div 替换 pre
            const div = document.createElement('div')
            div.className = 'mermaid-svg'
            div.innerHTML = svg
            el.parentNode?.replaceChild(div, el)
          } catch (error) {
            console.error('Mermaid render error:', error)
            el.style.display = 'block'
            el.style.color = 'red'
            el.textContent = `Mermaid 渲染错误: ${error}`
          }
        }
      }
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
