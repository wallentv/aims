const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');

// 在开发环境中启用调试工具
const isDev = process.env.ELECTRON_START_URL ? true : false;
const isDebug = process.env.ELECTRON_DEBUG === 'true';

// 仅在开发环境中加载开发工具
let installExtension, REACT_DEVELOPER_TOOLS;
if (isDev) {
  try {
    const devTools = require('electron-devtools-installer');
    installExtension = devTools.default;
    REACT_DEVELOPER_TOOLS = devTools.REACT_DEVELOPER_TOOLS;
  } catch (e) {
    console.log('开发环境: electron-devtools-installer加载失败，已忽略');
  }
}

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
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    backgroundColor: '#222',
    show: false,
    title: "涡轮TV-AI字幕",
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

    // 添加开发者工具开关用于调试
    mainWindow.webContents.openDevTools();
  } else {
    // 修改路径解析方式，适应打包环境
    let indexPath;
    if (app.isPackaged) {
      // 在打包环境中使用正确的路径
      console.log('运行环境: 已打包');
      console.log('应用路径:', app.getAppPath());
      console.log('资源路径:', process.resourcesPath);
      console.log('当前目录:', __dirname);
      
      // 尝试使用更可靠的路径查找方式
      indexPath = path.join(app.getAppPath(), 'build', 'index.html');
      
      // 如果主路径不存在，尝试备用路径
      if (!fs.existsSync(indexPath)) {
        console.log(`主路径不存在: ${indexPath}，尝试备用路径`);
        
        // 备用路径列表
        const alternativePaths = [
          path.join(process.resourcesPath, '..', 'app.asar', 'build', 'index.html'),
          path.join(process.resourcesPath, 'app.asar', 'build', 'index.html'),
          path.join(process.resourcesPath, 'app', 'build', 'index.html'),
          path.join(__dirname, '../../build/index.html')
        ];
        
        // 遍历检查备用路径
        for (const altPath of alternativePaths) {
          console.log(`检查备用路径: ${altPath}`);
          if (fs.existsSync(altPath)) {
            indexPath = altPath;
            console.log(`找到有效路径: ${indexPath}`);
            break;
          }
        }
      }
      
      console.log('最终加载HTML路径:', indexPath);
    } else {
      // 本地开发非调试模式
      indexPath = path.join(__dirname, '../../build/index.html');
      console.log('本地生产模式加载HTML路径:', indexPath);
    }
    
    try {
      console.log('尝试加载HTML文件:', indexPath);
      console.log('文件是否存在:', fs.existsSync(indexPath));
      
      // 设置加载失败的错误处理
      mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('页面加载失败:', errorCode, errorDescription);
        // 显示错误信息
        mainWindow.webContents.loadURL(`data:text/html,<html><body><h2>加载失败</h2><p>错误代码: ${errorCode}</p><p>描述: ${errorDescription}</p><p>路径: ${indexPath}</p></body></html>`);
        // 打开开发者工具以便调试
        mainWindow.webContents.openDevTools();
      });
      
      mainWindow.loadFile(indexPath);
    } catch (err) {
      console.error('加载HTML文件时出错:', err);
      // 尝试备用方案
      const backupPath = path.join(__dirname, '../build/index.html');
      console.log('尝试备用路径:', backupPath);
      try {
        if (fs.existsSync(backupPath)) {
          mainWindow.loadFile(backupPath);
        } else {
          console.error('备用HTML路径也不存在');
          // 显示错误信息
          mainWindow.webContents.loadURL(`data:text/html,<html><body><h2>加载失败</h2><p>无法找到有效的HTML文件</p><p>尝试路径: ${indexPath}, ${backupPath}</p></body></html>`);
          // 打开开发者工具以便调试
          mainWindow.webContents.openDevTools();
        }
      } catch (backupErr) {
        console.error('加载备用HTML路径时出错:', backupErr);
      }
    }
  }

  // 优雅显示并确保窗口可见
  mainWindow.once('ready-to-show', () => {
    console.log('窗口准备好显示');
    mainWindow.show();
  });
  
  // 添加超时保护，确保窗口最终会显示
  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      console.log('应用窗口超时未显示，强制显示');
      mainWindow.show();
    }
  }, 5000);
  
  // 监听页面标题变化，用于调试
  mainWindow.webContents.on('page-title-updated', (event, title) => {
    console.log('页面标题更新:', title);
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

  const { videoPath, targetLanguage = 'zh-CN', format = 'srt', modelSize = 'large-v3', precision } = params;

  console.log(`生成字幕: ${__dirname}, ${videoPath}, ${targetLanguage}, ${format}, 精度: ${precision}`);

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
      // macOS环境下的路径处理
      console.log('检查可能的可执行文件路径:');
      const possibleExecutables = [
        path.join(process.resourcesPath, 'extraResources', 'backend', 'subtitle_generator'),
        path.join(app.getAppPath(), 'extraResources', 'backend', 'subtitle_generator'),
        path.join(__dirname, '../../extraResources/backend/subtitle_generator')
      ];
      
      let executableExists = false;
      for (const execPath of possibleExecutables) {
        try {
          console.log(`检查: ${execPath}`);
          if (fs.existsSync(execPath)) {
            pythonExecutable = execPath;
            executableExists = true;
            console.log(`找到可执行文件: ${pythonExecutable}`);
            // 确保可执行权限
            try {
              fs.chmodSync(pythonExecutable, '755');
              console.log(`已设置可执行权限: ${pythonExecutable}`);
            } catch (err) {
              console.error(`设置可执行权限失败: ${err}`);
            }
            break;
          }
        } catch (e) {
          console.log(`检查路径出错: ${e.message}`);
        }
      }
      
      // 如果找不到打包的可执行文件，尝试使用Python脚本直接运行
      if (!executableExists) {
        console.log('找不到打包的可执行文件，尝试使用Python脚本');
        const scriptPaths = [
          path.join(process.resourcesPath, 'extraResources', 'backend', 'generate_subtitle.py'),
          path.join(app.getAppPath(), 'extraResources', 'backend', 'generate_subtitle.py'),
          path.join(__dirname, '../../extraResources/backend/generate_subtitle.py')
        ];
        
        for (const sPath of scriptPaths) {
          try {
            console.log(`检查Python脚本: ${sPath}`);
            if (fs.existsSync(sPath)) {
              pythonExecutable = 'python';
              scriptPath = sPath;
              console.log(`找到Python脚本: ${scriptPath}`);
              break;
            }
          } catch (e) {
            console.log(`检查脚本路径出错: ${e.message}`);
          }
        }
      }
    } else if (process.platform === 'win32') {
      // Windows环境保持不变
      pythonExecutable = path.join(process.resourcesPath, 'extraResources', 'backend', 'subtitle_generator.exe');
      scriptPath = '';
    }
  }

  // 检查模型状态并提醒用户
  const modelDownloaded = isWhisperModelDownloaded(modelSize);
  if (!modelDownloaded) {
    console.log(`Whisper模型尚未下载，将在首次运行时自动下载`);
    // 注释掉或简化模型下载提醒
    // mainWindow.webContents.send('subtitle-status', `Whisper ${modelSize} 模型尚未下载，将在首次运行时自动下载，请保持网络连接并耐心等待。`);
  }

  // 准备启动参数 - 修改参数传递方式
  let baseArgs = [];
  if (isPacked) {
    baseArgs = [videoPath, targetLanguage, format];
  } else {
    baseArgs = [scriptPath, videoPath, targetLanguage, format];
  }
  
  // 添加可选参数
  const optionalArgs = [];
  if (isAudioFile) {
    optionalArgs.push('--audio');
  }
  
  // 添加精度参数，优先使用前端传来的精度设置
  if (precision) {
    optionalArgs.push(`--precision=${precision}`);
  } else if (modelSize) {
    // 兼容旧方式，如果没有传递精度，使用模型大小
    optionalArgs.push(`--model=${modelSize}`);
  }
  
  const spawnArgs = [...baseArgs, ...optionalArgs];

  // 启动Python进程
  console.log(`启动命令: ${pythonExecutable} ${spawnArgs.join(' ')}`);
  const pythonProcess = spawn(pythonExecutable, spawnArgs);

  let progress = 0;
  let isDownloadingModel = false;
  let isTranscribing = false; // 标记是否已进入转录阶段

  // 监听Python输出的进度
  pythonProcess.stdout.on('data', (data) => {
    const message = data.toString().trim();
    if (message.startsWith('PROGRESS:')) {
      progress = parseInt(message.split(':')[1], 10);
      console.log(`字幕处理进度: ${progress}%`);
      mainWindow.webContents.send('subtitle-progress', progress);
    } else if (message.startsWith('COMPLETE:')) {
      // 提取字幕文件路径，修正路径处理方式
      const lines = message.split('\n');
      // 找到以 COMPLETE: 开头的行并正确提取路径
      let subtitlePath = '';
      for (const line of lines) {
        if (line.trim().startsWith('COMPLETE:')) {
          subtitlePath = line.substring(line.indexOf(':') + 1).trim();
          break;
        }
      }
      
      console.log(`字幕生成完成，原始路径: ${subtitlePath}`);
      
      // 修复可能的路径问题
      subtitlePath = subtitlePath.replace(/(\r\n|\n|\r)/gm, "");
      
      // 去除可能附加在路径末尾的额外文本（如 "字幕生成完成: /path/to/file"）
      if (subtitlePath.includes('.srt') || subtitlePath.includes('.ssa') || subtitlePath.includes('.vtt')) {
        const extensions = ['.srt', '.ssa', '.vtt'];
        for (const ext of extensions) {
          const index = subtitlePath.indexOf(ext);
          if (index > 0) {
            subtitlePath = subtitlePath.substring(0, index + ext.length);
            break;
          }
        }
      }
      
      console.log(`处理后的字幕路径: ${subtitlePath}`);
      
      // 添加短暂延迟确保UI更新和文件系统同步
      setTimeout(() => {
        try {
          // 使用stat同步方法检查文件是否存在，更加可靠
          if (fs.statSync(subtitlePath).isFile()) {
            console.log(`发送完成信号到前端，文件路径: ${subtitlePath}`);
            mainWindow.webContents.send('subtitle-complete', subtitlePath);
            // 添加额外的状态更新
            mainWindow.webContents.send('subtitle-status', `字幕生成完成，保存至: ${subtitlePath}`);
          } else {
            const errorMsg = `字幕生成完成，但文件不是有效文件：${subtitlePath}`;
            console.error(errorMsg);
            mainWindow.webContents.send('subtitle-error', errorMsg);
          }
        } catch (err) {
          // 如果文件不存在，发送错误
          const errorMsg = `字幕生成完成，但文件未找到：${subtitlePath}，错误：${err.message}`;
          console.error(errorMsg);
          mainWindow.webContents.send('subtitle-error', errorMsg);
        }
      }, 1000); // 增加延迟到1000ms，给文件系统更多时间完成写入
    } else if (message.includes('Downloading') && message.includes('whisper')) {
      // 检测到模型下载信息
      isDownloadingModel = true;
      console.log(`正在下载Whisper模型: ${message}`);
      // 只在控制台记录，不发送到前端
    } else {
      // 将一些重要信息发送到渲染进程
      console.log(`Python输出: ${message}`);
      
      // 检查是否已经进入转录阶段
      if (message.includes('开始转录音频')) {
        isTranscribing = true; 
        console.log('已进入转录阶段，后续将只显示进度百分比');
        // 发送一次初始状态，然后后续只发送进度
        mainWindow.webContents.send('subtitle-status', '开始转录音频...');
      }
      
      // 如果已经进入转录阶段，不再发送状态文本
      if (isTranscribing) {
        // 在控制台记录但不发送到前端
        return;
      }
      
      // 对于转录前的阶段，继续发送状态更新
      const initialStageKeywords = ['提取音频', '音频提取完成', '视频时长', '媒体时长'];
      if (initialStageKeywords.some(keyword => message.includes(keyword))) {
        mainWindow.webContents.send('subtitle-status', message);
      }
      
      // 如果是模型相关消息，不发送到前端
      if (message.includes('正在加载模型') || message.includes('whisper') || isDownloadingModel) {
        console.log('模型相关操作:', message);
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
    // 检查文件路径是否存在
    console.log(`尝试读取字幕文件: ${filePath}`);
    
    const fsPromises = require('fs').promises;
    
    // 检查文件路径是否为字符串且非空
    if (!filePath || typeof filePath !== 'string') {
      const errMsg = `无效的文件路径: ${filePath}`;
      console.error(errMsg);
      throw new Error(errMsg);
    }
    
    // 检查文件是否存在
    try {
      const stats = await fsPromises.stat(filePath);
      if (!stats.isFile()) {
        throw new Error(`路径不是有效文件: ${filePath}`);
      }
    } catch (err) {
      console.error(`字幕文件不存在或无法访问: ${filePath}`, err);
      throw new Error(`字幕文件不存在或无法访问: ${err.message}`);
    }
    
    // 读取文件内容
    try {
      const content = await fsPromises.readFile(filePath, 'utf8');
      console.log(`成功读取字幕文件，内容长度: ${content.length} 字符`);
      
      // 检查内容是否为空
      if (!content || content.trim().length === 0) {
        console.warn(`字幕文件内容为空: ${filePath}`);
      }
      
      // 确保内容是字符串
      return content.toString();
    } catch (err) {
      console.error(`读取字幕文件内容失败: ${filePath}`, err);
      throw new Error(`读取字幕文件内容失败: ${err.message}`);
    }
  } catch (error) {
    console.error('读取字幕文件失败:', error);
    throw new Error(`读取字幕文件失败: ${error.message}`);
  }
});

ipcMain.handle('save-subtitle-file', async (event, filePath, content, summary) => {
  try {
    // 验证参数
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('无效的文件路径');
    }
    
    if (typeof content !== 'string') {
      throw new Error('内容必须是字符串类型');
    }
    
    console.log(`尝试保存字幕文件: ${filePath}, 内容长度: ${content.length}`);
    
    // 确保目录存在
    const dirPath = path.dirname(filePath);
    try {
      await fs.promises.mkdir(dirPath, { recursive: true });
    } catch (err) {
      console.warn(`创建目录失败: ${dirPath}, 可能已存在`, err);
      // 继续尝试保存文件
    }
    
    // 保存文件
    await fs.promises.writeFile(filePath, content, 'utf8');
    console.log(`字幕文件保存成功: ${filePath}`);
    
    // 获取当前时间并发送保存成功消息
    const saveTime = new Date().toLocaleString('zh-CN');
    // 包含summary参数在保存成功的消息中
    mainWindow.webContents.send('subtitle-saved', { saveTime, summary });
    
    return true;
  } catch (error) {
    console.error('保存字幕文件失败:', error);
    throw new Error(`保存字幕文件失败: ${error.message}`);
  }
});

// 添加打开字幕文件所在目录的处理函数
ipcMain.handle('open-subtitle-directory', async (event, filePath) => {
  try {
    // 验证路径
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('无效的文件路径');
    }
    
    console.log(`尝试打开文件目录: ${filePath}`);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      // 如果文件不存在，尝试打开其父目录
      const dirPath = path.dirname(filePath);
      if (fs.existsSync(dirPath)) {
        console.log(`文件不存在，尝试打开父目录: ${dirPath}`);
        shell.openPath(dirPath);
        return true;
      }
      throw new Error(`文件路径不存在: ${filePath}`);
    }
    
    // 使用shell.showItemInFolder来在文件管理器中显示文件
    shell.showItemInFolder(filePath);
    return true;
  } catch (error) {
    console.error('打开字幕文件目录失败:', error);
    throw new Error(`打开字幕文件目录失败: ${error.message}`);
  }
});
