# Phase 1 实施指南：国际化 (i18n) - 英语支持

## 🎯 目标
为项目添加完整的国际化支持，英语作为第一外语，实现中英文无缝切换。

---

## 📦 Step 1: 安装依赖

```bash
cd /home/vncl/projects/blackpig/apps/saas/bioinfo/mitochondrial_protein_fluorescence_intensity_analysis/web

npm install next-intl
```

---

## 📁 Step 2: 创建文件结构

### 2.1 创建翻译文件目录

```bash
mkdir -p messages
```

### 2.2 创建中文翻译文件

创建 `messages/zh.json`:

```json
{
  "common": {
    "loading": "加载中...",
    "error": "错误",
    "success": "成功",
    "cancel": "取消",
    "confirm": "确认",
    "close": "关闭",
    "download": "下载",
    "upload": "上传",
    "reset": "重置",
    "back": "返回"
  },
  "nav": {
    "home": "首页",
    "analyze": "分析",
    "docs": "文档"
  },
  "home": {
    "title": "专业的线粒体蛋白荧光强度分析平台",
    "subtitle": "基于云端的显微镜图像分析服务，支持 CZI 文件格式，提供精确的荧光强度测量和专业的可视化结果",
    "cta": {
      "startAnalysis": "开始分析",
      "viewDocs": "查看文档"
    },
    "features": {
      "title": "为什么选择我们？",
      "subtitle": "专业、快速、准确的线粒体蛋白分析解决方案",
      "fast": {
        "title": "快速分析",
        "description": "基于云端计算，秒级完成图像分析，无需本地安装软件"
      },
      "reliable": {
        "title": "专业可靠",
        "description": "采用经典的图像处理算法，提供多种阈值分割方法"
      },
      "czi": {
        "title": "支持 CZI",
        "description": "原生支持 Zeiss CZI 文件格式，保留完整的元数据信息"
      },
      "accurate": {
        "title": "精确测量",
        "description": "提供多项关键指标，包括平均强度、总强度、像素统计等"
      }
    },
    "howItWorks": {
      "title": "如何使用？",
      "subtitle": "三步完成专业级的线粒体蛋白分析",
      "step1": {
        "title": "上传文件",
        "description": "上传您的 CZI 格式显微镜图像文件，支持拖拽上传"
      },
      "step2": {
        "title": "配置参数",
        "description": "选择线粒体通道和目标蛋白通道，调整分析参数"
      },
      "step3": {
        "title": "获取结果",
        "description": "查看详细的分析结果和可视化图像，导出数据"
      },
      "cta": "立即开始分析"
    },
    "finalCta": {
      "title": "准备好开始分析了吗？",
      "subtitle": "无需注册，立即体验专业的线粒体蛋白荧光强度分析服务",
      "button": "开始免费分析"
    }
  },
  "analyze": {
    "title": "线粒体蛋白荧光强度分析",
    "subtitle": "上传 CZI 文件，配置分析参数，获取专业的分析结果",
    "upload": {
      "title": "1. 上传文件",
      "dragDrop": "点击或拖拽 CZI 文件到此区域",
      "support": "支持单文件上传",
      "selected": "已选择文件"
    },
    "parameters": {
      "title": "2. 配置参数",
      "mitochondrialChannel": "线粒体通道索引 (Mitochondrial Channel)",
      "mitochondrialChannelHint": "线粒体染料所在的通道（如 MitoTracker）",
      "targetProteinChannel": "目标蛋白通道索引 (Target Protein Channel)",
      "targetProteinChannelHint": "目标蛋白所在的通道（如 GFP、RFP 标记）",
      "thresholdMethod": "阈值分割方法 (Threshold Method)",
      "thresholdMethodHint": "选择适合您图像特征的阈值分割方法",
      "otsu": "Otsu - 适用于双峰分布（推荐）",
      "li": "Li - 基于最小交叉熵",
      "yen": "Yen - 适用于低对比度",
      "generateVisualization": "生成可视化图像",
      "generateVisualizationHint": "生成包含原始图像、掩膜和分析结果的可视化图像（会增加处理时间）"
    },
    "actions": {
      "analyze": "开始分析",
      "analyzing": "分析中...",
      "reset": "重置"
    },
    "tips": {
      "title": "💡 参数说明",
      "mitochondrialChannel": "线粒体通道: 通常为通道 0（红色）",
      "targetProteinChannel": "目标蛋白通道: 通常为通道 2（绿色）",
      "thresholdMethod": "阈值方法: Otsu 适用于大多数情况",
      "visualization": "生成可视化: 建议开启以查看结果"
    },
    "results": {
      "title": "3. 分析结果",
      "analyzing": {
        "title": "正在分析中...",
        "subtitle": "请稍候，这可能需要几秒钟时间"
      },
      "ready": {
        "title": "准备就绪",
        "subtitle": "上传您的 CZI 文件，配置分析参数，然后点击"开始分析"按钮即可获取结果"
      },
      "failed": {
        "title": "分析失败"
      }
    },
    "warnings": {
      "title": "重要提示",
      "format": "仅支持 Zeiss CZI 格式的显微镜图像文件",
      "size": "文件大小建议不超过 100MB，以确保分析速度",
      "channels": "确保图像包含至少 2 个通道（线粒体和目标蛋白）",
      "disclaimer": "分析结果仅供科研参考，不作为临床诊断依据"
    },
    "errors": {
      "noFile": "请先上传文件"
    }
  },
  "results": {
    "params": {
      "title": "分析参数",
      "mitochondrialChannel": "线粒体通道",
      "targetProteinChannel": "目标蛋白通道",
      "thresholdMethod": "阈值方法"
    },
    "metrics": {
      "title": "分析结果",
      "fileName": "文件名",
      "fileNameDesc": "分析的文件名称",
      "avgIntensity": "平均荧光强度",
      "avgIntensityDesc": "线粒体区域内目标蛋白的平均荧光强度",
      "totalIntensity": "总荧光强度",
      "totalIntensityDesc": "线粒体区域内目标蛋白的总荧光强度",
      "pixelCount": "线粒体像素数",
      "pixelCountDesc": "被识别为线粒体的像素数量",
      "mitoAvgIntensity": "线粒体平均强度",
      "mitoAvgIntensityDesc": "线粒体通道本身的平均强度",
      "coverage": "掩膜覆盖率",
      "coverageDesc": "线粒体占图像的百分比",
      "threshold": "阈值",
      "thresholdDesc": "使用的分割阈值"
    },
    "status": {
      "good": "正常",
      "warning": "注意",
      "error": "异常"
    },
    "visualization": {
      "title": "可视化图像",
      "topLeft": "左上：原始线粒体通道",
      "topLeftDesc": "显示线粒体染料的原始荧光信号",
      "topRight": "右上：线粒体掩膜",
      "topRightDesc": "阈值分割后的线粒体区域",
      "bottomLeft": "左下：原始目标蛋白通道",
      "bottomLeftDesc": "目标蛋白的原始荧光信号",
      "bottomRight": "右下：掩膜内的目标蛋白",
      "bottomRightDesc": "线粒体区域内的目标蛋白分布"
    }
  },
  "docs": {
    "title": "使用文档",
    "subtitle": "了解如何使用线粒体蛋白荧光强度分析平台"
  }
}
```

### 2.3 创建英文翻译文件

创建 `messages/en.json`:

```json
{
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "success": "Success",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "close": "Close",
    "download": "Download",
    "upload": "Upload",
    "reset": "Reset",
    "back": "Back"
  },
  "nav": {
    "home": "Home",
    "analyze": "Analyze",
    "docs": "Documentation"
  },
  "home": {
    "title": "Professional Mitochondrial Protein Fluorescence Intensity Analysis Platform",
    "subtitle": "Cloud-based microscopy image analysis service supporting CZI file format, providing precise fluorescence intensity measurements and professional visualization results",
    "cta": {
      "startAnalysis": "Start Analysis",
      "viewDocs": "View Documentation"
    },
    "features": {
      "title": "Why Choose Us?",
      "subtitle": "Professional, Fast, and Accurate Mitochondrial Protein Analysis Solutions",
      "fast": {
        "title": "Fast Analysis",
        "description": "Cloud-based computing delivers results in seconds without local software installation"
      },
      "reliable": {
        "title": "Professional & Reliable",
        "description": "Uses classic image processing algorithms with multiple thresholding methods"
      },
      "czi": {
        "title": "CZI Support",
        "description": "Native support for Zeiss CZI file format, preserving complete metadata"
      },
      "accurate": {
        "title": "Precise Measurement",
        "description": "Provides multiple key metrics including average intensity, total intensity, and pixel statistics"
      }
    },
    "howItWorks": {
      "title": "How It Works?",
      "subtitle": "Complete professional mitochondrial protein analysis in three steps",
      "step1": {
        "title": "Upload Files",
        "description": "Upload your CZI format microscopy image files with drag-and-drop support"
      },
      "step2": {
        "title": "Configure Parameters",
        "description": "Select mitochondrial and target protein channels, adjust analysis parameters"
      },
      "step3": {
        "title": "Get Results",
        "description": "View detailed analysis results and visualization images, export data"
      },
      "cta": "Start Analysis Now"
    },
    "finalCta": {
      "title": "Ready to Start Analysis?",
      "subtitle": "No registration required, experience professional mitochondrial protein fluorescence intensity analysis service immediately",
      "button": "Start Free Analysis"
    }
  },
  "analyze": {
    "title": "Mitochondrial Protein Fluorescence Intensity Analysis",
    "subtitle": "Upload CZI files, configure analysis parameters, and get professional analysis results",
    "upload": {
      "title": "1. Upload Files",
      "dragDrop": "Click or drag CZI files to this area",
      "support": "Supports single file upload",
      "selected": "Selected file"
    },
    "parameters": {
      "title": "2. Configure Parameters",
      "mitochondrialChannel": "Mitochondrial Channel Index",
      "mitochondrialChannelHint": "Channel containing mitochondrial dye (e.g., MitoTracker)",
      "targetProteinChannel": "Target Protein Channel Index",
      "targetProteinChannelHint": "Channel containing target protein (e.g., GFP, RFP markers)",
      "thresholdMethod": "Threshold Method",
      "thresholdMethodHint": "Select threshold method suitable for your image characteristics",
      "otsu": "Otsu - For bimodal distribution (Recommended)",
      "li": "Li - Based on minimum cross entropy",
      "yen": "Yen - For low contrast images",
      "generateVisualization": "Generate Visualization",
      "generateVisualizationHint": "Generate visualization image including original images, masks, and analysis results (increases processing time)"
    },
    "actions": {
      "analyze": "Start Analysis",
      "analyzing": "Analyzing...",
      "reset": "Reset"
    },
    "tips": {
      "title": "💡 Parameter Tips",
      "mitochondrialChannel": "Mitochondrial Channel: Usually channel 0 (red)",
      "targetProteinChannel": "Target Protein Channel: Usually channel 2 (green)",
      "thresholdMethod": "Threshold Method: Otsu works for most cases",
      "visualization": "Generate Visualization: Recommended to view results"
    },
    "results": {
      "title": "3. Analysis Results",
      "analyzing": {
        "title": "Analyzing...",
        "subtitle": "Please wait, this may take a few seconds"
      },
      "ready": {
        "title": "Ready",
        "subtitle": "Upload your CZI file, configure analysis parameters, then click 'Start Analysis' to get results"
      },
      "failed": {
        "title": "Analysis Failed"
      }
    },
    "warnings": {
      "title": "Important Notes",
      "format": "Only supports Zeiss CZI format microscopy image files",
      "size": "File size recommended not to exceed 100MB to ensure analysis speed",
      "channels": "Ensure image contains at least 2 channels (mitochondria and target protein)",
      "disclaimer": "Analysis results are for research reference only, not for clinical diagnosis"
    },
    "errors": {
      "noFile": "Please upload a file first"
    }
  },
  "results": {
    "params": {
      "title": "Analysis Parameters",
      "mitochondrialChannel": "Mitochondrial Channel",
      "targetProteinChannel": "Target Protein Channel",
      "thresholdMethod": "Threshold Method"
    },
    "metrics": {
      "title": "Analysis Results",
      "fileName": "File Name",
      "fileNameDesc": "Name of the analyzed file",
      "avgIntensity": "Average Intensity",
      "avgIntensityDesc": "Average fluorescence intensity of target protein in mitochondrial region",
      "totalIntensity": "Total Intensity",
      "totalIntensityDesc": "Total fluorescence intensity of target protein in mitochondrial region",
      "pixelCount": "Mitochondrial Pixels",
      "pixelCountDesc": "Number of pixels identified as mitochondria",
      "mitoAvgIntensity": "Mitochondrial Avg Intensity",
      "mitoAvgIntensityDesc": "Average intensity of mitochondrial channel itself",
      "coverage": "Mask Coverage",
      "coverageDesc": "Percentage of mitochondria in the image",
      "threshold": "Threshold",
      "thresholdDesc": "Segmentation threshold used"
    },
    "status": {
      "good": "Good",
      "warning": "Warning",
      "error": "Error"
    },
    "visualization": {
      "title": "Visualization",
      "topLeft": "Top Left: Original Mitochondrial Channel",
      "topLeftDesc": "Shows original fluorescence signal of mitochondrial dye",
      "topRight": "Top Right: Mitochondrial Mask",
      "topRightDesc": "Mitochondrial region after threshold segmentation",
      "bottomLeft": "Bottom Left: Original Target Protein Channel",
      "bottomLeftDesc": "Original fluorescence signal of target protein",
      "bottomRight": "Bottom Right: Target Protein in Mask",
      "bottomRightDesc": "Distribution of target protein within mitochondrial region"
    }
  },
  "docs": {
    "title": "Documentation",
    "subtitle": "Learn how to use the Mitochondrial Protein Fluorescence Intensity Analysis Platform"
  }
}
```

---

## ⚙️ Step 3: 配置 i18n

### 3.1 创建 i18n 配置文件

创建 `i18n.ts`:

```typescript
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// 支持的语言列表
export const locales = ['en', 'zh'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  // 验证语言是否支持
  if (!locales.includes(locale as Locale)) notFound();

  return {
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
```

### 3.2 创建中间件

创建 `middleware.ts`:

```typescript
import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

export default createMiddleware({
  // 支持的语言列表
  locales,
  
  // 默认语言
  defaultLocale: 'zh',
  
  // 语言检测策略
  localeDetection: true
});

export const config = {
  // 匹配所有路径，除了 api、_next、静态文件
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
```

### 3.3 更新 Next.js 配置

修改 `next.config.ts`:

```typescript
import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  // ... 其他配置
};

export default withNextIntl(nextConfig);
```

---

## 🔄 Step 4: 更新应用结构

### 4.1 创建语言路由结构

重构 `app` 目录:

```bash
mkdir -p app/[locale]
mv app/page.tsx app/[locale]/
mv app/analyze app/[locale]/
mv app/docs app/[locale]/
```

### 4.2 更新根布局

修改 `app/[locale]/layout.tsx`:

```typescript
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import Navigation from '@/components/Navigation';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // 验证语言
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // 获取翻译消息
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Navigation />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

---

## 🎨 Step 5: 创建语言切换组件

创建 `components/LanguageSwitcher.tsx`:

```typescript
'use client'

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales } from '@/i18n';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (newLocale: string) => {
    // 移除当前语言前缀
    const pathWithoutLocale = pathname.replace(`/${locale}`, '');
    // 添加新语言前缀
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <select
      value={locale}
      onChange={(e) => switchLanguage(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-purple-500"
    >
      <option value="zh">中文</option>
      <option value="en">English</option>
    </select>
  );
}
```

---

## 📝 Step 6: 更新组件使用翻译

### 6.1 更新首页

修改 `app/[locale]/page.tsx`:

```typescript
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Microscope, Zap, Shield, TrendingUp } from 'lucide-react';

export default function Home() {
  const t = useTranslations('home');
  const tNav = useTranslations('nav');

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              {t('title')}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {t('subtitle')}
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/analyze">
                <Button size="lg">
                  {t('cta.startAnalysis')}
                </Button>
              </Link>
              <Link href="/docs">
                <Button size="lg" variant="outline">
                  {t('cta.viewDocs')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('features.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      {/* ... 其他部分类似 */}
    </div>
  );
}

const features = [
  { key: 'fast', icon: Zap },
  { key: 'reliable', icon: Shield },
  { key: 'czi', icon: Microscope },
  { key: 'accurate', icon: TrendingUp }
];

function FeatureCard({ feature }: { feature: any }) {
  const t = useTranslations('home.features');
  const Icon = feature.icon;
  
  return (
    <div className="p-6 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all">
      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-purple-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {t(`${feature.key}.title`)}
      </h3>
      <p className="text-gray-600 text-sm">
        {t(`${feature.key}.description`)}
      </p>
    </div>
  );
}
```

### 6.2 更新分析页面

修改 `app/[locale]/analyze/page.tsx` 的关键部分:

```typescript
import { useTranslations } from 'next-intl';

export default function AnalyzePage() {
  const t = useTranslations('analyze');
  const tCommon = useTranslations('common');
  
  // ... state定义 ...

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('subtitle')}
          </p>
        </div>

        {/* 上传区域 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('upload.title')}</CardTitle>
          </CardHeader>
          {/* ... */}
        </Card>

        {/* 按钮 */}
        <Button onClick={handleAnalyze}>
          {isAnalyzing ? t('actions.analyzing') : t('actions.analyze')}
        </Button>

        {/* ... */}
      </div>
    </div>
  );
}
```

---

## ✅ Step 7: 测试

### 7.1 启动开发服务器

```bash
npm run dev
```

### 7.2 测试语言切换

访问:
- 中文: http://localhost:3001/zh
- 英文: http://localhost:3001/en

### 7.3 验证功能

- [ ] 首页中英文切换正常
- [ ] 分析页面中英文切换正常
- [ ] 文档页面中英文切换正常
- [ ] 语言选择器工作正常
- [ ] 浏览器语言自动检测
- [ ] URL 路由正确（/zh/... 和 /en/...）

---

## 📚 完整代码参考

所有修改后的完整文件代码，请参考:
- `messages/zh.json` - 中文翻译
- `messages/en.json` - 英文翻译
- `i18n.ts` - i18n 配置
- `middleware.ts` - 路由中间件
- `app/[locale]/layout.tsx` - 国际化布局
- `components/LanguageSwitcher.tsx` - 语言切换组件

---

## 🐛 常见问题

### Q: 翻译不显示？
A: 检查 `messages/${locale}.json` 文件是否存在，key 是否正确

### Q: 路由 404？
A: 确保中间件配置正确，检查 `matcher` 配置

### Q: 默认语言不对？
A: 在 `middleware.ts` 中修改 `defaultLocale`

### Q: 如何添加更多语言？
A: 
1. 在 `messages/` 添加新语言 JSON 文件
2. 在 `i18n.ts` 的 `locales` 数组添加语言代码
3. 在语言切换器添加选项

---

## 📈 下一步

完成 i18n 后，继续 Phase 2：批量文件分析 UI

参考: `ROADMAP.md` Phase 2 部分

---

**预计完成时间**: 2-3 天（全职）或 1 周（兼职）
**复杂度**: ⭐⭐⭐ 中等
**优先级**: 🔴 最高
