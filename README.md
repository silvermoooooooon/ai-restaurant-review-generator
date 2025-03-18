# AI 餐厅点评生成器

## 项目简介
这是一个基于 Nuxt 3 + Vue 3 + TailwindCSS 开发的网页应用，用于帮助用户根据店铺介绍自动生成真实、自然的点评内容。

## 功能特点

### 核心功能
1. **简洁的用户界面**
   - 无需登录，直接使用
   - 单页面应用，操作流畅
   - 单一输入框设计，降低使用门槛

2. **信息输入与优化**
   - 单一文本输入框，支持粘贴店铺介绍
   - AI优化功能（可选）
     - 一键优化输入的店铺介绍
     - 保留所有原始信息
     - 重新组织语言，使其更加易读
   - 评论数量选择
     - 支持选择生成数量：1, 3, 5, 10, 30, 50, 100条
     - 默认选择5条

3. **评论生成**
   - 基于输入信息智能生成点评
   - 每条评论约100字
   - 确保评论内容不重复
   - 自然真实的语言风格
   - 生成进度实时显示
     - 进度条显示整体生成进度
     - 显示已生成数量/总数量
     - 预估剩余时间显示

4. **结果展示**
   - 卡片式评论展示
   - 每条评论独立卡片展示
   - 单条评论复制功能
     - 点击复制按钮复制到剪贴板
     - 复制后显示"已复制"状态提示
   - 生成过程状态提示

### 用户体验
1. **界面设计**
   - 简洁现代的界面风格
   - 响应式设计，适配各种设备
   - 清晰的操作引导
   - 优雅的加载动画和进度条

2. **交互体验**
   - 即时的操作反馈
   - 友好的错误提示
   - 流畅的动画效果
   - 复制状态即时反馈
   - 生成进度实时更新

## 技术架构

### 前端技术栈
- **Nuxt 3**: SSR框架
- **Vue 3**: 前端框架
- **TailwindCSS**: UI样式框架
- **OpenAI API**: AI内容生成

### 主要组件结构
```
components/
├── InputSection.vue     # 输入区域组件
│   ├── TextInput.vue    # 文本输入组件
│   └── CountSelect.vue  # 数量选择组件
├── ReviewCard.vue       # 评论卡片组件
├── ReviewList.vue       # 评论列表组件
├── ProgressBar.vue      # 进度条组件
│   ├── LinearProgress.vue  # 线性进度条
│   └── StatusInfo.vue      # 状态信息显示
└── LoadingSpinner.vue   # 加载动画组件

pages/
└── index.vue           # 主页面

composables/
├── useReviewGenerator  # 评论生成逻辑
├── useTextOptimizer    # 文本优化逻辑
└── useProgress        # 进度管理逻辑

types/
└── index.ts           # TypeScript 类型定义
```

## 数据结构

### 输入数据结构
```typescript
interface ReviewInput {
  content: string;      // 店铺介绍内容
  isOptimized: boolean; // 是否经过AI优化
  count: number;        // 生成数量
}
```

### 输出数据结构
```typescript
interface ReviewOutput {
  id: string;           // 唯一标识
  content: string;      // 评论内容
  isCopied: boolean;    // 是否已复制
  timestamp: number;    // 生成时间戳
}
```

### 进度状态结构
```typescript
interface ProgressState {
  current: number;      // 当前已生成数量
  total: number;        // 总需生成数量
  percentage: number;   // 完成百分比
  estimatedTime: number;// 预估剩余时间（秒）
  status: 'idle' | 'generating' | 'optimizing' | 'completed' | 'error';
}
```

## 界面布局
```
+------------------------+
|     输入框区域         |
|                        |
| [文本输入框]           |
|                        |
| [数量选择]             |
| [AI优化] [生成评论]    |
+------------------------+
|     进度显示区域       |
| [进度条]               |
| 已生成: 3/10 预计剩余: 30s|
+------------------------+
|     评论展示区域       |
|                        |
| +--------------------+ |
| |    评论卡片 1      | |
| |                    | |
| | [复制按钮]         | |
| +--------------------+ |
|                        |
| +--------------------+ |
| |    评论卡片 2      | |
| |                    | |
| | [复制按钮]         | |
| +--------------------+ |
|         ...           |
+------------------------+
```

## 使用流程
1. 打开网页应用
2. 在输入框中粘贴店铺介绍
3. 选择需要生成的评论数量
4. （可选）点击"AI优化"按钮优化输入内容
5. 点击"生成评论"按钮
6. 查看生成进度
   - 进度条显示整体完成情况
   - 查看已生成数量和预估剩余时间
7. 点击需要的评论卡片上的复制按钮

## 进度显示详情
1. **进度条组件功能**
   - 显示整体生成进度百分比
   - 平滑动画过渡
   - 不同状态显示不同颜色
     - 生成中：蓝色
     - 完成：绿色
     - 错误：红色
   
2. **状态信息显示**
   - 当前进度：X/Y条
   - 预估剩余时间
   - 当前状态文字提示

## 注意事项
- 建议输入详细的店铺信息以获得更好的生成效果
- 每次生成的评论都是唯一的
- AI优化功能仅对文本结构和可读性进行优化，不会添加或删除信息
- 生成进度和预估时间仅供参考
- 生成大量评论（如50条以上）可能需要较长时间

## 开发说明
1. 安装依赖：
```bash
npm install
```

2. 配置环境变量：
在项目根目录创建 `.env` 文件或运行设置向导：
```bash
npm run setup
```

在 `.env` 文件中配置以下内容：
```
# OpenAI API密钥
OPENAI_API_KEY=your_api_key_here

# API基础URL（使用第三方API时配置）
# 注意：不要在URL末尾添加/v1，系统会自动处理
OPENAI_BASE_URL=http://3.95.6.48:3000

# 使用的模型名称
OPENAI_MODEL=gpt-4o-mini

# API超时设置（毫秒）
OPENAI_TIMEOUT=30000
```

3. 启动开发服务器：
```bash
npm run dev
```

4. 调试API连接（可选）：
```bash
npm run debug:api
```

## API 配置说明

### 关于第三方API配置
- 本项目支持使用官方OpenAI API或第三方兼容的API服务
- 使用第三方API时，需要在 `.env` 文件中设置 `OPENAI_BASE_URL`
- 示例：`OPENAI_BASE_URL=http://3.95.6.48:3000`
- 重要：不要在URL末尾添加 `/v1`，系统会自动处理
- 系统使用 OpenAI 官方 JavaScript 库进行API调用

### 环境变量详解
- `OPENAI_API_KEY`：API密钥（必填）
- `OPENAI_BASE_URL`：API基础URL，不含 `/v1` 路径
- `OPENAI_MODEL`：使用的模型名称，默认为 `gpt-4o-mini`
- `OPENAI_TIMEOUT`：API请求超时时间（毫秒）

## 后续优化方向
1. 支持多语言评论生成
2. 优化生成速度
3. 增加更多评论模板
4. 添加评论风格选择
5. 批量导出功能
6. 优化进度预估算法