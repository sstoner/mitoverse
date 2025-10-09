# 批量分析性能优化方案

## 问题分析

### 当前瓶颈

1. **串行处理** ⏱️
   - 后端代码使用 `for file in files` 逐个处理
   - 3个文件每个10秒 = 30秒总时间
   
2. **请求超时** ⚠️
   - Vercel Hobby 计划: 10秒超时
   - Vercel Pro 计划: 60秒超时
   - 浏览器默认: 300秒超时
   
3. **网络传输** 🌐
   - 大文件上传慢（CZI 文件通常几MB到几十MB）
   - 公网带宽限制

4. **内存限制** 💾
   - 同时处理多个大文件可能超出内存

## 解决方案

### 方案 1: 后端并发处理（推荐 - 最快实现）⭐

使用 Python 的异步并发处理多个文件。

#### 优点
- ✅ 快速实现（修改后端代码）
- ✅ 显著提升速度（3-5倍）
- ✅ 不需要前端改动
- ✅ 成本低

#### 缺点
- ⚠️ 受服务器 CPU/内存限制
- ⚠️ 仍有超时风险（大量文件）

#### 实现代码

```python
import asyncio
from concurrent.futures import ProcessPoolExecutor
import multiprocessing

# 在 api.py 中添加并发处理
@app.post("/batch-analyze", response_model=AnalysisResponse)
async def batch_analyze_czi(
    files: list[UploadFile] = File(...),
    mitochondrial_channel: int = Form(0),
    target_protein_channel: int = Form(2),
    threshold_method: str = Form("otsu"),
    generate_visualization: bool = Form(False)
):
    """批量分析 - 并发优化版本"""
    
    # 保存所有文件到临时位置
    temp_files = []
    for file in files:
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.czi')
        shutil.copyfileobj(file.file, temp_file)
        temp_file.close()
        temp_files.append({
            'path': temp_file.name,
            'filename': file.filename
        })
        await file.close()
    
    # 并发分析
    analyzer = MitochondrialAnalyzer(threshold_method=threshold_method)
    
    # 使用进程池并发处理（绕过 GIL）
    max_workers = min(multiprocessing.cpu_count(), len(temp_files))
    
    with ProcessPoolExecutor(max_workers=max_workers) as executor:
        loop = asyncio.get_event_loop()
        tasks = [
            loop.run_in_executor(
                executor,
                analyze_single_file,
                temp_file['path'],
                temp_file['filename'],
                mitochondrial_channel,
                target_protein_channel,
                threshold_method,
                generate_visualization
            )
            for temp_file in temp_files
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # 清理临时文件
    for temp_file in temp_files:
        try:
            os.unlink(temp_file['path'])
        except:
            pass
    
    # 处理结果
    results_list = []
    failed_files = []
    
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            failed_files.append({
                'filename': temp_files[i]['filename'],
                'error': str(result)
            })
        elif result is not None:
            results_list.append(result)
        else:
            failed_files.append({
                'filename': temp_files[i]['filename'],
                'error': 'Analysis returned None'
            })
    
    return AnalysisResponse(
        success=len(results_list) > 0,
        message=f"成功分析 {len(results_list)} 个文件",
        data={
            "results": results_list,
            "failed_files": failed_files,
            "total_files": len(files),
            "successful_count": len(results_list),
            "failed_count": len(failed_files)
        }
    )

def analyze_single_file(
    file_path, filename, 
    mitochondrial_channel, 
    target_protein_channel, 
    threshold_method, 
    generate_visualization
):
    """单个文件分析（用于进程池）"""
    try:
        analyzer = MitochondrialAnalyzer(threshold_method=threshold_method)
        result = analyzer.analyze_czi_file(
            file_path=file_path,
            mitochondrial_channel_index=mitochondrial_channel,
            target_protein_channel_index=target_protein_channel,
            generate_visualization=generate_visualization
        )
        return result
    except Exception as e:
        raise e
```

#### 性能提升
- 3个文件串行: 30秒 → 并发: **10-12秒** ⚡
- 10个文件串行: 100秒 → 并发: **25-30秒** ⚡

---

### 方案 2: 异步任务队列（推荐 - 最佳体验）🌟

使用 Celery + Redis 实现后台任务处理，前端轮询结果。

#### 优点
- ✅ 无超时限制
- ✅ 可处理大量文件
- ✅ 用户体验好（实时进度）
- ✅ 可重试失败任务

#### 缺点
- ⚠️ 需要额外服务（Redis）
- ⚠️ 实现复杂度较高
- ⚠️ 需要修改前后端

#### 架构图
```
用户上传文件 → FastAPI 创建任务 → 返回任务ID
              ↓
           Celery Worker 处理
              ↓
           Redis 存储结果
              ↓
前端轮询任务状态 ← FastAPI 查询结果
```

#### 实现步骤

**1. 安装依赖**
```bash
pip install celery redis
```

**2. 创建 celery_app.py**
```python
from celery import Celery
import os

redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

celery_app = Celery(
    'mitoverse',
    broker=redis_url,
    backend=redis_url
)

celery_app.conf.update(
    task_serializer='json',
    result_serializer='json',
    accept_content=['json'],
    timezone='UTC',
    enable_utc=True,
)

@celery_app.task(bind=True)
def analyze_batch_task(self, file_paths, params):
    """批量分析任务"""
    from analyzer import MitochondrialAnalyzer
    
    results = []
    failed = []
    total = len(file_paths)
    
    analyzer = MitochondrialAnalyzer(
        threshold_method=params['threshold_method']
    )
    
    for i, file_info in enumerate(file_paths):
        # 更新进度
        self.update_state(
            state='PROGRESS',
            meta={'current': i, 'total': total}
        )
        
        try:
            result = analyzer.analyze_czi_file(
                file_path=file_info['path'],
                mitochondrial_channel_index=params['mitochondrial_channel'],
                target_protein_channel_index=params['target_protein_channel'],
                generate_visualization=params['generate_visualization']
            )
            results.append(result)
        except Exception as e:
            failed.append({
                'filename': file_info['filename'],
                'error': str(e)
            })
    
    return {
        'results': results,
        'failed': failed,
        'total': total
    }
```

**3. 修改 api.py**
```python
from celery_app import analyze_batch_task, celery_app
from celery.result import AsyncResult

@app.post("/batch-analyze-async")
async def batch_analyze_async(
    files: list[UploadFile] = File(...),
    mitochondrial_channel: int = Form(0),
    target_protein_channel: int = Form(2),
    threshold_method: str = Form("otsu"),
    generate_visualization: bool = Form(False)
):
    """创建批量分析任务"""
    
    # 保存文件
    file_paths = []
    for file in files:
        temp_file = tempfile.NamedTemporaryFile(
            delete=False, 
            suffix='.czi',
            dir='/tmp/mitoverse'  # 持久化目录
        )
        shutil.copyfileobj(file.file, temp_file)
        temp_file.close()
        file_paths.append({
            'path': temp_file.name,
            'filename': file.filename
        })
        await file.close()
    
    # 创建任务
    task = analyze_batch_task.delay(
        file_paths,
        {
            'mitochondrial_channel': mitochondrial_channel,
            'target_protein_channel': target_protein_channel,
            'threshold_method': threshold_method,
            'generate_visualization': generate_visualization
        }
    )
    
    return {
        'success': True,
        'message': '任务已创建',
        'task_id': task.id
    }

@app.get("/task-status/{task_id}")
async def get_task_status(task_id: str):
    """查询任务状态"""
    task = AsyncResult(task_id, app=celery_app)
    
    if task.state == 'PENDING':
        response = {
            'state': task.state,
            'status': '等待处理...'
        }
    elif task.state == 'PROGRESS':
        response = {
            'state': task.state,
            'current': task.info.get('current', 0),
            'total': task.info.get('total', 1),
            'status': f"处理中 {task.info.get('current', 0)}/{task.info.get('total', 1)}"
        }
    elif task.state == 'SUCCESS':
        response = {
            'state': task.state,
            'result': task.info,
            'status': '完成'
        }
    else:  # FAILURE
        response = {
            'state': task.state,
            'status': str(task.info),
        }
    
    return response
```

**4. 前端轮询（web/lib/api.ts）**
```typescript
export const api = {
  // ... 其他方法

  async batchAnalyzeAsync(
    files: File[],
    params: Omit<AnalysisParams, "file">
  ): Promise<{ task_id: string }> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("mitochondrial_channel", params.mitochondrial_channel.toString());
    formData.append("target_protein_channel", params.target_protein_channel.toString());
    formData.append("threshold_method", params.threshold_method);
    formData.append("generate_visualization", params.generate_visualization.toString());

    const response = await axios.post(`${API_BASE_URL}/batch-analyze-async`, formData);
    return response.data;
  },

  async getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
    const response = await axios.get(`${API_BASE_URL}/task-status/${taskId}`);
    return response.data;
  },

  // 轮询直到完成
  async waitForTask(
    taskId: string, 
    onProgress?: (current: number, total: number) => void
  ): Promise<any> {
    while (true) {
      const status = await this.getTaskStatus(taskId);
      
      if (status.state === 'PROGRESS' && onProgress) {
        onProgress(status.current || 0, status.total || 1);
      }
      
      if (status.state === 'SUCCESS') {
        return status.result;
      }
      
      if (status.state === 'FAILURE') {
        throw new Error(status.status);
      }
      
      // 等待2秒后再次查询
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};
```

**5. Docker Compose 配置**
```yaml
services:
  api:
    # ... 现有配置
    depends_on:
      - redis
    environment:
      - REDIS_URL=redis://redis:6379/0

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  celery_worker:
    build: .
    command: celery -A celery_app worker --loglevel=info --concurrency=4
    depends_on:
      - redis
    environment:
      - REDIS_URL=redis://redis:6379/0
    volumes:
      - ./uploads:/tmp/mitoverse
    restart: unless-stopped

volumes:
  redis_data:
```

---

### 方案 3: 前端分批上传（简单但体验一般）

前端将多个文件分批，每批调用一次 API。

#### 优点
- ✅ 实现简单
- ✅ 绕过超时限制
- ✅ 不需要后端改动

#### 缺点
- ⚠️ 总时间不变
- ⚠️ 用户需要等待多次
- ⚠️ 体验较差

#### 实现代码

```typescript
// web/lib/api.ts
async batchAnalyzeChunked(
  files: File[],
  params: Omit<AnalysisParams, "file">,
  chunkSize: number = 2  // 每批2个文件
): Promise<BatchApiResponse> {
  const chunks: File[][] = [];
  
  // 分批
  for (let i = 0; i < files.length; i += chunkSize) {
    chunks.push(files.slice(i, i + chunkSize));
  }
  
  // 逐批处理
  const allResults: AnalysisResult[] = [];
  const allFailed: Array<{ filename: string; error: string }> = [];
  
  for (const chunk of chunks) {
    const response = await this.batchAnalyze(chunk, params);
    
    if (response.data) {
      allResults.push(...response.data.results);
      allFailed.push(...response.data.failed_files);
    }
  }
  
  return {
    success: allResults.length > 0,
    message: `完成 ${allResults.length}/${files.length} 个文件`,
    data: {
      results: allResults,
      failed_files: allFailed,
      total_files: files.length,
      successful_count: allResults.length,
      failed_count: allFailed.length
    }
  };
}
```

---

### 方案 4: 增加超时时间（临时方案）

增加各层的超时配置。

#### Axios 超时
```typescript
// web/lib/api.ts
const response = await axios.post<BatchApiResponse>(
  `${API_BASE_URL}/batch-analyze`,
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 300000  // 5分钟
  }
);
```

#### Uvicorn 超时
```python
# api.py
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        timeout_keep_alive=300  # 5分钟
    )
```

#### Nginx 超时（如果使用）
```nginx
# nginx.conf
proxy_connect_timeout 300s;
proxy_send_timeout 300s;
proxy_read_timeout 300s;
```

---

## 推荐实施步骤

### 短期（1-2小时）
✅ **方案 1: 后端并发处理**
- 最快见效
- 代码改动小
- 性能提升显著

### 中期（1-2天）
✅ **方案 2: 异步任务队列**
- 最佳用户体验
- 可处理大批量文件
- 生产级解决方案

### 立即可用
✅ **方案 4: 增加超时**
- 临时缓解
- 无需代码改动
- 治标不治本

---

## 性能对比

| 方案 | 3个文件 | 10个文件 | 用户体验 | 实现难度 |
|-----|--------|---------|---------|---------|
| 当前串行 | 30s | 100s | ⭐⭐ | - |
| 方案1并发 | 12s | 30s | ⭐⭐⭐ | ⭐ |
| 方案2队列 | 12s | 30s | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 方案3分批 | 30s | 100s | ⭐⭐ | ⭐ |
| 方案4超时 | 30s | 100s | ⭐⭐ | ⭐ |

---

## 下一步行动

我建议按以下顺序实施:

1. **立即**: 增加超时时间（方案4） - 5分钟
2. **今天**: 实现后端并发（方案1） - 1-2小时
3. **本周**: 部署异步队列（方案2） - 1-2天

想要我帮你实现哪个方案？
