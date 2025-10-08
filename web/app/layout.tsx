'use client'

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { I18nProvider, useI18n } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const inter = Inter({ subsets: ["latin"] });

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();

  return (
    <>
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  {t('nav.brand')}
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                {t('nav.home')}
              </Link>
              <Link
                href="/analyze"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                {t('nav.analyze')}
              </Link>
              <Link
                href="/docs"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                {t('nav.docs')}
              </Link>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
      <footer className="bg-gray-50 border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('nav.footer.product')}</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/analyze" className="text-gray-600 hover:text-gray-900 text-sm">
                    {t('nav.footer.startAnalysis')}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('nav.footer.about')}</h3>
              <ul className="space-y-2">
                <li className="text-gray-600 text-sm">{t('nav.footer.aboutUs')}</li>
                <li className="text-gray-600 text-sm">{t('nav.footer.contactUs')}</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('nav.footer.legal')}</h3>
              <ul className="space-y-2">
                <li className="text-gray-600 text-sm">{t('nav.footer.privacy')}</li>
                <li className="text-gray-600 text-sm">{t('nav.footer.terms')}</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-500 text-sm">
              {t('nav.footer.copyright')}
            </p>
          </div>
        </div>
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
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'Mitochondrial Protein Analysis Platform',
    'applicationCategory': 'ScientificApplication',
    'operatingSystem': 'Any',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
      'availability': 'https://schema.org/InStock'
    },
    'description': 'Professional mitochondrial protein fluorescence intensity analysis cloud service platform. Support CZI format microscopy images, multiple threshold methods, batch processing capabilities.',
    'author': {
      '@type': 'Organization',
      'name': 'BioInfo Research Lab'
    },
    'featureList': [
      'CZI file format support',
      'Multiple threshold methods (Otsu, Li, Yen)',
      'Batch processing',
      'Visualization generation',
      'Export to CSV/JSON'
    ]
  };

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* 基础 Meta 标签 */}
        <title>Mitochondrial Protein Analysis Platform | 线粒体蛋白荧光强度分析</title>
        <meta name="description" content="Professional mitochondrial protein fluorescence intensity analysis platform. Support CZI format, multiple threshold methods, batch processing. Free online tool for researchers. 专业的线粒体蛋白荧光强度分析平台。" />
        <meta name="keywords" content="mitochondrial analysis, protein fluorescence, CZI analysis, microscopy, scientific tool, 线粒体分析, 荧光强度, 显微镜图像, 科研工具" />
        <meta name="author" content="BioInfo Research Lab" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Mitochondrial Protein Analysis Platform" />
        <meta property="og:description" content="Professional mitochondrial protein fluorescence intensity analysis platform. Free online tool for researchers." />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Mitochondrial Analysis Platform Screenshot" />
        <meta property="og:site_name" content="Mitochondrial Analysis" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:locale:alternate" content="zh_CN" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Mitochondrial Protein Analysis Platform" />
        <meta name="twitter:description" content="Professional mitochondrial protein fluorescence intensity analysis platform." />
        <meta name="twitter:image" content="/twitter-image.png" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* 多语言支持 */}
        <link rel="alternate" hrefLang="en" href="/" />
        <link rel="alternate" hrefLang="zh" href="/" />
        <link rel="alternate" hrefLang="x-default" href="/" />

        {/* Theme Color */}
        <meta name="theme-color" content="#9333ea" />
        <meta name="msapplication-TileColor" content="#9333ea" />

        {/* JSON-LD 结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <I18nProvider>
          <LayoutContent>{children}</LayoutContent>
        </I18nProvider>
      </body>
    </html>
  );
}