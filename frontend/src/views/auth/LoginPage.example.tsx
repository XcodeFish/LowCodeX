import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../hooks'; // 导入重构后的auth hooks

/**
 * 登录页面示例组件
 * 展示如何使用重构后的auth hooks
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, getRememberedUsername, loading, error, clearAuthError } = auth.useAuth();

  const [formData, setFormData] = useState({
    username: getRememberedUsername(), // 使用记住的用户名
    password: '',
    rememberMe: Boolean(getRememberedUsername())
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError(); // 清除之前的错误

    const result = await login({
      username: formData.username,
      password: formData.password,
      rememberMe: formData.rememberMe
    });

    if (result.success) {
      navigate('/dashboard');
    }
    // 错误处理已在hook内部完成，会更新到Redux store中
  };

  return (
    <div className="login-page">
      <h2>登录</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">用户名</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">密码</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            记住我
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? '登录中...' : '登录'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
