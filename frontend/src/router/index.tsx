import { createBrowserRouter } from 'react-router-dom';

// 页面导入将在这里
// import Home from '../pages/Home';
// import Login from '../pages/Login';

const router = createBrowserRouter([
  {
    path: '/',
    // element: <Home />,
    // 示例路由配置
  },
  {
    path: '/login',
    // element: <Login />,
  },
  // 更多路由将在这里添加
]);

export default router;
