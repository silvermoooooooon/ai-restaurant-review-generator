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
  const endingPhrases = ['挺不错的', '有空再去', '下次还会去', '还可以吧', '不错~', '还想吃', '试试看', '可以去', '蛮推荐的', '好吃']

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
      
      // 随机决定是否包含负面评价
      const includeNegative = Math.random() > 0.7 // 30%几率包含负面评价
      const sentimentInstruction = includeNegative 
        ? "写1-2个具体菜品的真实感受，大部分是喜欢的，但也可以提一点小缺点，如等位时间长、某道菜略咸、价格稍贵等小问题。" 
        : "写1-2个具体菜品的真实感受，表达你的喜欢，不要提负面评价。"
      
      // 构建提示词
      const prompt = `作为${userRole}，写一条关于餐厅"${restaurantDescription}"的真实点评。
      场景是${diningScene}。
      用口语化、日常生活中的表达方式，不要用书面语，不要用"伴侣"这样的词，用"对象"、"男/女朋友"、"老公/老婆"等更日常的词语。
      风格是${reviewStyle}，语气要自然随意，像朋友圈日常吐槽，包含真实情绪和主观感受。
      可以用"${casualExpression}"和"${fillerWord}"等口头禅。
      ${sentimentInstruction}
      用自然的标点，可以省略标点，或者用感叹号、省略号等表达情绪，不要太规范。
      避免不自然的表达，如"打动了我的味蕾"、"舌尖上的享受"、"唇齿留香"等文艺或广告用语，用"好吃"、"真香"、"超赞"等日常表达。
      避免使用太夸张的感叹词，如"呀"、"哇"、"啊"等，保持情绪表达克制真实。
      随机添加1-2个常见的错别字或用词不当，例如把"环境"打成"环竟"、"味道"打成"味到"、"特别"打成"特变"、用"在"代替"再"等。
      避免使用"绝对值得一试"、"强烈安利"、"绝对不踩雷"等夸张的表达，用"挺好的"、"还可以"、"有空可以去"等更平实的表达。
      绝对不要用markdown格式（如**加粗**）。
      最后以"${endingPhrase}"之类的方式结尾，但要自然口语化。
      控制在100-150字。`
      
      try {
        // 使用OpenAI客户端发送请求
        console.log(`尝试生成评论 (${attempts}/${maxAttempts})，包含负面评价: ${includeNegative}`)
        
        const messages = [
          {
            role: 'system',
            content: '你是一个真实餐厅点评生成助手，完全模拟普通人的说话方式。使用大量口语词汇，避免书面语和规范标点。添加1-2个常见错别字以增加真实感。情绪表达要克制，避免夸张感叹。评论应该包含真实情感，' + 
            (includeNegative ? '有喜欢的也有不满意的小细节，但总体评价是正面的。' : '以正面情绪为主，不包含负面评价。') + 
            '像普通人朋友圈分享一样。绝对不使用markdown格式，保持原生文本。'
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