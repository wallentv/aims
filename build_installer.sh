#!/bin/bash

# 一键打包脚本
echo "===== 开始 AI字幕生成 应用打包过程 ====="

# 设置错误时退出
set -e

# 1. 安装Node依赖
echo "安装Node依赖..."
npm install

# 2. 安装Python依赖
echo "配置Python环境..."
# 使用当前已激活的环境，不尝试再次激活
if [[ -z "${CONDA_PREFIX}" ]]; then
  echo "警告: 没有检测到激活的Conda环境，请先运行 'conda activate aims'"
  exit 1
fi

echo "当前Python环境: ${CONDA_PREFIX}"
echo "安装Python打包依赖..."
pip install pyinstaller

# 3. 创建资产目录
echo "创建必要的目录..."
mkdir -p assets

# 4. 单独构建Python可执行文件
echo "构建Python后端..."
cd backend
python -m PyInstaller --clean --onefile --name subtitle_generator generate_subtitle.py
# 检查是否构建成功
if [ ! -f "dist/subtitle_generator" ]; then
  echo "Python后端构建失败"
  exit 1
fi
cd ..

# 5. 构建React应用
echo "构建React应用..."
npm run react-build

# 6. 准备应用资源
echo "准备应用资源..."
mkdir -p extraResources/backend
cp backend/dist/subtitle_generator extraResources/backend/

# 7. 打包macOS应用
echo "为macOS构建安装包..."
npm run build-macos

echo "===== 打包过程完成 ====="
if [ -d "out/make" ]; then
  echo "安装包位于: out/make/目录下"
else
  echo "打包可能未成功完成，请检查上面的错误信息"
fi
