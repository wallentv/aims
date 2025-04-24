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

const ModelSettingsButton = styled.button`
  display: flex;
  align-items: center;
  background-color: ${props => props.theme.colors.surfaceLight};
  color: ${props => props.theme.colors.text};
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: ${props => props.theme.borderRadius};
  padding: 8px 10px;
  margin-top: 6px;
  cursor: pointer;
  font-size: 12px;
  width: 100%;
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    border-color: ${props => props.theme.colors.secondary};
  }
`;

const ButtonIcon = styled.span`
  margin-right: 5px;
  font-size: 14px; /* 减小图标大小 */
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
        
        {/* AI模型设置选项 - 改为与其他Group保持一致 */}
        <Group>
          <GroupTitle>AI模型</GroupTitle>
          <ModelSettingsButton onClick={onOpenModelSettings}>
            <ButtonIcon>⚙️</ButtonIcon>
            配置AI模型设置
          </ModelSettingsButton>
        </Group>
      </SettingsGrid>
    </Container>
  );
}

export default SubtitleSettings;