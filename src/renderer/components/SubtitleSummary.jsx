import React, { useState, useEffect, useRef } from 'react';
import {
  ModuleContainer,
  ModuleHeader,
  ModuleToolbar,
  ModuleContent,
  ActionButton,
  ButtonIcon,
  StatusMessage,
  EmptyState,
  LoadingOverlay,
  Spinner,
  TimingInfo,
  SectionContainer,
  SectionHeader,
  SectionTitle,
  SectionActions,
  CopyButton,
  TextEditor,
  ActionBar
} from '../styles/SharedStyles';
import styled from 'styled-components';

// 自定义ModuleContent样式，确保滚动和内容填充
const StyledModuleContent = styled(ModuleContent)`
  padding: 0 10px;
  overflow-y: auto;
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 3px;
  }
`;

// 自定义工具栏样式，使其支持两侧对齐
const StyledModuleToolbar = styled(ModuleToolbar)`
  display: flex;
  width: 100%;
`;

// 左侧工具栏区域
const LeftToolbarSection = styled.div`
  display: flex;
  align-items: center;
`;

// 右侧工具栏区域
const RightToolbarSection = styled.div`
  display: flex;
  align-items: center;
`;

// 自定义TextEditor样式，确保宽度对齐和填满
const StyledTextEditor = styled(TextEditor)`
  width: 100%;
  box-sizing: border-box;
  display: block;
`;

// 定制化Section容器，添加悬停状态
const HoverableSectionContainer = styled(SectionContainer)`
  position: relative;
`;

// 定制化复制按钮，只显示文字，放在右下角
const BottomRightCopyButton = styled(CopyButton)`
  display: ${props => props.visible ? 'block' : 'none'};
  position: absolute;
  right: 8px;
  bottom: 15px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 12px;
  z-index: 5;
  transition: opacity 0.2s;
  opacity: ${props => props.visible ? 0.8 : 0};
  
  &:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.8);
  }
`;

// 存储键的前缀
const STORAGE_PREFIX = 'subtitle_summary_';

// 格式化时间的辅助函数（秒转为分:秒格式）
const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return '--:--';
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// 生成文件名不带扩展名的函数
const getFileNameWithoutExtension = (path) => {
  if (!path) return '';
  
  // 获取文件名部分（包含扩展名）
  const fileName = path.split(/[\/\\]/).pop();
  
  // 分离扩展名
  const dotIndex = fileName.lastIndexOf('.');
  if (dotIndex === -1) return fileName; // 没有扩展名
  
  return fileName.substring(0, dotIndex);
};

function SubtitleSummary({ subtitlePath, content, modelSettings }) {
  const [loading, setLoading] = useState(false);
  const [hasSettings, setHasSettings] = useState(false);
  
  // 添加悬停状态
  const [hoveredSection, setHoveredSection] = useState(null);

  // 总结内容状态
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [chapters, setChapters] = useState('');
  const [tags, setTags] = useState('');
  
  // 状态消息
  const [statusMessage, setStatusMessage] = useState('');
  const [isStatusSuccess, setIsStatusSuccess] = useState(true);
  const [showStatus, setShowStatus] = useState(false);
  
  // 计时相关状态
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalTime, setTotalTime] = useState(null);
  const timerRef = useRef(null);
  
  // 文本区域引用
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const chaptersRef = useRef(null);
  const tagsRef = useRef(null);
  
  // 完成标志，用于指示总结过程是否完成
  const [summaryCompleted, setSummaryCompleted] = useState(false);
  
  // 存储键（基于字幕文件路径）
  const storageKey = useRef('');
  
  // 初始化存储键
  useEffect(() => {
    if (subtitlePath) {
      const fileNameWithoutExt = getFileNameWithoutExtension(subtitlePath);
      storageKey.current = `${STORAGE_PREFIX}${fileNameWithoutExt}`;
      
      // 加载保存的总结内容
      loadSavedSummary();
    }
  }, [subtitlePath]);

  // 检查是否有有效的模型设置
  useEffect(() => {
    if (modelSettings) {
      setHasSettings(Boolean(modelSettings.apiKey && modelSettings.apiUrl));
    } else {
      setHasSettings(false);
    }
  }, [modelSettings]);

  // 显示状态消息的函数
  const showStatusMessage = (message, success = true) => {
    setStatusMessage(message);
    setIsStatusSuccess(success);
    setShowStatus(true);
    
    // 3秒后隐藏消息
    setTimeout(() => {
      setShowStatus(false);
    }, 3000);
  };

  // 自动调整文本区域高度的函数
  const adjustTextareaHeight = (textarea) => {
    if (!textarea) return;
    
    // 重置高度以获取正确的scrollHeight
    textarea.style.height = 'auto';
    
    // 设置高度为scrollHeight
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = scrollHeight + 'px';
  };
  
  // 当内容改变时调整文本区域高度
  useEffect(() => {
    if (titleRef.current) adjustTextareaHeight(titleRef.current);
    if (descriptionRef.current) adjustTextareaHeight(descriptionRef.current);
    if (chaptersRef.current) adjustTextareaHeight(chaptersRef.current);
    if (tagsRef.current) adjustTextareaHeight(tagsRef.current);
  }, [title, description, chapters, tags]);
  
  // 加载保存的总结内容
  const loadSavedSummary = () => {
    if (!storageKey.current) return;
    
    try {
      const savedData = localStorage.getItem(storageKey.current);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setTitle(parsedData.title || '');
        setDescription(parsedData.description || '');
        setChapters(parsedData.chapters || '');
        setTags(parsedData.tags || '');
        
        // 如果有任何内容，将完成标志设为true
        if (parsedData.title || parsedData.description || parsedData.chapters || parsedData.tags) {
          setSummaryCompleted(true);
        }
      }
    } catch (error) {
      console.error('加载保存的总结内容出错:', error);
    }
  };
  
  // 保存总结内容
  const saveSummary = () => {
    if (!storageKey.current) return;
    
    try {
      const summaryData = {
        title,
        description,
        chapters,
        tags,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(storageKey.current, JSON.stringify(summaryData));
    } catch (error) {
      console.error('保存总结内容出错:', error);
    }
  };
  
  // 处理标题变更并自动保存
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    adjustTextareaHeight(e.target);
  };
  
  // 处理简介变更并自动保存
  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    adjustTextareaHeight(e.target);
  };
  
  // 处理章节变更并自动保存
  const handleChaptersChange = (e) => {
    setChapters(e.target.value);
    adjustTextareaHeight(e.target);
  };
  
  // 处理标签变更并自动保存
  const handleTagsChange = (e) => {
    setTags(e.target.value);
    adjustTextareaHeight(e.target);
  };
  
  // 输入完成后自动保存（使用防抖）
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      saveSummary();
      
      // 显示已保存消息
      if (title || description || chapters || tags) {
        showStatusMessage('内容已保存');
      }
      
    }, 1000); // 1秒防抖
    
    return () => clearTimeout(saveTimeout);
  }, [title, description, chapters, tags]);
  
  // 复制内容到剪贴板
  const copyToClipboard = async (text, section) => {
    try {
      await navigator.clipboard.writeText(text);
      
      // 显示已复制消息
      let sectionName = '';
      switch (section) {
        case 'title':
          sectionName = '标题';
          break;
        case 'description':
          sectionName = '简介';
          break;
        case 'chapters':
          sectionName = '章节';
          break;
        case 'tags':
          sectionName = '标签';
          break;
      }
      
      showStatusMessage(`${sectionName}已复制到剪贴板`);
    } catch (error) {
      console.error('复制到剪贴板失败:', error);
      showStatusMessage('复制失败，请重试', false);
    }
  };
  
  // 复制所有内容到剪贴板
  const copyAllToClipboard = async () => {
    try {
      let allContent = '';
      
      if (title) {
        allContent += `# 标题\n${title}\n\n`;
      }
      
      if (description) {
        allContent += `# 简介\n${description}\n\n`;
      }
      
      if (chapters) {
        allContent += `# 章节\n${chapters}\n\n`;
      }
      
      if (tags) {
        allContent += `# 标签\n${tags}`;
      }
      
      if (allContent) {
        await navigator.clipboard.writeText(allContent);
        showStatusMessage('所有内容已复制到剪贴板');
      }
    } catch (error) {
      console.error('复制到剪贴板失败:', error);
      showStatusMessage('复制失败，请重试', false);
    }
  };
  
  // 处理总结生成
  const handleGenerateSummary = async () => {
    if (!hasSettings || !content || !modelSettings) {
      return;
    }
    
    setLoading(true);
    setSummaryCompleted(false);
    
    // 设置开始时间并启动计时器
    const start = Date.now();
    setElapsedTime(0);
    setTotalTime(null);
    
    // 启动计时器，每秒更新一次经过的时间
    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    
    try {
      // 创建总结提示词
      const prompt = modelSettings.summaryPromptTemplate ? 
        modelSettings.summaryPromptTemplate.replace('{{subtitle}}', content) :
        `请根据以下字幕内容，分别生成：1）视频标题；2）视频简介（300-500字）；3）视频章节（带时间戳的内容大纲，方便观众快速找到感兴趣的章节）；4）视频标签（最多10个和视频内容高度相关的标签，以逗号分隔）。

视频标题应该是吸引人的，能够清晰表达视频的主要内容或价值。
视频简介应该高度总结视频的核心内容，带一些易于搜索的关键字，吸引用户观看。
视频章节要以时间戳+章节标题的形式呈现，每行一个章节点，尽量提取视频中的重要时间点并简洁描述内容。
视频标签要简洁精准，与视频内容高度相关。

请按以下格式输出：
# 标题
（在这里输出视频标题）

# 简介
（在这里输出视频简介）

# 章节
00:00 章节1标题
XX:XX 章节2标题
（...）

# 标签
标签1,标签2,标签3,标签4,标签5,标签6,标签7,标签8,标签9,标签10

以下是字幕内容：
${content}`;

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
          temperature: 0.7
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || '请求失败，请检查您的API设置');
      }

      if (data.choices && data.choices.length > 0) {
        const result = data.choices[0].message.content;
        
        // 解析结果
        let parsedTitle = '';
        let parsedDescription = '';
        let parsedChapters = '';
        let parsedTags = '';
        
        // 提取标题部分
        const titleMatch = result.match(/# 标题\\s*\\n([\\s\\S]*?)(?=\\n# 简介|\\n# 描述|\\n# 章节|\\n# 标签|$)/);
        if (titleMatch && titleMatch[1]) {
          parsedTitle = titleMatch[1].trim();
        }
        
        // 提取简介部分
        const descMatch = result.match(/# 简介\\s*\\n([\\s\\S]*?)(?=\\n# 章节|\\n# 标签|$)/) || 
                          result.match(/# 描述\\s*\\n([\\s\\S]*?)(?=\\n# 章节|\\n# 标签|$)/);
        if (descMatch && descMatch[1]) {
          parsedDescription = descMatch[1].trim();
        }
        
        // 提取章节部分
        const chaptersMatch = result.match(/# 章节\\s*\\n([\\s\\S]*?)(?=\\n# 标签|$)/);
        if (chaptersMatch && chaptersMatch[1]) {
          parsedChapters = chaptersMatch[1].trim();
        }
        
        // 提取标签部分
        const tagsMatch = result.match(/# 标签\\s*\\n([\\s\\S]*?)(?=$)/);
        if (tagsMatch && tagsMatch[1]) {
          parsedTags = tagsMatch[1].trim();
        }
        
        // 若模型未按照格式输出，尝试更宽松的匹配
        if (!parsedTitle && !parsedDescription && !parsedChapters && !parsedTags) {
          // 尝试匹配标题（寻找第一行非空内容）
          const firstLineMatch = result.match(/^(.*?)$/m);
          if (firstLineMatch && firstLineMatch[1]) {
            parsedTitle = firstLineMatch[1].trim();
          }
          
          // 尝试通过关键词匹配其他部分
          const lines = result.split('\\n');
          let currentSection = '';
          
          for (const line of lines) {
            const trimmedLine = line.trim();
            
            if (trimmedLine.toLowerCase().includes('标题') || 
                trimmedLine.toLowerCase().includes('title')) {
              currentSection = 'title';
              continue;
            } else if (trimmedLine.toLowerCase().includes('简介') || 
                      trimmedLine.toLowerCase().includes('描述') || 
                      trimmedLine.toLowerCase().includes('description')) {
              currentSection = 'description';
              continue;
            } else if (trimmedLine.toLowerCase().includes('章节') || 
                      trimmedLine.toLowerCase().includes('大纲') || 
                      trimmedLine.toLowerCase().includes('时间戳') || 
                      trimmedLine.toLowerCase().includes('chapters')) {
              currentSection = 'chapters';
              continue;
            } else if (trimmedLine.toLowerCase().includes('标签') || 
                      trimmedLine.toLowerCase().includes('tags')) {
              currentSection = 'tags';
              continue;
            }
            
            if (currentSection && trimmedLine) {
              switch (currentSection) {
                case 'title':
                  if (!parsedTitle) parsedTitle = trimmedLine;
                  break;
                case 'description':
                  parsedDescription += (parsedDescription ? '\\n' : '') + trimmedLine;
                  break;
                case 'chapters':
                  parsedChapters += (parsedChapters ? '\\n' : '') + trimmedLine;
                  break;
                case 'tags':
                  parsedTags += (parsedTags ? '\\n' : '') + trimmedLine;
                  break;
              }
            }
          }
        }
        
        // 设置解析后的内容
        setTitle(parsedTitle);
        setDescription(parsedDescription);
        setChapters(parsedChapters);
        setTags(parsedTags);
        
        // 保存到本地存储
        const summaryData = {
          title: parsedTitle,
          description: parsedDescription,
          chapters: parsedChapters,
          tags: parsedTags,
          updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem(storageKey.current, JSON.stringify(summaryData));
        
        // 设置总结完成标志
        setSummaryCompleted(true);
      }
      
      // 计算总耗时
      const timeSpent = Math.floor((Date.now() - start) / 1000);
      setTotalTime(timeSpent);
    } catch (error) {
      console.error('生成总结出错:', error);
      showStatusMessage(`生成失败: ${error.message}`, false);
    } finally {
      // 停止计时器
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setLoading(false);
    }
  };
  
  // 清除计时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  return (
    <ModuleContainer>
      <ModuleHeader>
        <StyledModuleToolbar>
          <LeftToolbarSection>
            <ActionButton 
              primary 
              onClick={handleGenerateSummary}
              disabled={!hasSettings || !content || loading}
              title={!hasSettings ? "请先配置AI模型" : "使用AI生成总结"}
            >
              AI生成总结
            </ActionButton>
          </LeftToolbarSection>
          
          {/* 状态消息显示区域 */}
          {showStatus && (
            <StatusMessage 
              success={isStatusSuccess} 
              error={!isStatusSuccess}
              visible={true}
            >
              {statusMessage}
            </StatusMessage>
          )}
        </StyledModuleToolbar>
      </ModuleHeader>
      
      {!subtitlePath ? (
        <EmptyState>
          <p>暂无字幕可总结</p>
          <p>请先生成或加载字幕</p>
        </EmptyState>
      ) : (
        <StyledModuleContent>
          {/* 标题部分 */}
          <HoverableSectionContainer 
            onMouseEnter={() => setHoveredSection('title')}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <SectionHeader>
              <SectionTitle>视频标题</SectionTitle>
            </SectionHeader>
            <StyledTextEditor
              ref={titleRef}
              value={title}
              onChange={handleTitleChange}
              placeholder="生成的视频标题将显示在这里..."
              minHeight="40px"
              disabled={loading}
              isTitle
            />
            {title && (
              <BottomRightCopyButton 
                onClick={() => copyToClipboard(title, 'title')}
                title="复制标题"
                visible={hoveredSection === 'title'}
              >
                复制
              </BottomRightCopyButton>
            )}
          </HoverableSectionContainer>
          
          {/* 简介部分 */}
          <HoverableSectionContainer
            onMouseEnter={() => setHoveredSection('description')}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <SectionHeader>
              <SectionTitle>视频简介</SectionTitle>
            </SectionHeader>
            <StyledTextEditor
              ref={descriptionRef}
              value={description}
              onChange={handleDescriptionChange}
              placeholder="生成的视频简介将显示在这里..."
              minHeight="120px"
              disabled={loading}
            />
            {description && (
              <BottomRightCopyButton 
                onClick={() => copyToClipboard(description, 'description')}
                title="复制简介"
                visible={hoveredSection === 'description'}
              >
                复制
              </BottomRightCopyButton>
            )}
          </HoverableSectionContainer>
          
          {/* 章节部分 */}
          <HoverableSectionContainer
            onMouseEnter={() => setHoveredSection('chapters')}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <SectionHeader>
              <SectionTitle>视频章节</SectionTitle>
            </SectionHeader>
            <StyledTextEditor
              ref={chaptersRef}
              value={chapters}
              onChange={handleChaptersChange}
              placeholder="生成的视频章节将显示在这里..."
              minHeight="100px"
              disabled={loading}
              isMonospace={true}
            />
            {chapters && (
              <BottomRightCopyButton 
                onClick={() => copyToClipboard(chapters, 'chapters')}
                title="复制章节"
                visible={hoveredSection === 'chapters'}
              >
                复制
              </BottomRightCopyButton>
            )}
          </HoverableSectionContainer>
          
          {/* 标签部分 */}
          <HoverableSectionContainer
            onMouseEnter={() => setHoveredSection('tags')}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <SectionHeader>
              <SectionTitle>视频标签</SectionTitle>
            </SectionHeader>
            <StyledTextEditor
              ref={tagsRef}
              value={tags}
              onChange={handleTagsChange}
              placeholder="生成的视频标签将显示在这里..."
              minHeight="50px"
              disabled={loading}
            />
            {tags && (
              <BottomRightCopyButton 
                onClick={() => copyToClipboard(tags, 'tags')}
                title="复制标签"
                visible={hoveredSection === 'tags'}
              >
                复制
              </BottomRightCopyButton>
            )}
          </HoverableSectionContainer>
          
          {loading && (
            <LoadingOverlay>
              <Spinner />
              <div>正在生成视频内容总结...</div>
              <div style={{ fontSize: '13px', marginTop: '10px', opacity: '0.8' }}>
                已用时间: {formatTime(elapsedTime)}
              </div>
              <div style={{ fontSize: '13px', marginTop: '5px', opacity: '0.8' }}>
                总结生成通常需要数分钟时间，请耐心等候
              </div>
            </LoadingOverlay>
          )}

          {!loading && totalTime && (
            <TimingInfo>
              总结生成耗时: {formatTime(totalTime)}
            </TimingInfo>
          )}
        </StyledModuleContent>
      )}
      
      {/* 底部操作栏 - 添加复制全部按钮 */}
      {summaryCompleted && subtitlePath && (
        <ActionBar>
          <div style={{ marginLeft: 'auto' }}>
            <ActionButton 
              onClick={copyAllToClipboard}
              disabled={!title && !description && !chapters && !tags}
              primary
            >
              复制全部
            </ActionButton>
          </div>
        </ActionBar>
      )}
    </ModuleContainer>
  );
}

export default SubtitleSummary;