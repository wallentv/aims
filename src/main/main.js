const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');

// 在开发环境中启用调试工具
const isDev = process.env.ELECTRON_START_URL ? true : false;
const isDebug = process.env.ELECTRON_DEBUG === 'true';
const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');

// 处理生产环境中的错误
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow = null;

// 检查whisper模型是否已下载
function getWhisperModelPath() {
  const homeDir = os.homedir();
  // whisper模型通常保存在用户目录下的.cache/whisper目录中
  const modelDir = path.join(homeDir, '.cache', 'whisper');
  return modelDir;
}

// 检查模型是否已下载
function isWhisperModelDownloaded(modelName = 'base') {
  const modelDir = getWhisperModelPath();
  const modelFiles = [
    `${modelName}.pt`,
    `${modelName}.bin` // 某些版本可能使用.bin文件
  ];
  
  try {
    if (!fs.existsSync(modelDir)) {
      return false;
    }
    
    // 检查是否至少有一个模型文件存在
    return modelFiles.some(file => fs.existsSync(path.join(modelDir, file)));
  } catch (error) {
    console.error('检查Whisper模型时出错:', error);
    return false;
  }
}

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

// 修改文件选择过滤器，支持音频文件
ipcMain.handle('choose-video-source', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: '媒体文件', extensions: ['mp4', 'mkv', 'avi', 'mov', 'flv', 'mp3', 'wav', 'ogg', 'm4a'] }
    ]
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  
  return null;
});

// 修改生成字幕逻辑，支持音频文件
ipcMain.handle('generate-subtitle', async (event, params) => {

  // 添加参数验证
  if (!params || !params.videoPath) {
    const errorMsg = '缺少必要参数: videoPath';
    console.error(errorMsg);
    mainWindow.webContents.send('subtitle-error', errorMsg);
    return false;
  }

  // 修改默认模型为精度最高的 "large-v3"
  const { videoPath, targetLanguage = 'zh-CN', format = 'srt', modelSize = 'large-v3' } = params;

  console.log(`生成字幕: ${__dirname}, ${videoPath}, ${targetLanguage}, ${format}`);

  // 获取项目根目录
  const rootPath = path.join(__dirname, '../../');
  
  // 判断是否为音频文件
  const isAudioFile = ['mp3', 'wav', 'ogg', 'm4a'].some(ext => videoPath.endsWith(`.${ext}`));

  // 判断是否在打包环境中运行
  const isPacked = app.isPackaged;
  let pythonExecutable = 'python';
  let scriptPath = path.join(rootPath, 'backend/generate_subtitle.py');
  
  // 在打包环境中使用shell脚本启动
  if (isPacked) {
    if (process.platform === 'darwin') {
      pythonExecutable = path.join(process.resourcesPath, 'extraResources', 'backend', 'subtitle_generator');
      scriptPath = ''; // 脚本会在shell脚本中调用
      // 确保可执行权限
      try {
        const fs = require('fs');
        fs.chmodSync(pythonExecutable, '755');
        console.log(`已设置可执行权限: ${pythonExecutable}`);
      } catch (err) {
        console.error(`设置可执行权限失败: ${err}`);
      }
    } else if (process.platform === 'win32') {
      // Windows环境
      pythonExecutable = path.join(process.resourcesPath, 'extraResources', 'backend', 'subtitle_generator.exe');
      scriptPath = '';
    }
  }

  // 检查模型状态并提醒用户
  const modelDownloaded = isWhisperModelDownloaded(modelSize);
  if (!modelDownloaded) {
    console.log(`Whisper模型尚未下载，将在首次运行时自动下载`);
    mainWindow.webContents.send('subtitle-status', `Whisper ${modelSize} 模型尚未下载，将在首次运行时自动下载，请保持网络连接并耐心等待。`);
  }

  // 修改：改进命令行参数构造方法，避免传递空字符串
  const spawnArgs = [];
  
  if (isPacked) {
    // 添加必要的位置参数
    spawnArgs.push(videoPath, targetLanguage, format);
  } else {
    // 非打包环境下先添加脚本路径
    spawnArgs.push(scriptPath, videoPath, targetLanguage, format);
  }
  
  // 仅当处理音频文件时才添加--audio参数
  if (isAudioFile) {
    spawnArgs.push('--audio');
  }
  
  // 添加模型参数
  spawnArgs.push(`--model=${modelSize}`);

  // 启动Python进程
  console.log(`启动命令: ${pythonExecutable} ${spawnArgs.join(' ')}`);
  const pythonProcess = isPacked
    ? spawn(pythonExecutable, spawnArgs)
    : spawn(pythonExecutable, spawnArgs);

  let progress = 0;
  let isDownloadingModel = false;

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
    } else if (message.includes('Downloading') && message.includes('whisper')) {
      // 检测到模型下载信息
      isDownloadingModel = true;
      console.log(`正在下载Whisper模型: ${message}`);
      mainWindow.webContents.send('subtitle-status', `正在下载Whisper模型，请耐心等待...`);
    } else {
      // 将一些重要信息发送到渲染进程
      console.log(`Python输出: ${message}`);
      
      // 将包含关键词的状态信息发送给渲染进程
      const statusKeywords = ['正在加载', '提取音频', '开始转录', '视频时长', '生成字幕', '下载模型'];
      if (statusKeywords.some(keyword => message.includes(keyword)) || isDownloadingModel) {
        mainWindow.webContents.send('subtitle-status', message);
      }
    }
  });

  pythonProcess.stderr.on('data', (data) => {
    const errorMessage = data.toString();
    // 过滤掉FP16警告
    if (errorMessage.includes("FP16 is not supported on CPU; using FP32 instead")) {
      console.log("忽略警告:", errorMessage);
      return;
    }
    
    console.error(`错误: ${errorMessage}`);
    mainWindow.webContents.send('subtitle-error', errorMessage);
  });

  return true;
});

// 添加文件读写IPC处理函数
ipcMain.handle('read-subtitle-file', async (event, filePath) => {
  try {
    const fs = require('fs').promises;
    const content = await fs.readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error('读取字幕文件失败:', error);
    throw new Error(`读取字幕文件失败: ${error.message}`);
  }
});

ipcMain.handle('save-subtitle-file', async (event, filePath, content) => {
  try {
    const fs = require('fs').promises;
    await fs.writeFile(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error('保存字幕文件失败:', error);
    throw new Error(`保存字幕文件失败: ${error.message}`);
  }
});

// 添加打开字幕文件所在目录的处理函数
ipcMain.handle('open-subtitle-directory', async (event, filePath) => {
  try {
    // 使用shell.showItemInFolder来在文件管理器中显示文件
    shell.showItemInFolder(filePath);
    return true;
  } catch (error) {
    console.error('打开字幕文件目录失败:', error);
    throw new Error(`打开字幕文件目录失败: ${error.message}`);
  }
});
