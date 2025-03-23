#!/bin/bash

# 简化的macOS打包脚本
echo "===== 开始构建 AI字幕生成 macOS应用 ====="
set -e

# 确保已激活conda环境
if [[ -z "${CONDA_PREFIX}" ]]; then
  echo "错误: 未检测到激活的conda环境"
  echo "请先运行 'conda activate aims' 然后再次尝试"
  exit 1
fi

# 1. 创建目录结构
echo "准备目录结构..."
mkdir -p extraResources/backend

# 2. 生成启动器脚本（替代PyInstaller打包）
echo "生成Python启动器脚本..."
cat > extraResources/backend/run_whisper.sh << 'EOF'
#!/bin/bash
# 启动Python脚本的包装器
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
export PATH="$CONDA_PREFIX/bin:$PATH"
python "$DIR/generate_subtitle.py" "$@"
EOF

chmod +x extraResources/backend/run_whisper.sh

# 3. 复制Python脚本
echo "复制Python文件..."
cp backend/*.py extraResources/backend/

# 4. 构建React应用
echo "构建React应用..."
npm run react-build

# 5. 打包Electron应用
echo "打包Electron应用..."
npm run build-macos || {
  echo "打包失败"
  exit 1
}

echo "===== 打包完成 ====="
echo "安装包位于: out/make/ 目录"
