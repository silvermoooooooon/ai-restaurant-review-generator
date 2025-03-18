<template>
  <div class="bg-white rounded-lg shadow-md p-4 relative hover:shadow-lg transition-shadow">
    <p class="text-gray-800 text-base leading-relaxed mb-4">{{ content }}</p>
    
    <button
      @click="handleCopy"
      class="absolute bottom-4 right-4 px-3 py-1 text-sm rounded-full transition-colors"
      :class="copied ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'"
    >
      {{ copied ? '已复制' : '复制' }}
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  content: string
}>()

const copied = ref(false)

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(props.content)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    console.error('复制失败:', error)
  }
}
</script>