'use client'

import { AnalysisResult } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { formatNumber } from '@/lib/utils'
import Button from './ui/Button'
import { Download, ChevronDown, ChevronUp, FileText, Table } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'

interface BatchResultsDisplayProps {
  results: AnalysisResult[]
  failedFiles?: Array<{ filename: string; error: string }>
}

export default function BatchResultsDisplay({ results, failedFiles = [] }: BatchResultsDisplayProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  const exportToCSV = () => {
    const headers = [
      '文件名',
      '平均荧光强度',
      '总荧光强度',
      '线粒体像素数',
      '线粒体平均强度',
      '阈值',
      '掩膜覆盖率(%)',
      '线粒体通道',
      '目标蛋白通道',
      '阈值方法'
    ]

    const rows = results.map(result => [
      result.FileName,
      result.Average_Intensity_in_Mitochondria,
      result.Total_Intensity_in_Mitochondria,
      result.Mitochondrial_Pixels_Count,
      result.Mitochondrial_Average_Intensity,
      result.Threshold_Value,
      result.Mask_Coverage_Percentage,
      result.Mitochondrial_Channel_Index,
      result.Target_Protein_Channel_Index,
      result.Threshold_Method
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `batch_analysis_${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToJSON = () => {
    const data = {
      timestamp: new Date().toISOString(),
      total_files: results.length,
      failed_files: failedFiles.length,
      results: results,
      failed: failedFiles
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `batch_analysis_${new Date().toISOString().slice(0, 10)}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 计算统计数据
  const stats = {
    totalFiles: results.length + failedFiles.length,
    successCount: results.length,
    failedCount: failedFiles.length,
    avgIntensity: results.length > 0
      ? results.reduce((sum, r) => sum + r.Average_Intensity_in_Mitochondria, 0) / results.length
      : 0,
    avgCoverage: results.length > 0
      ? results.reduce((sum, r) => sum + r.Mask_Coverage_Percentage, 0) / results.length
      : 0,
  }

  return (
    <div className="space-y-6">
      {/* 统计概览 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">批量分析统计</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={exportToCSV}
                variant="outline"
                size="sm"
                disabled={results.length === 0}
              >
                <Table className="w-4 h-4 mr-2" />
                导出 CSV
              </Button>
              <Button
                onClick={exportToJSON}
                variant="outline"
                size="sm"
                disabled={results.length === 0}
              >
                <FileText className="w-4 h-4 mr-2" />
                导出 JSON
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 mb-1">总文件数</p>
              <p className="text-3xl font-bold text-blue-900">{stats.totalFiles}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-600 mb-1">成功分析</p>
              <p className="text-3xl font-bold text-green-900">{stats.successCount}</p>
            </div>
            {stats.failedCount > 0 && (
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-600 mb-1">分析失败</p>
                <p className="text-3xl font-bold text-red-900">{stats.failedCount}</p>
              </div>
            )}
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-600 mb-1">平均强度</p>
              <p className="text-2xl font-bold text-purple-900">{formatNumber(stats.avgIntensity)}</p>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <p className="text-sm text-indigo-600 mb-1">平均覆盖率</p>
              <p className="text-2xl font-bold text-indigo-900">{formatNumber(stats.avgCoverage)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 失败文件列表 */}
      {failedFiles.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-lg text-red-900">分析失败的文件</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {failedFiles.map((failed, index) => (
                <div key={index} className="p-3 bg-white border border-red-200 rounded-lg">
                  <p className="font-medium text-red-900">{failed.filename}</p>
                  <p className="text-sm text-red-700 mt-1">{failed.error}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 详细结果列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">详细分析结果</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
              >
                {/* 折叠头部 */}
                <button
                  onClick={() => toggleExpand(index)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-purple-600">{index + 1}</span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{result.FileName}</p>
                      <div className="flex gap-4 mt-1 text-sm text-gray-600">
                        <span>平均强度: <strong>{formatNumber(result.Average_Intensity_in_Mitochondria)}</strong></span>
                        <span>覆盖率: <strong>{formatNumber(result.Mask_Coverage_Percentage)}%</strong></span>
                      </div>
                    </div>
                  </div>
                  {expandedIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {/* 展开内容 */}
                {expandedIndex === index && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {/* 分析指标 */}
                      <div className="space-y-2">
                        <MetricRow
                          label="平均荧光强度"
                          value={formatNumber(result.Average_Intensity_in_Mitochondria)}
                          highlight
                        />
                        <MetricRow
                          label="总荧光强度"
                          value={formatNumber(result.Total_Intensity_in_Mitochondria)}
                        />
                        <MetricRow
                          label="线粒体像素数"
                          value={result.Mitochondrial_Pixels_Count.toLocaleString()}
                        />
                        <MetricRow
                          label="线粒体平均强度"
                          value={formatNumber(result.Mitochondrial_Average_Intensity)}
                        />
                        <MetricRow
                          label="阈值"
                          value={formatNumber(result.Threshold_Value)}
                        />
                      </div>

                      {/* 分析参数 */}
                      <div className="space-y-2">
                        <MetricRow
                          label="掩膜覆盖率"
                          value={`${formatNumber(result.Mask_Coverage_Percentage)}%`}
                        />
                        <MetricRow
                          label="线粒体通道"
                          value={result.Mitochondrial_Channel_Index.toString()}
                        />
                        <MetricRow
                          label="目标蛋白通道"
                          value={result.Target_Protein_Channel_Index.toString()}
                        />
                        <MetricRow
                          label="阈值方法"
                          value={result.Threshold_Method.toUpperCase()}
                        />
                      </div>
                    </div>

                    {/* 可视化图像 */}
                    {result.visualization && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">可视化图像</p>
                        <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={`data:image/png;base64,${result.visualization}`}
                            alt={`Visualization for ${result.FileName}`}
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MetricRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex justify-between items-center p-2 rounded ${highlight ? 'bg-purple-50' : 'bg-white'}`}>
      <span className={`text-sm ${highlight ? 'text-purple-900 font-medium' : 'text-gray-600'}`}>
        {label}
      </span>
      <span className={`text-sm font-semibold ${highlight ? 'text-purple-600' : 'text-gray-900'}`}>
        {value}
      </span>
    </div>
  )
}
