import styled from 'styled-components';

// 容器样式
export const SummaryContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  overflow: hidden;
`;

export const SummaryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.medium};
  position: relative;
  background-color: transparent;
  z-index: 10;
  padding-bottom: 10px;
`;

export const SummaryTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  color: ${props => props.theme.colors.text};
`;

export const SummaryToolbar = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
`;

export const StatusMessage = styled.div`
  display: flex;
  align-items: center;
  color: ${props => props.success ? '#2ecc71' : props.error ? '#e74c3c' : props.theme.colors.textSecondary};
  font-size: 13px;
  margin-left: 12px;
  background-color: ${props => props.success ? 'rgba(46, 204, 113, 0.1)' : props.error ? 'rgba(231, 76, 60, 0.1)' : 'transparent'};
  padding: 4px 8px;
  border-radius: ${props => props.theme.borderRadius};
  transition: opacity 0.3s;
  opacity: ${props => props.visible ? 1 : 0};
`;

export const SummaryContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.small}; // 减小间距使布局更紧凑
  overflow-y: auto;
  padding-right: 6px; /* 给滚动条预留空间 */
  
  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 0; /* 改为直角 */
  }
`;

// 区块样式
export const SectionContainer = styled.div`
  background-color: ${props => props.theme.colors.surfaceLight};
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.small};
  margin-bottom: ${props => props.theme.spacing.small}; // 添加下边距
  position: relative;
`;

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.small};
`;

export const SectionTitle = styled.h4`
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
`;

export const SectionActions = styled.div`
  display: flex;
  gap: 4px;
`;

// 按钮样式
export const CopyButton = styled.button`
  background-color: transparent;
  color: ${props => props.theme.colors.secondary};
  border: none;
  border-radius: ${props => props.theme.borderRadius};
  padding: 2px 6px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: rgba(62, 166, 255, 0.1);
  }
`;

export const ActionButton = styled.button`
  background-color: ${props => props.primary ? props.theme.colors.secondary : 'transparent'};
  color: ${props => props.primary ? 'white' : props.theme.colors.secondary};
  border: 1px solid ${props => props.primary ? 'transparent' : props.theme.colors.secondary};
  border-radius: ${props => props.theme.borderRadius};
  padding: 4px 12px;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: ${props => props.primary ? '#2186d0' : 'rgba(33, 134, 208, 0.1)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: #606060;
    color: ${props => props.primary ? 'white' : '#606060'};
  }
`;

export const ButtonIcon = styled.span`
  margin-right: 6px;
  font-size: 16px;
  display: flex;
  align-items: center;
`;

export const SummaryActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: ${props => props.theme.spacing.medium};
  padding-bottom: 16px;
`;

// 文本区域样式
export const SummaryTextArea = styled.textarea`
  width: 100%;
  background-color: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  border: none;
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.small};
  font-family: ${props => props.theme.fonts.main};
  resize: none;
  outline: none;
  font-size: ${props => props.isTitle ? '18px' : '15px'}; // 调整字体大小
  font-weight: ${props => props.isTitle ? 'bold' : 'normal'};
  line-height: 1.5;
  min-height: ${props => props.minHeight || '80px'};
  height: auto;
  overflow-y: auto;
  
  &:focus {
    box-shadow: inset 0 0 0 1px ${props => props.theme.colors.secondary};
  }
`;

// 加载状态样式
export const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 100;
  color: white;
  backdrop-filter: blur(3px);
`;

export const Spinner = styled.div`
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 3px solid ${props => props.theme.colors.secondary};
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// 空状态样式
export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 14px;
  text-align: center;
  padding: ${props => props.theme.spacing.large};
`;

// 计时信息样式
export const TimingInfo = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  opacity: 0.9;
`;