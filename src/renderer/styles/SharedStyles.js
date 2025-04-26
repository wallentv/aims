import styled from 'styled-components';

// 共享组件容器样式 - 用于所有字幕相关模块
export const ModuleContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
`;

// 统一的头部工具栏
export const ModuleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  position: relative;
  z-index: 10;
`;

// 统一的工具栏布局
export const ModuleToolbar = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
  align-items: center;
`;

// 统一的内容区域
export const ModuleContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`;

// 统一的文本区域样式
export const TextEditor = styled.textarea`
  flex: 1;
  background-color: ${props => props.theme.colors.surfaceLight};
  color: ${props => props.theme.colors.text};
  border: none;
  border-radius: ${props => props.theme.borderRadius};
  padding: 12px;
  font-family: ${props => props.isMonospace ? 'monospace' : 'inherit'};
  resize: none;
  outline: none;
  font-size: ${props => props.isTitle ? '16px' : '14px'};
  line-height: 1.5;
  min-height: ${props => props.minHeight || '100px'};
  overflow-y: auto;
  margin-bottom: ${props => props.noMargin ? '0' : '8px'};
  
  &:focus {
    box-shadow: inset 0 0 0 1px ${props => props.theme.colors.secondary};
  }

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 0; /* 改为直角 */
  }
`;

// 统一的按钮样式
export const ActionButton = styled.button`
  background-color: ${props => props.primary ? props.theme.colors.secondary : 'transparent'};
  color: ${props => props.primary ? 'white' : props.theme.colors.secondary};
  border: 1px solid ${props => props.primary ? 'transparent' : props.theme.colors.secondary};
  border-radius: ${props => props.theme.borderRadius};
  padding: 4px 10px;
  cursor: pointer;
  font-size: 13px;
  height: 28px;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.primary ? '#2186d0' : 'rgba(33, 134, 208, 0.1)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: #606060;
    color: ${props => props.primary ? 'white' : '#606060'};
    background-color: ${props => props.primary ? '#606060' : 'transparent'};
  }
`;

// 统一的按钮图标
export const ButtonIcon = styled.span`
  margin-right: 6px;
  font-size: 14px;
  display: flex;
  align-items: center;
`;

// 统一的底部操作栏
export const ActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
  padding-bottom: 8px;
`;

// 统一的空状态提示
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

// 统一的加载遮罩
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
  backdrop-filter: blur(2px);
`;

// 统一的加载动画
export const Spinner = styled.div`
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  border-top: 3px solid ${props => props.theme.colors.secondary};
  width: 28px;
  height: 28px;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// 统一的状态消息提示
export const StatusMessage = styled.div`
  display: flex;
  align-items: center;
  color: ${props => props.success ? '#2ecc71' : props.error ? '#e74c3c' : props.theme.colors.textSecondary};
  font-size: 13px;
  margin-left: 10px;
  background-color: ${props => props.success ? 'rgba(46, 204, 113, 0.1)' : props.error ? 'rgba(231, 76, 60, 0.1)' : 'transparent'};
  padding: 3px 8px;
  border-radius: ${props => props.theme.borderRadius};
  transition: opacity 0.2s;
  opacity: ${props => props.visible ? 1 : 0};
  flex-shrink: 0;
  height: 26px;
`;

// 统一的保存时间显示
export const SaveTime = styled.span`
  font-weight: normal;
  margin-left: 5px;
  font-size: 12px;
  opacity: 0.8;
`;

// 可折叠的摘要区域 - 用于字幕修订模块
export const CollapsiblePanel = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius};
  margin-bottom: 10px;
  border-left: 3px solid ${props => props.theme.colors.secondary};
  overflow: hidden;
  transition: max-height 0.3s ease;
  max-height: ${props => props.isCollapsed ? '36px' : '180px'};
`;

export const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  font-size: 13px;
  font-weight: 500;
  background-color: rgba(33, 134, 208, 0.08);
  border-bottom: ${props => props.isCollapsed ? 'none' : '1px solid rgba(255, 255, 255, 0.05)'};
  cursor: pointer;
`;

export const PanelContent = styled.div`
  padding: 10px;
  font-size: 13px;
  max-height: ${props => props.isCollapsed ? '0' : '140px'};
  overflow-y: auto;
  opacity: ${props => props.isCollapsed ? 0 : 1};
  transition: max-height 0.3s ease, opacity 0.3s ease;
`;

export const CollapseIcon = styled.span`
  transform: ${props => props.isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)'};
  transition: transform 0.3s ease;
  font-size: 10px;
  display: inline-block;
`;

// 分段面板 - 用于字幕总结模块
export const SectionContainer = styled.div`
  margin-bottom: 12px;
`;

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

export const SectionTitle = styled.h4`
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: ${props => props.theme.colors.textSecondary};
`;

export const SectionActions = styled.div`
  display: flex;
`;

export const CopyButton = styled.button`
  background-color: transparent;
  color: ${props => props.theme.colors.textSecondary};
  border: none;
  padding: 2px 6px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  border-radius: ${props => props.theme.borderRadius};
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

// 耗时信息显示
export const TimingInfo = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
  padding: 3px 8px;
  border-radius: ${props => props.theme.borderRadius};
  font-size: 12px;
  opacity: 0.9;
`;

// 进度显示区域
export const ProgressDisplay = styled.div`
  background-color: ${props => props.theme.colors.surfaceLight};
  padding: 10px;
  border-radius: ${props => props.theme.borderRadius};
  margin-bottom: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
`;

export const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
`;

export const ProgressInfo = styled.div`
  display: flex;
  align-items: center;
  font-size: 13px;
  color: ${props => props.theme.colors.secondary};
  font-weight: 500;
`;

export const ProgressValue = styled.span`
  margin-left: auto;
  font-weight: bold;
`;

// 最小化进度显示
export const MinimalProgress = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  
  .progress-value {
    font-size: 18px;
    font-weight: bold;
    color: ${props => props.theme.colors.secondary};
    text-align: center;
    margin: 6px 0;
  }
`;