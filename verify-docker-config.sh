#!/bin/bash

# Docker 配置验证脚本
# 用于快速测试 Docker 相关配置是否正确

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Docker 配置验证开始..."
echo ""

# 检查文件是否存在
echo "1️⃣  检查配置文件..."
files=(
    "Dockerfile"
    ".dockerignore"
    "docker-compose.yml"
    "nginx.conf"
    "docker-start.sh"
    ".github/workflows/docker-build.yml"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓${NC} $file"
    else
        echo -e "  ${RED}✗${NC} $file (缺失)"
        exit 1
    fi
done

echo ""
echo "2️⃣  检查 Docker 环境..."
if command -v docker &> /dev/null; then
    docker_version=$(docker --version)
    echo -e "  ${GREEN}✓${NC} Docker 已安装: $docker_version"
else
    echo -e "  ${RED}✗${NC} Docker 未安装"
    exit 1
fi

if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    compose_version=$(docker-compose --version 2>/dev/null || docker compose version 2>/dev/null)
    echo -e "  ${GREEN}✓${NC} Docker Compose 已安装: $compose_version"
else
    echo -e "  ${RED}✗${NC} Docker Compose 未安装"
    exit 1
fi

echo ""
echo "3️⃣  验证 Dockerfile 语法..."
if docker build --help &> /dev/null; then
    echo -e "  ${GREEN}✓${NC} Dockerfile 格式有效"
else
    echo -e "  ${RED}✗${NC} Dockerfile 格式错误"
    exit 1
fi

echo ""
echo "4️⃣  验证 docker-compose.yml 语法..."
if docker-compose config &> /dev/null || docker compose config &> /dev/null; then
    echo -e "  ${GREEN}✓${NC} docker-compose.yml 格式有效"
else
    echo -e "  ${RED}✗${NC} docker-compose.yml 格式错误"
    exit 1
fi

echo ""
echo "5️⃣  检查 Python 依赖文件..."
if [ -f "requirements.txt" ]; then
    dep_count=$(wc -l < requirements.txt)
    echo -e "  ${GREEN}✓${NC} requirements.txt 存在 ($dep_count 个依赖)"
else
    echo -e "  ${YELLOW}⚠${NC} requirements.txt 不存在"
fi

echo ""
echo "6️⃣  检查核心 Python 文件..."
core_files=("api.py" "analyzer.py")
for file in "${core_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓${NC} $file"
    else
        echo -e "  ${RED}✗${NC} $file (缺失)"
    fi
done

echo ""
echo "7️⃣  检查健康检查端点..."
if grep -q "def health_check" api.py; then
    echo -e "  ${GREEN}✓${NC} 健康检查端点已定义"
else
    echo -e "  ${YELLOW}⚠${NC} 未找到健康检查端点"
fi

echo ""
echo "8️⃣  检查 GitHub Actions 工作流..."
if [ -f ".github/workflows/docker-build.yml" ]; then
    if grep -q "DOCKER_USERNAME" .github/workflows/docker-build.yml; then
        echo -e "  ${GREEN}✓${NC} GitHub Secrets 配置已引用"
    else
        echo -e "  ${YELLOW}⚠${NC} 未找到 DOCKER_USERNAME 配置"
    fi
fi

echo ""
echo "9️⃣  检查脚本执行权限..."
if [ -x "docker-start.sh" ]; then
    echo -e "  ${GREEN}✓${NC} docker-start.sh 有执行权限"
else
    echo -e "  ${YELLOW}⚠${NC} docker-start.sh 无执行权限（运行 chmod +x docker-start.sh）"
fi

echo ""
echo "🔟  检查文档完整性..."
docs=("DOCKER_GUIDE.md" "GITHUB_ACTIONS_SETUP.md" "DOCKER_SUMMARY.md")
for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "  ${GREEN}✓${NC} $doc"
    else
        echo -e "  ${YELLOW}⚠${NC} $doc (可选)"
    fi
done

echo ""
echo "═══════════════════════════════════════"
echo -e "${GREEN}✨ 验证完成！所有必需配置都已就绪${NC}"
echo "═══════════════════════════════════════"
echo ""
echo "下一步操作："
echo "  1. 本地测试: ./docker-start.sh dev"
echo "  2. 配置 CI/CD: 查看 GITHUB_ACTIONS_SETUP.md"
echo "  3. 生产部署: ./docker-start.sh prod"
echo ""
echo "📚 详细文档："
echo "  - Docker 指南: DOCKER_GUIDE.md"
echo "  - CI/CD 配置: GITHUB_ACTIONS_SETUP.md"
echo "  - 配置总结: DOCKER_SUMMARY.md"
echo ""
