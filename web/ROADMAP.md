# 项目优化路线图 (Roadmap)

## 📋 概述

本文档规划了线粒体蛋白荧光强度分析平台的下一阶段优化方向，包括功能增强、国际化支持、云存储集成等。

---

## 🎯 Phase 2: 批量文件分析 UI - 状态: ✅ **已完成** (2025-10-08)

### 完成内容

- ✅ 单文件/批量模式切换
- ✅ 多文件上传支持（最多 50 个文件）
- ✅ 批量结果展示组件（BatchResultsDisplay）
- ✅ 统计概览（成功/失败文件数、平均强度、平均覆盖率）
- ✅ 详细结果列表（折叠展开）
- ✅ 结果导出功能（CSV + JSON）
- ✅ 失败文件追踪和错误显示
- ✅ 批量分析进度显示

### 技术实现

- 修改 `FileUpload.tsx` 支持 maxFiles 动态配置
- 创建 `BatchResultsDisplay.tsx` 批量结果组件
- 更新 `analyze/page.tsx` 添加模式切换
- 调用现有的 `api.batchAnalyze()` 方法

---

## 🎯 Phase 1: 国际化支持 (i18n) - 优先级: � 待实施

### 目标

支持多语言切换，英语作为第一外语

### 实施方案

#### 1.1 技术选型

**推荐方案**: next-intl (Next.js 官方推荐)

```bash
npm install next-intl
```

**备选方案**: react-i18next, next-i18next

#### 1.2 文件结构

```
web/
├── messages/              # 翻译文件
│   ├── en.json           # 英文
│   ├── zh.json           # 中文
│   └── ja.json           # 日文（可选）
├── i18n.ts               # i18n 配置
└── middleware.ts         # 语言检测中间件
```

#### 1.3 需要翻译的内容

**前端页面** (约 200+ 条文本):

- `/` - 首页（标题、特性、流程、CTA）
- `/analyze` - 分析页面（表单、提示、结果）
- `/docs` - 文档页面（说明、API 文档、FAQ）
- 组件（按钮、提示、错误信息）

**后端响应**:

- API 错误消息
- 成功提示
- 验证消息

#### 1.4 实施步骤

**Step 1**: 安装和配置

```typescript
// i18n.ts
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default,
}));
```

**Step 2**: 创建翻译文件

```json
// messages/en.json
{
  "home": {
    "title": "Professional Mitochondrial Protein Fluorescence Intensity Analysis Platform",
    "subtitle": "Cloud-based microscopy image analysis service...",
    "cta": {
      "start": "Start Analysis",
      "docs": "View Documentation"
    }
  },
  "analyze": {
    "title": "Mitochondrial Protein Fluorescence Intensity Analysis",
    "upload": "Upload Files",
    "configure": "Configure Parameters",
    "results": "Analysis Results"
  }
}
```

**Step 3**: 更新组件使用 i18n

```typescript
// Before
<h1>线粒体蛋白荧光强度分析</h1>;

// After
import { useTranslations } from "next-intl";

const t = useTranslations("analyze");
<h1>{t("title")}</h1>;
```

**Step 4**: 添加语言切换器

```typescript
// components/LanguageSwitcher.tsx
"use client";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <select value={locale} onChange={(e) => switchLanguage(e.target.value)}>
      <option value="en">English</option>
      <option value="zh">中文</option>
    </select>
  );
}
```

#### 1.5 工作量估算

- 配置 i18n 框架: 2-4 小时
- 提取和翻译中文文本: 6-8 小时
- 英文翻译（专业术语校对）: 4-6 小时
- 更新所有组件: 8-12 小时
- 测试和修复: 4-6 小时
- **总计**: 24-36 小时（3-5 个工作日）

#### 1.6 注意事项

- ⚠️ 科学术语需要专业翻译
- ⚠️ 保持术语一致性（建立术语表）
- ⚠️ 注意英文布局（文本长度可能不同）
- ⚠️ 日期、数字格式本地化

---

## 🎯 Phase 2: 批量文件分析 UI - 状态: ✅ **已完成** (重复，已移至顶部)

### 实施方案

#### 2.1 修改分析页面

**新增批量分析模式切换**:

```typescript
// app/analyze/page.tsx
const [mode, setMode] = useState<'single' | 'batch'>('single')

<div className="flex gap-4 mb-4">
  <button onClick={() => setMode('single')}>单文件分析</button>
  <button onClick={() => setMode('batch')}>批量分析</button>
</div>
```

**批量文件上传**:

```typescript
<FileUpload
  onFilesSelected={setFiles}
  accept=".czi"
  maxFiles={mode === "single" ? 1 : 10} // 批量模式最多 10 个
/>
```

#### 2.2 批量结果展示组件

创建 `BatchResultsDisplay.tsx`:

```typescript
interface BatchResultsDisplayProps {
  results: AnalysisResult[];
  failedFiles: Array<{ filename: string; error: string }>;
}

export default function BatchResultsDisplay({
  results,
  failedFiles,
}: BatchResultsDisplayProps) {
  return (
    <div>
      {/* 汇总统计 */}
      <Card>
        <CardHeader>
          <CardTitle>批量分析汇总</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              label="总文件数"
              value={results.length + failedFiles.length}
            />
            <StatCard label="成功" value={results.length} />
            <StatCard label="失败" value={failedFiles.length} />
          </div>
        </CardContent>
      </Card>

      {/* 结果列表 */}
      <div className="space-y-4 mt-4">
        {results.map((result, index) => (
          <CollapsibleResultCard key={index} result={result} />
        ))}
      </div>

      {/* 失败文件列表 */}
      {failedFiles.length > 0 && (
        <Card className="mt-4 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">失败文件</CardTitle>
          </CardHeader>
          <CardContent>
            {failedFiles.map((file, index) => (
              <div key={index} className="flex justify-between p-2 border-b">
                <span>{file.filename}</span>
                <span className="text-red-600">{file.error}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

#### 2.3 进度显示

添加批量分析进度条:

```typescript
const [progress, setProgress] = useState({ current: 0, total: 0 });

{
  isAnalyzing && mode === "batch" && (
    <div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-purple-600 h-2 rounded-full transition-all"
          style={{ width: `${(progress.current / progress.total) * 100}%` }}
        />
      </div>
      <p className="text-sm text-gray-600 mt-2">
        正在分析: {progress.current} / {progress.total}
      </p>
    </div>
  );
}
```

#### 2.4 数据导出

添加批量结果导出功能:

```typescript
// 导出为 CSV
const exportToCSV = (results: AnalysisResult[]) => {
  const csv = [
    ['FileName', 'Average_Intensity_in_Mitochondria', 'Total_Intensity_in_Mitochondria', ...],
    ...results.map(r => [r.FileName, r.Average_Intensity_in_Mitochondria, ...])
  ].map(row => row.join(',')).join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'batch_analysis_results.csv'
  a.click()
}

// 导出为 Excel
const exportToExcel = (results: AnalysisResult[]) => {
  // 使用 xlsx 库
}
```

#### 2.5 工作量估算

- 批量模式切换: 2 小时
- BatchResultsDisplay 组件: 4-6 小时
- 进度显示: 2-3 小时
- 数据导出功能: 3-4 小时
- 测试: 2-3 小时
- **总计**: 13-18 小时（2-3 个工作日）

---

## 🎯 Phase 3: 结果下载功能 - 优先级: 🟡 中

### 目标

用户可以下载分析的原始数据结果

### 实施方案

#### 3.1 前端下载按钮

在 `ResultsDisplay.tsx` 中添加:

```typescript
const downloadRawResults = () => {
  const data = {
    metadata: {
      filename: result.FileName,
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    },
    parameters: {
      mitochondrial_channel: result.Mitochondrial_Channel_Index,
      target_protein_channel: result.Target_Protein_Channel_Index,
      threshold_method: result.Threshold_Method,
    },
    results: result,
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${result.FileName}_results.json`;
  a.click();
};

<Button onClick={downloadRawResults} variant="outline">
  <Download className="w-4 h-4 mr-2" />
  下载结果 (JSON)
</Button>;
```

#### 3.2 多种格式支持

- **JSON**: 原始结构化数据
- **CSV**: 表格数据（易于 Excel 打开）
- **PDF**: 包含可视化的报告
- **PNG**: 仅可视化图像

#### 3.3 后端支持（可选）

添加结果下载端点:

```python
@app.get("/download/{job_id}")
async def download_result(job_id: str, format: str = "json"):
    # 从存储中获取结果
    result = get_result(job_id)

    if format == "json":
        return JSONResponse(result)
    elif format == "csv":
        return generate_csv(result)
    elif format == "pdf":
        return generate_pdf(result)
```

#### 3.4 工作量估算

- 前端下载功能: 3-4 小时
- 多格式支持: 4-6 小时
- PDF 生成（可选）: 6-8 小时
- 后端端点（可选）: 2-3 小时
- **总计**: 9-13 小时（1-2 个工作日，不含 PDF）

---

## 🎯 Phase 4: 云存储文件源支持 (S3/OSS) - 优先级: 🟡 中

### 目标

支持从云存储（S3、OSS、Google Cloud Storage 等）直接读取 CZI 文件进行分析，而不仅限于本地上传

### 使用场景

- 用户的 CZI 文件已存储在云端（AWS S3、阿里云 OSS 等）
- 大文件（>100MB）不适合直接上传
- 批量分析云端存储的多个文件
- 与云端数据管道集成

### 实施方案

#### 4.1 技术选型

**AWS S3** (推荐):

- 成熟稳定
- SDK 完善
- 全球部署

**阿里云 OSS**:

- 国内速度快
- 适合中国用户

**Google Cloud Storage**:

- 与 GCP 生态集成

**MinIO** (自托管):

- S3 兼容 API
- 可本地部署
- 成本低

#### 4.2 后端集成

安装依赖:

```bash
pip install boto3  # AWS S3
# 或
pip install oss2   # 阿里云 OSS
# 或
pip install google-cloud-storage  # GCS
```

添加云存储下载功能:

```python
import boto3
from botocore.config import Config
import tempfile

# 配置 S3 客户端
s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION', 'us-east-1')
)

async def download_from_s3(bucket: str, key: str) -> bytes:
    """从 S3 下载文件"""
    try:
        response = s3_client.get_object(Bucket=bucket, Key=key)
        return response['Body'].read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to download from S3: {str(e)}")

async def download_from_url(url: str) -> bytes:
    """从预签名 URL 下载文件"""
    import httpx
    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=300.0)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Failed to download file: {response.status_code}")
        return response.content
```

修改分析端点:

```python
from pydantic import BaseModel, HttpUrl
from typing import Optional

class CloudFileSource(BaseModel):
    source_type: str  # 's3', 'oss', 'url'
    bucket: Optional[str] = None  # S3/OSS bucket
    key: Optional[str] = None  # S3/OSS key
    url: Optional[HttpUrl] = None  # 预签名 URL

@app.post("/analyze")
async def analyze(
    file: Optional[UploadFile] = None,
    cloud_source: Optional[str] = None,  # JSON string of CloudFileSource
    mitochondrial_channel: int = 0,
    target_protein_channel: int = 2,
    threshold_method: str = "otsu",
    generate_visualization: bool = False
):
    file_content = None
    filename = None

    # 方式 1: 本地上传
    if file:
        file_content = await file.read()
        filename = file.filename

    # 方式 2: 从云存储下载
    elif cloud_source:
        import json
        source = CloudFileSource(**json.loads(cloud_source))

        if source.source_type == 's3':
            file_content = await download_from_s3(source.bucket, source.key)
            filename = source.key.split('/')[-1]

        elif source.source_type == 'url':
            file_content = await download_from_url(str(source.url))
            filename = source.url.path.split('/')[-1]

        else:
            raise HTTPException(status_code=400, detail="Unsupported source type")

    else:
        raise HTTPException(status_code=400, detail="Either file or cloud_source must be provided")

    # 保存到临时文件并分析
    with tempfile.NamedTemporaryFile(suffix='.czi', delete=False) as tmp_file:
        tmp_file.write(file_content)
        tmp_path = tmp_file.name

    try:
        analyzer = MitochondrialAnalyzer(
            mitochondrial_channel=mitochondrial_channel,
            target_protein_channel=target_protein_channel,
            threshold_method=threshold_method
        )

        result = analyzer.analyze_czi_file(
            tmp_path,
            generate_visualization=generate_visualization
        )
        result['FileName'] = filename

        return {
            "success": True,
            "message": "Analysis completed",
            "data": result
        }
    finally:
        os.unlink(tmp_path)
```

#### 4.3 前端集成

添加文件源选择:

```typescript
// app/analyze/page.tsx
const [fileSource, setFileSource] = useState<'local' | 'cloud'>('local')
const [cloudUrl, setCloudUrl] = useState('')

// 文件源切换
<div className="flex gap-4 mb-4">
  <button
    onClick={() => setFileSource('local')}
    className={fileSource === 'local' ? 'active' : ''}
  >
    本地上传
  </button>
  <button
    onClick={() => setFileSource('cloud')}
    className={fileSource === 'cloud' ? 'active' : ''}
  >
    云存储
  </button>
</div>

// 云存储输入
{fileSource === 'cloud' && (
  <Card>
    <CardHeader>
      <CardTitle>云存储文件地址</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            S3 预签名 URL 或公开 URL
          </label>
          <input
            type="text"
            value={cloudUrl}
            onChange={(e) => setCloudUrl(e.target.value)}
            placeholder="https://your-bucket.s3.amazonaws.com/path/to/file.czi"
            className="w-full px-4 py-2 border rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            支持 AWS S3、阿里云 OSS、Google Cloud Storage 等的预签名 URL
          </p>
        </div>

        {/* 高级选项：直接使用 bucket + key */}
        <details>
          <summary className="cursor-pointer text-sm text-purple-600">
            高级：使用 Bucket + Key
          </summary>
          <div className="mt-2 space-y-2">
            <input
              type="text"
              placeholder="Bucket 名称"
              className="w-full px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="文件 Key (路径)"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </details>
      </div>
    </CardContent>
  </Card>
)}
```

修改 API 调用:

```typescript
// lib/api.ts
export const api = {
  async analyzeFromCloud(
    cloudUrl: string,
    params: Omit<AnalysisParams, "file">
  ): Promise<ApiResponse> {
    const cloudSource = JSON.stringify({
      source_type: "url",
      url: cloudUrl,
    });

    const formData = new FormData();
    formData.append("cloud_source", cloudSource);
    formData.append(
      "mitochondrial_channel",
      params.mitochondrial_channel.toString()
    );
    formData.append(
      "target_protein_channel",
      params.target_protein_channel.toString()
    );
    formData.append("threshold_method", params.threshold_method);
    formData.append(
      "generate_visualization",
      params.generate_visualization.toString()
    );

    const response = await axios.post<ApiResponse>(
      `${API_BASE_URL}/analyze`,
      formData
    );

    return response.data;
  },
};
```

#### 4.4 安全考虑

**重要安全措施**:

- ✅ 仅支持预签名 URL（带时效性）
- ✅ 验证 URL 格式和协议（仅 HTTPS）
- ✅ 设置文件大小限制（避免下载过大文件）
- ✅ 设置下载超时（防止长时间挂起）
- ✅ 如果使用 Access Key，存储在服务器环境变量中，不暴露给前端
- ✅ 限制支持的域名白名单（可选）

**环境变量配置**:

```bash
# .env
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
ALLOWED_STORAGE_DOMAINS=s3.amazonaws.com,oss.aliyuncs.com
MAX_DOWNLOAD_SIZE_MB=500
```

#### 4.5 使用示例

**用户工作流**:

1. 用户在自己的云存储中上传 CZI 文件
2. 生成预签名 URL（有效期如 1 小时）
3. 在分析页面选择"云存储"源
4. 粘贴预签名 URL
5. 配置分析参数
6. 开始分析（后端自动下载并处理）

**AWS S3 生成预签名 URL 示例**:

```python
import boto3

s3_client = boto3.client('s3')
url = s3_client.generate_presigned_url(
    'get_object',
    Params={'Bucket': 'my-bucket', 'Key': 'data/sample.czi'},
    ExpiresIn=3600  # 1 小时
)
```

#### 4.6 工作量估算

- 后端云存储集成: 4-6 小时
- 前端 UI 更新: 3-4 小时
- 安全配置和验证: 2-3 小时
- 测试（S3、OSS）: 3-4 小时
- 文档更新: 2 小时
- **总计**: 14-19 小时（2-3 个工作日）

#### 4.7 扩展功能（可选）

- 支持云存储目录浏览（列出用户的文件）
- 支持 OAuth 认证（用户授权访问其云存储）
- 缓存已下载的文件（避免重复下载）
- 支持断点续传（大文件下载）

---

## 🎯 Phase 5: 其他增强功能

### 5.1 用户系统 - 优先级: 🟢 低

**功能**:

- 用户注册/登录
- 分析历史记录
- 个人配置保存
- 使用量统计

**技术方案**:

- NextAuth.js (前端认证)
- JWT (Token 管理)
- PostgreSQL (用户数据)
- Redis (Session 缓存)

**工作量**: 40-60 小时（1-2 周）

### 5.2 分析历史记录 - 优先级: 🟡 中

**功能**:

- 保存过往分析结果
- 结果对比
- 重新下载

**技术方案**:

- 数据库存储（PostgreSQL）
- 前端历史页面
- 结果对比组件

**工作量**: 20-30 小时（3-5 天）

### 5.3 高级图像处理选项 - 优先级: 🟢 低

**功能**:

- 自定义阈值
- 图像预处理（降噪、增强）
- ROI 选择
- 多通道叠加

**工作量**: 30-40 小时（1 周）

### 5.4 数据可视化增强 - 优先级: 🟡 中

**功能**:

- 交互式图表（Chart.js/D3.js）
- 数据趋势分析
- 统计对比
- 导出图表

**工作量**: 20-30 小时（3-5 天）

### 5.5 通知系统 - 优先级: 🟢 低

**功能**:

- 分析完成通知
- Email 通知
- WebSocket 实时推送

**工作量**: 15-20 小时（2-3 天）

---

## 📊 优先级总结

### 立即开始（本周）

1. 🔴 **i18n 国际化**（英语支持）- 3-5 天
   - 影响: 全球用户可用
   - ROI: 高

### 短期计划（本月）

2. 🔴 **批量文件分析 UI** - 2-3 天

   - 影响: 提升效率
   - ROI: 高

3. 🟡 **结果下载功能** - 1-2 天
   - 影响: 用户留存
   - ROI: 中

### 中期计划（1-2 个月）

4. 🟡 **云存储集成 (S3)** - 2-3 天

   - 影响: 数据持久化
   - ROI: 中

5. 🟡 **分析历史记录** - 3-5 天
   - 需要: 数据库
   - ROI: 中

### 长期计划（3-6 个月）

6. 🟢 **用户系统** - 1-2 周
7. 🟢 **高级图像处理** - 1 周
8. 🟢 **通知系统** - 2-3 天

---

## 🛠️ 技术准备清单

### Phase 1 (i18n) 需要安装

```bash
npm install next-intl
```

### Phase 2 (批量分析) 需要安装

```bash
npm install xlsx  # Excel 导出
```

### Phase 3 (结果下载) 需要安装

```bash
npm install jspdf jspdf-autotable  # PDF 生成（可选）
```

### Phase 4 (云存储) 需要安装

```bash
pip install boto3  # 后端
# 或
pip install oss2   # 阿里云
```

### Phase 5 (用户系统) 需要安装

```bash
npm install next-auth
npm install @prisma/client prisma
pip install sqlalchemy psycopg2-binary
```

---

## 📈 预期成果

### 完成 Phase 1-3 后

- ✅ 支持英语和中文
- ✅ 支持批量文件分析
- ✅ 用户可下载结果
- ✅ 用户体验大幅提升
- ✅ 国际用户可用

### 完成 Phase 4 后

- ✅ 结果持久化
- ✅ 可分享下载链接
- ✅ 降低服务器压力

### 完成 Phase 5 后

- ✅ 完整的用户系统
- ✅ 数据管理能力
- ✅ 具备商业化基础

---

## 💰 资源需求

### 人力

- 全职开发: 2-3 周可完成 Phase 1-3
- 兼职开发: 1-2 个月可完成 Phase 1-3

### 基础设施（Phase 4 后）

- 云存储: ~$50/月
- 数据库: ~$20/月（Phase 5）
- 服务器: ~$50-100/月
- **总计**: ~$120-170/月

---

## 🎓 学习资源

### i18n

- [next-intl 文档](https://next-intl-docs.vercel.app/)
- [Next.js 国际化指南](https://nextjs.org/docs/app/building-your-application/routing/internationalization)

### AWS S3

- [boto3 文档](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html)
- [AWS S3 最佳实践](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html)

### 数据导出

- [xlsx 库](https://www.npmjs.com/package/xlsx)
- [jsPDF](https://github.com/parallax/jsPDF)

---

**建议执行顺序**: Phase 1 → Phase 2 → Phase 3 → Phase 4

**预计总时间**: 2-3 周（全职）或 1.5-2 个月（兼职）

**预期效果**: 产品功能完善，用户体验提升，具备国际化和商业化基础。
