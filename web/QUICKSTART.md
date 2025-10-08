# 快速启动指南

## 前置要求

1. **后端服务已启动**: 确保后端 API 服务运行在 http://localhost:8000
2. **Node.js**: 已安装 Node.js 18.x 或更高版本
3. **依赖已安装**: 运行 `npm install`

## 启动步骤

### 1. 安装依赖（首次运行）

```bash
npm install
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local，确认 API URL 配置正确
# NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. 启动开发服务器

```bash
npm run dev
```

服务器将在 http://localhost:3000 启动

### 4. 访问应用

- 首页: http://localhost:3000
- 分析页面: http://localhost:3000/analyze
- 文档页面: http://localhost:3000/docs

## 完整启动流程（前后端）

### 终端 1: 启动后端

```bash
# 在项目根目录
cd ..
source .venv/bin/activate
uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

### 终端 2: 启动前端

```bash
# 在 web 目录
cd web
npm run dev
```

## 验证服务

### 检查后端服务

```bash
curl http://localhost:8000/health
```

应该返回：

```json
{
  "status": "healthy",
  "service": "Mitochondrial Protein Analysis API",
  "version": "1.0.0"
}
```

### 检查前端服务

在浏览器中访问 http://localhost:3000，应该看到应用首页

## 常见问题

### 端口冲突

如果 3000 端口被占用：

```bash
PORT=3001 npm run dev
```

### 后端连接失败

1. 确认后端服务正在运行
2. 检查 `.env.local` 中的 `NEXT_PUBLIC_API_URL`
3. 检查浏览器控制台的错误信息

### 依赖问题

清理并重新安装：

```bash
rm -rf node_modules package-lock.json
npm install
```

## 生产环境部署

### 构建

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

## 开发提示

- 修改代码后，页面会自动热重载
- TypeScript 类型错误会在终端和编辑器中显示
- 使用浏览器开发工具查看网络请求和错误
- API 请求会经过 `/lib/api.ts` 中的客户端

## 调试技巧

### 查看 API 请求

打开浏览器开发工具 → Network 标签，查看所有 API 请求

### 查看 React 状态

安装 [React Developer Tools](https://react.dev/learn/react-developer-tools) 扩展

### 查看日志

后端日志在终端 1 中显示，前端日志在浏览器控制台中显示

## 下一步

- 阅读 [README.md](./README.md) 了解更多项目信息
- 查看 [API 文档](http://localhost:8000/docs) 了解接口详情
- 访问 [文档页面](http://localhost:3000/docs) 了解使用方法
