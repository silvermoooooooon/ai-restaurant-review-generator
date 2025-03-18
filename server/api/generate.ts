import { Configuration, OpenAIApi } from 'openai'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const openai = new OpenAIApi(new Configuration({
    apiKey: config.openaiApiKey
  }))

  const body = await readBody(event)
  const { content, count } = body

  try {
    const reviews = []
    for (let i = 0; i < count; i++) {
      const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的餐厅点评撰写专家。请根据提供的店铺信息，生成一条约100字的真实、自然的好评。评价要具体，要包含菜品特色和用餐体验，语气要自然。'
          },
          {
            role: 'user',
            content
          }
        ]
      })

      const reviewContent = response.data.choices[0]?.message?.content
      if (reviewContent) {
        reviews.push(reviewContent)
      }
    }

    return { reviews }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: '生成失败'
    })
  }
})