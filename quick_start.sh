#!/bin/bash

echo "================================"
echo "线粒体蛋白荧光强度分析服务"
echo "快速启动脚本"
echo "================================"
echo ""

# 检查虚拟环境
if [ ! -d ".venv" ]; then
    echo "❌ 虚拟环境不存在"
    echo "正在创建虚拟环境..."
    python -m venv .venv
    source .venv/bin/activate
    echo "正在安装依赖..."
    pip install -r requirements.txt
else
    echo "✓ 虚拟环境已存在"
    source .venv/bin/activate
fi

echo ""
echo "================================"
echo "🚀 启动服务..."
echo "================================"

# 启动后端服务（后台运行）
python api.py &
BACKEND_PID=$!

echo "✓ 后端服务已启动 (PID: $BACKEND_PID)"
echo "  地址: http://localhost:8000"
echo "  API文档: http://localhost:8000/docs"

# 等待服务启动
echo ""
echo "等待服务启动..."
sleep 3

# 测试服务
echo ""
echo "测试服务连接..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✓ 服务运行正常"
else
    echo "❌ 服务启动失败"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "================================"
echo "🎨 打开前端界面"
echo "================================"
echo ""
echo "方式 1: 在浏览器中打开以下文件"
echo "  $(pwd)/demo.html"
echo ""
echo "方式 2: 使用以下命令自动打开"

# 尝试检测可用的浏览器并打开
DEMO_PATH="file://$(pwd)/demo.html"

if command -v xdg-open > /dev/null; then
    echo "  使用默认浏览器打开..."
    xdg-open "$DEMO_PATH" 2>/dev/null &
elif command -v google-chrome > /dev/null; then
    echo "  使用 Chrome 打开..."
    google-chrome "$DEMO_PATH" 2>/dev/null &
elif command -v firefox > /dev/null; then
    echo "  使用 Firefox 打开..."
    firefox "$DEMO_PATH" 2>/dev/null &
else
    echo "  请手动打开: $DEMO_PATH"
fi

echo ""
echo "================================"
echo "✨ 服务已就绪！"
echo "================================"
echo ""
echo "📍 后端 API: http://localhost:8000"
echo "📍 API 文档: http://localhost:8000/docs"
echo "📍 前端界面: demo.html"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

# 保存 PID 以便后续清理
echo $BACKEND_PID > .backend.pid

# 等待用户中断
trap "echo ''; echo '正在停止服务...'; kill $BACKEND_PID 2>/dev/null; rm -f .backend.pid; echo '✓ 服务已停止'; exit 0" INT TERM

# 保持脚本运行
wait $BACKEND_PID
