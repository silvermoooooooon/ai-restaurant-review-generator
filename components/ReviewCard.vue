<template>
  <div class="bg-gray-800/70 backdrop-blur-sm border border-gray-700 rounded-xl p-5 relative hover:shadow-lg hover:shadow-blue-900/20 transition-all group">
    <!-- 顶部装饰 -->
    <div class="absolute -top-px left-4 right-4 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-70"></div>
    
    <!-- 内容 -->
    <p class="text-gray-300 text-base leading-relaxed mb-4">{{ content }}</p>
    
    <!-- 按钮组 -->
    <ReviewCardActions 
      :content="content"
      @regenerate="$emit('regenerate')"
    />
    
    <!-- 点评底部装饰 -->
    <div class="absolute -bottom-px left-4 right-4 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-70 transition-opacity"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ReviewCardActions from './ReviewCardActions.vue'

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

defineEmits(['regenerate'])
</script>