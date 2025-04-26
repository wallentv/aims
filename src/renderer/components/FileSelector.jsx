import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  margin-bottom: ${props => props.theme.spacing.small}; /* 减小下边距 */
`;

const FileButton = styled.button`
  background-color: ${props => props.hasFile ? props.theme.colors.surfaceLight : '#1890ff'};
  color: ${props => props.hasFile ? props.theme.colors.textSecondary : 'white'};
  border: ${props => props.hasFile ? '1px solid rgba(255, 255, 255, 0.05)' : 'none'};
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.small}; /* 减小按钮内边距 */
  width: 100%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: ${props => props.hasFile ? 'space-between' : 'center'};
  font-size: 12px; /* 减小字体大小 */
  font-weight: 500;
  box-shadow: ${props => props.hasFile ? 'none' : '0 2px 5px rgba(0, 0, 0, 0.3)'};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.hasFile ? 'rgba(255, 255, 255, 0.05)' : '#0066cc'};
    transform: ${props => props.hasFile ? 'none' : 'translateY(-1px)'};
    box-shadow: ${props => props.hasFile ? 'none' : '0 4px 8px rgba(0, 0, 0, 0.3)'};
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: ${props => props.hasFile ? 'none' : '0 2px 3px rgba(0, 0, 0, 0.3)'};
  }
`;

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
`;

const FileButtonText = styled.span`
  transition: all 0.2s ease;
`;

const FileInfo = styled.span`
  font-size: 11px;
  color: ${props => props.theme.colors.secondary};
  margin-left: 8px;
  opacity: 0.85;
`;

const ChangeFileText = styled.span`
  font-size: 11px;
  color: ${props => props.theme.colors.secondary};
  background-color: rgba(33, 150, 243, 0.1);
  padding: 2px 6px;
  border-radius: 10px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(33, 150, 243, 0.2);
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

const StatusMessage = styled.div`
  margin-top: 6px;
  padding: 6px 8px;
  background-color: rgba(62, 166, 255, 0.1);
  border-radius: ${props => props.theme.borderRadius};
  border-left: 2px solid ${props => props.theme.colors.secondary};
  color: ${props => props.theme.colors.secondary};
  font-size: 11px;
  display: flex;
  align-items: center;
`;

const StatusIcon = styled.span`
  margin-right: 6px;
  font-size: 14px;
`;

function FileSelector({ 
  selectedFile, 
  onSelectFile, 
  label = "选择视频文件", 
  subtitleFound = false 
}) {
  // 添加状态来控制是否显示字幕检测提示
  const [showSubtitleFoundMessage, setShowSubtitleFoundMessage] = useState(false);
  
  // 监听 subtitleFound 属性的变化
  useEffect(() => {
    if (subtitleFound) {
      // 如果检测到字幕，显示提示
      setShowSubtitleFoundMessage(true);
      
      // 3秒后自动隐藏提示
      const timer = setTimeout(() => {
        setShowSubtitleFoundMessage(false);
      }, 3000);
      
      // 清理定时器
      return () => clearTimeout(timer);
    }
  }, [subtitleFound]);

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

  // 提取文件类型（从路径中获取扩展名）
  const getFileType = (path) => {
    if (!path) return '';
    const parts = path.split('.');
    const ext = parts[parts.length - 1].toLowerCase();
    
    // 判断是视频还是音频
    const videoExts = ['mp4', 'mkv', 'avi', 'mov', 'flv'];
    const audioExts = ['mp3', 'wav', 'ogg', 'm4a'];
    
    if (videoExts.includes(ext)) return '视频';
    if (audioExts.includes(ext)) return '音频';
    return '文件';
  };

  return (
    <Container>
      <FileButton onClick={handleFileSelect} hasFile={!!selectedFile}>
        {!selectedFile ? (
          <ButtonContent>
            <FileIcon>
              <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 8H10L8 6H5C3.34 6 2 7.34 2 9V19C2 20.66 3.34 22 5 22H19C20.66 22 22 20.66 22 19V11C22 9.34 20.66 8 19 8ZM19 20H5V9H7.17L9.17 11H19V20Z" fill="currentColor"/>
              </svg>
            </FileIcon>
            <FileButtonText>{label}</FileButtonText>
          </ButtonContent>
        ) : (
          <>
            <ButtonContent>
              <FileIcon>
                {getFileType(selectedFile) === '音频' ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3V13.55C11.41 13.21 10.73 13 10 13C7.79 13 6 14.79 6 17C6 19.21 7.79 21 10 21C12.21 21 14 19.21 14 17V7H18V3H12ZM10 19C8.9 19 8 18.1 8 17C8 15.9 8.9 15 10 15C11.1 15 12 15.9 12 17C12 18.1 11.1 19 10 19Z" fill="currentColor"/>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6.47L5.76 10H20V18H4V6.47ZM22 4H18L15.97 1.97C15.7 1.7 15.35 1.5 15 1.5H11C10.65 1.5 10.3 1.7 10.03 1.97L8 4H3.5C2.67 4 2 4.67 2 5.5V18.5C2 19.33 2.67 20 3.5 20H22.5C23.33 20 24 19.33 24 18.5V5.5C24 4.67 23.33 4 22.5 4H22Z" fill="currentColor"/>
                  </svg>
                )}
              </FileIcon>
              <FileButtonText>已选择{getFileType(selectedFile)}:</FileButtonText>
              <FileInfo>{getFileName(selectedFile)}</FileInfo>
            </ButtonContent>
            <ChangeFileText>更换</ChangeFileText>
          </>
        )}
      </FileButton>
      
      {selectedFile && showSubtitleFoundMessage && (
        <StatusMessage>
          <StatusIcon>✓</StatusIcon>
          检测到字幕文件，已自动加载
        </StatusMessage>
      )}
    </Container>
  );
}

export default FileSelector;