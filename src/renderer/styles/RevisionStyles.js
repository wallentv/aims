import styled from 'styled-components';

// 主容器
export const RevisionContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

export const RevisionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.medium};
  position: relative;
  z-index: 10;
  padding-bottom: 10px;
`;

export const RevisionTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  color: ${props => props.theme.colors.text};
`;

export const RevisionToolbar = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
`;

export const RevisionContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`;

export const RevisionTextArea = styled.textarea`
  flex: 1;
  background-color: ${props => props.theme.colors.surfaceLight};
  color: ${props => props.theme.colors.text};
  border: none;
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.medium};
  font-family: monospace;
  resize: none;
  outline: none;
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: ${props => props.theme.spacing.small};
  height: auto;
  min-height: 100px;
  overflow-y: auto;
  
  &:focus {
    box-shadow: inset 0 0 0 1px ${props => props.theme.colors.secondary};
  }
`;

// 可折叠的修订摘要
export const CollapsibleSummary = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius};
  margin-bottom: ${props => props.theme.spacing.medium};
  border-left: 3px solid ${props => props.theme.colors.secondary};
  overflow: hidden;
  transition: max-height 0.3s ease;
  max-height: ${props => props.isCollapsed ? '42px' : '200px'};
`;

export const SummaryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.small} ${props => props.theme.spacing.medium};
  font-size: 13px;
  font-weight: 500;
  background-color: rgba(33, 134, 208, 0.1);
  border-bottom: ${props => props.isCollapsed ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'};
  cursor: pointer;
`;

export const SummaryContent = styled.div`
  padding: ${props => props.theme.spacing.medium};
  font-size: 13px;
  max-height: ${props => props.isCollapsed ? '0' : '150px'};
  overflow-y: auto;
  opacity: ${props => props.isCollapsed ? 0 : 1};
  transition: max-height 0.3s ease, opacity 0.3s ease;
`;

export const CollapseIcon = styled.span`
  transform: ${props => props.isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)'};
  transition: transform 0.3s ease;
  font-size: 12px;
  display: inline-block;
`;

// 按钮和其他通用样式
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
    color: #606060;
  }
`;

export const ButtonIcon = styled.span`
  margin-right: 6px;
  font-size: 16px;
  display: flex;
  align-items: center;
`;

export const RevisionActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: ${props => props.theme.spacing.medium};
  padding-bottom: 16px;
`;

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

export const SaveTime = styled.span`
  font-weight: normal;
  margin-left: 5px;
`;

// 确认对话框
export const ConfirmDialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const DialogContent = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.medium};
  max-width: 400px;
  width: 90%;
`;

export const DialogTitle = styled.h3`
  font-size: 16px;
  margin-top: 0;
  margin-bottom: ${props => props.theme.spacing.medium};
`;

export const DialogActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${props => props.theme.spacing.medium};
  gap: 8px;
`;