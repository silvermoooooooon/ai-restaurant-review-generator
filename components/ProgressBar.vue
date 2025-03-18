<template>
  <div v-if="show" class="w-full max-w-4xl mx-auto p-4">
    <div class="space-y-2">
      <div class="flex justify-between text-sm text-gray-600">
        <span>生成进度: {{ current }}/{{ total }}</span>
        <span>预计剩余时间: {{ estimatedTimeText }}</span>
      </div>
      
      <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          class="h-full transition-all duration-300 rounded-full"
          :class="progressBarColor"
          :style="{ width: `${percentage}%` }"
        ></div>
      </div>
      
      <div class="text-sm text-center" :class="statusTextColor">
        {{ statusText }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  current: number
  total: number
  status: 'idle' | 'generating' | 'optimizing' | 'completed' | 'error'
  estimatedTime?: number
}

const props = withDefaults(defineProps<Props>(), {
  estimatedTime: 0
})

const show = computed(() => props.status !== 'idle')

const percentage = computed(() => {
  if (props.total === 0) return 0
  return Math.round((props.current / props.total) * 100)
})

const progressBarColor = computed(() => {
  switch (props.status) {
    case 'completed':
      return 'bg-green-500'
    case 'error':
      return 'bg-red-500'
    default:
      return 'bg-blue-500'
  }
})

const statusText = computed(() => {
  switch (props.status) {
    case 'generating':
      return '正在生成评论...'
    case 'optimizing':
      return '正在优化文本...'
    case 'completed':
      return '生成完成！'
    case 'error':
      return '生成出错，请重试'
    default:
      return ''
  }
})

const statusTextColor = computed(() => {
  switch (props.status) {
    case 'completed':
      return 'text-green-600'
    case 'error':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
})

const estimatedTimeText = computed(() => {
  if (props.estimatedTime <= 0) return '计算中...'
  return `${Math.ceil(props.estimatedTime)}秒`
})
</script>