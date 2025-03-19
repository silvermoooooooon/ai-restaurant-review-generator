import { createChatCompletion } from '../utils/openaiClient'
import { H3Event, createError } from 'h3'
import { getRestaurantDescription } from '../utils/restaurantConfig'

export default defineEventHandler(async (event: H3Event) => {
  const config = useRuntimeConfig()
  
  // 记录配置信息
  console.log(`使用API基础URL: ${config.openaiBaseUrl}`)
  console.log(`使用模型: ${config.openaiModel}`)
  
  // 获取请求参数 - 支持GET
  const query = getQuery(event);
  const count = parseInt(query.count as string || '1');
  
  // 从配置文件读取餐厅描述
  const restaurantDescription = getRestaurantDescription(config.restaurantDescriptionPath)
  
  // 验证餐厅描述
  if (!restaurantDescription) {
    throw createError({
      statusCode: 500,
      message: '无法获取餐厅描述'
    });
  }

  // 设置响应头，使用流式响应
  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  })
  
  // 用户角色、场景和表达方式列表
  const userRoles = ['美食博主', '普通上班族', '年轻情侣', '家庭主妇', '资深吃货', '外地旅客', '商务人士', '学生党', '退休老人', '附近居民']
  const diningScenes = ['朋友聚会', '商务宴请', '家庭聚餐', '情侣约会', '独自用餐', '生日庆祝', '周末休闲', '匆忙午餐', '深夜宵夜', '庆祝纪念日']
  const reviewStyles = ['随意口语', '简短直接', '碎碎念风', '夸张活泼', '接地气吐槽', '日常闲聊', '朋友推荐', '真实记录', '个人体验', '俏皮幽默']
  const casualExpressions = ['真的超级赞👍', '老板人超好', '朋友强烈推荐的', '路过偶然发现', '性价比挺高', '下次还会再来', '服务态度不错', '味道一级棒']
  const fillerWords = ['反正', '就是', '感觉', '说实话', '老实讲', '不得不说', 'emmm', '说真的', '讲道理', '哇塞']
  const endingPhrases = ['推荐打卡~', '强烈安利！', '下次还会再来！', '值得一试！', '绝对不踩雷！', '不枉此行！', '回头客没跑了！', '强推！']

  try {
    const reviewsToGenerate = Math.min(count || 1, 5) // 最多生成5条评论
    console.log(`请求生成 ${reviewsToGenerate} 条评论`)
    
    // 发送总数信息
    event.node.res.write(`data: ${JSON.stringify({ type: 'total', total: reviewsToGenerate })}\n\n`)
    
    // 尝试次数
    let attempts = 0
    const maxAttempts = reviewsToGenerate * 2 // 允许最多两倍的尝试次数
    let generated = 0

    // 使用循环直到生成足够数量的评论或达到最大尝试次数
    while (generated < reviewsToGenerate && attempts < maxAttempts) {
      attempts++
      console.log(`第 ${attempts} 次尝试，当前已生成 ${generated} 条评论`)
      
      // 构建评论生成提示词
      const userRole = userRoles[Math.floor(Math.random() * userRoles.length)]
      const diningScene = diningScenes[Math.floor(Math.random() * diningScenes.length)]
      const reviewStyle = reviewStyles[Math.floor(Math.random() * reviewStyles.length)]
      const casualExpression = casualExpressions[Math.floor(Math.random() * casualExpressions.length)]
      const fillerWord = fillerWords[Math.floor(Math.random() * fillerWords.length)]
      const endingPhrase = endingPhrases[Math.floor(Math.random() * endingPhrases.length)]
      
      // 构建提示词
      const prompt = `作为一个${userRole}，写一篇关于餐厅"${restaurantDescription}"的点评。
      场景是${diningScene}。
      风格要${reviewStyle}，使用口语化表达，比如"${casualExpression}"和"${fillerWord}"等，
      并以"${endingPhrase}"之类的句式结尾。
      字数控制在100-150字之间。`
      
      try {
        // 使用OpenAI客户端发送请求
        console.log(`尝试生成评论 (${attempts}/${maxAttempts})`)
        
        const messages = [
          {
            role: 'system',
            content: '你是一个专业的餐厅点评生成助手，擅长模仿真实用户的口语化表达。'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
        
        const response = await createChatCompletion(config, messages)
        
        // 安全地提取响应内容
        let reviewContent = ''
        
        if (response.choices && response.choices.length > 0) {
          // 使用any类型处理可能的不同响应格式
          const firstChoice = response.choices[0] as any
          
          // 检查标准OpenAI格式
          if (firstChoice.message && firstChoice.message.content) {
            reviewContent = firstChoice.message.content
          } 
          // 检查其他可能的格式
          else if (firstChoice.text) {
            reviewContent = firstChoice.text
          }
          else {
            console.error('未找到有效的响应内容，响应格式:', JSON.stringify(response.choices[0]))
          }
        } else {
          console.error('API响应中没有choices数组或为空')
        }
        
        if (reviewContent) {
          generated++
          console.log(`成功生成一条评论，当前总数: ${generated}`)
          
          // 构建评论对象
          const review = {
            id: `review-${Date.now()}-${generated}`,
            content: reviewContent
          }
          
          // 发送评论到客户端
          event.node.res.write(`data: ${JSON.stringify({ type: 'review', review })}\n\n`)
          
          // 短暂延迟，让前端有时间处理
          await new Promise(resolve => setTimeout(resolve, 100))
        } else {
          console.error('评论内容为空')
        }
      } catch (apiError: any) {
        // 记录API错误但继续生成其他评论
        console.error(`生成评论时出错(尝试 ${attempts}/${maxAttempts}): ${apiError.message}`)
        continue
      }
    }

    console.log(`最终生成了 ${generated} 条评论，请求的数量为 ${reviewsToGenerate}`)
    
    // 发送完成事件
    event.node.res.write(`data: ${JSON.stringify({ type: 'completed', generated })}\n\n`)
    event.node.res.end()
    
    // 如果一条评论都没有生成成功，返回错误
    if (generated === 0) {
      event.node.res.write(`data: ${JSON.stringify({ type: 'error', message: '所有评论生成均失败' })}\n\n`)
      event.node.res.end()
    }
    
    return
  } catch (error) {
    console.error('生成失败:', error)
    // 发送错误事件
    event.node.res.write(`data: ${JSON.stringify({ type: 'error', message: '生成失败' })}\n\n`)
    event.node.res.end()
    return
  }
})