import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  margin-bottom: ${props => props.theme.spacing.medium};
`;

const SettingsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.medium};
`;

const Group = styled.div`
  background-color: ${props => props.theme.colors.surfaceLight};
  padding: ${props => props.theme.spacing.medium};
  border-radius: ${props => props.theme.borderRadius};
`;

const OptionsTable = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.small};
  margin-top: ${props => props.theme.spacing.small};
`;

const OptionButton = styled.button`
  padding: ${props => props.theme.spacing.small} ${props => props.theme.spacing.medium};
  background-color: ${props => props.theme.colors.surface};
  color: ${props => 
    props.selected ? props.theme.colors.secondary : props.theme.colors.text};
  border: ${props => 
    props.selected ? `1px solid ${props.theme.colors.secondary}` : 'none'};
  border-radius: ${props => props.theme.borderRadius};
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  min-width: 80px;
  text-align: center;
  font-weight: ${props => props.selected ? '500' : '400'};
  
  &:hover {
    background-color: #383838;
    border-color: ${props => props.selected ? props.theme.colors.secondary : 'transparent'};
  }
`;

const GroupTitle = styled.h3`
  font-size: 13px;
  font-weight: 400;
  text-align: left;
  margin-top: 0;
  margin-bottom: ${props => props.theme.spacing.small};
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