"""
线粒体蛋白荧光强度分析 SaaS 服务 API
"""
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict
import tempfile
import os
import shutil
import httpx
from urllib.parse import urlparse
import asyncio
from concurrent.futures import ProcessPoolExecutor
import multiprocessing
from analyzer import MitochondrialAnalyzer


app = FastAPI(
    title="Mitochondrial Protein Fluorescence Intensity Analysis API",
    description="用于分析线粒体蛋白荧光强度的 SaaS 服务",
    version="1.0.0"
)

# 添加 CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalysisResponse(BaseModel):
    """分析结果响应模型"""
    success: bool
    message: str
    data: Optional[Dict] = None
    error: Optional[str] = None


async def download_file_from_url(url: str, target_path: str) -> bool:
    """
    从URL下载文件到本地
    
    Args:
        url: 文件的URL（可以是预签名URL）
        target_path: 本地保存路径
    
    Returns:
        bool: 下载是否成功
    """
    try:
        async with httpx.AsyncClient(timeout=300.0) as client:
            async with client.stream('GET', url) as response:
                response.raise_for_status()
                with open(target_path, 'wb') as f:
                    async for chunk in response.aiter_bytes(chunk_size=8192):
                        f.write(chunk)
        return True
    except Exception as e:
        print(f"Error downloading file from {url}: {e}")
        return False


@app.get("/")
async def root():
    """API 根端点"""
    return {
        "service": "Mitochondrial Protein Fluorescence Intensity Analysis",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {"status": "healthy"}


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_czi(
    file: UploadFile = File(..., description="CZI 格式的显微镜图像文件"),
    mitochondrial_channel: int = Form(0, description="线粒体通道索引（默认为0）"),
    target_protein_channel: int = Form(2, description="目标蛋白通道索引（默认为2）"),
    threshold_method: str = Form("otsu", description="阈值分割方法：otsu, li, yen（默认为otsu）"),
    generate_visualization: bool = Form(False, description="是否生成可视化图像（默认为False）")
):
    """
    分析CZI文件中的线粒体蛋白荧光强度
    
    - **file**: 上传的CZI文件
    - **mitochondrial_channel**: 线粒体通道索引（可选，默认0）
    - **target_protein_channel**: 目标蛋白通道索引（可选，默认2）
    - **threshold_method**: 阈值分割方法（可选，默认otsu）
    - **generate_visualization**: 是否生成可视化图像（可选，默认False）
    """
    
    # 验证文件格式
    if not file.filename.endswith('.czi'):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Only .czi files are supported."
        )
    
    # 验证阈值方法
    valid_methods = ['otsu', 'li', 'yen']
    if threshold_method not in valid_methods:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid threshold method. Must be one of: {', '.join(valid_methods)}"
        )
    
    # 创建临时文件保存上传的CZI文件
    temp_file = None
    temp_file_path = ""
    try:
        # 创建临时文件
        with tempfile.NamedTemporaryFile(delete=False, suffix='.czi') as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_file_path = temp_file.name
        
        # 创建分析器并执行分析
        analyzer = MitochondrialAnalyzer(threshold_method=threshold_method)
        results = analyzer.analyze_czi_file(
            file_path=temp_file_path,
            mitochondrial_channel_index=mitochondrial_channel,
            target_protein_channel_index=target_protein_channel,
            generate_visualization=generate_visualization
        )
        
        if results is None:
            return AnalysisResponse(
                success=False,
                message="分析失败",
                error="无法处理该文件，请检查文件格式和通道索引"
            )
        
        return AnalysisResponse(
            success=True,
            message="分析成功",
            data=results
        )
        
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print(f"Error during analysis: {error_detail}")
        
        return AnalysisResponse(
            success=False,
            message="分析过程中出现错误",
            error=str(e)
        )
        
    finally:
        # 清理临时文件
        if temp_file and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except Exception as e:
                print(f"Error deleting temporary file: {e}")
        
        # 关闭上传的文件
        await file.close()


@app.post("/analyze-from-url", response_model=AnalysisResponse)
async def analyze_from_cloud_url(
    file_url: str = Form(..., description="CZI文件的云存储URL（可以是预签名URL）"),
    filename: Optional[str] = Form(None, description="文件名（可选）"),
    mitochondrial_channel: int = Form(0, description="线粒体通道索引（默认为0）"),
    target_protein_channel: int = Form(2, description="目标蛋白通道索引（默认为2）"),
    threshold_method: str = Form("otsu", description="阈值分割方法：otsu, li, yen（默认为otsu）"),
    generate_visualization: bool = Form(False, description="是否生成可视化图像（默认为False）")
):
    """
    从云存储URL下载CZI文件并分析
    
    - **file_url**: 云存储中CZI文件的URL（支持S3预签名URL、OSS预签名URL等）
    - **filename**: 文件名（可选，用于结果标识）
    - **mitochondrial_channel**: 线粒体通道索引（可选，默认0）
    - **target_protein_channel**: 目标蛋白通道索引（可选，默认2）
    - **threshold_method**: 阈值分割方法（可选，默认otsu）
    - **generate_visualization**: 是否生成可视化图像（可选，默认False）
    """
    
    # 验证URL
    try:
        parsed_url = urlparse(file_url)
        if not parsed_url.scheme in ['http', 'https']:
            raise HTTPException(
                status_code=400,
                detail="Invalid URL. Only HTTP and HTTPS URLs are supported."
            )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid URL format: {str(e)}"
        )
    
    # 验证阈值方法
    valid_methods = ['otsu', 'li', 'yen']
    if threshold_method not in valid_methods:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid threshold method. Must be one of: {', '.join(valid_methods)}"
        )
    
    # 如果没有提供文件名，从URL中提取
    if not filename:
        filename = os.path.basename(parsed_url.path) or "cloud_file.czi"
    
    # 确保文件名以.czi结尾
    if not filename.endswith('.czi'):
        filename += '.czi'
    
    temp_file_path = ""
    try:
        # 创建临时文件
        with tempfile.NamedTemporaryFile(delete=False, suffix='.czi') as temp_file:
            temp_file_path = temp_file.name
        
        # 从URL下载文件
        download_success = await download_file_from_url(file_url, temp_file_path)
        
        if not download_success:
            return AnalysisResponse(
                success=False,
                message="从云存储下载文件失败",
                error="无法从提供的URL下载文件，请检查URL是否有效且可访问"
            )
        
        # 创建分析器并执行分析
        analyzer = MitochondrialAnalyzer(threshold_method=threshold_method)
        results = analyzer.analyze_czi_file(
            file_path=temp_file_path,
            mitochondrial_channel_index=mitochondrial_channel,
            target_protein_channel_index=target_protein_channel,
            generate_visualization=generate_visualization
        )
        
        # 更新结果中的文件名
        if results:
            results['FileName'] = filename
        
        if results is None:
            return AnalysisResponse(
                success=False,
                message="分析失败",
                error="无法处理该文件，请检查文件格式和通道索引"
            )
        
        return AnalysisResponse(
            success=True,
            message="从云存储分析成功",
            data=results
        )
        
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print(f"Error during cloud analysis: {error_detail}")
        
        return AnalysisResponse(
            success=False,
            message="分析过程中出现错误",
            error=str(e)
        )
        
    finally:
        # 清理临时文件
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except Exception as e:
                print(f"Error deleting temporary file: {e}")


@app.post("/batch-analyze", response_model=AnalysisResponse)
async def batch_analyze_czi(
    files: list[UploadFile] = File(..., description="多个CZI格式的显微镜图像文件"),
    mitochondrial_channel: int = Form(0, description="线粒体通道索引（默认为0）"),
    target_protein_channel: int = Form(2, description="目标蛋白通道索引（默认为2）"),
    threshold_method: str = Form("otsu", description="阈值分割方法：otsu, li, yen（默认为otsu）"),
    generate_visualization: bool = Form(False, description="是否生成可视化图像（默认为False）")
):
    """
    批量分析多个CZI文件
    
    - **files**: 上传的多个CZI文件
    - **mitochondrial_channel**: 线粒体通道索引（可选，默认0）
    - **target_protein_channel**: 目标蛋白通道索引（可选，默认2）
    - **threshold_method**: 阈值分割方法（可选，默认otsu）
    - **generate_visualization**: 是否生成可视化图像（可选，默认False）
    """
    
    # 验证阈值方法
    valid_methods = ['otsu', 'li', 'yen']
    if threshold_method not in valid_methods:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid threshold method. Must be one of: {', '.join(valid_methods)}"
        )
    
    results_list = []
    failed_files = []
    
    # 创建分析器
    analyzer = MitochondrialAnalyzer(threshold_method=threshold_method)
    
    for file in files:
        # 验证文件格式
        if not file.filename.endswith('.czi'):
            failed_files.append({
                "filename": file.filename,
                "error": "Invalid file format. Only .czi files are supported."
            })
            continue
        
        temp_file = None
        temp_file_path = ""
        try:
            # 创建临时文件
            with tempfile.NamedTemporaryFile(delete=False, suffix='.czi') as temp_file:
                shutil.copyfileobj(file.file, temp_file)
                temp_file_path = temp_file.name
            
            # 执行分析
            result = analyzer.analyze_czi_file(
                file_path=temp_file_path,
                mitochondrial_channel_index=mitochondrial_channel,
                target_protein_channel_index=target_protein_channel,
                generate_visualization=generate_visualization
            )
            
            if result is None:
                failed_files.append({
                    "filename": file.filename,
                    "error": "Analysis failed. Please check file format and channel indices."
                })
            else:
                results_list.append(result)
                
        except Exception as e:
            failed_files.append({
                "filename": file.filename,
                "error": str(e)
            })
            
        finally:
            # 清理临时文件
            if temp_file and os.path.exists(temp_file_path):
                try:
                    os.unlink(temp_file_path)
                except Exception as e:
                    print(f"Error deleting temporary file: {e}")
            
            # 关闭上传的文件
            await file.close()
    
    # 返回结果
    return AnalysisResponse(
        success=len(results_list) > 0,
        message=f"成功分析 {len(results_list)} 个文件，失败 {len(failed_files)} 个文件",
        data={
            "results": results_list,
            "failed_files": failed_files,
            "total_files": len(files),
            "successful_count": len(results_list),
            "failed_count": len(failed_files)
        }
    )


def analyze_single_file_sync(
    file_path: str,
    filename: str,
    mitochondrial_channel: int,
    target_protein_channel: int,
    threshold_method: str,
    generate_visualization: bool
) -> Dict:
    """
    同步分析单个文件（用于进程池并发）
    
    这个函数在独立的进程中运行，避免 GIL 限制
    """
    try:
        analyzer = MitochondrialAnalyzer(threshold_method=threshold_method)
        result = analyzer.analyze_czi_file(
            file_path=file_path,
            mitochondrial_channel_index=mitochondrial_channel,
            target_protein_channel_index=target_protein_channel,
            generate_visualization=generate_visualization
        )
        return {"success": True, "data": result}
    except Exception as e:
        return {
            "success": False,
            "filename": filename,
            "error": str(e)
        }


@app.post("/batch-analyze-concurrent", response_model=AnalysisResponse)
async def batch_analyze_concurrent(
    files: list[UploadFile] = File(..., description="多个CZI格式的显微镜图像文件"),
    mitochondrial_channel: int = Form(0, description="线粒体通道索引（默认为0）"),
    target_protein_channel: int = Form(2, description="目标蛋白通道索引（默认为2）"),
    threshold_method: str = Form("otsu", description="阈值分割方法：otsu, li, yen（默认为otsu）"),
    generate_visualization: bool = Form(False, description="是否生成可视化图像（默认为False）")
):
    """
    批量分析多个CZI文件 - 并发优化版本
    
    使用进程池并发处理多个文件，显著提升分析速度
    
    - **files**: 上传的多个CZI文件
    - **mitochondrial_channel**: 线粒体通道索引（可选，默认0）
    - **target_protein_channel**: 目标蛋白通道索引（可选，默认2）
    - **threshold_method**: 阈值分割方法（可选，默认otsu）
    - **generate_visualization**: 是否生成可视化图像（可选，默认False）
    """
    
    # 验证阈值方法
    valid_methods = ['otsu', 'li', 'yen']
    if threshold_method not in valid_methods:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid threshold method. Must be one of: {', '.join(valid_methods)}"
        )
    
    # 第一步：保存所有文件到临时位置
    temp_files = []
    for file in files:
        # 验证文件格式
        if not file.filename or not file.filename.endswith('.czi'):
            continue
            
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.czi')
        shutil.copyfileobj(file.file, temp_file)
        temp_file.close()
        
        temp_files.append({
            'path': temp_file.name,
            'filename': file.filename
        })
        
        await file.close()
    
    if not temp_files:
        return AnalysisResponse(
            success=False,
            message="没有有效的 CZI 文件",
            data={
                "results": [],
                "failed_files": [],
                "total_files": len(files),
                "successful_count": 0,
                "failed_count": len(files)
            }
        )
    
    # 第二步：使用进程池并发分析
    max_workers = min(multiprocessing.cpu_count(), len(temp_files), 4)  # 最多4个进程
    
    try:
        with ProcessPoolExecutor(max_workers=max_workers) as executor:
            loop = asyncio.get_event_loop()
            
            # 创建所有任务
            tasks = [
                loop.run_in_executor(
                    executor,
                    analyze_single_file_sync,
                    temp_file['path'],
                    temp_file['filename'],
                    mitochondrial_channel,
                    target_protein_channel,
                    threshold_method,
                    generate_visualization
                )
                for temp_file in temp_files
            ]
            
            # 并发执行所有任务
            results = await asyncio.gather(*tasks, return_exceptions=True)
    
    finally:
        # 第三步：清理所有临时文件
        for temp_file in temp_files:
            try:
                os.unlink(temp_file['path'])
            except Exception as e:
                print(f"Error deleting temporary file: {e}")
    
    # 第四步：处理结果
    results_list = []
    failed_files = []
    
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            # 任务执行时发生异常
            failed_files.append({
                "filename": temp_files[i]['filename'],
                "error": str(result)
            })
        elif isinstance(result, dict):
            if result.get("success"):
                # 分析成功
                results_list.append(result["data"])
            else:
                # 分析失败
                failed_files.append({
                    "filename": result.get("filename", temp_files[i]['filename']),
                    "error": result.get("error", "Unknown error")
                })
        else:
            # 未知结果类型
            failed_files.append({
                "filename": temp_files[i]['filename'],
                "error": "Unknown result type"
            })
    
    # 返回结果
    return AnalysisResponse(
        success=len(results_list) > 0,
        message=f"并发分析完成: 成功 {len(results_list)} 个，失败 {len(failed_files)} 个",
        data={
            "results": results_list,
            "failed_files": failed_files,
            "total_files": len(temp_files),
            "successful_count": len(results_list),
            "failed_count": len(failed_files),
            "concurrent": True  # 标记这是并发版本
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        timeout_keep_alive=300  # 增加超时到5分钟
    )
