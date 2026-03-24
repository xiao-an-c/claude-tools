<script setup lang="ts">
import { useData } from 'vitepress'
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import mermaid from 'mermaid'

const props = defineProps<{
  code: string
}>()

const { isDark } = useData()
const theme = computed(() => isDark.value ? 'dark' : 'default')

const diagramRef = ref<HTMLElement | null>(null)
const fullscreenRef = ref<HTMLElement | null>(null)
const fixedHeight = ref('auto')
const rendered = ref(false)
const isFullscreen = ref(false)
const fullscreenRendered = ref(false)

const renderDiagram = async (element: HTMLElement | null, isFullscreenMode = false) => {
  if (!element || !props.code) return

  try {
    mermaid.initialize({
      startOnLoad: false,
      theme: theme.value,
      securityLevel: 'loose',
      gitGraph: { rotateCommitLabel: true },
      flowchart: { useMaxWidth: !isFullscreenMode, htmlLabels: true, curve: 'basis' }
    })

    const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const { svg } = await mermaid.render(id, props.code)
    element.innerHTML = svg

    if (isFullscreenMode) {
      fullscreenRendered.value = true
    } else {
      rendered.value = true
      setTimeout(() => {
        if (diagramRef.value && diagramRef.value.offsetHeight > 0) {
          fixedHeight.value = `${diagramRef.value.offsetHeight}px`
        }
      }, 100)
    }
  } catch (error) {
    console.error('Mermaid render error:', error)
    element.innerHTML = `<pre style="color: var(--vp-c-danger-1); padding: 1rem;">Mermaid 渲染错误</pre>`
    if (isFullscreenMode) {
      fullscreenRendered.value = true
    } else {
      rendered.value = true
    }
  }
}

const openFullscreen = () => {
  isFullscreen.value = true
  document.body.style.overflow = 'hidden'
  nextTick(() => {
    if (fullscreenRef.value) {
      renderDiagram(fullscreenRef.value, true)
    }
  })
}

const closeFullscreen = () => {
  isFullscreen.value = false
  fullscreenRendered.value = false
  document.body.style.overflow = ''
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isFullscreen.value) {
    closeFullscreen()
  }
}

onMounted(() => {
  renderDiagram(diagramRef.value)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})

watch(theme, () => {
  rendered.value = false
  fullscreenRendered.value = false
  nextTick(() => {
    renderDiagram(diagramRef.value)
    if (isFullscreen.value && fullscreenRef.value) {
      renderDiagram(fullscreenRef.value, true)
    }
  })
})
</script>

<template>
  <div class="mermaid-container">
    <div
      ref="diagramRef"
      :class="['mermaid-wrapper', { 'mermaid-rendered': rendered }]"
      :style="{ minHeight: fixedHeight }"
    />
    <button
      v-if="rendered"
      class="mermaid-fullscreen-btn"
      title="全屏查看"
      @click="openFullscreen"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
      </svg>
    </button>

    <!-- 全屏遮罩 -->
    <Teleport to="body">
      <Transition name="fullscreen">
        <div v-if="isFullscreen" class="mermaid-fullscreen-overlay" @click.self="closeFullscreen">
          <div class="mermaid-fullscreen-content">
            <button class="mermaid-close-btn" @click="closeFullscreen">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <div
              ref="fullscreenRef"
              :class="['mermaid-fullscreen-diagram', { 'mermaid-rendered': fullscreenRendered }]"
            />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.mermaid-container {
  position: relative;
}

.mermaid-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1.5rem 0;
  padding: 1.5rem;
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  overflow-x: auto;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.mermaid-wrapper.mermaid-rendered {
  opacity: 1;
}

.mermaid-wrapper svg {
  max-width: 100%;
  height: auto;
}

.mermaid-fullscreen-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
}

.mermaid-container:hover .mermaid-fullscreen-btn {
  opacity: 1;
}

.mermaid-fullscreen-btn:hover {
  background-color: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

/* 全屏遮罩 */
.mermaid-fullscreen-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
}

.mermaid-fullscreen-content {
  position: relative;
  width: 100%;
  max-width: 90vw;
  max-height: 90vh;
  padding: 2rem;
  border-radius: 12px;
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  overflow: auto;
}

.mermaid-close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mermaid-close-btn:hover {
  background-color: var(--vp-c-danger-soft);
  color: var(--vp-c-danger-1);
}

.mermaid-fullscreen-diagram {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.mermaid-fullscreen-diagram.mermaid-rendered {
  opacity: 1;
}

.mermaid-fullscreen-diagram svg {
  max-width: 100%;
  max-height: calc(90vh - 6rem);
}

/* 过渡动画 */
.fullscreen-enter-active,
.fullscreen-leave-active {
  transition: all 0.3s ease;
}

.fullscreen-enter-from,
.fullscreen-leave-to {
  opacity: 0;
}

.fullscreen-enter-from .mermaid-fullscreen-content,
.fullscreen-leave-to .mermaid-fullscreen-content {
  transform: scale(0.9);
}

/* 深色模式 */
html.dark .mermaid-wrapper {
  background-color: var(--vp-c-bg-alt);
}

/* 响应式 */
@media (max-width: 768px) {
  .mermaid-wrapper {
    padding: 1rem;
  }

  .mermaid-fullscreen-overlay {
    padding: 1rem;
  }

  .mermaid-fullscreen-content {
    padding: 1rem;
  }
}
</style>
