# GitHub Actions 配置指南

## 概述

本指南将帮助你配置 GitHub Actions 工作流，实现自动构建 Docker 镜像并推送到 Docker Hub。

## 前置要求

- ✅ GitHub 账号
- ✅ Docker Hub 账号
- ✅ 项目已推送到 GitHub

## 步骤 1: 创建 Docker Hub 仓库

### 1.1 登录 Docker Hub

访问 [Docker Hub](https://hub.docker.com/) 并登录你的账号。

### 1.2 创建新仓库

1. 点击右上角的 **"Create Repository"**
2. 填写仓库信息:
   - **Name**: `mitoverse-api`
   - **Description**: `Mitochondrial Protein Fluorescence Intensity Analysis API`
   - **Visibility**:
     - `Public` - 任何人都可以拉取（推荐开源项目）
     - `Private` - 仅你和授权用户可以拉取
3. 点击 **"Create"**

创建后的仓库地址将是: `yourusername/mitoverse-api`

## 步骤 2: 生成 Docker Hub Access Token

### 2.1 进入安全设置

1. 点击右上角头像 → **"Account Settings"**
2. 左侧菜单选择 **"Security"**
3. 找到 **"Access Tokens"** 部分

### 2.2 创建新 Token

1. 点击 **"New Access Token"**
2. 填写 Token 信息:
   - **Description**: `GitHub Actions - mitoverse`
   - **Access permissions**: `Read, Write, Delete`
3. 点击 **"Generate"**

### 2.3 保存 Token

⚠️ **重要**: Token 只会显示一次，请立即复制并保存！

```
# 示例（你的 Token 会不同）
dckr_pat_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
```

## 步骤 3: 配置 GitHub Secrets

### 3.1 进入仓库设置

1. 打开你的 GitHub 仓库: `https://github.com/sstoner/mitoverse`
2. 点击顶部的 **"Settings"** 标签
3. 左侧菜单找到 **"Secrets and variables"** → **"Actions"**

### 3.2 添加 Secrets

点击 **"New repository secret"** 按钮，添加以下两个 secrets:

#### Secret 1: DOCKER_USERNAME

- **Name**: `DOCKER_USERNAME`
- **Value**: 你的 Docker Hub 用户名（⚠️ 不是邮箱）
  ```
  例如: sstoner
  ```
- 点击 **"Add secret"**

#### Secret 2: DOCKER_PASSWORD

- **Name**: `DOCKER_PASSWORD`
- **Value**: 刚才生成的 Docker Hub Access Token
  ```
  例如: dckr_pat_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
  ```
- 点击 **"Add secret"**

### 3.3 验证 Secrets

配置完成后，你应该在 **"Repository secrets"** 看到:

```
DOCKER_USERNAME
DOCKER_PASSWORD
```

## 步骤 4: 更新工作流文件

### 4.1 检查 `.github/workflows/docker-build.yml`

确保文件中的环境变量使用了正确的 Docker Hub 用户名:

```yaml
env:
  DOCKER_IMAGE: ${{ secrets.DOCKER_USERNAME }}/mitoverse-api
  PLATFORMS: linux/amd64,linux/arm64
```

### 4.2 修改用户名（如果需要）

如果你想使用不同的镜像名称，修改 `DOCKER_IMAGE`:

```yaml
env:
  # 修改为你的 Docker Hub 用户名和仓库名
  DOCKER_IMAGE: your_dockerhub_username/your_repository_name
```

## 步骤 5: 触发构建

### 5.1 推送代码到 master

```bash
git add .
git commit -m "feat: add Docker support with GitHub Actions"
git push origin master
```

### 5.2 查看工作流状态

1. 进入 GitHub 仓库
2. 点击 **"Actions"** 标签
3. 你会看到正在运行的工作流: **"Build and Push Docker Image"**

### 5.3 监控构建过程

点击工作流名称查看详细日志:

- ✅ Checkout code
- ✅ Set up QEMU
- ✅ Set up Docker Buildx
- ✅ Log in to Docker Hub
- ✅ Extract metadata
- ✅ Build and push Docker image
- ✅ Image digest

构建通常需要 5-15 分钟（首次构建可能更久）。

## 步骤 6: 验证镜像

### 6.1 检查 Docker Hub

1. 访问 `https://hub.docker.com/r/yourusername/mitoverse-api`
2. 你应该看到新推送的镜像和标签

### 6.2 本地拉取测试

```bash
# 拉取镜像
docker pull yourusername/mitoverse-api:latest

# 运行容器
docker run -d -p 8000:8000 yourusername/mitoverse-api:latest

# 测试健康检查
curl http://localhost:8000/health

# 停止容器
docker stop $(docker ps -q --filter ancestor=yourusername/mitoverse-api:latest)
```

## 版本发布工作流

### 自动标签策略

GitHub Actions 会根据不同的触发条件自动打标签:

| 触发条件          | 镜像标签                         | 示例                                 |
| ----------------- | -------------------------------- | ------------------------------------ |
| 推送到 `master`   | `latest`                         | `yourusername/mitoverse-api:latest`  |
| 推送到 `develop`  | `develop`                        | `yourusername/mitoverse-api:develop` |
| 推送 tag `v1.2.3` | `v1.2.3`, `v1.2`, `v1`, `latest` | 多个标签                             |
| Pull Request      | `pr-123`                         | `yourusername/mitoverse-api:pr-123`  |

### 发布新版本

```bash
# 1. 完成开发并提交
git add .
git commit -m "feat: new feature"

# 2. 创建版本标签
git tag -a v1.0.0 -m "Release version 1.0.0"

# 3. 推送代码和标签
git push origin master
git push origin v1.0.0

# GitHub Actions 会自动:
# - 构建镜像
# - 推送多个标签: v1.0.0, v1.0, v1, latest
# - 运行安全扫描
```

## 高级配置

### 多平台构建

默认构建 `linux/amd64` 和 `linux/arm64` 两个平台。

如果只需要 `amd64`（构建更快）:

```yaml
env:
  PLATFORMS: linux/amd64
```

### 构建缓存

工作流已启用 GitHub Actions 缓存，加速后续构建:

```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```

### 安全扫描

每次构建后自动运行 Trivy 漏洞扫描，结果上传到 GitHub Security:

- 进入仓库 **"Security"** → **"Code scanning alerts"** 查看

## 常见问题排查

### ❌ 错误: denied: requested access to the resource is denied

**原因**:

- Docker Hub 用户名错误
- Access Token 无效或权限不足
- 仓库名称不存在

**解决**:

1. 确认 `DOCKER_USERNAME` 是用户名而不是邮箱
2. 重新生成 Access Token（确保有 `Read, Write` 权限）
3. 确认 Docker Hub 仓库已创建
4. 检查 `.github/workflows/docker-build.yml` 中的 `DOCKER_IMAGE` 是否正确

### ❌ 错误: Error: buildx failed with: error: failed to solve

**原因**:

- Dockerfile 语法错误
- 依赖安装失败
- 网络问题

**解决**:

```bash
# 本地测试构建
docker build -t test-build .

# 查看详细错误
docker build --progress=plain -t test-build .
```

### ❌ 工作流运行但镜像没有推送

**检查**:

1. 查看 Actions 日志中的 "Log in to Docker Hub" 步骤
2. 确认 Secrets 已正确配置
3. 检查是否有网络错误或超时

### ⚠️ 构建时间过长

**优化**:

1. 使用 `.dockerignore` 减少构建上下文
2. 使用 GitHub Actions 缓存（已默认启用）
3. 只构建 `linux/amd64` 平台
4. 使用更小的基础镜像（如 `alpine`）

### ❌ 健康检查失败

**原因**:

- `/health` 端点不存在或返回错误
- 容器内网络问题

**解决**:

```bash
# 测试容器内健康检查
docker exec container_name curl -f http://localhost:8000/health

# 查看应用日志
docker logs container_name
```

## 配置清单

使用此清单确保所有步骤都已完成:

- [ ] Docker Hub 账号已创建
- [ ] Docker Hub 仓库已创建 (`yourusername/mitoverse-api`)
- [ ] Docker Hub Access Token 已生成并保存
- [ ] GitHub Secret `DOCKER_USERNAME` 已添加
- [ ] GitHub Secret `DOCKER_PASSWORD` 已添加
- [ ] `.github/workflows/docker-build.yml` 文件存在且正确
- [ ] 代码已推送到 master 分支
- [ ] GitHub Actions 工作流已成功运行
- [ ] Docker Hub 已显示新镜像
- [ ] 本地已成功拉取并测试镜像

## 监控和维护

### 定期检查

- **Actions 状态**: 定期查看工作流是否成功
- **安全扫描**: 查看 Security 标签页的漏洞报告
- **镜像大小**: 监控镜像大小，优化 Dockerfile
- **构建时间**: 如果构建过慢，考虑优化

### 更新 Token

Docker Hub Access Token 建议定期更新（如每年一次）:

1. 生成新 Token
2. 更新 GitHub Secret `DOCKER_PASSWORD`
3. 删除旧 Token

### 镜像清理

定期清理旧的镜像标签:

1. 进入 Docker Hub 仓库
2. 选择旧标签 → 删除
3. 或使用 Docker Hub API 自动清理

## 下一步

✅ 配置完成后，你可以:

1. **自动部署**: 每次推送代码自动构建新镜像
2. **版本管理**: 使用 Git 标签管理版本发布
3. **持续集成**: 添加更多测试和检查
4. **生产部署**: 使用 Docker Compose 或 Kubernetes 部署

## 相关资源

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Docker Hub 文档](https://docs.docker.com/docker-hub/)
- [Docker Buildx 文档](https://docs.docker.com/buildx/working-with-buildx/)
- [Trivy 安全扫描](https://github.com/aquasecurity/trivy)

## 技术支持

遇到问题？

1. 查看 [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) 的常见问题部分
2. 查看 GitHub Actions 日志的详细错误信息
3. 提交 Issue 到仓库
