import React, { useState, useEffect } from 'react';
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
  font-size: 14px;
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

  // 当字幕路径变化时加载字幕内容
  useEffect(() => {
    const loadSubtitle = async () => {
      if (subtitlePath) {
        try {
          const subtitleContent = await window.electron.readSubtitleFile(subtitlePath);
          setContent(subtitleContent);
          setMessage('字幕已加载');
        } catch (error) {
          console.error('加载字幕失败:', error);
          setMessage(`加载字幕失败: ${error.message}`);
        }
      }
    };

    loadSubtitle();
  }, [subtitlePath]);

  const handleSave = async () => {
    if (!subtitlePath) return;
    
    setIsSaving(true);
    try {
      const success = await onSave(subtitlePath, content);
      if (success) {
        setMessage('字幕保存成功！');
      }
    } catch (error) {
      console.error('保存字幕失败:', error);
      setMessage(`保存字幕失败: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

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
      
      {error && (
        <ErrorMessage>{error}</ErrorMessage>
      )}
      
      {message && !isGenerating && (
        <SuccessMessage>{message}</SuccessMessage>
      )}
      
      {/* 编辑区域 */}
      <TextArea 
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={isGenerating ? "字幕生成中..." : "字幕内容将显示在这里..."}
        disabled={isGenerating}
      />
      
      {/* 按钮区域 */}
      <ButtonContainer>
        <Button 
          onClick={handleSave} 
          disabled={isGenerating || isSaving || !subtitlePath}
        >
          {isSaving ? '保存中...' : '保存修改'}
        </Button>
      </ButtonContainer>
    </EditorContainer>
  );
}

export default SubtitleEditor;
