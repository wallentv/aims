import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  margin-bottom: ${props => props.theme.spacing.medium};
`;

const FileButton = styled.button`
  background-color: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  border: 1px solid #555;
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.medium};
  margin-right: ${props => props.theme.spacing.medium};
  cursor: pointer;
  
  &:hover {
    background-color: #444;
  }
`;

const SelectedFile = styled.div`
  margin-top: ${props => props.theme.spacing.medium};
  padding: ${props => props.theme.spacing.medium};
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius};
  word-break: break-all;
`;

function FileSelector({ onFileSelect, onDirectorySelect }) {
  const [selected, setSelected] = React.useState('');
  
  const handleFileSelect = async () => {
    if (!window.electron) return;
    
    const filePath = await window.electron.chooseVideoFile();
    if (filePath) {
      setSelected(filePath);
      onFileSelect(filePath);
      onDirectorySelect(false);
    }
  };
  
  const handleDirSelect = async () => {
    if (!window.electron) return;
    
    const dirPath = await window.electron.chooseVideoDir();
    if (dirPath) {
      setSelected(dirPath);
      onFileSelect(dirPath);
      onDirectorySelect(true);
    }
  };

  return (
    <Container>
      <h2>选择视频</h2>
      <FileButton onClick={handleFileSelect}>选择视频文件</FileButton>
      <FileButton onClick={handleDirSelect}>选择视频目录</FileButton>
      
      {selected && (
        <SelectedFile>
          <strong>已选择: </strong> {selected}
        </SelectedFile>
      )}
    </Container>
  );
}

export default FileSelector;