"""
API 测试脚本
"""
import requests
import json


def test_health_check():
    """测试健康检查端点"""
    print("Testing health check endpoint...")
    response = requests.get("http://localhost:8000/health")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    print("-" * 50)


def test_root():
    """测试根端点"""
    print("Testing root endpoint...")
    response = requests.get("http://localhost:8000/")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    print("-" * 50)


def test_analyze(czi_file_path, mitochondrial_channel=0, target_protein_channel=2):
    """测试单文件分析"""
    print(f"Testing analyze endpoint with file: {czi_file_path}")
    
    url = "http://localhost:8000/analyze"
    
    with open(czi_file_path, "rb") as f:
        files = {"file": f}
        data = {
            "mitochondrial_channel": mitochondrial_channel,
            "target_protein_channel": target_protein_channel,
            "threshold_method": "otsu",
            "generate_visualization": False  # 设为True可获取可视化图像
        }
        
        response = requests.post(url, files=files, data=data)
    
    print(f"Status Code: {response.status_code}")
    result = response.json()
    print(f"Success: {result.get('success')}")
    print(f"Message: {result.get('message')}")
    
    if result.get('success'):
        data = result.get('data')
        print("\nAnalysis Results:")
        print(f"  File Name: {data.get('FileName')}")
        print(f"  Average Intensity: {data.get('Average_Intensity_in_Mitochondria'):.2f}")
        print(f"  Total Intensity: {data.get('Total_Intensity_in_Mitochondria'):.2f}")
        print(f"  Mitochondrial Pixels: {data.get('Mitochondrial_Pixels_Count')}")
        print(f"  Mask Coverage: {data.get('Mask_Coverage_Percentage'):.2f}%")
    else:
        print(f"Error: {result.get('error')}")
    
    print("-" * 50)


def test_batch_analyze(czi_file_paths, mitochondrial_channel=0, target_protein_channel=2):
    """测试批量分析"""
    print(f"Testing batch analyze endpoint with {len(czi_file_paths)} files")
    
    url = "http://localhost:8000/batch-analyze"
    
    files = []
    file_objects = []
    try:
        # 打开所有文件
        for path in czi_file_paths:
            f = open(path, "rb")
            file_objects.append(f)
            files.append(("files", f))
        
        data = {
            "mitochondrial_channel": mitochondrial_channel,
            "target_protein_channel": target_protein_channel,
            "threshold_method": "otsu",
            "generate_visualization": False
        }
        
        response = requests.post(url, files=files, data=data)
        
        print(f"Status Code: {response.status_code}")
        result = response.json()
        print(f"Success: {result.get('success')}")
        print(f"Message: {result.get('message')}")
        
        if result.get('success'):
            batch_data = result.get('data')
            print(f"\nBatch Results:")
            print(f"  Total Files: {batch_data.get('total_files')}")
            print(f"  Successful: {batch_data.get('successful_count')}")
            print(f"  Failed: {batch_data.get('failed_count')}")
            
            if batch_data.get('results'):
                print("\n  Analysis Results:")
                for idx, res in enumerate(batch_data.get('results'), 1):
                    print(f"    {idx}. {res.get('FileName')}: "
                          f"Avg Intensity = {res.get('Average_Intensity_in_Mitochondria'):.2f}")
            
            if batch_data.get('failed_files'):
                print("\n  Failed Files:")
                for failed in batch_data.get('failed_files'):
                    print(f"    - {failed.get('filename')}: {failed.get('error')}")
        else:
            print(f"Error: {result.get('error')}")
        
    finally:
        # 关闭所有文件
        for f in file_objects:
            f.close()
    
    print("-" * 50)


if __name__ == "__main__":
    print("=" * 50)
    print("Mitochondrial Analysis API Test Suite")
    print("=" * 50)
    print()
    
    # 测试健康检查
    test_health_check()
    
    # 测试根端点
    test_root()
    
    # 测试单文件分析（需要提供实际的CZI文件路径）
    # test_analyze("./data/czi/sample.czi", mitochondrial_channel=0, target_protein_channel=2)
    
    # 测试批量分析（需要提供实际的CZI文件路径列表）
    # test_batch_analyze([
    #     "./data/czi/sample1.czi",
    #     "./data/czi/sample2.czi"
    # ], mitochondrial_channel=0, target_protein_channel=2)
    
    print("\nNote: 要测试分析功能，请取消注释上面的测试函数并提供有效的CZI文件路径。")
