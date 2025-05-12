import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Checkbox,
  Card,
  Typography,
  Space,
  Alert,
} from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useLogin } from './hooks/useLogin';
import type { LoginRequest } from '../../types/auth';
import './index.scss';

const { Title, Text } = Typography;

export const Login: React.FC = () => {
  const { form, loading, errorMessage, handleLogin, rememberedUsername } = useLogin();

  return (
    <div className="login-container">
      <Card
        className="login-card"
        variant="borderless"
      >
        <div className="login-header">
          <img
            src="/logo.svg"
            alt="LowCodeX Logo"
            className="login-logo"
          />
          <Title level={3}></Title>
          <Text type="secondary">使用您的账号继续访问平台</Text>
        </div>

        <div className="login-form-container">
          {errorMessage && (
            <Alert
              message={errorMessage}
              type="error"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <Form
            form={form}
            name="login"
            initialValues={{
              rememberMe: true,
              username: rememberedUsername || ''
            }}
            onFinish={handleLogin}
            autoComplete="off"
            layout="vertical"
            requiredMark={false}
            preserve={true}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名!' }]}
            >
              <Input
                placeholder="请输入用户名"
                size="large"
                className="custom-input"
                autoComplete="username"
                data-form-type="other"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码!' }]}
            >
              <Input.Password
                placeholder="请输入密码"
                size="large"
                className="custom-input"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                autoComplete="current-password"
                data-form-type="password"
              />
            </Form.Item>

            <Form.Item>
              <div className="login-options">
                <Form.Item name="rememberMe" valuePropName="checked" noStyle>
                  <Checkbox>记住用户名</Checkbox>
                </Form.Item>

                <Link to="/profile/forget-password" className="forgot-password">
                  忘记密码?
                </Link>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="login-button"
                loading={loading}
                disabled={loading}
              >
                登录
              </Button>
            </Form.Item>

            <div className="bottom-section">
              <div className="register-text">
                <Space align="center">
                  <span>还没有账号?</span>
                  <Link to="/auth/register">立即注册</Link>
                </Space>
              </div>
            </div>
          </Form>
        </div>
      </Card>
    </div>
  );
};

export default Login;
