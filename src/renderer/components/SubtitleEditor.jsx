import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import ProgressBar from './ProgressBar.jsx';

const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const TextArea = styled.textarea`
  flex: 1;
  background-color: ${props => props.theme.colors.surfaceLight};
  color: ${props => props.theme.colors.text};
  border: none;
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.medium};
  font-family: monospace;
  resize: none;
  outline: none;
  font-size: 16px;
  line-height: 1.5;
  
  &:focus {
    box-shadow: inset 0 0 0 1px ${props => props.theme.colors.secondary};
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${props => props.theme.spacing.medium};
`;

const Button = styled.button`
  background-color: ${props => props.theme.colors.secondary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.small} ${props => props.theme.spacing.medium};
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  
  &:hover {
    background-color: #2186d0;
  }
  
  &:disabled {
    background-color: #606060;
    cursor: not-allowed;
  }
`;

const StatusMessage = styled.div`
  padding: ${props => props.theme.spacing.small};
  margin-bottom: ${props => props.theme.spacing.small};
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius};
  font-size: 13px;
  display: flex;
  align-items: center;
  border-left: 3px solid ${props => props.theme.colors.secondary};
`;

const ProcessingContainer = styled.div`
  background-color: ${props => props.theme.colors.surfaceLight};
  padding: ${props => props.theme.spacing.medium};
  border-radius: ${props => props.theme.borderRadius};
  margin-bottom: ${props => props.theme.spacing.medium};
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const StatusLabel = styled.span`
  font-weight: bold;
  margin-right: ${props => props.theme.spacing.small};
`;

const StatusValue = styled.span`
  color: ${props => props.theme.colors.secondary};
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 12px;
  margin-top: 4px;
`;

const StageText = styled.div`
  margin-top: 6px;
  color: ${props => props.theme.colors.text};
  font-size: 13px;
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  margin-bottom: ${props => props.theme.spacing.small};
  font-size: 13px;
  padding: ${props => props.theme.spacing.small};
  background-color: rgba(255, 107, 107, 0.1);
  border-radius: ${props => props.theme.borderRadius};
  border-left: 3px solid #ff6b6b;
`;

const PathContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

const SaveNotification = styled.div`
  background-color: rgba(46, 204, 113, 0.1);
  padding: ${props => props.theme.spacing.small};
  border-radius: ${props => props.theme.borderRadius};
  color: #2ecc71;
  font-size: 13px;
  display: flex;
  align-items: center;
  margin-right: 10px;
`;

const SaveTime = styled.span`
  font-weight: normal;
  margin-left: 5px;
`;

const ActionButton = styled.button`
  background-color: transparent;
  color: ${props => props.theme.colors.secondary};
  border: 1px solid ${props => props.theme.colors.secondary};
  border-radius: ${props => props.theme.borderRadius};
  padding: 4px 12px;
  margin-left: 10px;
  cursor: pointer;
  font-size: 13px;
  
  &:hover {
    background-color: rgba(33, 134, 208, 0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: #606060;
    color: #606060;
  }
`;

// 简单进度显示组件
const SimpleProgressDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing.medium};
  
  span {
    font-size: 16px;
    font-weight: bold;
    color: ${props => props.theme.colors.secondary};
    margin-top: 4px;
  }
`;

// 统一进度显示组件，适用于所有状态
const UnifiedProgressDisplay = styled.div`
  background-color: ${props => props.theme.colors.surfaceLight};
  padding: ${props => props.theme.spacing.small}; /* 减少内边距 */
  border-radius: ${props => props.theme.borderRadius};
  margin-bottom: ${props => props.theme.spacing.small}; /* 减少底部间距 */
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
`;

const StatusWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px; /* 减少间距 */
`;

const ProgressInfo = styled.div`
  display: flex;
  align-items: center;
  font-size: 13px; /* 减小字体 */
  color: ${props => props.theme.colors.secondary};
  font-weight: 500;
`;

const ProgressValue = styled.span`
  margin-left: auto;
  font-weight: bold;
`;

// 简化的纯百分比进度显示
const MinimalProgressDisplay = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 0; /* 减少顶部间距 */
  margin-bottom: ${props => props.theme.spacing.small}; /* 减少底部间距 */
  
  .progress-value {
    font-size: 20px;
    font-weight: bold;
    color: ${props => props.theme.colors.secondary};
    text-align: center;
    margin: 6px 0;
  }
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
        console.log("尝试打开目录:", subtitlePath);
        if (typeof window.electron.openSubtitleDirectory !== 'function') {
          console.error("openSubtitleDirectory 未定义，可用的方法:", Object.keys(window.electron));
          alert("打开目录功能暂时不可用，请完全重启应用后再试");
          return;
        }
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

  return (
    <EditorContainer>
      {/* 根据不同状态显示不同的UI，并优化显示内容，去掉冗余标题 */}
      {isGenerating && (
        isTranscribingStage ? (
          // 转录阶段，最小化显示，只有百分比
          <MinimalProgressDisplay>
            <ProgressBar progress={progress} />
            <div className="progress-value">{progress}%</div>
          </MinimalProgressDisplay>
        ) : (
          // 其他阶段，显示状态和进度，更加紧凑
          <UnifiedProgressDisplay>
            <StatusWrapper>
              <ProgressInfo>
                {getCurrentStatusText()}
                <ProgressValue>{progress}%</ProgressValue>
              </ProgressInfo>
            </StatusWrapper>
            <ProgressBar progress={progress} />
          </UnifiedProgressDisplay>
        )
      )}
      
      {/* 处理已完成但未加载的情况 - 精简显示 */}
      {isCompleted && !content && (
        <StatusMessage>
          <StatusLabel>加载中:</StatusLabel> 
          <StatusValue>正在加载生成的字幕文件...</StatusValue>
        </StatusMessage>
      )}
      
      {/* 错误信息 */}
      {(error || loadError) && (
        <ErrorMessage>
          {error || loadError}
        </ErrorMessage>
      )}
      
      {/* 编辑区域 */}
      <TextArea 
        value={content || ''}
        onChange={(e) => onContentChange && onContentChange(e.target.value)}
        placeholder={
          isGenerating ? "字幕生成中..." : 
          isLoading ? "正在加载字幕..." : 
          subtitlePath ? "加载字幕失败，请重试..." : 
          "字幕内容将显示在这里..."
        }
        disabled={isGenerating}
      />
      
      {/* 按钮区域 - 将所有按钮放在底部并统一样式 */}
      <ButtonContainer>
        {/* 保存成功提示 */}
        {showSaveNotification && lastSaveTime && (
          <SaveNotification>
            <span>✓ 保存成功</span>
            <SaveTime>保存时间: {lastSaveTime}</SaveTime>
          </SaveNotification>
        )}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {subtitlePath && (
            <ActionButton onClick={openSubtitleFolder}>
              打开目录
            </ActionButton>
          )}
          <ActionButton 
            onClick={handleSave} 
            disabled={isGenerating || isSaving || !subtitlePath || !content}
          >
            {isSaving ? '保存中...' : '保存'}
          </ActionButton>
        </div>
      </ButtonContainer>
    </EditorContainer>
  );
}

export default SubtitleEditor;
