/**
 * OpenAI API客户端工具类
 * 使用官方OpenAI Node.js库
 */

import { Configuration, OpenAIApi } from 'openai'
import fetch from 'node-fetch'

// 定义API响应类型
interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * 创建OpenAI API客户端
 */
export function createOpenAIClient(config: any) {
  // 获取必要配置
  const apiKey = config.openaiApiKey
  let baseURL = config.openaiBaseUrl

  // 验证API密钥
  if (!apiKey) {
    throw new Error('未设置OpenAI API密钥，请在.env文件中设置OPENAI_API_KEY')
  }

  // 验证基础URL
  if (!baseURL) {
    throw new Error('未设置OpenAI API基础URL，请在.env文件中设置OPENAI_BASE_URL')
  }

  // 确保baseURL不以/v1结尾，因为OpenAI库会自动添加
  if (baseURL.endsWith('/v1')) {
    baseURL = baseURL.slice(0, -3)
  }

  // 确保baseURL不以斜杠结尾
  if (baseURL.endsWith('/')) {
    baseURL = baseURL.slice(0, -1)
  }

  console.log(`创建OpenAI客户端：使用基础URL ${baseURL}`)

  // 创建OpenAI配置
  const configuration = new Configuration({
    apiKey,
    basePath: baseURL
  })

  // 创建API实例
  return new OpenAIApi(configuration)
}

/**
 * 发送聊天完成请求 - 直接使用fetch，避免OpenAI库处理响应造成的问题
 */
export async function createChatCompletion(config: any, messages: any[], options: any = {}) {
  // 获取必要配置
  const apiKey = config.openaiApiKey
  let baseURL = config.openaiBaseUrl
  const model = config.openaiModel
  
  // 验证配置
  if (!apiKey) {
    throw new Error('未设置OpenAI API密钥，请在.env文件中设置OPENAI_API_KEY')
  }
  
  if (!baseURL) {
    throw new Error('未设置OpenAI API基础URL，请在.env文件中设置OPENAI_BASE_URL')
  }
  
  if (!model) {
    throw new Error('未设置OpenAI模型名称，请在.env文件中设置OPENAI_MODEL')
  }
  
  // 处理baseURL
  let url = baseURL
  if (url.endsWith('/')) {
    url = url.slice(0, -1)
  }
  
  // 如果不以/v1结尾，则添加
  if (!url.endsWith('/v1')) {
    url = `${url}/v1`
  }
  
  // 添加端点
  url = `${url}/chat/completions`
  
  console.log(`直接fetch请求API: ${url}`)
  
  // 计算超时
  let timeout: number | undefined
  if (config.openaiTimeout) {
    timeout = parseInt(config.openaiTimeout)
    if (isNaN(timeout)) {
      console.warn('无效的timeout设置，将使用默认值')
      timeout = 30000
    }
  } else {
    timeout = 30000 // 默认30秒超时
  }
  
  try {
    // 使用fetch直接请求API
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        ...options
      }),
      // @ts-ignore - node-fetch类型定义问题
      timeout
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API请求失败: ${response.status} ${errorText}`)
    }
    
    const data = await response.json() as ChatCompletionResponse
    
    // 记录响应结构用于调试
    console.log('API响应结构:', JSON.stringify({
      has_choices: !!data.choices,
      choices_length: data.choices?.length,
      first_choice_keys: data.choices?.[0] ? Object.keys(data.choices[0]) : null,
      message_exists: !!data.choices?.[0]?.message,
      message_keys: data.choices?.[0]?.message ? Object.keys(data.choices[0].message) : null
    }))
    
    return data
  } catch (error: any) {
    console.error(`API请求失败: ${error.message}`)
    throw error
  }
} 