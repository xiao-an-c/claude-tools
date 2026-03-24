<script setup lang="ts">
import { useData } from 'vitepress'
import { computed, ref, watch, nextTick, onMounted } from 'vue'
import mermaid from 'mermaid'

const props = defineProps<{
  code: string
}>()

const { isDark } = useData()
const theme = computed(() => isDark.value ? 'dark' : 'default')

const diagramRef = ref<HTMLElement | null>(null)
const fixedHeight = ref('auto')
const rendered = ref(false)

const renderDiagram = async () => {
  const element = diagramRef.value
  if (!element || !props.code) return

  try {
    // 初始化 mermaid 配置
    mermaid.initialize({
      startOnLoad: false,
      theme: theme.value,
      securityLevel: 'loose',
      gitGraph: {
        rotateCommitLabel: true
      },
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      }
    })

    // 生成唯一 ID
    const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`

    // 渲染
    const { svg } = await mermaid.render(id, props.code)
    element.innerHTML = svg
    rendered.value = true

    // 捕获高度防止跳动
    setTimeout(() => {
      if (element && element.offsetHeight > 0) {
        fixedHeight.value = `${element.offsetHeight}px`
      }
    }, 100)
  } catch (error) {
    console.error('Mermaid render error:', error)
    element.innerHTML = `<pre style="color: var(--vp-c-danger-1); padding: 1rem;">Mermaid 渲染错误\n${error}</pre>`
    rendered.value = true
  }
}

onMounted(() => {
  renderDiagram()
})

// 监听主题变化，重新渲染
watch(theme, () => {
  rendered.value = false
  nextTick(() => {
    renderDiagram()
  })
})
</script>

<template>
  <div
    ref="diagramRef"
    :class="['mermaid-wrapper', { 'mermaid-rendered': rendered }]"
    :style="{ minHeight: fixedHeight }"
  />
</template>
