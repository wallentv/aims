// 模型配置工具类
// 提供模型相关的常量、默认值和配置管理方法

// 默认的字幕修订提示词
export const DEFAULT_REVISION_PROMPT = "请帮我修正以下SRT格式字幕中可能存在的错别字、不通顺的表达和标点符号错误，输出修正后的完整字幕。\n" +
"请特别注意：\n" +
"1. 不要改变字幕的时间标记\n" +
"2. 不要改变字幕的编号\n" +
"3. 保持原文的整体含义\n" +
"4. 修正错别字和语法错误\n" +
"5. 优化不通顺的表达\n" +
"6. 修正标点符号错误\n\n" +
"同时，请在字幕修正完成后，添加一个总结，列出你修改了哪些内容，以及做了哪些改进。\n\n" +
"输出的字幕里不要有其他元素，特别是字幕的头和尾，不要有解释说明文字和符号：\n" +

"{{subtitle}}";

// 默认的字幕总结提示词
export const DEFAULT_SUMMARY_PROMPT = "请根据以下字幕内容，分别生成：1）视频标题；2）视频简介（300-500字）；3）视频章节（带时间戳的内容大纲，方便观众快速找到感兴趣的章节）；4）视频标签（最多10个和视频内容高度相关的标签，以逗号分隔）。\n\n" +
"视频标题应该是吸引人的，能够清晰表达视频的主要内容或价值。\n" +
"视频简介应该高度总结视频的核心内容，带一些易于搜索的关键字，吸引用户观看。\n" +
"视频章节要以时间戳+章节标题的形式呈现，每行一个章节点，尽量提取视频中的重要时间点并简洁描述内容。\n" +
"视频标签要简洁精准，与视频内容高度相关。\n\n" +
"请按以下格式输出：\n" +
"# 标题\n" +
"（在这里输出视频标题）\n\n" +
"# 简介\n" +
"（在这里输出视频简介）\n\n" +
"# 章节\n" +
"00:00 章节1标题\n" +
"XX:XX 章节2标题\n" +
"（...）\n\n" +
"# 标签\n" +
"标签1,标签2,标签3,标签4,标签5,标签6,标签7,标签8,标签9,标签10\n\n" +
"以下是字幕内容：\n" +
"{{subtitle}}";

// 服务提供商
export const PROVIDERS = {
  OPENAI: 'openai',
  DEEPSEEK: 'deepseek'
};

// 提供商特定的模型列表
export const PROVIDER_MODELS = {
  [PROVIDERS.OPENAI]: [
    { id: 'gpt-4', name: 'GPT-4' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    { id: 'gpt-3.5-turbo-16k', name: 'GPT-3.5 Turbo (16k)' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' }
  ],
  [PROVIDERS.DEEPSEEK]: [
    { id: 'deepseek-chat', name: 'DeepSeek Chat' },
    { id: 'deepseek-reasoner', name: 'DeepSeek Coder' }
  ]
};

// 默认API URL
export const DEFAULT_API_URLS = {
  [PROVIDERS.OPENAI]: 'https://api.openai.com/v1',
  [PROVIDERS.DEEPSEEK]: 'https://api.deepseek.com/v1'
};

// 获取默认的提供商设置
export const getDefaultProviderSettings = () => ({
  [PROVIDERS.OPENAI]: {
    apiUrl: DEFAULT_API_URLS[PROVIDERS.OPENAI],
    apiKey: '',
    modelId: 'gpt-3.5-turbo',
  },
  [PROVIDERS.DEEPSEEK]: {
    apiUrl: DEFAULT_API_URLS[PROVIDERS.DEEPSEEK],
    apiKey: '',
    modelId: 'deepseek-chat',
  }
});

// 获取存储在localStorage中的模型设置
export const getStoredModelSettings = (key, defaultValue = null) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.error(`获取存储的模型设置失败: ${key}`, error);
    return defaultValue;
  }
};

// 保存模型设置到localStorage
export const saveModelSettings = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`保存模型设置失败: ${key}`, error);
    return false;
  }
};

// 获取当前活动的模型提供商
export const getActiveProvider = () => {
  return localStorage.getItem('activeProvider') || PROVIDERS.OPENAI;
};

// 设置当前活动的模型提供商
export const setActiveProvider = (provider) => {
  localStorage.setItem('activeProvider', provider);
};

// 获取完整的模型设置（包括所有提供商和提示词模板）
export const getFullModelSettings = () => {
  const activeProvider = getActiveProvider();
  const allSettings = getStoredModelSettings('allModelSettings', {});
  
  // 初始化默认设置
  const defaultSettings = {
    provider: activeProvider,
    providerSettings: getDefaultProviderSettings(),
    revisionPromptTemplate: DEFAULT_REVISION_PROMPT,
    summaryPromptTemplate: DEFAULT_SUMMARY_PROMPT,
  };
  
  // 合并存储的设置
  const mergedSettings = {
    ...defaultSettings,
    ...allSettings,
    provider: activeProvider,
  };
  
  // 确保包含当前提供商的API设置（向后兼容）
  if (mergedSettings.providerSettings && mergedSettings.providerSettings[activeProvider]) {
    const currentProviderSettings = mergedSettings.providerSettings[activeProvider];
    mergedSettings.apiUrl = currentProviderSettings.apiUrl;
    mergedSettings.apiKey = currentProviderSettings.apiKey;
    mergedSettings.modelId = currentProviderSettings.modelId;
  }
  
  return mergedSettings;
};

// 保存完整的模型设置
export const saveFullModelSettings = (settings) => {
  try {
    // 提取当前提供商
    const provider = settings.provider || PROVIDERS.OPENAI;
    
    // 设置活动提供商
    setActiveProvider(provider);
    
    // 整理设置格式
    const formattedSettings = {
      provider,
      revisionPromptTemplate: settings.revisionPromptTemplate || DEFAULT_REVISION_PROMPT,
      summaryPromptTemplate: settings.summaryPromptTemplate || DEFAULT_SUMMARY_PROMPT,
      providerSettings: settings.providerSettings || {},
    };
    
    // 确保当前提供商的设置已更新
    if (!formattedSettings.providerSettings[provider]) {
      formattedSettings.providerSettings[provider] = {};
    }
    
    // 更新当前提供商的设置
    formattedSettings.providerSettings[provider] = {
      ...formattedSettings.providerSettings[provider],
      apiUrl: settings.apiUrl || DEFAULT_API_URLS[provider],
      apiKey: settings.apiKey || '',
      modelId: settings.modelId || PROVIDER_MODELS[provider][0].id,
    };
    
    // 保存到本地存储
    saveModelSettings('allModelSettings', formattedSettings);
    return true;
  } catch (error) {
    console.error('保存模型设置失败:', error);
    return false;
  }
};