const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

// 在开发环境中启用调试工具
const isDev = process.env.ELECTRON_START_URL ? true : false;
const isDebug = process.env.ELECTRON_DEBUG === 'true';
const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');

// 处理生产环境中的错误
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow = null;

const createWindow = async () => {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    backgroundColor: '#222',
    show: false,
    title: "AI字幕生成",
  });

  if (isDev) {
    // 安装 React 开发者工具
    if (isDebug) {
        try {
          await installExtension(REACT_DEVELOPER_TOOLS)
            .then((name) => console.log(`已添加扩展: ${name}`))
            .catch((err) => console.log('无法安装扩展: ', err));
        } catch (e) {
          console.error('安装开发者工具时出错:', e);
        }
      }

    mainWindow.loadURL('http://localhost:3000');

    // 打开开发者工具
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../build/index.html'));
  }

  // 优雅显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
};

// 当Electron完成初始化时创建窗口
app.whenReady().then(async () => {
  await createWindow();

  app.on('activate', () => {
    // 在macOS上，当点击dock图标且没有其他窗口打开时，通常会重新创建一个窗口
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 当所有窗口关闭时退出，除了在macOS上
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 选择视频文件
ipcMain.handle('choose-video-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: '视频文件', extensions: ['mp4', 'mkv', 'avi', 'mov', 'flv'] }]
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  
  return null;
});

// 选择视频目录
ipcMain.handle('choose-video-dir', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  
  return null;
});

// 生成字幕（调用Python后端）
ipcMain.handle('generate-subtitle', async (event, params) => {

// 添加参数验证
  if (!params || !params.videoPath) {
    const errorMsg = '缺少必要参数: videoPath';
    console.error(errorMsg);
    mainWindow.webContents.send('subtitle-error', errorMsg);
    return false;
  }

  const { videoPath, targetLanguage = 'zh-CN', format = 'srt' } = params;

  console.log(`生成字幕: ${__dirname}, ${videoPath}, ${targetLanguage}, ${format}`);

  // 获取项目根目录
  const rootPath = path.join(__dirname, '../../');
  
  // 启动Python进程
  const pythonProcess = spawn('python', [
    path.join(rootPath, 'backend/generate_subtitle.py'),
    videoPath,
    targetLanguage,
    format
  ]);

  let progress = 0;

  // 监听Python输出的进度
  pythonProcess.stdout.on('data', (data) => {
    const message = data.toString().trim();
    
    if (message.startsWith('PROGRESS:')) {
      progress = parseInt(message.split(':')[1], 10);
      console.log(`字幕处理进度: ${progress}%`);
      mainWindow.webContents.send('subtitle-progress', progress);
    } else if (message.startsWith('COMPLETE:')) {
      const subtitlePath = message.split(':')[1];
      console.log(`字幕生成完成: ${subtitlePath}`);
      mainWindow.webContents.send('subtitle-complete', subtitlePath);
    } else {
      // 记录其他输出但不发送到渲染进程
      console.log(`Python输出: ${message}`);
    }
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`错误: ${data}`);
    mainWindow.webContents.send('subtitle-error', data.toString());
  });

  return true;
});
