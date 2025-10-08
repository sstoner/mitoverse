# 线粒体蛋白荧光分析平台 - 部署方案建议

## 项目架构分析

### 当前架构

```
项目结构：
├── 后端 (FastAPI + Python)
│   ├── api.py - FastAPI 应用
│   ├── analyzer.py - 核心分析逻辑
│   └── requirements.txt
│
└── 前端 (Next.js + TypeScript)
    ├── app/ - Next.js 页面
    ├── components/ - React 组件
    ├── lib/ - API 客户端
    └── package.json
```

### 技术栈

- **前端**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **后端**: FastAPI, Python, scikit-image, NumPy
- **部署**: 需要分离部署（前后端独立）

## 💡 推荐的部署方案

### 方案 A：最佳实践（推荐）⭐

#### 前端：Vercel

**为什么选择 Vercel？**

- ✅ Next.js 官方推荐平台，零配置部署
- ✅ 自动 SSL 证书
- ✅ 全球 CDN 加速
- ✅ 自动预览环境（每个 PR 一个预览 URL）
- ✅ 免费额度对个人项目足够
- ✅ 支持环境变量管理
- ✅ 自动构建和部署

**部署步骤**：

1. 推送代码到 GitHub
2. 在 Vercel 导入 Git 仓库
3. 设置根目录为 `web/`
4. 配置环境变量：`NEXT_PUBLIC_API_URL`
5. 点击部署

**费用**：

- 免费版：足够个人/小型项目
- Pro 版：$20/月（如需更多功能）

#### 后端：您的服务器（VPS/云服务器）

**为什么自己部署后端？**

- ✅ 完全控制服务器资源
- ✅ 处理大文件上传（CZI 文件可能很大）
- ✅ 需要 Python 科学计算库（NumPy, scikit-image）
- ✅ 可能需要 GPU 加速（未来扩展）
- ✅ 数据隐私和安全性

**推荐配置**：

- CPU: 2-4 核
- RAM: 4-8 GB
- 存储: 50-100 GB SSD
- 带宽: 至少 5 Mbps

**部署方式**：Docker + Nginx + 系统服务

---

### 方案 B：全栈云平台

#### 前端：Netlify

**替代 Vercel 的选择**

- ✅ 类似 Vercel 的功能
- ✅ 免费额度慷慨
- ✅ 支持 Next.js
- ✅ 简单易用

#### 后端：AWS / Google Cloud / Azure

**适合企业级应用**

- ✅ 可扩展性强
- ✅ 多种服务集成
- ⚠️ 成本较高
- ⚠️ 配置复杂

---

### 方案 C：容器化全栈部署

#### Docker Compose 一键部署

**适合自己服务器全栈部署**

- ✅ 前后端统一管理
- ✅ 易于迁移和复制
- ✅ 环境一致性
- ⚠️ 需要自己管理服务器
- ⚠️ 需要配置反向代理

---

## 📋 详细部署指南

### 1️⃣ 前端部署到 Vercel

#### 步骤 1：准备代码

```bash
# 确保代码在 Git 仓库
cd /path/to/project
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 步骤 2：在 Vercel 部署

1. 访问 [vercel.com](https://vercel.com)
2. 点击 "Import Project"
3. 选择您的 Git 仓库
4. 配置项目：
   ```
   Framework Preset: Next.js
   Root Directory: web/
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

#### 步骤 3：配置环境变量

在 Vercel 项目设置中添加：

```
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

#### 步骤 4：部署

点击 "Deploy"，等待构建完成。

**结果**：

- 您会得到一个 URL：`https://your-project.vercel.app`
- 每次推送到 main 分支都会自动部署

---

### 2️⃣ 后端部署到您的服务器

#### 方案 2A：使用 Docker（推荐）

##### 创建 Dockerfile

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .

# 安装 Python 依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY analyzer.py .
COPY api.py .

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
```

##### 创建 docker-compose.yml

```yaml
version: "3.8"

services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - PYTHONUNBUFFERED=1
    volumes:
      - ./uploads:/app/uploads # 持久化上传文件
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

##### 部署命令

```bash
# 在服务器上
cd /path/to/project
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down
```

##### 配置 Nginx 反向代理

```nginx
# /etc/nginx/sites-available/backend
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 文件上传大小限制
        client_max_body_size 100M;

        # 超时设置
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
```

##### 配置 SSL（使用 Let's Encrypt）

```bash
# 安装 certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d api.yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

---

#### 方案 2B：使用 Systemd 服务（传统方式）

##### 创建虚拟环境并安装依赖

```bash
cd /path/to/project
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

##### 创建 Systemd 服务文件

```ini
# /etc/systemd/system/mitochondrial-api.service
[Unit]
Description=Mitochondrial Protein Analysis API
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/project
Environment="PATH=/path/to/project/.venv/bin"
ExecStart=/path/to/project/.venv/bin/uvicorn api:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

##### 启动服务

```bash
# 重新加载 systemd
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start mitochondrial-api

# 设置开机自启
sudo systemctl enable mitochondrial-api

# 查看状态
sudo systemctl status mitochondrial-api

# 查看日志
sudo journalctl -u mitochondrial-api -f
```

---

### 3️⃣ 配置 CORS（重要！）

前端部署到 Vercel 后，需要配置后端 CORS：

```python
# api.py
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="线粒体蛋白荧光强度分析 API")

# 配置 CORS
origins = [
    "http://localhost:3000",          # 本地开发
    "https://your-project.vercel.app", # Vercel 部署
    "https://yourdomain.com",          # 自定义域名
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🔍 SEO 优化

### 当前 SEO 状态分析

❌ **基本没有 SEO 优化**

当前问题：

1. ✅ 有基础的 title 和 description（但是硬编码）
2. ❌ 没有结构化数据（Schema.org）
3. ❌ 没有 Open Graph 标签（社交媒体分享）
4. ❌ 没有 sitemap.xml
5. ❌ 没有 robots.txt
6. ❌ 缺少页面级的 metadata
7. ❌ 没有多语言 SEO 优化

### 是否需要添加 SEO？

#### 需要 SEO 的情况：✅ 推荐

- 希望通过搜索引擎获取用户
- 需要在社交媒体分享时显示正确的预览
- 想要提高品牌知名度
- 计划做内容营销

#### 不需要 SEO 的情况：

- 仅内部使用的工具
- 用户都是通过直接链接访问
- B2B 销售驱动，不依赖搜索引擎

### 建议：**添加 SEO 优化** ✅

**原因**：

1. 科研工具需要被相关研究人员发现
2. 提高学术界的可见度
3. 增强专业性和可信度
4. 社交媒体分享效果更好
5. 实施成本不高，性价比高

---

## 🎯 SEO 优化实施方案

### 优先级 1：基础 SEO（必做）

#### 1. 创建动态 Metadata

```typescript
// web/app/layout.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Mitochondrial Protein Analysis Platform | 线粒体蛋白荧光强度分析",
    template: "%s | Mitochondrial Analysis",
  },
  description:
    "Professional mitochondrial protein fluorescence intensity analysis platform. Support CZI format, multiple threshold methods, batch processing. Free online tool for researchers.",
  keywords: [
    "mitochondrial analysis",
    "protein fluorescence",
    "CZI",
    "scientific analysis",
    "线粒体分析",
    "荧光强度",
  ],
  authors: [{ name: "Your Name" }],
  creator: "Your Organization",
  publisher: "Your Organization",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://yourdomain.com"),
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en",
      "zh-CN": "/zh",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yourdomain.com",
    title: "Mitochondrial Protein Analysis Platform",
    description:
      "Professional mitochondrial protein fluorescence intensity analysis",
    siteName: "Mitochondrial Analysis",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mitochondrial Analysis Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mitochondrial Protein Analysis Platform",
    description:
      "Professional mitochondrial protein fluorescence intensity analysis",
    images: ["/og-image.png"],
    creator: "@yourhandle",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
};
```

#### 2. 为每个页面添加 Metadata

```typescript
// web/app/analyze/page.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analyze CZI Files - Mitochondrial Analysis",
  description:
    "Upload and analyze CZI microscopy images. Configure parameters, get detailed results with visualization.",
  openGraph: {
    title: "Analyze CZI Files - Mitochondrial Analysis",
    description: "Upload and analyze CZI microscopy images",
    url: "/analyze",
  },
};
```

```typescript
// web/app/docs/page.tsx
export const metadata: Metadata = {
  title: "Documentation - How to Use",
  description:
    "Complete guide for mitochondrial protein analysis. Learn about parameters, results interpretation, and API usage.",
};
```

#### 3. 创建 robots.txt

```txt
# web/public/robots.txt
User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://yourdomain.com/sitemap.xml
```

#### 4. 创建 sitemap.xml

```typescript
// web/app/sitemap.ts
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://yourdomain.com";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/analyze`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
```

---

### 优先级 2：结构化数据（推荐）

```typescript
// web/app/layout.tsx - 添加 JSON-LD
export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Mitochondrial Protein Analysis Platform",
    applicationCategory: "ScientificApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Professional mitochondrial protein fluorescence intensity analysis",
    url: "https://yourdomain.com",
    author: {
      "@type": "Organization",
      name: "Your Organization",
    },
  };

  return (
    <html>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

### 优先级 3：性能优化（SEO 相关）

#### 1. 添加图片优化

```tsx
// 使用 Next.js Image 组件
import Image from "next/image";

<Image
  src="/hero-image.jpg"
  alt="Mitochondrial protein analysis visualization"
  width={1200}
  height={630}
  priority
/>;
```

#### 2. 添加 Loading 状态

```tsx
// web/app/analyze/loading.tsx
export default function Loading() {
  return <div>Loading analysis tools...</div>;
}
```

---

## 📊 部署成本估算

### 方案 A（推荐）

| 服务     | 提供商        | 配置     | 月费用        |
| -------- | ------------- | -------- | ------------- |
| 前端     | Vercel        | 免费版   | $0            |
| 后端     | 云服务器      | 2 核 4GB | $10-30        |
| 域名     | 任意          | .com     | $12/年        |
| SSL      | Let's Encrypt | 免费     | $0            |
| **总计** |               |          | **$10-30/月** |

### 方案 B（企业级）

| 服务     | 提供商     | 配置      | 月费用         |
| -------- | ---------- | --------- | -------------- |
| 前端     | Vercel Pro | Pro 版    | $20            |
| 后端     | AWS EC2    | t3.medium | $30-50         |
| 数据库   | AWS RDS    | 可选      | $15-30         |
| CDN      | CloudFront | 按量      | $5-20          |
| **总计** |            |           | **$70-120/月** |

---

## 🚀 快速部署检查清单

### 部署前准备

- [ ] 代码推送到 Git 仓库（GitHub/GitLab）
- [ ] 前端环境变量配置准备好
- [ ] 后端服务器准备就绪
- [ ] 域名已购买（如需）
- [ ] SSL 证书计划（Let's Encrypt 免费）

### 前端部署（Vercel）

- [ ] 注册 Vercel 账号
- [ ] 导入 Git 仓库
- [ ] 设置根目录为 `web/`
- [ ] 配置环境变量 `NEXT_PUBLIC_API_URL`
- [ ] 部署并测试
- [ ] 配置自定义域名（可选）

### 后端部署

- [ ] 服务器基础环境配置（Ubuntu/Debian）
- [ ] 安装 Docker 和 Docker Compose
- [ ] 创建 Dockerfile 和 docker-compose.yml
- [ ] 部署并启动服务
- [ ] 配置 Nginx 反向代理
- [ ] 配置 SSL 证书
- [ ] 配置 CORS 允许前端域名
- [ ] 测试 API 可访问性

### SEO 优化

- [ ] 添加页面级 Metadata
- [ ] 创建 robots.txt
- [ ] 创建 sitemap.xml
- [ ] 添加结构化数据（JSON-LD）
- [ ] 优化图片和性能
- [ ] 提交到 Google Search Console
- [ ] 提交到 Bing Webmaster Tools

### 测试验证

- [ ] 前端页面正常加载
- [ ] API 调用成功
- [ ] 文件上传功能正常
- [ ] 分析功能正常
- [ ] 跨域请求正常
- [ ] SSL 证书有效
- [ ] 移动端响应式正常
- [ ] SEO 标签正确（使用工具检查）

---

## 🛠️ 推荐工具

### 部署和监控

- **Vercel** - 前端部署
- **Docker** - 后端容器化
- **PM2** - 进程管理（如不使用 Docker）
- **Nginx** - 反向代理
- **Certbot** - SSL 证书

### SEO 工具

- **Google Search Console** - 搜索性能监控
- **Google Analytics** - 流量分析
- **Lighthouse** - 性能和 SEO 审计
- **SEMrush** / **Ahrefs** - SEO 分析（付费）
- **Screaming Frog** - 网站爬虫和 SEO 审计

### 测试工具

- **PageSpeed Insights** - 性能测试
- **GTmetrix** - 性能和优化建议
- **SSL Labs** - SSL 配置测试
- **Meta Tags Checker** - Open Graph 预览

---

## 📝 总结和建议

### ✅ 推荐的最终方案

1. **前端**：部署到 Vercel

   - 零配置，自动化
   - 全球 CDN
   - 免费额度充足

2. **后端**：部署到您的服务器（Docker）

   - 完全控制
   - 处理大文件
   - 数据安全

3. **SEO**：必须添加

   - 基础 Metadata
   - Sitemap 和 Robots
   - 结构化数据
   - Open Graph 标签

4. **域名**：建议使用自定义域名
   - 更专业
   - 更好的 SEO
   - 品牌识别

### 📅 实施顺序

1. **第 1 周**：后端部署

   - Docker 化后端
   - 部署到服务器
   - 配置 Nginx 和 SSL

2. **第 2 周**：前端部署

   - 推送到 GitHub
   - 部署到 Vercel
   - 配置环境变量和域名

3. **第 3 周**：SEO 优化

   - 添加 Metadata
   - 创建 Sitemap
   - 提交到搜索引擎

4. **第 4 周**：测试和优化
   - 全面测试
   - 性能优化
   - 监控和调整

### 💰 预算建议

**最小预算**：$10-15/月

- Vercel 免费版
- 基础云服务器（2 核 4GB）

**推荐预算**：$30-50/月

- Vercel Pro（可选）
- 更好的服务器（4 核 8GB）
- 备份和监控服务

---

需要我为您生成具体的配置文件吗？比如：

1. Dockerfile 和 docker-compose.yml
2. Nginx 配置文件
3. 完整的 SEO Metadata 代码
4. 部署脚本

请告诉我您需要哪些！
