// API连接调试脚本
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config();

// 显示环境变量详细信息
console.log('====== 环境变量详细信息 ======');
// 从环境变量中获取API密钥
const apiKey = process.env.OPENAI_API_KEY;
// 定义displayKey变量（用于安全显示）
let displayKey = '未设置';

if (apiKey) {
  console.log('OPENAI_API_KEY: 已设置 ✓');
  console.log(`  长度: ${apiKey.length} 字符`);
  console.log(`  格式: ${apiKey.startsWith('sk-') ? '标准OpenAI格式 (sk-...)' : '非标准格式'}`);
  
  // 安全显示API密钥 - 仅显示前10和后4个字符，中间部分用星号替换
  if (apiKey.length > 14) {
    displayKey = apiKey.substring(0, 10) + '*'.repeat(apiKey.length - 14) + apiKey.slice(-4);
  } else {
    // 密钥太短，只显示前2个和后2个字符
    displayKey = apiKey.substring(0, 2) + '*'.repeat(apiKey.length - 4) + apiKey.slice(-2);
  }
  console.log(`  API密钥值: ${displayKey}`);
} else {
  console.log('❌ OPENAI_API_KEY: 未设置');
  console.log('  请在.env文件中设置OPENAI_API_KEY');
}

// 检查.env文件是否存在
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log('\n.env文件: 存在 ✓');
  try {
    // 读取.env文件内容
    const envContent = fs.readFileSync(envPath, 'utf8');
    // 检查是否包含API密钥（不显示实际值）
    const hasApiKey = envContent.includes('OPENAI_API_KEY=');
    console.log(`.env文件中包含OPENAI_API_KEY设置: ${hasApiKey ? '是 ✓' : '否 ✗'}`);
    
    if (hasApiKey && !apiKey) {
      console.log('⚠️ 警告: .env文件中有API密钥但环境变量未正确加载');
    }
  } catch (error) {
    console.log(`无法读取.env文件: ${error.message}`);
  }
} else {
  console.log('\n❌ .env文件不存在');
  console.log('  请从.env.example复制并创建.env文件');
}

console.log('\nOPENAI_BASE_URL:', process.env.OPENAI_BASE_URL || '未设置（将使用默认值: https://api.openai.com/v1）');
console.log('=====================\n');

// 如果没有API密钥，测试将失败
if (!apiKey) {
  console.log('❌ 错误: 缺少API密钥，无法进行测试');
  console.log('请按照以下步骤设置API密钥：');
  console.log('1. 复制.env.example文件为.env');
  console.log('2. 在.env文件中设置OPENAI_API_KEY=你的API密钥');
  console.log('3. 重新运行此脚本');
  process.exit(1);
}

// 解析并处理基础URL
let baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
let isOfficial = baseUrl === 'https://api.openai.com/v1';
let requestUrl = '';
let apiPath = '/v1/chat/completions';

// 构建请求URL（模拟OpenAI官方库的URL构建逻辑）
if (!isOfficial) {
  // 处理自定义API基础URL
  let basePath = baseUrl;
  
  // OpenAI库会自动附加/v1，所以如果用户的URL已经包含了/v1，需要先移除
  if (basePath.endsWith('/v1')) {
    console.log('检测到基础URL末尾包含/v1');
    console.log('⚠️ 注意: OpenAI官方库会自动添加/v1，建议从环境变量中移除');
    basePath = basePath.slice(0, -3);
  }
  
  // 确保basePath不以斜杠结尾
  if (basePath.endsWith('/')) {
    basePath = basePath.slice(0, -1);
  }
  
  // OpenAI库构造的最终URL会是：basePath + /v1 + /chat/completions
  requestUrl = `${basePath}/v1/chat/completions`;
  console.log('OpenAI库使用方式: basePath + /v1 + /chat/completions');
} else {
  requestUrl = baseUrl + '/chat/completions';
}

console.log('\n====== API URL分析 ======');
console.log(`原始基础URL: ${baseUrl}`);
console.log(`OpenAI库内部会构造的请求URL: ${requestUrl}`);

// 进行URL有效性检查
try {
  const url = new URL(requestUrl);
  console.log(`URL协议: ${url.protocol}`);
  console.log(`URL主机: ${url.hostname}`);
  console.log(`URL路径: ${url.pathname}`);
  console.log('URL格式有效 ✓');
} catch (error) {
  console.log('URL格式无效 ✗');
  console.error(error.message);
}

// 网络连通性测试
console.log('\n====== 网络连通性测试 ======');
const hostname = new URL(baseUrl).hostname;
try {
  console.log(`正在测试与 ${hostname} 的网络连通性...`);
  // 使用ping命令测试网络连接
  const pingResult = execSync(`ping -c 3 ${hostname}`).toString();
  console.log('网络连接正常 ✓');
} catch (error) {
  console.log('网络连接异常 ✗');
  console.error(error.message);
}

// 为curl构建安全的命令
const authHeader = `Authorization: Bearer ${apiKey}`;
const curlCommand = `curl -s -o response.json -w "%{http_code}" "${requestUrl}" \\
  -H "Content-Type: application/json" \\
  -H "${authHeader}" \\
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 5
  }'`;

// 第二种请求方式 - 直接构建完整路径
let directRequestUrl = '';
// 确保baseUrl不以斜杠结尾
let cleanBaseUrl = baseUrl;
if (cleanBaseUrl.endsWith('/')) {
  cleanBaseUrl = cleanBaseUrl.slice(0, -1);
}

// 如果baseUrl已经包含/v1，直接添加/chat/completions
if (cleanBaseUrl.endsWith('/v1')) {
  directRequestUrl = `${cleanBaseUrl}/chat/completions`;
} else {
  // 否则添加/v1/chat/completions
  directRequestUrl = `${cleanBaseUrl}/v1/chat/completions`;
}

const curlCommand2 = `curl -s -o response2.json -w "%{http_code}" "${directRequestUrl}" \\
  -H "Content-Type: application/json" \\
  -H "${authHeader}" \\
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 5
  }'`;

console.log('\n====== API连接测试 ======');
console.log('测试1: 使用OpenAI库内部处理方式');
console.log(`请求URL: ${requestUrl}`);
console.log('请求头:');
console.log(`  Content-Type: application/json`);
console.log(`  Authorization: Bearer ${displayKey}`);
console.log('请求体:');
console.log(`  {
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 5
  }`);
try {
  console.log('正在测试API连接...');
  const statusCode = execSync(curlCommand).toString().trim();
  console.log(`API响应状态码: ${statusCode}`);
  
  if (statusCode === '200') {
    console.log('✅ API连接成功!');
    const response = JSON.parse(fs.readFileSync('response.json', 'utf8'));
    console.log('\n响应内容预览:');
    console.log(JSON.stringify(response, null, 2).substring(0, 300) + '...');
  } else {
    console.log('❌ API连接失败');
    if (fs.existsSync('response.json')) {
      const response = fs.readFileSync('response.json', 'utf8');
      console.log('\n错误响应:');
      console.log(response);
    }
  }
} catch (error) {
  console.log('❌ API连接测试遇到错误:');
  console.error(error.message);
}

console.log('\n测试2: 直接使用完整路径');
console.log(`请求URL: ${directRequestUrl}`);
console.log('请求头:');
console.log(`  Content-Type: application/json`);
console.log(`  Authorization: Bearer ${displayKey}`);
console.log('请求体:');
console.log(`  {
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 5
  }`);
try {
  console.log('正在测试API连接...');
  const statusCode = execSync(curlCommand2).toString().trim();
  console.log(`API响应状态码: ${statusCode}`);
  
  if (statusCode === '200') {
    console.log('✅ API连接成功!');
    const response = JSON.parse(fs.readFileSync('response2.json', 'utf8'));
    console.log('\n响应内容预览:');
    console.log(JSON.stringify(response, null, 2).substring(0, 300) + '...');
  } else {
    console.log('❌ API连接失败');
    if (fs.existsSync('response2.json')) {
      const response = fs.readFileSync('response2.json', 'utf8');
      console.log('\n错误响应:');
      console.log(response);
    }
  }
} catch (error) {
  console.log('❌ API连接测试遇到错误:');
  console.error(error.message);
}

// 清理临时文件
if (fs.existsSync('response.json')) {
  fs.unlinkSync('response.json');
}
if (fs.existsSync('response2.json')) {
  fs.unlinkSync('response2.json');
}

// 输出调试建议
console.log('\n====== 故障排除建议 ======');
console.log('1. 如果测试1和测试2都失败:');
console.log('   - 检查API密钥是否正确');
console.log('   - 验证网络连接和防火墙设置');
console.log('   - 确认API服务是否可用');

console.log('\n2. 如果一个测试成功，一个测试失败:');
console.log('   - 根据成功的测试调整应用配置');
if (!isOfficial) {
  console.log('   - 确保OPENAI_BASE_URL不包含/v1后缀，因为OpenAI库会自动添加');
  console.log(`   - 当前配置的baseURL: ${baseUrl}`);
  console.log(`   - 推荐的baseURL格式: http://3.95.6.48:3000`);
}

console.log('\n3. 可直接使用的完整curl命令:');
console.log('   • 测试方式1 (OpenAI库方式):');
console.log(`   curl "${requestUrl}" \\
   -H "Content-Type: application/json" \\
   -H "Authorization: Bearer ${apiKey}" \\
   -d '{"model": "gpt-4o-mini", "messages": [{"role": "user", "content": "Hello"}]}'`);

console.log('\n   • 测试方式2 (直接路径):');
console.log(`   curl "${directRequestUrl}" \\
   -H "Content-Type: application/json" \\
   -H "Authorization: Bearer ${apiKey}" \\
   -d '{"model": "gpt-4o-mini", "messages": [{"role": "user", "content": "Hello"}]}'`);

console.log('\n4. 示例命令(替换API密钥):');
console.log('   测试方式1 (OpenAI库方式):');
console.log(`   curl "${requestUrl}" \\
   -H "Content-Type: application/json" \\
   -H "Authorization: Bearer YOUR_API_KEY" \\
   -d '{"model": "gpt-4o-mini", "messages": [{"role": "user", "content": "Hello"}]}'`);

console.log('\n   测试方式2 (直接路径):');
console.log(`   curl "${directRequestUrl}" \\
   -H "Content-Type: application/json" \\
   -H "Authorization: Bearer YOUR_API_KEY" \\
   -d '{"model": "gpt-4o-mini", "messages": [{"role": "user", "content": "Hello"}]}'`);

console.log('========================');