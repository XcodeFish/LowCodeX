# LowCodeX 前端开发规划文档 (第一部分)

## 1. 整体开发流程

LowCodeX前端开发将按照以下顺序进行：

### 1.1 开发阶段划分

| 阶段 | 时间节点 | 主要任务 |
|-----|---------|---------|
| 准备阶段 | 第1周 | 项目初始化、技术选型确认、基础架构搭建 |
| 基础阶段 | 第2-4周 | 核心组件库建设、通用功能实现、权限体系搭建 |
| 功能阶段 | 第5-10周 | 各功能模块开发、API对接、交互实现 |
| 优化阶段 | 第11-12周 | 性能优化、UI/UX完善、兼容性测试 |
| 测试阶段 | 第13-14周 | 单元测试、集成测试、E2E测试 |
| 部署阶段 | 第15-16周 | 构建部署、文档编写、上线准备 |

### 1.2 优先级排序

模块开发优先级（从高到低）：

1. **用户认证与权限模块** - 基础设施，其他模块都依赖于此
2. **数据模型管理模块** - 核心功能，其他业务模块的基础
3. **表单设计器模块** - 用户直接交互的核心功能
4. **工作流设计器模块** - 流程自动化的核心功能
5. **应用管理模块** - 集成以上功能的容器
6. **多租户管理模块** - 企业级功能
7. **系统管理模块** - 运维和配置相关功能

## 2. 技术栈与基础设施

### 2.1 技术栈选择

| 类别 | 技术选择 | 说明 |
|-----|---------|------|
| 框架 | React 18 | 组件化开发，完善的生态 |
| 类型系统 | TypeScript 5.x | 强类型支持，提高代码质量 |
| 状态管理 | Redux Toolkit + RTK Query | 集中状态管理 + API数据获取 |
| 路由 | React Router 6 | 声明式路由管理 |
| UI组件库 | Ant Design 5.x | 企业级UI组件库 |
| 样式解决方案 | Less + CSS Modules | 模块化CSS，避免样式冲突 |
| 图表库 | AntV/G2Plot | 可视化图表展示 |
| 拖拽功能 | react-dnd | 表单设计器和流程设计器的拖拽功能 |
| 工作流绘图 | X6 | 流程图绘制 |
| 代码编辑器 | Monaco Editor | 规则、脚本编辑 |
| 表单方案 | Formily | 复杂表单解决方案 |
| 国际化 | react-i18next | 多语言支持 |
| 测试 | Jest + React Testing Library | 单元测试和组件测试 |
| 构建工具 | Vite | 更快的开发体验和构建性能 |

### 2.2 项目初始化

```bash
# 使用Vite创建React+TS项目
npm create vite@latest lowcodex-frontend -- --template react-ts

# 进入项目目录
cd lowcodex-frontend

# 安装核心依赖
npm install react-router-dom @reduxjs/toolkit react-redux antd @ant-design/icons @ant-design/pro-components less @formily/core @formily/react @formily/antd

# 安装拖拽和图形库
npm install react-dnd react-dnd-html5-backend @antv/x6 monaco-editor

# 安装开发依赖
npm install -D typescript @types/react @types/react-dom vite-plugin-style-import less-loader
```

### 2.3 项目结构

```
src/
├── assets/             # 静态资源
├── components/         # 共享组件
│   ├── common/         # 通用组件
│   ├── form-designer/  # 表单设计器组件
│   ├── workflow/       # 工作流组件
│   └── model-designer/ # 数据模型设计器组件
├── layouts/            # 布局组件
├── pages/              # 页面组件
├── services/           # API服务
├── store/              # Redux状态管理
├── hooks/              # 自定义Hooks
├── utils/              # 工具函数
├── types/              # TypeScript类型定义
├── constants/          # 常量定义
├── styles/             # 全局样式
├── locales/            # 国际化文件
├── config/             # 配置文件
├── router/             # 路由配置
├── App.tsx             # 应用入口
└── main.tsx            # 主入口文件
```

### 2.4 核心配置文件设置

**1. vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createStyleImportPlugin, AntdResolve } from 'vite-plugin-style-import';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    createStyleImportPlugin({
      resolves: [AntdResolve()],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          'primary-color': '#1890ff',
          'link-color': '#1890ff',
          'border-radius-base': '2px',
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3100',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
```

**2. tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## 3. 核心模块开发规划

### 3.1 用户认证与权限模块

#### 3.1.1 功能点详细拆解

1. **用户登录**
   - 账号密码登录
   - 记住密码功能
   - 验证码校验
   - OAuth/SAML单点登录集成

2. **用户注册** (或租户管理员创建用户)
   - 表单验证
   - 邮箱验证
   - 初始密码设置

3. **权限控制**
   - 路由级权限控制
   - 组件级权限控制
   - 按钮/操作级权限控制
   - 数据级权限控制

4. **用户信息管理**
   - 个人资料查看/编辑
   - 密码修改
   - 登录日志查看

#### 3.1.2 开发任务与时间安排

| 任务 | 描述 | 时间估计 | 优先级 |
|-----|------|---------|-------|
| 设计用户认证流程 | 确定认证方式、流程和状态管理 | 2天 | P0 |
| 实现登录页面 | 创建登录表单、验证和状态管理 | 3天 | P0 |
| 实现注册页面 | 创建注册表单和验证 | 2天 | P1 |
| 开发权限组件 | 实现权限HOC和Hooks | 3天 | P0 |
| 集成全局用户状态 | 在Redux中管理用户状态 | 2天 | P0 |
| 实现用户信息页面 | 开发个人资料和设置页面 | 3天 | P1 |
| 单元测试 | 测试权限和认证组件 | 2天 | P1 |

#### 3.1.3 核心组件与类型定义

**用户类型定义 (types/user.ts)**

```typescript
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LOCKED = 'locked'
}

export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  status: UserStatus;
  tenantId: number;
  roles: Role[];
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  code: string;
  name: string;
  type: 'system' | 'tenant' | 'application';
  applicationId?: number;
}

export interface LoginParams {
  username: string;
  password: string;
  captcha?: string;
  remember?: boolean;
}

export interface LoginResult {
  token: string;
  user: User;
  expiresIn: number;
}

export interface RegisterParams {
  username: string;
  password: string;
  email: string;
  tenantId?: number;
}
```

**权限控制组件 (components/common/AuthGuard.tsx)**

```typescript
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { RootState } from '@/store';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requiredPermissions = [],
  requiredRoles = []
}) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // 检查是否已登录
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 检查所需权限
  if (requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.every(permission =>
      user?.permissions?.includes(permission)
    );

    if (!hasPermission) {
      return <Navigate to="/403" replace />;
    }
  }

  // 检查所需角色
  if (requiredRoles.length > 0) {
    const hasRole = requiredRoles.some(role =>
      user?.roles?.some(r => r.code === role)
    );

    if (!hasRole) {
      return <Navigate to="/403" replace />;
    }
  }

  return <>{children}</>;
};
```

**权限按钮组件 (components/common/AuthButton.tsx)**

```typescript
import React from 'react';
import { Button, ButtonProps } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface AuthButtonProps extends ButtonProps {
  requiredPermissions?: string[];
  requiredRoles?: string[];
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  requiredPermissions = [],
  requiredRoles = [],
  ...buttonProps
}) => {
  const { user } = useSelector((state: RootState) => state.auth);

  // 检查权限
  const hasPermission = requiredPermissions.length === 0 ||
    requiredPermissions.every(permission => user?.permissions?.includes(permission));

  // 检查角色
  const hasRole = requiredRoles.length === 0 ||
    requiredRoles.some(role => user?.roles?.some(r => r.code === role));

  if (!hasPermission || !hasRole) {
    return null;
  }

  return <Button {...buttonProps} />;
};
```

#### 3.1.4 Cursor提示词

```
创建用户认证模块，包含登录页面、权限控制和用户信息管理。

1. 创建Auth相关Redux Slice，实现用户登录、注册和权限状态管理
2. 开发登录页面组件，包含表单验证和记住密码功能
3. 实现AuthGuard组件用于路由权限控制
4. 添加AuthButton组件用于按钮级权限控制
5. 实现usePermission钩子用于组件内权限判断
6. 开发个人信息页面，允许用户查看和编辑个人信息
7. 实现密码修改功能和相关表单
8. 添加路由配置，集成权限控制
```

### 3.2 数据模型管理模块

#### 3.2.1 功能点详细拆解

1. **模型设计器**
   - 表格视图创建和编辑字段
   - ER图可视化模型关系
   - 字段属性配置面板
   - 模型关系设置

2. **字段类型管理**
   - 基础类型 (文本、数字、布尔等)
   - 复杂类型 (日期、枚举、引用等)
   - 自定义类型创建

3. **数据验证规则**
   - 必填验证
   - 格式验证
   - 范围验证
   - 自定义验证规则

4. **模型版本管理**
   - 模型版本创建
   - 版本对比
   - 版本回滚

#### 3.2.2 开发任务与时间安排

| 任务 | 描述 | 时间估计 | 优先级 |
|-----|------|---------|-------|
| 设计模型管理界面 | 设计UI和交互流程 | 2天 | P0 |
| 实现模型列表页面 | 创建、查看、删除模型 | 3天 | P0 |
| 开发表格视图编辑器 | 实现表格形式的模型编辑 | 5天 | P0 |
| 开发ER图编辑器 | 实现可视化的关系图编辑 | 7天 | P1 |
| 实现字段属性面板 | 各类型字段的属性编辑 | 5天 | P0 |
| 开发模型关系设置 | 一对一、一对多、多对多关系设置 | 4天 | P1 |
| 实现验证规则设置 | 各类验证规则配置界面 | 3天 | P1 |
| 开发版本管理功能 | 版本创建、比较和回滚 | 5天 | P2 |
| 单元测试 | 测试数据模型组件 | 3天 | P1 |

#### 3.2.3 核心组件与类型定义

**数据模型类型定义 (types/data-model.ts)**

```typescript
export enum FieldType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  DATETIME = 'datetime',
  ENUM = 'enum',
  REFERENCE = 'reference',
  FILE = 'file',
  IMAGE = 'image',
  JSON = 'json',
  ARRAY = 'array',
  RICH_TEXT = 'richText'
}

export type ValidationRule = {
  type: 'required' | 'format' | 'range' | 'length' | 'custom';
  message: string;
  pattern?: string;
  min?: number;
  max?: number;
  expression?: string;
};

export interface ModelField {
  id: number;
  name: string;
  displayName: string;
  type: FieldType;
  isRequired: boolean;
  isPrimaryKey: boolean;
  isUnique: boolean;
  defaultValue?: any;
  description?: string;
  validationRules: ValidationRule[];
  enumValues?: string[];
  referenceModel?: string;
  referenceField?: string;
  order: number;
}

export interface Model {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  fields: ModelField[];
  tenantId: number;
  applicationId?: number;
  version: number;
  isPublished: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface ModelRelation {
  id: number;
  name: string;
  sourceModelId: number;
  targetModelId: number;
  type: 'oneToOne' | 'oneToMany' | 'manyToMany';
  sourceField: string;
  targetField: string;
  junctionTable?: string;
}
```

**模型列表组件 (components/model-designer/ModelList.tsx)**

```tsx
import React, { useEffect } from 'react';
import { Table, Button, Space, Tag, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '@/store';
import { fetchModels, deleteModel, duplicateModel } from '@/store/slices/modelSlice';
import { AuthButton } from '@/components/common/AuthButton';

export const ModelList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { models, loading } = useSelector((state: RootState) => state.model);

  useEffect(() => {
    dispatch(fetchModels());
  }, [dispatch]);

  const handleEdit = (id: number) => {
    navigate(`/models/edit/${id}`);
  };

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteModel(id)).unwrap();
      message.success('数据模型已删除');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleDuplicate = async (id: number, name: string) => {
    try {
      await dispatch(duplicateModel({ id, newName: `${name} 副本` })).unwrap();
      message.success('数据模型已复制');
    } catch (error) {
      message.error('复制失败');
    }
  };

  const columns = [
    {
      title: '模型名称',
      dataIndex: 'displayName',
      key: 'displayName',
    },
    {
      title: '技术名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '字段数量',
      dataIndex: 'fields',
      key: 'fieldCount',
      render: (fields: any[]) => fields.length,
    },
    {
      title: '状态',
      dataIndex: 'isPublished',
      key: 'isPublished',
      render: (isPublished: boolean) => (
        isPublished ? <Tag color="green">已发布</Tag> : <Tag color="orange">草稿</Tag>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: any) => (
        <Space size="small">
          <AuthButton
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.id)}
            requiredPermissions={['model:update']}
          >
            编辑
          </AuthButton>
          <AuthButton
            icon={<CopyOutlined />}
            onClick={() => handleDuplicate(record.id, record.name)}
            requiredPermissions={['model:create']}
          >
            复制
          </AuthButton>
          <Popconfirm
            title="确定要删除这个数据模型吗?"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <AuthButton
              danger
              icon={<DeleteOutlined />}
              requiredPermissions={['model:delete']}
            >
              删除
            </AuthButton>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <AuthButton
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/models/create')}
          requiredPermissions={['model:create']}
        >
          创建数据模型
        </AuthButton>
      </div>
      <Table
        columns={columns}
        dataSource={models}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};
```

#### 3.2.4 Cursor提示词

```
创建数据模型管理模块，包含模型设计器和字段管理功能。

1. 创建DataModel相关Redux Slice，实现模型的CRUD操作
2. 开发ModelList组件，展示所有模型并支持基本操作
3. 实现TableEditor组件，用于表格形式编辑数据模型
4. 创建ERDiagramEditor组件，实现ER图可视化编辑
5. 开发FieldPropertiesPanel组件，支持配置各类型字段的属性
6. 实现RelationshipEditor组件，用于设置模型间的关系
7. 添加ValidationRuleEditor组件，用于配置字段验证规则
8. 实现ModelVersionControl组件，支持版本管理和比较
9. 开发ModelPublish功能，将模型发布为正式版本
```
