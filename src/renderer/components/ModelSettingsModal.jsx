import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  PROVIDERS, 
  PROVIDER_MODELS, 
  DEFAULT_API_URLS,
  DEFAULT_REVISION_PROMPT,
  DEFAULT_SUMMARY_PROMPT,
  getDefaultProviderSettings,
  getFullModelSettings,
  saveFullModelSettings
} from '../utils/ModelConfig';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius};
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  padding: ${props => props.theme.spacing.medium};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.medium};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: ${props => props.theme.spacing.small};
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: ${props => props.theme.colors.text};
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 18px;
  cursor: pointer;
  
  &:hover {
    color: ${props => props.theme.colors.text};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.medium};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.small};
`;

const Label = styled.label`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
`;

const Input = styled.input`
  background-color: ${props => props.theme.colors.surfaceLight};
  color: ${props => props.theme.colors.text};
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.small};
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.secondary};
  }
`;

const Select = styled.select`
  background-color: ${props => props.theme.colors.surfaceLight};
  color: ${props => props.theme.colors.text};
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.small};
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.secondary};
  }
`;

const TextArea = styled.textarea`
  background-color: ${props => props.theme.colors.surfaceLight};
  color: ${props => props.theme.colors.text};
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.small};
  font-size: 14px;
  min-height: 120px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.secondary};
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${props => props.theme.spacing.small};
  margin-top: ${props => props.theme.spacing.medium};
`;

const Button = styled.button`
  background-color: ${props => props.primary ? props.theme.colors.secondary : 'transparent'};
  color: ${props => props.primary ? 'white' : props.theme.colors.secondary};
  border: 1px solid ${props => props.primary ? 'transparent' : props.theme.colors.secondary};
  border-radius: ${props => props.theme.borderRadius};
  padding: 6px 16px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.primary ? '#2186d0' : 'rgba(33, 134, 208, 0.1)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

function ModelSettingsModal({ isOpen, onClose, settings, onSave }) {
  // 初始化提供商设置
  const [providerSettings, setProviderSettings] = useState(getDefaultProviderSettings());
  
  // 当前选择的提供商
  const [currentProvider, setCurrentProvider] = useState(PROVIDERS.OPENAI);
  
  // 字幕修订提示词模板
  const [revisionPromptTemplate, setRevisionPromptTemplate] = useState(DEFAULT_REVISION_PROMPT);
  
  // 字幕总结提示词模板 (新增)
  const [summaryPromptTemplate, setSummaryPromptTemplate] = useState(DEFAULT_SUMMARY_PROMPT);
  
  // 当前活动的提示词类型 (新增)
  const [activePromptType, setActivePromptType] = useState('revision');
  
  // 加载设置
  useEffect(() => {
    if (settings) {
      const savedProvider = settings.provider || PROVIDERS.OPENAI;
      setCurrentProvider(savedProvider);
      
      // 加载字幕修订提示词模板
      setRevisionPromptTemplate(settings.revisionPromptTemplate || DEFAULT_REVISION_PROMPT);
      
      // 加载字幕总结提示词模板
      setSummaryPromptTemplate(settings.summaryPromptTemplate || DEFAULT_SUMMARY_PROMPT);
      
      // 初始化提供商设置
      const newProviderSettings = getDefaultProviderSettings();
      
      // 如果有提供商特定设置
      if (settings.providerSettings) {
        // 合并保存的提供商设置与默认值
        Object.keys(settings.providerSettings).forEach(provider => {
          newProviderSettings[provider] = {
            ...newProviderSettings[provider],
            ...settings.providerSettings[provider]
          };
        });
      } 
      // 向后兼容旧的设置格式
      else {
        newProviderSettings[savedProvider] = {
          apiUrl: settings.apiUrl || DEFAULT_API_URLS[savedProvider],
          apiKey: settings.apiKey || '',
          modelId: settings.modelId || (savedProvider === PROVIDERS.OPENAI ? 'gpt-3.5-turbo' : 'deepseek-chat'),
        };
      }
      
      setProviderSettings(newProviderSettings);
    }
  }, [settings]);
  
  // 获取当前提供商的设置
  const getCurrentSettings = () => {
    return providerSettings[currentProvider] || {
      apiUrl: DEFAULT_API_URLS[currentProvider],
      apiKey: '',
      modelId: PROVIDER_MODELS[currentProvider][0].id
    };
  };
  
  // 处理提供商变更
  const handleProviderChange = (e) => {
    setCurrentProvider(e.target.value);
  };
  
  // 处理当前提供商设置变更
  const handleSettingChange = (e) => {
    const { name, value } = e.target;
    
    setProviderSettings(prev => ({
      ...prev,
      [currentProvider]: {
        ...prev[currentProvider],
        [name]: value
      }
    }));
  };
  
  // 处理提示词模板变更
  const handlePromptChange = (e) => {
    const { value } = e.target;
    
    if (activePromptType === 'revision') {
      setRevisionPromptTemplate(value);
    } else {
      setSummaryPromptTemplate(value);
    }
  };
  
  // 切换提示词类型
  const handlePromptTypeChange = (type) => {
    setActivePromptType(type);
  };
  
  // 处理表单提交
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 准备要保存的设置
    const formData = {
      provider: currentProvider,
      revisionPromptTemplate: revisionPromptTemplate,
      summaryPromptTemplate: summaryPromptTemplate,
      providerSettings: providerSettings,
      // 在顶层包含当前提供商的设置（向后兼容）
      ...providerSettings[currentProvider]
    };
    
    onSave(formData);
    onClose();
  };
  
  // 重置当前提示词模板为默认值
  const handleResetPrompt = () => {
    if (activePromptType === 'revision') {
      setRevisionPromptTemplate(DEFAULT_REVISION_PROMPT);
    } else {
      setSummaryPromptTemplate(DEFAULT_SUMMARY_PROMPT);
    }
  };
  
  // 如果模态框未打开则不渲染任何内容
  if (!isOpen) return null;
  
  // 获取当前提供商设置
  const currentSettings = getCurrentSettings();
  
  // 获取当前活动的提示词模板
  const currentPromptTemplate = activePromptType === 'revision' 
    ? revisionPromptTemplate 
    : summaryPromptTemplate;
  
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>AI 模型设置</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>服务提供商</Label>
            <Select 
              name="provider" 
              value={currentProvider} 
              onChange={handleProviderChange}
              required
            >
              <option value={PROVIDERS.OPENAI}>OpenAI</option>
              <option value={PROVIDERS.DEEPSEEK}>DeepSeek</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label>API URL</Label>
            <Input 
              type="text" 
              name="apiUrl" 
              value={currentSettings.apiUrl} 
              onChange={handleSettingChange} 
              placeholder={`例如: ${DEFAULT_API_URLS[currentProvider]}`}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label>API 密钥</Label>
            <Input 
              type="password" 
              name="apiKey" 
              value={currentSettings.apiKey} 
              onChange={handleSettingChange} 
              placeholder="输入您的API密钥"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label>AI 模型</Label>
            <Select 
              name="modelId" 
              value={currentSettings.modelId} 
              onChange={handleSettingChange}
              required
            >
              {PROVIDER_MODELS[currentProvider].map(model => (
                <option key={model.id} value={model.id}>{model.name}</option>
              ))}
            </Select>
          </FormGroup>
          
          {/* 提示词类型选择器 */}
          <FormGroup>
            <Label>提示词类型</Label>
            <PromptTypeSelector>
              <PromptTypeButton 
                active={activePromptType === 'revision'} 
                onClick={() => handlePromptTypeChange('revision')}
                type="button"
              >
                字幕修订
              </PromptTypeButton>
              <PromptTypeButton 
                active={activePromptType === 'summary'} 
                onClick={() => handlePromptTypeChange('summary')}
                type="button"
              >
                字幕总结
              </PromptTypeButton>
            </PromptTypeSelector>
          </FormGroup>
          
          <FormGroup>
            <Label>
              {activePromptType === 'revision' ? '字幕修订提示词模板' : '字幕总结提示词模板'}
            </Label>
            <TextArea 
              name="promptTemplate" 
              value={currentPromptTemplate} 
              onChange={handlePromptChange}
              placeholder={`输入${activePromptType === 'revision' ? '字幕修订' : '字幕总结'}提示词模板，使用 {{subtitle}} 作为字幕内容的占位符`}
              required
            />
            <PromptActions>
              <div style={{ fontSize: '12px', color: '#aaa' }}>
                使用 {'{{subtitle}}'} 作为字幕内容的占位符
              </div>
              <ResetButton type="button" onClick={handleResetPrompt}>
                重置为默认
              </ResetButton>
            </PromptActions>
          </FormGroup>
          
          <ButtonContainer>
            <Button type="button" onClick={onClose}>取消</Button>
            <Button type="submit" primary>保存设置</Button>
          </ButtonContainer>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
}

// 提示词类型选择器样式
const PromptTypeSelector = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 4px;
`;

const PromptTypeButton = styled.button`
  flex: 1;
  padding: 6px 12px;
  background-color: ${props => props.active ? props.theme.colors.secondary : props.theme.colors.surfaceLight};
  color: ${props => props.active ? 'white' : props.theme.colors.text};
  border: 1px solid ${props => props.active ? props.theme.colors.secondary : 'rgba(255, 255, 255, 0.1)'};
  border-radius: ${props => props.theme.borderRadius};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.active ? props.theme.colors.secondary : 'rgba(33, 134, 208, 0.1)'};
  }
`;

const PromptActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
`;

const ResetButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.secondary};
  cursor: pointer;
  font-size: 12px;
  padding: 2px 6px;
  
  &:hover {
    text-decoration: underline;
  }
`;

export default ModelSettingsModal;