'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Code, FileText, Settings, TrendingUp } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export default function DocsPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('docs.title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('docs.subtitle')}
          </p>
        </div>

        {/* 快速开始 */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-purple-600" />
                <CardTitle>{t('docs.sections.quickStart')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-600">
              <p>{t('docs.quickStart.intro')}</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>{t('docs.quickStart.step1')}</li>
                <li>{t('docs.quickStart.step2')}</li>
                <li>{t('docs.quickStart.step3')}</li>
                <li>{t('docs.quickStart.step4')}</li>
              </ol>
            </CardContent>
          </Card>
        </section>

        {/* 参数说明 */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-purple-600" />
                <CardTitle>{t('docs.sections.parameters')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('docs.parameters.mitochondrial.title')}
                </h3>
                <p className="text-gray-600">{t('docs.parameters.mitochondrial.description')}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('docs.parameters.target.title')}
                </h3>
                <p className="text-gray-600">{t('docs.parameters.target.description')}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('docs.parameters.threshold.title')}
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>{t('docs.parameters.threshold.otsu')}</li>
                  <li>{t('docs.parameters.threshold.li')}</li>
                  <li>{t('docs.parameters.threshold.yen')}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('docs.parameters.visualization.title')}
                </h3>
                <p className="text-gray-600">{t('docs.parameters.visualization.description')}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 结果指标 */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                <CardTitle>{t('docs.sections.results')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-1">
                  {t('docs.results.avgIntensity')}
                </h4>
                <p className="text-sm text-gray-600">
                  {t('docs.results.avgIntensityDesc')}
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-1">
                  {t('docs.results.totalIntensity')}
                </h4>
                <p className="text-sm text-gray-600">
                  {t('docs.results.totalIntensityDesc')}
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-1">
                  {t('docs.results.pixelCount')}
                </h4>
                <p className="text-sm text-gray-600">
                  {t('docs.results.pixelCountDesc')}
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-1">
                  {t('docs.results.mitoAvgIntensity')}
                </h4>
                <p className="text-sm text-gray-600">
                  {t('docs.results.mitoAvgIntensityDesc')}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* API 文档 */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Code className="w-6 h-6 text-purple-600" />
                <CardTitle>{t('docs.sections.api')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">{t('docs.api.intro')}</p>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                <pre className="text-sm">
                  <code>{t('docs.api.endpoints')}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 常见问题 */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>{t('docs.sections.faq')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {t('docs.faq.q1.question')}
                </h4>
                <p className="text-gray-600">
                  {t('docs.faq.q1.answer')}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {t('docs.faq.q2.question')}
                </h4>
                <p className="text-gray-600">
                  {t('docs.faq.q2.answer')}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {t('docs.faq.q3.question')}
                </h4>
                <p className="text-gray-600">
                  {t('docs.faq.q3.answer')}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {t('docs.faq.q4.question')}
                </h4>
                <p className="text-gray-600">
                  {t('docs.faq.q4.answer')}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
