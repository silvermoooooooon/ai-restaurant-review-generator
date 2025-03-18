<template>
  <div class="w-full space-y-6">
    <div class="relative group">
      <textarea
        v-model="content"
        class="w-full h-48 px-5 py-4 bg-gray-900/60 text-white rounded-xl border border-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all resize-none"
        placeholder="请输入店铺介绍..."
      ></textarea>
      <div class="absolute inset-px bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-20 pointer-events-none transition-opacity"></div>
    </div>
    
    <div class="flex flex-wrap gap-4 items-center">
      <div class="w-full md:w-auto">
        <div class="relative">
          <select
            v-model="count"
            class="w-full md:w-auto px-5 py-3 appearance-none bg-gray-900/60 text-white rounded-xl border border-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-400 focus:outline-none pr-10 transition-all"
          >
            <option v-for="num in [1, 3, 5, 10, 30, 50, 100]" :key="num" :value="num">
              生成{{ num }}条评论
            </option>
          </select>
          <div class="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      
      <div class="flex gap-3 flex-grow justify-end">
        <button
          @click="handleOptimize"
          :disabled="!content || isProcessing"
          class="relative px-6 py-3 bg-gradient-to-br from-gray-700 to-gray-900 text-white rounded-xl overflow-hidden transition-all
                 hover:shadow-lg hover:shadow-gray-600/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none 
                 disabled:from-gray-800 disabled:to-gray-800 group"
        >
          <span class="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-800 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 disabled:opacity-0"></span>
          <span class="relative flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
            </svg>
            AI优化
          </span>
        </button>
        
        <button
          @click="handleGenerate"
          :disabled="!content || isProcessing"
          class="relative px-6 py-3 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-xl overflow-hidden transition-all
                 hover:shadow-lg hover:shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none 
                 disabled:from-blue-800 disabled:to-blue-800 group"
        >
          <span class="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 disabled:opacity-0"></span>
          <span class="relative flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
            </svg>
            生成评论
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const content = ref('')
const count = ref(5)
const isProcessing = ref(false)

const emit = defineEmits(['optimize', 'generate'])

const handleOptimize = () => {
  if (!content.value || isProcessing.value) return
  isProcessing.value = true
  emit('optimize', content.value)
}

const handleGenerate = () => {
  if (!content.value || isProcessing.value) return
  isProcessing.value = true
  emit('generate', {
    content: content.value,
    count: count.value
  })
}

// 重置处理状态
const resetProcessing = () => {
  isProcessing.value = false
}

// 更新输入内容
const updateContent = (newContent: string) => {
  content.value = newContent
}

// 暴露方法给父组件
defineExpose({
  resetProcessing,
  updateContent
})
</script>