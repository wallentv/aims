import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  margin-bottom: ${props => props.theme.spacing.medium};
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: ${props => props.theme.spacing.medium};
`;

const Group = styled.div`
  background-color: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing.medium};
  border-radius: ${props => props.theme.borderRadius};
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  border: 1px solid #555;
  border-radius: 4px;
`;

function SubtitleSettings({ settings, onChange }) {
  const handleLanguageChange = (e) => {
    onChange({ ...settings, language: e.target.value });
  };

  const handleFormatChange = (e) => {
    onChange({ ...settings, format: e.target.value });
  };

  return (
    <Container>
      <h2>字幕设置</h2>
      <SettingsGrid>
        <Group>
          <h3>目标语言</h3>
          <Select value={settings.language} onChange={handleLanguageChange}>
            <option value="zh">中文</option>
            <option value="en">英文</option>
          </Select>
        </Group>
        
        <Group>
          <h3>字幕格式</h3>
          <Select value={settings.format} onChange={handleFormatChange}>
            <option value="srt">SRT</option>
            <option value="ssa">SSA</option>
          </Select>
        </Group>
      </SettingsGrid>
    </Container>
  );
}

export default SubtitleSettings;