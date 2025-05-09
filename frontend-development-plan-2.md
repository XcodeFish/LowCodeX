# LowCodeX 前端开发规划文档 (第二部分)

## 4. 表单设计器模块

### 4.1 功能点详细拆解

1. **表单设计器画布**
   - 拖拽式画布设计
   - 组件对齐与网格系统
   - 多分辨率预览
   - 撤销/重做功能

2. **表单组件库**
   - 基础组件 (输入框、选择器、日期等)
   - 高级组件 (上传、富文本、级联等)
   - 布局组件 (分栏、标签页、分组等)
   - 自定义组件支持

3. **组件属性编辑器**
   - 通用属性 (ID、名称、样式等)
   - 特定组件属性
   - 验证规则配置
   - 条件显示配置

4. **表单逻辑设计**
   - 字段联动规则
   - 计算公式设定
   - 条件判断规则
   - 数据源绑定

5. **表单模板管理**
   - 模板保存与发布
   - 模板复用与继承
   - 版本管理
   - 导入导出功能

### 4.2 开发任务与时间安排

| 任务 | 描述 | 时间估计 | 优先级 |
|-----|------|---------|-------|
| 设计表单设计器架构 | 确定组件结构和数据流 | 3天 | P0 |
| 实现基础拖拽画布 | 组件拖放和位置管理 | 5天 | P0 |
| 开发基础组件库 | 实现常用表单组件 | 7天 | P0 |
| 实现组件属性编辑面板 | 支持修改组件属性 | 5天 | P0 |
| 添加表单验证功能 | 实现多种验证规则 | 3天 | P1 |
| 实现表单逻辑设计器 | 字段联动和条件规则 | 7天 | P1 |
| 开发表单模板管理 | 模板的保存和发布功能 | 4天 | P1 |
| 实现表单预览功能 | 多种设备尺寸的预览 | 3天 | P2 |
| 添加撤销/重做功能 | 操作历史管理 | 3天 | P2 |
| 实现导入/导出功能 | 表单模板的导入导出 | 2天 | P2 |
| 单元测试 | 测试设计器核心功能 | 4天 | P1 |

### 4.3 核心组件与类型定义

**表单设计器类型定义 (types/form-designer.ts)**

```typescript
export enum ComponentType {
  // 基础组件
  INPUT = 'input',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  SWITCH = 'switch',
  DATE_PICKER = 'datePicker',
  TIME_PICKER = 'timePicker',
  NUMBER = 'number',
  SLIDER = 'slider',
  RATE = 'rate',

  // 高级组件
  UPLOAD = 'upload',
  RICH_TEXT = 'richText',
  CASCADER = 'cascader',
  TRANSFER = 'transfer',
  COLOR_PICKER = 'colorPicker',

  // 布局组件
  GRID = 'grid',
  TABS = 'tabs',
  COLLAPSE = 'collapse',
  CARD = 'card',
  DIVIDER = 'divider'
}

export interface FormComponentBase {
  id: string;
  type: ComponentType;
  name: string;
  label: string;
  required: boolean;
  disabled: boolean;
  hidden: boolean;
  placeholder?: string;
  description?: string;
  defaultValue?: any;
  validations: ValidationRule[];
  style?: React.CSSProperties;
  className?: string;
}

export interface InputComponent extends FormComponentBase {
  type: ComponentType.INPUT;
  maxLength?: number;
  minLength?: number;
  prefix?: string;
  suffix?: string;
  addonBefore?: string;
  addonAfter?: string;
}

export interface SelectComponent extends FormComponentBase {
  type: ComponentType.SELECT;
  options: Array<{ label: string; value: string }>;
  mode?: 'multiple' | 'tags';
  allowClear?: boolean;
  showSearch?: boolean;
}

// 更多组件类型定义...

export type FormComponent =
  | InputComponent
  | SelectComponent
  // | 其他组件类型...;

export interface FormLayout {
  labelCol?: number;
  wrapperCol?: number;
  layout: 'horizontal' | 'vertical' | 'inline';
  labelAlign: 'left' | 'right';
  size: 'small' | 'middle' | 'large';
}

export interface FormTemplate {
  id: number;
  name: string;
  description?: string;
  components: FormComponent[];
  layout: FormLayout;
  modelId?: number; // 关联的数据模型ID
  version: number;
  isPublished: boolean;
  tenantId: number;
  applicationId?: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface FormLogicRule {
  id: string;
  name: string;
  triggerComponentId: string; // 触发规则的组件ID
  triggerEvent: 'change' | 'focus' | 'blur'; // 触发事件
  conditions: Array<{
    field: string;
    operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'startsWith' | 'endsWith';
    value: any;
  }>;
  actions: Array<{
    targetComponentId: string;
    action: 'show' | 'hide' | 'enable' | 'disable' | 'setValue' | 'clearValue';
    value?: any;
  }>;
}
```

**表单设计器主组件 (components/form-designer/FormDesigner.tsx)**

```tsx
import React, { useState, useCallback } from 'react';
import { Layout, Tabs } from 'antd';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { ComponentPanel } from './ComponentPanel';
import { FormCanvas } from './FormCanvas';
import { PropertyPanel } from './PropertyPanel';
import { LogicPanel } from './LogicPanel';
import { FormToolbar } from './FormToolbar';
import { saveFormTemplate, publishFormTemplate } from '@/store/slices/formSlice';
import { FormComponent, FormTemplate } from '@/types/form-designer';

const { Content, Sider } = Layout;
const { TabPane } = Tabs;

interface FormDesignerProps {
  formId?: number; // 编辑现有表单时传入
}

export const FormDesigner: React.FC<FormDesignerProps> = ({ formId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentForm, loading } = useSelector((state: RootState) => state.form);

  const [selectedComponent, setSelectedComponent] = useState<FormComponent | null>(null);
  const [siderTab, setSiderTab] = useState<string>('components');

  const handleComponentSelect = useCallback((component: FormComponent | null) => {
    setSelectedComponent(component);
    if (component) {
      setSiderTab('properties');
    }
  }, []);

  const handleSave = async () => {
    if (!currentForm) return;

    try {
      await dispatch(saveFormTemplate(currentForm)).unwrap();
      // 显示成功提示
    } catch (error) {
      // 显示错误提示
    }
  };

  const handlePublish = async () => {
    if (!currentForm || !currentForm.id) return;

    try {
      await dispatch(publishFormTemplate(currentForm.id)).unwrap();
      // 显示成功提示
    } catch (error) {
      // 显示错误提示
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Layout style={{ height: '100%' }}>
        <FormToolbar
          onSave={handleSave}
          onPublish={handlePublish}
          loading={loading}
          form={currentForm}
        />

        <Layout>
          <Sider width={300} theme="light">
            <Tabs activeKey={siderTab} onChange={setSiderTab}>
              <TabPane tab="组件" key="components">
                <ComponentPanel />
              </TabPane>
              <TabPane tab="属性" key="properties" disabled={!selectedComponent}>
                <PropertyPanel component={selectedComponent} />
              </TabPane>
              <TabPane tab="逻辑" key="logic">
                <LogicPanel />
              </TabPane>
            </Tabs>
          </Sider>

          <Content style={{ padding: '0 24px', minHeight: 280 }}>
            <FormCanvas
              components={currentForm?.components || []}
              layout={currentForm?.layout}
              selectedComponentId={selectedComponent?.id}
              onSelectComponent={handleComponentSelect}
            />
          </Content>
        </Layout>
      </Layout>
    </DndProvider>
  );
};
```

**表单组件拖拽项 (components/form-designer/DraggableComponent.tsx)**

```tsx
import React from 'react';
import { useDrag } from 'react-dnd';
import { Card } from 'antd';
import { ComponentType } from '@/types/form-designer';

interface DraggableComponentProps {
  type: ComponentType;
  label: string;
  icon: React.ReactNode;
}

export const DraggableComponent: React.FC<DraggableComponentProps> = ({
  type,
  label,
  icon,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'form-component',
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        marginBottom: 8,
      }}
    >
      <Card
        size="small"
        style={{ textAlign: 'center' }}
        hoverable
      >
        <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
        <div>{label}</div>
      </Card>
    </div>
  );
};
```

### 4.4 Cursor提示词

```
创建表单设计器模块，实现拖拽式表单构建功能。

1. 创建Form相关Redux Slice，实现表单模板的CRUD操作
2. 开发ComponentPanel组件，显示可用的表单组件
3. 实现FormCanvas组件，提供拖放区域和组件显示
4. 创建DraggableComponent组件，使组件可以拖放到画布上
5. 实现DroppableArea组件，作为组件放置目标区域
6. 开发PropertyPanel组件，用于编辑组件属性
7. 添加FormLogicDesigner组件，实现表单逻辑和联动规则
8. 实现FormPreview组件，提供表单预览功能
9. 创建FormToolbar组件，包含保存、发布、预览等操作
10. 开发FormTemplateList组件，管理表单模板
```

## 5. 工作流设计器模块

### 5.1 功能点详细拆解

1. **工作流设计器画布**
   - 节点拖拽与连线
   - 流程图自动布局
   - 流程图缩放与导航
   - 撤销/重做功能

2. **工作流节点库**
   - 开始/结束节点
   - 人工任务节点
   - 审批节点
   - 系统任务节点
   - 条件分支节点
   - 并行网关
   - 事件节点

3. **节点属性编辑**
   - 基本属性配置
   - 表单关联
   - 参与者设置
   - 业务规则配置

4. **流程逻辑设计**
   - 条件表达式编辑
   - 流转规则设置
   - 消息与事件配置
   - 超时与提醒设置

5. **工作流部署与管理**
   - 流程版本管理
   - 流程部署
   - 流程导入导出
   - 流程模拟测试

### 5.2 开发任务与时间安排

| 任务 | 描述 | 时间估计 | 优先级 |
|-----|------|---------|-------|
| 设计工作流设计器架构 | 确定组件结构和数据流 | 3天 | P0 |
| 实现基础流程图画布 | 使用X6实现节点和连线 | 7天 | P0 |
| 开发工作流节点库 | 实现各类节点组件 | 5天 | P0 |
| 实现节点属性编辑面板 | 支持修改节点属性 | 4天 | P0 |
| 开发条件表达式编辑器 | 实现条件规则配置 | 6天 | P1 |
| 实现参与者配置组件 | 人员、角色、部门选择器 | 4天 | P1 |
| 添加流程表单关联功能 | 节点与表单的绑定 | 3天 | P1 |
| 开发流程版本管理 | 版本创建与比较功能 | 4天 | P2 |
| 实现流程模拟测试 | 工作流运行模拟器 | 6天 | P2 |
| 添加流程导入导出功能 | BPMN格式支持 | 5天 | P2 |
| 单元测试 | 测试设计器核心功能 | 4天 | P1 |

### 5.3 核心组件与类型定义

**工作流设计器类型定义 (types/workflow.ts)**

```typescript
export enum NodeType {
  START = 'start',
  END = 'end',
  USER_TASK = 'userTask',
  SYSTEM_TASK = 'systemTask',
  APPROVAL = 'approval',
  CONDITION = 'condition',
  PARALLEL_GATEWAY = 'parallelGateway',
  EVENT = 'event'
}

export interface NodeBase {
  id: string;
  type: NodeType;
  name: string;
  description?: string;
  position: { x: number; y: number };
  properties: Record<string, any>;
}

export interface StartNode extends NodeBase {
  type: NodeType.START;
  properties: {
    initiator?: {
      type: 'anyone' | 'role' | 'department' | 'user';
      value: number | number[];
    };
    formId?: number;
  };
}

export interface UserTaskNode extends NodeBase {
  type: NodeType.USER_TASK;
  properties: {
    assignee: {
      type: 'role' | 'department' | 'user' | 'initiator' | 'expression';
      value: number | number[] | string;
    };
    formId?: number;
    dueDate?: string;
    reminder?: {
      enabled: boolean;
      threshold: number;
      interval: number;
    };
  };
}

export interface ApprovalNode extends NodeBase {
  type: NodeType.APPROVAL;
  properties: {
    approvers: Array<{
      type: 'role' | 'department' | 'user' | 'initiator' | 'expression';
      value: number | number[] | string;
    }>;
    strategy: 'any' | 'all' | 'majority';
    formId?: number;
    rejectionBehavior: 'backToInitiator' | 'terminate' | 'custom';
    rejectTo?: string; // 节点ID
  };
}

// 更多节点类型定义...

export type WorkflowNode =
  | StartNode
  | UserTaskNode
  | ApprovalNode
  // | 其他节点类型...;

export interface Edge {
  id: string;
  source: string; // 源节点ID
  target: string; // 目标节点ID
  label?: string;
  condition?: {
    expression: string;
    description: string;
  };
}

export interface Workflow {
  id: number;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: Edge[];
  version: number;
  isPublished: boolean;
  tenantId: number;
  applicationId?: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}
```

**工作流设计器主组件 (components/workflow/WorkflowDesigner.tsx)**

```tsx
import React, { useEffect, useRef, useState } from 'react';
import { Layout, Tabs, message } from 'antd';
import { Graph, Node, Edge } from '@antv/x6';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { NodePanel } from './NodePanel';
import { PropertyPanel } from './PropertyPanel';
import { WorkflowToolbar } from './WorkflowToolbar';
import { ConditionEditor } from './ConditionEditor';
import { loadWorkflow, saveWorkflow, publishWorkflow } from '@/store/slices/workflowSlice';
import { Workflow, WorkflowNode } from '@/types/workflow';

const { Content, Sider } = Layout;
const { TabPane } = Tabs;

interface WorkflowDesignerProps {
  workflowId?: number; // 编辑现有工作流时传入
}

export const WorkflowDesigner: React.FC<WorkflowDesignerProps> = ({ workflowId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentWorkflow, loading } = useSelector((state: RootState) => state.workflow);

  const graphRef = useRef<HTMLDivElement>(null);
  const graphInstance = useRef<Graph | null>(null);

  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [siderTab, setSiderTab] = useState<string>('nodes');

  // 初始化工作流图形
  useEffect(() => {
    if (graphRef.current && !graphInstance.current) {
      graphInstance.current = new Graph({
        container: graphRef.current,
        grid: true,
        mousewheel: {
          enabled: true,
          zoomAtMousePosition: true,
          modifiers: 'ctrl',
          minScale: 0.5,
          maxScale: 2,
        },
        connecting: {
          router: 'manhattan',
          connector: {
            name: 'rounded',
            args: {
              radius: 8,
            },
          },
          anchor: 'center',
          connectionPoint: 'boundary',
          allowBlank: false,
          createEdge() {
            return new Edge({
              attrs: {
                line: {
                  stroke: '#5F95FF',
                  strokeWidth: 2,
                  targetMarker: {
                    name: 'classic',
                    size: 8,
                  },
                },
              },
            });
          },
        },
      });

      // 监听节点选择事件
      graphInstance.current.on('node:click', ({ node }) => {
        const nodeData = node.getData();
        setSelectedNode(nodeData);
        setSelectedEdge(null);
        setSiderTab('properties');
      });

      // 监听边选择事件
      graphInstance.current.on('edge:click', ({ edge }) => {
        const edgeData = edge.getData();
        setSelectedNode(null);
        setSelectedEdge(edgeData);
        setSiderTab('condition');
      });

      // 点击空白区域取消选择
      graphInstance.current.on('blank:click', () => {
        setSelectedNode(null);
        setSelectedEdge(null);
        setSiderTab('nodes');
      });
    }

    return () => {
      if (graphInstance.current) {
        graphInstance.current.dispose();
        graphInstance.current = null;
      }
    };
  }, []);

  // 加载工作流数据
  useEffect(() => {
    if (workflowId) {
      dispatch(loadWorkflow(workflowId));
    }
  }, [dispatch, workflowId]);

  // 当工作流数据变化时，更新图形
  useEffect(() => {
    if (currentWorkflow && graphInstance.current) {
      graphInstance.current.fromJSON(convertWorkflowToGraphData(currentWorkflow));
    }
  }, [currentWorkflow]);

  const handleSave = async () => {
    if (!graphInstance.current || !currentWorkflow) return;

    try {
      const graphData = graphInstance.current.toJSON();
      const updatedWorkflow = convertGraphDataToWorkflow(graphData, currentWorkflow);

      await dispatch(saveWorkflow(updatedWorkflow)).unwrap();
      message.success('工作流已保存');
    } catch (error) {
      message.error('保存失败');
    }
  };

  const handlePublish = async () => {
    if (!currentWorkflow || !currentWorkflow.id) return;

    try {
      await dispatch(publishWorkflow(currentWorkflow.id)).unwrap();
      message.success('工作流已发布');
    } catch (error) {
      message.error('发布失败');
    }
  };

  // 工作流数据与图形数据转换函数
  const convertWorkflowToGraphData = (workflow: Workflow) => {
    // 实现工作流数据到图形数据的转换
    return { nodes: [], edges: [] }; // 简化示例
  };

  const convertGraphDataToWorkflow = (graphData: any, workflow: Workflow) => {
    // 实现图形数据到工作流数据的转换
    return { ...workflow }; // 简化示例
  };

  return (
    <Layout style={{ height: '100%' }}>
      <WorkflowToolbar
        onSave={handleSave}
        onPublish={handlePublish}
        loading={loading}
        workflow={currentWorkflow}
      />

      <Layout>
        <Sider width={300} theme="light">
          <Tabs activeKey={siderTab} onChange={setSiderTab}>
            <TabPane tab="节点" key="nodes">
              <NodePanel graph={graphInstance.current} />
            </TabPane>
            <TabPane tab="属性" key="properties" disabled={!selectedNode}>
              <PropertyPanel node={selectedNode} graph={graphInstance.current} />
            </TabPane>
            <TabPane tab="条件" key="condition" disabled={!selectedEdge}>
              <ConditionEditor edge={selectedEdge} graph={graphInstance.current} />
            </TabPane>
          </Tabs>
        </Sider>

        <Content style={{ padding: '0 24px', minHeight: 280 }}>
          <div ref={graphRef} style={{ width: '100%', height: '100%' }} />
        </Content>
      </Layout>
    </Layout>
  );
};
```

**工作流节点组件 (components/workflow/WorkflowNode.tsx)**

```tsx
import React from 'react';
import { Card } from 'antd';
import { NodeType } from '@/types/workflow';

interface WorkflowNodeProps {
  type: NodeType;
  label: string;
  icon: React.ReactNode;
  onDragStart: (type: NodeType) => void;
}

export const WorkflowNode: React.FC<WorkflowNodeProps> = ({
  type,
  label,
  icon,
  onDragStart,
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/x6-node', type);
    onDragStart(type);
  };

  return (
    <Card
      size="small"
      style={{
        textAlign: 'center',
        cursor: 'move',
        marginBottom: 8,
      }}
      hoverable
      draggable
      onDragStart={handleDragStart}
    >
      <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
      <div>{label}</div>
    </Card>
  );
};
```

### 5.4 Cursor提示词

```
创建工作流设计器模块，实现可视化工作流定义功能。

1. 创建Workflow相关Redux Slice，实现工作流的CRUD操作
2. 设置X6图形库，配置画布和交互行为
3. 开发NodePanel组件，显示可用的工作流节点
4. 实现自定义Node和Edge组件，展示不同类型的节点和连线
5. 创建PropertyPanel组件，用于编辑节点属性
6. 开发ConditionEditor组件，实现条件表达式编辑
7. 实现ParticipantSelector组件，用于选择流程参与者
8. 添加WorkflowValidation功能，检查工作流定义的有效性
9. 创建WorkflowToolbar组件，包含保存、发布、测试等操作
10. 开发WorkflowSimulator组件，提供流程模拟测试功能
```
