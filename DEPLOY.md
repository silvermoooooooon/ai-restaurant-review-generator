# Docker 部署指南

## 前置需求

- 安装 [Docker](https://docs.docker.com/get-docker/)
- 安装 [Docker Compose](https://docs.docker.com/compose/install/) (可选，但推荐)
- 获取 [OpenAI API Key](https://platform.openai.com/) 或第三方兼容API服务的密钥

## 使用 Docker Compose 部署（推荐）

1. 复制示例环境变量文件并填写你的配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，设置以下配置：

```
# OpenAI API密钥
OPENAI_API_KEY=your_openai_api_key_here

# OpenAI API基础URL（使用第三方API时需要）
OPENAI_BASE_URL=https://your-api-provider.com/v1
```

> **注意**：如果使用官方OpenAI API，可以保留默认的`OPENAI_BASE_URL=https://api.openai.com/v1`。
> 如果使用第三方兼容API服务，请将`OPENAI_BASE_URL`改为该服务提供的基础URL。

2. 构建并启动容器：

```bash
docker-compose up -d
```

3. 应用将在 `http://localhost:3000` 上运行。

## 使用 Docker 手动部署

1. 构建 Docker 镜像：

```bash
docker build -t ai-restaurant-review-generator .
```

2. 运行容器：

```bash
docker run -d \
  --name ai-restaurant-review-generator \
  -p 3000:3000 \
  -e OPENAI_API_KEY=your_openai_api_key_here \
  -e OPENAI_BASE_URL=https://your-api-provider.com/v1 \
  -e NODE_ENV=production \
  ai-restaurant-review-generator
```

将 `your_openai_api_key_here` 替换为你的实际API密钥，将 `https://your-api-provider.com/v1` 替换为实际的API基础URL（如果使用第三方服务）。

3. 应用将在 `http://localhost:3000` 上运行。

## 服务器部署

如果你想在服务器上部署这个应用：

1. 确保服务器已安装 Docker 和 Docker Compose。
2. 将项目文件复制到服务器。
3. 按照上述 Docker Compose 部署步骤操作。
4. 配置反向代理（如 Nginx）以提供 HTTPS 和域名访问（可选但推荐）。

## 使用第三方OpenAI兼容API

本应用支持使用第三方提供的OpenAI兼容API，如国内的智谱AI、百度文心一言等服务，步骤如下：

1. 在相应平台注册并获取API密钥
2. 在`.env`文件中设置：
   ```
   OPENAI_API_KEY=你获取的API密钥
   OPENAI_BASE_URL=第三方提供的基础URL
   ```

3. 启动应用时，它将使用你配置的API服务而不是官方OpenAI API

> **重要**：确保所使用的第三方API完全兼容OpenAI API的请求和响应格式，特别是 `createChatCompletion` 接口。

## 反向代理配置示例（Nginx）

以下是一个基本的 Nginx 配置示例：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 更新应用

当需要更新应用时：

```bash
# 使用 Docker Compose
git pull
docker-compose down
docker-compose up -d --build

# 手动使用 Docker
git pull
docker stop ai-restaurant-review-generator
docker rm ai-restaurant-review-generator
docker build -t ai-restaurant-review-generator .
docker run -d \
  --name ai-restaurant-review-generator \
  -p 3000:3000 \
  -e OPENAI_API_KEY=your_openai_api_key_here \
  -e OPENAI_BASE_URL=https://your-api-provider.com/v1 \
  -e NODE_ENV=production \
  ai-restaurant-review-generator
```

## 常见问题与解决方案

### API连接问题

如果您在使用第三方OpenAI兼容API时遇到401或其他连接问题，请尝试以下步骤：

1. **检查API基础URL格式**
   - 确保您提供的`OPENAI_BASE_URL`是正确的服务端点
   - 注意某些API提供商需要完整路径（带`/v1`），而其他则不需要
   - 本应用会自动处理URL，确保与OpenAI客户端库兼容

2. **使用调试脚本**
   
   项目提供了一个API连接调试脚本，可以帮助您排查问题：
   
   ```bash
   # 安装依赖
   npm install
   
   # 运行调试脚本
   npm run debug:api
   ```
   
   脚本将显示环境变量配置和API连接测试结果，帮助诊断问题。

3. **直接使用curl测试API**
   
   使用以下命令直接测试您的API连接：
   
   ```bash
   curl "您的API基础URL/v1/chat/completions" \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer 您的API密钥" \
   -d '{"model": "gpt-4o-mini", "messages": [{"role": "user", "content": "Hello"}]}'
   ```
   
   比较此测试与应用的行为，查看是否有差异。

4. **检查API请求日志**
   
   应用启动后会在控制台打印API请求URL，检查这些日志以确认使用的是正确的URL：
   
   ```bash
   docker logs ai-restaurant-review-generator
   ```

5. **常见错误代码解释**
   
   - `401 Unauthorized`: API密钥无效或格式错误
   - `404 Not Found`: API端点URL不正确
   - `429 Too Many Requests`: 超出API速率限制
   - `500/502/503 Server Error`: API服务器端问题

### API响应格式问题

如果API连接成功但应用无法正确处理结果，可能是因为第三方API的响应格式与OpenAI的标准格式不同。检查API提供商文档，确保其完全兼容OpenAI API的响应格式。

## 常见问题解决

- **问题**：容器无法连接到API服务。
  **解决方案**：
  - 检查`.env`文件中的API密钥和基础URL是否正确配置
  - 确认服务器网络可以访问配置的API基础URL
  - 查看容器日志以获取更详细的错误信息：`docker logs ai-restaurant-review-generator`

- **问题**：容器启动但无法访问应用。
  **解决方案**：检查端口映射是否正确，运行 `docker logs ai-restaurant-review-generator` 查看日志以获取更多信息。

- **问题**：API响应格式与预期不符
  **解决方案**：确保所使用的第三方API服务完全兼容OpenAI的API格式。不同服务对`model`参数的处理可能有所不同，请根据第三方服务的文档调整相应参数。 