<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4">
      <h1 class="text-3xl font-bold text-center text-gray-800 mb-8">
        AI 餐厅点评生成器
      </h1>
      
      <InputSection
        ref="inputSection"
        @optimize="handleOptimize"
        @generate="handleGenerate"
      />
      
      <ProgressBar
        v-if="progress.status !== 'idle'"
        v-bind="progress"
      />
      
      <ReviewList
        v-if="reviews.length > 0"
        :reviews="reviews"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import InputSection from '~/components/InputSection.vue'
import ProgressBar from '~/components/ProgressBar.vue'
import ReviewList from '~/components/ReviewList.vue'

const inputSection = ref()
const reviews = ref<Array<{ id: string; content: string }>>([])
const progress = reactive({
  current: 0,
  total: 0,
  status: 'idle' as 'idle' | 'generating' | 'optimizing' | 'completed' | 'error',
  estimatedTime: 0
})

// 计算预估时间
const calculateEstimatedTime = (remaining: number) => {
  return remaining * 2 // 简单估算，每条评论2秒
}

// 重置进度
const resetProgress = () => {
  progress.current = 0
  progress.total = 0
  progress.status = 'idle'
  progress.estimatedTime = 0
}

// 处理AI优化
const handleOptimize = async (content: string) => {
  try {
    progress.status = 'optimizing'
    progress.total = 1
    progress.current = 0
    
    const response = await $fetch('/api/optimize', {
      method: 'POST',
      body: { content }
    })
    
    if (response.optimizedContent) {
      inputSection.value?.updateContent(response.optimizedContent)
    }
    
    progress.current = 1
    progress.status = 'completed'
  } catch (error) {
    console.error('优化失败:', error)
    progress.status = 'error'
  } finally {
    setTimeout(() => {
      resetProgress()
      inputSection.value?.resetProcessing()
    }, 2000)
  }
}

// 处理评论生成
const handleGenerate = async ({ content, count }: { content: string; count: number }) => {
  try {
    reviews.value = []
    progress.status = 'generating'
    progress.total = count
    progress.current = 0
    progress.estimatedTime = calculateEstimatedTime(count)
    
    const response = await $fetch('/api/generate', {
      method: 'POST',
      body: { content, count }
    })
    
    if (response.reviews) {
      reviews.value = response.reviews.map((content: string, index: number) => ({
        id: `review-${Date.now()}-${index}`,
        content
      }))
    }
    
    progress.current = count
    progress.status = 'completed'
  } catch (error) {
    console.error('生成失败:', error)
    progress.status = 'error'
  } finally {
    setTimeout(() => {
      resetProgress()
      inputSection.value?.resetProcessing()
    }, 2000)
  }
}
</script>