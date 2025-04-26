// 显式导入渲染进程入口文件
// 确保React应用能正确从渲染进程入口点加载
import './renderer/index.jsx';

// 添加错误处理，防止加载失败时没有错误信息
try {
  console.log('正在初始化应用...');
} catch (error) {
  console.error('应用初始化失败:', error);
}