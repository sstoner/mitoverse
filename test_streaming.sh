#!/bin/bash

echo "=========================================="
echo "流式批量分析测试"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查前端是否在运行
echo -e "${BLUE}🔍 检查前端状态...${NC}"
curl -s http://localhost:3000 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 前端运行中 (http://localhost:3000)${NC}"
else
    echo -e "${YELLOW}⚠️  前端未运行${NC}"
    echo "   启动命令: cd web && npm run dev"
    echo ""
    echo "是否现在启动前端? (y/n)"
    read -r response
    if [ "$response" = "y" ]; then
        cd web
        echo -e "${BLUE}启动前端（后台运行）...${NC}"
        nohup npm run dev > ../frontend.log 2>&1 &
        FRONTEND_PID=$!
        echo "前端 PID: $FRONTEND_PID"
        
        echo -e "${YELLOW}等待前端启动...${NC}"
        for i in {1..30}; do
            sleep 2
            curl -s http://localhost:3000 > /dev/null 2>&1
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ 前端已启动${NC}"
                break
            fi
            echo -n "."
        done
        cd ..
    else
        echo -e "${RED}请先启动前端${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}🔍 检查后端状态...${NC}"
curl -s http://localhost:8000/health > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 后端运行中 (http://localhost:8000)${NC}"
else
    echo -e "${YELLOW}⚠️  后端未运行${NC}"
    echo "   启动命令: python api.py"
    echo ""
    echo "是否现在启动后端? (y/n)"
    read -r response
    if [ "$response" = "y" ]; then
        echo -e "${BLUE}启动后端（后台运行）...${NC}"
        nohup python api.py > backend.log 2>&1 &
        BACKEND_PID=$!
        echo "后端 PID: $BACKEND_PID"
        
        echo -e "${YELLOW}等待后端启动...${NC}"
        for i in {1..30}; do
            sleep 1
            curl -s http://localhost:8000/health > /dev/null 2>&1
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ 后端已启动${NC}"
                break
            fi
            echo -n "."
        done
    else
        echo -e "${RED}请先启动后端${NC}"
        exit 1
    fi
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ 所有服务运行正常${NC}"
echo "=========================================="
echo ""
echo -e "${BLUE}📊 测试信息:${NC}"
echo "  - 前端地址: http://localhost:3000"
echo "  - 后端地址: http://localhost:8000"
echo "  - 分析页面: http://localhost:3000/analyze"
echo "  - 性能对比: http://localhost:3000/performance_comparison.html"
echo ""
echo -e "${YELLOW}📝 使用说明:${NC}"
echo "  1. 打开浏览器访问: http://localhost:3000/analyze"
echo "  2. 切换到「批量分析」模式"
echo "  3. 上传 3-5 个 CZI 文件"
echo "  4. 点击「开始分析」"
echo "  5. 观察实时进度和结果显示"
echo ""
echo -e "${GREEN}🎯 预期效果:${NC}"
echo "  ✅ 看到当前处理的文件名"
echo "  ✅ 看到实时进度条"
echo "  ✅ 快速看到第一个文件的结果"
echo "  ✅ 结果逐个加载（不是一次性显示）"
echo ""
echo -e "${BLUE}🔍 查看日志:${NC}"
echo "  - 前端日志: tail -f frontend.log"
echo "  - 后端日志: tail -f backend.log"
echo ""
echo "按 Ctrl+C 退出监控"
echo ""

# 可选：打开浏览器
if command -v xdg-open > /dev/null 2>&1; then
    echo "是否打开浏览器? (y/n)"
    read -r response
    if [ "$response" = "y" ]; then
        xdg-open http://localhost:3000/analyze 2>/dev/null &
    fi
elif command -v open > /dev/null 2>&1; then
    echo "是否打开浏览器? (y/n)"
    read -r response
    if [ "$response" = "y" ]; then
        open http://localhost:3000/analyze 2>/dev/null &
    fi
fi

# 保持运行并监控日志
echo -e "${YELLOW}监控日志中...${NC}"
echo ""
tail -f backend.log 2>/dev/null
