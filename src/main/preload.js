const { contextBridge, ipcRenderer } = require('electron');

// 暴露ipcRenderer给渲染进程
contextBridge.exposeInMainWorld('electron', {
  chooseVideoFile: () => ipcRenderer.invoke('choose-video-file'),
  chooseVideoDir: () => ipcRenderer.invoke('choose-video-dir'),
  generateSubtitle: (params) => ipcRenderer.invoke('generate-subtitle', params),
  onSubtitleProgress: (callback) => 
    ipcRenderer.on('subtitle-progress', (_, progress) => callback(progress)),
  onSubtitleComplete: (callback) => 
    ipcRenderer.on('subtitle-complete', (_, path) => callback(path)),
  onSubtitleError: (callback) => 
    ipcRenderer.on('subtitle-error', (_, error) => callback(error)),
  removeListener:() => {
    ipcRenderer.removeAllListeners('subtitle-progress');
    ipcRenderer.removeAllListeners('subtitle-complete');
    ipcRenderer.removeAllListeners('subtitle-error');
  }
});
