# Docker 部署指南

## 前置需求

- 安装 [Docker](https://docs.docker.com/get-docker/)
- 安装 [Docker Compose](https://docs.docker.com/compose/install/) (可选，但推荐)
- 获取 [OpenAI API Key](https://platform.openai.com/)

## 使用 Docker Compose 部署（推荐）

1. 复制示例环境变量文件并填写你的 OpenAI API 密钥：

```bash
cp .env.example .env
```

编辑 `.env` 文件，将 `your_openai_api_key_here` 替换为你的实际 OpenAI API 密钥。

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
  -e NODE_ENV=production \
  ai-restaurant-review-generator
```

将 `your_openai_api_key_here` 替换为你的实际 OpenAI API 密钥。

3. 应用将在 `http://localhost:3000` 上运行。

## 服务器部署

如果你想在服务器上部署这个应用：

1. 确保服务器已安装 Docker 和 Docker Compose。
2. 将项目文件复制到服务器。
3. 按照上述 Docker Compose 部署步骤操作。
4. 配置反向代理（如 Nginx）以提供 HTTPS 和域名访问（可选但推荐）。

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
  -e NODE_ENV=production \
  ai-restaurant-review-generator
```

## 常见问题解决

- **问题**：容器无法连接到 OpenAI API。
  **解决方案**：确认 `.env` 文件中的 API 密钥是否正确设置，或者在 `docker run` 命令中是否正确传递了环境变量。

- **问题**：容器启动但无法访问应用。
  **解决方案**：检查端口映射是否正确，运行 `docker logs ai-restaurant-review-generator` 查看日志以获取更多信息。 