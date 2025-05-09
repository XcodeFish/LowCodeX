# LowCodeX 后端开发规划文档 (第四部分)

## 6. 工作流引擎模块

### 6.1 功能点详细拆解

1. **工作流定义管理**
   - 流程模板的创建、编辑、删除
   - 流程版本管理
   - 流程状态管理（草稿、已发布、已停用）
   - 流程分类与标签

2. **节点类型管理**
   - 基础节点类型（开始、结束、任务、网关等）
   - 自定义节点类型
   - 节点配置项定义
   - 节点图标与样式

3. **流程实例管理**
   - 流程实例的创建与启动
   - 流程实例的暂停与恢复
   - 流程实例的终止与撤回
   - 流程实例状态跟踪

4. **任务管理**
   - 用户任务分配
   - 任务通知与提醒
   - 任务转交与委托
   - 任务批量处理

5. **流程路由与决策**
   - 条件分支规则
   - 并行与合并网关
   - 事件触发处理
   - 动态路由策略

6. **流程监控与分析**
   - 流程执行历史记录
   - 流程性能指标
   - 流程瓶颈分析
   - 流程优化建议

### 6.2 开发任务与时间安排

| 任务 | 描述 | 时间估计 | 优先级 |
|-----|------|---------|-------|
| 设计工作流数据模型 | 确定流程、节点和实例的数据结构 | 3天 | P0 |
| 实现工作流定义API | 流程模板的CRUD操作 | 4天 | P0 |
| 开发节点类型管理 | 实现节点类型系统 | 3天 | P0 |
| 创建流程实例管理 | 实现流程实例的生命周期管理 | 5天 | P0 |
| 实现任务管理系统 | 任务分配与状态管理 | 4天 | P0 |
| 添加流程路由引擎 | 条件判断与流程路由 | 5天 | P1 |
| 开发流程触发机制 | 定时与事件触发系统 | 4天 | P1 |
| 实现流程监控功能 | 流程执行状态监控 | 3天 | P2 |
| 添加流程分析工具 | 流程执行历史分析 | 3天 | P2 |
| 单元测试 | 测试工作流核心功能 | 4天 | P1 |

### 6.3 核心实体定义

**工作流模型 (modules/workflows/entities/workflow.entity.ts)**

```typescript
import { Prisma } from '@prisma/client';

export class WorkflowDefinition implements Prisma.WorkflowDefinitionUncheckedCreateInput {
  id?: number;
  code: string;
  name: string;
  description?: string;
  definition: string; // JSON格式存储流程定义数据
  version: number;
  status: string; // draft, published, deprecated
  categoryId?: number;
  tags?: string; // JSON数组存储标签
  tenantId: number;
  applicationId?: number;
  createdBy: number;
  updatedBy?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  publishedAt?: Date | string;
}

export class WorkflowVersion implements Prisma.WorkflowVersionUncheckedCreateInput {
  id?: number;
  workflowId: number;
  version: number;
  definition: string;
  changelog?: string;
  createdBy: number;
  createdAt?: Date | string;
  publishedAt?: Date | string;
  status: string; // draft, published, deprecated
}

export class NodeType implements Prisma.NodeTypeUncheckedCreateInput {
  id?: number;
  code: string;
  name: string;
  category: string; // event, task, gateway, boundary
  description?: string;
  icon?: string;
  properties: string; // JSON格式存储节点属性定义
  isSystem: boolean; // 是否系统内置节点类型
  tenantId?: number; // 系统节点类型为null，自定义节点类型关联租户
  createdBy?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export class WorkflowInstance implements Prisma.WorkflowInstanceUncheckedCreateInput {
  id?: number;
  workflowId: number;
  workflowVersion: number;
  businessKey?: string; // 业务关联标识
  status: string; // running, completed, terminated, suspended
  variables: string; // JSON格式存储流程变量
  startedBy: number;
  startedAt: Date | string;
  endedAt?: Date | string;
  tenantId: number;
  applicationId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export class WorkflowTask implements Prisma.WorkflowTaskUncheckedCreateInput {
  id?: number;
  instanceId: number;
  nodeId: string; // 流程定义中的节点ID
  nodeName: string;
  nodeType: string;
  status: string; // pending, claimed, completed, canceled
  assignee?: number; // 指派的用户ID
  candidateUsers?: string; // JSON数组存储候选用户ID
  candidateGroups?: string; // JSON数组存储候选组ID
  formId?: number; // 关联的表单ID
  formData?: string; // JSON格式存储表单数据
  dueDate?: Date | string;
  priority?: number;
  createdAt?: Date | string;
  claimedAt?: Date | string;
  completedAt?: Date | string;
  tenantId: number;
}

export class WorkflowHistory implements Prisma.WorkflowHistoryUncheckedCreateInput {
  id?: number;
  instanceId: number;
  nodeId: string;
  nodeName: string;
  nodeType: string;
  actionType: string; // start, complete, claim, delegate, suspend, resume, terminate
  actionBy: number;
  actionAt: Date | string;
  comments?: string;
  previousState?: string;
  currentState: string;
  variables?: string; // JSON格式存储当时的变量
  tenantId: number;
  createdAt?: Date | string;
}
```
