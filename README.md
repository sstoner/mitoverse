# 线粒体蛋白荧光强度分析 SaaS 服务

基于显微镜图像（CZI 格式）的线粒体蛋白荧光强度分析服务。

## 功能特性

- 🔬 支持 CZI 格式显微镜图像分析
- 🎯 可自定义线粒体通道和目标蛋白通道
- 📊 多种阈值分割方法（Otsu、Li、Yen）
- 🖼️ 可选的可视化图像生成
- 📦 支持单文件和批量分析
- 🌐 RESTful API 接口
- 📈 详细的分析结果指标

## 快速开始

### 使用 Docker（推荐）

**最快速的方式：**

```bash
# 开发环境（热重载）
./docker-start.sh dev

# 生产环境（包含 Nginx）
./docker-start.sh prod

# 查看日志
./docker-start.sh logs

# 停止服务
./docker-start.sh stop
```

**或使用 Docker Compose：**

```bash
# 启动开发环境
docker-compose up -d

# 查看日志
docker-compose logs -f api

# 停止服务
docker-compose down
```

**或直接使用 Docker：**

```bash
# 构建镜像
docker build -t mitoverse-api .

# 运行容器
docker run -d -p 8000:8000 --name mitoverse-api mitoverse-api

# 查看日志
docker logs -f mitoverse-api
```

服务启动后访问:
- API 文档: http://localhost:8000/docs
- 健康检查: http://localhost:8000/health

📚 详细的 Docker 使用指南请查看 [DOCKER_GUIDE.md](./DOCKER_GUIDE.md)

### 传统方式（不使用 Docker）

#### 1. 创建虚拟环境（推荐）

```bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# 或
.venv\Scripts\activate  # Windows
```

#### 2. 安装依赖

```bash
pip install -r requirements.txt
```

#### 3. 启动服务

```bash
python api.py
```

服务将在 `http://localhost:8000` 启动。

## API 文档

启动服务后，访问以下地址查看交互式 API 文档：

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API 端点

### 1. 单文件分析

**POST** `/analyze`

上传单个 CZI 文件进行分析。

**参数：**

- `file`: CZI 文件（必需）
- `mitochondrial_channel`: 线粒体通道索引（可选，默认 0）
- `target_protein_channel`: 目标蛋白通道索引（可选，默认 2）
- `threshold_method`: 阈值方法（可选，默认 otsu，可选值：otsu/li/yen）
- `generate_visualization`: 是否生成可视化图像（可选，默认 false）

**返回结果示例：**

```json
{
  "success": true,
  "message": "分析成功",
  "data": {
    "FileName": "sample.czi",
    "Average_Intensity_in_Mitochondria": 125.43,
    "Total_Intensity_in_Mitochondria": 1254300.0,
    "Mitochondrial_Pixels_Count": 10000,
    "Mitochondrial_Average_Intensity": 89.21,
    "Threshold_Value": 45.67,
    "Mask_Coverage_Percentage": 5.32,
    "Mitochondrial_Channel_Index": 0,
    "Target_Protein_Channel_Index": 2,
    "Threshold_Method": "otsu"
  }
}
```

### 2. 批量分析

**POST** `/batch-analyze`

上传多个 CZI 文件进行批量分析。

**参数：**

- `files`: 多个 CZI 文件（必需）
- 其他参数同单文件分析

### 3. 健康检查

**GET** `/health`

检查服务状态。

## 使用示例

### cURL

```bash
# 单文件分析
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@sample.czi" \
  -F "mitochondrial_channel=0" \
  -F "target_protein_channel=2" \
  -F "threshold_method=otsu" \
  -F "generate_visualization=true"
```

### Python

```python
import requests

# 单文件分析
url = "http://localhost:8000/analyze"
files = {"file": open("sample.czi", "rb")}
data = {
    "mitochondrial_channel": 0,
    "target_protein_channel": 2,
    "threshold_method": "otsu",
    "generate_visualization": True
}

response = requests.post(url, files=files, data=data)
result = response.json()
print(result)
```

### JavaScript (Fetch)

```javascript
const formData = new FormData();
formData.append("file", fileInput.files[0]);
formData.append("mitochondrial_channel", 0);
formData.append("target_protein_channel", 2);
formData.append("threshold_method", "otsu");
formData.append("generate_visualization", true);

fetch("http://localhost:8000/analyze", {
  method: "POST",
  body: formData,
})
  .then((response) => response.json())
  .then((data) => console.log(data));
```

## 结果指标说明

- **Average_Intensity_in_Mitochondria**: 线粒体区域内目标蛋白的平均荧光强度
- **Total_Intensity_in_Mitochondria**: 线粒体区域内目标蛋白的总荧光强度
- **Mitochondrial_Pixels_Count**: 线粒体掩膜包含的像素数量
- **Mitochondrial_Average_Intensity**: 线粒体通道本身的平均强度
- **Threshold_Value**: 使用的阈值分割数值
- **Mask_Coverage_Percentage**: 线粒体掩膜覆盖图像的百分比

## 阈值方法说明

- **otsu**: Otsu 方法，适用于双峰分布的图像
- **li**: Li 方法，基于最小交叉熵
- **yen**: Yen 方法，适用于低对比度图像

## 注意事项

1. 确保上传的文件格式为 CZI
2. 通道索引从 0 开始
3. 根据实际图像的通道顺序调整通道参数
4. 可视化图像以 base64 编码返回
5. 临时文件会自动清理

## 技术栈

- FastAPI - Web 框架
- scikit-image - 图像处理
- NumPy - 数值计算
- Matplotlib - 可视化
- czifile - CZI 文件读取
- Docker - 容器化部署
- GitHub Actions - CI/CD 自动化

## 部署

### Docker Hub 镜像

```bash
# 拉取最新镜像
docker pull yourusername/mitoverse-api:latest

# 运行容器
docker run -d -p 8000:8000 yourusername/mitoverse-api:latest
```

### CI/CD

本项目使用 GitHub Actions 自动构建和推送 Docker 镜像到 Docker Hub。

**触发条件：**
- 推送到 `master`/`main`/`develop` 分支
- 创建版本标签（例如 `v1.0.0`）

**镜像标签：**
- `latest` - master/main 分支最新版本
- `v1.0.0` - 语义化版本标签
- `develop` - develop 分支最新版本

**配置步骤：**

1. 在 Docker Hub 创建仓库
2. 生成 Docker Hub Access Token
3. 在 GitHub 仓库添加 Secrets:
   - `DOCKER_USERNAME`: Docker Hub 用户名
   - `DOCKER_PASSWORD`: Docker Hub Access Token

详细的部署指南请查看 [DOCKER_GUIDE.md](./DOCKER_GUIDE.md)

## 开发指南

### 项目结构

```
.
├── analyzer.py          # 核心分析逻辑
├── api.py              # FastAPI 应用
├── requirements.txt    # Python 依赖
├── Dockerfile          # Docker 镜像构建
├── docker-compose.yml  # Docker Compose 配置
├── docker-start.sh     # Docker 快速启动脚本
├── nginx.conf          # Nginx 反向代理配置
├── .dockerignore       # Docker 构建忽略文件
├── .github/
│   └── workflows/
│       └── docker-build.yml  # GitHub Actions 工作流
└── web/                # 前端应用（子模块）
    └── ...
```

### 本地开发

```bash
# 1. 克隆仓库（包含子模块）
git clone --recursive https://github.com/sstoner/mitoverse.git
cd mitoverse

# 2. 启动后端（Docker）
./docker-start.sh dev

# 3. 启动前端
cd web
npm install
npm run dev
```

### 运行测试

```bash
# 使用 Docker
./docker-start.sh test

# 或直接运行
pytest test_api.py -v
```

## 相关链接

- 前端仓库: [mitoverse-web](https://github.com/sstoner/mitoverse-web)
- Docker Hub: [yourusername/mitoverse-api](https://hub.docker.com/r/yourusername/mitoverse-api)
- API 文档: http://localhost:8000/docs（本地运行）

## 许可证

MIT License
