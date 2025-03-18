<template>
  <div class="bg-gray-800/70 backdrop-blur-sm border border-gray-700 rounded-xl p-5 relative hover:shadow-lg hover:shadow-blue-900/20 transition-all group">
    <!-- 顶部装饰 -->
    <div class="absolute -top-px left-4 right-4 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-70"></div>
    
    <!-- 内容 -->
    <p class="text-gray-300 text-base leading-relaxed mb-4">{{ content }}</p>
    
    <!-- 复制按钮 -->
    <button
      @click="handleCopy"
      class="absolute bottom-4 right-4 px-4 py-1.5 rounded-full transition-all flex items-center text-sm backdrop-blur-sm"
      :class="copied ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'"
    >
      <span v-if="copied" class="mr-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      </span>
      <span v-else class="mr-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
        </svg>
      </span>
      {{ copied ? '已复制' : '复制' }}
    </button>
    
    <!-- 点评底部装饰 -->
    <div class="absolute -bottom-px left-4 right-4 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-70 transition-opacity"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  content: string
}>()

const copied = ref(false)

const handleCopy = async () => {
  try {
    // 尝试使用现代Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(props.content)
    } else {
      // 后备方案：使用传统方法
      const textarea = document.createElement('textarea')
      textarea.value = props.content
      textarea.style.position = 'fixed'  // 避免滚动到底部
      textarea.style.opacity = '0'
      textarea.style.pointerEvents = 'none'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      
      // 执行复制命令
      const successful = document.execCommand('copy')
      if (!successful) {
        throw new Error('复制命令失败')
      }
      
      // 清理
      document.body.removeChild(textarea)
    }
    
    // 显示成功状态
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    console.error('复制失败:', error)
    alert('复制失败，请手动复制文本')
  }
}
</script>