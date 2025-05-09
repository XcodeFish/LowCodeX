import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React from 'react';

// 页面导入将在这里
// import Home from '../pages/Home';
// import Login from '../pages/Login';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<div>首页</div>} />
    <Route path="/login" element={<div>登录页</div>} />
    {/* 更多路由将在这里添加 */}
  </Routes>
);

const router = (
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);

export default router;
