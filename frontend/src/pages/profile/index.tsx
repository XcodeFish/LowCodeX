import React from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Tabs,
  Descriptions,
  Typography,
  Space
} from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useProfileForm } from './hooks/useProfileForm';
import dayjs from 'dayjs';
import './index.scss';

const { Title } = Typography;
const { TabPane } = Tabs;

export const Profile: React.FC = () => {
  const { form, user, loading, handleSubmit } = useProfileForm();

  if (!user) {
    return null;
  }

  return (
    <div className="profile-container">
      <Title level={2}>个人资料</Title>

      <Tabs defaultActiveKey="info">
        <TabPane tab="基本资料" key="info">
          <Card variant="borderless">
            <div className="profile-flex-row">
              <div className="profile-avatar-section">
                <Avatar
                  size={120}
                  src={user.avatar}
                  icon={<UserOutlined />}
                  className="profile-avatar"
                />
              </div>

              <div className="profile-form-container">
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={(values) => handleSubmit(user.id, values)}
                  initialValues={{
                    username: user.username,
                    email: user.email
                  }}
                >
                  <Form.Item
                    name="username"
                    label="用户名"
                    rules={[
                      { required: true, message: '请输入用户名' },
                      { min: 3, message: '用户名至少3个字符' }
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="用户名"
                    />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    label="邮箱"
                    rules={[
                      { required: true, message: '请输入邮箱' },
                      { type: 'email', message: '请输入有效的邮箱地址' }
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      placeholder="邮箱"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Space>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                      >
                        保存修改
                      </Button>

                      <Link to="/profile/change-password">
                        <Button
                          icon={<LockOutlined />}
                        >
                          修改密码
                        </Button>
                      </Link>
                    </Space>
                  </Form.Item>
                </Form>
              </div>
            </div>
          </Card>
        </TabPane>

        <TabPane tab="账号信息" key="account">
          <Card variant="borderless">
            <Descriptions
              title="账号详情"
              bordered
              column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}
            >
              <Descriptions.Item label="用户ID">{user.id}</Descriptions.Item>
              <Descriptions.Item label="账号状态">
                {user.status === 'active' ? '正常' : user.status === 'locked' ? '已锁定' : '未激活'}
              </Descriptions.Item>
              <Descriptions.Item label="租户ID">{user.tenantId}</Descriptions.Item>
              <Descriptions.Item label="角色">
                {user.roles.map((role: any) => role.name).join(', ')}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {dayjs(user.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="最后更新时间">
                {dayjs(user.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Profile;
