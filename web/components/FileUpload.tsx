'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X } from 'lucide-react'
import { cn, formatFileSize } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
  maxFiles?: number
  accept?: string
}

export default function FileUpload({ onFilesSelected, maxFiles = 1, accept = '.czi' }: FileUploadProps) {
  const { t } = useI18n();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = maxFiles === 1 ? acceptedFiles.slice(0, 1) : acceptedFiles
      setSelectedFiles(newFiles)
      onFilesSelected(newFiles)
    },
    [maxFiles, onFilesSelected]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/octet-stream': [accept] },
    maxFiles,
  })

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    onFilesSelected(newFiles)
  }

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
          'hover:border-purple-500 hover:bg-purple-50/50',
          isDragActive && 'border-purple-500 bg-purple-50',
          !isDragActive && 'border-gray-300 bg-gray-50'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-purple-100 rounded-full">
            <Upload className="w-8 h-8 text-purple-600" />
          </div>
          {isDragActive ? (
            <p className="text-lg font-medium text-purple-600">{t('analyze.upload.dragActive')}</p>
          ) : (
            <>
              <p className="text-lg font-medium text-gray-700">
                {t('analyze.upload.dragDrop')}
              </p>
              <p className="text-sm text-gray-500">
                {t('analyze.upload.maxFiles')} {maxFiles === 1 ? t('analyze.upload.single') : t('analyze.upload.batch', { count: maxFiles })}
              </p>
            </>
          )}
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">{t('analyze.upload.selectedFiles')}</h4>
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <File className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
