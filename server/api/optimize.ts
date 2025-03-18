import { createChatCompletion } from '../utils/openaiClient'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  // 记录配置信息
  console.log(`使用API基础URL: ${config.openaiBaseUrl}`)
  console.log(`使用模型: ${config.openaiModel}`)
  
  const body = await readBody(event)
  const { content } = body

  try {
    console.log('尝试优化内容...')
    
    // 使用OpenAI客户端发送请求
    const messages = [
      {
        role: 'system',
        content: '你是一个文本优化助手，你的任务是优化用户输入的店铺介绍文本，使其更加清晰易读，同时保留所有原始信息。'
      },
      {
        role: 'user',
        content
      }
    ]
    
    const response = await createChatCompletion(config, messages)
    
    // 安全地提取响应内容，考虑不同的API响应格式
    let optimizedContent = ''
    
    // 打印完整响应以便调试
    console.log('API响应结构:', JSON.stringify({
      has_choices: !!response.choices,
      choices_length: response.choices?.length,
      first_choice: response.choices?.[0] ? JSON.stringify(response.choices[0]) : null
    }))
    
    if (response.choices && response.choices.length > 0) {
      // 将firstChoice定义为any类型以便灵活访问可能的字段
      const firstChoice = response.choices[0] as any
      
      // 检查是否有message.content字段（标准OpenAI格式）
      if (firstChoice.message && firstChoice.message.content) {
        optimizedContent = firstChoice.message.content
      } 
      // 后备方案：检查其他可能的字段
      else if (firstChoice.text) {
        optimizedContent = firstChoice.text
      }
      // 最后的后备方案：如果没有找到内容，返回原始内容并记录错误
      else {
        console.error('未找到有效的响应内容字段，响应结构:', JSON.stringify(response))
        optimizedContent = content
      }
    } else {
      console.error('API响应中没有choices数组或为空，响应结构:', JSON.stringify(response))
      optimizedContent = content
    }
    
    if (!optimizedContent) {
      console.warn('优化后的内容为空，返回原始内容')
      optimizedContent = content
    }
    
    return { optimizedContent }
  } catch (error: any) {
    console.error('优化失败:', error.message)
    // 出错时返回原始内容，避免用户体验中断
    return { 
      optimizedContent: content,
      error: error.message
    }
  }
})