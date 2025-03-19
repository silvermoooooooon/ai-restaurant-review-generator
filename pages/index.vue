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
          丝路驼铃·西域食府
        </h1>
        
      </header>
      
      <div class="max-w-5xl mx-auto">
        <ProgressBar
          v-if="progress.status !== 'idle' && progress.status !== 'completed'"
          :current="progress.current"
          :total="progress.total"
          :status="progress.status"
          class="mb-8"
        />
        
        <ReviewList
          v-if="reviews.length > 0"
          :reviews="reviews"
          @regenerate="handleRegenerate"
        />
        
        <div 
          v-if="reviews.length === 0 && progress.status === 'idle'"
          class="flex justify-center my-8"
        >
          <button
            @click="handleGenerate"
            class="px-6 py-3 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-xl overflow-hidden transition-all
                   hover:shadow-lg hover:shadow-blue-600/20 group"
          >
            <span class="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300"></span>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import ProgressBar from '~/components/ProgressBar.vue'
import ReviewList from '~/components/ReviewList.vue'

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

// 处理评论生成
const handleGenerate = async () => {
  try {
    reviews.value = []
    progress.status = 'generating'
    progress.total = 1 // 默认只生成一条评论
    progress.current = 0
    
    // 创建事件源连接
    const eventSourceUrl = `/api/generate?count=1`
    const eventSource = new EventSource(eventSourceUrl)
    
    // 处理消息事件
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        switch (data.type) {
          case 'total':
            // 更新总数
            progress.total = data.total
            break
            
          case 'review':
            // 添加新评论
            reviews.value.push(data.review)
            progress.current++
            break
            
          case 'completed':
            // 处理完成
            progress.status = 'completed'
            eventSource.close()
            break
            
          case 'error':
            // 处理错误
            console.error('生成错误:', data.message)
            progress.status = 'error'
            eventSource.close()
            setTimeout(() => {
              resetProgress()
            }, 2000)
            break
        }
      } catch (e) {
        console.error('解析事件数据失败:', e)
      }
    }
    
    // 处理错误
    eventSource.onerror = (error) => {
      console.error('EventSource错误:', error)
      progress.status = 'error'
      eventSource.close()
      setTimeout(() => {
        resetProgress()
      }, 2000)
    }
  } catch (error) {
    console.error('生成失败:', error)
    progress.status = 'error'
    setTimeout(() => {
      resetProgress()
    }, 2000)
  }
}

// 处理重新生成
const handleRegenerate = () => {
  handleGenerate() // 直接调用生成函数
}

// 页面加载时自动生成评论
onMounted(() => {
  handleGenerate()
})
</script>