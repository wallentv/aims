import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ThemeProvider } from 'styled-components';
import FileSelector from './components/FileSelector';
import SubtitleSettings from './components/SubtitleSettings';
import ProgressBar from './components/ProgressBar';

// 主题配置
const theme = {
  colors: {
    primary: '#3f51b5',
    secondary: '#f50057',
    background: '#222',
    surface: '#333',
    text: '#f0f0f0',
    textSecondary: '#aaa',
  },
  fonts: {
    main: '"思源黑体", "Segoe UI", "Roboto", sans-serif',
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px',
  },
  borderRadius: '8px',
};

// 样式组件
const AppContainer = styled.div`
  padding: ${props => props.theme.spacing.large};
  max-width: 100%;
  max-height: 100vh;
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-family: ${props => props.theme.fonts.main};
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  margin-bottom: ${props => props.theme.spacing.large};
  text-align: center;
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const GenerateButton = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.medium};
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: ${props => props.theme.spacing.large};
  
  &:hover {
    background-color: #4a5fd0;
  }
  
  &:disabled {
    background-color: #666;
    cursor: not-allowed;
  }
`;

const SubtitlesContainer = styled.div`
  margin-top: ${props => props.theme.spacing.large};
  padding: ${props => props.theme.spacing.medium};
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius};
  max-height: 300px;
  overflow-y: auto;
`;

const SubtitlesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.small};
`;

const SubtitleItem = styled.div`
  margin-bottom: ${props => props.theme.spacing.small};
`;

const SubtitleTime = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.8rem;
`;

const SubtitleText = styled.div`
  color: ${props => props.theme.colors.text};
`;

// 添加一个完成通知组件
const CompletionNotice = styled.div`
  background-color: #4CAF50;
  color: white;
  padding: ${props => props.theme.spacing.medium};
  border-radius: ${props => props.theme.borderRadius};
  margin-top: ${props => props.theme.spacing.medium};
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: fadeIn 0.5s;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

// 添加一个状态显示组件
const StatusDisplay = styled.div`
  background-color: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  padding: ${props => props.theme.spacing.medium};
  border-radius: ${props => props.theme.borderRadius};
  margin: ${props => props.theme.spacing.medium} 0;
`;

// 添加转录阶段显示
const getStageText = (progress) => {
  if (progress === 0) return "准备中...";
  if (progress < 10) return "正在加载AI模型...";
  if (progress < 20) return "正在提取音频...";
  if (progress < 30) return "准备开始转录...";
  if (progress < 90) return "正在进行语音转录...";
  if (progress < 100) return "正在生成字幕文件...";
  return "已完成";
};

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [subtitleSettings, setSubtitleSettings] = useState({
    format: 'srt',
    language: 'zh'
  });
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [completedPath, setCompletedPath] = useState(null);

  // 处理视频文件选择
  const handleVideoSourceSelect = async () => {
    try {
      const path = await window.electron.chooseVideoSource();
      if (path) {
        setSelectedFile(path);
        setError(null);
      }
    } catch (err) {
      console.error('选择视频文件时出错:', err);
      setError('选择视频文件时出错');
    }
  };

  useEffect(() => {
    // 注册监听器以接收来自主进程的进度更新
    const progressListener = (progress) => {
      setProgress(progress);
      setStatus(`处理中 ${progress}%...`);
    };
    
    const completeListener = (path) => {
      setProgress(100);
      setProcessing(false);
      setCompleted(true);
      setCompletedPath(path);
      setStatus('处理完成');
      console.log(`字幕文件已保存至: ${path}`);
      
      // 添加系统通知(如果浏览器支持)
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("字幕生成完成", {
          body: `文件已保存至: ${path}`,
        });
      }
    };
    
    const errorListener = (errorMessage) => {
      setProcessing(false);
      setError(errorMessage);
      setStatus('处理出错');
      console.error(`处理出错: ${errorMessage}`);
    };

    // 修改状态信息监听器，让新状态替换旧状态
    const statusListener = (statusMsg) => {
      setStatus(statusMsg); // 直接替换状态，不再追加
    };

    // 如果window.electron存在，则添加事件监听器
    if (window.electron) {
      window.electron.onSubtitleProgress(progressListener);
      window.electron.onSubtitleComplete(completeListener);
      window.electron.onSubtitleError(errorListener);
      window.electron.onSubtitleStatus(statusListener);  // 添加新监听器
    }

    // 清理函数
    return () => {
      if (window.electron) {
        window.electron.removeListener();
      }
    };
  }, []);

  const handleGenerate = () => {
    if (!selectedFile) {
      setError('请选择一个文件或文件夹');
      return;
    }

    setProcessing(true);
    setCompleted(false);
    setError(null);
    setStatus('开始处理...');  // 重置状态信息
    setCompletedPath(null); // 重置完成路径
    // 移除这一行
    // setRealtimeSubtitles([]);

    const params = {
      videoPath: selectedFile,
      targetLanguage: subtitleSettings.language,
      format: subtitleSettings.format
    };

    // 发送生成字幕的请求到主进程
    window.electron.generateSubtitle(params);
  };

  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
        <Header>
          <Title>AI字幕生成</Title>
        </Header>
        
        {/* 更新界面，只显示文件选择，更正按钮文本 */}
        <div style={{ marginBottom: theme.spacing.large }}>
          <h3>选择视频文件</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.small }}>
            <button 
              onClick={handleVideoSourceSelect}
              style={{
                backgroundColor: theme.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: theme.borderRadius,
                padding: theme.spacing.medium,
                cursor: 'pointer'
              }}
            >
              选择视频文件
            </button>
            {selectedFile && (
              <span>
                已选择: {selectedFile}
              </span>
            )}
          </div>
        </div>
        
        <SubtitleSettings settings={subtitleSettings} onChange={setSubtitleSettings} />
        <GenerateButton onClick={handleGenerate} disabled={processing || !selectedFile}>
          {processing ? '处理中...' : '生成字幕'}
        </GenerateButton>
        
        {/* 替换原来的状态显示，添加更详细的状态信息 */}
        {(status || processing) && (
          <StatusDisplay>
            <div>
              <strong>状态:</strong> {status}
            </div>
            {processing && (
              <div style={{ marginTop: '8px' }}>
                <strong>当前阶段:</strong> {getStageText(progress)}
              </div>
            )}
          </StatusDisplay>
        )}
        
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <ProgressBar progress={progress} />
        
        {/* 添加完成通知 */}
        {completed && completedPath && (
          <CompletionNotice>
            <span>✅ 字幕生成完成！</span>
            <span>保存路径: {completedPath}</span>
          </CompletionNotice>
        )}
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;
