import { Configuration, OpenAIApi } from 'openai'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const openai = new OpenAIApi(new Configuration({
    apiKey: config.openaiApiKey
  }))

  const body = await readBody(event)
  const { content } = body

  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '你是一个文本优化助手，你的任务是优化用户输入的店铺介绍文本，使其更加清晰易读，同时保留所有原始信息。'
        },
        {
          role: 'user',
          content
        }
      ]
    })

    return {
      optimizedContent: response.data.choices[0]?.message?.content
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: '优化失败'
    })
  }
})