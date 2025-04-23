import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const SummaryContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const SummaryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.medium};
`;

const SummaryTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  color: ${props => props.theme.colors.text};
`;

const SummaryToolbar = styled.div`
  display: flex;
  gap: 8px;
`;

const SummaryContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  gap: ${props => props.theme.spacing.medium};
`;

const SectionContainer = styled.div`
  background-color: ${props => props.theme.colors.surfaceLight};
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.small};
  position: relative;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.small};
`;

const SectionTitle = styled.h4`
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
`;

const SectionActions = styled.div`
  display: flex;
  gap: 4px;
`;

const CopyButton = styled.button`
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

const SummaryTextArea = styled.textarea`
  width: 100%;
  background-color: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  border: none;
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.small};
  font-family: ${props => props.theme.fonts.main};
  resize: none;
  outline: none;
  font-size: 13px;
  line-height: 1.5;
  min-height: ${props => props.minHeight || '80px'};
  
  &:focus {
    box-shadow: inset 0 0 0 1px ${props => props.theme.colors.secondary};
  }
`;

const SavedIndicator = styled.div`
  position: absolute;
  right: 8px;
  top: 8px;
  background-color: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
  padding: 2px 6px;
  border-radius: ${props => props.theme.borderRadius};
  font-size: 11px;
  display: ${props => props.visible ? 'block' : 'none'};
  transition: opacity 0.3s;
  opacity: ${props => props.visible ? 1 : 0};
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
    color: ${props => props.primary ? 'white' : '#606060'};
  }
`;

const ButtonIcon = styled.span`
  margin-right: 6px;
  font-size: 16px;
  display: flex;
  align-items: center;
`;

const SummaryActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: ${props => props.theme.spacing.medium};
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

// 存储键的前缀
const STORAGE_PREFIX = 'subtitle_summary_';

function SubtitleSummary({ subtitlePath, content, modelSettings }) {
  const [loading, setLoading] = useState(false);
  const [hasSettings, setHasSettings] = useState(false);
  
  // 总结内容状态
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [chapters, setChapters] = useState('');
  const [tags, setTags] = useState('');
  
  // 保存指示器状态
  const [savedTitle, setSavedTitle] = useState(false);
  const [savedDescription, setSavedDescription] = useState(false);
  const [savedChapters, setSavedChapters] = useState(false);
  const [savedTags, setSavedTags] = useState(false);
  
  // 计时相关状态
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalTime, setTotalTime] = useState(null);
  const timerRef = useRef(null);
  
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
    setSavedTitle(false);
  };
  
  // 处理简介变更并自动保存
  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    setSavedDescription(false);
  };
  
  // 处理章节变更并自动保存
  const handleChaptersChange = (e) => {
    setChapters(e.target.value);
    setSavedChapters(false);
  };
  
  // 处理标签变更并自动保存
  const handleTagsChange = (e) => {
    setTags(e.target.value);
    setSavedTags(false);
  };
  
  // 输入完成后自动保存（使用防抖）
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      saveSummary();
      
      // 显示已保存指示器
      if (title) setSavedTitle(true);
      if (description) setSavedDescription(true);
      if (chapters) setSavedChapters(true);
      if (tags) setSavedTags(true);
      
      // 3秒后隐藏已保存指示器
      setTimeout(() => {
        setSavedTitle(false);
        setSavedDescription(false);
        setSavedChapters(false);
        setSavedTags(false);
      }, 3000);
      
    }, 1000); // 1秒防抖
    
    return () => clearTimeout(saveTimeout);
  }, [title, description, chapters, tags]);
  
  // 复制内容到剪贴板
  const copyToClipboard = async (text, section) => {
    try {
      await navigator.clipboard.writeText(text);
      
      // 显示已复制指示器
      switch (section) {
        case 'title':
          setSavedTitle(true);
          setTimeout(() => setSavedTitle(false), 3000);
          break;
        case 'description':
          setSavedDescription(true);
          setTimeout(() => setSavedDescription(false), 3000);
          break;
        case 'chapters':
          setSavedChapters(true);
          setTimeout(() => setSavedChapters(false), 3000);
          break;
        case 'tags':
          setSavedTags(true);
          setTimeout(() => setSavedTags(false), 3000);
          break;
      }
    } catch (error) {
      console.error('复制到剪贴板失败:', error);
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
        const titleMatch = result.match(/# 标题\s*\n([\s\S]*?)(?=\n# 简介|\n# 描述|\n# 章节|\n# 标签|$)/);
        if (titleMatch && titleMatch[1]) {
          parsedTitle = titleMatch[1].trim();
        }
        
        // 提取简介部分
        const descMatch = result.match(/# 简介\s*\n([\s\S]*?)(?=\n# 章节|\n# 标签|$)/) || 
                          result.match(/# 描述\s*\n([\s\S]*?)(?=\n# 章节|\n# 标签|$)/);
        if (descMatch && descMatch[1]) {
          parsedDescription = descMatch[1].trim();
        }
        
        // 提取章节部分
        const chaptersMatch = result.match(/# 章节\s*\n([\s\S]*?)(?=\n# 标签|$)/);
        if (chaptersMatch && chaptersMatch[1]) {
          parsedChapters = chaptersMatch[1].trim();
        }
        
        // 提取标签部分
        const tagsMatch = result.match(/# 标签\s*\n([\s\S]*?)(?=$)/);
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
          const lines = result.split('\n');
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
                  parsedDescription += (parsedDescription ? '\n' : '') + trimmedLine;
                  break;
                case 'chapters':
                  parsedChapters += (parsedChapters ? '\n' : '') + trimmedLine;
                  break;
                case 'tags':
                  parsedTags += (parsedTags ? '\n' : '') + trimmedLine;
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
    <SummaryContainer>
      <SummaryHeader>
        <SummaryToolbar>
          <ActionButton 
            primary 
            onClick={handleGenerateSummary}
            disabled={!hasSettings || !content || loading}
            title={!hasSettings ? "请先配置AI模型" : "使用AI生成总结"}
          >
            <ButtonIcon>
              <span role="img" aria-label="ai">✨</span>
            </ButtonIcon>
            生成总结
          </ActionButton>
        </SummaryToolbar>
      </SummaryHeader>
      
      {!subtitlePath ? (
        <EmptyState>
          <p>暂无字幕可总结</p>
          <p>请先生成或加载字幕</p>
        </EmptyState>
      ) : (
        <SummaryContent>
          {/* 标题部分 */}
          <SectionContainer>
            <SectionHeader>
              <SectionTitle>视频标题</SectionTitle>
              <SectionActions>
                {title && (
                  <CopyButton 
                    onClick={() => copyToClipboard(title, 'title')}
                    title="复制标题"
                  >
                    <ButtonIcon>
                      <span role="img" aria-label="copy">📋</span>
                    </ButtonIcon>
                    复制
                  </CopyButton>
                )}
              </SectionActions>
            </SectionHeader>
            <SummaryTextArea
              value={title}
              onChange={handleTitleChange}
              placeholder="生成的视频标题将显示在这里..."
              minHeight="40px"
              disabled={loading}
            />
            <SavedIndicator visible={savedTitle}>已保存</SavedIndicator>
          </SectionContainer>
          
          {/* 简介部分 */}
          <SectionContainer>
            <SectionHeader>
              <SectionTitle>视频简介</SectionTitle>
              <SectionActions>
                {description && (
                  <CopyButton 
                    onClick={() => copyToClipboard(description, 'description')}
                    title="复制简介"
                  >
                    <ButtonIcon>
                      <span role="img" aria-label="copy">📋</span>
                    </ButtonIcon>
                    复制
                  </CopyButton>
                )}
              </SectionActions>
            </SectionHeader>
            <SummaryTextArea
              value={description}
              onChange={handleDescriptionChange}
              placeholder="生成的视频简介将显示在这里..."
              minHeight="120px"
              disabled={loading}
            />
            <SavedIndicator visible={savedDescription}>已保存</SavedIndicator>
          </SectionContainer>
          
          {/* 章节部分 */}
          <SectionContainer>
            <SectionHeader>
              <SectionTitle>视频章节</SectionTitle>
              <SectionActions>
                {chapters && (
                  <CopyButton 
                    onClick={() => copyToClipboard(chapters, 'chapters')}
                    title="复制章节"
                  >
                    <ButtonIcon>
                      <span role="img" aria-label="copy">📋</span>
                    </ButtonIcon>
                    复制
                  </CopyButton>
                )}
              </SectionActions>
            </SectionHeader>
            <SummaryTextArea
              value={chapters}
              onChange={handleChaptersChange}
              placeholder="生成的视频章节将显示在这里..."
              minHeight="100px"
              disabled={loading}
            />
            <SavedIndicator visible={savedChapters}>已保存</SavedIndicator>
          </SectionContainer>
          
          {/* 标签部分 */}
          <SectionContainer>
            <SectionHeader>
              <SectionTitle>视频标签</SectionTitle>
              <SectionActions>
                {tags && (
                  <CopyButton 
                    onClick={() => copyToClipboard(tags, 'tags')}
                    title="复制标签"
                  >
                    <ButtonIcon>
                      <span role="img" aria-label="copy">📋</span>
                    </ButtonIcon>
                    复制
                  </CopyButton>
                )}
              </SectionActions>
            </SectionHeader>
            <SummaryTextArea
              value={tags}
              onChange={handleTagsChange}
              placeholder="生成的视频标签将显示在这里..."
              minHeight="50px"
              disabled={loading}
            />
            <SavedIndicator visible={savedTags}>已保存</SavedIndicator>
          </SectionContainer>
          
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
              总结生成耗时: {formatTime(totalTime)}
            </div>
          )}
        </SummaryContent>
      )}
    </SummaryContainer>
  );
}

export default SubtitleSummary;