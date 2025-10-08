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

## 安装

### 1. 创建虚拟环境（推荐）

```bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# 或
.venv\Scripts\activate  # Windows
```

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

## 启动服务

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

## 许可证

MIT License
