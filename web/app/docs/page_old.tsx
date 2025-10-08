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
                <CardTitle>快速开始</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">1. 准备文件</h3>
                <p className="text-gray-600 mb-2">
                  确保您的显微镜图像文件满足以下要求：
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>文件格式：Zeiss CZI 格式（.czi）</li>
                  <li>包含至少 2 个通道：线粒体通道和目标蛋白通道</li>
                  <li>推荐文件大小：小于 100MB</li>
                  <li>图像分辨率：建议 512x512 或更高</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2. 上传和分析</h3>
                <p className="text-gray-600 mb-2">
                  前往<a href="/analyze" className="text-purple-600 hover:underline">分析页面</a>，按照以下步骤操作：
                </p>
                <ol className="list-decimal list-inside text-gray-600 space-y-1 ml-4">
                  <li>点击或拖拽上传您的 CZI 文件</li>
                  <li>配置分析参数（通道索引、阈值方法等）</li>
                  <li>点击"开始分析"按钮</li>
                  <li>等待分析完成（通常需要几秒钟）</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3. 查看结果</h3>
                <p className="text-gray-600">
                  分析完成后，您将看到详细的分析结果，包括荧光强度指标、统计数据和可视化图像（如果启用）。
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 参数说明 */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-purple-600" />
                <CardTitle>参数说明</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    线粒体通道索引 (Mitochondrial Channel)
                  </h3>
                  <p className="text-gray-600 mb-2">
                    指定线粒体染料（如 MitoTracker）所在的通道编号。
                  </p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>默认值：</strong> 0<br />
                      <strong>取值范围：</strong> 0 或更大的整数<br />
                      <strong>常见设置：</strong> 通道 0（红色通道）
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    目标蛋白通道索引 (Target Protein Channel)
                  </h3>
                  <p className="text-gray-600 mb-2">
                    指定目标蛋白（如 GFP、RFP 标记）所在的通道编号。
                  </p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>默认值：</strong> 2<br />
                      <strong>取值范围：</strong> 0 或更大的整数<br />
                      <strong>常见设置：</strong> 通道 2（绿色通道）
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    阈值分割方法 (Threshold Method)
                  </h3>
                  <p className="text-gray-600 mb-2">
                    选择用于分割线粒体区域的阈值计算方法。
                  </p>
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900 mb-1">Otsu（推荐）</p>
                      <p className="text-sm text-gray-700">
                        适用于具有明显双峰分布的图像。这是最常用的方法，适合大多数荧光显微镜图像。
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900 mb-1">Li</p>
                      <p className="text-sm text-gray-700">
                        基于最小交叉熵的方法，适用于背景和前景对比度较好的图像。
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900 mb-1">Yen</p>
                      <p className="text-sm text-gray-700">
                        适用于低对比度的图像，在信噪比较低时表现较好。
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    生成可视化图像 (Generate Visualization)
                  </h3>
                  <p className="text-gray-600 mb-2">
                    是否生成包含原始图像、分割掩膜和分析结果的可视化图像。
                  </p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>默认值：</strong> 关闭<br />
                      <strong>注意：</strong> 开启此选项会增加处理时间，但可以帮助您直观地查看分析过程和结果。
                    </p>
                  </div>
                </div>
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
                <CardTitle>结果指标说明</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Average Intensity in Mitochondria
                  </h4>
                  <p className="text-sm text-gray-600">
                    线粒体区域内目标蛋白的平均荧光强度。这是最重要的指标之一，反映了目标蛋白在线粒体中的定位和富集程度。
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Total Intensity in Mitochondria
                  </h4>
                  <p className="text-sm text-gray-600">
                    线粒体区域内目标蛋白的总荧光强度。该值等于所有线粒体像素的强度总和。
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Mitochondrial Pixels Count
                  </h4>
                  <p className="text-sm text-gray-600">
                    被识别为线粒体区域的像素总数，反映了线粒体的总体积或面积。
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Mitochondrial Average Intensity
                  </h4>
                  <p className="text-sm text-gray-600">
                    线粒体通道内的平均荧光强度，反映了线粒体染色的质量和密度。
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Threshold Value
                  </h4>
                  <p className="text-sm text-gray-600">
                    用于分割线粒体区域的阈值。该值由选定的阈值方法自动计算得出。
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Mask Coverage Percentage
                  </h4>
                  <p className="text-sm text-gray-600">
                    线粒体区域占整个图像的百分比，反映了细胞中线粒体的丰度。
                  </p>
                </div>
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
                <CardTitle>API 接口文档</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  单文件分析接口
                </h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
                    {`POST /analyze
Content-Type: multipart/form-data

参数：
- file: CZI 文件（必需）
- mitochondrial_channel: 线粒体通道索引（可选，默认 0）
- target_protein_channel: 目标蛋白通道索引（可选，默认 2）
- threshold_method: 阈值方法（可选，默认 otsu）
- generate_visualization: 是否生成可视化（可选，默认 false）

返回：
{
  "success": true,
  "message": "分析完成",
  "data": {
    "FileName": "example.czi",
    "Average_Intensity_in_Mitochondria": 123.45,
    "Total_Intensity_in_Mitochondria": 12345.67,
    "Mitochondrial_Pixels_Count": 1000,
    "Mitochondrial_Average_Intensity": 200.5,
    "Threshold_Value": 50.0,
    "Mask_Coverage_Percentage": 15.5,
    "Mitochondrial_Channel_Index": 0,
    "Target_Protein_Channel_Index": 2,
    "Threshold_Method": "otsu",
    "visualization": "base64_encoded_image..."
  }
}`}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  批量分析接口
                </h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
                    {`POST /batch-analyze
Content-Type: multipart/form-data

参数：
- files: 多个 CZI 文件（必需）
- mitochondrial_channel: 线粒体通道索引（可选，默认 0）
- target_protein_channel: 目标蛋白通道索引（可选，默认 2）
- threshold_method: 阈值方法（可选，默认 otsu）
- generate_visualization: 是否生成可视化（可选，默认 false）

返回：
{
  "success": true,
  "message": "批量分析完成",
  "data": {
    "results": [...],
    "failed_files": [],
    "total_files": 5,
    "successful_count": 5,
    "failed_count": 0
  }
}`}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  健康检查接口
                </h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
                    {`GET /health

返回：
{
  "status": "healthy",
  "service": "Mitochondrial Protein Analysis API",
  "version": "1.0.0"
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 常见问题 */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>常见问题</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Q: 支持哪些文件格式？
                  </h4>
                  <p className="text-gray-600">
                    A: 目前仅支持 Zeiss CZI 格式（.czi）。我们计划在未来版本中支持更多格式，如 TIFF、ND2 等。
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Q: 为什么分析失败？
                  </h4>
                  <p className="text-gray-600">
                    A: 常见原因包括：1) 文件格式不正确；2) 文件损坏；3) 指定的通道索引超出范围；4) 文件过大导致超时。请检查您的文件并确保参数设置正确。
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Q: 如何选择合适的阈值方法？
                  </h4>
                  <p className="text-gray-600">
                    A: 对于大多数情况，Otsu 方法是最佳选择。如果您的图像对比度较低，可以尝试 Yen 方法。建议先使用默认的 Otsu 方法，如果结果不理想再尝试其他方法。
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Q: 分析结果的准确性如何？
                  </h4>
                  <p className="text-gray-600">
                    A: 我们使用经过验证的图像处理算法（scikit-image），但结果的准确性仍然依赖于输入图像的质量。建议在使用前用已知样本进行验证，并结合可视化结果进行人工检查。
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Q: 数据安全如何保障？
                  </h4>
                  <p className="text-gray-600">
                    A: 上传的文件仅用于临时分析，分析完成后会立即删除。我们不会存储或分享您的数据。但请注意，这是一个演示服务，不建议上传敏感或机密数据。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
