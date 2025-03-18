<template>
  <div class="w-full max-w-4xl mx-auto p-4 space-y-4">
    <div class="relative">
      <textarea
        v-model="content"
        class="w-full h-40 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="请输入店铺介绍..."
      ></textarea>
    </div>
    
    <div class="flex items-center space-x-4">
      <select
        v-model="count"
        class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option v-for="num in [1, 3, 5, 10, 30, 50, 100]" :key="num" :value="num">
          生成{{ num }}条评论
        </option>
      </select>
      
      <button
        @click="handleOptimize"
        :disabled="!content || isProcessing"
        class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        AI优化
      </button>
      
      <button
        @click="handleGenerate"
        :disabled="!content || isProcessing"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        生成评论
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
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