module.exports = {
  packagerConfig: {
    asar: true,
    extraResource: [
      './extraResources'  // 使用专门的资源目录
    ],
    icon: './assets/icon', // 应用图标
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
  // 移除复杂的钩子，使用构建脚本代替
  hooks: {}
};
