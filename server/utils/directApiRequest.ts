/**
 * 直接API请求工具 - 不依赖OpenAI客户端库，直接请求API
 * 用于处理OpenAI客户端库URL构建问题的备用方案
 */

// 导入fetch
import fetch from 'node-fetch'

/**
 * 直接向OpenAI兼容API发送请求
 * @param config 运行时配置
 * @param endpoint API端点（不包含基础URL）
 * @param body 请求体
 * @returns API响应
 */
export async function directApiRequest(config: any, endpoint: string, body: any) {
  // 获取API基础URL和密钥
  let baseUrl = config.openaiBaseUrl || 'https://api.openai.com/v1'
  const apiKey = config.openaiApiKey
  
  if (!apiKey) {
    throw new Error('API密钥未设置')
  }
  
  // 确保URL末尾没有斜杠
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1)
  }
  
  // 确保endpoint开头有斜杠
  if (!endpoint.startsWith('/')) {
    endpoint = '/' + endpoint
  }
  
  // 构建完整URL
  let fullUrl = ''
  
  // 如果baseUrl已包含/v1，直接使用
  if (baseUrl.endsWith('/v1')) {
    fullUrl = `${baseUrl}${endpoint}`
  } else {
    // 否则添加/v1
    fullUrl = `${baseUrl}/v1${endpoint}`
  }
  
  console.log(`API请求URL: ${fullUrl}`)
  
  try {
    // 发送API请求
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API请求失败: 状态码 ${response.status}`)
      console.error(`响应内容: ${errorText}`)
      throw new Error(`API请求失败: 状态码 ${response.status}`)
    }
    
    return await response.json()
  } catch (error: any) {
    console.error(`API请求失败: ${error.message}`)
    throw error
  }
}