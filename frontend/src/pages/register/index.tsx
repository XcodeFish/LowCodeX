import React, { useState, useEffect, useRef } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Space,
  Divider,
  Tooltip,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useRegister } from './hooks/useRegister';
import type { RegisterUserRequest } from '../../types/auth';
import './index.scss';

const { Title, Text } = Typography;

// 密码规则正则表达式
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

export const Register: React.FC = () => {
  const [form] = Form.useForm();
  const { loading, handleSubmit, clearRegisterMessages } = useRegister();
  const [pageLoaded, setPageLoaded] = useState(false);

  // 表单提交防重复
  const submitLockRef = useRef<boolean>(false);
  const formInitialValuesRef = useRef<any>(null);

  // 捕获初始表单值
  useEffect(() => {
    if (!formInitialValuesRef.current) {
      formInitialValuesRef.current = form.getFieldsValue(true);
    }
  }, [form]);

  // 处理页面加载完成
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 300);

    // 组件卸载时的清理函数
    return () => {
      clearTimeout(timer);
      // 强制清理所有消息提示，防止组件卸载后仍有状态更新
      clearRegisterMessages();
    };
  }, [clearRegisterMessages]);

  // 添加全局错误处理
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      event.preventDefault();
      console.log('已捕获错误，但不显示在UI上');
      return true;
    };

    window.addEventListener('error', handleGlobalError);

    // 确保组件挂载时清除所有可能存在的消息
    clearRegisterMessages();

    // 清理函数
    return () => {
      window.removeEventListener('error', handleGlobalError);
      // 组件卸载时清理消息和状态
      clearRegisterMessages();
    };
  }, [clearRegisterMessages]);

  // 提交注册
  const onFinish = async (values: any) => {
    // 防止重复提交
    if (submitLockRef.current || loading) {
      return;
    }

    submitLockRef.current = true;

    try {
      // 构造符合RegisterUserRequest类型的数据
      const registerData: RegisterUserRequest = {
        username: values.username,
        password: values.password,
        email: values.email,
        name: values.username,
      };

      // 提交注册请求，注意不要使用await，防止在组件卸载后仍有状态更新
      handleSubmit(registerData).catch(error => {
        console.log('注册过程中出现错误，但已被处理', error);
      });
    } catch (error) {
      console.log('注册过程中出现错误，但已被处理');
    } finally {
      // 确保无论如何都能解锁提交状态
      setTimeout(() => {
        submitLockRef.current = false;
      }, 500);
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
    <div className={`register-container ${pageLoaded ? 'loaded' : ''}`}>
      <Card
        className={`register-card ${loading ? 'loading' : ''}`}
        variant="borderless"
      >
        <div className="register-header">
          <img
            src="/logo.svg"
            alt="LowCodeX Logo"
            className="register-logo"
          />
          <Title level={3}>创建新账户</Title>
          <Text type="secondary">填写以下信息完成注册</Text>
        </div>

        <div className="register-form-container">
          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
            requiredMark={false}
            preserve={true}
            scrollToFirstError
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: '请输入用户名!' },
                { min: 3, message: '用户名至少3个字符' },
                { max: 20, message: '用户名最多20个字符' },
                { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' }
              ]}
            >
              <Input
                placeholder="请输入用户名"
                size="large"
                className="custom-input custom-input-user"
                prefix={<UserOutlined className="site-form-item-icon" />}
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱!' },
                { type: 'email', message: '请输入有效的邮箱地址!' }
              ]}
            >
              <Input
                placeholder="请输入邮箱"
                size="large"
                className="custom-input custom-input-mail"
                prefix={<MailOutlined className="site-form-item-icon" />}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码!' },
                { min: 8, message: '密码至少8个字符' },
                {
                  pattern: PASSWORD_PATTERN,
                  message: '密码必须包含大小写字母和数字'
                }
              ]}
              tooltip={{
                title: '密码必须至少8个字符，包含大小写字母和数字',
                icon: <InfoCircleOutlined />
              }}
            >
              <Input.Password
                placeholder="请输入密码"
                size="large"
                className="custom-input"
                prefix={<LockOutlined className="site-form-item-icon" />}
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            {/* <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认密码!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致!'));
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="请确认密码"
                size="large"
                className="custom-input"
                prefix={<LockOutlined className="site-form-item-icon" />}
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item> */}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="register-button"
                onClick={handleButtonClick}
                disabled={submitLockRef.current || loading}
              >
                注册
              </Button>
            </Form.Item>

            <div className="bottom-section">
              <Divider plain>
                <Text type="secondary">已有账号?</Text>
              </Divider>

              <div className="login-text">
                <Space align="center">
                  <Link to="/login">返回登录</Link>
                </Space>
              </div>
            </div>
          </Form>
        </div>
      </Card>
    </div>
  );
};

export default Register;
