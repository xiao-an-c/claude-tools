<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  code: string
}>()

const containerRef = ref<HTMLDivElement>()
const svgContent = ref('')

onMounted(async () => {
  if (!props.code) return

  try {
    // 动态导入 mermaid
    const mermaid = (await import('mermaid')).default

    // 初始化
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose'
    })

    // 生成唯一 ID
    const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`

    // 渲染
    const { svg } = await mermaid.render(id, props.code)
    svgContent.value = svg
  } catch (error) {
    console.error('Mermaid render error:', error)
    svgContent.value = `<pre style="color: red;">图表渲染错误</pre>`
  }
})
</script>

<template>
  <div ref="containerRef" class="mermaid-wrapper" v-html="svgContent"></div>
</template>

<style>
.mermaid-wrapper {
  margin: 1rem 0;
  padding: 1rem;
  text-align: center;
  overflow-x: auto;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
}

.mermaid-wrapper svg {
  max-width: 100%;
  height: auto;
}
</style>
