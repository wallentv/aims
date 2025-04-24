import React, { useState, useEffect, useRef } from 'react';
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

// 导入样式组件
import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  CloseButton,
  Form,
  FormGroup,
  FormRow,
  Label,
  Input,
  Select,
  TextArea,
  Button,
  ContentContainer,
  SettingsSection,
  SectionTitle,
  PrecisionSelector,
  PrecisionOption,
  OptionDescription,
  PromptTypeSelector,
  PromptTypeTab,
  TextAreaWrapper,
  PromptInfo,
  PromptTip,
  TagHighlight,
  ResetButton,
  ButtonContainer,
  GlobalStyle
} from '../styles/ModelSettingsStyles';

function ModelSettingsModal({ isOpen, onClose, settings, onSave }) {
  // 状态变量保持不变
  const [providerSettings, setProviderSettings] = useState(getDefaultProviderSettings());
  const [currentProvider, setCurrentProvider] = useState(PROVIDERS.OPENAI);
  const [revisionPromptTemplate, setRevisionPromptTemplate] = useState(DEFAULT_REVISION_PROMPT);
  const [summaryPromptTemplate, setSummaryPromptTemplate] = useState(DEFAULT_SUMMARY_PROMPT);
  const [activePromptType, setActivePromptType] = useState('revision');
  const [precision, setPrecision] = useState('medium');

  // 加载设置
  useEffect(() => {
    if (settings) {
      const savedProvider = settings.provider || PROVIDERS.OPENAI;
      setCurrentProvider(savedProvider);
      
      setRevisionPromptTemplate(settings.revisionPromptTemplate || DEFAULT_REVISION_PROMPT);
      setSummaryPromptTemplate(settings.summaryPromptTemplate || DEFAULT_SUMMARY_PROMPT);
      setPrecision(settings.precision || 'medium');
      
      const newProviderSettings = getDefaultProviderSettings();
      
      if (settings.providerSettings) {
        Object.keys(settings.providerSettings).forEach(provider => {
          newProviderSettings[provider] = {
            ...newProviderSettings[provider],
            ...settings.providerSettings[provider]
          };
        });
      } 
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
    
    const formData = {
      provider: currentProvider,
      revisionPromptTemplate: revisionPromptTemplate,
      summaryPromptTemplate: summaryPromptTemplate,
      precision: precision,
      providerSettings: providerSettings,
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
      <GlobalStyle>
        <ModalContent onClick={e => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>AI 模型设置</ModalTitle>
            <CloseButton onClick={onClose}>×</CloseButton>
          </ModalHeader>
          
          <ContentContainer>
            <Form onSubmit={handleSubmit}>
              {/* 精度选择 */}
              <SettingsSection>
                <SectionTitle>语音识别精度</SectionTitle>
                <PrecisionSelector>
                  <PrecisionOption 
                    selected={precision === 'low'} 
                    onClick={(e) => {
                      e.preventDefault(); // 阻止默认行为
                      e.stopPropagation(); // 阻止事件冒泡
                      handlePrecisionChange('low');
                    }}
                    type="button"
                  >
                    低精度
                    <OptionDescription>快速处理，精度较低</OptionDescription>
                  </PrecisionOption>
                  <PrecisionOption 
                    selected={precision === 'medium'} 
                    onClick={(e) => {
                      e.preventDefault(); // 阻止默认行为
                      e.stopPropagation(); // 阻止事件冒泡
                      handlePrecisionChange('medium');
                    }}
                    type="button"
                  >
                    中精度
                    <OptionDescription>平衡处理速度与精度</OptionDescription>
                  </PrecisionOption>
                  <PrecisionOption 
                    selected={precision === 'high'} 
                    onClick={(e) => {
                      e.preventDefault(); // 阻止默认行为
                      e.stopPropagation(); // 阻止事件冒泡
                      handlePrecisionChange('high');
                    }}
                  >
                    高精度
                    <OptionDescription>高质量识别，速度较慢</OptionDescription>
                  </PrecisionOption>
                </PrecisionSelector>
              </SettingsSection>

              {/* 模型配置 */}
              <SettingsSection>
                <SectionTitle>模型配置</SectionTitle>
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
                </FormRow>
                
                <FormRow>
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
              </SettingsSection>
              
              {/* 提示词设置 */}
              <SettingsSection style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <SectionTitle>提示词设置</SectionTitle>
                
                {/* 提示词类型选择器 */}
                <PromptTypeSelector>
                  <PromptTypeTab 
                    active={activePromptType === 'revision'} 
                    onClick={() => handlePromptTypeChange('revision')}
                    type="button"
                  >
                    字幕修订
                  </PromptTypeTab>
                  <PromptTypeTab 
                    active={activePromptType === 'summary'} 
                    onClick={() => handlePromptTypeChange('summary')}
                    type="button"
                  >
                    字幕总结
                  </PromptTypeTab>
                </PromptTypeSelector>
                
                {/* 提示词模板编辑器 */}
                <TextAreaWrapper>
                  <TextArea 
                    name="promptTemplate" 
                    value={currentPromptTemplate} 
                    onChange={handlePromptChange}
                    placeholder={`输入${activePromptType === 'revision' ? '字幕修订' : '字幕总结'}提示词模板，使用 {{subtitle}} 作为字幕内容的占位符`}
                    required
                  />
                </TextAreaWrapper>

                <PromptInfo>
                  <PromptTip>
                    使用 <TagHighlight>{'{{'+'subtitle'+'}}'}</TagHighlight> 作为字幕内容的占位符
                  </PromptTip>
                  <ResetButton type="button" onClick={handleResetPrompt}>
                    重置为默认
                  </ResetButton>
                </PromptInfo>
              </SettingsSection>
            </Form>
          </ContentContainer>
          
          {/* 底部按钮区域 */}
          <ButtonContainer>
            <Button type="button" onClick={onClose}>取消</Button>
            <Button type="submit" primary onClick={handleSubmit}>保存设置</Button>
          </ButtonContainer>
        </ModalContent>
      </GlobalStyle>
    </ModalOverlay>
  );
}

export default ModelSettingsModal;