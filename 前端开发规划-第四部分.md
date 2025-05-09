# LowCodeX 前端开发规划文档 (第四部分)

## 7. 多租户管理模块

### 7.1 功能点详细拆解

1. **租户管理**
   - 租户创建、编辑、删除
   - 租户状态管理
   - 租户资源配额设置
   - 租户账单管理

2. **租户配置**
   - 租户基本信息设置
   - 租户自定义域名
   - 租户主题设置
   - 租户通知配置

3. **租户用户与角色**
   - 租户用户管理
   - 租户角色管理
   - 批量用户导入
   - 组织架构管理

4. **租户资源隔离**
   - 资源使用统计
   - 资源配额监控
   - 访问控制设置
   - 数据隔离策略配置

### 7.2 开发任务与时间安排

| 任务 | 描述 | 时间估计 | 优先级 |
|-----|------|---------|-------|
| 设计租户管理架构 | 确定租户结构和管理流程 | 3天 | P0 |
| 实现租户列表页面 | 创建、查看、删除租户 | 4天 | P0 |
| 开发租户配置页面 | 租户基础信息设置 | 4天 | P0 |
| 实现租户用户管理 | 用户邀请、删除等操作 | 5天 | P0 |
| 添加租户角色管理 | 角色定义和权限分配 | 5天 | P1 |
| 开发资源配额设置 | 限制资源使用量 | 4天 | P1 |
| 实现组织架构管理 | 部门和层级结构管理 | 6天 | P2 |
| 添加租户监控面板 | 资源使用统计与监控 | 4天 | P2 |
| 单元测试 | 测试租户管理功能 | 3天 | P1 |

### 7.3 核心组件与类型定义

**租户类型定义 (types/tenant.ts)**

```typescript
export enum TenantStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired',
  PENDING = 'pending'
}

export enum TenantTier {
  FREE = 'free',
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise'
}

export interface Tenant {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  logo?: string;
  domain?: string;
  status: TenantStatus;
  tier: TenantTier;
  settings: TenantSettings;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface TenantSettings {
  customization: {
    primaryColor?: string;
    logo?: string;
    favicon?: string;
    companyName?: string;
  };
  security: {
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      expiryDays?: number;
    };
    mfaEnabled: boolean;
    ipWhitelist?: string[];
  };
  quotas: {
    maxUsers: number;
    maxApplications: number;
    maxStorage: number; // MB
    maxApiCalls: number; // 每日
  };
  features: {
    enableWorkflow: boolean;
    enableDataModel: boolean;
    enableApi: boolean;
    enableCustomDomain: boolean;
  };
}

export interface TenantUser {
  id: number;
  userId: number;
  tenantId: number;
  username: string;
  email: string;
  status: 'active' | 'inactive' | 'invited';
  roles: number[]; // 角色ID列表
  department?: string;
  position?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: number;
  tenantId: number;
  name: string;
  code: string;
  parentId?: number;
  path: string; // 例如 /1/4/10
  level: number; // 层级深度
  managerUserId?: number;
  createdAt: string;
  updatedAt: string;
}
```

**租户列表组件 (components/tenant/TenantList.tsx)**

```tsx
import React, { useEffect } from 'react';
import { Table, Button, Tag, Space, Dropdown, Menu, message } from 'antd';
import {
  PlusOutlined,
  EllipsisOutlined,
  EditOutlined,
  StopOutlined,
  CheckCircleOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '@/store';
import { fetchTenants, deleteTenant, updateTenantStatus } from '@/store/slices/tenantSlice';
import { Tenant, TenantStatus, TenantTier } from '@/types/tenant';
import { AuthButton } from '@/components/common/AuthButton';

export const TenantList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { tenants, loading } = useSelector((state: RootState) => state.tenant);

  useEffect(() => {
    dispatch(fetchTenants());
  }, [dispatch]);

  const handleEdit = (id: number) => {
    navigate(`/tenants/${id}`);
  };

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteTenant(id)).unwrap();
      message.success('租户已删除');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleStatusChange = async (id: number, status: TenantStatus) => {
    try {
      await dispatch(updateTenantStatus({ id, status })).unwrap();
      message.success('租户状态已更新');
    } catch (error) {
      message.error('更新失败');
    }
  };

  const getStatusTag = (status: TenantStatus) => {
    const statusMap = {
      [TenantStatus.ACTIVE]: <Tag color="green">活跃</Tag>,
      [TenantStatus.SUSPENDED]: <Tag color="red">已暂停</Tag>,
      [TenantStatus.EXPIRED]: <Tag color="orange">已过期</Tag>,
      [TenantStatus.PENDING]: <Tag color="blue">待激活</Tag>,
    };
    return statusMap[status];
  };

  const getTierTag = (tier: TenantTier) => {
    const tierMap = {
      [TenantTier.FREE]: <Tag>免费版</Tag>,
      [TenantTier.BASIC]: <Tag color="blue">基础版</Tag>,
      [TenantTier.STANDARD]: <Tag color="purple">标准版</Tag>,
      [TenantTier.PREMIUM]: <Tag color="gold">高级版</Tag>,
      [TenantTier.ENTERPRISE]: <Tag color="volcano">企业版</Tag>,
    };
    return tierMap[tier];
  };

  const columns = [
    {
      title: '租户名称',
      dataIndex: 'displayName',
      key: 'displayName',
    },
    {
      title: '标识',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: TenantStatus) => getStatusTag(status),
    },
    {
      title: '套餐',
      dataIndex: 'tier',
      key: 'tier',
      render: (tier: TenantTier) => getTierTag(tier),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: Tenant) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.id)}
          >
            编辑
          </Button>
          <Dropdown overlay={
            <Menu>
              {record.status !== TenantStatus.ACTIVE && (
                <Menu.Item key="activate" onClick={() => handleStatusChange(record.id, TenantStatus.ACTIVE)}>
                  <CheckCircleOutlined /> 激活
                </Menu.Item>
              )}
              {record.status !== TenantStatus.SUSPENDED && (
                <Menu.Item key="suspend" onClick={() => handleStatusChange(record.id, TenantStatus.SUSPENDED)}>
                  <StopOutlined /> 暂停
                </Menu.Item>
              )}
              <Menu.Item key="delete" danger onClick={() => handleDelete(record.id)}>
                <DeleteOutlined /> 删除
              </Menu.Item>
            </Menu>
          } trigger={['click']}>
            <Button icon={<EllipsisOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div className="tenant-list-container">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>租户管理</h2>
        <AuthButton
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/tenants/create')}
          requiredPermissions={['tenant:create']}
        >
          创建租户
        </AuthButton>
      </div>

      <Table
        columns={columns}
        dataSource={tenants}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};
```

### 7.4 Cursor提示词

```
创建多租户管理模块，实现多租户的管理和配置功能。

1. 创建Tenant相关Redux Slice，实现租户的CRUD操作
2. 开发TenantList组件，展示所有租户列表
3. 实现TenantDetail组件，用于编辑租户信息
4. 创建TenantUserList组件，管理租户内的用户
5. 实现TenantRoleManagement组件，配置租户角色权限
6. 添加TenantQuotaSetting组件，设置资源使用限制
7. 开发OrganizationChart组件，展示和管理组织架构
8. 实现TenantDashboard组件，显示租户使用统计
9. 创建TenantBilling组件，管理租户账单和订阅
10. 添加TenantDomainSetting组件，配置自定义域名
```

## 8. 系统管理模块

### 8.1 功能点详细拆解

1. **系统配置**
   - 全局参数设置
   - 主题与品牌设置
   - 默认权限配置
   - 系统通知配置

2. **用户与权限管理**
   - 系统用户管理
   - 系统角色管理
   - 权限策略设置
   - 用户审计日志

3. **系统监控**
   - 性能监控面板
   - 错误日志查看
   - 资源使用统计
   - 系统健康状态

4. **系统备份与恢复**
   - 系统备份管理
   - 备份策略设置
   - 系统还原操作
   - 导出与导入配置

5. **系统集成**
   - 外部系统集成
   - 单点登录配置
   - API密钥管理
   - Webhook配置

### 8.2 开发任务与时间安排

| 任务 | 描述 | 时间估计 | 优先级 |
|-----|------|---------|-------|
| 设计系统管理架构 | 确定系统管理模块结构 | 3天 | P0 |
| 实现系统配置页面 | 开发全局参数设置功能 | 5天 | P0 |
| 开发用户管理界面 | 系统用户的增删改查 | 4天 | P0 |
| 实现角色权限管理 | 角色定义和权限分配 | 5天 | P0 |
| 添加系统监控面板 | 性能和资源使用监控 | 6天 | P1 |
| 开发日志查看功能 | 错误日志和审计日志查看 | 4天 | P1 |
| 实现系统备份功能 | 备份创建和恢复操作 | 5天 | P2 |
| 添加系统集成配置 | 外部系统集成设置 | 6天 | P2 |
| 单元测试 | 测试系统管理功能 | 3天 | P1 |

### 8.3 核心组件与类型定义

**系统配置类型定义 (types/system.ts)**

```typescript
export interface SystemConfig {
  id: number;
  category: 'general' | 'security' | 'email' | 'storage' | 'integration';
  key: string;
  value: string;
  description: string;
  isEncrypted: boolean;
  updatedBy: number;
  updatedAt: string;
}

export interface SystemTheme {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  faviconUrl: string;
  loginBackgroundUrl?: string;
  companyName: string;
  footerText?: string;
  dashboardWelcomeText?: string;
}

export interface SystemSecurity {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expiryDays?: number;
    preventReuseCount?: number;
  };
  loginAttempts: {
    maxFailedAttempts: number;
    lockoutDuration: number; // 分钟
    resetCounterAfter: number; // 分钟
  };
  session: {
    idleTimeout: number; // 分钟
    absoluteTimeout: number; // 分钟
  };
  mfa: {
    required: 'none' | 'admin-only' | 'all-users';
    methods: ('sms' | 'email' | 'authenticator')[];
  };
}

export interface SystemMetric {
  id: number;
  category: 'performance' | 'usage' | 'error';
  name: string;
  value: number;
  unit: string;
  timestamp: string;
}

export interface SystemBackup {
  id: number;
  name: string;
  size: number; // KB
  type: 'full' | 'configuration' | 'data';
  status: 'creating' | 'ready' | 'failed' | 'restoring';
  createdBy: number;
  createdAt: string;
  downloadUrl?: string;
  notes?: string;
}
```

**系统配置组件 (components/system/SystemSettings.tsx)**

```tsx
import React, { useEffect, useState } from 'react';
import { Tabs, Form, Input, Switch, InputNumber, Button, Select, message, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchSystemConfig, updateSystemConfig } from '@/store/slices/systemSlice';
import { ColorPicker } from './ColorPicker';
import { UploadImage } from './UploadImage';

const { TabPane } = Tabs;
const { Option } = Select;

export const SystemSettings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { configs, loading } = useSelector((state: RootState) => state.system);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    dispatch(fetchSystemConfig());
  }, [dispatch]);

  useEffect(() => {
    if (configs) {
      // 将配置转换为表单值
      const formValues = configs.reduce((acc, config) => {
        acc[config.key] = config.value;
        return acc;
      }, {} as Record<string, string>);

      form.setFieldsValue(formValues);
    }
  }, [configs, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // 将表单值转换为配置数组
      const updatedConfigs = Object.entries(values).map(([key, value]) => {
        const existingConfig = configs.find(c => c.key === key);
        return {
          ...(existingConfig || { id: 0, category: 'general', description: '', isEncrypted: false }),
          key,
          value: String(value)
        };
      });

      await dispatch(updateSystemConfig(updatedConfigs)).unwrap();
      message.success('系统配置已保存');
    } catch (error) {
      message.error('保存失败');
    }
  };

  if (loading && !configs.length) {
    return <Spin size="large" />;
  }

  return (
    <div className="system-settings-container">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>系统设置</h2>
        <Button type="primary" onClick={handleSave}>保存配置</Button>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="通用设置" key="general">
          <Form form={form} layout="vertical">
            <Form.Item name="system.name" label="系统名称" rules={[{ required: true }]}>
              <Input placeholder="请输入系统名称" />
            </Form.Item>

            <Form.Item name="system.url" label="系统URL" rules={[{ required: true, type: 'url' }]}>
              <Input placeholder="请输入系统访问地址" />
            </Form.Item>

            <Form.Item name="system.admin_email" label="管理员邮箱" rules={[{ required: true, type: 'email' }]}>
              <Input placeholder="请输入管理员联系邮箱" />
            </Form.Item>

            <Form.Item name="system.default_language" label="默认语言">
              <Select placeholder="请选择默认语言">
                <Option value="zh-CN">简体中文</Option>
                <Option value="en-US">English (US)</Option>
              </Select>
            </Form.Item>

            <Form.Item name="system.timezone" label="系统时区">
              <Select placeholder="请选择系统时区">
                <Option value="Asia/Shanghai">中国标准时间 (UTC+8)</Option>
                <Option value="UTC">协调世界时 (UTC)</Option>
                <Option value="America/New_York">美国东部时间</Option>
              </Select>
            </Form.Item>
          </Form>
        </TabPane>

        <TabPane tab="主题设置" key="theme">
          <Form form={form} layout="vertical">
            <Form.Item name="theme.primary_color" label="主题色">
              <ColorPicker />
            </Form.Item>

            <Form.Item name="theme.logo_url" label="系统Logo">
              <UploadImage />
            </Form.Item>

            <Form.Item name="theme.favicon_url" label="网站图标">
              <UploadImage />
            </Form.Item>

            <Form.Item name="theme.company_name" label="公司名称">
              <Input placeholder="请输入公司名称" />
            </Form.Item>

            <Form.Item name="theme.footer_text" label="页脚文本">
              <Input.TextArea placeholder="请输入页脚文本" rows={2} />
            </Form.Item>
          </Form>
        </TabPane>

        <TabPane tab="安全设置" key="security">
          <Form form={form} layout="vertical">
            <Form.Item name="security.password_min_length" label="密码最小长度" rules={[{ required: true }]}>
              <InputNumber min={6} max={32} />
            </Form.Item>

            <Form.Item name="security.password_require_uppercase" label="要求包含大写字母" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item name="security.password_require_numbers" label="要求包含数字" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item name="security.password_require_special" label="要求包含特殊字符" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item name="security.max_failed_login" label="最大失败登录次数">
              <InputNumber min={1} max={10} />
            </Form.Item>

            <Form.Item name="security.lockout_duration" label="账户锁定时间(分钟)">
              <InputNumber min={5} max={1440} />
            </Form.Item>
          </Form>
        </TabPane>

        <TabPane tab="邮件设置" key="email">
          {/* 邮件服务器配置表单 */}
        </TabPane>

        <TabPane tab="存储设置" key="storage">
          {/* 存储配置表单 */}
        </TabPane>

        <TabPane tab="集成设置" key="integration">
          {/* 外部集成配置表单 */}
        </TabPane>
      </Tabs>
    </div>
  );
};
```

### 8.4 Cursor提示词

```
创建系统管理模块，实现系统级别的配置和管理功能。

1. 创建System相关Redux Slice，实现系统配置的获取和更新
2. 开发SystemSettings组件，提供全局参数配置界面
3. 实现ThemeSettings组件，自定义系统主题和品牌
4. 创建SecuritySettings组件，配置系统安全策略
5. 实现UserManagement组件，管理系统级用户
6. 添加RolePermission组件，配置角色和权限策略
7. 开发SystemMonitor组件，展示系统性能和资源使用情况
8. 实现LogViewer组件，查看系统日志和审计记录
9. 创建BackupManager组件，管理系统备份和恢复
10. 添加IntegrationSettings组件，配置外部系统集成
```

## 9. 前端开发计划与里程碑

### 9.1 总体开发计划

前端开发将分为6个阶段，总计16周，具体规划如下：

#### 阶段1：基础架构搭建（第1周）

- 项目初始化与依赖安装
- 基础组件库设计
- 路由系统搭建
- 状态管理方案实现
- 统一请求封装
- 环境配置

#### 阶段2：权限与用户认证（第2-3周）

- 登录/注册页面
- 权限管理组件
- 用户信息管理
- 权限守卫实现
- 全局用户状态

#### 阶段3：核心功能模块（第4-10周）

- 数据模型管理模块（第4-5周）
- 表单设计器模块（第6-7周）
- 工作流设计器模块（第8-10周）

#### 阶段4：管理功能模块（第11-13周）

- 应用管理模块（第11周）
- 多租户管理模块（第12周）
- 系统管理模块（第13周）

#### 阶段5：优化与测试（第14-15周）

- 性能优化
- 用户体验优化
- 单元测试
- E2E测试
- 兼容性测试

#### 阶段6：部署与上线（第16周）

- 构建优化
- 部署配置
- 文档编写
- 上线准备

### 9.2 里程碑计划

| 里程碑 | 时间节点 | 交付内容 |
|-------|---------|---------|
| M1: 架构与基础功能 | 第3周末 | 完成项目架构和用户认证模块 |
| M2: 数据模型功能 | 第5周末 | 完成数据模型管理模块 |
| M3: 表单设计器 | 第7周末 | 完成表单设计器模块 |
| M4: 工作流设计器 | 第10周末 | 完成工作流设计器模块 |
| M5: 管理功能 | 第13周末 | 完成应用、租户和系统管理功能 |
| M6: 测试与部署 | 第16周末 | 完成所有测试和部署准备 |

### 9.3 开发负责人分工

| 模块 | 负责人 | 人员配置 |
|-----|-------|---------|
| 架构设计 | 技术负责人 | 1人 |
| 用户认证与权限 | 前端开发A | 1人 |
| 数据模型管理 | 前端开发B | 1人 |
| 表单设计器 | 前端开发C+D | 2人 |
| 工作流设计器 | 前端开发E+F | 2人 |
| 应用和租户管理 | 前端开发G | 1人 |
| 系统管理 | 前端开发H | 1人 |
| 测试 | 测试工程师 | 2人 |

### 9.4 风险评估与应对策略

| 风险 | 影响 | 概率 | 应对策略 |
|-----|------|------|---------|
| 设计器组件性能问题 | 高 | 中 | 采用虚拟列表、懒加载、组件分割等优化方案 |
| 前后端接口变更频繁 | 中 | 高 | 使用TypeScript严格定义接口类型，采用Mock服务进行并行开发 |
| 浏览器兼容性问题 | 中 | 中 | 明确支持的浏览器范围，使用polyfill和CSS兼容处理 |
| 用户体验不佳 | 高 | 低 | 提前进行原型验证，持续收集用户反馈 |
| 开发进度延迟 | 高 | 中 | 合理规划里程碑，设置缓冲时间，关键路径优先开发 |
