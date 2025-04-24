import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  margin-bottom: ${props => props.theme.spacing.small};
`;

const SettingsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.small}; /* 减小间距 */
`;

const Group = styled.div`
  background-color: ${props => props.theme.colors.surfaceLight};
  padding: ${props => props.theme.spacing.small}; /* 减小内边距 */
  border-radius: ${props => props.theme.borderRadius};
`;

const OptionsTable = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px; /* 进一步减小间距 */
  margin-top: 4px; /* 减小上边距 */
`;

const OptionButton = styled.button`
  padding: 4px 8px; /* 固定较小的内边距 */
  background-color: ${props => props.theme.colors.surface};
  color: ${props => 
    props.selected ? props.theme.colors.secondary : props.theme.colors.text};
  border: ${props => 
    props.selected ? `1px solid ${props.theme.colors.secondary}` : 'none'};
  border-radius: ${props => props.theme.borderRadius};
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  min-width: 60px; /* 减小最小宽度 */
  text-align: center;
  font-weight: ${props => props.selected ? '500' : '400'};
  font-size: 13px; /* 增加字体大小，使按钮文字更加明显 */
  
  &:hover {
    background-color: #383838;
    border-color: ${props => props.selected ? props.theme.colors.secondary : 'transparent'};
  }
`;

const GroupTitle = styled.h3`
  font-size: 12px; /* 减小字体大小 */
  font-weight: 400;
  text-align: left;
  margin-top: 0;
  margin-bottom: 4px; /* 减小下边距 */
  color: ${props => props.theme.colors.textSecondary};
  opacity: 0.8;
`;

const ModelSettingsButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  background-color: transparent;
  color: ${props => props.theme.colors.secondary};
  border: 1px solid ${props => props.theme.colors.secondary};
  border-radius: ${props => props.theme.borderRadius};
  padding: 8px 12px;
  margin-top: 20px; // 增加顶部边距，与上方选项组分隔更明显
  cursor: pointer;
  font-size: 13px; // 与其他按钮保持一致的字体大小
  transition: background-color 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); // 添加轻微阴影效果增强视觉区分
  
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

const ButtonIcon = styled.span`
  margin-right: 6px;
  font-size: 16px;
  display: flex;
  align-items: center;
`;

function SubtitleSettings({ settings, onChange, onOpenModelSettings }) {
  const languages = [
    { value: 'zh', label: '中文' },
    { value: 'en', label: '英文' }
  ];
  
  const formats = [
    { value: 'srt', label: 'SRT' },
    { value: 'ssa', label: 'SSA' }
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
        
        {/* 添加AI模型设置按钮 */}
        <ModelSettingsButton onClick={onOpenModelSettings}>
          <ButtonIcon>
            <span role="img" aria-label="settings">⚙️</span>
          </ButtonIcon>
          AI模型设置
        </ModelSettingsButton>
      </SettingsGrid>
    </Container>
  );
}

export default SubtitleSettings;