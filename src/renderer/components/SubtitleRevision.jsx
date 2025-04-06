import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const RevisionContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const RevisionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.medium};
`;

const RevisionTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  color: ${props => props.theme.colors.text};
`;

const RevisionContent = styled.div`
  flex: 1;
  background-color: ${props => props.theme.colors.surfaceLight};
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.medium};
  overflow-y: auto;
`;

const RevisionItem = styled.div`
  padding: ${props => props.theme.spacing.small};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  &.selected {
    background-color: rgba(62, 166, 255, 0.1);
    border-left: 3px solid ${props => props.theme.colors.secondary};
  }
`;

const RevisionTime = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 4px;
`;

const RevisionText = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.text};
`;

const RevisionOriginal = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  text-decoration: line-through;
  font-size: 12px;
  margin-bottom: 2px;
`;

const RevisionNew = styled.div`
  color: #2ecc71;
  font-size: 12px;
`;

const ActionButton = styled.button`
  background-color: transparent;
  color: ${props => props.theme.colors.secondary};
  border: 1px solid ${props => props.theme.colors.secondary};
  border-radius: ${props => props.theme.borderRadius};
  padding: 4px 12px;
  cursor: pointer;
  font-size: 13px;
  margin-left: 10px;
  
  &:hover {
    background-color: rgba(33, 134, 208, 0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: #606060;
    color: #606060;
  }
`;

const RevisionActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${props => props.theme.spacing.medium};
`;

const EmptyState = styled.div`
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

function SubtitleRevision({ subtitlePath, subtitleContent, onApplyRevision }) {
  const [revisions, setRevisions] = useState([]);
  const [selectedRevision, setSelectedRevision] = useState(null);
  
  // 模拟从API加载修订历史
  useEffect(() => {
    if (subtitlePath && subtitleContent) {
      // 这里只是模拟数据，实际应用中应该从API获取真实的修订建议
      const mockRevisions = [
        {
          id: 1,
          timestamp: new Date().toLocaleString(),
          originalText: "这是原始的文本，可能有一些错别字或语法问题",
          revisedText: "这是修正后的文本，已经修复了错别字和语法问题",
          segment: "00:01:15,000 --> 00:01:20,000"
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 60000).toLocaleString(),
          originalText: "我们需要确保字幕的准确性和流畅度",
          revisedText: "我们需要确保字幕的准确性和流畅性",
          segment: "00:02:30,000 --> 00:02:35,000"
        },
        {
          id: 3,
          timestamp: new Date(Date.now() - 120000).toLocaleString(),
          originalText: "AI可以帮助我们提升工作效率",
          revisedText: "人工智能可以帮助我们提升工作效率",
          segment: "00:03:45,000 --> 00:03:50,000"
        }
      ];
      
      setRevisions(mockRevisions);
    } else {
      setRevisions([]);
    }
  }, [subtitlePath, subtitleContent]);

  const handleRevisionSelect = (revision) => {
    setSelectedRevision(revision.id === selectedRevision ? null : revision.id);
  };
  
  const handleApplyRevision = () => {
    if (selectedRevision) {
      const revision = revisions.find(r => r.id === selectedRevision);
      if (revision && onApplyRevision) {
        onApplyRevision(revision);
      }
    }
  };
  
  const handleApplyAllRevisions = () => {
    if (revisions.length > 0 && onApplyRevision) {
      // 应用所有修订
      revisions.forEach(revision => {
        onApplyRevision(revision);
      });
    }
  };

  return (
    <RevisionContainer>
      <RevisionHeader>
        <RevisionTitle>字幕修订建议</RevisionTitle>
      </RevisionHeader>
      
      {revisions.length > 0 ? (
        <>
          <RevisionContent>
            {revisions.map(revision => (
              <RevisionItem 
                key={revision.id}
                className={selectedRevision === revision.id ? 'selected' : ''}
                onClick={() => handleRevisionSelect(revision)}
              >
                <RevisionTime>
                  {revision.segment} | {revision.timestamp}
                </RevisionTime>
                <RevisionOriginal>
                  {revision.originalText}
                </RevisionOriginal>
                <RevisionNew>
                  {revision.revisedText}
                </RevisionNew>
              </RevisionItem>
            ))}
          </RevisionContent>
          
          <RevisionActions>
            <ActionButton 
              onClick={handleApplyRevision} 
              disabled={selectedRevision === null}
            >
              应用选中
            </ActionButton>
            <ActionButton onClick={handleApplyAllRevisions}>
              应用全部
            </ActionButton>
          </RevisionActions>
        </>
      ) : (
        <EmptyState>
          <p>暂无字幕修订建议</p>
          <p>当生成字幕后，修订建议将显示在这里</p>
        </EmptyState>
      )}
    </RevisionContainer>
  );
}

export default SubtitleRevision;