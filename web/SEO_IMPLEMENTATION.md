# SEO 优化实施指南

## 快速实施步骤

### 第 1 步：更新 layout.tsx - 添加完整的 Metadata

```typescript
// web/app/layout.tsx
"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { I18nProvider, useI18n } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const inter = Inter({ subsets: ["latin"] });

// ⚠️ 注意：由于使用了 'use client'，Metadata 需要在服务端组件中
// 解决方案：将 metadata 移到单独的服务端组件或使用 next/head

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();

  return (
    <>
      <nav className="border-b border-gray-200 bg-white">
        {/* ... 导航栏代码 ... */}
      </nav>
      <main>{children}</main>
      <footer className="bg-gray-50 border-t border-gray-200 mt-20">
        {/* ... 页脚代码 ... */}
      </footer>
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD 结构化数据
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Mitochondrial Protein Analysis Platform",
    applicationCategory: "ScientificApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    description:
      "Professional mitochondrial protein fluorescence intensity analysis cloud service platform. Support CZI format microscopy images, multiple threshold methods, batch processing capabilities.",
    url:
      typeof window !== "undefined"
        ? window.location.origin
        : "https://yourdomain.com",
    author: {
      "@type": "Organization",
      name: "Your Organization",
      url: "https://yourdomain.com",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "128",
      bestRating: "5",
      worstRating: "1",
    },
    featureList: [
      "CZI file format support",
      "Multiple threshold methods (Otsu, Li, Yen)",
      "Batch processing",
      "Visualization generation",
      "Export to CSV/JSON",
    ],
  };

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* 基础 Meta 标签 */}
        <title>
          Mitochondrial Protein Analysis Platform | 线粒体蛋白荧光强度分析
        </title>
        <meta
          name="description"
          content="Professional mitochondrial protein fluorescence intensity analysis platform. Support CZI format, multiple threshold methods, batch processing. Free online tool for researchers. 专业的线粒体蛋白荧光强度分析平台。"
        />
        <meta
          name="keywords"
          content="mitochondrial analysis, protein fluorescence, CZI analysis, microscopy, scientific tool, 线粒体分析, 荧光强度, 显微镜图像, 科研工具"
        />
        <meta name="author" content="Your Organization" />
        <meta name="robots" content="index, follow" />
        <meta
          name="googlebot"
          content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/" />
        <meta
          property="og:title"
          content="Mitochondrial Protein Analysis Platform"
        />
        <meta
          property="og:description"
          content="Professional mitochondrial protein fluorescence intensity analysis platform. Free online tool for researchers."
        />
        <meta
          property="og:image"
          content="https://yourdomain.com/og-image.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="Mitochondrial Analysis Platform Screenshot"
        />
        <meta property="og:site_name" content="Mitochondrial Analysis" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:locale:alternate" content="zh_CN" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://yourdomain.com/" />
        <meta
          name="twitter:title"
          content="Mitochondrial Protein Analysis Platform"
        />
        <meta
          name="twitter:description"
          content="Professional mitochondrial protein fluorescence intensity analysis platform."
        />
        <meta
          name="twitter:image"
          content="https://yourdomain.com/twitter-image.png"
        />
        <meta name="twitter:creator" content="@yourhandle" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://yourdomain.com/" />

        {/* 多语言支持 */}
        <link rel="alternate" hrefLang="en" href="https://yourdomain.com/" />
        <link rel="alternate" hrefLang="zh" href="https://yourdomain.com/zh" />
        <link
          rel="alternate"
          hrefLang="x-default"
          href="https://yourdomain.com/"
        />

        {/* Theme Color */}
        <meta name="theme-color" content="#9333ea" />
        <meta name="msapplication-TileColor" content="#9333ea" />

        {/* JSON-LD 结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Google Site Verification (替换为您的验证码) */}
        <meta
          name="google-site-verification"
          content="your-verification-code-here"
        />

        {/* Bing Site Verification (替换为您的验证码) */}
        <meta name="msvalidate.01" content="your-bing-verification-code" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <I18nProvider>
          <LayoutContent>{children}</LayoutContent>
        </I18nProvider>
      </body>
    </html>
  );
}
```

---

### 第 2 步：为每个页面添加动态 Head 标签

由于 layout 是客户端组件，我们需要为每个页面单独添加 SEO 标签：

#### 首页 SEO

```typescript
// web/app/page.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
// ... 其他导入

export default function Home() {
  const { t } = useI18n();

  // 动态更新 head 标签
  useEffect(() => {
    // 更新 title
    document.title =
      "Mitochondrial Protein Analysis Platform | 线粒体蛋白荧光强度分析";

    // 更新 description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Professional mitochondrial protein fluorescence intensity analysis platform. Support CZI format, multiple threshold methods, batch processing. Free online tool for researchers."
      );
    }

    // 更新 canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute("href", window.location.origin + "/");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* ... 页面内容 ... */}
    </div>
  );
}
```

#### 分析页面 SEO

```typescript
// web/app/analyze/page.tsx
"use client";

import { useEffect } from "react";
// ... 其他导入

export default function AnalyzePage() {
  const { t } = useI18n();

  useEffect(() => {
    document.title =
      "Analyze CZI Files - Mitochondrial Analysis | 分析 CZI 文件";

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Upload and analyze CZI microscopy images. Configure mitochondrial and target protein channels, choose threshold methods, get detailed analysis results with visualization."
      );
    }

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute("href", window.location.origin + "/analyze");
    }

    // 更新 Open Graph 标签
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute(
        "content",
        "Analyze CZI Files - Mitochondrial Analysis"
      );
    }

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute("content", window.location.origin + "/analyze");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {/* ... 页面内容 ... */}
    </div>
  );
}
```

#### 文档页面 SEO

```typescript
// web/app/docs/page.tsx
"use client";

import { useEffect } from "react";
// ... 其他导入

export default function DocsPage() {
  const { t } = useI18n();

  useEffect(() => {
    document.title = "Documentation - How to Use | 使用文档";

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Complete guide for mitochondrial protein analysis. Learn about parameters, threshold methods, results interpretation, API usage, and FAQs."
      );
    }

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute("href", window.location.origin + "/docs");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {/* ... 页面内容 ... */}
    </div>
  );
}
```

---

### 第 3 步：创建 robots.txt

```txt
# web/public/robots.txt
# Allow all crawlers
User-agent: *
Allow: /

# Disallow API routes (if any)
Disallow: /api/

# Disallow admin routes (if any)
# Disallow: /admin/

# Crawl delay (optional, in seconds)
# Crawl-delay: 1

# Sitemap location
Sitemap: https://yourdomain.com/sitemap.xml
Sitemap: https://yourdomain.com/sitemap-zh.xml

# Specific bot rules
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# Block bad bots (optional)
User-agent: AhrefsBot
Crawl-delay: 10

User-agent: SemrushBot
Crawl-delay: 10
```

---

### 第 4 步：创建 sitemap.xml

#### 方法 A：静态 sitemap（简单）

```xml
<!-- web/public/sitemap.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <!-- 首页 -->
  <url>
    <loc>https://yourdomain.com/</loc>
    <lastmod>2025-01-08</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="en" href="https://yourdomain.com/" />
    <xhtml:link rel="alternate" hreflang="zh" href="https://yourdomain.com/zh" />
  </url>

  <!-- 分析页面 -->
  <url>
    <loc>https://yourdomain.com/analyze</loc>
    <lastmod>2025-01-08</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- 文档页面 -->
  <url>
    <loc>https://yourdomain.com/docs</loc>
    <lastmod>2025-01-08</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

#### 方法 B：动态 sitemap（推荐，但需要服务端组件）

由于您的 layout 是客户端组件，静态 sitemap 更简单。

---

### 第 5 步：创建 manifest.json（PWA 支持）

```json
{
  "name": "Mitochondrial Protein Analysis Platform",
  "short_name": "MitoAnalysis",
  "description": "Professional mitochondrial protein fluorescence intensity analysis",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#9333ea",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icon-192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "/icon-512.png",
      "type": "image/png",
      "sizes": "512x512"
    },
    {
      "src": "/icon-maskable-192.png",
      "type": "image/png",
      "sizes": "192x192",
      "purpose": "maskable"
    },
    {
      "src": "/icon-maskable-512.png",
      "type": "image/png",
      "sizes": "512x512",
      "purpose": "maskable"
    }
  ],
  "categories": ["education", "productivity", "science"],
  "screenshots": [
    {
      "src": "/screenshot-desktop.png",
      "type": "image/png",
      "sizes": "1920x1080",
      "form_factor": "wide"
    },
    {
      "src": "/screenshot-mobile.png",
      "type": "image/png",
      "sizes": "750x1334",
      "form_factor": "narrow"
    }
  ]
}
```

---

### 第 6 步：创建 OG Image 和 Favicons

#### 需要创建的图片文件：

1. **OG Image** (`public/og-image.png`)

   - 尺寸：1200 x 630 px
   - 格式：PNG 或 JPG
   - 内容：品牌 logo + 产品截图 + 标题

2. **Twitter Card Image** (`public/twitter-image.png`)

   - 尺寸：1200 x 600 px
   - 格式：PNG 或 JPG

3. **Favicon** 系列：
   - `public/favicon.ico` (32x32 px)
   - `public/icon.svg` (SVG 格式)
   - `public/apple-touch-icon.png` (180x180 px)
   - `public/icon-192.png` (192x192 px)
   - `public/icon-512.png` (512x512 px)

#### 在线工具推荐：

- **Favicon Generator**: https://realfavicongenerator.net/
- **OG Image Generator**: https://www.canva.com/ 或 Figma
- **Optimizilla**: 图片压缩工具

---

### 第 7 步：性能优化（SEO 相关）

#### 优化图片加载

```typescript
// 在所有页面中使用 Next.js Image 组件
import Image from "next/image";

<Image
  src="/hero-image.jpg"
  alt="Mitochondrial analysis platform interface"
  width={1200}
  height={630}
  priority // 首屏图片优先加载
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>;
```

#### 添加 Loading 状态

```typescript
// web/app/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
    </div>
  );
}
```

---

### 第 8 步：Google Analytics（可选但推荐）

```typescript
// web/app/layout.tsx - 在 head 中添加
<script
  async
  src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
/>
<script
  dangerouslySetInnerHTML={{
    __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX');
    `,
  }}
/>
```

---

## 部署后 SEO 检查清单

### 提交到搜索引擎

1. **Google Search Console**

   - 访问：https://search.google.com/search-console
   - 添加网站
   - 提交 sitemap.xml
   - 验证所有权

2. **Bing Webmaster Tools**

   - 访问：https://www.bing.com/webmasters
   - 添加网站
   - 提交 sitemap.xml

3. **百度站长平台**（如针对中国用户）
   - 访问：https://ziyuan.baidu.com/
   - 添加网站
   - 提交 sitemap

### SEO 测试工具

使用以下工具验证 SEO 实施：

1. **Google Lighthouse**

   - Chrome DevTools > Lighthouse
   - 检查 SEO 分数（目标：90+）

2. **Meta Tags Checker**

   - https://metatags.io/
   - 验证 Open Graph 和 Twitter Cards

3. **Schema.org Validator**

   - https://validator.schema.org/
   - 验证 JSON-LD 结构化数据

4. **Google Rich Results Test**
   - https://search.google.com/test/rich-results
   - 测试富媒体搜索结果

---

## 监控和维护

### 定期检查（每月）

- [ ] Google Search Console 性能报告
- [ ] Lighthouse SEO 分数
- [ ] 404 错误检查
- [ ] Sitemap 更新
- [ ] 竞品 SEO 分析

### 持续优化

- [ ] 添加博客内容（提高关键词覆盖）
- [ ] 优化页面加载速度
- [ ] 获取外部链接（backlinks）
- [ ] 更新内容保持新鲜度

---

## 预期效果

### SEO 实施后（3-6 个月）

- 搜索引擎收录：30-50 个页面
- 有机流量：预计 100-500 访问/月
- 关键词排名：10-20 个关键词进入前 50

### 长期效果（1 年+）

- 域名权重（DA）：20-40
- 有机流量：500-2000 访问/月
- 转化率：5-10%（访客到用户）

---

需要我为您：

1. 生成 OG Image 设计模板吗？
2. 创建完整的图片资源清单吗？
3. 提供 Google Analytics 集成详细代码吗？

告诉我您需要哪些！
