# API连接问题排查指南

## 问题现象

当使用第三方OpenAI兼容API服务时，可能会遇到以下问题：

1. **401 Unauthorized错误** - 虽然直接使用curl命令可以成功调用API，但通过应用程序调用时出现认证错误
2. **404 Not Found错误** - API端点无法访问
3. **响应格式不匹配** - API返回了响应但应用无法正确处理

## 常见原因

### 1. URL格式问题

OpenAI客户端库处理URL的方式可能与直接使用curl命令不同：

- OpenAI客户端库会自动在basePath后添加`/v1`，如果您提供的URL已经包含`/v1`，会导致重复
- 某些第三方API可能需要不同的路径结构

### 2. 认证问题

- API密钥格式不正确
- 认证头格式与第三方API要求不匹配

### 3. 请求格式问题

- 模型名称不兼容
- 请求参数格式不符合第三方API要求

## 解决步骤

### 步骤1: 运行诊断脚本

我们提供了一个专门的诊断脚本来帮助排查问题：

```bash
npm run debug:api
```

此脚本会：
- 检查环境变量配置
- 分析API URL格式
- 测试网络连通性
- 使用两种不同方式测试API连接
- 提供详细的诊断信息

### 步骤2: 根据诊断结果调整配置

1. **如果直接URL测试成功但OpenAI库方式失败**：

   编辑`.env`文件，根据成功的测试方式调整`OPENAI_BASE_URL`：
   
   - 如果原URL为`https://example.com/v1`，尝试改为`https://example.com`
   - 如果原URL为`https://example.com`，尝试改为`https://example.com/v1`

2. **如果遇到模型兼容性问题**：

   编辑`.env`文件，调整使用的模型名称：
   
   ```
   OPENAI_MODEL=适合您API提供商的模型名称
   ```

3. **如果需要调整超时设置**：

   ```
   OPENAI_TIMEOUT=60000  # 增加到60秒
   ```

4. **启用调试模式查看更多信息**：

   ```
   DEBUG=true
   ```

### 步骤3: 检查第三方API文档

不同的API提供商可能有特定的要求：

- **智谱AI**：可能需要特定的模型名称和认证头格式
- **文心一言**：可能需要额外的认证参数
- **Azure OpenAI**：需要特定的API版本和部署名称

请参阅您的API提供商文档，确保配置正确。

## 特定提供商的配置示例

### 示例1: 通用第三方API

```
OPENAI_API_KEY=your_api_key_here
OPENAI_BASE_URL=https://api.example.com
OPENAI_MODEL=gpt-4o-mini
```

### 示例2: Azure OpenAI

```
OPENAI_API_KEY=your_azure_api_key
OPENAI_BASE_URL=https://your-resource-name.openai.azure.com
OPENAI_API_VERSION=2023-05-15
OPENAI_MODEL=deployment-name
```

## 手动测试API

如果您想直接测试API，可以使用以下curl命令：

```bash
curl "https://your-api-endpoint/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

## 联系支持

如果您尝试了上述所有步骤后仍然遇到问题：

1. 查看应用程序日志以获取详细错误信息：
   ```bash
   docker logs ai-restaurant-review-generator
   ```

2. 将诊断脚本输出和错误信息提供给API服务提供商的技术支持

3. 确认您使用的第三方API是否完全兼容OpenAI API格式