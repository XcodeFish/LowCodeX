import React, { useState } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar } from 'antd';
import type { MenuProps } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  DashboardOutlined,
  FormOutlined,
  AppstoreOutlined,
  SettingOutlined,
  ApiOutlined,
  LogoutOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import type { AppDispatch, RootState } from '../../store';
import './style.scss';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      dispatch(logout());
      navigate('/login');
    } else {
      navigate(key);
    }
  };

  // 菜单项配置
  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '控制台'
    },
    {
      key: '/models',
      icon: <ApiOutlined />,
      label: '数据模型管理'
    },
    {
      key: '/forms',
      icon: <FormOutlined />,
      label: '表单设计器'
    },
    {
      key: '/workflows',
      icon: <AppstoreOutlined />,
      label: '工作流设计器'
    },
    {
      key: '/applications',
      icon: <AppstoreOutlined />,
      label: '应用管理'
    },
    {
      key: 'system',
      icon: <SettingOutlined />,
      label: '系统管理',
      children: [
        {
          key: '/system/users',
          icon: <TeamOutlined />,
          label: '用户管理'
        },
        {
          key: '/system/roles',
          icon: <TeamOutlined />,
          label: '角色管理'
        },
        {
          key: '/system/tenants',
          icon: <TeamOutlined />,
          label: '租户管理'
        }
      ]
    }
  ];

  // 用户下拉菜单
  const userMenu = (
    <Menu onClick={handleUserMenuClick}>
      <Menu.Item key="/profile" icon={<UserOutlined />}>
        个人资料
      </Menu.Item>
      <Menu.Item key="/profile/change-password" icon={<SettingOutlined />}>
        修改密码
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout className="main-layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={256}
        theme="dark"
        className="main-layout-sider"
      >
        <div className="logo">
          <h1>{collapsed ? 'LCX' : 'LowCodeX'}</h1>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['/']}
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header className="main-layout-header" style={{ background: '#fff' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapsed}
            className="trigger-button"
          />
          <div className="header-right">
            <Dropdown overlay={userMenu} placement="bottomRight">
              <div className="user-info">
                <Avatar icon={<UserOutlined />} />
                <span className="username">{user?.username || '用户'}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="main-layout-content" style={{ background: '#fff' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
