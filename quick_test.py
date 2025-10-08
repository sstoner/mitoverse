#!/usr/bin/env python3
"""
快速测试脚本 - 验证服务是否正常运行
"""
import requests
import sys

def test_service():
    base_url = "http://localhost:8000"
    
    print("=" * 60)
    print("线粒体蛋白荧光强度分析服务 - 快速测试")
    print("=" * 60)
    print()
    
    # 测试 1: 健康检查
    print("测试 1: 健康检查...")
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✓ 健康检查通过")
            print(f"  响应: {response.json()}")
        else:
            print(f"✗ 健康检查失败: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ 无法连接到服务: {e}")
        print(f"  请确保服务正在运行: python api.py")
        return False
    
    print()
    
    # 测试 2: 根端点
    print("测试 2: 服务信息...")
    try:
        response = requests.get(f"{base_url}/", timeout=5)
        if response.status_code == 200:
            print("✓ 服务信息获取成功")
            info = response.json()
            print(f"  服务: {info.get('service')}")
            print(f"  版本: {info.get('version')}")
            print(f"  状态: {info.get('status')}")
        else:
            print(f"✗ 获取服务信息失败: HTTP {response.status_code}")
    except Exception as e:
        print(f"✗ 请求失败: {e}")
    
    print()
    
    # 测试 3: API 文档
    print("测试 3: API 文档可访问性...")
    try:
        response = requests.get(f"{base_url}/docs", timeout=5)
        if response.status_code == 200:
            print("✓ API 文档可访问")
            print(f"  访问地址: {base_url}/docs")
        else:
            print(f"✗ API 文档不可访问: HTTP {response.status_code}")
    except Exception as e:
        print(f"✗ 请求失败: {e}")
    
    print()
    print("=" * 60)
    print("基础测试完成！")
    print()
    print("下一步:")
    print("1. 访问 API 文档: http://localhost:8000/docs")
    print("2. 使用 demo.html 进行可视化测试")
    print("3. 使用 test_api.py 进行完整测试（需提供 CZI 文件）")
    print("=" * 60)
    
    return True

if __name__ == "__main__":
    success = test_service()
    sys.exit(0 if success else 1)
