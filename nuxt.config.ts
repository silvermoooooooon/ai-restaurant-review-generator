// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    openaiBaseUrl: process.env.OPENAI_BASE_URL,
    openaiApiVersion: process.env.OPENAI_API_VERSION,
    openaiModel: process.env.OPENAI_MODEL,
    openaiTimeout: process.env.OPENAI_TIMEOUT,
    debug: process.env.DEBUG === 'true',
    restaurantDescriptionPath: process.env.RESTAURANT_DESCRIPTION_PATH || './config/restaurant.txt'
  },
  app: {
    head: {
      title: 'AI餐厅点评生成器',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'AI餐厅点评生成器 - 自动生成真实自然的餐厅点评' }
      ]
    }
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  compatibilityDate: '2025-03-18'
})