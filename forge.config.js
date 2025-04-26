module.exports = {
  packagerConfig: {
    asar: true,
    extraResource: [
      './extraResources'  // 使用专门的资源目录
    ],
    icon: './assets/icon', // 应用图标
    // 添加以下配置确保构建产物包含所有必要文件
    ignore: [
      /^\/\.git/,
      /^\/\.vscode/,
      /^\/node_modules\/(?!react-scripts)/, // 保留react-scripts，排除其他node_modules
      /^\/backend\/(venv|__pycache__)/
    ],
    // 确保资源正确复制
    prune: false
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-dmg',  // 添加DMG制作器
      config: {
        format: 'ULFO',
        name: "AI字幕生成"
      },
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
  // 确保打包时正确处理资源文件
  hooks: {
    packageAfterCopy: async (config, buildPath, electronVersion, platform, arch) => {
      const fs = require('fs');
      const path = require('path');
      
      // 创建目录结构
      console.log(`打包钩子: 正在准备资源目录: ${buildPath}`);
      
      // 确保extraResources目录存在
      const extraResourcesDir = path.join(buildPath, 'extraResources');
      const backendDir = path.join(extraResourcesDir, 'backend');
      
      if (!fs.existsSync(extraResourcesDir)) {
        fs.mkdirSync(extraResourcesDir, { recursive: true });
      }
      
      if (!fs.existsSync(backendDir)) {
        fs.mkdirSync(backendDir, { recursive: true });
      }
      
      // 复制Python后端文件
      const sourceDir = path.join(process.cwd(), 'extraResources', 'backend');
      if (fs.existsSync(sourceDir)) {
        const files = fs.readdirSync(sourceDir);
        console.log(`打包钩子: 找到源文件: ${files.join(', ')}`);
        
        for (const file of files) {
          const sourcePath = path.join(sourceDir, file);
          const destPath = path.join(backendDir, file);
          
          if (fs.statSync(sourcePath).isFile()) {
            fs.copyFileSync(sourcePath, destPath);
            console.log(`打包钩子: 复制文件 ${file} 到 ${destPath}`);
            
            // 如果是可执行文件，设置执行权限
            if (file === 'subtitle_generator' || file.endsWith('.sh')) {
              try {
                fs.chmodSync(destPath, '755');
                console.log(`打包钩子: 设置可执行权限 ${destPath}`);
              } catch (err) {
                console.error(`打包钩子: 设置执行权限失败: ${err}`);
              }
            }
          }
        }
      } else {
        console.warn(`打包钩子: 源目录不存在: ${sourceDir}`);
      }
    }
  }
};
