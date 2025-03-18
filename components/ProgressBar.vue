<template>
  <div v-if="show" class="w-full">
    <div class="space-y-3">
      <div class="flex justify-between text-sm text-gray-400">
        <span class="flex items-center">
          <span v-if="status === 'generating' || status === 'optimizing'" class="inline-block mr-2">
            <svg class="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          <span v-else-if="status === 'completed'" class="inline-block mr-2 text-green-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </span>
          <span v-else-if="status === 'error'" class="inline-block mr-2 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </span>
          <span>生成进度: {{ current }}/{{ total }}</span>
        </span>
        <span class="font-mono">{{ percentage }}%</span>
      </div>
      
      <div class="w-full h-2 bg-gray-800 rounded-full overflow-hidden relative">
        <!-- 背景动效 -->
        <div 
          v-if="status === 'generating' || status === 'optimizing'"
          class="absolute inset-0 w-full h-full opacity-30"
        >
          <div class="h-full w-3/4 bg-gradient-to-r from-transparent via-blue-400 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
        </div>
        
        <!-- 实际进度条 -->
        <div
          class="h-full transition-all duration-300 rounded-full bg-gradient-to-r"
          :class="[
            status === 'completed' ? 'from-emerald-400 to-green-500' : 
            status === 'error' ? 'from-red-400 to-red-600' : 
            'from-blue-400 to-indigo-600'
          ]"
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
import { computed } from 'vue'

interface Props {
  current: number
  total: number
  status: 'idle' | 'generating' | 'optimizing' | 'completed' | 'error'
}

const props = defineProps<Props>()

const show = computed(() => props.status !== 'idle')

const percentage = computed(() => {
  if (props.total === 0) return 0
  return Math.round((props.current / props.total) * 100)
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
      return 'text-green-500'
    case 'error':
      return 'text-red-500'
    default:
      return 'text-blue-400'
  }
})
</script>

<style>
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>