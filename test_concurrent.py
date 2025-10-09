"""
测试并发批量分析性能
比较串行和并发版本的性能差异
"""
import time
import httpx
from pathlib import Path

API_BASE_URL = "http://localhost:8000"

def test_batch_analysis(endpoint: str, files_count: int = 3):
    """测试批量分析端点"""
    
    # 使用示例文件（如果存在）或创建模拟文件
    test_files = []
    
    # 查找示例文件
    sample_file = Path("sample_data/example.czi")
    if not sample_file.exists():
        # 尝试其他可能的位置
        possible_locations = [
            Path.cwd() / "examples" / "example.czi",
            Path.cwd() / "test_data" / "example.czi",
        ]
        for loc in possible_locations:
            if loc.exists():
                sample_file = loc
                break
    
    if not sample_file.exists():
        print(f"⚠️  未找到示例文件，无法测试")
        return None
    
    print(f"📁 使用文件: {sample_file}")
    
    # 准备多个文件（使用同一个文件模拟）
    files = []
    for i in range(files_count):
        files.append(
            ("files", (f"test_{i}.czi", open(sample_file, "rb"), "application/octet-stream"))
        )
    
    try:
        # 准备参数
        data = {
            "mitochondrial_channel": "0",
            "target_protein_channel": "2",
            "threshold_method": "otsu",
            "generate_visualization": "false"
        }
        
        print(f"🚀 测试端点: {endpoint}")
        print(f"📊 文件数量: {files_count}")
        
        start_time = time.time()
        
        # 发送请求
        with httpx.Client(timeout=300.0) as client:
            response = client.post(
                f"{API_BASE_URL}{endpoint}",
                files=files,
                data=data
            )
        
        elapsed_time = time.time() - start_time
        
        # 关闭文件
        for _, file_tuple in files:
            file_tuple[1].close()
        
        # 检查结果
        if response.status_code == 200:
            result = response.json()
            print(f"✅ 成功！耗时: {elapsed_time:.2f} 秒")
            print(f"   - 成功: {result['data']['successful_count']} 个")
            print(f"   - 失败: {result['data']['failed_count']} 个")
            if result['data'].get('concurrent'):
                print(f"   - 并发模式: 是")
            return elapsed_time
        else:
            print(f"❌ 失败: {response.status_code}")
            print(f"   {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ 错误: {e}")
        # 确保关闭文件
        for _, file_tuple in files:
            try:
                file_tuple[1].close()
            except:
                pass
        return None


def main():
    print("=" * 60)
    print("批量分析性能测试")
    print("=" * 60)
    print()
    
    # 确保API在运行
    try:
        response = httpx.get(f"{API_BASE_URL}/health", timeout=5.0)
        if response.status_code != 200:
            print("❌ API 未运行，请先启动: python api.py")
            return
    except Exception as e:
        print(f"❌ 无法连接到API ({API_BASE_URL})")
        print(f"   请先启动: python api.py")
        return
    
    print("✅ API 连接成功\n")
    
    # 测试不同文件数量
    test_cases = [2, 3, 5]
    
    for count in test_cases:
        print(f"\n{'=' * 60}")
        print(f"测试 {count} 个文件")
        print(f"{'=' * 60}\n")
        
        # 串行版本
        serial_time = test_batch_analysis("/batch-analyze", count)
        print()
        
        # 并发版本
        concurrent_time = test_batch_analysis("/batch-analyze-concurrent", count)
        print()
        
        # 比较
        if serial_time and concurrent_time:
            speedup = serial_time / concurrent_time
            improvement = ((serial_time - concurrent_time) / serial_time) * 100
            
            print(f"📈 性能对比:")
            print(f"   - 串行版本:  {serial_time:.2f} 秒")
            print(f"   - 并发版本:  {concurrent_time:.2f} 秒")
            print(f"   - 加速比:    {speedup:.2f}x")
            print(f"   - 性能提升:  {improvement:.1f}%")
        
        print()


if __name__ == "__main__":
    main()
