# LLM 继任者启动 Prompt

> 本文档用于指导下一个 AI 助手快速接手本项目

---

## 📋 项目基本信息

### 项目名称
**线粒体蛋白荧光强度分析平台** (Mitochondrial Protein Fluorescence Intensity Analysis Platform)

### 项目类型
生物信息学 SaaS 服务 - 将 Python 科研脚本转换为完整的 Web 应用

### 技术栈
- **后端**: FastAPI 0.104.1 + Uvicorn + scikit-image + czifile
- **前端**: Next.js 15.5.4 + TypeScript + Tailwind CSS + React 19
- **部署**: 本地开发环境（localhost）

### 项目路径
```
根目录: /home/vncl/projects/blackpig/apps/saas/bioinfo/mitochondrial_protein_fluorescence_intensity_analysis/
前端目录: /home/vncl/projects/blackpig/apps/saas/bioinfo/mitochondrial_protein_fluorescence_intensity_analysis/web/
```

### 当前运行状态
- ✅ 后端服务: http://localhost:8000 (运行中)
- ✅ 前端服务: http://localhost:3001 (运行中，端口自动切换)
- ✅ 项目状态: MVP 完成，运行稳定，准备优化

---

## 🎯 项目当前状态

### 已完成功能（v1.0.0）

#### 后端 API
- ✅ 单文件分析 (`POST /analyze`)
- ✅ 批量分析 (`POST /batch-analyze`)
- ✅ 健康检查 (`GET /health`)
- ✅ 9项分析指标（荧光强度、像素统计等）
- ✅ 3种阈值分割方法（Otsu/Li/Yen）
- ✅ 可视化图像生成（4宫格布局）

#### 前端应用
- ✅ 首页 (`/`) - 产品介绍、特性展示、使用流程
- ✅ 分析页面 (`/analyze`) - 文件上传、参数配置、结果展示
- ✅ 文档页面 (`/docs`) - 使用指南、API 文档、FAQ
- ✅ 8个可复用组件（Button, Card, FileUpload 等）
- ✅ 响应式设计，流畅动画

#### 文档系统
项目包含 **7个详细文档**，全部在 `web/` 目录下：
1. `README.md` - 项目介绍和使用说明
2. `QUICKSTART.md` - 快速启动指南
3. `PROJECT_SUMMARY.md` - 项目总结
4. `CURRENT_STATUS.md` - 当前状态详情
5. `ROADMAP.md` - 优化路线图（4个 Phase）
6. `IMPLEMENTATION_GUIDE_PHASE1.md` - Phase 1 实施指南
7. `NEXT_STEPS.md` - 下一步行动计划

---

## 🚀 优化路线图（按优先级）

用户希望按照以下顺序进行优化：

### Phase 1: 国际化 (i18n) - 英语支持 🔴 最高优先级
- **目标**: 支持中英文切换，扩大国际用户群
- **时间**: 3-5 天
- **复杂度**: ⭐⭐⭐ 中等
- **详细指南**: 见 `IMPLEMENTATION_GUIDE_PHASE1.md`
- **技术**: next-intl

### Phase 2: 批量文件分析 UI 🔴 高优先级
- **目标**: 前端支持多文件上传（后端 API 已实现）
- **时间**: 2-3 天
- **复杂度**: ⭐⭐ 简单
- **关键点**: 
  - 修改 `FileUpload` 组件支持多文件
  - 创建 `BatchResultsDisplay` 组件
  - 添加进度显示和结果导出（CSV/Excel）

### Phase 3: 结果下载功能 🟡 中优先级
- **目标**: 用户可下载分析的原始数据
- **时间**: 1-2 天
- **复杂度**: ⭐ 简单
- **格式**: JSON, CSV, PDF（可选）

### Phase 4: 云存储文件源支持 🟡 中优先级
- **目标**: 支持从云存储（S3/OSS）读取 CZI 文件进行分析
- **注意**: ⚠️ **不是保存结果到云端，是从云端下载文件来分析**
- **时间**: 2-3 天
- **复杂度**: ⭐⭐⭐ 中等
- **技术**: boto3 (AWS S3), oss2 (阿里云), 预签名 URL

---

## 📁 重要文件位置

### 前端核心文件
```
web/
├── app/
│   ├── layout.tsx              # 根布局
│   ├── page.tsx                # 首页
│   ├── analyze/page.tsx        # 分析页面 ⭐ 主要工作区
│   └── docs/page.tsx           # 文档页面
├── components/
│   ├── FileUpload.tsx          # 文件上传组件 ⭐ Phase 2 需修改
│   ├── AnalysisForm.tsx        # 参数表单
│   ├── ResultsDisplay.tsx      # 结果展示 ⭐ Phase 3 需修改
│   └── ui/                     # 基础 UI 组件
├── lib/
│   ├── api.ts                  # API 客户端 ⭐ Phase 4 需扩展
│   └── utils.ts                # 工具函数
└── [文档文件].md               # 7个项目文档
```

### 后端核心文件
```
根目录/
├── api.py                      # FastAPI 应用 ⭐ Phase 4 需修改
├── analyzer.py                 # 核心分析模块
└── requirements.txt            # Python 依赖
```

---

## 💡 关键上下文信息

### 用户需求理解

1. **国际化 (i18n)**
   - 用户明确要求支持英语，作为第一外语
   - 所有界面文本需要翻译（约200+条）
   - 科学术语需要专业翻译

2. **批量分析**
   - 后端 `/batch-analyze` API 已完全实现
   - 前端当前只支持单文件（`maxFiles={1}`）
   - 需要前端界面支持多文件上传和批量结果展示

3. **结果下载**
   - 用户希望下载**分析的原始数据结果**（JSON, CSV 等）
   - 不是下载上传的 CZI 文件
   - 可选生成 PDF 报告

4. **云存储支持** ⚠️ 重要理解
   - **不是**保存分析结果到云端
   - **而是**支持从云存储（S3、OSS）**下载 CZI 文件**进行分析
   - 使用场景：用户的 CZI 文件已在云端，文件过大不便上传
   - 实现方式：用户提供预签名 URL，后端下载后分析

### 用户偏好
- ✅ 修改现有文件，不要创建新文档（7个文档已足够）
- ✅ 优先实施 Phase 1 (i18n)，影响最大
- ✅ 按照 Phase 1 → 2 → 3 → 4 顺序执行
- ✅ 保持代码质量和类型安全（TypeScript）

---

## 🔧 开发环境信息

### 启动命令

**后端**:
```bash
cd /home/vncl/projects/blackpig/apps/saas/bioinfo/mitochondrial_protein_fluorescence_intensity_analysis
source .venv/bin/activate
uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

**前端**:
```bash
cd /home/vncl/projects/blackpig/apps/saas/bioinfo/mitochondrial_protein_fluorescence_intensity_analysis/web
npm run dev
```

### 终端状态
- Terminal ID: e4750eaa-89b7-49b3-856a-b17aef0a5920 (前端 dev server 运行中)
- 其他终端可用于执行命令

### 环境配置
- Node.js 18+
- Python 3.12+
- 虚拟环境: `.venv/`
- 环境变量: `web/.env.local`

---

## 📚 快速上手指南

### 第一步：了解项目

阅读以下文档（按顺序）：
1. `NEXT_STEPS.md` - 了解下一步要做什么
2. `CURRENT_STATUS.md` - 了解当前详细状态
3. `ROADMAP.md` - 了解完整的优化计划
4. `IMPLEMENTATION_GUIDE_PHASE1.md` - 如果开始 Phase 1

### 第二步：检查运行状态

```bash
# 检查前端服务
curl http://localhost:3001

# 检查后端服务
curl http://localhost:8000/health
```

### 第三步：查看关键文件

```bash
cd web

# 查看分析页面（主要工作区）
cat app/analyze/page.tsx

# 查看 API 客户端
cat lib/api.ts

# 查看文件上传组件
cat components/FileUpload.tsx
```

### 第四步：开始实施

根据用户当前需求，执行相应的 Phase：

**如果用户说"开始 i18n" 或 "开始 Phase 1"**:
1. 阅读 `IMPLEMENTATION_GUIDE_PHASE1.md`
2. 安装 next-intl: `npm install next-intl`
3. 创建翻译文件 `messages/zh.json` 和 `messages/en.json`
4. 按指南逐步实施

**如果用户说"实现批量分析"**:
1. 修改 `components/FileUpload.tsx`，支持 `maxFiles > 1`
2. 在 `app/analyze/page.tsx` 添加模式切换（single/batch）
3. 创建批量结果展示组件
4. 调用已存在的 `api.batchAnalyze()` 方法

**如果用户说"添加下载功能"**:
1. 在 `components/ResultsDisplay.tsx` 添加下载按钮
2. 实现 JSON/CSV 导出逻辑
3. 使用 Blob API 创建下载

**如果用户说"支持云存储文件"**:
1. 后端 `api.py` 添加云存储下载逻辑（boto3/oss2）
2. 修改 `/analyze` 端点，支持 `cloud_source` 参数
3. 前端添加文件源切换（local/cloud）
4. 添加 URL 输入框

---

## ⚠️ 重要注意事项

### 关于云存储的正确理解
```
❌ 错误理解: 将分析结果保存到 S3，生成下载链接
✅ 正确理解: 从 S3 下载 CZI 文件，然后进行分析

用户的意图是:
- 用户的 CZI 文件存储在云端（S3/OSS）
- 文件太大，不想手动下载再上传
- 希望直接提供云存储 URL，让系统自动下载并分析
```

### 不要创建新文档
- ✅ 修改现有的 7 个文档
- ❌ 不要创建额外的文档文件
- 用户认为当前文档已经足够完善

### 保持代码质量
- ✅ 使用 TypeScript 类型
- ✅ 保持代码风格一致
- ✅ 添加必要的错误处理
- ✅ 遵循 Next.js 和 React 最佳实践

### 测试建议
- 每个功能实现后都要测试
- 检查 TypeScript 编译错误
- 验证 API 调用是否正确
- 确保响应式布局正常

---

## 🎯 用户期望

### 优先级
1. 🔴 **Phase 1 (i18n)** - 最高优先级，影响最大
2. 🔴 **Phase 2 (批量分析)** - 高优先级，提升效率
3. 🟡 **Phase 3 (结果下载)** - 中优先级，增强价值
4. 🟡 **Phase 4 (云存储源)** - 中优先级，便利性

### 时间目标
- Phase 1-3: 2-3 周完成
- 全部功能: 1 个月内完成

### 质量要求
- 代码类型安全（TypeScript）
- 用户体验流畅
- 错误处理完善
- 文档保持更新

---

## 📞 常见问题快速参考

**Q: 用户提到"云存储"是什么意思？**
A: 是指从云端**下载 CZI 文件**来分析，不是保存结果到云端。

**Q: 批量分析的后端 API 实现了吗？**
A: 是的，`/batch-analyze` 端点已完全实现，只需要前端 UI。

**Q: 如何开始 i18n？**
A: 阅读 `IMPLEMENTATION_GUIDE_PHASE1.md`，有完整的步骤。

**Q: 文件在哪里？**
A: 前端在 `web/` 目录，后端在项目根目录。

**Q: 需要创建新文档吗？**
A: 不需要，修改现有的 7 个文档即可。

**Q: 如何测试功能？**
A: 访问 http://localhost:3001 测试前端，http://localhost:8000/docs 测试 API。

---

## 🚀 建议的第一句话

当用户继续工作时，你可以说：

> "欢迎回来！我已经了解了项目的完整状态。当前项目是**线粒体蛋白荧光强度分析平台**，MVP 已完成并运行在 localhost:3001（前端）和 localhost:8000（后端）。
> 
> 根据优化路线图，有 **4 个 Phase** 待实施，优先级最高的是 **Phase 1: 国际化 (i18n)**，支持英语。
> 
> 我已经阅读了所有 7 个文档，理解了：
> - ✅ 批量分析后端已实现，需要前端 UI
> - ✅ 云存储是指**从云端下载 CZI 文件**来分析（不是保存结果）
> - ✅ 不需要创建新文档，修改现有文档即可
> 
> 您想从哪个 Phase 开始？或者需要我先做什么？"

---

## 📋 状态检查清单

在开始工作前，检查：
- [ ] 前端服务运行正常 (localhost:3001)
- [ ] 后端服务运行正常 (localhost:8000)
- [ ] 已阅读 `NEXT_STEPS.md`
- [ ] 已阅读 `ROADMAP.md`
- [ ] 理解云存储的正确含义
- [ ] 知道用户的优先级顺序
- [ ] 了解项目文件结构

---

**最后更新**: 2025-10-08  
**项目版本**: v1.0.0  
**下一个 AI**: 请基于此 prompt 快速接手项目，理解上下文，继续优化工作。祝你好运！🚀
