import fs from 'fs'
import path from 'path'

/**
 * 读取餐厅描述文件
 * @returns 餐厅描述文本
 */
export function getRestaurantDescription(configPath: string): string {
  try {
    // 确保路径是绝对路径
    const absolutePath = path.isAbsolute(configPath)
      ? configPath
      : path.resolve(process.cwd(), configPath)
    
    // 检查文件是否存在
    if (!fs.existsSync(absolutePath)) {
      console.warn(`餐厅描述文件不存在: ${absolutePath}，使用默认描述`)
      return '我们的餐厅提供精致美味的菜品，优雅舒适的环境和热情周到的服务，欢迎您的光临。'
    }
    
    // 读取文件内容
    const description = fs.readFileSync(absolutePath, 'utf-8')
    return description.trim()
  } catch (error) {
    console.error('读取餐厅描述文件失败:', error)
    return '我们的餐厅提供精致美味的菜品，优雅舒适的环境和热情周到的服务，欢迎您的光临。'
  }
} 