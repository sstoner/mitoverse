'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n'

interface AnalysisFormProps {
  onParamsChange: (params: AnalysisParameters) => void
  initialParams?: AnalysisParameters
}

export interface AnalysisParameters {
  mitochondrial_channel: number
  target_protein_channel: number
  threshold_method: 'otsu' | 'li' | 'yen'
  generate_visualization: boolean
}

export default function AnalysisForm({ onParamsChange, initialParams }: AnalysisFormProps) {
  const { t } = useI18n();
  const [params, setParams] = useState<AnalysisParameters>(
    initialParams || {
      mitochondrial_channel: 0,
      target_protein_channel: 2,
      threshold_method: 'otsu',
      generate_visualization: false,
    }
  )

  const updateParam = <K extends keyof AnalysisParameters>(key: K, value: AnalysisParameters[K]) => {
    const newParams = { ...params, [key]: value }
    setParams(newParams)
    onParamsChange(newParams)
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('analyze.parameters.mitochondrialChannel')}
        </label>
        <input
          type="number"
          min="0"
          value={params.mitochondrial_channel}
          onChange={(e) => updateParam('mitochondrial_channel', parseInt(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="0"
        />
        <p className="mt-1 text-xs text-gray-500">
          {t('analyze.parameters.mitochondrialChannelHint')}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('analyze.parameters.targetProteinChannel')}
        </label>
        <input
          type="number"
          min="0"
          value={params.target_protein_channel}
          onChange={(e) => updateParam('target_protein_channel', parseInt(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="2"
        />
        <p className="mt-1 text-xs text-gray-500">
          {t('analyze.parameters.targetProteinChannelHint')}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('analyze.parameters.thresholdMethod')}
        </label>
        <select
          value={params.threshold_method}
          onChange={(e) => updateParam('threshold_method', e.target.value as 'otsu' | 'li' | 'yen')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
        >
          <option value="otsu">{t('analyze.parameters.thresholdOptions.otsu')}</option>
          <option value="li">{t('analyze.parameters.thresholdOptions.li')}</option>
          <option value="yen">{t('analyze.parameters.thresholdOptions.yen')}</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          {t('analyze.parameters.thresholdMethodHint')}
        </p>
      </div>

      <div>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={params.generate_visualization}
            onChange={(e) => updateParam('generate_visualization', e.target.checked)}
            className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
          />
          <span className="text-sm font-medium text-gray-700">
            {t('analyze.parameters.generateVisualization')}
          </span>
        </label>
        <p className="mt-1 ml-8 text-xs text-gray-500">
          {t('analyze.parameters.generateVisualizationHint')}
        </p>
      </div>
    </div>
  )
}
