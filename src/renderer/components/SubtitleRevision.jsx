import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ModelSettingsModal from './ModelSettingsModal';

const RevisionContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const RevisionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.medium};
`;

const RevisionTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  color: ${props => props.theme.colors.text};
`;

const RevisionToolbar = styled.div`
  display: flex;
  gap: 8px;
`;

const RevisionContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const RevisionTextArea = styled.textarea`
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
  margin-bottom: ${props => props.theme.spacing.medium};
  
  &:focus {
    box-shadow: inset 0 0 0 1px ${props => props.theme.colors.secondary};
  }
`;

const RevisionSummary = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.medium};
  margin-bottom: ${props => props.theme.spacing.medium};
  border-left: 3px solid ${props => props.theme.colors.secondary};
  max-height: 150px;
  overflow-y: auto;
  font-size: 13px;
`;

const RevisionItem = styled.div`
  padding: ${props => props.theme.spacing.small};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  &.selected {
    background-color: rgba(62, 166, 255, 0.1);
    border-left: 3px solid ${props => props.theme.colors.secondary};
  }
`;

const ActionButton = styled.button`
  background-color: ${props => props.primary ? props.theme.colors.secondary : 'transparent'};
  color: ${props => props.primary ? 'white' : props.theme.colors.secondary};
  border: 1px solid ${props => props.primary ? 'transparent' : props.theme.colors.secondary};
  border-radius: ${props => props.theme.borderRadius};
  padding: 4px 12px;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: ${props => props.primary ? '#2186d0' : 'rgba(33, 134, 208, 0.1)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: #606060;
    color: #606060;
  }
`;

const ButtonIcon = styled.span`
  margin-right: 6px;
  font-size: 16px;
  display: flex;
  align-items: center;
`;

const RevisionActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${props => props.theme.spacing.medium};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 14px;
  text-align: center;
  padding: ${props => props.theme.spacing.large};
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 100;
  color: white;
  backdrop-filter: blur(3px);
`;

const Spinner = styled.div`
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 3px solid ${props => props.theme.colors.secondary};
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

function SubtitleRevision({ subtitlePath, initialContent, content, onContentChange, onSaveRevision }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [modelSettings, setModelSettings] = useState(null);
  const [hasSettings, setHasSettings] = useState(false);

  // 初始化修订内容（只有当内容为空且有初始内容时才设置）
  useEffect(() => {
    if (subtitlePath && initialContent && !content && onContentChange) {
      // 只在内容为空时初始化
      onContentChange(initialContent);
    }
  }, [subtitlePath, initialContent, content, onContentChange]);

  // 加载本地存储的模型设置
  useEffect(() => {
    try {
      const activeProvider = localStorage.getItem('activeProvider') || 'defaultProvider'; // 替换为默认提供商
      const allSettings = JSON.parse(localStorage.getItem('allModelSettings') || '{}');
      
      const settings = allSettings[activeProvider] || null;
      if (settings) {
        setModelSettings(settings);
        setHasSettings(Boolean(settings.apiKey && settings.apiUrl));
      }
    } catch (error) {
      console.error('加载模型设置出错:', error);
    }
  }, []);

  // 保存模型设置
  const handleSaveSettings = (settings) => {
    try {
      // 获取现有的所有设置
      const allSettings = JSON.parse(localStorage.getItem('allModelSettings') || '{}');
      
      // 为当前提供商更新设置
      allSettings[settings.provider] = settings;
      
      // 保存所有设置
      localStorage.setItem('allModelSettings', JSON.stringify(allSettings));
      
      // 同时更新当前活动设置
      localStorage.setItem('activeProvider', settings.provider);
      
      setModelSettings(settings);
      setHasSettings(Boolean(settings.apiKey && settings.apiUrl));
    } catch (error) {
      console.error('保存模型设置出错:', error);
    }
  };

  // 使用AI修订字幕
  const handleReviseSubtitle = async () => {
    if (!hasSettings || !content) {
      return;
    }

    setLoading(true);
    setSummary('');
    
    try {
      // 替换提示词模板中的字幕占位符
      const prompt = modelSettings.promptTemplate.replace('{{subtitle}}', content);
      
      // 准备API请求
      const response = await fetch(modelSettings.apiUrl + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${modelSettings.apiKey}`
        },
        body: JSON.stringify({
          model: modelSettings.modelId,
          messages: [
            { role: "user", content: prompt }
          ],
          temperature: 0.3
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || '请求失败，请检查您的API设置');
      }

      if (data.choices && data.choices.length > 0) {
        const result = data.choices[0].message.content;
        
        // 提取字幕和总结
        const summaryMarkers = [
          "总结:", "修订总结:", "字幕修订总结:", 
          "修改总结:", "总结：", "修订总结：",
          "修改总结：", "字幕修订总结："
        ];
        
        let revisedContent = result;
        let revisionSummary = '';

        // 查找总结部分
        for (const marker of summaryMarkers) {
          const index = result.indexOf(marker);
          if (index !== -1) {
            revisedContent = result.substring(0, index).trim();
            revisionSummary = result.substring(index).trim();
            break;
          }
        }
        
        // 更新字幕和总结
        if (onContentChange) {
          onContentChange(revisedContent);
        }
        setSummary(revisionSummary);
      }
    } catch (error) {
      console.error('AI修订字幕出错:', error);
      setSummary(`修订失败: ${error.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  // 保存修订后的字幕
  const handleSave = () => {
    if (onSaveRevision && subtitlePath && content) {
      onSaveRevision(subtitlePath, content);
    }
  };

  return (
    <RevisionContainer>
      <RevisionHeader>
        <RevisionTitle>字幕修订</RevisionTitle>
        <RevisionToolbar>
          <ActionButton 
            onClick={() => setSettingsModalOpen(true)}
            title="设置AI模型参数"
          >
            <ButtonIcon>
              <span role="img" aria-label="settings">⚙️</span>
            </ButtonIcon>
            设置
          </ActionButton>
          
          <ActionButton 
            primary 
            onClick={handleReviseSubtitle}
            disabled={!hasSettings || !content || loading}
            title={!hasSettings ? "请先配置AI模型" : "使用AI修订字幕"}
          >
            <ButtonIcon>
              <span role="img" aria-label="ai">✨</span>
            </ButtonIcon>
            AI修订
          </ActionButton>
        </RevisionToolbar>
      </RevisionHeader>
      
      {!subtitlePath ? (
        <EmptyState>
          <p>暂无字幕可修订</p>
          <p>请先生成或加载字幕</p>
        </EmptyState>
      ) : (
        <RevisionContent>
          {summary && (
            <RevisionSummary>
              <div dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br>') }}></div>
            </RevisionSummary>
          )}
          
          <RevisionTextArea
            value={content || ''}
            onChange={(e) => onContentChange && onContentChange(e.target.value)}
            placeholder="修订字幕将显示在这里，您可以直接编辑..."
            disabled={loading}
          />
          
          <RevisionActions>
            <ActionButton 
              onClick={handleSave} 
              disabled={!content || loading}
            >
              保存修订
            </ActionButton>
          </RevisionActions>
          
          {loading && (
            <LoadingOverlay>
              <Spinner />
              <div>正在进行AI字幕修订...</div>
            </LoadingOverlay>
          )}
        </RevisionContent>
      )}
      
      {/* 模型设置弹窗 */}
      <ModelSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        settings={modelSettings}
        onSave={handleSaveSettings}
      />
    </RevisionContainer>
  );
}

export default SubtitleRevision;