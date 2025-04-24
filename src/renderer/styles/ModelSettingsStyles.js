import styled from 'styled-components';

// 轻量级的模态框覆盖层
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  z-index: 1000;
  transition: all 0.2s ease-in-out;
  backdrop-filter: blur(3px);
`;

// 更新面板样式，与项目规范一致
export const ModalContent = styled.div`
  background-color: ${props => props.theme.colors.surface};
  height: 100vh;
  width: 420px;
  max-width: 90%;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.25s ease-out;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止外部滚动条出现 */
  
  @keyframes slideIn {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }
  
  /* 简化滚动条样式，避免双层滚动 */
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background-color: ${props => props.theme.colors.surfaceLight};
`;

export const ModalTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  display: flex;
  align-items: center;
  
  &::before {
    content: "⚙️";
    margin-right: 8px;
    font-size: 16px;
  }
`;

export const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 18px;
  cursor: pointer;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  
  &:hover {
    color: ${props => props.theme.colors.text};
    background-color: rgba(255, 255, 255, 0.08);
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0;
  flex: 1;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px; /* 增加标签和输入框之间的距离 */
`;

export const FormRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 16px; /* 添加行间距，让每行表单元素有明显分隔 */
  
  & > div {
    flex: 1;
  }
  
  &:last-child {
    margin-bottom: 0; /* 最后一行不需要底部间距 */
  }
`;

export const Label = styled.label`
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 2px;
  font-weight: 500;
`;

// 统一输入框样式，使用非常深的背景
export const baseInputStyles = `
  background-color: #1a1a1a;
  color: ${props => props.theme.colors.text};
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: ${props => props.theme.borderRadius};
  font-size: 13px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.secondary};
    box-shadow: 0 0 0 1px ${props => props.theme.colors.secondary + '40'};
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

// 减小输入框高度
export const Input = styled.input`
  ${props => baseInputStyles}
  padding: 6px 10px;
  height: 30px;
`;

// 减小下拉框高度
export const Select = styled.select`
  ${props => baseInputStyles}
  padding: 6px 10px;
  height: 30px;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff' width='18px' height='18px'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  cursor: pointer;
`;

// 调整文本区高度，增加最小高度确保显示更多内容
export const TextArea = styled.textarea`
  ${props => baseInputStyles}
  padding: 10px;
  min-height: 180px;
  line-height: 1.5;
  resize: none;
  flex: 1;
  width: 100%;
  overflow-y: auto;
  height: 100%;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  
  &::-webkit-scrollbar {
    width: 6px;
    display: block;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
`;

// 改进按钮样式，与ActionButton保持一致
export const Button = styled.button`
  background-color: ${props => props.primary ? props.theme.colors.secondary : 'transparent'};
  color: ${props => props.primary ? 'white' : props.theme.colors.secondary};
  border: 1px solid ${props => props.primary ? 'transparent' : props.theme.colors.secondary};
  border-radius: ${props => props.theme.borderRadius};
  padding: 4px 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  height: 28px;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.primary ? '#1a75bd' : 'rgba(33, 134, 208, 0.1)'};
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// 内容容器，包含所有表单元素，添加滚动
export const ContentContainer = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  max-height: calc(100vh - 110px);
  
  /* 添加滚动条样式 */
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

// 设置部分容器
export const SettingsSection = styled.div`
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
`;

// 章节标题
export const SectionTitle = styled.h4`
  font-size: 13px;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding-bottom: 6px;
`;

// 精度选择器
export const PrecisionSelector = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

// 精度选项，缩小尺寸，使用深色背景
export const PrecisionOption = styled.button`
  flex: 1;
  background-color: ${props => props.selected ? props.theme.colors.secondary : '#1a1a1a'};
  color: ${props => props.selected ? 'white' : props.theme.colors.text};
  border: 1px solid ${props => props.selected ? props.theme.colors.secondary : 'rgba(255, 255, 255, 0.08)'};
  border-radius: ${props => props.theme.borderRadius};
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 13px;
  
  &:hover {
    background-color: ${props => props.selected ? props.theme.colors.secondary : 'rgba(33, 134, 208, 0.1)'};
  }
`;

// 选项描述
export const OptionDescription = styled.span`
  font-size: 11px;
  opacity: 0.7;
  margin-top: 3px;
  text-align: center;
`;

// 提示词类型选择器
export const PromptTypeSelector = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 12px;
`;

// 提示词类型选项卡，减小尺寸
export const PromptTypeTab = styled.button`
  padding: 8px 12px;
  background: none;
  border: none;
  color: ${props => props.active ? props.theme.colors.secondary : props.theme.colors.textSecondary};
  font-size: 13px;
  font-weight: ${props => props.active ? '500' : '400'};
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  
  &:hover {
    color: ${props => props.active ? props.theme.colors.secondary : props.theme.colors.text};
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: ${props => props.active ? props.theme.colors.secondary : 'transparent'};
    transition: all 0.2s;
  }
`;

// 文本区域包装器
export const TextAreaWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 180px;
  margin-bottom: 8px;
  position: relative;
`;

// 提示词信息
export const PromptInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
`;

// 提示词提示
export const PromptTip = styled.div`
  font-size: 11px;
  color: ${props => props.theme.colors.textSecondary};
`;

// 标签高亮，使用半透明背景而非白色
export const TagHighlight = styled.code`
  background-color: rgba(255, 255, 255, 0.1);
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 11px;
`;

// 重置按钮
export const ResetButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.secondary};
  cursor: pointer;
  font-size: 11px;
  padding: 3px 6px;
  border-radius: ${props => props.theme.borderRadius};
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(33, 134, 208, 0.1);
    text-decoration: none;
  }
`;

// 按钮容器
export const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background-color: ${props => props.theme.colors.surfaceLight};
`;

/* 全局样式，修正下拉菜单选项的背景色 */
export const GlobalStyle = styled.div`
  /* 修改select下拉选项的背景色 */
  & select option {
    background-color: #121212 !important;
    color: ${props => props.theme.colors.text} !important; /* 强制使用浅色文本 */
  }
  
  & select {
    /* 确保选中时不会出现白色背景 */
    &:focus {
      background-color: #1a1a1a;
    }
    
    /* Safari和Chrome的下拉菜单需要特殊处理 */
    &::-webkit-listbox {
      background-color: #121212;
      color: ${props => props.theme.colors.text}; /* 确保使用浅色文本 */
    }
    
    /* 重要：对于Firefox和其他浏览器，使用-moz-和标准属性 */
    appearance: none !important;
    -moz-appearance: none !important;
    background-color: #1a1a1a !important;
    color: ${props => props.theme.colors.text} !important;
  }
  
  /* 确保所有输入元素使用浅色文本 */
  & input, & textarea, & select, & option {
    color: ${props => props.theme.colors.text} !important;
    background-color: #1a1a1a !important;
  }
  
  /* 使用-webkit-appearance: none让浏览器放弃使用原生样式 */
  & select {
    -webkit-appearance: none !important;
    -moz-appearance: none !important;
  }
  
  /* 确保内容区域可以滚动 */
  & ${ContentContainer} {
    overflow-y: auto !important;
    max-height: calc(100vh - 110px); /* 给头部和底部留出空间 */
  }
`;