import React, { useState, useEffect } from 'react';
import ProgressBar from './ProgressBar.jsx';
import {
  ModuleContainer,
  ModuleHeader,
  ModuleToolbar,
  ModuleContent,
  TextEditor,
  ActionBar,
  ActionButton,
  StatusMessage,
  SaveTime,
  LoadingOverlay,
  Spinner,
  ProgressDisplay,
  ProgressHeader,
  ProgressInfo,
  ProgressValue,
  MinimalProgress,
  TimingInfo
} from '../styles/SharedStyles';
import styled from 'styled-components';

// 高级工具栏样式
const EnhancedToolbar = styled(ModuleToolbar)`
  background-color: ${props => props.theme.colors.surfaceLight};
  padding: 8px 12px;
  border-radius: ${props => props.theme.borderRadius};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 12px;
  flex-wrap: wrap;
`;

// 工具栏分组
const ToolbarGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:not(:last-child) {
    margin-right: 16px;
    padding-right: 16px;
    border-right: 1px solid rgba(0, 0, 0, 0.1);
  }
`;

// 工具栏右侧区域
const ToolbarRightSection = styled.div`
  margin-left: auto;
  display: flex;
  gap: 8px;
  align-items: center;
`;

// 文件信息显示
const FileInfo = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
`;

function SubtitleEditor({ 
  subtitlePath, 
  isGenerating, 
  onSave,
  status,
  progress,
  error,
  stageText,
  content,
  onContentChange
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loadError, setLoadError] = useState(null);
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  
  // 监听保存完成事件
  useEffect(() => {
    const handleSubtitleSaved = (data) => {
      console.log('字幕保存成功，时间：', data.saveTime);
      setLastSaveTime(data.saveTime);
      setShowSaveNotification(true);
      
      // 3秒后自动隐藏保存通知
      const timer = setTimeout(() => {
        setShowSaveNotification(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    };
    
    window.electron.onSubtitleSaved(handleSubtitleSaved);
    
    // 组件卸载时清除监听器
    return () => {
      // 这里无法直接删除特定的监听器，因为 electron API 没有提供移除单个监听器的方法
    };
  }, []);

  const handleSave = async () => {
    if (!subtitlePath || !content) return;
    
    setIsSaving(true);
    try {
      const success = await onSave(subtitlePath, content);
      if (!success) {
        setMessage('保存字幕失败');
      }
    } catch (error) {
      console.error('保存字幕失败:', error);
      setMessage(`保存字幕失败: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const openSubtitleFolder = () => {
    if (subtitlePath) {
      try {
        window.electron.openSubtitleDirectory(subtitlePath);
      } catch (error) {
        console.error("打开目录失败:", error);
        alert(`打开目录失败: ${error.message}`);
      }
    }
  };

  // 显示进度到100%时的完成状态
  const isCompleted = progress === 100 && !isGenerating;
  
  // 处理加载中状态
  const isLoading = subtitlePath && !content && !isGenerating;

  // 检查是否在转录阶段，此时只显示百分比
  const isTranscribingStage = isGenerating && status && status.includes('开始转录音频');

  // 获取当前应该显示的状态文本
  const getCurrentStatusText = () => {
    if (!stageText) return '处理中...';
    return stageText;
  };
  
  // 获取文件名（不含路径）的函数
  const getFileName = (path) => {
    if (!path) return '';
    return path.split(/[\/\\]/).pop();
  };

  return (
    <ModuleContainer>
      <ModuleHeader>
        <EnhancedToolbar>
          <ToolbarGroup>
            <ActionButton 
              onClick={handleSave} 
              disabled={isGenerating || isSaving || !subtitlePath || !content}
              title="保存当前字幕文件"
            >
              {isSaving ? '保存中...' : '保存'}
            </ActionButton>
            <ActionButton 
              onClick={openSubtitleFolder}
              disabled={!subtitlePath}
              title="在文件资源管理器中打开字幕文件目录"
            >
              打开目录
            </ActionButton>
            {showSaveNotification && (
              <StatusMessage success visible>
                ✓ 保存成功
              </StatusMessage>
            )}
          </ToolbarGroup>
          <ToolbarRightSection>
            {lastSaveTime && (
              <SaveTime>
                上次保存时间: {new Date(lastSaveTime).toLocaleTimeString()}
              </SaveTime>
            )}
          </ToolbarRightSection>
        </EnhancedToolbar>
      </ModuleHeader>
      
      {/* 根据不同状态显示不同的UI */}
      {isGenerating && (
        isTranscribingStage ? (
          // 转录阶段，最小化显示，只有百分比
          <MinimalProgress>
            <ProgressBar progress={progress} />
            <div className="progress-value">{progress}%</div>
          </MinimalProgress>
        ) : (
          // 其他阶段，显示状态和进度
          <ProgressDisplay>
            <ProgressHeader>
              <ProgressInfo>
                {getCurrentStatusText()}
                <ProgressValue>{progress}%</ProgressValue>
              </ProgressInfo>
            </ProgressHeader>
            <ProgressBar progress={progress} />
          </ProgressDisplay>
        )
      )}
      
      {/* 处理已完成但未加载的情况 */}
      {isCompleted && !content && (
        <StatusMessage success visible>
          正在加载生成的字幕文件...
        </StatusMessage>
      )}
      
      {/* 错误信息 */}
      {(error || loadError) && (
        <StatusMessage error visible>
          {error || loadError}
        </StatusMessage>
      )}
      
      {/* 编辑区域 */}
      <ModuleContent>
        <TextEditor 
          value={content || ''}
          onChange={(e) => onContentChange && onContentChange(e.target.value)}
          placeholder={
            isGenerating ? "字幕生成中..." : 
            isLoading ? "正在加载字幕..." : 
            subtitlePath ? "加载字幕失败，请重试..." : 
            "字幕内容将显示在这里..."
          }
          disabled={isGenerating}
          isMonospace={true}
          noMargin
        />
        
        {/* 加载状态 */}
        {isLoading && (
          <LoadingOverlay>
            <Spinner />
            <div>加载字幕内容...</div>
          </LoadingOverlay>
        )}
      </ModuleContent>
    </ModuleContainer>
  );
}

export default SubtitleEditor;
