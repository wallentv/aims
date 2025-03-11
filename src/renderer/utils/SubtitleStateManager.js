/**
 * 字幕状态管理器
 * 负责处理字幕生成过程中的状态更新、进度追踪和错误处理
 */
class SubtitleStateManager {
  constructor(onStatusUpdate, onProgressUpdate, onComplete, onError) {
    this.status = '';
    this.progress = 0;
    this.error = null;
    this.completed = false;
    this.completedPath = null;
    
    // 回调函数
    this.onStatusUpdate = onStatusUpdate;
    this.onProgressUpdate = onProgressUpdate;
    this.onComplete = onComplete;
    this.onError = onError;
  }
  
  // 更新当前状态
  updateStatus(status) {
    this.status = status;
    if (this.onStatusUpdate) {
      this.onStatusUpdate(status);
    }
    console.log(`状态更新: ${status}`); // 添加日志便于调试
  }
  
  // 更新进度
  updateProgress(progress) {
    this.progress = progress;
    if (this.onProgressUpdate) {
      this.onProgressUpdate(progress);
    }
  }
  
  // 设置完成状态
  setCompleted(path) {
    this.completed = true;
    this.completedPath = path;
    this.updateStatus('已完成');
    if (this.onComplete) {
      this.onComplete(path);
    }
  }
  
  // 设置错误
  setError(error) {
    this.error = error;
    this.updateStatus('出错');
    if (this.onError) {
      this.onError(error);
    }
  }
  
  // 重置状态
  reset() {
    this.status = '初始化中';
    this.progress = 0;
    this.error = null;
    this.completed = false;
    this.completedPath = null;
    this.updateStatus(this.status);
  }
  
  // 获取基于状态的阶段文本
  getStageText() {
    if (!this.status) return '';
    
    switch (this.status.toLowerCase()) {
      case '初始化中':
        return '正在准备处理资源...';
      case '正在提取音频':
        return '正在从视频中提取音频内容...';
      case '音频处理中':
        return '正在处理音频数据，确保质量...';
      case '语音识别中':
        return '正在进行语音识别，这可能需要一些时间...';
      case '生成字幕中':
        return '正在生成字幕文件...';
      case '已完成':
        return '字幕生成完成！';
      default:
        return this.status;
    }
  }
}

export default SubtitleStateManager;
