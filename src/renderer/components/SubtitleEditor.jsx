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

const SuccessMessage = styled(StatusMessage)`
  border-left: 3px solid #2ecc71;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const OpenFolderButton = styled.button`
  background-color: transparent;
  color: ${props => props.theme.colors.secondary};
  border: 1px solid ${props => props.theme.colors.secondary};
  border-radius: ${props => props.theme.borderRadius};
  padding: 2px 8px;
  margin-left: 10px;
  cursor: pointer;
  font-size: 12px;
  
  &:hover {
    background-color: rgba(33, 134, 208, 0.1);
  }
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

function SubtitleEditor({ 
  subtitlePath, 
  isGenerating, 
  onSave,
  status,
  progress,
  error,
  stageText
}) {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loadError, setLoadError] = useState(null);
  const [loadAttempted, setLoadAttempted] = useState(false); 
  const [loadAttemptCount, setLoadAttemptCount] = useState(0);
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const loadedPathRef = useRef(null); // 用于跟踪已经加载过的路径

  // 当字幕路径变化时加载字幕内容
  useEffect(() => {
    // 只有当路径变化且和上次加载的路径不同时才重置加载状态
    if (subtitlePath && subtitlePath !== loadedPathRef.current) {
      console.log(`检测到新的字幕路径: ${subtitlePath}`);
      setLoadAttempted(false);
      setLoadAttemptCount(0);
    }
    
    const loadSubtitle = async () => {
      // 只有在有路径、未尝试加载过、并且和已加载路径不同时才加载
      if (subtitlePath && !loadAttempted && subtitlePath !== loadedPathRef.current) {
        console.log(`开始加载字幕文件: ${subtitlePath}`);
        setLoadAttempted(true);
        setLoadAttemptCount(prev => prev + 1);
        loadedPathRef.current = subtitlePath; // 记录当前加载的路径
        
        try {
          setLoadError(null);
          const subtitleContent = await window.electron.readSubtitleFile(subtitlePath);
          console.log(`成功读取字幕文件，内容长度: ${subtitleContent.length} 字符`);
          setContent(subtitleContent);
          setMessage(`字幕已加载: ${subtitlePath}`);
        } catch (error) {
          console.error('加载字幕失败:', error);
          setLoadError(`加载字幕失败: ${error.message}`);
          setMessage(`加载字幕失败: ${error.message}`);
          // 失败时清除已加载路径引用
          loadedPathRef.current = null;
        }
      }
    };

    loadSubtitle();
  }, [subtitlePath, loadAttempted]);

  // 监听进度状态，处理100%完成但未加载字幕的情况
  useEffect(() => {
    // 当进度达到100%且有字幕路径但未成功加载时，尝试重新加载
    if (progress === 100 && subtitlePath && 
        (loadError || !content) && 
        loadAttemptCount < 3 && 
        subtitlePath !== loadedPathRef.current) {
      console.log(`进度100%，但字幕未加载，尝试重新加载(${loadAttemptCount + 1}/3)`);
      // 延迟1秒后重试
      const timer = setTimeout(() => {
        setLoadAttempted(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [progress, subtitlePath, loadError, content, loadAttemptCount]);

  // 监听生成完成状态，确保字幕加载
  useEffect(() => {
    if (!isGenerating && subtitlePath) {
      // 如果生成已完成且有字幕路径，但加载失败或内容为空，尝试重新加载
      if ((loadError || !content) && loadAttemptCount < 3) {
        console.log('字幕生成已完成，但加载失败或为空，尝试重新加载');
        const timer = setTimeout(() => {
          setLoadAttempted(false);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [isGenerating, subtitlePath, loadError, content, loadAttemptCount]);

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
      // 但可以在 removeListener 里添加移除该监听器的逻辑
    };
  }, []);

  const handleSave = async () => {
    if (!subtitlePath) return;
    
    setIsSaving(true);
    try {
      const success = await onSave(subtitlePath, content);
      if (success) {
        setMessage(`字幕已保存: ${subtitlePath}`);
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
  const isLoading = subtitlePath && !content && !loadError && !isGenerating;

  return (
    <EditorContainer>
      {/* 显示进度和状态 - 只保留一个状态显示区域 */}
      {isGenerating && (
        <ProcessingContainer>
          <StatusMessage>
            <StatusLabel>当前状态:</StatusLabel> 
            <StatusValue>{stageText || '准备中...'}</StatusValue>
          </StatusMessage>
          <ProgressBar progress={progress} />
          <ProgressText>
            <span>进度:</span>
            <span>{progress}%</span>
          </ProgressText>
        </ProcessingContainer>
      )}
      
      {/* 处理已完成但未加载的情况 */}
      {isCompleted && !content && !loadError && (
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
      
      {/* 成功信息 */}
      {message && !isGenerating && content && (
        <SuccessMessage>
          <PathContainer>
            {message}
          </PathContainer>
        </SuccessMessage>
      )}
      
      {/* 编辑区域 */}
      <TextArea 
        value={content}
        onChange={(e) => setContent(e.target.value)}
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
