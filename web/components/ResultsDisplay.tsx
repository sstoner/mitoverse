'use client'

import { AnalysisResult } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { formatNumber } from '@/lib/utils'
import Image from 'next/image'
import Button from './ui/Button'
import { Download, FileText, Table, Image as ImageIcon } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface ResultsDisplayProps {
  result: AnalysisResult
}

export default function ResultsDisplay({ result }: ResultsDisplayProps) {
  const { t } = useI18n();
  const exportToJSON = () => {
    const data = {
      timestamp: new Date().toISOString(),
      result: result
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `analysis_${result.FileName}_${new Date().toISOString().slice(0, 10)}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToCSV = () => {
    const headers = [
      t('analyze.results.metrics.title'), t('analyze.results.export.csv')
    ]
    const rows = [
      [t('analyze.results.metrics.filename'), result.FileName],
      [t('analyze.results.metrics.avgIntensity'), result.Average_Intensity_in_Mitochondria],
      [t('analyze.results.metrics.totalIntensity'), result.Total_Intensity_in_Mitochondria],
      [t('analyze.results.metrics.pixelCount'), result.Mitochondrial_Pixels_Count],
      [t('analyze.results.metrics.mitoAvgIntensity'), result.Mitochondrial_Average_Intensity],
      [t('analyze.results.metrics.threshold'), result.Threshold_Value],
      [t('analyze.results.metrics.coverage') + '(%)', result.Mask_Coverage_Percentage],
      [t('analyze.results.parameters.mitochondrialChannel'), result.Mitochondrial_Channel_Index],
      [t('analyze.results.parameters.targetProteinChannel'), result.Target_Protein_Channel_Index],
      [t('analyze.results.parameters.thresholdMethod'), result.Threshold_Method]
    ]
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `analysis_${result.FileName}_${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportVisualization = () => {
    if (!result.visualization) return
    const link = document.createElement('a')
    link.href = `data:image/png;base64,${result.visualization}`
    link.download = `visualization_${result.FileName}_${new Date().toISOString().slice(0, 10)}.png`
    link.click()
  }

  const metrics = [
    {
      label: t('analyze.results.metrics.filename'),
      value: result.FileName,
      description: t('analyze.results.metrics.filenameDesc'),
    },
    {
      label: t('analyze.results.metrics.avgIntensity'),
      value: formatNumber(result.Average_Intensity_in_Mitochondria),
      description: t('analyze.results.metrics.avgIntensityDesc'),
      highlight: true,
    },
    {
      label: t('analyze.results.metrics.totalIntensity'),
      value: formatNumber(result.Total_Intensity_in_Mitochondria),
      description: t('analyze.results.metrics.totalIntensityDesc'),
    },
    {
      label: t('analyze.results.metrics.pixelCount'),
      value: result.Mitochondrial_Pixels_Count.toLocaleString(),
      description: t('analyze.results.metrics.pixelCountDesc'),
    },
    {
      label: t('analyze.results.metrics.mitoAvgIntensity'),
      value: formatNumber(result.Mitochondrial_Average_Intensity),
      description: t('analyze.results.metrics.mitoAvgIntensityDesc'),
    },
    {
      label: t('analyze.results.metrics.coverage'),
      value: `${formatNumber(result.Mask_Coverage_Percentage)}%`,
      description: t('analyze.results.metrics.coverageDesc'),
      status: getStatus(result.Mask_Coverage_Percentage),
    },
    {
      label: t('analyze.results.metrics.threshold'),
      value: formatNumber(result.Threshold_Value),
      description: t('analyze.results.metrics.thresholdDesc'),
    },
  ]

  const params = [
    {
      label: t('analyze.results.parameters.mitochondrialChannel'),
      value: result.Mitochondrial_Channel_Index,
    },
    {
      label: t('analyze.results.parameters.targetProteinChannel'),
      value: result.Target_Protein_Channel_Index,
    },
    {
      label: t('analyze.results.parameters.thresholdMethod'),
      value: result.Threshold_Method.toUpperCase(),
    },
  ]

  return (
    <div className="space-y-6">
      {/* 下载按钮区域 */}
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-purple-900 mb-1">{t('analyze.results.export.title')}</h3>
              <p className="text-sm text-purple-700">{t('analyze.results.export.description')}</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={exportToJSON}
                variant="outline"
                size="sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                {t('analyze.results.export.json')}
              </Button>
              <Button
                onClick={exportToCSV}
                variant="outline"
                size="sm"
              >
                <Table className="w-4 h-4 mr-2" />
                {t('analyze.results.export.csv')}
              </Button>
              {result.visualization && (
                <Button
                  onClick={exportVisualization}
                  variant="outline"
                  size="sm"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {t('analyze.results.export.image')}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 分析参数 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('analyze.results.parameters.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {params.map((param, index) => (
              <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">{param.label}</p>
                <p className="text-lg font-semibold text-gray-900">{param.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 分析结果 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('analyze.results.metrics.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg ${metric.highlight
                  ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200'
                  : 'bg-gray-50'
                  }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`font-medium ${metric.highlight ? 'text-purple-900' : 'text-gray-900'}`}>
                      {metric.label}
                    </p>
                    {metric.status && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${metric.status === 'good'
                          ? 'bg-green-100 text-green-700'
                          : metric.status === 'warning'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                          }`}
                      >
                        {t(`analyze.results.metrics.status.${metric.status}`)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{metric.description}</p>
                </div>
                <p className={`text-xl font-bold ${metric.highlight ? 'text-purple-600' : 'text-gray-900'}`}>
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 可视化图像 */}
      {result.visualization && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('analyze.results.visualization.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={`data:image/png;base64,${result.visualization}`}
                alt="Analysis Visualization"
                fill
                className="object-contain"
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <p className="font-medium">{t('analyze.results.visualization.topLeft')}</p>
                <p className="text-xs">{t('analyze.results.visualization.topLeftDesc')}</p>
              </div>
              <div>
                <p className="font-medium">{t('analyze.results.visualization.topRight')}</p>
                <p className="text-xs">{t('analyze.results.visualization.topRightDesc')}</p>
              </div>
              <div>
                <p className="font-medium">{t('analyze.results.visualization.bottomLeft')}</p>
                <p className="text-xs">{t('analyze.results.visualization.bottomLeftDesc')}</p>
              </div>
              <div>
                <p className="font-medium">{t('analyze.results.visualization.bottomRight')}</p>
                <p className="text-xs">{t('analyze.results.visualization.bottomRightDesc')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function getStatus(coverage: number): 'good' | 'warning' | 'error' | undefined {
  if (coverage < 1) return 'error'
  if (coverage < 3 || coverage > 30) return 'warning'
  return 'good'
}
