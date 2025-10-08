#!/bin/bash

# Docker 快速启动脚本
# 用法: ./docker-start.sh [dev|prod|build|stop|logs]

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印信息
info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    info "Docker 环境检查通过"
}

# 开发模式
dev_mode() {
    info "启动开发环境（热重载模式）..."
    docker-compose up -d
    
    info "等待服务启动..."
    sleep 5
    
    # 检查健康状态
    if curl -f http://localhost:8000/health &> /dev/null; then
        info "✅ API 服务已启动: http://localhost:8000"
        info "📚 API 文档: http://localhost:8000/docs"
        info "📊 查看日志: docker-compose logs -f api"
    else
        warn "服务启动中，请稍等或运行 'docker-compose logs -f' 查看日志"
    fi
}

# 生产模式
prod_mode() {
    info "启动生产环境（包含 Nginx）..."
    docker-compose --profile production up -d
    
    info "等待服务启动..."
    sleep 5
    
    if curl -f http://localhost/health &> /dev/null; then
        info "✅ 生产环境已启动"
        info "🌐 Nginx 代理: http://localhost"
        info "🔧 API 直连: http://localhost:8000"
    else
        warn "服务启动中，请稍等或运行 'docker-compose logs -f' 查看日志"
    fi
}

# 构建镜像
build_image() {
    info "构建 Docker 镜像..."
    docker build -t mitoverse-api:local .
    info "✅ 镜像构建完成: mitoverse-api:local"
    
    # 显示镜像大小
    docker images mitoverse-api:local --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
}

# 停止服务
stop_services() {
    info "停止所有服务..."
    docker-compose --profile production down
    info "✅ 服务已停止"
}

# 查看日志
show_logs() {
    info "显示实时日志（Ctrl+C 退出）..."
    docker-compose logs -f
}

# 清理资源
cleanup() {
    warn "这将删除所有容器、镜像和卷，是否继续？[y/N]"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        info "清理 Docker 资源..."
        docker-compose down -v --rmi all
        info "✅ 清理完成"
    else
        info "已取消"
    fi
}

# 状态检查
check_status() {
    info "服务状态:"
    docker-compose ps
    
    echo ""
    info "健康检查:"
    if curl -f http://localhost:8000/health 2>/dev/null; then
        info "✅ API 健康"
    else
        error "❌ API 不健康或未启动"
    fi
}

# 运行测试
run_tests() {
    info "运行 API 测试..."
    docker-compose exec api python -m pytest test_api.py -v
}

# 显示帮助
show_help() {
    cat << EOF
Docker 快速启动脚本

用法: ./docker-start.sh [command]

命令:
  dev       启动开发环境（默认，热重载）
  prod      启动生产环境（包含 Nginx）
  build     构建 Docker 镜像
  stop      停止所有服务
  logs      查看实时日志
  status    检查服务状态
  test      运行测试
  cleanup   清理所有 Docker 资源
  help      显示此帮助信息

示例:
  ./docker-start.sh dev         # 启动开发环境
  ./docker-start.sh prod        # 启动生产环境
  ./docker-start.sh logs        # 查看日志
  ./docker-start.sh stop        # 停止服务

环境变量:
  DOCKER_IMAGE  Docker 镜像名称（默认: mitoverse-api）
  COMPOSE_FILE  Docker Compose 文件路径（默认: docker-compose.yml）

更多信息: https://github.com/sstoner/mitoverse
EOF
}

# 主函数
main() {
    check_docker
    
    case "${1:-dev}" in
        dev)
            dev_mode
            ;;
        prod|production)
            prod_mode
            ;;
        build)
            build_image
            ;;
        stop)
            stop_services
            ;;
        logs)
            show_logs
            ;;
        status)
            check_status
            ;;
        test)
            run_tests
            ;;
        cleanup)
            cleanup
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            error "未知命令: $1"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
