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

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDirectory, setIsDirectory] = useState(false);
  const [subtitleSettings, setSubtitleSettings] = useState({
    format: 'srt',
    language: 'zh'
  });
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  // 移除实时字幕状态
  // const [realtimeSubtitles, setRealtimeSubtitles] = useState([]);

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
      setStatus('处理完成');
      console.log(`字幕文件已保存至: ${path}`);
    };
    
    const errorListener = (errorMessage) => {
      setProcessing(false);
      setError(errorMessage);
      setStatus('处理出错');
      console.error(`处理出错: ${errorMessage}`);
    };

    // 移除实时字幕监听器
    // const realtimeListener = (subtitleData) => {
    //   setRealtimeSubtitles(prev => [...prev, subtitleData]);
    // };

    // 如果window.electron存在，则添加事件监听器
    if (window.electron) {
      window.electron.onSubtitleProgress(progressListener);
      window.electron.onSubtitleComplete(completeListener);
      window.electron.onSubtitleError(errorListener);
      // 移除实时字幕监听
      // window.electron.onSubtitleRealtime(realtimeListener); 
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
    setStatus('开始处理...');
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
        <FileSelector onFileSelect={setSelectedFile} onDirectorySelect={setIsDirectory} />
        <SubtitleSettings settings={subtitleSettings} onChange={setSubtitleSettings} />
        <GenerateButton onClick={handleGenerate} disabled={processing}>
          {processing ? '处理中...' : '生成字幕'}
        </GenerateButton>
        {status && <p>{status}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <ProgressBar progress={progress} />
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;
