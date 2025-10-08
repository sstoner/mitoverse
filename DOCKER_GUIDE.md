# Docker 部署指南

## 目录
- [本地开发](#本地开发)
- [生产部署](#生产部署)
- [GitHub Actions CI/CD](#github-actions-cicd)
- [Docker Hub 配置](#docker-hub-配置)
- [常见问题](#常见问题)

## 本地开发

### 快速开始

1. **克隆仓库**
   ```bash
   git clone https://github.com/sstoner/mitoverse.git
   cd mitoverse
   ```

2. **使用 Docker Compose 启动**
   ```bash
   # 启动开发环境（带热重载）
   docker-compose up -d

   # 查看日志
   docker-compose logs -f api

   # 停止服务
   docker-compose down
   ```

3. **访问 API**
   - API 文档: http://localhost:8000/docs
   - 健康检查: http://localhost:8000/health
   - OpenAPI JSON: http://localhost:8000/openapi.json

### 手动构建镜像

```bash
# 构建镜像
docker build -t mitoverse-api:local .

# 运行容器
docker run -d \
  --name mitoverse-api \
  -p 8000:8000 \
  -e ENV=development \
  -v $(pwd)/uploads:/tmp/uploads \
  mitoverse-api:local

# 查看日志
docker logs -f mitoverse-api

# 进入容器调试
docker exec -it mitoverse-api /bin/bash

# 停止并删除容器
docker stop mitoverse-api
docker rm mitoverse-api
```

### 开发模式特性

- ✅ **热重载**: 代码修改自动重启服务
- ✅ **卷挂载**: `analyzer.py` 和 `api.py` 实时同步
- ✅ **日志输出**: 详细的调试信息
- ✅ **健康检查**: 自动监控服务状态

## 生产部署

### 使用 Nginx 反向代理

1. **启动生产环境**
   ```bash
   # 启动包含 Nginx 的完整栈
   docker-compose --profile production up -d

   # 查看所有服务状态
   docker-compose ps
   ```

2. **配置 SSL 证书**
   ```bash
   # 创建 SSL 目录
   mkdir -p ssl

   # 使用 Let's Encrypt 获取证书（示例）
   sudo certbot certonly --standalone -d yourdomain.com
   sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/cert.pem
   sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/key.pem

   # 修改 nginx.conf 启用 HTTPS 配置
   # 取消注释 server { listen 443 ssl http2; ... } 部分
   ```

3. **更新 Nginx 配置**
   ```bash
   # 编辑 nginx.conf
   vim nginx.conf

   # 重启 Nginx 使配置生效
   docker-compose restart nginx
   ```

### 环境变量配置

创建 `.env` 文件:

```bash
# 应用环境
ENV=production

# CORS 允许的源
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# 文件上传限制
MAX_UPLOAD_SIZE=500M

# 日志级别
LOG_LEVEL=INFO

# Docker Hub 镜像
DOCKER_IMAGE=yourusername/mitoverse-api:latest
```

在 `docker-compose.yml` 中使用:

```yaml
services:
  api:
    image: ${DOCKER_IMAGE}
    environment:
      - ENV=${ENV}
      - CORS_ORIGINS=${CORS_ORIGINS}
```

### 资源限制

为生产环境添加资源限制:

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G
```

## GitHub Actions CI/CD

### 工作流说明

`.github/workflows/docker-build.yml` 提供自动化构建和部署:

**触发条件**:
- 推送到 `master`/`main`/`develop` 分支
- 创建版本标签 (`v*.*.*`)
- Pull Request 到 `master`/`main`

**流程**:
1. **构建镜像**: 多平台构建 (amd64, arm64)
2. **推送到 Docker Hub**: 自动打标签
3. **安全扫描**: Trivy 漏洞扫描
4. **测试**: PR 时运行单元测试和集成测试

**标签策略**:
- `latest`: master/main 分支最新提交
- `v1.2.3`: 语义化版本标签
- `v1.2`: 主次版本
- `v1`: 主版本
- `develop`: develop 分支
- `master-abc1234`: 分支名-提交哈希

### 版本发布

```bash
# 创建新版本
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# GitHub Actions 会自动:
# 1. 构建 Docker 镜像
# 2. 推送到 Docker Hub，标签: v1.0.0, v1.0, v1, latest
# 3. 运行安全扫描
```

## Docker Hub 配置

### 1. 创建 Docker Hub 仓库

1. 登录 [Docker Hub](https://hub.docker.com/)
2. 点击 "Create Repository"
3. 仓库名称: `mitoverse-api`
4. 可见性: Public 或 Private
5. 创建仓库

### 2. 生成访问令牌

1. 进入 **Account Settings** → **Security**
2. 点击 **New Access Token**
3. 描述: `GitHub Actions - mitoverse`
4. 权限: `Read, Write, Delete`
5. 生成并复制令牌（⚠️ 只显示一次）

### 3. 配置 GitHub Secrets

在 GitHub 仓库中配置:

1. 进入仓库 **Settings** → **Secrets and variables** → **Actions**
2. 添加以下 secrets:

   | Secret Name       | 值                  | 说明                |
   |-------------------|---------------------|---------------------|
   | `DOCKER_USERNAME` | Docker Hub 用户名   | 你的 Docker Hub 用户名 |
   | `DOCKER_PASSWORD` | Access Token        | 刚生成的访问令牌    |

3. 保存 secrets

### 4. 验证配置

推送代码触发工作流:

```bash
git add .
git commit -m "feat: add Docker support"
git push origin master
```

检查构建状态:
- GitHub: **Actions** 标签页
- Docker Hub: 仓库页面查看新推送的镜像

## 常见问题

### Q1: 构建失败 - 依赖安装错误

**问题**: `ERROR: Could not build wheels for numpy`

**解决**:
```dockerfile
# Dockerfile 已包含必要的系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*
```

### Q2: 健康检查失败

**症状**: `docker-compose ps` 显示 `unhealthy`

**排查**:
```bash
# 查看健康检查日志
docker inspect --format='{{json .State.Health}}' mitoverse-api | jq

# 手动测试健康端点
docker exec mitoverse-api curl -f http://localhost:8000/health

# 检查应用日志
docker-compose logs api
```

### Q3: 文件上传失败 - 文件太大

**问题**: `413 Request Entity Too Large`

**解决**:
1. 修改 `nginx.conf`:
   ```nginx
   client_max_body_size 500M;
   ```

2. 修改 `docker-compose.yml`:
   ```yaml
   api:
     environment:
       - MAX_UPLOAD_SIZE=500M
   ```

3. 重启服务:
   ```bash
   docker-compose restart
   ```

### Q4: GitHub Actions 构建超时

**症状**: 构建在 "Build and push Docker image" 步骤超时

**解决**:
```yaml
# .github/workflows/docker-build.yml
- name: Build and push Docker image
  timeout-minutes: 60  # 增加超时时间
  uses: docker/build-push-action@v5
  with:
    cache-from: type=gha  # 使用 GitHub Actions 缓存
    cache-to: type=gha,mode=max
```

### Q5: 跨平台构建问题

**问题**: ARM64 平台构建失败

**解决**:
```bash
# 本地测试多平台构建
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t mitoverse-api:test \
  .

# 如果某个平台不支持，可以只构建 amd64
# 修改 .github/workflows/docker-build.yml:
env:
  PLATFORMS: linux/amd64
```

### Q6: Docker Hub 推送权限被拒绝

**错误**: `denied: requested access to the resource is denied`

**解决**:
1. 确认 Docker Hub 用户名正确（不是邮箱）
2. 重新生成 Access Token 并更新 GitHub Secrets
3. 检查 Token 权限包含 `Read, Write`
4. 验证仓库名称格式: `username/repository`

### Q7: 容器内存溢出

**症状**: 容器被 OOM Killer 终止

**解决**:
```yaml
# docker-compose.yml
services:
  api:
    deploy:
      resources:
        limits:
          memory: 4G  # 增加内存限制
    environment:
      - PYTHONUNBUFFERED=1  # 减少内存缓冲
```

### Q8: 开发模式热重载不工作

**检查**:
```bash
# 确认卷挂载正确
docker-compose config

# 查看是否使用 --reload 参数
docker-compose exec api ps aux | grep uvicorn

# 应该看到: uvicorn api:app --reload
```

## 监控和日志

### 查看实时日志

```bash
# 所有服务
docker-compose logs -f

# 仅 API
docker-compose logs -f api

# 最近 100 行
docker-compose logs --tail=100 api
```

### 资源使用监控

```bash
# 实时监控
docker stats

# 容器详情
docker inspect mitoverse-api
```

### 日志管理

生产环境建议使用日志驱动:

```yaml
services:
  api:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## 备份和恢复

### 备份上传文件

```bash
# 备份
docker run --rm \
  -v mitoverse_uploads:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/uploads-backup.tar.gz -C /data .

# 恢复
docker run --rm \
  -v mitoverse_uploads:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/uploads-backup.tar.gz -C /data
```

## 性能优化

### 构建优化

```dockerfile
# 使用 slim 基础镜像减小体积
FROM python:3.11-slim

# 多阶段构建（如果需要编译工具）
FROM python:3.11 as builder
RUN pip install --user -r requirements.txt

FROM python:3.11-slim
COPY --from=builder /root/.local /root/.local
```

### 运行时优化

```yaml
services:
  api:
    command: >
      uvicorn api:app
      --host 0.0.0.0
      --port 8000
      --workers 4          # 多进程
      --loop uvloop        # 高性能事件循环
      --http httptools     # 高性能 HTTP 解析
```

## 安全建议

1. **不要将敏感信息硬编码**: 使用环境变量或 secrets
2. **定期更新基础镜像**: `docker pull python:3.11-slim`
3. **运行安全扫描**: GitHub Actions 已集成 Trivy
4. **限制容器权限**: 避免使用 `privileged` 模式
5. **使用 HTTPS**: 生产环境必须配置 SSL

## 相关资源

- [FastAPI 文档](https://fastapi.tiangolo.com/)
- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Docker Hub](https://hub.docker.com/)

## 技术支持

遇到问题？

1. 查看 [GitHub Issues](https://github.com/sstoner/mitoverse/issues)
2. 提交新 Issue 并附上:
   - 错误信息
   - `docker-compose logs` 输出
   - 系统环境 (`docker version`, `docker-compose version`)
