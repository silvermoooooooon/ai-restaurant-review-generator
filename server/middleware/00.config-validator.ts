// 配置验证中间件 - 在应用启动时验证关键配置
export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  
  // 验证API密钥
  if (!config.openaiApiKey) {
    console.error('❌ 错误: 缺少OpenAI API密钥 (OPENAI_API_KEY)')
    console.error('请确保在环境变量或.env文件中设置有效的API密钥')
  } else {
    const apiKeyLength = config.openaiApiKey.length
    console.log(`✓ 检测到OpenAI API密钥 (长度: ${apiKeyLength})`)
  }
  
  // 验证API基础URL
  if (config.openaiBaseUrl) {
    try {
      // 尝试解析URL以验证格式
      new URL(config.openaiBaseUrl)
      console.log(`✓ 使用API基础URL: ${config.openaiBaseUrl}`)
      
      // 如果不是官方API，提供额外信息
      if (config.openaiBaseUrl !== 'https://api.openai.com/v1') {
        console.log('📢 使用第三方API服务')
        
        // 检查URL格式
        if (config.openaiBaseUrl.endsWith('/v1')) {
          console.log('注意: URL末尾包含/v1，OpenAI客户端库将使用无/v1的基础URL')
        } else {
          console.log('注意: URL末尾不包含/v1，OpenAI客户端库将直接使用此URL')
        }
      }
    } catch (e) {
      console.error(`❌ 错误: 无效的API基础URL: ${config.openaiBaseUrl}`)
    }
  } else {
    console.log('✓ 使用默认OpenAI API基础URL (https://api.openai.com/v1)')
  }
  
  // 以明显的方式显示关键配置状态
  console.log('\n=== 🔑 API配置状态 ===')
  console.log(`API密钥: ${config.openaiApiKey ? '已设置 ✓' : '未设置 ❌'}`)
  console.log(`API URL: ${config.openaiBaseUrl || 'https://api.openai.com/v1'}`)
  if (config.debug) {
    console.log('调试模式: 已启用')
  }
  console.log('=====================\n')
})