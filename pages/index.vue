<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white py-8 relative overflow-hidden">
    <!-- 背景装饰元素 -->
    <div class="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
      <div class="absolute top-0 left-0 w-full h-full">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      <div class="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-blue-500 opacity-20 blur-3xl"></div>
      <div class="absolute top-1/3 -left-20 w-80 h-80 rounded-full bg-purple-500 opacity-20 blur-3xl"></div>
      <div class="absolute bottom-0 right-1/3 w-60 h-60 rounded-full bg-cyan-400 opacity-20 blur-3xl"></div>
    </div>
    
    <div class="container mx-auto px-4 relative z-10">
      <header class="mb-12 text-center">
        <h1 class="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          AI 餐厅点评生成器
        </h1>
        <p class="text-gray-300 max-w-2xl mx-auto">
          基于先进的AI技术，轻松生成真实、自然的餐厅点评内容
        </p>
      </header>
      
      <div class="max-w-5xl mx-auto">
        <div class="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700 p-6 mb-8">
          <InputSection
            ref="inputSection"
            @optimize="handleOptimize"
            @generate="handleGenerate"
          />
        </div>
        
        <ProgressBar
          v-if="progress.status !== 'idle'"
          :current="progress.current"
          :total="progress.total"
          :status="progress.status"
          class="mb-8"
        />
        
        <ReviewList
          v-if="reviews.length > 0"
          :reviews="reviews"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import InputSection from '~/components/InputSection.vue'
import ProgressBar from '~/components/ProgressBar.vue'
import ReviewList from '~/components/ReviewList.vue'

const inputSection = ref(null)
const reviews = ref<Array<{ id: string; content: string }>>([])
const progress = reactive({
  current: 0,
  total: 0,
  status: 'idle' as 'idle' | 'generating' | 'optimizing' | 'completed' | 'error'
})

// 重置进度
const resetProgress = () => {
  progress.current = 0
  progress.total = 0
  progress.status = 'idle'
}

// 处理AI优化
const handleOptimize = async (content: string) => {
  try {
    progress.status = 'optimizing'
    progress.total = 1
    progress.current = 0
    
    const response = await $fetch<{ optimizedContent: string }>('/api/optimize', {
      method: 'POST',
      body: { content }
    })
    
    if (response && response.optimizedContent) {
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
    
    const response = await $fetch<{ reviews: string[] }>('/api/generate', {
      method: 'POST',
      body: { content, count }
    })
    
    if (response && response.reviews) {
      // 模拟逐条生成效果
      const addReviewsProgressively = () => {
        const interval = setInterval(() => {
          if (progress.current < response.reviews.length) {
            reviews.value.push({
              id: `review-${Date.now()}-${progress.current}`,
              content: response.reviews[progress.current]
            })
            progress.current++
          } else {
            clearInterval(interval)
            progress.status = 'completed'
            setTimeout(() => {
              inputSection.value?.resetProcessing()
            }, 2000)
          }
        }, 300) // 每300毫秒添加一条评论
      }
      
      addReviewsProgressively()
    } else {
      progress.status = 'error'
      setTimeout(() => {
        resetProgress()
        inputSection.value?.resetProcessing()
      }, 2000)
    }
  } catch (error) {
    console.error('生成失败:', error)
    progress.status = 'error'
    setTimeout(() => {
      resetProgress()
      inputSection.value?.resetProcessing()
    }, 2000)
  }
}
</script>