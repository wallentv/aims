import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

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

// Define the default prompt template as a plain string to avoid template literal evaluation issues
const DEFAULT_PROMPT = "请帮我修正以下SRT格式字幕中可能存在的错别字、不通顺的表达和标点符号错误，输出修正后的完整字幕。\n" +
"请特别注意：\n" +
"1. 不要改变字幕的时间标记\n" +
"2. 不要改变字幕的编号\n" +
"3. 保持原文的整体含义\n" +
"4. 修正错别字和语法错误\n" +
"5. 优化不通顺的表达\n" +
"6. 修正标点符号错误\n\n" +
"同时，请在字幕修正完成后，添加一个总结，列出你修改了哪些内容，以及做了哪些改进。\n\n" +
"输出的字幕里不要有其他元素，特别是字幕的头和尾，不要有解释说明文字和符号：\n" +
"以下是需要修正的字幕：\n" +

"{{subtitle}}";

// Provider configuration
const PROVIDERS = {
  OPENAI: 'openai',
  DEEPSEEK: 'deepseek'
};

// Provider-specific model lists
const PROVIDER_MODELS = {
  [PROVIDERS.OPENAI]: [
    { id: 'gpt-4', name: 'GPT-4' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    { id: 'gpt-3.5-turbo-16k', name: 'GPT-3.5 Turbo (16k)' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' }
  ],
  [PROVIDERS.DEEPSEEK]: [
    { id: 'deepseek-chat', name: 'DeepSeek Chat' },
    { id: 'deepseek-reasoner', name: 'DeepSeek Coder' }
  ]
};

// Default API URLs
const DEFAULT_API_URLS = {
  [PROVIDERS.OPENAI]: 'https://api.openai.com/v1',
  [PROVIDERS.DEEPSEEK]: 'https://api.deepseek.com/v1'
};

// Default provider settings
const getDefaultProviderSettings = () => ({
  [PROVIDERS.OPENAI]: {
    apiUrl: DEFAULT_API_URLS[PROVIDERS.OPENAI],
    apiKey: '',
    modelId: 'gpt-3.5-turbo',
  },
  [PROVIDERS.DEEPSEEK]: {
    apiUrl: DEFAULT_API_URLS[PROVIDERS.DEEPSEEK],
    apiKey: '',
    modelId: 'deepseek-chat',
  }
});

function ModelSettingsModal({ isOpen, onClose, settings, onSave }) {
  // Initialize provider settings with defaults
  const [providerSettings, setProviderSettings] = useState(getDefaultProviderSettings());
  
  // Current selected provider
  const [currentProvider, setCurrentProvider] = useState(PROVIDERS.OPENAI);
  
  // Shared prompt template (not provider-specific)
  const [promptTemplate, setPromptTemplate] = useState(DEFAULT_PROMPT);
  
  // Load settings if provided
  useEffect(() => {
    if (settings) {
      const savedProvider = settings.provider || PROVIDERS.OPENAI;
      setCurrentProvider(savedProvider);
      setPromptTemplate(settings.promptTemplate || DEFAULT_PROMPT);
      
      // Initialize provider settings with defaults then update with saved settings
      const newProviderSettings = getDefaultProviderSettings();
      
      // If we have provider-specific settings saved
      if (settings.providerSettings) {
        // Merge saved provider settings with defaults
        Object.keys(settings.providerSettings).forEach(provider => {
          newProviderSettings[provider] = {
            ...newProviderSettings[provider],
            ...settings.providerSettings[provider]
          };
        });
      } 
      // For backward compatibility with older settings format
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
  
  // Get current provider's settings
  const getCurrentSettings = () => {
    return providerSettings[currentProvider] || {
      apiUrl: DEFAULT_API_URLS[currentProvider],
      apiKey: '',
      modelId: PROVIDER_MODELS[currentProvider][0].id
    };
  };
  
  // Handle provider change
  const handleProviderChange = (e) => {
    setCurrentProvider(e.target.value);
  };
  
  // Handle settings change for current provider
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
  
  // Handle prompt template change
  const handlePromptChange = (e) => {
    setPromptTemplate(e.target.value);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare the settings to save
    const formData = {
      provider: currentProvider,
      promptTemplate: promptTemplate,
      providerSettings: providerSettings,
      // Include current provider's settings at the top level for backward compatibility
      ...providerSettings[currentProvider]
    };
    
    onSave(formData);
    onClose();
  };
  
  // Don't render anything if modal is not open
  if (!isOpen) return null;
  
  // Get current provider settings
  const currentSettings = getCurrentSettings();
  
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>AI 字幕修订设置</ModalTitle>
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
          
          <FormGroup>
            <Label>提示词模板</Label>
            <TextArea 
              name="promptTemplate" 
              value={promptTemplate} 
              onChange={handlePromptChange}
              placeholder="输入提示词模板，使用 {{subtitle}} 作为字幕内容的占位符"
              required
            />
            <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
              使用 {'{{subtitle}}'} 作为字幕内容的占位符
            </div>
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

export default ModelSettingsModal;