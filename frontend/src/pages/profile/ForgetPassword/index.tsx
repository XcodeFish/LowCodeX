import React from 'react';
import { Form, Input, Button, Card, Typography, Steps, Result } from 'antd';
import {  EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useForgetPassword } from './hooks/useForgetPassword';
import './index.scss';

const { Title, Text } = Typography;
const { Step } = Steps;

export const ForgetPassword: React.FC = () => {
  const {
    form,
    currentStep,
    email,
    loading,
    handleSendResetEmail,
    handleVerifyToken,
    handleResetPassword,
    validateConfirmPassword,
    validatePasswordStrength
  } = useForgetPassword();

  // 步骤内容
  const steps = [
    {
      title: '填写邮箱',
      content: (
        <Form
          form={form}
          layout="vertical"
          name="forgetPassword"
          onFinish={handleSendResetEmail}
          requiredMark={false}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input
              placeholder="请输入您的注册邮箱"
              size="large"
              className="custom-input"
              autoComplete="off"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="form-button"
              size="large"
            >
              发送重置密码邮件
            </Button>
          </Form.Item>
        </Form>
      )
    },
    {
      title: '验证',
      content: (
        <Form
          form={form}
          layout="vertical"
          name="verifyToken"
          onFinish={handleVerifyToken}
          requiredMark={false}
        >
          <div className="email-notice">
            <Text>我们已向 {email} 发送了重置密码邮件，请查收并输入邮件中的验证码。</Text>
          </div>

          <Form.Item
            name="token"
            rules={[{ required: true, message: '请输入验证码' }]}
          >
            <Input
              placeholder="请输入邮件中的验证码"
              size="large"
              className="custom-input"
              autoComplete="off"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="form-button"
              size="large"
            >
              验证
            </Button>
          </Form.Item>
        </Form>
      )
    },
    {
      title: '设置新密码',
      content: (
        <Form
          form={form}
          layout="vertical"
          name="resetPassword"
          onFinish={handleResetPassword}
          requiredMark={false}
        >
          <Form.Item
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
              { validator: validatePasswordStrength }
            ]}
          >
            <Input.Password
              placeholder="新密码"
              size="large"
              className="custom-input"
              autoComplete="off"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              { validator: validateConfirmPassword }
            ]}
          >
            <Input.Password
              placeholder="确认新密码"
              size="large"
              className="custom-input"
              autoComplete="off"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="form-button"
              size="large"
            >
              重置密码
            </Button>
          </Form.Item>
        </Form>
      )
    },
    {
      title: '完成',
      content: (
        <Result
          status="success"
          title="密码重置成功!"
          subTitle="您已成功重置密码，现在可以使用新密码登录系统。"
          extra={
            <Link to="/login">
              <Button type="primary" size="large" className="form-button">
                返回登录
              </Button>
            </Link>
          }
        />
      )
    }
  ];

  return (
    <div className="forget-password-container">
      <Card className="forget-password-card" bordered={false}>
        <div className="forget-password-header">
          <img
            src="/logo.svg"
            alt="LowCodeX Logo"
            className="logo"
          />
          <Title level={3}>找回密码</Title>
        </div>

        <div className="step-indicator">
          <div className="step-labels">
            {steps.map((item, index) => (
              <div
                key={index}
                className={`step-label ${currentStep === index ? 'active' : ''} ${currentStep > index ? 'completed' : ''}`}
              >
                <div className="step-number">{index + 1}</div>
                <div className="step-title">{item.title}</div>
              </div>
            ))}
          </div>
          <div className="step-progress">
            <div className="step-progress-inner" style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}></div>
          </div>
        </div>

        <div className="step-content">{steps[currentStep].content}</div>

        {currentStep < 3 && (
          <div className="back-to-login">
            <Link to="/login">返回登录</Link>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ForgetPassword;
