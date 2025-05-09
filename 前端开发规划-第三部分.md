# LowCodeX 前端开发规划文档 (第三部分)

## 6. 应用管理模块

### 6.1 功能点详细拆解

1. **应用列表页面**
   - 应用创建、编辑、删除
   - 应用发布与下线
   - 应用分类与筛选
   - 应用分享与复制

2. **应用配置管理**
   - 基础信息配置
   - 应用图标与主题设置
   - 权限配置
   - 域名与访问设置

3. **应用内资源管理**
   - 数据模型管理
   - 表单管理
   - 流程管理
   - 页面管理
   - API管理

4. **应用版本管理**
   - 版本创建与发布
   - 版本回滚
   - 历史版本比较
   - 变更日志生成

5. **应用数据管理**
   - 数据导入导出
   - 数据备份与恢复
   - 数据清理与归档

### 6.2 开发任务与时间安排

| 任务 | 描述 | 时间估计 | 优先级 |
|-----|------|---------|-------|
| 设计应用管理架构 | 确定应用的结构和管理方式 | 3天 | P0 |
| 实现应用列表页面 | 开发应用的创建、查看、删除功能 | 4天 | P0 |
| 开发应用配置页面 | 实现应用基础设置功能 | 5天 | P0 |
| 添加应用资源管理 | 关联各类资源的管理功能 | 7天 | P1 |
| 实现应用版本管理 | 版本控制和发布流程 | 6天 | P1 |
| 开发应用数据管理 | 数据导入导出和维护功能 | 5天 | P2 |
| 实现应用监控面板 | 应用使用情况统计与监控 | 4天 | P2 |
| 添加应用部署功能 | 支持应用打包和部署 | 6天 | P2 |
| 单元测试 | 测试应用管理核心功能 | 3天 | P1 |

### 6.3 核心组件与类型定义

**应用类型定义 (types/application.ts)**

```typescript
export enum AppStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  OFFLINE = 'offline',
  DEPRECATED = 'deprecated'
}

export enum AppType {
  FORM = 'form',
  WORKFLOW = 'workflow',
  DASHBOARD = 'dashboard',
  COMPOSITE = 'composite'
}

export interface Application {
  id: number;
  name: string;
  displayName: string;
  description: string;
  logo?: string;
  type: AppType;
  status: AppStatus;
  version: string;
  primaryColor?: string;
  secondaryColor?: string;
  isTemplate: boolean;
  createFrom?: number; // 从哪个应用复制而来
  settings: AppSettings;
  tenantId: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface AppSettings {
  domain?: string;
  allowedDomains?: string[];
  authentication: {
    required: boolean;
    allowedRoles?: number[];
    publicPages?: string[];
  };
  layout: {
    theme: 'light' | 'dark' | 'custom';
    navigation: 'top' | 'side' | 'mix';
    showFooter: boolean;
    fixedHeader: boolean;
  };
  features: {
    enableSearch: boolean;
    enableNotification: boolean;
    enableHelp: boolean;
    enableFeedback: boolean;
  };
}

export interface AppResource {
  id: number;
  type: 'model' | 'form' | 'workflow' | 'page' | 'api';
  resourceId: number;
  name: string;
  applicationId: number;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppVersion {
  id: number;
  applicationId: number;
  version: string;
  description: string;
  changes: string; // JSON格式的变更记录
  createdBy: number;
  createdAt: string;
  publishedAt?: string;
  status: 'draft' | 'published' | 'deprecated';
}
```

**应用列表组件 (components/application/ApplicationList.tsx)**

```tsx
import React, { useEffect } from 'react';
import { Card, Row, Col, Button, Dropdown, Menu, Tag, message } from 'antd';
import {
  PlusOutlined,
  EllipsisOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  VerticalAlignTopOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '@/store';
import { fetchApplications, deleteApplication, publishApplication, copyApplication } from '@/store/slices/applicationSlice';
import { AppStatus, AppType, Application } from '@/types/application';
import { AuthButton } from '@/components/common/AuthButton';

export const ApplicationList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { applications, loading } = useSelector((state: RootState) => state.application);

  useEffect(() => {
    dispatch(fetchApplications());
  }, [dispatch]);

  const handleEdit = (id: number) => {
    navigate(`/applications/${id}`);
  };

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteApplication(id)).unwrap();
      message.success('应用已删除');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await dispatch(publishApplication(id)).unwrap();
      message.success('应用已发布');
    } catch (error) {
      message.error('发布失败');
    }
  };

  const handleCopy = async (id: number, name: string) => {
    try {
      await dispatch(copyApplication({ id, newName: `${name} 副本` })).unwrap();
      message.success('应用已复制');
    } catch (error) {
      message.error('复制失败');
    }
  };

  const getStatusTag = (status: AppStatus) => {
    const statusMap = {
      [AppStatus.DRAFT]: <Tag color="orange">草稿</Tag>,
      [AppStatus.PUBLISHED]: <Tag color="green">已发布</Tag>,
      [AppStatus.OFFLINE]: <Tag color="red">已下线</Tag>,
      [AppStatus.DEPRECATED]: <Tag color="gray">已弃用</Tag>,
    };
    return statusMap[status];
  };

  const getAppTypeIcon = (type: AppType) => {
    // 返回不同应用类型的图标
    return null; // 简化示例
  };

  return (
    <div className="app-list-container">
      <div className="app-list-header" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>我的应用</h2>
        <AuthButton
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/applications/create')}
          requiredPermissions={['application:create']}
        >
          创建应用
        </AuthButton>
      </div>

      <Row gutter={[16, 16]}>
        {applications.map(app => (
          <Col xs={24} sm={12} md={8} lg={6} key={app.id}>
            <Card
              hoverable
              cover={app.logo ? <img alt={app.name} src={app.logo} /> : null}
              onClick={() => handleEdit(app.id)}
              actions={[
                <EditOutlined key="edit" title="编辑" />,
                <Dropdown key="more" overlay={
                  <Menu>
                    {app.status !== AppStatus.PUBLISHED && (
                      <Menu.Item key="publish" onClick={(e) => {
                        e.domEvent.stopPropagation();
                        handlePublish(app.id);
                      }}>
                        <VerticalAlignTopOutlined /> 发布
                      </Menu.Item>
                    )}
                    <Menu.Item key="copy" onClick={(e) => {
                      e.domEvent.stopPropagation();
                      handleCopy(app.id, app.name);
                    }}>
                      <CopyOutlined /> 复制
                    </Menu.Item>
                    <Menu.Item key="export" onClick={(e) => {
                      e.domEvent.stopPropagation();
                      // 导出应用功能
                    }}>
                      <DownloadOutlined /> 导出
                    </Menu.Item>
                    <Menu.Item key="delete" danger onClick={(e) => {
                      e.domEvent.stopPropagation();
                      handleDelete(app.id);
                    }}>
                      <DeleteOutlined /> 删除
                    </Menu.Item>
                  </Menu>
                } trigger={['click']}>
                  <Button type="text" icon={<EllipsisOutlined />} onClick={e => e.stopPropagation()} />
                </Dropdown>
              ]}
            >
              <Card.Meta
                title={app.displayName}
                description={
                  <div>
                    <div>{app.description}</div>
                    <div style={{ marginTop: 8 }}>
                      {getStatusTag(app.status)}
                      <span style={{ marginLeft: 8 }}>v{app.version}</span>
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};
```

**应用详情组件 (components/application/ApplicationDetail.tsx)**

```tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, Button, Form, Input, Select, Switch, message, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchApplicationById, updateApplication } from '@/store/slices/applicationSlice';
import { AppSettings, AppType } from '@/types/application';
import { ResourceList } from './ResourceList';
import { VersionManagement } from './VersionManagement';
import { DataManagement } from './DataManagement';

const { TabPane } = Tabs;
const { Option } = Select;

export const ApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentApplication, loading } = useSelector((state: RootState) => state.application);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (id) {
      dispatch(fetchApplicationById(Number(id)));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentApplication) {
      form.setFieldsValue({
        name: currentApplication.name,
        displayName: currentApplication.displayName,
        description: currentApplication.description,
        type: currentApplication.type,
        primaryColor: currentApplication.primaryColor,
        secondaryColor: currentApplication.secondaryColor,
        ...currentApplication.settings
      });
    }
  }, [currentApplication, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (!currentApplication) return;

      const { name, displayName, description, type, primaryColor, secondaryColor, ...settings } = values;

      const updatedApp = {
        ...currentApplication,
        name,
        displayName,
        description,
        type,
        primaryColor,
        secondaryColor,
        settings: settings as AppSettings
      };

      await dispatch(updateApplication(updatedApp)).unwrap();
      message.success('应用信息已保存');
    } catch (error) {
      message.error('保存失败');
    }
  };

  if (loading && !currentApplication) {
    return <Spin size="large" />;
  }

  return (
    <div className="app-detail-container">
      <div className="app-detail-header" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>{currentApplication?.displayName || '新建应用'}</h2>
        <Button type="primary" onClick={handleSave}>保存</Button>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="基本信息" key="basic">
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              type: AppType.FORM,
              authentication: { required: false },
              layout: { theme: 'light', navigation: 'side', showFooter: true, fixedHeader: true },
              features: { enableSearch: true, enableNotification: true, enableHelp: true, enableFeedback: false }
            }}
          >
            <Form.Item
              name="displayName"
              label="应用名称"
              rules={[{ required: true, message: '请输入应用名称' }]}
            >
              <Input placeholder="请输入应用名称" />
            </Form.Item>

            <Form.Item
              name="name"
              label="技术名称"
              rules={[
                { required: true, message: '请输入技术名称' },
                { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '技术名称只能包含字母、数字和下划线，且必须以字母开头' }
              ]}
            >
              <Input placeholder="请输入技术名称" />
            </Form.Item>

            <Form.Item name="description" label="应用描述">
              <Input.TextArea placeholder="请输入应用描述" rows={4} />
            </Form.Item>

            <Form.Item name="type" label="应用类型" rules={[{ required: true, message: '请选择应用类型' }]}>
              <Select>
                <Option value={AppType.FORM}>表单应用</Option>
                <Option value={AppType.WORKFLOW}>流程应用</Option>
                <Option value={AppType.DASHBOARD}>仪表盘</Option>
                <Option value={AppType.COMPOSITE}>复合应用</Option>
              </Select>
            </Form.Item>

            {/* 其他基本设置表单项 */}
          </Form>
        </TabPane>

        <TabPane tab="资源管理" key="resources">
          <ResourceList applicationId={Number(id)} />
        </TabPane>

        <TabPane tab="版本管理" key="versions">
          <VersionManagement applicationId={Number(id)} />
        </TabPane>

        <TabPane tab="数据管理" key="data">
          <DataManagement applicationId={Number(id)} />
        </TabPane>
      </Tabs>
    </div>
  );
};
```

### 6.4 Cursor提示词

```
创建应用管理模块，实现应用的管理与配置功能。

1. 创建Application相关Redux Slice，实现应用的CRUD操作
2. 开发ApplicationList组件，以卡片方式展示应用列表
3. 实现ApplicationDetail组件，用于编辑应用基本信息
4. 创建ResourceList组件，管理应用内部的资源列表
5. 实现VersionManagement组件，提供版本管理功能
6. 添加DataManagement组件，用于管理应用数据
7. 开发AppSettingsForm组件，配置应用的主题和行为
8. 实现AppPublishModal组件，提供应用发布流程
9. 创建AppPackage组件，用于导出和分享应用
10. 实现AppMonitorDashboard组件，显示应用使用统计
```
