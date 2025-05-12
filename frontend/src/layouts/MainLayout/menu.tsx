import React from 'react';
import {
  DashboardOutlined,
  FormOutlined,
  AppstoreOutlined,
  ApiOutlined,
  UserOutlined,
  SettingOutlined,
  TeamOutlined,
  ClusterOutlined,
  DeploymentUnitOutlined,
  SafetyCertificateOutlined,
  ApartmentOutlined,
  DatabaseOutlined,
  FundProjectionScreenOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

// 导出菜单项类型，以便其他文件可以导入
export type MenuItem = Required<MenuProps>['items'][number];

export const menuItems: MenuItem[] = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: '仪表盘'
  },
  {
    key: '/models',
    icon: <DatabaseOutlined />,
    label: '数据模型'
  },
  {
    key: '/forms',
    icon: <FormOutlined />,
    label: '表单设计'
  },
  {
    key: '/workflows',
    icon: <DeploymentUnitOutlined />,
    label: '工作流'
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
        icon: <UserOutlined />,
        label: '用户管理'
      },
      {
        key: '/system/roles',
        icon: <SafetyCertificateOutlined />,
        label: '角色权限'
      },
      {
        key: '/system/tenants',
        icon: <ApartmentOutlined />,
        label: '租户管理'
      },
      {
        key: '/system/logs',
        icon: <FundProjectionScreenOutlined />,
        label: '系统日志'
      }
    ]
  }
];
