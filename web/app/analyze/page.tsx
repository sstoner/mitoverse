'use client'

import { useState, useEffect } from 'react'
import FileUpload from '@/components/FileUpload'
import AnalysisForm, { AnalysisParameters } from '@/components/AnalysisForm'
import ResultsDisplay from '@/components/ResultsDisplay'
import BatchResultsDisplay from '@/components/BatchResultsDisplay'
import Button from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { api, AnalysisResult } from '@/lib/api'
import { Loader2, AlertCircle, FileText, Files, Upload, Cloud } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

type AnalysisMode = 'single' | 'batch'
type FileSource = 'local' | 'cloud'

export default function AnalyzePage() {
  const { t } = useI18n();

  // 动态更新 SEO 标签
  useEffect(() => {
    document.title = 'Analyze CZI Files - Mitochondrial Analysis | 分析 CZI 文件';

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Upload and analyze CZI microscopy images. Configure mitochondrial and target protein channels, choose threshold methods, get detailed analysis results with visualization.');
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'Analyze CZI Files - Mitochondrial Analysis');
    }

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('href', typeof window !== 'undefined' ? window.location.href : '');
    }
  }, []);
  const [mode, setMode] = useState<AnalysisMode>('single')
  const [fileSource, setFileSource] = useState<FileSource>('local')
  const [files, setFiles] = useState<File[]>([])
  const [cloudUrl, setCloudUrl] = useState('')
  const [cloudFilename, setCloudFilename] = useState('')
  const [parameters, setParameters] = useState<AnalysisParameters>({
    mitochondrial_channel: 0,
    target_protein_channel: 2,
    threshold_method: 'otsu',
    generate_visualization: true
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [batchResults, setBatchResults] = useState<AnalysisResult[]>([])
  const [failedFiles, setFailedFiles] = useState<Array<{ filename: string; error: string }>>([])
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)

  const handleAnalyze = async () => {
    // 验证输入
    if (fileSource === 'local' && files.length === 0) {
      setError(t('analyze.errors.noFile'))
      return
    }

    if (fileSource === 'cloud' && !cloudUrl) {
      setError(t('analyze.errors.noCloudUrl'))
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setResults(null)
    setBatchResults([])
    setFailedFiles([])
    setProgress(null)

    try {
      if (fileSource === 'cloud') {
        // 云存储文件分析（仅支持单文件）
        const response = await api.analyzeFromUrl(
          cloudUrl,
          cloudFilename || 'cloud_file.czi',
          parameters
        )

        if (response.success && response.data) {
          setResults(response.data)
        } else {
          setError(response.error || t('analyze.errors.cloudAnalysisFailed'))
        }
      } else if (mode === 'single') {
        // 本地单文件分析
        const response = await api.analyze({
          file: files[0],
          ...parameters
        })

        if (response.success && response.data) {
          setResults(response.data)
        } else {
          setError(response.error || t('analyze.errors.analysisFailed'))
        }
      } else {
        // 本地批量分析
        setProgress({ current: 0, total: files.length })

        const response = await api.batchAnalyze(files, parameters)

        if (response.success && response.data) {
          setBatchResults(response.data.results)
          setFailedFiles(response.data.failed_files)

          if (response.data.failed_count > 0) {
            setError(t('analyze.errors.batchPartialFailed', { count: response.data.failed_count }))
          }
        } else {
          setError(response.error || t('analyze.errors.batchAnalysisFailed'))
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('analyze.errors.analysisFailed'))
      console.error('Analysis error:', err)
    } finally {
      setIsAnalyzing(false)
      setProgress(null)
    }
  }

  const handleReset = () => {
    setFiles([])
    setCloudUrl('')
    setCloudFilename('')
    setResults(null)
    setBatchResults([])
    setFailedFiles([])
    setError(null)
    setProgress(null)
    setParameters({
      mitochondrial_channel: 0,
      target_protein_channel: 2,
      threshold_method: 'otsu',
      generate_visualization: true
    })
  }

  const handleModeChange = (newMode: AnalysisMode) => {
    setMode(newMode)
    // 如果切换到批量模式，自动切换到本地文件源
    if (newMode === 'batch') {
      setFileSource('local')
    }
    handleReset()
  }

  const handleFileSourceChange = (newSource: FileSource) => {
    setFileSource(newSource)
    // 云存储仅支持单文件模式
    if (newSource === 'cloud') {
      setMode('single')
    }
    handleReset()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {t('analyze.title')}
              </h1>
              <p className="text-lg text-gray-600">
                {t('analyze.subtitle')}
              </p>
            </div>

            {/* 模式切换 */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => handleModeChange('single')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${mode === 'single'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <FileText className="w-4 h-4" />
                {t('analyze.mode.single')}
              </button>
              <button
                onClick={() => handleModeChange('batch')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${mode === 'batch'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <Files className="w-4 h-4" />
                {t('analyze.mode.batch')}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：文件上传和参数配置 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 文件上传 */}
            <Card>
              <CardHeader>
                <CardTitle>{t('analyze.upload.stepTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                {/* 文件来源切换 */}
                <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => handleFileSourceChange('local')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md font-medium transition-all ${fileSource === 'local'
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                      }`}
                    disabled={mode === 'batch'}
                  >
                    <Upload className="w-4 h-4" />
                    {t('analyze.upload.source.local')}
                  </button>
                  <button
                    onClick={() => handleFileSourceChange('cloud')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md font-medium transition-all ${fileSource === 'cloud'
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                      }`}
                    disabled={mode === 'batch'}
                  >
                    <Cloud className="w-4 h-4" />
                    {t('analyze.upload.source.cloud')}
                  </button>
                </div>

                {/* 本地文件上传 */}
                {fileSource === 'local' && (
                  <>
                    <FileUpload
                      onFilesSelected={setFiles}
                      accept=".czi"
                      maxFiles={mode === 'single' ? 1 : 50}
                    />
                    {mode === 'batch' && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          {t('analyze.upload.batchHint')}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* 云存储 URL 输入 */}
                {fileSource === 'cloud' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('analyze.upload.cloudUrl')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="url"
                        value={cloudUrl}
                        onChange={(e) => setCloudUrl(e.target.value)}
                        placeholder={t('analyze.upload.cloudUrlPlaceholder')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {t('analyze.upload.cloudUrlHint')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('analyze.upload.cloudFilename')}
                      </label>
                      <input
                        type="text"
                        value={cloudFilename}
                        onChange={(e) => setCloudFilename(e.target.value)}
                        placeholder={t('analyze.upload.cloudFilenamePlaceholder')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {t('analyze.upload.cloudFilenameHint')}
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        {t('analyze.upload.cloudWarning')}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 参数配置 */}
            <Card>
              <CardHeader>
                <CardTitle>{t('analyze.parameters.stepTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <AnalysisForm
                  onParamsChange={setParameters}
                  initialParams={parameters}
                />
              </CardContent>
            </Card>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || (fileSource === 'local' && files.length === 0) || (fileSource === 'cloud' && !cloudUrl)}
                className="flex-1"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('analyze.status.analyzing')}
                  </>
                ) : (
                  t('analyze.actions.startAnalysis')
                )}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                disabled={isAnalyzing}
                size="lg"
              >
                {t('analyze.actions.reset')}
              </Button>
            </div>

            {/* 参数说明 */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <h4 className="font-semibold text-blue-900 mb-2 text-sm">
                  {t('analyze.parameters.helpTitle')}
                </h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>{t('analyze.parameters.help1')}</li>
                  <li>{t('analyze.parameters.help2')}</li>
                  <li>{t('analyze.parameters.help3')}</li>
                  <li>{t('analyze.parameters.help4')}</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：分析结果 */}
          <div className="lg:col-span-2">
            <Card className="min-h-[600px]">
              <CardHeader>
                <CardTitle>{t('analyze.results.stepTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                {/* 错误提示 */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-900 mb-1">{t('analyze.status.failed')}</h4>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                {/* 加载状态 */}
                {isAnalyzing && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-16 h-16 text-purple-600 animate-spin mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {mode === 'batch' ? t('analyze.status.batchAnalyzing') : t('analyze.status.analyzing')}
                    </h3>
                    <p className="text-gray-600">
                      {mode === 'batch' ? t('analyze.status.batchWait') : t('analyze.status.wait')}
                    </p>
                    {progress && mode === 'batch' && (
                      <div className="mt-4 w-64">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(progress.current / progress.total) * 100}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-600 mt-2 text-center">
                          {t('analyze.status.progress', { current: progress.current, total: progress.total })}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 结果显示 */}
                {mode === 'single' && results && !isAnalyzing && (
                  <ResultsDisplay result={results} />
                )}

                {/* 批量结果显示 */}
                {mode === 'batch' && batchResults.length > 0 && !isAnalyzing && (
                  <BatchResultsDisplay
                    results={batchResults}
                    failedFiles={failedFiles}
                  />
                )}

                {/* 初始状态 */}
                {!results && !isAnalyzing && !error && batchResults.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      {mode === 'single' ? (
                        <svg
                          className="w-12 h-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      ) : (
                        <Files className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {mode === 'single' ? t('analyze.status.ready') : t('analyze.status.batchMode')}
                    </h3>
                    <p className="text-gray-600 max-w-md">
                      {mode === 'single'
                        ? t('analyze.status.readyDesc')
                        : t('analyze.status.batchModeDesc')
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 底部提示 */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1">{t('analyze.hints.title')}</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>{t('analyze.hints.hint1')}</li>
                <li>{t('analyze.hints.hint2')}</li>
                <li>{t('analyze.hints.hint3')}</li>
                <li>{t('analyze.hints.hint4')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
