const { contextBridge, ipcRenderer } = require('electron');

// 暴露ipcRenderer给渲染进程
contextBridge.exposeInMainWorld('electron', {
  chooseVideoSource: () => ipcRenderer.invoke('choose-video-source'),
  generateSubtitle: (params) => ipcRenderer.invoke('generate-subtitle', params),
  onSubtitleProgress: (callback) => 
    ipcRenderer.on('subtitle-progress', (_, progress) => callback(progress)),
  onSubtitleComplete: (callback) => 
    ipcRenderer.on('subtitle-complete', (_, path) => callback(path)),
  onSubtitleError: (callback) => 
    ipcRenderer.on('subtitle-error', (_, error) => callback(error)),
  // 新增状态消息通道
  onSubtitleStatus: (callback) => 
    ipcRenderer.on('subtitle-status', (_, status) => callback(status)),
  // 添加字幕文件读写功能
  readSubtitleFile: (filePath) => ipcRenderer.invoke('read-subtitle-file', filePath),
  saveSubtitleFile: (filePath, content) => ipcRenderer.invoke('save-subtitle-file', filePath, content),
  // 添加打开字幕文件所在目录的功能
  openSubtitleDirectory: (filePath) => ipcRenderer.invoke('open-subtitle-directory', filePath),
  // 添加保存字幕完成事件监听器
  onSubtitleSaved: (callback) => {
    ipcRenderer.on('subtitle-saved', (event, data) => {
      callback(data);
    });
  },
  removeListener:() => {
    ipcRenderer.removeAllListeners('subtitle-progress');
    ipcRenderer.removeAllListeners('subtitle-complete');
    ipcRenderer.removeAllListeners('subtitle-error');
    ipcRenderer.removeAllListeners('subtitle-status');  // 添加新通道的监听器移除
  }
});
