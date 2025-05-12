import React, { useState } from 'react';
import { Layout, Menu, Dropdown, Avatar, Badge, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '@/hooks/features/auth/useAuth';
import logo from '/logo.svg';
import { menuItems } from './menu.js';
import type { MenuItem } from './menu.js';
import './style.scss';
import type { RootState } from '@/store';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { user } = useSelector((state: RootState) => state.auth);

  const toggle = () => {
    setCollapsed(!collapsed);
  };

  // 根据当前路径找到选中的菜单项
  const findSelectedKeys = () => {
    // 先检查完全匹配
    const exactMatch = menuItems.find((item: MenuItem) => item?.key === pathname);
    if (exactMatch) return [pathname];

    // 检查子菜单项完全匹配
    for (const item of menuItems) {
      if (item && 'children' in item && item.children) {
        const childMatch = item.children.find((child: MenuItem) => child?.key === pathname);
        if (childMatch) return [pathname];
    }
    }

    // 检查路径前缀匹配
    for (const item of menuItems) {
      if (item && typeof item?.key === 'string' && pathname.startsWith(item.key) && item.key !== '/') {
        return [item.key];
      }

      if (item && 'children' in item && item.children) {
        for (const child of item.children) {
          if (child && typeof child?.key === 'string' && pathname.startsWith(child.key) && child.key !== '/') {
            return [child.key];
          }
        }
      }
    }

    // 如果是根路径
    if (pathname === '/') return ['/'];

    return [];
  };

  const handleMenuClick = (e: { key: string }) => {
    if (e.key === 'logout') {
      logout();
    } else if (e.key === 'profile') {
      navigate('/profile');
    } else if (e.key === 'settings') {
      navigate('/settings');
    }
  };

  // 定义用户下拉菜单的items
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: (
        <div className="menu-item-content">
          <UserOutlined className="icon" />
          <span>个人中心</span>
        </div>
      )
    },
    {
      key: 'settings',
      label: (
        <div className="menu-item-content">
          <SettingOutlined className="icon" />
          <span>个人设置</span>
        </div>
      )
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      label: (
        <div className="menu-item-content">
          <LogoutOutlined className="icon" />
          <span>退出登录</span>
        </div>
      )
    }
  ];

  return (
    <Layout className="main-layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="sider"
        theme="dark"
        width={220}
      >
        <div className="logo">
          <img src={logo} alt="Logo" className="logo-img" />
          <h1>LowCodeX</h1>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={findSelectedKeys()}
          items={menuItems}
          onClick={({ key }) => navigate(key as string)}
        />
      </Sider>
      <Layout className="site-layout" style={{ marginLeft: collapsed ? 70 : 220 }}>
        <Header className="site-layout-header" style={{ width: `calc(100% - ${collapsed ? 70 : 220}px)` }}>
          <div className="left-content">
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: toggle,
            })}
          </div>
          <div className="right-content">
            <Tooltip title="帮助中心">
              <div className="action-item">
                <QuestionCircleOutlined />
              </div>
            </Tooltip>
            <Tooltip title="消息通知">
              <div className="action-item">
                <Badge count={5} size="small">
                  <BellOutlined />
                </Badge>
              </div>
            </Tooltip>
            <Dropdown menu={{ items: userMenuItems, onClick: handleMenuClick }} trigger={['click']} placement="bottomRight">
              <div className="user-action">
                <Avatar size="small" className="avatar" icon={<UserOutlined />} src={user?.avatar} />
                <div className="info">
                  <span className="name">{user?.username || '用户'}</span>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="site-layout-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
