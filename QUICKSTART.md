# 快速开始指南

## 🚀 5 分钟快速部署

### 步骤 1: 安装依赖

```bash
# 如果还没有虚拟环境，先创建
python -m venv .venv

# 激活虚拟环境
source .venv/bin/activate  # Linux/Mac

# 安装依赖包
pip install -r requirements.txt
```

### 步骤 2: 启动服务

```bash
# 方式 1: 使用启动脚本（推荐）
chmod +x start.sh
./start.sh

# 方式 2: 直接运行
python api.py
```

服务将在 http://localhost:8000 启动。

### 步骤 3: 测试服务

#### 方法 1: 使用 Web 界面（最简单）

在浏览器中打开 `demo.html` 文件，通过图形界面上传和分析文件。

#### 方法 2: 使用 Swagger UI（交互式 API 文档）

访问 http://localhost:8000/docs，在交互式文档中测试 API。

#### 方法 3: 使用测试脚本

```bash
# 编辑 test_api.py，取消注释测试函数并提供CZI文件路径
python test_api.py
```

#### 方法 4: 使用 cURL 命令

```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@your_file.czi" \
  -F "mitochondrial_channel=0" \
  -F "target_protein_channel=2" \
  -F "threshold_method=otsu" \
  -F "generate_visualization=true"
```

## 📝 参数说明

### mitochondrial_channel（线粒体通道）

- 默认值: 0
- 说明: 线粒体染料所在的通道索引（如 MitoTracker）
- 通道索引从 0 开始

### target_protein_channel（目标蛋白通道）

- 默认值: 2
- 说明: 目标蛋白所在的通道索引（如 GFP, RFP 标记的蛋白）
- 通道索引从 0 开始

### threshold_method（阈值方法）

- 默认值: otsu
- 可选值:
  - `otsu`: 适用于双峰分布的图像（推荐作为首选）
  - `li`: 基于最小交叉熵，适用于暗图像
  - `yen`: 适用于低对比度图像

### generate_visualization（生成可视化）

- 默认值: false
- 说明: 是否生成包含 4 个子图的可视化图像
  - 原始线粒体通道
  - 线粒体掩膜
  - 原始目标蛋白通道
  - 线粒体区域内的目标蛋白

## 🎯 使用场景

### 场景 1: 单文件快速分析

适用于需要快速查看单个样本的情况。

```python
import requests

url = "http://localhost:8000/analyze"
files = {"file": open("sample.czi", "rb")}
data = {
    "mitochondrial_channel": 0,
    "target_protein_channel": 2,
    "generate_visualization": True  # 获取可视化图像
}

response = requests.post(url, files=files, data=data)
result = response.json()

if result["success"]:
    print(f"平均强度: {result['data']['Average_Intensity_in_Mitochondria']}")
```

### 场景 2: 批量分析多个样本

适用于需要比较多个实验组的情况。

```python
import requests

url = "http://localhost:8000/batch-analyze"
file_paths = ["sample1.czi", "sample2.czi", "sample3.czi"]

files = [("files", open(path, "rb")) for path in file_paths]
data = {
    "mitochondrial_channel": 0,
    "target_protein_channel": 2,
}

response = requests.post(url, files=files, data=data)
result = response.json()

# 处理结果
for res in result["data"]["results"]:
    print(f"{res['FileName']}: {res['Average_Intensity_in_Mitochondria']:.2f}")
```

### 场景 3: 不同通道组合测试

如果不确定正确的通道索引，可以尝试不同的组合。

```python
import requests

url = "http://localhost:8000/analyze"
file = "sample.czi"

# 测试不同的通道组合
combinations = [
    (0, 1), (0, 2), (0, 3),
    (1, 0), (1, 2), (1, 3),
]

for mito_ch, target_ch in combinations:
    files = {"file": open(file, "rb")}
    data = {
        "mitochondrial_channel": mito_ch,
        "target_protein_channel": target_ch,
    }

    response = requests.post(url, files=files, data=data)
    result = response.json()

    if result["success"]:
        print(f"通道 {mito_ch}->{target_ch}: "
              f"强度={result['data']['Average_Intensity_in_Mitochondria']:.2f}, "
              f"覆盖率={result['data']['Mask_Coverage_Percentage']:.2f}%")
```

## 📊 结果解释

### 关键指标

1. **Average_Intensity_in_Mitochondria**

   - 线粒体区域内目标蛋白的平均荧光强度
   - **这是最重要的指标**，用于比较不同样本的蛋白表达水平

2. **Total_Intensity_in_Mitochondria**

   - 线粒体区域内目标蛋白的总荧光强度
   - 受线粒体数量和大小影响

3. **Mitochondrial_Pixels_Count**

   - 线粒体掩膜包含的像素数
   - 反映线粒体的总面积

4. **Mask_Coverage_Percentage**
   - 线粒体占图像的百分比
   - 通常在 5-15% 之间属于正常范围

### 结果验证

✅ **良好的分析结果**:

- Mask_Coverage_Percentage 在 3-20% 之间
- Mitochondrial_Pixels_Count > 1000
- 可视化图像中线粒体形态清晰

⚠️ **可能需要调整的情况**:

- Mask_Coverage_Percentage < 1%: 阈值可能过高，尝试其他阈值方法
- Mask_Coverage_Percentage > 30%: 阈值可能过低，背景被误识别
- 可视化图像中掩膜区域过大或过小

## 🔧 常见问题

### Q1: 服务启动失败？

确保已安装所有依赖：

```bash
pip install -r requirements.txt
```

### Q2: 通道索引不确定？

可以先使用默认值（0, 2）尝试，或查看 CZI 文件的元数据。

### Q3: 分析结果不合理？

1. 检查通道索引是否正确
2. 尝试不同的阈值方法
3. 查看可视化图像验证掩膜质量

### Q4: 如何集成到现有系统？

该服务提供标准的 REST API，可以轻松集成到任何支持 HTTP 请求的系统中。

## 📦 部署到生产环境

### 使用 Docker 部署（推荐）

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["python", "api.py"]
```

### 使用 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 使用进程管理器（如 systemd）

```ini
[Unit]
Description=Mitochondrial Analysis Service
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/project
ExecStart=/path/to/project/.venv/bin/python api.py
Restart=always

[Install]
WantedBy=multi-user.target
```

## 📞 获取帮助

- 查看完整文档: README.md
- API 文档: http://localhost:8000/docs
- 问题反馈: 通过 GitHub Issues 或邮件联系
