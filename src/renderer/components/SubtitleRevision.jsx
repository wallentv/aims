import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { 
  getFullModelSettings, 
  saveFullModelSettings,
  getActiveProvider 
} from '../utils/ModelConfig';

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

const RevisionToolbar = styled.div`
  display: flex;
  gap: 8px;
`;

const RevisionContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`;

const RevisionTextArea = styled.textarea`
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
  margin-bottom: ${props => props.theme.spacing.medium};
  height: auto;
  min-height: 100px;
  overflow-y: auto;
  
  &:focus {
    box-shadow: inset 0 0 0 1px ${props => props.theme.colors.secondary};
  }
`;

// 可折叠的修订摘要
const CollapsibleSummary = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius};
  margin-bottom: ${props => props.theme.spacing.medium};
  border-left: 3px solid ${props => props.theme.colors.secondary};
  overflow: hidden;
  transition: max-height 0.3s ease;
  max-height: ${props => props.isCollapsed ? '42px' : '200px'};
`;

const SummaryHeader = styled.div`
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

const SummaryContent = styled.div`
  padding: ${props => props.theme.spacing.medium};
  font-size: 13px;
  max-height: ${props => props.isCollapsed ? '0' : '150px'};
  overflow-y: auto;
  opacity: ${props => props.isCollapsed ? 0 : 1};
  transition: max-height 0.3s ease, opacity 0.3s ease;
`;

const CollapseIcon = styled.span`
  transform: ${props => props.isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)'};
  transition: transform 0.3s ease;
  font-size: 12px;
  display: inline-block;
`;

// 历史修订记录面板
const HistoryPanel = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 300px;
  background-color: ${props => props.theme.colors.surface};
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  transform: translateX(${props => props.isOpen ? '0' : '100%'});
  transition: transform 0.3s ease;
  z-index: 10;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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

const HistoryActions = styled.div`
  display: flex;
  gap: 8px;
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

// 按钮和其他样式
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

const ActionButton = styled.button`
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

const ButtonIcon = styled.span`
  margin-right: 6px;
  font-size: 16px;
  display: flex;
  align-items: center;
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

const LoadingOverlay = styled.div`
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

const Spinner = styled.div`
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

const SaveNotification = styled.div`
  background-color: rgba(46, 204, 113, 0.1);
  padding: ${props => props.theme.spacing.small};
  border-radius: ${props => props.theme.borderRadius};
  color: #2ecc71;
  font-size: 13px;
  display: flex;
  align-items: center;
  margin-right: 10px;
  flex: 1;
`;

const SaveTime = styled.span`
  font-weight: normal;
  margin-left: 5px;
`;

const HistoryFooter = styled.div`
  padding: ${props => props.theme.spacing.small} ${props => props.theme.spacing.medium};
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: flex-end;
`;

// 弹窗样式
const ConfirmDialog = styled.div`
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

const DialogContent = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.medium};
  max-width: 400px;
  width: 90%;
`;

const DialogTitle = styled.h3`
  font-size: 16px;
  margin-top: 0;
  margin-bottom: ${props => props.theme.spacing.medium};
`;

const DialogActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${props => props.theme.spacing.medium};
  gap: 8px;
`;

// 定义历史记录项的类型
const createHistoryItem = (summary, content, timestamp) => ({
  summary,
  content,
  timestamp,
  id: Date.now() // 唯一ID
});

function SubtitleRevision({ subtitlePath, initialContent, content, onContentChange, onSaveRevision, onSummaryUpdate, modelSettings }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [hasSettings, setHasSettings] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // 新增状态
  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [revisionHistory, setRevisionHistory] = useState([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  // 新增计时相关状态
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalTime, setTotalTime] = useState(null);
  const [showTimeSpent, setShowTimeSpent] = useState(false); // 新增状态：控制总耗时提示的显示
  const timerRef = useRef(null);
  const timeoutRef = useRef(null); // 新增引用：用于保存自动隐藏计时器

  // 初始化修订内容（只有当内容为空且有初始内容时才设置）
  useEffect(() => {
    if (subtitlePath && initialContent && !content && onContentChange) {
      // 只在内容为空时初始化
      onContentChange(initialContent);
    }
  }, [subtitlePath, initialContent, content, onContentChange]);

  // 检查是否有有效的模型设置
  useEffect(() => {
    if (modelSettings) {
      setHasSettings(Boolean(modelSettings.apiKey && modelSettings.apiUrl));
    } else {
      setHasSettings(false);
    }
  }, [modelSettings]);
  
  // 加载历史记录
  useEffect(() => {
    try {
      // 加载历史记录
      if (subtitlePath) {
        const historyKey = `revisionHistory_${subtitlePath}`;
        const savedHistory = localStorage.getItem(historyKey);
        if (savedHistory) {
          const parsedHistory = JSON.parse(savedHistory);
          setRevisionHistory(parsedHistory);
        }
      }
    } catch (error) {
      console.error('加载历史记录出错:', error);
    }
  }, [subtitlePath]);

  // 当摘要更新时，通知父组件
  useEffect(() => {
    if (onSummaryUpdate && summary) {
      onSummaryUpdate(summary);
    }
  }, [summary, onSummaryUpdate]);

  // 监听保存完成事件
  useEffect(() => {
    const handleSubtitleSaved = (data) => {
      console.log('字幕修订保存成功，时间：', data.saveTime);
      setLastSaveTime(data.saveTime);
      setShowSaveNotification(true);
      setIsSaving(false); // 确保保存状态被重置
      
      // 3秒后自动隐藏保存通知
      const timer = setTimeout(() => {
        setShowSaveNotification(false);
      }, 3000);
      
      // 如果有修订摘要或内容变化，则保存到历史记录
      if (content && subtitlePath) {
        // 获取最新的历史记录（不依赖于旧的状态）
        try {
          const historyKey = `revisionHistory_${subtitlePath}`;
          const savedHistory = localStorage.getItem(historyKey);
          let currentHistory = [];
          
          if (savedHistory) {
            currentHistory = JSON.parse(savedHistory);
          }
          
          // 创建新的历史记录项
          const newHistoryItem = createHistoryItem(
            // 优先使用从保存事件接收到的摘要，其次是当前摘要状态
            data.summary || summary || '手动修订',
            content, 
            data.saveTime
          );
          
          // 改进的重复检测逻辑
          let isDuplicate = false;
          
          // 检查最近一次的记录是否与当前保存内容完全相同
          if (currentHistory.length > 0) {
            const lastItem = currentHistory[0];
            
            // 比较内容（规范化空白字符和行尾）
            const normalizedNewContent = content.replace(/\s+/g, ' ').trim();
            const normalizedOldContent = lastItem.content.replace(/\s+/g, ' ').trim();
            
            // 从摘要中提取基础内容（移除耗时信息）
            const newSummaryBase = (data.summary || summary || '手动修订').replace(/\n耗时:.+$/s, '').trim();
            const oldSummaryBase = lastItem.summary.replace(/\n耗时:.+$/s, '').trim();
            
            // 如果内容和基础摘要都相同则视为重复
            if (normalizedNewContent === normalizedOldContent && newSummaryBase === oldSummaryBase) {
              isDuplicate = true;
              console.log('检测到重复的修订记录，已跳过');
            }
          }
          
          if (!isDuplicate) {
            // 添加新记录到历史
            const updatedHistory = [newHistoryItem, ...currentHistory].slice(0, 20); // 最多保留20条记录
            
            // 保存到本地存储
            localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
            
            // 更新状态
            setRevisionHistory(updatedHistory);
            console.log('已添加新的修订记录');
          }
        } catch (e) {
          console.error('保存或获取历史记录失败:', e);
        }
      }
      
      return () => clearTimeout(timer);
    };
    
    window.electron.onSubtitleSaved(handleSubtitleSaved);
    
    // 组件卸载时清除监听器
    return () => {
      // Electron API可能不支持移除特定监听器
      // 这里依赖Electron的清理机制
    };
  }, [subtitlePath, content, summary]); // 只依赖这三个变量，不依赖revisionHistory

  // 使用AI修订字幕
  const handleReviseSubtitle = async () => {
    if (!hasSettings || !content || !modelSettings) {
      return;
    }

    setLoading(true);
    setSummary('');
    setIsSummaryCollapsed(false); // 确保摘要展开
    // 设置开始时间并启动计时器
    const start = Date.now();
    setStartTime(start);
    setElapsedTime(0);
    setTotalTime(null);
    setShowTimeSpent(false); // 确保隐藏总耗时提示
    
    // 启动计时器，每秒更新一次经过的时间
    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    
    try {
      // 使用字幕修订专用的提示词模板
      const prompt = modelSettings.revisionPromptTemplate.replace('{{subtitle}}', content);
      
      // 准备API请求
      const response = await fetch(modelSettings.apiUrl + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${modelSettings.apiKey}`
        },
        body: JSON.stringify({
          model: modelSettings.modelId,
          messages: [
            { role: "user", content: prompt }
          ],
          temperature: 0.3
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || '请求失败，请检查您的API设置');
      }

      if (data.choices && data.choices.length > 0) {
        const result = data.choices[0].message.content;
        
        // 提取字幕和总结
        const summaryMarkers = [
          "总结:", "修订总结:", "字幕修订总结:", 
          "修改总结:", "总结：", "修订总结：",
          "修改总结：", "字幕修订总结："
        ];
        
        let revisedContent = result;
        let revisionSummary = '';

        // 查找总结部分
        for (const marker of summaryMarkers) {
          const index = result.indexOf(marker);
          if (index !== -1) {
            revisedContent = result.substring(0, index).trim();
            revisionSummary = result.substring(index).trim();
            break;
          }
        }
        
        // 清除字幕内容中可能的头尾说明文字
        const cleanedContent = cleanSubtitleContent(revisedContent);
        
        // 更新字幕和总结
        if (onContentChange) {
          onContentChange(cleanedContent);
        }
        
        // 计算总耗时
        const timeSpent = Math.floor((Date.now() - start) / 1000);
        setTotalTime(timeSpent);
        
        // 在修订摘要中添加耗时信息
        const timeInfo = `\n耗时: ${formatTime(timeSpent)}`;
        const summaryWithTime = revisionSummary + timeInfo;
        
        setSummary(summaryWithTime);
        
        // 将总结传递给父组件
        if (onSummaryUpdate) {
          onSummaryUpdate(summaryWithTime);
        }
        
        // 显示总耗时提示并设置自动隐藏
        setShowTimeSpent(true);
        timeoutRef.current = setTimeout(() => {
          setShowTimeSpent(false);
        }, 5000); // 5秒后自动隐藏
      }
    } catch (error) {
      console.error('AI修订字幕出错:', error);
      const timeSpent = Math.floor((Date.now() - start) / 1000);
      const errorSummary = `修订失败: ${error.message || '未知错误'}\n耗时: ${formatTime(timeSpent)}`;
      setSummary(errorSummary);
      setTotalTime(timeSpent);
      
      // 将错误总结也传递给父组件
      if (onSummaryUpdate) {
        onSummaryUpdate(errorSummary);
      }
    } finally {
      // 停止计时器
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setLoading(false);
    }
  };

  // 格式化时间为分:秒格式
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}分${remainingSeconds}秒`;
  };

  // 清理字幕内容，去除头尾的说明文字
  const cleanSubtitleContent = (content) => {
    if (!content) return '';
    
    // 常见的头部标记，如"以下是修订后的字幕："等
    const headerMarkers = [
      "以下是修订后的字幕：", "以下是修订后的字幕:", 
      "修订后的字幕：", "修订后的字幕:", 
      "以下是修改后的字幕：", "以下是修改后的字幕:", 
      "修改后的字幕：", "修改后的字幕:",
      "修订结果：", "修订结果:",
      "字幕内容：", "字幕内容:",
      "修订后：", "修订后:",
      "修改后：", "修改后:",
      "AI修订结果：", "AI修订结果:",
      "这是修订后的字幕：", "这是修订后的字幕:", 
      "修订版本：", "修订版本:",
      "字幕修订版：", "字幕修订版:",
      "调整后的字幕：", "调整后的字幕:",
      "优化后的字幕：", "优化后的字幕:",
      "```", "\"\"\"", "'''", "字幕：",
      "以下是修正后的SRT字幕", "以下是修正后的字幕",
      "以下是优化后的SRT字幕", "以下是优化后的字幕",
      "以下是校对后的SRT字幕", "以下是校对后的字幕",
      "以下是更新后的SRT字幕", "以下是更新后的字幕",
      "以下是精修后的SRT字幕", "以下是精修后的字幕",
      "以下是修改过的SRT字幕", "修改过的SRT字幕",
      "修订后的SRT字幕", "修正后的SRT字幕",
      "优化后的SRT字幕", "校对后的SRT字幕"
    ];
    
    // 常见的尾部标记
    const footerMarkers = [
      "以上是修订后的字幕", "以上就是修订后的字幕", 
      "这是修订后的字幕", "修订完成",
      "以上是修改后的字幕", "以上就是修改后的字幕",
      "以上是AI修订后的字幕", "以上内容已修订完毕",
      "字幕修订完毕", "AI修订已完成",
      "修订结束", "以上",
      "字幕结束", "修订内容结束", 
      "```", "\"\"\"", "'''", 
      "以上就是全部内容", "这是全部字幕内容",
      "字幕内容到此结束", "END", "---",
      "希望这个修订版本对您有帮助", "希望这些修改对您有帮助",
      "以上是修正后的字幕", "以上是优化后的字幕",
      "以上是校对后的字幕", "以上是精修后的字幕",
      "修订已完成", "修正已完成", "优化已完成",
      "字幕格式已保持不变", "保持了原有的时间轴和编号"
    ];
    
    let cleanedContent = content.trim();
    
    // 首先检查SRT字幕的特征 - 通常以编号开始，如"1"，然后是时间轴如"00:00:01,000 --> 00:00:05,000"
    const srtPattern = /^\d+\s*\r?\n\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}/;
    
    // 如果已经是标准SRT格式，则不需要过多清理
    if (srtPattern.test(cleanedContent)) {
      // 即使是标准SRT格式，也检查并删除最后的反引号
      cleanedContent = removeTrailingMarkdownMarkers(cleanedContent);
      return cleanedContent;
    }
    
    // 尝试查找第一个看起来像SRT条目的内容 (数字 + 时间轴)
    const srtEntryPattern = /^\s*(\d+)\s*\r?\n\s*(\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3})/m;
    const match = cleanedContent.match(srtEntryPattern);
    
    if (match) {
      // 找到了SRT条目，截取从这里开始的内容
      const startIndex = cleanedContent.indexOf(match[0]);
      cleanedContent = cleanedContent.substring(startIndex);
      
      // 查找最后一个SRT条目
      const lines = cleanedContent.split(/\r?\n/);
      let lastSrtIndex = -1;
      
      // 从后向前查找，找到最后一个编号
      for (let i = lines.length - 1; i >= 0; i--) {
        // 检查是否是编号行（单独的数字）
        if (/^\s*\d+\s*$/.test(lines[i])) {
          const nextIndex = i + 1;
          // 确认下一行是时间轴
          if (nextIndex < lines.length && /\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}/.test(lines[nextIndex])) {
            // 找到这个条目后的内容结束位置（空行或文件结束）
            let entryEndIndex = i;
            for (let j = i + 2; j < lines.length; j++) {
              if (lines[j].trim() === '') {
                entryEndIndex = j;
                break;
              }
              // 如果到了最后一行或发现了另一个编号
              if (j === lines.length - 1 || /^\s*\d+\s*$/.test(lines[j])) {
                entryEndIndex = j;
                break;
              }
            }
            
            // 提取到该条目结束
            if (entryEndIndex > i) {
              cleanedContent = lines.slice(0, entryEndIndex + 1).join('\n');
            }
            break;
          }
        }
      }
      
      // 删除最后的反引号
      cleanedContent = removeTrailingMarkdownMarkers(cleanedContent);
      return cleanedContent;
    }
    
    // 如果不是SRT格式，则执行通用文本清理
    
    // 移除头部标记（增强版）
    let lines = cleanedContent.split(/\r?\n/);
    let foundSrtStart = false;
    
    // 首先寻找看起来像SRT的起始内容
    for (let i = 0; i < lines.length; i++) {
      // 检查当前行是否是数字（SRT编号）
      if (/^\s*\d+\\s*$/.test(lines[i])) {
        // 检查下一行是否包含时间轴格式
        if (i + 1 < lines.length && /\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}/.test(lines[i + 1])) {
          // 找到SRT起始点，保留从这里开始的内容
          lines = lines.slice(i);
          foundSrtStart = true;
          break;
        }
      }
    }
    
    // 如果没找到SRT开始，使用更通用的头部标记清理
    if (!foundSrtStart) {
      // 移除空行和只包含头部标记的行
      while (lines.length > 0) {
        const firstLine = lines[0].trim();
        
        // 检查是否是空行或只包含头部标记
        if (firstLine === "" || headerMarkers.some(marker => 
          firstLine === marker || 
          firstLine.startsWith(marker) ||
          // 新增：检查更长的说明文本，如"以下是修正后的SRT字幕文件，已按照您的要求..."
          firstLine.includes("以下是") && (
            firstLine.includes("SRT字幕") || 
            firstLine.includes("修订后") ||
            firstLine.includes("修正后") ||
            firstLine.includes("修改后") ||
            firstLine.includes("优化后")
          )
        )) {
          lines.shift(); // 移除这一行
        } else {
          // 检查更长复杂的说明文本
          const combinedText = lines.slice(0, Math.min(5, lines.length)).join(' ');
          
          let foundComplex = false;
          const complexPhrases = [
            "以下是修正后的SRT字幕文件",
            "以下是修订后的SRT字幕",
            "按照您的要求",
            "保持时间标记",
            "保持编号",
            "优化文字内容",
            "以下是AI优化后的",
            "以下是我修改后的",
            "我已经修改了字幕"
          ];
          
          // 检查前几行中是否包含复杂说明性短语
          for (const phrase of complexPhrases) {
            if (combinedText.includes(phrase)) {
              foundComplex = true;
              break;
            }
          }
          
          if (foundComplex) {
            // 尝试找到第一个SRT格式条目的开头
            let srtStartIndex = -1;
            for (let i = 0; i < Math.min(lines.length, 20); i++) { // 只在前20行查找
              if (/^\s*\d+\s*$/.test(lines[i]) && 
                  i + 1 < lines.length && 
                  /\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}/.test(lines[i + 1])) {
                srtStartIndex = i;
                break;
              }
            }
            
            if (srtStartIndex !== -1) {
              lines = lines.slice(srtStartIndex);
              break;
            } else {
              // 如果没找到SRT开始，至少跳过前几行
              lines = lines.slice(Math.min(3, lines.length));
              break;
            }
          } else {
            break; // 没有找到头部标记，停止处理
          }
        }
      }
    }
    
    cleanedContent = lines.join('\n');
    
    // 移除尾部标记（增强版）
    lines = cleanedContent.split(/\r?\n/);
    
    // 从后向前找到最后一个有效的SRT条目
    let lastValidSrtLineIndex = -1;
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      
      // 跳过空行
      if (line === "") continue;
      
      // 检查是否是尾部标记
      if (footerMarkers.some(marker => line === marker || line.endsWith(marker) || line.includes(marker))) {
        continue;
      }
      
      // 检查更长复杂的尾部说明
      if (line.includes("希望") && (
          line.includes("帮助") || 
          line.includes("有用") || 
          line.includes("满意")
        )) {
        continue;
      }
      
      // 找到不是尾部标记的行
      lastValidSrtLineIndex = i;
      break;
    }
    
    if (lastValidSrtLineIndex >= 0) {
      // 保留到最后一个有效行
      lines = lines.slice(0, lastValidSrtLineIndex + 1);
    }
    
    // 再次清理尾部空行
    while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
      lines.pop();
    }
    
    cleanedContent = lines.join('\n');
    
    // 最后再检查一遍是否有尾部的反引号标记
    cleanedContent = removeTrailingMarkdownMarkers(cleanedContent);
    
    return cleanedContent;
  };
  
  // 辅助函数：移除尾部的Markdown标记（反引号、引号等）
  const removeTrailingMarkdownMarkers = (text) => {
    // 检查尾部是否有反引号标记
    let cleaned = text.trim();
    
    // 正则表达式匹配末尾的反引号、引号等
    const markdownEndPattern = /[\s\n]*(```|'''|""")[\s\n]*$/;
    cleaned = cleaned.replace(markdownEndPattern, '');
    
    // 处理单独一行的反引号
    const lines = cleaned.split(/\r?\n/);
    while (lines.length > 0) {
      const lastLine = lines[lines.length - 1].trim();
      if (lastLine === '```' || lastLine === "'''" || lastLine === '"""') {
        lines.pop();
      } else {
        break;
      }
    }
    
    return lines.join('\n');
  };

  // 保存修订后的字幕
  const handleSave = () => {
    if (onSaveRevision && subtitlePath && content) {
      setIsSaving(true);
      try {
        // 将当前的摘要值作为属性传递给保存函数
        onSaveRevision(subtitlePath, content, summary);
        // 保存状态通过监听器处理
      } catch (error) {
        console.error('保存修订字幕出错:', error);
      } finally {
        // 如果监听器没有正常工作，确保保存状态最终会被重置
        setTimeout(() => {
          setIsSaving(false);
        }, 1000);
      }
    }
  };

  // 切换摘要是否折叠
  const toggleSummaryCollapsed = () => {
    setIsSummaryCollapsed(!isSummaryCollapsed);
  };

  // 切换历史面板
  const toggleHistoryPanel = () => {
    setIsHistoryOpen(!isHistoryOpen);
  };

  // 从历史记录中加载内容
  const loadFromHistory = (historyItem) => {
    if (!historyItem) return;
    
    setSelectedHistoryItem(historyItem.id);
    
    // 加载历史记录中的内容和摘要
    if (onContentChange) {
      onContentChange(historyItem.content);
    }
    setSummary(historyItem.summary);
    setIsSummaryCollapsed(false); // 展开摘要
  };

  // 清除历史记录
  const clearHistory = () => {
    if (subtitlePath) {
      try {
        const historyKey = `revisionHistory_${subtitlePath}`;
        // 从本地存储中删除该文件的历史记录
        localStorage.removeItem(historyKey);
        // 清空历史记录状态
        setRevisionHistory([]);
        setSelectedHistoryItem(null);
        // 关闭确认对话框
        setShowConfirmDialog(false);
      } catch (error) {
        console.error('清除历史记录失败:', error);
      }
    }
  };

  // 清除计时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <RevisionContainer>
      <RevisionHeader>
        <RevisionToolbar>
          <ActionButton 
            primary 
            onClick={handleReviseSubtitle}
            disabled={!hasSettings || !content || loading}
            title={!hasSettings ? "请先配置AI模型" : "使用AI修订字幕"}
          >
            <ButtonIcon>
              <span role="img" aria-label="ai">✨</span>
            </ButtonIcon>
            AI修订
          </ActionButton>
          
          {revisionHistory.length > 0 && (
            <ActionButton
              onClick={toggleHistoryPanel}
              title="查看历史修订记录"
            >
              <ButtonIcon>
                <span role="img" aria-label="history">📋</span>
              </ButtonIcon>
              历史
            </ActionButton>
          )}
        </RevisionToolbar>
      </RevisionHeader>
      
      {!subtitlePath ? (
        <EmptyState>
          <p>暂无字幕可修订</p>
          <p>请先生成或加载字幕</p>
        </EmptyState>
      ) : (
        <RevisionContent>
          {summary && (
            <CollapsibleSummary isCollapsed={isSummaryCollapsed}>
              <SummaryHeader onClick={toggleSummaryCollapsed} isCollapsed={isSummaryCollapsed}>
                <div>字幕修订摘要</div>
                <CollapseIcon isCollapsed={isSummaryCollapsed}>
                  {isSummaryCollapsed ? '▶' : '▼'}
                </CollapseIcon>
              </SummaryHeader>
              <SummaryContent isCollapsed={isSummaryCollapsed}>
                <div dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br>') }}></div>
              </SummaryContent>
            </CollapsibleSummary>
          )}
          
          <RevisionTextArea
            value={content || ''}
            onChange={(e) => onContentChange && onContentChange(e.target.value)}
            placeholder="修订字幕将显示在这里，您可以直接编辑..."
            disabled={loading}
          />
          
          <RevisionActions>
            {/* 保存成功提示 */}
            {showSaveNotification && lastSaveTime && (
              <SaveNotification>
                <span>✓ 保存成功</span>
                <SaveTime>保存时间: {lastSaveTime}</SaveTime>
              </SaveNotification>
            )}
            <ActionButton 
              onClick={handleSave} 
              disabled={!content || loading || isSaving}
            >
              {isSaving ? '保存中...' : '保存修订'}
            </ActionButton>
          </RevisionActions>
          
          {/* 历史修订记录面板 */}
          <HistoryPanel isOpen={isHistoryOpen}>
            <HistoryHeader>
              <HistoryTitle>历史修订记录</HistoryTitle>
              <HistoryActions>
                {revisionHistory.length > 0 && (
                  <ActionButton 
                    onClick={() => setShowConfirmDialog(true)}
                    title="清除所有历史记录"
                  >
                    <ButtonIcon>
                      <span role="img" aria-label="clear">🗑️</span>
                    </ButtonIcon>
                    清除
                  </ActionButton>
                )}
                <HistoryClose onClick={toggleHistoryPanel}>✕</HistoryClose>
              </HistoryActions>
            </HistoryHeader>
            <HistoryList>
              {revisionHistory.length === 0 ? (
                <EmptyState>
                  <p>暂无历史记录</p>
                </EmptyState>
              ) : (
                revisionHistory.map(item => (
                  <HistoryItem 
                    key={item.id} 
                    isSelected={selectedHistoryItem === item.id}
                    onClick={() => loadFromHistory(item)}
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
          </HistoryPanel>
          
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
                  <ActionButton primary onClick={clearHistory}>
                    确认清除
                  </ActionButton>
                </DialogActions>
              </DialogContent>
            </ConfirmDialog>
          )}
          
          {loading && (
            <LoadingOverlay>
              <Spinner />
              <div>正在进行AI字幕修订...</div>
              <div style={{ fontSize: '13px', marginTop: '10px', opacity: '0.8' }}>
                已用时间: {formatTime(elapsedTime)}
              </div>
              <div style={{ fontSize: '13px', marginTop: '5px', opacity: '0.8' }}>
                字幕修订通常需要数分钟时间，请耐心等候
              </div>
            </LoadingOverlay>
          )}

          {!loading && showTimeSpent && (
            <div style={{ 
              position: 'absolute', 
              bottom: '10px', 
              left: '10px', 
              background: 'rgba(46, 204, 113, 0.1)', 
              color: '#2ecc71',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              opacity: '0.9'
            }}>
              修订总耗时: {formatTime(totalTime)}
            </div>
          )}
        </RevisionContent>
      )}
    </RevisionContainer>
  );
}

export default SubtitleRevision;