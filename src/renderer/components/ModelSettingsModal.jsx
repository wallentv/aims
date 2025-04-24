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

// 修改为左侧滑出面板的样式
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  z-index: 1000;
  transition: all 0.3s ease-in-out;
`;

// 面板从左侧滑出
const ModalContent = styled.div`
  background-color: ${props => props.theme.colors.surface};
  height: 100vh;
  width: 550px; // 从450px增加到550px
  max-width: 90%;
  overflow-y: auto;
  padding: ${props => props.theme.spacing.medium};
  box-shadow: 2px 0 15px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease-in-out;
  display: flex;
  flex-direction: column; // 改为纵向布局，便于固定底部按钮
  
  @keyframes slideIn {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }
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
  gap: ${props => props.theme.spacing.small}; // 减小表单元素之间的间距
  flex: 1; // 让表单占据所有可用空间
  overflow-y: auto; // 表单内容过多时可滚动
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px; // 减小标签和输入框之间的间距
`;

const FormRow = styled.div`
  display: flex;
  gap: 12px; // 行内元素之间的间距
  margin-bottom: 4px; // 行间距
  
  & > div {
    flex: 1; // 让元素平均分配空间
  }
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
  padding: 6px 8px; // 减小内边距
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
  padding: 6px 8px; // 减小内边距
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
  font-size: 16px;
  min-height: 240px;
  resize: vertical;
  flex: 1;
  
  line-height: 1.5;
  height: auto;
  overflow-y: auto;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.secondary};
  }
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
  
  // 语音识别精度设置
  const [precision, setPrecision] = useState('medium');

  // 加载设置
  useEffect(() => {
    if (settings) {
      const savedProvider = settings.provider || PROVIDERS.OPENAI;
      setCurrentProvider(savedProvider);
      
      // 加载字幕修订提示词模板
      setRevisionPromptTemplate(settings.revisionPromptTemplate || DEFAULT_REVISION_PROMPT);
      
      // 加载字幕总结提示词模板
      setSummaryPromptTemplate(settings.summaryPromptTemplate || DEFAULT_SUMMARY_PROMPT);

      // 加载语音识别精度设置
      setPrecision(settings.precision || 'medium');
      
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

  // 处理语音识别精度变更
  const handlePrecisionChange = (value) => {
    setPrecision(value);
  };
  
  // 处理表单提交
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 准备要保存的设置
    const formData = {
      provider: currentProvider,
      revisionPromptTemplate: revisionPromptTemplate,
      summaryPromptTemplate: summaryPromptTemplate,
      precision: precision, // 添加语音识别精度设置
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
          {/* 紧凑布局的表单字段 */}
          <FormSection>
            <FormRow>
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
            </FormRow>
            
            {/* 语音识别精度设置 */}
            <FormRow>
              <FormGroup style={{ flex: 1 }}>
                <Label>语音识别精度</Label>
                <PrecisionOptionsContainer>
                  <PrecisionOption 
                    selected={precision === 'high'} 
                    onClick={() => handlePrecisionChange('high')}
                  >
                    高精度
                  </PrecisionOption>
                  <PrecisionOption 
                    selected={precision === 'medium'} 
                    onClick={() => handlePrecisionChange('medium')}
                  >
                    中精度
                  </PrecisionOption>
                  <PrecisionOption 
                    selected={precision === 'low'} 
                    onClick={() => handlePrecisionChange('low')}
                  >
                    低精度
                  </PrecisionOption>
                </PrecisionOptionsContainer>
              </FormGroup>
            </FormRow>
            
            <FormRow>
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
            </FormRow>
          </FormSection>
          
          {/* 提示词部分 - 占据绝大部分空间 */}
          <PromptSectionContainer>
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
            
            {/* 提示词模板编辑器 - 占据所有剩余空间 */}
            <FormGroup style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Label>
                {activePromptType === 'revision' ? '字幕修订提示词模板' : '字幕总结提示词模板'}
              </Label>
              <TextAreaContainer>
                <TextArea 
                  name="promptTemplate" 
                  value={currentPromptTemplate} 
                  onChange={handlePromptChange}
                  placeholder={`输入${activePromptType === 'revision' ? '字幕修订' : '字幕总结'}提示词模板，使用 {{subtitle}} 作为字幕内容的占位符`}
                  required
                />
              </TextAreaContainer>
              <PromptActions>
                <div style={{ fontSize: '12px', color: '#aaa' }}>
                  使用 {'{{subtitle}}'} 作为字幕内容的占位符
                </div>
                <ResetButton type="button" onClick={handleResetPrompt}>
                  重置为默认
                </ResetButton>
              </PromptActions>
            </FormGroup>
          </PromptSectionContainer>
        </Form>
        
        {/* 底部按钮 - 完全固定在底部 */}
        <ButtonContainer>
          <Button type="button" onClick={onClose}>取消</Button>
          <Button type="submit" primary onClick={handleSubmit}>保存设置</Button>
        </ButtonContainer>
      </ModalContent>
    </ModalOverlay>
  );
}

// 提示词类型选择器样式
const PromptTypeSelector = styled.div`
  display: flex;
  flex-direction: row; // 改为水平排列
  gap: 8px;
  width: 100%; // 占满整个容器宽度
  margin-top: 4px;
`;

const PromptTypeButton = styled.button`
  flex: 1;
  padding: 8px 12px; // 增加一点内边距高度
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

const PromptSectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.medium};
  margin-top: ${props => props.theme.spacing.medium};
  flex: 1;
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

const FormSection = styled.div`
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 12px;
`;

const TextAreaContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 300px; // 提供更大的最小高度
`;

// 按钮容器改为固定在模态框底部
const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${props => props.theme.spacing.small};
  padding-top: 12px;
  margin-top: auto; // 推到底部
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background-color: ${props => props.theme.colors.surface};
`;

const PrecisionOptionsContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const PrecisionOption = styled.button`
  flex: 1;
  padding: 8px 12px;
  background-color: ${props => props.selected ? props.theme.colors.secondary : props.theme.colors.surfaceLight};
  color: ${props => props.selected ? 'white' : props.theme.colors.text};
  border: 1px solid ${props => props.selected ? props.theme.colors.secondary : 'rgba(255, 255, 255, 0.1)'};
  border-radius: ${props => props.theme.borderRadius};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.selected ? props.theme.colors.secondary : 'rgba(33, 134, 208, 0.1)'};
  }
`;

export default ModelSettingsModal;