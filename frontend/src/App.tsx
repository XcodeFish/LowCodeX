import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import { ConfigProvider, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { store } from '@/store';
import { AppRouter } from '@/router';
import '@/styles/global.less';

// 定义主题配置
const themeConfig = {
  token: {
    colorPrimary: '#1677FF',
    borderRadius: 4,
  }
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ConfigProvider locale={zhCN} theme={themeConfig}>
        <Suspense
          fallback={
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh'
            }}>
              <Spin size="large" tip="加载中..." fullscreen />
            </div>
          }
        >
          <AppRouter />
        </Suspense>
      </ConfigProvider>
    </Provider>
  );
};

export default App;
