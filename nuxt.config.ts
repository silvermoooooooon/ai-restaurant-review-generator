export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxtjs/tailwindcss'
  ],
  app: {
    head: {
      title: 'AI 餐厅点评生成器',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '基于 AI 的餐厅菜品点评生成器，自动生成真实、多样的顾客好评' }
      ]
    }
  },
  runtimeConfig: {
    openaiApiKey: process.env.OPENAI_API_KEY
  }
})