import React from 'react';
import { Form, Input, Button, Card, Typography, Steps, Result } from 'antd';
import { MailOutlined, KeyOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useForgetPassword } from './hooks/useForgetPassword';

const { Title } = Typography;
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
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="请输入您的注册邮箱"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: '100%' }}
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
        >
          <div style={{ marginBottom: 24 }}>
            我们已向 {email} 发送了重置密码邮件，请查收并输入邮件中的验证码。
          </div>

          <Form.Item
            name="token"
            rules={[{ required: true, message: '请输入验证码' }]}
          >
            <Input
              placeholder="请输入邮件中的验证码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ width: '100%' }}
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
        >
          <Form.Item
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
              { validator: validatePasswordStrength }
            ]}
          >
            <Input.Password
              prefix={<KeyOutlined />}
              placeholder="新密码"
              size="large"
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
              prefix={<KeyOutlined />}
              placeholder="确认新密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: '100%' }}
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
              <Button type="primary" size="large">
                返回登录
              </Button>
            </Link>
          }
        />
      )
    }
  ];

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f0f2f5',
      padding: 20
    }}>
      <Card
        style={{ width: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        bordered={false}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img
            src="/logo.png"
            alt="LowCodeX Logo"
            style={{ height: 64, marginBottom: 16 }}
          />
          <Title level={3}>找回密码</Title>
        </div>

        <Steps
          current={currentStep}
          style={{ marginBottom: 32 }}
        >
          {steps.map(item => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>

        <div>{steps[currentStep].content}</div>

        {currentStep < 3 && (
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Link to="/login">返回登录</Link>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ForgetPassword;
