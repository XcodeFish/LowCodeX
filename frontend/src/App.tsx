import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import { ConfigProvider, Spin } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import { store } from '@/store';
import { AppRouter } from '@/router';
import '@/styles/global.less';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ConfigProvider locale={zhCN}>
  <Suspense
    fallback={
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <Spin size="large" tip="加载中..." />
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
