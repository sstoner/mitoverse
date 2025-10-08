# Git Submodule 配置说明

## 仓库结构

本项目使用 Git Submodule 来管理前后端分离的代码：

### 主仓库（后端）

- **仓库**: https://github.com/sstoner/mitoverse.git
- **内容**: FastAPI 后端、Python 分析代码
- **目录**: `/home/vncl/projects/blackpig/apps/saas/bioinfo/mitochondrial_protein_fluorescence_intensity_analysis`

### Submodule（前端）

- **仓库**: https://github.com/sstoner/mitoverse-web.git
- **内容**: Next.js 前端应用
- **路径**: `web/` 目录

## 已完成的配置

### 1. 移除旧的 web 目录

```bash
# 从 git 索引中移除（保留了备份）
git rm -r --cached web
```

### 2. 添加 Submodule

```bash
# 添加正确的前端仓库作为 submodule
git submodule add https://github.com/sstoner/mitoverse-web.git web
```

### 3. 提交配置

```bash
# 提交 submodule 配置
git commit -m "chore: Setup web as submodule pointing to mitoverse-web repository"
```

## 验证结果

### ✅ Submodule 配置正确

```bash
$ cat .gitmodules
[submodule "web"]
        path = web
        url = https://github.com/sstoner/mitoverse-web.git
```

### ✅ Web 目录指向正确的仓库

```bash
$ cd web && git remote -v
origin  https://github.com/sstoner/mitoverse-web.git (fetch)
origin  https://github.com/sstoner/mitoverse-web.git (push)
```

### ✅ 必要文件都存在

```bash
$ ls web/
app/  components/  lib/  messages/  public/  ...
```

### ✅ 可以正常启动

```bash
$ cd web && npm run dev
✓ Ready in 964ms
Local: http://localhost:3000
```

## 日常使用

### 启动项目

```bash
# 1. 启动后端
cd /home/vncl/projects/blackpig/apps/saas/bioinfo/mitochondrial_protein_fluorescence_intensity_analysis
source .venv/bin/activate
uvicorn api:app --reload

# 2. 启动前端（新终端）
cd web
npm run dev
```

### 更新前端代码

```bash
# 进入 web 目录（submodule）
cd web

# 拉取最新代码
git pull origin master

# 如果有改动，返回主仓库提交 submodule 引用更新
cd ..
git add web
git commit -m "chore: Update web submodule"
git push
```

### 在前端仓库开发

```bash
# 进入 web 目录
cd web

# 创建分支开发
git checkout -b feature/new-feature

# 开发完成后提交到前端仓库
git add .
git commit -m "feat: Add new feature"
git push origin feature/new-feature

# 在 GitHub 创建 PR 合并到 mitoverse-web

# 合并后，在主仓库更新 submodule 引用
cd ..
git add web
git commit -m "chore: Update web submodule to latest"
git push
```

### 克隆项目（其他人）

```bash
# 方法1: 克隆时自动初始化 submodule
git clone --recurse-submodules https://github.com/sstoner/mitoverse.git

# 方法2: 先克隆，再初始化 submodule
git clone https://github.com/sstoner/mitoverse.git
cd mitoverse
git submodule init
git submodule update
```

## 备份位置

旧的 web 目录已备份到：

```
web_backup_20251008_180650/
```

如果需要恢复之前的任何更改，可以从这里找到。

## 注意事项

### ⚠️ HEAD Detached 状态

当前主仓库处于 detached HEAD 状态（在 commit `a77ba67`）。

如果需要在分支上工作：

```bash
# 切换回 master 分支
git checkout master

# 或创建新分支
git checkout -b fix/submodule-setup
```

### ⚠️ Submodule 的工作原理

- 主仓库只保存 submodule 的 **commit 引用**，不保存实际文件
- `web/` 目录是一个独立的 Git 仓库
- 在 web 目录内的改动需要先提交到 mitoverse-web，然后在主仓库更新引用

### ⚠️ .env 文件

确保在 web 目录配置正确的环境变量：

```bash
cd web
cp .env.example .env.local
# 编辑 .env.local 设置 API_URL
```

## 常见问题

### Q: 为什么 `cd web` 后 git 显示不同的仓库？

**A**: 因为 web 是一个 submodule，它是独立的 Git 仓库。在 web 目录内，所有 git 命令都作用于 mitoverse-web 仓库。

### Q: 如何同时更新前后端代码？

**A**:

1. 先在 web 目录提交前端改动到 mitoverse-web
2. 回到主目录提交后端改动和 submodule 引用到 mitoverse

### Q: Submodule 显示 modified，但我没改动？

**A**: Submodule 的 commit 引用改变了（可能是拉取了新代码）。运行：

```bash
git add web
git commit -m "chore: Update web submodule reference"
```

## 状态总结

✅ **已完成**:

- [x] 移除旧的嵌套 web 目录
- [x] 配置 web 为 submodule
- [x] 指向正确的前端仓库 (mitoverse-web)
- [x] 安装依赖并验证可以启动
- [x] 提交 submodule 配置

🚀 **可以开始工作了！**
