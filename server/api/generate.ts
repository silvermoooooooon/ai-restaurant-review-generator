import { Configuration, OpenAIApi } from 'openai'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const openai = new OpenAIApi(new Configuration({
    apiKey: config.openaiApiKey
  }))

  const body = await readBody(event)
  const { content, count } = body

  // 用户角色列表
  const userRoles = [
    '美食博主', '普通上班族', '年轻情侣', '家庭主妇', '资深吃货', 
    '外地旅客', '商务人士', '学生党', '退休老人', '附近居民'
  ]
  
  // 就餐场景列表
  const diningScenes = [
    '朋友聚会', '商务宴请', '家庭聚餐', '情侣约会', '独自用餐',
    '生日庆祝', '周末休闲', '匆忙午餐', '深夜宵夜', '庆祝纪念日'
  ]
  
  // 评论风格列表 - 更偏向口语化的风格
  const reviewStyles = [
    '随意口语', '简短直接', '碎碎念风', '夸张活泼', '接地气吐槽',
    '日常闲聊', '朋友推荐', '真实记录', '个人体验', '俏皮幽默'
  ]
  
  // 添加真实用户常用表达方式
  const casualExpressions = [
    '真的超级赞👍', '老板人超好', '朋友强烈推荐的', '路过偶然发现',
    '性价比挺高', '下次还会再来', '服务态度不错', '味道一级棒',
    '环境还可以', '排队等了好久', '人均不算贵', '菜量挺足的'
  ]
  
  // 添加常见口头禅和语气词
  const fillerWords = [
    '反正', '就是', '感觉', '说实话', '老实讲', '不得不说',
    'emmm', '说真的', '讲道理', '哇塞', '反正就是', '不过'
  ]
  
  // 添加常见的结尾词
  const endingPhrases = [
    '推荐打卡~', '强烈安利！', '下次还会再来！', '值得一试！',
    '绝对不踩雷！', '不枉此行！', '回头客没跑了！', '强推！'
  ]

  try {
    const reviews = []
    for (let i = 0; i < count; i++) {
      // 随机选择用户角色、场景、风格
      const role = userRoles[Math.floor(Math.random() * userRoles.length)]
      const scene = diningScenes[Math.floor(Math.random() * diningScenes.length)]
      const style = reviewStyles[Math.floor(Math.random() * reviewStyles.length)]
      
      // 随机选择1-2个常用表达
      const numExpressions = Math.floor(Math.random() * 2) + 1
      const selectedExpressions: string[] = []
      for (let j = 0; j < numExpressions; j++) {
        const expression = casualExpressions[Math.floor(Math.random() * casualExpressions.length)]
        if (!selectedExpressions.includes(expression)) {
          selectedExpressions.push(expression)
        }
      }
      
      // 随机选择1-2个口头禅
      const numFillers = Math.floor(Math.random() * 2) + 1
      const selectedFillers: string[] = []
      for (let j = 0; j < numFillers; j++) {
        const filler = fillerWords[Math.floor(Math.random() * fillerWords.length)]
        if (!selectedFillers.includes(filler)) {
          selectedFillers.push(filler)
        }
      }
      
      // 随机选择结尾短语
      const ending = endingPhrases[Math.floor(Math.random() * endingPhrases.length)]
      
      const systemPrompt = `你需要生成一条真实的餐厅点评，听起来像真人写的，不要太书面化或文艺腔。

请以"${role}"的身份，描述在"${scene}"场景下的用餐体验，但要用"${style}"的风格写，让评论听起来像是社交媒体上普通人随手发的。

评论中必须包含这些口语化表达：${selectedExpressions.join('、')}
也要用上这些语气词或口头禅：${selectedFillers.join('、')}
可以用这个结尾：${ending}

要求：
1. 使用简短句子，避免过于华丽的词藻和复杂的修辞
2. 加入一些语法不完全严谨的表达，模仿口语化交流
3. 保持语言随意性，像朋友间的闲聊
4. 可以适当使用emoji表情、网络用语
5. 不要使用"感官盛宴"、"美丽画卷"这类文艺化表达
6. 避免过于结构化的评论，要有真实感
7. 总字数控制在60-100字左右

记住：要让人一看就觉得是普通消费者写的，而不是专业文案`

      const response = await openai.createChatCompletion({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content
          }
        ],
        temperature: 0.8 + Math.random() * 0.2 // 增加随机性，范围0.8-1.0
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