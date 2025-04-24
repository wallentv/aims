import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  ActionButton, 
  ButtonIcon, 
  EmptyState, 
  ConfirmDialog, 
  DialogContent, 
  DialogTitle, 
  DialogActions 
} from '../styles/RevisionStyles';

// 历史记录相关样式
const HistorySidebar = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 320px;
  height: 100vh;
  background-color: ${props => props.theme.colors.surface};
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3);
  transform: translateX(${props => props.isOpen ? '0' : '100%'});
  transition: transform 0.3s ease;
`;

const HistoryOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: opacity 0.2s ease, visibility 0.2s ease;
`;

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.small} ${props => props.theme.spacing.medium};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const HistoryTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
`;

const HistoryClose = styled.div`
  cursor: pointer;
  opacity: 0.7;
  &:hover {
    opacity: 1;
  }
`;

const HistoryList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${props => props.theme.spacing.small};
`;

const HistoryItem = styled.div`
  background-color: ${props => props.isSelected ? 'rgba(62, 166, 255, 0.1)' : props.theme.colors.surfaceLight};
  border-left: ${props => props.isSelected ? '3px solid #3ea6ff' : '3px solid transparent'};
  margin-bottom: ${props => props.theme.spacing.small};
  padding: ${props => props.theme.spacing.small} ${props => props.theme.spacing.medium};
  border-radius: ${props => props.theme.borderRadius};
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.isSelected ? 'rgba(62, 166, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)'};
  }
`;

const HistoryItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const HistoryItemTime = styled.div`
  font-size: 11px;
  opacity: 0.7;
`;

const HistoryItemSummary = styled.div`
  max-height: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const HistoryFooter = styled.div`
  padding: ${props => props.theme.spacing.medium};
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
  margin-top: auto;
`;

/**
 * 字幕修订历史记录组件
 */
const RevisionHistory = ({ 
  isOpen, 
  onClose, 
  history = [], 
  selectedItem, 
  onSelectItem, 
  onClearHistory 
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleSelectItem = (item) => {
    if (onSelectItem) {
      onSelectItem(item);
    }
  };

  const handleClearConfirm = () => {
    setShowConfirmDialog(false);
    if (onClearHistory) {
      onClearHistory();
    }
  };

  return (
    <>
      <HistoryOverlay isOpen={isOpen} onClick={onClose} />
      <HistorySidebar isOpen={isOpen}>
        <HistoryHeader>
          <HistoryTitle>历史修订记录</HistoryTitle>
          <HistoryClose onClick={onClose}>✕</HistoryClose>
        </HistoryHeader>
        <HistoryList>
          {history.length === 0 ? (
            <EmptyState>
              <p>暂无历史记录</p>
            </EmptyState>
          ) : (
            history.map(item => (
              <HistoryItem 
                key={item.id} 
                isSelected={selectedItem === item.id}
                onClick={() => handleSelectItem(item)}
              >
                <HistoryItemHeader>
                  <div>修订版本</div>
                  <HistoryItemTime>{item.timestamp}</HistoryItemTime>
                </HistoryItemHeader>
                <HistoryItemSummary>
                  {item.summary.split(/\n/)[0]}
                </HistoryItemSummary>
              </HistoryItem>
            ))
          )}
        </HistoryList>
        <HistoryFooter>
          {history.length > 0 && (
            <ActionButton 
              onClick={() => setShowConfirmDialog(true)}
              title="清除所有历史记录"
            >
              <ButtonIcon>
                <span role="img" aria-label="clear">🗑️</span>
              </ButtonIcon>
              清除历史记录
            </ActionButton>
          )}
        </HistoryFooter>
      </HistorySidebar>

      {/* 确认对话框 */}
      {showConfirmDialog && (
        <ConfirmDialog>
          <DialogContent>
            <DialogTitle>确认清除历史记录</DialogTitle>
            <p>确定要清除所有历史修订记录吗？此操作不可撤销。</p>
            <DialogActions>
              <ActionButton onClick={() => setShowConfirmDialog(false)}>
                取消
              </ActionButton>
              <ActionButton primary onClick={handleClearConfirm}>
                确认清除
              </ActionButton>
            </DialogActions>
          </DialogContent>
        </ConfirmDialog>
      )}
    </>
  );
};

export default RevisionHistory;