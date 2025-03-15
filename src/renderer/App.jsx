import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ThemeProvider } from 'styled-components';
import FileSelector from './components/FileSelector.jsx';
import SubtitleSettings from './components/SubtitleSettings.jsx';
import ProgressBar from './components/ProgressBar.jsx';
import SubtitleEditor from './components/SubtitleEditor.jsx';
import SubtitleStateManager from './utils/SubtitleStateManager.js';

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

const Header = styled.header`
  display: flex;
  align-items: center;
  padding: ${props => props.theme.spacing.small} ${props => props.theme.spacing.large};
  margin-bottom: ${props => props.theme.spacing.medium};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const LogoIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px; // 修改为长条形宽度
  height: 35px; // 修改为适合长条形的高度
  background-color: ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius};
  margin-right: ${props => props.theme.spacing.small};
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text};
  font-size: 16px; // 修改：将标题文字变小
  font-weight: 500;
  margin: 0;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  gap: ${props => props.theme.spacing.medium};
`;

const ConfigPanel = styled.div`
  flex: 1;
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius};
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const SubtitlePanel = styled.div`
  flex: 2;
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius};
  display: flex;
  flex-direction: column;
`;

const PanelHeader = styled.div`
  padding: ${props => props.theme.spacing.medium};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const PanelContent = styled.div`
  padding: ${props => props.theme.spacing.medium};
  flex: 1;
  overflow-y: auto;
`;

const PanelTitle = styled.h2`
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
`;

const GenerateButton = styled.button`
  background-color: ${props => props.theme.colors.secondary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.small} ${props => props.theme.spacing.medium};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: ${props => props.theme.spacing.medium};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  
  &:hover {
    background-color: #2186d0;
    transform: translateY(-1px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    background-color: #606060;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
`;

const ConfigSection = styled.div`
  margin-bottom: ${props => props.theme.spacing.medium};
`;

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [subtitleSettings, setSubtitleSettings] = useState({
    format: 'srt',
    language: 'zh'
  });
  const [processing, setProcessing] = useState(false);
  const [subtitleState, setSubtitleState] = useState({
    status: '',
    progress: 0,
    error: null,
    completed: false,
    completedPath: null
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
      },
      // 错误回调
      (error) => {
        setProcessing(false);
        setSubtitleState(prev => ({ ...prev, error }));
      }
    )
  );

  // 处理视频文件选择
  const handleVideoSourceSelect = async () => {
    try {
      const path = await window.electron.chooseVideoSource();
      if (path) {
        setSelectedFile(path);
        setSubtitleState(prev => ({ ...prev, error: null }));
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

  const handleGenerate = () => {
    if (!selectedFile) {
      stateManager.setError('请选择一个视频文件');
      return;
    }

    setProcessing(true);
    stateManager.reset();

    const params = {
      videoPath: selectedFile,
      targetLanguage: subtitleSettings.language,
      format: subtitleSettings.format
    };

    // 发送生成字幕的请求到主进程
    window.electron.generateSubtitle(params);
  };

  // 保存编辑后的字幕
  const handleSaveSubtitle = async (path, content) => {
    try {
      await window.electron.saveSubtitleFile(path, content);
      return true;
    } catch (error) {
      console.error('保存字幕失败:', error);
      stateManager.setError(`保存字幕失败: ${error.message}`);
      return false;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
        <Header style={{ paddingLeft: 0 }}>
          <LogoIcon>
            <span style={{ fontSize: '12px', color: 'white' }}>涡轮TV</span>
          </LogoIcon>
          <Title>AI字幕生成</Title>
        </Header>
        
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
                />
              </ConfigSection>

              <ConfigSection>
                <SubtitleSettings settings={subtitleSettings} onChange={setSubtitleSettings} />
              </ConfigSection>
              
              <GenerateButton onClick={handleGenerate} disabled={processing || !selectedFile}>
                {processing ? '处理中...' : '生成字幕'}
              </GenerateButton>
            </PanelContent>
          </ConfigPanel>
          
          {/* 右侧字幕面板 */}
          <SubtitlePanel>
            <PanelHeader>
              <PanelTitle>字幕编辑</PanelTitle>
            </PanelHeader>
            <PanelContent>
              <SubtitleEditor 
                subtitlePath={subtitleState.completedPath} 
                isGenerating={processing}
                onSave={handleSaveSubtitle}
                status={subtitleState.status}
                progress={subtitleState.progress}
                error={subtitleState.error}
                stageText={processing ? stateManager.getStageText() : ''}
              />
            </PanelContent>
          </SubtitlePanel>
        </MainContent>
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;
