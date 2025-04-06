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
  font-size: 11px; /* 减小字体大小 */
  
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

function SubtitleSettings({ settings, onChange }) {
  const languages = [
    { value: 'zh', label: '中文' },
    { value: 'en', label: '英文' }
  ];
  
  const formats = [
    { value: 'srt', label: 'SRT' },
    { value: 'ssa', label: 'SSA' }
  ];

  const precisionOptions = [
    { value: 'high', label: '高精度' },
    { value: 'medium', label: '中精度' },
    { value: 'low', label: '低精度' }
  ];
  
  const handleLanguageChange = (value) => {
    onChange({ ...settings, language: value });
  };
  
  const handleFormatChange = (value) => {
    onChange({ ...settings, format: value });
  };

  const handlePrecisionChange = (value) => {
    onChange({ ...settings, precision: value });
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
          <GroupTitle>语音识别精度</GroupTitle>
          <OptionsTable>
            {precisionOptions.map(option => (
              <OptionButton 
                key={option.value}
                selected={settings.precision === option.value}
                onClick={() => handlePrecisionChange(option.value)}
              >
                {option.label}
              </OptionButton>
            ))}
          </OptionsTable>
        </Group>
      </SettingsGrid>
    </Container>
  );
}

export default SubtitleSettings;