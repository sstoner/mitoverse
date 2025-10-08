'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { Microscope, Zap, Shield, TrendingUp } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export default function Home() {
  const { t } = useI18n();

  // 动态更新 SEO 标签
  useEffect(() => {
    document.title = 'Mitochondrial Protein Analysis Platform | 线粒体蛋白荧光强度分析';

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Professional mitochondrial protein fluorescence intensity analysis platform. Support CZI format, multiple threshold methods, batch processing. Free online tool for researchers.');
    }

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('href', typeof window !== 'undefined' ? window.location.origin : '');
    }
  }, []);

  const features = [
    {
      icon: Zap,
      title: t('home.features.items.fast.title'),
      description: t('home.features.items.fast.description')
    },
    {
      icon: Shield,
      title: t('home.features.items.professional.title'),
      description: t('home.features.items.professional.description')
    },
    {
      icon: Microscope,
      title: t('home.features.items.cziSupport.title'),
      description: t('home.features.items.cziSupport.description')
    },
    {
      icon: TrendingUp,
      title: t('home.features.items.accurate.title'),
      description: t('home.features.items.accurate.description')
    }
  ];

  const steps = [
    {
      title: t('home.process.steps.upload.title'),
      description: t('home.process.steps.upload.description')
    },
    {
      title: t('home.process.steps.configure.title'),
      description: t('home.process.steps.configure.description')
    },
    {
      title: t('home.process.steps.results.title'),
      description: t('home.process.steps.results.description')
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              {t('home.hero.title')}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/analyze">
                <Button size="lg">
                  {t('home.hero.ctaStart')}
                </Button>
              </Link>
              <Link href="/docs">
                <Button size="lg" variant="outline">
                  {t('home.hero.ctaDocs')}
                </Button>
              </Link>
            </div>
          </div>

          {/* 示例图片区域 */}
          <div className="mt-16 relative">
            <div className="rounded-2xl shadow-2xl overflow-hidden border-8 border-white bg-gradient-to-br from-gray-100 to-gray-200 aspect-video flex items-center justify-center">
              <div className="text-center p-8">
                <Microscope className="w-24 h-24 mx-auto text-purple-600 mb-4" />
                <p className="text-gray-600 text-lg">{t('home.hero.demoImage')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('home.features.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('home.features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('home.process.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('home.process.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mb-4 text-white font-bold text-xl">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-purple-300 to-indigo-300"></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/analyze">
              <Button size="lg">
                {t('home.process.ctaButton')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t('home.cta.title')}
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            {t('home.cta.subtitle')}
          </p>
          <Link href="/analyze">
            <Button size="lg" variant="secondary">
              {t('home.cta.button')}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
