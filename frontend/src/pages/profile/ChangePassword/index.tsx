import React from 'react';
import { Card, Form, Input, Button, Typography, Space } from 'antd';
import { LockOutlined, KeyOutlined } from '@ant-design/icons';
import { useChangePassword } from './hooks/useChangePassword';

const { Title } = Typography;

export const ChangePassword: React.FC = () => {
  const {
    form,
    loading,
    handleSubmit,
    validateConfirmPassword,
    validatePasswordStrength,
    onBack
  } = useChangePassword();

  return (
    <div style={{ padding: 24, maxWidth: 500, margin: '0 auto' }}>
      <Title level={2}>修改密码</Title>

      <Card bordered={false}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="oldPassword"
            label="当前密码"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="当前密码"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { validator: validatePasswordStrength }
            ]}
          >
            <Input.Password
              prefix={<KeyOutlined />}
              placeholder="新密码"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认新密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              { validator: validateConfirmPassword }
            ]}
          >
            <Input.Password
              prefix={<KeyOutlined />}
              placeholder="确认新密码"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
              >
                确认修改
              </Button>

              <Button onClick={onBack}>
                返回
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ChangePassword;
