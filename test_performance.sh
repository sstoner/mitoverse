#!/bin/bash

echo "=================================="
echo "批量分析并发优化 - 快速测试"
echo "=================================="
echo ""

# 检查是否有 Python
if ! command -v python &> /dev/null; then
    echo "❌ Python 未安装"
    exit 1
fi

# 检查依赖
echo "📦 检查依赖..."
python -c "import httpx" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "安装 httpx..."
    pip install httpx -q
fi

# 启动 API（如果还没运行）
echo ""
echo "🚀 检查 API 状态..."
curl -s http://localhost:8000/health > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "⚠️  API 未运行"
    echo "   启动命令: python api.py"
    echo ""
    echo "是否现在启动 API? (y/n)"
    read -r response
    if [ "$response" = "y" ]; then
        echo "启动 API（后台运行）..."
        nohup python api.py > api.log 2>&1 &
        API_PID=$!
        echo "API PID: $API_PID"
        
        # 等待 API 启动
        echo "等待 API 启动..."
        for i in {1..30}; do
            curl -s http://localhost:8000/health > /dev/null 2>&1
            if [ $? -eq 0 ]; then
                echo "✅ API 已启动"
                break
            fi
            sleep 1
            echo -n "."
        done
        echo ""
    else
        echo "请先手动启动 API: python api.py"
        exit 1
    fi
else
    echo "✅ API 运行中"
fi

# 运行测试
echo ""
echo "🧪 运行性能测试..."
echo ""
python test_concurrent.py

echo ""
echo "=================================="
echo "测试完成"
echo "=================================="
