# 线粒体蛋白荧光强度分析平台 - 前端应用

这是一个基于 Next.js 构建的现代化 Web 应用，用于线粒体蛋白荧光强度分析。

## 功能特性

- 🚀 **现代化技术栈**: Next.js 15, TypeScript, Tailwind CSS
- 📤 **文件上传**: 支持拖拽上传 CZI 格式文件
- ⚙️ **参数配置**: 灵活的分析参数设置
- 📊 **结果展示**: 详细的指标展示和可视化图像
- 📱 **响应式设计**: 完美支持桌面和移动设备
- 🎨 **优雅的 UI**: 使用 Tailwind CSS 和 Lucide Icons

## 技术栈

- **框架**: Next.js 15.5.4 (App Router)
- **语言**: TypeScript 5.x
- **样式**: Tailwind CSS 3.4
- **图标**: Lucide React
- **HTTP 客户端**: Axios
- **文件上传**: React Dropzone
- **图表**: Chart.js + React Chart.js 2

## 快速开始

### 前置要求

- Node.js 18.x 或更高版本
- npm 或 yarn 或 pnpm
- 后端 API 服务运行在 http://localhost:8000

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 配置环境变量

复制 `.env.example` 到 `.env.local` 并配置：

```bash
cp .env.example .env.local
```

编辑 `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
web/
├── app/                      # Next.js App Router 页面
│   ├── analyze/             # 分析页面
│   │   └── page.tsx
│   ├── docs/                # 文档页面
│   │   └── page.tsx
│   ├── layout.tsx           # 根布局
│   ├── page.tsx             # 首页
│   └── globals.css          # 全局样式
├── components/              # React 组件
│   ├── ui/                  # 基础 UI 组件
│   │   ├── Button.tsx
│   │   └── Card.tsx
│   ├── AnalysisForm.tsx    # 分析参数表单
│   ├── FileUpload.tsx      # 文件上传组件
│   └── ResultsDisplay.tsx  # 结果展示组件
├── lib/                     # 工具库
│   ├── api.ts              # API 客户端
│   └── utils.ts            # 工具函数
├── public/                  # 静态资源
├── .env.local              # 环境变量（不提交到 git）
├── .env.example            # 环境变量示例
├── next.config.ts          # Next.js 配置
├── tailwind.config.ts      # Tailwind CSS 配置
├── tsconfig.json           # TypeScript 配置
└── package.json            # 项目依赖
```

## 页面说明

### 首页 (`/`)

- 展示产品特性和优势
- 引导用户开始分析
- 响应式设计的着陆页

### 分析页面 (`/analyze`)

- 文件上传区域
- 参数配置表单
- 实时分析状态
- 结果展示和可视化

### 文档页面 (`/docs`)

- 快速开始指南
- 参数详细说明
- 结果指标解释
- API 接口文档
- 常见问题解答

## 核心组件

### FileUpload

拖拽上传组件，支持 CZI 文件上传

```tsx
<FileUpload
  onFilesSelected={(files) => setFiles(files)}
  accept=".czi"
  maxFiles={1}
/>
```

### AnalysisForm

分析参数配置表单

```tsx
<AnalysisForm
  onParamsChange={(params) => setParams(params)}
  initialParams={defaultParams}
/>
```

### ResultsDisplay

分析结果展示组件

```tsx
<ResultsDisplay result={analysisResult} />
```

## API 集成

API 客户端位于 `lib/api.ts`，提供以下方法：

```typescript
// 单文件分析
const response = await api.analyze({
  file: file,
  mitochondrial_channel: 0,
  target_protein_channel: 2,
  threshold_method: "otsu",
  generate_visualization: true,
});

// 批量分析
const response = await api.batchAnalyze(files, {
  mitochondrial_channel: 0,
  target_protein_channel: 2,
  threshold_method: "otsu",
  generate_visualization: false,
});

// 健康检查
const health = await api.healthCheck();
```

## 构建和部署

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

### 部署到 Vercel

最简单的部署方式是使用 [Vercel](https://vercel.com):

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量 `NEXT_PUBLIC_API_URL`
4. 部署

### 部署到其他平台

也可以部署到：

- AWS (Amplify, EC2)
- Google Cloud (Cloud Run)
- Azure (App Service)
- Netlify
- 自己的服务器（使用 PM2 或 Docker）

## 开发指南

### 添加新页面

在 `app/` 目录下创建新文件夹和 `page.tsx`：

```tsx
// app/new-page/page.tsx
export default function NewPage() {
  return <div>New Page</div>;
}
```

### 添加新组件

在 `components/` 目录下创建新组件：

```tsx
// components/MyComponent.tsx
export default function MyComponent() {
  return <div>My Component</div>;
}
```

### 样式定制

修改 `tailwind.config.ts` 来自定义主题：

```typescript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
    },
  },
}
```

## 性能优化

- ✅ 使用 Next.js Image 组件优化图片
- ✅ 代码分割和懒加载
- ✅ TypeScript 静态类型检查
- ✅ Tailwind CSS 生产环境优化
- ✅ API 响应缓存策略

## 浏览器支持

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## 故障排除

### 端口被占用

如果 3000 端口被占用，可以使用其他端口：

```bash
PORT=3001 npm run dev
```

### API 连接失败

1. 确认后端服务正在运行
2. 检查 `.env.local` 中的 API URL 配置
3. 检查 CORS 配置

### 依赖安装失败

清理 node_modules 重新安装：

```bash
rm -rf node_modules package-lock.json
npm install
```

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 相关链接

- [Next.js 文档](https://nextjs.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [TypeScript 文档](https://www.typescriptlang.org/docs)
- [后端 API 文档](../README.md)
