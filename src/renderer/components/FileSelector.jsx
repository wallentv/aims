import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  margin-bottom: ${props => props.theme.spacing.medium};
`;

const FileButton = styled.button`
  background-color: #1890ff; /* 蓝色替代 ${props => props.theme.colors.primary} */
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.medium};
  width: 100%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  
  &:hover {
    background-color: #0066cc; /* 深蓝色替代 #cc0000 */
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.3);
  }
`;

const FileIcon = styled.span`
  margin-right: ${props => props.theme.spacing.small};
  font-size: 22px; /* 增加字体大小 */
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  position: relative;
  top: -3px; /* 微调垂直位置 */
`;

const SelectedFile = styled.div`
  margin-top: 8px;
  padding: ${props => props.theme.spacing.small} ${props => props.theme.spacing.medium};
  background-color: ${props => props.theme.colors.surfaceLight};
  border-radius: ${props => props.theme.borderRadius};
  border-left: 3px solid ${props => props.theme.colors.primary};
  word-break: break-all;
  font-size: 13px;
`;

function FileSelector({ selectedFile, onSelectFile, label = "选择视频文件" }) {
  const handleFileSelect = () => {
    if (onSelectFile) {
      onSelectFile();
    }
  };

  // 提取文件名（从路径中获取最后一部分）
  const getFileName = (path) => {
    if (!path) return '';
    const parts = path.split(/[\/\\]/);
    return parts[parts.length - 1];
  };

  return (
    <Container>
      <FileButton onClick={handleFileSelect}>
        <FileIcon>
          <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 8H10L8 6H5C3.34 6 2 7.34 2 9V19C2 20.66 3.34 22 5 22H19C20.66 22 22 20.66 22 19V11C22 9.34 20.66 8 19 8ZM19 20H5V9H7.17L9.17 11H19V20Z" fill="currentColor"/>
          </svg>
        </FileIcon>
        {label}
      </FileButton>
      
      {selectedFile && (
        <SelectedFile>
          <strong>已选择: </strong> {getFileName(selectedFile)}
        </SelectedFile>
      )}
    </Container>
  );
}

export default FileSelector;