import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  margin-bottom: ${props => props.theme.spacing.small};
`;

const SettingsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px; /* 进一步缩小组件间距 */
`;

const Group = styled.div`
  background-color: ${props => props.theme.colors.surfaceLight};
  padding: 8px 10px; /* 固定更小的内边距，使布局更紧凑 */
  border-radius: ${props => props.theme.borderRadius};
  border: 1px solid rgba(255, 255, 255, 0.05); /* 添加微妙的边框 */
`;

const OptionsTable = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 3px; /* 减小选项间距 */
  margin-top: 2px; /* 进一步减小标题和选项之间的间距 */
`;

const OptionButton = styled.button`
  padding: 3px 6px; /* 减小按钮内部填充 */
  background-color: ${props => 
    props.selected ? 'rgba(33, 134, 208, 0.15)' : props.theme.colors.surface};
  color: ${props => 
    props.selected ? props.theme.colors.secondary : props.theme.colors.text};
  border: ${props => 
    props.selected ? `1px solid ${props.theme.colors.secondary}` : '1px solid transparent'};
  border-radius: ${props => props.theme.borderRadius};
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  min-width: 50px; /* 更小的最小宽度 */
  text-align: center;
  font-weight: ${props => props.selected ? '500' : '400'};
  font-size: 12px; /* 略微减小字体以匹配整体紧凑感 */
  
  &:hover {
    background-color: ${props => props.selected ? 'rgba(33, 134, 208, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  }
`;

const GroupTitle = styled.h3`
  font-size: 11px; /* 更小的标题字体 */
  font-weight: 500; /* 稍微加粗，提高可读性 */
  text-align: left;
  margin: 0 0 2px 0; /* 更紧凑的边距 */
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase; /* 使用大写增强视觉层级 */
  letter-spacing: 0.5px; /* 增加字母间距提高可读性 */
`;

// 添加ModelOptionButton样式，与OptionButton类似但有轻微差异
const ModelOptionButton = styled(OptionButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px; /* 略微增加高度 */
  width: 100%;
  
  & > span {
    margin-right: 5px;
    font-size: 14px;
  }
`;

const ButtonIcon = styled.span`
  margin-right: 5px;
  font-size: 14px; /* 减小图标大小 */
  display: flex;
  align-items: center;
`;

// 添加提示UI组件
const PromptContainer = styled.div`
  margin-top: 12px;
  padding: 8px 10px;
  background-color: rgba(33, 150, 243, 0.08);
  border-radius: ${props => props.theme.borderRadius};
  border-left: 2px solid ${props => props.theme.colors.primary};
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
  display: flex;
  align-items: center;
  animation: fadeIn 0.5s ease-in-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const PromptIcon = styled.span`
  margin-right: 8px;
  font-size: 14px;
  color: ${props => props.theme.colors.primary};
`;

function SubtitleSettings({ settings, onChange, onOpenModelSettings, selectedFile }) {
  const languages = [
    { value: 'zh', label: '中文' },
    { value: 'en', label: '英文' }
  ];
  
  const formats = [
    { value: 'srt', label: 'SRT' },
    { value: 'ssa', label: 'SSA' }
  ];
  
  const models = [
    { value: 'settings', label: '配置AI模型设置', icon: '⚙️' }
  ];
  
  const handleLanguageChange = (value) => {
    onChange({ ...settings, language: value });
  };
  
  const handleFormatChange = (value) => {
    onChange({ ...settings, format: value });
  };
  
  return (
    <Container>
      <SettingsGrid>
        <Group>
          <GroupTitle>目标语言</GroupTitle>
          <OptionsTable>
            {languages.map(lang => (
              <OptionButton 
                key={lang.value}
                selected={settings.language === lang.value}
                onClick={() => handleLanguageChange(lang.value)}
              >
                {lang.label}
              </OptionButton>
            ))}
          </OptionsTable>
        </Group>
        
        <Group>
          <GroupTitle>字幕格式</GroupTitle>
          <OptionsTable>
            {formats.map(format => (
              <OptionButton 
                key={format.value}
                selected={settings.format === format.value}
                onClick={() => handleFormatChange(format.value)}
              >
                {format.label}
              </OptionButton>
            ))}
          </OptionsTable>
        </Group>
        
        <Group>
          <GroupTitle>AI模型</GroupTitle>
          <OptionsTable>
            {models.map(model => (
              <ModelOptionButton 
                key={model.value}
                onClick={onOpenModelSettings}
              >
                <ButtonIcon>{model.icon}</ButtonIcon>
                {model.label}
              </ModelOptionButton>
            ))}
          </OptionsTable>
        </Group>
      </SettingsGrid>
      
      {/* 添加底部提示UI */}
      {!selectedFile && (
        <PromptContainer>
          <PromptIcon>💡</PromptIcon>
          <span>请先选择视频或音频文件，然后设置字幕参数来生成智能字幕</span>
        </PromptContainer>
      )}
    </Container>
  );
}

export default SubtitleSettings;