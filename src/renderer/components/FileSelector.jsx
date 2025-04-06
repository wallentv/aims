import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  margin-bottom: ${props => props.theme.spacing.small}; /* 减小下边距 */
`;

const FileButton = styled.button`
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.small}; /* 减小按钮内边距 */
  width: 100%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px; /* 减小字体大小 */
  font-weight: 500;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  
  &:hover {
    background-color: #0066cc;
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
  font-size: 18px; /* 减小图标大小 */
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  position: relative;
  top: -2px;
`;

const SelectedFile = styled.div`
  margin-top: 6px; /* 减小上边距 */
  padding: ${props => props.theme.spacing.small} ${props => props.theme.spacing.small}; /* 减小内边距 */
  background-color: ${props => props.theme.colors.surfaceLight};
  border-radius: ${props => props.theme.borderRadius};
  border-left: 2px solid ${props => props.theme.colors.primary}; /* 减小边框宽度 */
  word-break: break-all;
  font-size: 11px; /* 减小字体大小 */
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