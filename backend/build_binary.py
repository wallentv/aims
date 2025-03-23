"""
构建Python后端可执行文件的脚本
使用PyInstaller将Python脚本打包成可执行文件
"""

import os
import sys
import subprocess
import platform
import shutil

def main():
    print("开始构建Python后端可执行文件...")
    
    # 获取当前脚本所在目录
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 设置输出目录
    output_dir = os.path.join(current_dir, 'dist')
    os.makedirs(output_dir, exist_ok=True)
    
    # 检查临时目录和清理
    spec_file = os.path.join(current_dir, 'subtitle_generator.spec')
    if os.path.exists(spec_file):
        os.remove(spec_file)
    
    # 打包命令
    script_path = os.path.join(current_dir, 'generate_subtitle.py')
    
    # 获取操作系统类型
    system = platform.system()
    if system == 'Darwin':  # macOS
        executable_name = 'subtitle_generator'
    elif system == 'Windows':
        executable_name = 'subtitle_generator.exe'
    else:
        executable_name = 'subtitle_generator'
    
    # 简化PyInstaller命令，避免添加whisper缓存
    cmd = [
        'pyinstaller',
        '--clean',
        '--onefile',
        '--name', executable_name,
        '--distpath', output_dir,
        # 不再尝试添加whisper缓存
        script_path
    ]
    
    # 执行打包命令
    print(f"运行命令: {' '.join(cmd)}")
    try:
        subprocess.run(cmd, check=True)
        print(f"构建成功: {os.path.join(output_dir, executable_name)}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"构建失败: {e}")
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
