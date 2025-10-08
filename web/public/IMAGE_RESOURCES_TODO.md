# SEO 图片资源清单

## 需要创建的图片文件

### 1. Open Graph Image（社交媒体分享图）

**文件**: `og-image.png`

- **尺寸**: 1200 x 630 px
- **格式**: PNG 或 JPG
- **用途**: Facebook、LinkedIn 等社交媒体分享
- **内容建议**:
  - 产品 Logo
  - 平台名称：Mitochondrial Protein Analysis Platform
  - 简短描述：Professional CZI Analysis Tool
  - 产品截图或示意图（显微镜图像示例）
  - 使用品牌色：紫色 (#9333ea)

**在线设计工具**:

- Canva: https://www.canva.com/ (推荐)
- Figma: https://www.figma.com/
- 或使用 AI 工具生成

---

### 2. Twitter Card Image

**文件**: `twitter-image.png`

- **尺寸**: 1200 x 600 px
- **格式**: PNG 或 JPG
- **用途**: Twitter 分享卡片
- **内容**: 与 OG Image 相似，但比例稍宽

---

### 3. Favicon 系列

#### 3.1 标准 Favicon

**文件**: `favicon.ico`

- **尺寸**: 32 x 32 px（可包含多尺寸）
- **格式**: ICO
- **图标设计**: 字母 "M" 或显微镜图标

#### 3.2 SVG Icon（推荐）

**文件**: `icon.svg`

- **格式**: SVG（矢量）
- **优点**: 自适应所有尺寸，文件小
- **示例代码**:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#9333ea"/>
  <text x="50" y="70" font-size="60" font-weight="bold" text-anchor="middle" fill="white">M</text>
</svg>
```

#### 3.3 Apple Touch Icon

**文件**: `apple-touch-icon.png`

- **尺寸**: 180 x 180 px
- **格式**: PNG
- **用途**: iOS 主屏幕图标
- **要求**: 圆角会自动添加，设计时不需要圆角

#### 3.4 PWA Icons

**文件**: `icon-192.png`, `icon-512.png`

- **尺寸**: 192x192 px 和 512x512 px
- **格式**: PNG
- **用途**: 渐进式 Web 应用图标

---

## 快速生成方案

### 方案 1：使用 Favicon Generator（最简单）

1. 访问：https://realfavicongenerator.net/
2. 上传一个 512x512 的基础图标
3. 自动生成所有尺寸的 favicon
4. 下载并解压到 `web/public/`

### 方案 2：使用 Canva 设计

1. 创建 1200x630 的 OG Image
2. 导出 PNG
3. 使用在线工具调整尺寸生成其他版本
   - 推荐：https://www.iloveimg.com/resize-image

### 方案 3：使用 Figma（专业）

1. 设计完整品牌视觉系统
2. 导出所有需要的尺寸
3. 优化图片（使用 TinyPNG 压缩）

---

## 临时占位方案

如果暂时没有设计资源，可以使用简单的纯色图标：

### 创建简单的 SVG Icon

在 `web/public/icon.svg` 创建：

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#9333ea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4f46e5;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="20" fill="url(#grad)"/>
  <text x="50" y="75" font-size="65" font-weight="bold" text-anchor="middle" fill="white" font-family="Arial, sans-serif">M</text>
</svg>
```

### 使用 Placeholder Image Service

临时使用占位图：

- OG Image: https://via.placeholder.com/1200x630/9333ea/ffffff?text=Mitochondrial+Analysis
- Twitter Image: https://via.placeholder.com/1200x600/9333ea/ffffff?text=Mitochondrial+Analysis

---

## 图片优化检查清单

部署前检查：

- [ ] 所有图片已压缩（使用 TinyPNG 或 Squoosh）
- [ ] OG Image 文件大小 < 300 KB
- [ ] Favicon 文件大小 < 50 KB
- [ ] 图片包含正确的元数据（alt text）
- [ ] 在多个设备上测试显示效果
- [ ] 使用 https://metatags.io/ 预览社交媒体卡片

---

## 当前状态

✅ SEO Meta 标签已添加到 layout.tsx
✅ robots.txt 已创建
✅ sitemap.xml 已创建
✅ manifest.json 已创建
❌ 图片资源需要手动创建

**下一步**: 创建图片资源或使用临时 SVG 方案
