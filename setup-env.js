#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

// 创建readline接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 询问函数
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// 主函数
async function main() {
  console.log('===== AI餐厅点评生成器 - 环境配置助手 =====\n');
  
  // 检查.env文件
  const envPath = path.join(process.cwd(), '.env');
  let envExists = fs.existsSync(envPath);
  let envContent = '';
  
  if (envExists) {
    console.log('发现现有的.env文件');
    envContent = fs.readFileSync(envPath, 'utf8');
    
    const overwrite = await question('是否要重新配置环境变量? (y/n): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('保留现有配置。');
      
      // 显示当前配置
      console.log('\n当前配置:');
      const configs = envContent.split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(line => {
          const [key, value] = line.split('=');
          if (key === 'OPENAI_API_KEY' && value) {
            return `${key}=已设置 (${value.length} 字符)`;
          }
          return line;
        });
      
      console.log(configs.join('\n'));
      rl.close();
      return;
    }
  } else {
    console.log('未找到.env文件，将创建新的配置。');
  }
  
  console.log('\n请输入以下信息:');
  
  // 获取API密钥
  let apiKey = '';
  while (!apiKey) {
    apiKey = await question('OpenAI API密钥 (必填): ');
    if (!apiKey) {
      console.log('API密钥不能为空。');
    }
  }
  
  // 获取API基础URL
  const useCustomApi = await question('是否使用第三方API服务? (y/n, 默认: n): ');
  let baseUrl = 'https://api.openai.com/v1';
  
  if (useCustomApi.toLowerCase() === 'y') {
    baseUrl = await question('API基础URL (例如: http://3.95.6.48:3000): ') || 'http://3.95.6.48:3000';
    
    // 添加协议前缀（如果缺少）
    if (baseUrl && !baseUrl.startsWith('http')) {
      baseUrl = 'http://' + baseUrl;
    }
    
    // 移除URL末尾的/v1（如果存在）
    if (baseUrl.endsWith('/v1')) {
      console.log('注意: 从URL中移除/v1后缀，系统会自动处理。');
      baseUrl = baseUrl.slice(0, -3);
    }
    
    // 移除URL末尾的斜杠
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }
    
    console.log(`最终API基础URL: ${baseUrl}`);
  }
  
  // 获取其他配置
  const model = await question('使用的模型 (默认: gpt-4o-mini): ') || 'gpt-4o-mini';
  const debugMode = await question('启用调试模式? (true/false, 默认: false): ') || 'false';
  
  // 构建.env内容
  const newEnvContent = `# OpenAI API密钥
OPENAI_API_KEY=${apiKey}

# OpenAI API基础URL（使用第三方API时需要）
# 注意：不要在URL末尾添加/v1，系统会自动处理
OPENAI_BASE_URL=${baseUrl}

# 使用的模型名称
OPENAI_MODEL=${model}

# API超时设置（毫秒）
OPENAI_TIMEOUT=30000

# 调试模式
DEBUG=${debugMode}

# 应用配置
NODE_ENV=production
NUXT_HOST=0.0.0.0
NUXT_PORT=3000
`;

  // 写入.env文件
  fs.writeFileSync(envPath, newEnvContent);
  console.log('\n✅ 配置已保存到.env文件');
  
  // 测试配置
  console.log('\n正在测试配置...');
  try {
    console.log('运行API测试脚本:');
    execSync('node debug-api.js', { stdio: 'inherit' });
  } catch (error) {
    console.log('测试过程中出现错误，请查看上方日志以获取详细信息。');
  }
  
  rl.close();
}

// 执行主函数
main().catch(error => {
  console.error('配置过程中出现错误:', error);
  rl.close();
});