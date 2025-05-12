import { lazy } from 'react';

// 懒加载组件
const ModelList = lazy(() => import('../pages/data-model/ModelList'));
const ModelEditor = lazy(() => import('../pages/data-model/ModelEditor'));
// const FormDesigner = lazy(() => import('../pages/form-designer/FormDesigner'));
// const FormList = lazy(() => import('../pages/form-designer/FormList'));
// const WorkflowDesigner = lazy(() => import('../pages/workflow-designer/WorkflowDesigner'));
// const WorkflowList = lazy(() => import('../pages/workflow-designer/WorkflowList'));
// const ApplicationList = lazy(() => import('../pages/applications/ApplicationList'));
// const ApplicationEditor = lazy(() => import('../pages/applications/ApplicationEditor'));
// const UserManagement = lazy(() => import('../pages/system/UserManagement'));
// const RoleManagement = lazy(() => import('../pages/system/RoleManagement'));
// const TenantManagement = lazy(() => import('../pages/system/TenantManagement'));

// 定义路由类型
interface ProtectedRoute {
  path: string;
  component: React.ComponentType<any>;
  requiredPermissions: string[];
  requiredRoles: string[];
}

// 导出受保护路由配置
export const protectedRoutes: ProtectedRoute[] = [
  // 数据模型路由 - 暂时屏蔽权限检查
  {
    path: '/models',
    component: ModelList,
    requiredPermissions: [], // 原为 ['model:view']
    requiredRoles: []
  },
  {
    path: '/models/create',
    component: ModelEditor,
    requiredPermissions: [], // 原为 ['model:create']
    requiredRoles: []
  },
  {
    path: '/models/edit/:id',
    component: ModelEditor,
    requiredPermissions: [], // 原为 ['model:update']
    requiredRoles: []
  },
  {
    path: '/models/view/:id',
    component: ModelEditor,
    requiredPermissions: [], // 原为 ['model:view']
    requiredRoles: []
  },
];

// 受保护路由配置
// export const protectedRoutes = [
//   // 数据模型路由
//   {
//     path: '/models',
//     component: ModelList,
//     requiredPermissions: ['model:view'],
//     requiredRoles: []
//   },
//   {
//     path: '/models/create',
//     component: ModelEditor,
//     requiredPermissions: ['model:create'],
//     requiredRoles: []
//   },
//   {
//     path: '/models/edit/:id',
//     component: ModelEditor,
//     requiredPermissions: ['model:update'],
//     requiredRoles: []
//   },

//   // 表单设计器路由
//   {
//     path: '/forms',
//     component: FormList,
//     requiredPermissions: ['form:view'],
//     requiredRoles: []
//   },
//   {
//     path: '/forms/create',
//     component: FormDesigner,
//     requiredPermissions: ['form:create'],
//     requiredRoles: []
//   },
//   {
//     path: '/forms/edit/:id',
//     component: FormDesigner,
//     requiredPermissions: ['form:update'],
//     requiredRoles: []
//   },

//   // 工作流设计器路由
//   {
//     path: '/workflows',
//     component: WorkflowList,
//     requiredPermissions: ['workflow:view'],
//     requiredRoles: []
//   },
//   {
//     path: '/workflows/create',
//     component: WorkflowDesigner,
//     requiredPermissions: ['workflow:create'],
//     requiredRoles: []
//   },
//   {
//     path: '/workflows/edit/:id',
//     component: WorkflowDesigner,
//     requiredPermissions: ['workflow:update'],
//     requiredRoles: []
//   },

//   // 应用管理路由
//   {
//     path: '/applications',
//     component: ApplicationList,
//     requiredPermissions: ['application:view'],
//     requiredRoles: []
//   },
//   {
//     path: '/applications/create',
//     component: ApplicationEditor,
//     requiredPermissions: ['application:create'],
//     requiredRoles: []
//   },
//   {
//     path: '/applications/edit/:id',
//     component: ApplicationEditor,
//     requiredPermissions: ['application:update'],
//     requiredRoles: []
//   },

//   // 系统管理路由
//   {
//     path: '/system/users',
//     component: UserManagement,
//     requiredPermissions: ['system:user:manage'],
//     requiredRoles: ['admin']
//   },
//   {
//     path: '/system/roles',
//     component: RoleManagement,
//     requiredPermissions: ['system:role:manage'],
//     requiredRoles: ['admin']
//   },
//   {
//     path: '/system/tenants',
//     component: TenantManagement,
//     requiredPermissions: ['system:tenant:manage'],
//     requiredRoles: ['admin']
//   }
// ];
