import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { ThemeProvider } from 'styled-components';
import FileSelector from './components/FileSelector.jsx';
import SubtitleSettings from './components/SubtitleSettings.jsx';
import ProgressBar from './components/ProgressBar.jsx';
import SubtitleEditor from './components/SubtitleEditor.jsx';
import SubtitleRevision from './components/SubtitleRevision.jsx';
import SubtitleSummary from './components/SubtitleSummary.jsx';
import ModelSettingsModal from './components/ModelSettingsModal.jsx';
import SubtitleStateManager from './utils/SubtitleStateManager.js';
import { getFullModelSettings, saveFullModelSettings } from './utils/ModelConfig.js';

// 主题配置 - 油管风格
const theme = {
  colors: {
    primary: '#ff0000', // YouTube红色
    secondary: '#3ea6ff', // YouTube蓝色
    background: '#0f0f0f', // 背景深灰色
    surface: '#212121', // 表面较浅灰色
    surfaceLight: '#303030', // 更浅的表面颜色
    text: '#f1f1f1', // 主文本白色
    textSecondary: '#aaaaaa', // 次要文本灰色
  },
  fonts: {
    main: 'Roboto, "思源黑体", "Segoe UI", Arial, sans-serif',
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px',
    xl: '32px'
  },
  borderRadius: '4px', // YouTube更偏向使用较小的圆角
};

// 样式组件
const AppContainer = styled.div`
  padding: ${props => props.theme.spacing.medium};
  width: 100%;
  height: 100vh;
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-family: ${props => props.theme.fonts.main};
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  gap: ${props => props.theme.spacing.medium};
`;

const ConfigPanel = styled.div`
  flex: 0.7; /* 减小左侧配置面板的比例，从1变为0.7 */
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius};
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const SubtitlePanel = styled.div`
  flex: 2.3; /* 增加右侧字幕面板的比例，从2变为2.3 */
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius};
  display: flex;
  flex-direction: column;
`;

const PanelHeader = styled.div`
  padding: ${props => props.theme.spacing.small}; /* 减小内边距 */
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const PanelContent = styled.div`
  padding: ${props => props.theme.spacing.small}; /* 减小内边距 */
  flex: 1;
  overflow-y: auto;
`;

const PanelTitle = styled.h2`
  margin: 0;
  font-size: 14px; /* 减小标题字体大小 */
  font-weight: 500;
  color: ${props => props.theme.colors.text};
`;

const GenerateButton = styled.button`
  background-color: ${props => {
    if (props.disabled) return '#606060';
    if (props.completed) return '#383838';
    return props.theme.colors.secondary; // 默认蓝色
  }};
  color: ${props => props.completed ? '#aaaaaa' : 'white'};
  border: ${props => props.completed ? '1px solid #555555' : 'none'};
  border-radius: ${props => props.theme.borderRadius};
  padding: 8px 16px; /* 增大内边距 */
  font-size: 14px; /* 增大字体大小 */
  font-weight: 600; /* 加粗字体 */
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  margin-top: ${props => props.theme.spacing.medium}; /* 增加上边距，更加突出 */
  box-shadow: ${props => props.completed ? 'none' : '0 3px 6px rgba(0, 0, 0, 0.25)'};
  width: 100%; /* 设置宽度为100% */
  display: flex;
  justify-content: center;
  align-items: center;
  height: 38px; /* 固定高度使按钮看起来更大 */
  
  &:hover {
    background-color: ${props => {
      if (props.disabled) return '#606060';
      if (props.completed) return '#444444';
      return '#2186d0'; // 蓝色的hover状态
    }};
    transform: ${props => (props.disabled || props.completed) ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.completed ? 'none' : '0 4px 8px rgba(0, 0, 0, 0.3)'};
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: ${props => props.completed ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.2)'};
  }
`;

const ConfigSection = styled.div`
  margin-bottom: ${props => props.theme.spacing.small}; /* 减小下边距 */
`;

// 添加选项卡组件样式
const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: ${props => props.theme.spacing.small} ${props => props.theme.spacing.small} 0;
`;

const Tab = styled.div`
  padding: 6px 16px; /* 增加选项卡内边距使其更突出 */
  cursor: pointer;
  border-bottom: 2px solid ${props => props.active ? props.theme.colors.secondary : 'transparent'};
  color: ${props => props.active ? props.theme.colors.secondary : props.theme.colors.text};
  font-weight: ${props => props.active ? 600 : 400};
  transition: all 0.2s;
  font-size: 14px; /* 增大选项卡字体大小 */
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

// 添加提示框样式
const NotificationOverlay = styled.div`
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
  backdrop-filter: blur(2px);
`;

const NotificationBox = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.large};
  max-width: 600px;
  min-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
  text-align: left;
  animation: fadeIn 0.3s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const NotificationTitle = styled.h3`
  margin: 0 0 ${props => props.theme.spacing.medium};
  color: ${props => props.theme.colors.text};
  text-align: center;
  font-size: 18px;
`;

const NotificationContent = styled.div`
  margin-bottom: ${props => props.theme.spacing.medium};
  line-height: 1.5;
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  
  p {
    margin: 0.5em 0;
  }
`;

const NotificationButton = styled.button`
  background-color: ${props => props.theme.colors.secondary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius};
  padding: 8px 16px;
  margin-top: ${props => props.theme.spacing.medium};
  cursor: pointer;
  font-size: 14px;
  display: block;
  margin-left: auto;
  margin-right: auto;
  
  &:hover {
    background-color: #2186d0;
  }
`;

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [subtitleSettings, setSubtitleSettings] = useState({
    format: 'srt',
    language: 'zh',
    precision: 'medium' // Default to medium precision
  });
  const [processing, setProcessing] = useState(false);
  const [subtitleState, setSubtitleState] = useState({
    status: '',
    progress: 0,
    error: null,
    completed: false,
    completedPath: null
  });

  // 添加选项卡状态
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' 或 'revision'

  // 添加字幕内容状态 - 分离编辑器和修订的内容
  const [editorContent, setEditorContent] = useState('');  // 用于编辑器标签页
  const [revisionContent, setRevisionContent] = useState(''); // 用于修订标签页
  const [revisionPath, setRevisionPath] = useState(null);
  
  // 添加字幕总结状态
  const [summaryLoaded, setSummaryLoaded] = useState(false);
  
  // 添加字幕是否自动发现的状态
  const [subtitleFound, setSubtitleFound] = useState(false);
  
  // 保留原始内容引用，仅用于初始加载
  const initialContentRef = useRef('');
  
  // 标记各标签内容是否已加载
  const [editorContentLoaded, setEditorContentLoaded] = useState(false);
  const [revisionContentLoaded, setRevisionContentLoaded] = useState(false);
  
  // 保存当前修订总结
  const [currentSummary, setCurrentSummary] = useState('');

  // 添加模型设置相关状态
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [modelSettings, setModelSettings] = useState(null);

  // 添加提示框状态
  const [notification, setNotification] = useState({
    visible: false,
    title: '',
    message: '',
    content: ''
  });

  // 初始化字幕状态管理器
  const [stateManager] = useState(
    () => new SubtitleStateManager(
      // 状态更新回调
      (status) => setSubtitleState(prev => ({ ...prev, status })),
      // 进度更新回调
      (progress) => setSubtitleState(prev => ({ ...prev, progress })),
      // 完成回调
      (path) => {
        setProcessing(false);
        setSubtitleState(prev => ({ 
          ...prev, 
          completed: true,
          completedPath: path
        }));
        
        // 生成修订文件路径
        const revPath = generateRevisionPath(path);
        setRevisionPath(revPath);
        
        // 重置内容加载状态
        setEditorContentLoaded(false);
        setRevisionContentLoaded(false);
        
        // 加载原始字幕文件内容
        loadSubtitleContent(path, 'editor');
      },
      // 错误回调
      (error) => {
        setProcessing(false);
        setSubtitleState(prev => ({ ...prev, error }));
      }
    )
  );

  // 加载模型设置
  useEffect(() => {
    try {
      const settings = getFullModelSettings();
      if (settings) {
        setModelSettings(settings);
      }
    } catch (error) {
      console.error('加载模型设置出错:', error);
    }
  }, []);

  // 保存模型设置
  const handleSaveModelSettings = (settings) => {
    try {
      saveFullModelSettings(settings);
      setModelSettings(settings);
      setSettingsModalOpen(false);
    } catch (error) {
      console.error('保存模型设置出错:', error);
    }
  };

  // 处理打开模型设置对话框
  const handleOpenModelSettings = () => {
    setSettingsModalOpen(true);
  };

  // 根据视频文件路径获取可能的字幕文件路径
  const getPossibleSubtitlePaths = (videoPath) => {
    if (!videoPath) return [];
    
    // 获取文件名部分（不带扩展名）
    const lastSlashIndex = videoPath.lastIndexOf('/') !== -1 ? 
                          videoPath.lastIndexOf('/') : 
                          videoPath.lastIndexOf('\\');
    const lastDotIndex = videoPath.lastIndexOf('.');
    
    // 如果没有扩展名，使用整个文件名
    if (lastDotIndex === -1 || lastDotIndex < lastSlashIndex) {
      const dirPath = videoPath.substring(0, lastSlashIndex + 1);
      const fileName = videoPath.substring(lastSlashIndex + 1);
      return [
        `${dirPath}${fileName}.srt`,
        `${dirPath}${fileName}.vtt`
      ];
    }
    
    // 提取基本文件名（不带扩展名）
    const dirPath = videoPath.substring(0, lastSlashIndex + 1);
    const fileName = videoPath.substring(lastSlashIndex + 1, lastDotIndex);
    
    // 返回常见的字幕文件可能性
    return [
      `${dirPath}${fileName}.srt`,
      `${dirPath}${fileName}.vtt` 
    ];
  };
  
  // 检查字幕文件是否存在并加载
  const checkAndLoadSubtitles = async (videoPath) => {
    if (!videoPath) return;
    
    try {
      const possiblePaths = getPossibleSubtitlePaths(videoPath);
      let foundSubtitlePath = null;
      
      // 检查每个可能的路径
      for (const path of possiblePaths) {
        try {
          // 尝试读取文件，如果成功则表示文件存在
          await window.electron.readSubtitleFile(path);
          foundSubtitlePath = path;
          break;
        } catch (error) {
          // 文件不存在，继续检查下一个
          console.log(`字幕文件不存在: ${path}`);
        }
      }
      
      if (foundSubtitlePath) {
        console.log(`找到字幕文件: ${foundSubtitlePath}`);
        // 更新状态以反映找到的字幕文件
        setSubtitleState(prev => ({
          ...prev,
          completed: true,
          completedPath: foundSubtitlePath
        }));
        
        // 设置已找到字幕文件的标志
        setSubtitleFound(true);
        
        // 生成修订文件路径
        const revPath = generateRevisionPath(foundSubtitlePath);
        setRevisionPath(revPath);
        
        // 重置内容加载状态
        setEditorContentLoaded(false);
        setRevisionContentLoaded(false);
        
        // 加载字幕内容
        loadSubtitleContent(foundSubtitlePath, 'editor');
        
        // 检查修订文件是否存在
        try {
          await window.electron.readSubtitleFile(revPath);
          // 如果修订文件存在，加载它
          loadSubtitleContent(revPath, 'revision');
        } catch (error) {
          // 修订文件不存在，暂不处理
        }
      } else {
        // 未找到字幕文件，重置状态
        setSubtitleFound(false);
      }
    } catch (error) {
      console.error('检查字幕文件时出错:', error);
      setSubtitleFound(false);
    }
  };

  // 处理视频文件选择
  const handleVideoSourceSelect = async () => {
    try {
      const path = await window.electron.chooseVideoSource();
      if (path) {
        setSelectedFile(path);
        setSubtitleState(prev => ({ ...prev, error: null }));
        setSubtitleFound(false); // 重置字幕发现状态
        
        // 检查是否已经有对应的字幕文件
        await checkAndLoadSubtitles(path);
      }
    } catch (err) {
      console.error('选择视频文件时出错:', err);
      setSubtitleState(prev => ({ ...prev, error: '选择视频文件时出错' }));
    }
  };

  useEffect(() => {
    // 注册监听器以接收来自主进程的进度更新
    if (window.electron) {
      window.electron.onSubtitleProgress((progress) => {
        stateManager.updateProgress(progress);
      });
      
      window.electron.onSubtitleComplete((path) => {
        stateManager.setCompleted(path);
        
        // 添加系统通知(如果浏览器支持)
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("字幕生成完成", {
            body: `文件已保存至: ${path}`,
          });
        }
      });
      
      window.electron.onSubtitleError((errorMessage) => {
        stateManager.setError(errorMessage);
      });

      window.electron.onSubtitleStatus((statusMsg) => {
        stateManager.updateStatus(statusMsg);
      });
    }

    // 清理函数
    return () => {
      if (window.electron) {
        window.electron.removeListener();
      }
    };
  }, [stateManager]);

  // 生成修订字幕的路径
  const generateRevisionPath = (originalPath) => {
    if (!originalPath) return null;
    
    const lastDotIndex = originalPath.lastIndexOf('.');
    if (lastDotIndex === -1) return originalPath + '-revised';
    
    const extension = originalPath.substring(lastDotIndex);
    const basePath = originalPath.substring(0, lastDotIndex);
    
    return basePath + '-revised' + extension;
  };

  // 加载字幕内容 - 区分加载到哪个标签页
  const loadSubtitleContent = async (path, targetTab = null) => {
    if (!path) return;
    
    try {
      console.log(`尝试加载字幕文件: ${path} 到${targetTab || activeTab}标签`);
      const content = await window.electron.readSubtitleFile(path);
      console.log(`成功读取字幕文件，内容长度: ${content.length} 字符`);
      
      // 根据目标标签页或当前活动标签页决定内容去向
      const targetTabToLoad = targetTab || activeTab;
      
      // 更新相应的内容状态
      if (targetTabToLoad === 'editor') {
        setEditorContent(content);
        setEditorContentLoaded(true);
        // 保存初始内容以便修订标签初始化使用
        initialContentRef.current = content;
      } else if (targetTabToLoad === 'revision') {
        setRevisionContent(content);
        setRevisionContentLoaded(true);
      }
    } catch (error) {
      console.error(`加载${path}字幕内容失败:`, error);
    }
  };

  const handleGenerate = () => {
    if (!selectedFile) {
      stateManager.setError('请选择一个视频文件');
      return;
    }

    setProcessing(true);
    stateManager.reset();
    
    // 重置字幕发现状态
    setSubtitleFound(false);
    
    // 重置内容和初始化状态
    setEditorContent('');
    setRevisionContent('');
    setEditorContentLoaded(false);
    setRevisionContentLoaded(false);
    initialContentRef.current = '';

    const params = {
      videoPath: selectedFile,
      targetLanguage: subtitleSettings.language,
      format: subtitleSettings.format,
      precision: subtitleSettings.precision
    };

    // 发送生成字幕的请求到主进程
    window.electron.generateSubtitle(params);
  };

  // 保存编辑后的字幕 - 只更新编辑标签页内容
  const handleSaveSubtitle = async (path, content) => {
    try {
      await window.electron.saveSubtitleFile(path, content);
      // 只更新编辑器内容，不影响修订内容
      setEditorContent(content);
      return true;
    } catch (error) {
      console.error('保存字幕失败:', error);
      stateManager.setError(`保存字幕失败: ${error.message}`);
      return false;
    }
  };

  // 更新当前的修订总结
  const handleSummaryUpdate = (summary) => {
    setCurrentSummary(summary);
  };

  // 保存修订版字幕 - 只更新修订标签页内容
  const handleSaveRevision = async (path, content, summary) => {
    try {
      // 添加摘要参数到保存事件中，使其能被监听器接收
      await window.electron.saveSubtitleFile(path, content, summary);
      // 只更新修订内容，不影响编辑器内容
      setRevisionContent(content);
      return true;
    } catch (error) {
      console.error('保存修订字幕失败:', error);
      stateManager.setError(`保存修订字幕失败: ${error.message}`);
      return false;
    }
  };

  // 关闭提示框
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, visible: false }));
  };

  // 处理标签切换
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    
    // 如果切换到的标签内容尚未加载，则加载对应的内容
    if (tabName === 'editor' && !editorContentLoaded && subtitleState.completedPath) {
      loadSubtitleContent(subtitleState.completedPath, 'editor');
    }
    else if (tabName === 'revision' && !revisionContentLoaded) {
      // 对于修订标签，尝试加载修订文件，如果不存在则初始化为原始内容
      if (revisionPath) {
        // 先尝试检查修订文件是否存在
        window.electron.readSubtitleFile(revisionPath)
          .then(content => {
            // 如果成功读取到修订文件内容
            setRevisionContent(content);
            setRevisionContentLoaded(true);
          })
          .catch(() => {
            // 如果修订文件不存在或无法读取，使用原内容初始化修订内容
            if (initialContentRef.current) {
              setRevisionContent(initialContentRef.current);
              setRevisionContentLoaded(true);
            } else if (subtitleState.completedPath) {
              // 尝试从原始文件加载
              loadSubtitleContent(subtitleState.completedPath, 'revision');
            }
          });
      } else if (subtitleState.completedPath) {
        // 如果没有修订文件路径，直接使用原始内容
        if (initialContentRef.current) {
          setRevisionContent(initialContentRef.current);
          setRevisionContentLoaded(true);
        } else {
          loadSubtitleContent(subtitleState.completedPath, 'revision');
        }
      }
    }
  };

  // 当字幕生成完成时，自动加载对应标签的内容
  useEffect(() => {
    if (subtitleState.completed && subtitleState.completedPath) {
      if (activeTab === 'editor' && !editorContentLoaded) {
        loadSubtitleContent(subtitleState.completedPath, 'editor');
      } else if (activeTab === 'revision' && !revisionContentLoaded) {
        // 先尝试加载修订文件，如果不存在则使用原始内容
        const pathToTry = revisionPath || subtitleState.completedPath;
        loadSubtitleContent(pathToTry, 'revision');
      }
    }
  }, [subtitleState.completed, subtitleState.completedPath, activeTab, editorContentLoaded, revisionContentLoaded, revisionPath]);

  // 标签切换时，确保自动加载当前标签对应的内容
  useEffect(() => {
    if (subtitleState.completedPath) {
      if (activeTab === 'editor' && !editorContentLoaded) {
        loadSubtitleContent(subtitleState.completedPath, 'editor');
      } else if (activeTab === 'revision' && !revisionContentLoaded) {
        // 先尝试加载修订文件，如果不存在则使用原始内容
        const pathToTry = revisionPath || subtitleState.completedPath;
        loadSubtitleContent(pathToTry, 'revision');
      }
    }
  }, [activeTab]);

  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
        <MainContent>
          {/* 左侧配置面板 */}
          <ConfigPanel>
            <PanelHeader>
              <PanelTitle>字幕配置</PanelTitle>
            </PanelHeader>
            <PanelContent>
              <ConfigSection>
                <FileSelector 
                  selectedFile={selectedFile} 
                  onSelectFile={handleVideoSourceSelect} 
                  label="选择视频文件"
                  subtitleFound={subtitleFound}
                />
              </ConfigSection>

              <ConfigSection>
                <SubtitleSettings 
                  settings={subtitleSettings} 
                  onChange={setSubtitleSettings} 
                  onOpenModelSettings={handleOpenModelSettings}
                />
              </ConfigSection>
              
              <GenerateButton 
                onClick={handleGenerate} 
                disabled={processing || !selectedFile}
                completed={subtitleState.completed && !processing}
              >
                {processing ? '处理中...' : subtitleState.completed ? '重新生成字幕' : '生成字幕'}
              </GenerateButton>
            </PanelContent>
          </ConfigPanel>
          
          {/* 右侧字幕面板 */}
          <SubtitlePanel>
            {/* 把选项卡移到顶部，作为主标题 */}
            <TabContainer>
              <Tab 
                active={activeTab === 'editor'} 
                onClick={() => handleTabChange('editor')}
              >
                字幕编辑
              </Tab>
              <Tab 
                active={activeTab === 'revision'} 
                onClick={() => handleTabChange('revision')}
              >
                字幕修订
              </Tab>
              <Tab 
                active={activeTab === 'summary'} 
                onClick={() => handleTabChange('summary')}
              >
                字幕总结
              </Tab>
            </TabContainer>
            
            <PanelContent>
              {activeTab === 'editor' ? (
                <SubtitleEditor 
                  subtitlePath={subtitleState.completedPath} 
                  isGenerating={processing}
                  onSave={handleSaveSubtitle}
                  status={subtitleState.status}
                  progress={subtitleState.progress}
                  error={subtitleState.error}
                  stageText={processing ? stateManager.getStageText() : ''}
                  content={editorContent}
                  onContentChange={setEditorContent}
                />
              ) : activeTab === 'revision' ? (
                <SubtitleRevision 
                  subtitlePath={revisionPath || subtitleState.completedPath}
                  initialContent={initialContentRef.current}
                  content={revisionContent}
                  onContentChange={setRevisionContent}
                  onSaveRevision={handleSaveRevision}
                  onSummaryUpdate={handleSummaryUpdate}
                  modelSettings={modelSettings}
                />
              ) : (
                <SubtitleSummary 
                  subtitlePath={revisionPath || subtitleState.completedPath}
                  content={revisionContent || editorContent}
                  modelSettings={modelSettings}
                />
              )}
            </PanelContent>
          </SubtitlePanel>
        </MainContent>
        
        {/* 修订总结弹框 */}
        {notification.visible && (
          <NotificationOverlay onClick={closeNotification}>
            <NotificationBox onClick={e => e.stopPropagation()}>
              <NotificationTitle>{notification.title}</NotificationTitle>
              <p>{notification.message}</p>
              
              {notification.content && (
                <NotificationContent 
                  dangerouslySetInnerHTML={{ __html: notification.content.replace(/\n/g, '<br>') }}
                />
              )}
              
              <NotificationButton onClick={closeNotification}>
                确定
              </NotificationButton>
            </NotificationBox>
          </NotificationOverlay>
        )}

        {/* 模型设置弹窗 */}
        <ModelSettingsModal
          isOpen={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
          settings={modelSettings}
          onSave={handleSaveModelSettings}
        />
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;
