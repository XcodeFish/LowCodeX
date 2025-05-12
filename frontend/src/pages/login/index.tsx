import React, { useState, useEffect, useRef } from 'react';
import {
  Form,
  Input,
  Button,
  Checkbox,
  Card,
  Divider,
  Typography,
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
  const { loading, handleSubmit, clearLoginMessages } = useLogin();
  const { saveUsername } = useRememberUsername(form);

  // 使用ref防止重复提交
  const submitLockRef = useRef<boolean>(false);
  // 使用ref保存表单初始值以便在需要时恢复
  const formInitialValuesRef = useRef<any>(null);

  // 捕获初始表单值
  useEffect(() => {
    if (!formInitialValuesRef.current) {
      formInitialValuesRef.current = form.getFieldsValue(true);
    }
  }, [form]);

  // 添加全局错误处理
  useEffect(() => {
    // 全局错误处理函数，防止错误显示在UI上
    const handleGlobalError = (event: ErrorEvent) => {
      // 阻止默认行为，不在控制台显示错误
      event.preventDefault();
      console.log('已捕获错误，但不显示在UI上');
      return true;
    };

    // 添加全局错误处理
    window.addEventListener('error', handleGlobalError);

    // 确保组件挂载时清除所有可能存在的消息
    clearLoginMessages();

    // 清理函数
    return () => {
      window.removeEventListener('error', handleGlobalError);
      clearLoginMessages();
    };
  }, [clearLoginMessages]);

  // 提交登录
  const onFinish = async (values: any) => {
    // 防止重复提交
    if (submitLockRef.current || loading) {
      return;
    }

    submitLockRef.current = true;
    console.log('values', values);

    try {
      // 构造符合LoginRequest类型的数据
      const loginData: LoginRequest = {
        username: values.username,
        password: values.password,
        rememberMe: values.remember
      };

      // 处理记住用户名
      if (values.username && values.remember !== undefined) {
        saveUsername(values.username, values.remember);
      }

      // 提交登录请求
      await handleSubmit(loginData);
    } catch (error) {
      // 捕获任何可能的错误，防止它们显示在UI上
      console.log('登录过程中出现错误，但已被处理');
    } finally {
      // 确保无论如何都能解锁提交状态
      setTimeout(() => {
        submitLockRef.current = false;
      }, 500); // 短暂延迟解锁，防止快速重复点击
    }
  };

  // 处理按钮点击，防止重复提交
  const handleButtonClick = (e: React.MouseEvent) => {
    if (submitLockRef.current || loading) {
      e.preventDefault();
      e.stopPropagation();
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
          <Title level={3}></Title>
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
            // 防止表单重置，保持用户输入值
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
                // 禁用自动填充样式修改
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
                // 禁用自动填充样式修改
                data-form-type="password"
              />
            </Form.Item>

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
                className="login-button"
                onClick={handleButtonClick}
                // 移除loading状态，仅禁用按钮防止重复提交
                disabled={submitLockRef.current || loading}
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
