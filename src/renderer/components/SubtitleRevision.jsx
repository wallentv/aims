import React, { useState, useEffect, useRef } from 'react';
import {
  ModuleContainer,
  ModuleHeader,
  ModuleToolbar,
  ModuleContent,
  TextEditor,
  ActionButton,
  StatusMessage,
  SaveTime,
  LoadingOverlay,
  Spinner,
  TimingInfo
} from '../styles/SharedStyles';

// 新增样式组件
import styled from 'styled-components';

// 高级工具栏样式
const EnhancedToolbar = styled(ModuleToolbar)`
  background-color: ${props => props.theme.colors.surfaceLight};
  padding: 8px 12px;
  border-radius: ${props => props.theme.borderRadius};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 12px;
  flex-wrap: wrap;
`;

// 工具栏分组
const ToolbarGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:not(:last-child) {
    margin-right: 16px;
    padding-right: 16px;
    border-right: 1px solid rgba(0, 0, 0, 0.1);
  }
`;

// 工具栏右侧区域
const ToolbarRightSection = styled.div`
  margin-left: auto;
  display: flex;
  gap: 8px;
  align-items: center;
`;

// 文件信息显示
const FileInfo = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
`;

// 弹窗样式
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius};
  padding: 20px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  color: ${props => props.theme.colors.text};
`;

const ModalCloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 20px;
  cursor: pointer;
  
  &:hover {
    color: ${props => props.theme.colors.text};
  }
`;

const ModalBody = styled.div`
  margin-bottom: 16px;
  max-height: 50vh;
  overflow-y: auto;
  
  pre {
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 14px;
    line-height: 1.5;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

// 格式化时间为分:秒格式
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}分${remainingSeconds}秒`;
};

function SubtitleRevision({ subtitlePath, initialContent, content, onContentChange, onSaveRevision, onSummaryUpdate, modelSettings }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [hasSettings, setHasSettings] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  
  // 计时相关状态
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalTime, setTotalTime] = useState(null);
  const [showTimeSpent, setShowTimeSpent] = useState(false);
  const timerRef = useRef(null);
  const timeoutRef = useRef(null);

  // 初始化修订内容
  useEffect(() => {
    if (subtitlePath && initialContent && !content && onContentChange) {
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

  // 当摘要更新时，通知父组件
  useEffect(() => {
    if (onSummaryUpdate && summary) {
      onSummaryUpdate(summary);
    }
  }, [summary, onSummaryUpdate]);

  // 监听保存完成事件
  useEffect(() => {
    const handleSubtitleSaved = (data) => {
      setLastSaveTime(data.saveTime);
      setShowSaveNotification(true);
      setIsSaving(false);
      
      // 3秒后自动隐藏保存通知
      const timer = setTimeout(() => {
        setShowSaveNotification(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    };
    
    window.electron.onSubtitleSaved(handleSubtitleSaved);
    
    return () => {
      // Electron API可能不支持移除特定监听器
    };
  }, [subtitlePath, content, summary]);

  // 使用AI修订字幕
  const handleReviseSubtitle = async () => {
    if (!hasSettings || !content || !modelSettings) return;

    setLoading(true);
    setSummary('');
    
    // 设置开始时间并启动计时器
    const start = Date.now();
    setStartTime(start);
    setElapsedTime(0);
    setTotalTime(null);
    setShowTimeSpent(false);
    
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
          messages: [{ role: "user", content: prompt }],
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
        }, 5000);
        
        // 显示结果弹窗
        setShowResultModal(true);
      }
    } catch (error) {
      console.error('AI修订字幕出错:', error);
      const timeSpent = Math.floor((Date.now() - start) / 1000);
      const errorSummary = `修订失败: ${error.message || '未知错误'}\n耗时: ${formatTime(timeSpent)}`;
      setSummary(errorSummary);
      setTotalTime(timeSpent);
      
      if (onSummaryUpdate) {
        onSummaryUpdate(errorSummary);
      }
    } finally {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setLoading(false);
    }
  };

  // 清理字幕内容，去除头尾的说明文字 (保留现有的处理逻辑)
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
    
    // 首先检查SRT字幕的特征
    const srtPattern = /^\d+\s*\r?\n\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}/;
    
    // 如果已经是标准SRT格式，则不需要过多清理
    if (srtPattern.test(cleanedContent)) {
      cleanedContent = removeTrailingMarkdownMarkers(cleanedContent);
      return cleanedContent;
    }
    
    // 尝试查找第一个看起来像SRT条目的内容
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
    let lines = cleanedContent.split(/\r?\n/);
    let foundSrtStart = false;
    
    // 首先寻找看起来像SRT的起始内容
    for (let i = 0; i < lines.length; i++) {
      // 检查当前行是否是数字（SRT编号）
      if (/^\s*\d+\s*$/.test(lines[i])) {
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
        onSaveRevision(subtitlePath, content, summary);
      } catch (error) {
        console.error('保存修订字幕出错:', error);
      } finally {
        setTimeout(() => {
          setIsSaving(false);
        }, 1000);
      }
    }
  };

  // 关闭结果弹窗
  const handleCloseResultModal = () => {
    setShowResultModal(false);
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
    <ModuleContainer>
      <ModuleHeader>
        <EnhancedToolbar>
          <ToolbarGroup>
            <ActionButton 
              primary 
              onClick={handleReviseSubtitle}
              disabled={!hasSettings || !content || loading}
              title={!hasSettings ? "请先配置AI模型" : "使用AI修订字幕"}
            >
              使用AI修订字幕
            </ActionButton>
            <ActionButton 
              onClick={handleSave}
              disabled={!content || isSaving}
              title="保存修订后的字幕"
            >
              保存
            </ActionButton>
            {showSaveNotification && (
              <StatusMessage>
                修订已保存
              </StatusMessage>
            )}
          </ToolbarGroup>
          <ToolbarRightSection>
            {lastSaveTime && (
              <SaveTime>
                上次保存时间: {new Date(lastSaveTime).toLocaleTimeString()}
              </SaveTime>
            )}
            {showTimeSpent && totalTime !== null && (
              <TimingInfo>
                总耗时: {formatTime(totalTime)}
              </TimingInfo>
            )}
          </ToolbarRightSection>
        </EnhancedToolbar>
      </ModuleHeader>
      <ModuleContent>
        {loading && (
          <LoadingOverlay>
            <Spinner />
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <div>正在修订字幕中...</div>
              <div style={{ marginTop: '10px', fontSize: '14px' }}>已用时间: {formatTime(elapsedTime)}</div>
              <div style={{ marginTop: '5px', fontSize: '13px', opacity: '0.8' }}>
                字幕修订通常需要数分钟时间，请耐心等候
              </div>
            </div>
          </LoadingOverlay>
        )}
        <TextEditor
          value={content || ''}
          onChange={(e) => onContentChange && onContentChange(e.target.value)}
          placeholder="在此输入或粘贴字幕内容..."
        />
        
        {/* 修订结果弹窗 */}
        {showResultModal && summary && (
          <ModalOverlay>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>字幕修订完成</ModalTitle>
                <ModalCloseButton onClick={handleCloseResultModal}>×</ModalCloseButton>
              </ModalHeader>
              <ModalBody>
                <pre>{summary}</pre>
              </ModalBody>
              <ModalFooter>
                <ActionButton onClick={handleCloseResultModal}>
                  确定
                </ActionButton>
              </ModalFooter>
            </ModalContent>
          </ModalOverlay>
        )}
      </ModuleContent>
    </ModuleContainer>
  );
}

export default SubtitleRevision;