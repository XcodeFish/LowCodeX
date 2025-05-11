import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Checkbox,
  Card,
  Divider,
  Typography,
  message,
  Space,
} from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useLogin } from './hooks/useLogin';
import { useRememberUsername } from './hooks/useRememberUsername';
import type { LoginRequest } from '@/types/auth';
import './index.scss';

const { Title, Text } = Typography;

export const Login: React.FC = () => {
  const [form] = Form.useForm();
  const { loading, handleSubmit } = useLogin();
  const { saveUsername } = useRememberUsername(form);
  const [loginError, setLoginError] = useState<string | null>(null);

  // 提交登录
  const onFinish = (values: any) => {
    setLoginError(null);

    // 构造符合LoginRequest类型的数据
    const loginData: LoginRequest = {
      username: values.username,
      password: values.password,
      rememberMe: values.remember
    };

    try {
      handleSubmit(loginData);

      // 处理记住用户名
      if (values.username && values.remember !== undefined) {
        saveUsername(values.username, values.remember);
      }
    } catch (error) {
      setLoginError('登录失败，请检查用户名和密码');
      message.error('登录失败，请检查用户名和密码');
    }
  };

  return (
    <div className="login-container">
      <Card
        className="login-card"
        bordered={false}
      >
        <div className="login-header">
          <img
            src="/logo.svg"
            alt="LowCodeX Logo"
            className="login-logo"
          />
          <Title level={3}>欢迎回到 LowCodeX</Title>
          <Text type="secondary">使用您的账号继续访问平台</Text>
        </div>

        <div className="login-form-container">
          <Form
            form={form}
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名!' }]}
            >
              <Input
                placeholder="请输入用户名"
                size="large"
                className="custom-input"
                autoComplete="off"
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
                autoComplete="off"
              />
            </Form.Item>

            {loginError && (
              <div className="login-error">
                <Text type="danger">{loginError}</Text>
              </div>
            )}

            <Form.Item>
              <div className="login-options">
                <Form.Item name="remember" valuePropName="checked" noStyle>
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
                loading={loading}
                className="login-button"
              >
                登录
              </Button>
            </Form.Item>

            <div className="bottom-section">
              {/* <Divider plain>
                <Text type="secondary">或者</Text>
              </Divider> */}

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
