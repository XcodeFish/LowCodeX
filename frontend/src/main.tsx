import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import router from './router';
import { store } from './store';
import './styles/index.css'
import './index.css'

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider locale={zhCN}>
        {router}
      </ConfigProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
)
