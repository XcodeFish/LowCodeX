import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import AppRouter from './router';
import { store } from './store';
import './styles/index.scss'
import './index.scss'

// 获取root元素
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');
const root = createRoot(rootElement);

// 定义主题配置
const themeConfig = {
  token: {
    colorPrimary: '#1677FF',
    borderRadius: 4,
  }
};

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider locale={zhCN} theme={themeConfig}>
        <AppRouter />
      </ConfigProvider>
    </Provider>
  </React.StrictMode>
);
