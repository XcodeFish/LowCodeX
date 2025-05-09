# LowCodeX 开发指南

## 1. 项目概述

LowCodeX 是一款基于 React 前端和 Nest.js 后端的企业级低代码开发平台，旨在帮助开发者快速构建应用系统。本文档提供了详细的开发指南，帮助开发人员理解系统架构、搭建开发环境并参与项目开发。

### 1.1 文档目的

本文档面向以下人员：

- 前端开发人员：负责 React 组件开发和低代码设计器实现
- 后端开发人员：负责 Nest.js API 和服务实现
- 系统集成人员：负责私有化部署和系统集成
- 项目管理人员：了解系统整体架构和功能模块

### 1.2 技术栈概览

| 层级 | 技术栈 | 版本要求 |
|------|-------|---------|
| **前端** | React, TypeScript, Ant Design | React >= 18.0, TypeScript >= 4.5 |
| **后端** | Nest.js, Prisma, TypeScript | Node.js >= 16.0, Nest.js >= 9.0 |
| **数据库** | MySQL, Redis | MySQL >= 8.0, Redis >= 6.0 |
| **部署** | Docker, Docker Compose | Docker >= 20.10 |

## 2. 环境准备

### 2.1 开发环境要求

- **操作系统**：Windows/MacOS/Linux
- **Node.js**：v16.0 或更高版本
- **包管理器**：npm v8.0+ 或 yarn v1.22+
- **数据库**：MySQL 8.0+, Redis 6.0+
- **IDE 推荐**：VSCode 配合以下插件：
  - ESLint
  - Prettier
  - TypeScript
  - Prisma
  - React Developer Tools

### 2.2 环境搭建步骤

```bash
# 1. 克隆项目代码
git clone https://github.com/your-org/lowcodex.git
cd lowcodex

# 2. 安装依赖
## 前端依赖安装
cd frontend
npm install
cd ..

## 后端依赖安装
cd backend
npm install
cd ..

# 3. 启动数据库(使用Docker)
docker-compose up -d mysql redis

# 4. 配置环境变量
## 前端环境变量
cp frontend/.env.example frontend/.env.local

## 后端环境变量
cp backend/.env.example backend/.env

# 5. 初始化数据库
cd backend
npx prisma migrate dev
npx prisma db seed
```

## 3. 前端开发指南

### 3.1 项目结构

```
frontend/
├── public/              # 静态资源文件
├── src/
│   ├── assets/          # 图片、字体等资源
│   │   ├── base/        # 基础UI组件
│   │   ├── business/    # 业务组件
│   │   └── layout/      # 布局组件
│   ├── config/          # 全局配置
│   ├── hooks/           # 自定义React Hooks
│   ├── pages/           # 页面组件
│   │   ├── dashboard/   # 控制台
│   │   ├── forms/       # 表单设计
│   │   ├── models/      # 模型管理
│   │   └── workflows/   # 工作流管理
│   ├── services/        # API服务
│   ├── store/           # 状态管理
│   ├── types/           # TypeScript类型定义
│   ├── utils/           # 工具函数
│   ├── App.tsx          # 应用入口组件
│   └── index.tsx        # 应用入口文件
├── .eslintrc.js         # ESLint配置
├── .prettierrc          # Prettier配置
├── package.json         # 依赖配置
├── tsconfig.json        # TypeScript配置
└── vite.config.ts       # Vite构建配置
```

### 3.2 开发规范

#### 3.2.1 代码风格

项目使用 ESLint 和 Prettier 确保代码风格一致：

```bash
# 检查代码风格
npm run lint

# 自动修复代码风格问题
npm run lint:fix

# 格式化代码
npm run format
```

#### 3.2.2 命名规范

- **文件命名**：
  - 组件文件：使用 PascalCase（如 `FormDesigner.tsx`）
  - 工具/Hook 文件：使用 camelCase（如 `useFormData.ts`）
  - 类型定义文件：使用 camelCase 并以 `.d.ts` 结尾（如 `forms.d.ts`）

- **变量命名**：
  - 普通变量：camelCase（如 `formData`）
  - 常量：UPPER_SNAKE_CASE（如 `API_BASE_URL`）
  - 类/组件：PascalCase（如 `FormDesigner`）
  - 接口/类型：PascalCase 并以 `I` 或类型意义前缀（如 `IFormConfig` 或 `FormProps`）

- **CSS 类名**：
  - 使用 kebab-case（如 `form-designer-container`）
  - 推荐使用 BEM 命名法（Block-Element-Modifier）

#### 3.2.3 目录结构规范

- 页面组件放在 `pages/` 目录下
- 可复用组件放在 `components/` 目录下
- 跨页面的状态管理放在 `store/` 目录下
- API 调用封装在 `services/` 目录下

### 3.3 核心模块开发指南

#### 3.3.1 表单设计器

表单设计器是 LowCodeX 的核心功能模块，用于可视化设计表单。

**核心组件结构**：

![表单设计器组件结构](https://via.placeholder.com/800x500?text=表单设计器组件结构)

**关键实现**：

1. **组件面板**：

```tsx
// src/components/business/form-designer/ComponentPanel.tsx
import React from 'react';
import { Card, Tabs } from 'antd';
import { DragSourceComponent } from './DragSourceComponent';
import { componentRegistry } from '@/config/form-components';

const { TabPane } = Tabs;

export const ComponentPanel: React.FC = () => {
  // 组件分类
  const componentCategories = {
    basic: ['Input', 'Select', 'Checkbox', 'Radio', 'Switch'],
    layout: ['Grid', 'Tabs', 'Card', 'Collapse'],
    advanced: ['Table', 'Upload', 'RichText', 'DateRange']
  };

  return (
    <Card title="组件面板" bordered={false} className="component-panel">
      <Tabs defaultActiveKey="basic">
        <TabPane tab="基础组件" key="basic">
          <div className="component-list">
            {componentCategories.basic.map(type => (
              <DragSourceComponent
                key={type}
                type={type}
                config={componentRegistry[type]}
              />
            ))}
          </div>
        </TabPane>
        <TabPane tab="布局组件" key="layout">
          <div className="component-list">
            {componentCategories.layout.map(type => (
              <DragSourceComponent
                key={type}
                type={type}
                config={componentRegistry[type]}
              />
            ))}
          </div>
        </TabPane>
        <TabPane tab="高级组件" key="advanced">
          <div className="component-list">
            {componentCategories.advanced.map(type => (
              <DragSourceComponent
                key={type}
                type={type}
                config={componentRegistry[type]}
              />
            ))}
          </div>
        </TabPane>
      </Tabs>
    </Card>
  );
};
```

2. **设计器画布**：

```tsx
// src/components/business/form-designer/DesignerCanvas.tsx
import React from 'react';
import { useDrop } from 'react-dnd';
import { useFormDesigner } from '@/hooks/useFormDesigner';
import { FormComponentWrapper } from './FormComponentWrapper';
import { Empty, Card } from 'antd';

export const DesignerCanvas: React.FC = () => {
  const { formConfig, addComponent, moveComponent } = useFormDesigner();

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'FORM_COMPONENT',
    drop: (item: any, monitor) => {
      // 处理放置逻辑
      const didDrop = monitor.didDrop();
      if (didDrop) return;

      const { type, id } = item;
      if (!id) {
        // 新组件
        addComponent({
          type,
          id: `${type}_${Date.now()}`,
          props: {},
          children: []
        });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true })
    })
  }));

  return (
    <Card
      title="设计器画布"
      bordered={false}
      className={`designer-canvas ${isOver ? 'is-over' : ''}`}
      ref={drop}
    >
      {formConfig.components.length === 0 ? (
        <Empty description="拖拽组件到此区域" />
      ) : (
        <div className="form-container">
          {formConfig.components.map(component => (
            <FormComponentWrapper
              key={component.id}
              component={component}
              onMove={moveComponent}
            />
          ))}
        </div>
      )}
    </Card>
  );
};
```

3. **属性面板**：

```tsx
// src/components/business/form-designer/PropertyPanel.tsx
import React from 'react';
import { Card, Form, Input, Switch, Select, Divider, Collapse } from 'antd';
import { useFormDesigner } from '@/hooks/useFormDesigner';
import { componentRegistry } from '@/config/form-components';

const { Panel } = Collapse;
const { Option } = Select;

export const PropertyPanel: React.FC = () => {
  const {
    selectedComponent,
    updateComponentProps,
    formConfig
  } = useFormDesigner();

  if (!selectedComponent) {
    return (
      <Card title="属性面板" bordered={false} className="property-panel">
        <div className="empty-panel">
          <p>请选择一个组件</p>
        </div>
      </Card>
    );
  }

  const componentConfig = componentRegistry[selectedComponent.type];

  // 根据选中组件类型动态生成属性编辑表单
  const generatePropertyForm = () => {
    if (!componentConfig || !componentConfig.properties) return null;

    return (
      <Form
        layout="vertical"
        initialValues={selectedComponent.props}
        onValuesChange={(_, allValues) => {
          updateComponentProps(selectedComponent.id, allValues);
        }}
      >
        <Collapse defaultActiveKey={['basic', 'advanced']}>
          <Panel header="基础属性" key="basic">
            {/* 基础属性编辑区 */}
            {Object.entries(componentConfig.properties)
              .filter(([_, prop]) => !prop.advanced)
              .map(([key, prop]) => renderFormItem(key, prop))}
          </Panel>
          <Panel header="高级属性" key="advanced">
            {/* 高级属性编辑区 */}
            {Object.entries(componentConfig.properties)
              .filter(([_, prop]) => prop.advanced)
              .map(([key, prop]) => renderFormItem(key, prop))}
          </Panel>
        </Collapse>
      </Form>
    );
  };

  // 渲染表单项
  const renderFormItem = (key, prop) => {
    const { type, label, options } = prop;

    switch (type) {
      case 'string':
        return (
          <Form.Item key={key} name={key} label={label}>
            <Input />
          </Form.Item>
        );
      case 'boolean':
        return (
          <Form.Item key={key} name={key} label={label} valuePropName="checked">
            <Switch />
          </Form.Item>
        );
      case 'enum':
        return (
          <Form.Item key={key} name={key} label={label}>
            <Select>
              {options.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </Form.Item>
        );
      // 更多属性类型...
      default:
        return null;
    }
  };

  return (
    <Card title={`${selectedComponent.type} 属性`} bordered={false} className="property-panel">
      {generatePropertyForm()}
    </Card>
  );
};
```

4. **表单设计器 Hook**：

```tsx
// src/hooks/useFormDesigner.ts
import { useState, useCallback } from 'react';
import { FormConfig, FormComponent } from '@/types/form';

// 初始表单配置
const initialFormConfig: FormConfig = {
  name: '新建表单',
  description: '',
  components: []
};

export const useFormDesigner = () => {
  const [formConfig, setFormConfig] = useState<FormConfig>(initialFormConfig);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

  // 获取选中的组件
  const selectedComponent = selectedComponentId
    ? findComponentById(formConfig.components, selectedComponentId)
    : null;

  // 添加组件
  const addComponent = useCallback((component: FormComponent) => {
    setFormConfig(prev => ({
      ...prev,
      components: [...prev.components, component]
    }));
    setSelectedComponentId(component.id);
  }, []);

  // 移动组件
  const moveComponent = useCallback((dragId: string, hoverId: string) => {
    setFormConfig(prev => {
      const dragIndex = prev.components.findIndex(c => c.id === dragId);
      const hoverIndex = prev.components.findIndex(c => c.id === hoverId);

      if (dragIndex === -1 || hoverIndex === -1) return prev;

      const newComponents = [...prev.components];
      const [draggedComponent] = newComponents.splice(dragIndex, 1);
      newComponents.splice(hoverIndex, 0, draggedComponent);

      return {
        ...prev,
        components: newComponents
      };
    });
  }, []);

  // 更新组件属性
  const updateComponentProps = useCallback((id: string, props: any) => {
    setFormConfig(prev => {
      const component = findComponentById(prev.components, id);
      if (!component) return prev;

      // 创建更新后的组件树
      const updatedComponents = updateComponentInTree(
        prev.components,
        id,
        { ...component, props: { ...component.props, ...props } }
      );

      return {
        ...prev,
        components: updatedComponents
      };
    });
  }, []);

  // 删除组件
  const removeComponent = useCallback((id: string) => {
    setFormConfig(prev => {
      const components = removeComponentFromTree(prev.components, id);
      return {
        ...prev,
        components
      };
    });

    if (selectedComponentId === id) {
      setSelectedComponentId(null);
    }
  }, [selectedComponentId]);

  // 辅助函数：在组件树中查找组件
  const findComponentById = (components: FormComponent[], id: string): FormComponent | null => {
    for (const component of components) {
      if (component.id === id) return component;

      if (component.children && component.children.length > 0) {
        const found = findComponentById(component.children, id);
        if (found) return found;
      }
    }

    return null;
  };

  // 辅助函数：更新组件树中的组件
  const updateComponentInTree = (
    components: FormComponent[],
    id: string,
    updatedComponent: FormComponent
  ): FormComponent[] => {
    return components.map(component => {
      if (component.id === id) {
        return updatedComponent;
      }

      if (component.children && component.children.length > 0) {
        return {
          ...component,
          children: updateComponentInTree(component.children, id, updatedComponent)
        };
      }

      return component;
    });
  };

  // 辅助函数：从组件树中删除组件
  const removeComponentFromTree = (
    components: FormComponent[],
    id: string
  ): FormComponent[] => {
    return components.filter(component => {
      if (component.id === id) return false;

      if (component.children && component.children.length > 0) {
        component.children = removeComponentFromTree(component.children, id);
      }

      return true;
    });
  };

  return {
    formConfig,
    setFormConfig,
    selectedComponent,
    selectedComponentId,
    setSelectedComponentId,
    addComponent,
    moveComponent,
    updateComponentProps,
    removeComponent
  };
};
```

**使用表单设计器**：

```tsx
// src/pages/forms/FormDesignerPage.tsx
import React from 'react';
import { Layout, Space, Button, message } from 'antd';
import { SaveOutlined, EyeOutlined, CodeOutlined } from '@ant-design/icons';
import { ComponentPanel } from '@/components/business/form-designer/ComponentPanel';
import { DesignerCanvas } from '@/components/business/form-designer/DesignerCanvas';
import { PropertyPanel } from '@/components/business/form-designer/PropertyPanel';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useFormDesigner } from '@/hooks/useFormDesigner';
import { formService } from '@/services/form.service';

const { Content, Sider } = Layout;

export const FormDesignerPage: React.FC = () => {
  const { formConfig } = useFormDesigner();

  // 保存表单
  const handleSave = async () => {
    try {
      await formService.saveForm(formConfig);
      message.success('表单保存成功');
    } catch (error) {
      message.error('保存失败：' + error.message);
    }
  };

  // 预览表单
  const handlePreview = () => {
    // 打开预览模式
    window.open(`/form-preview?data=${encodeURIComponent(JSON.stringify(formConfig))}`);
  };

  // 查看JSON配置
  const handleViewJSON = () => {
    // 打开JSON查看模态框
    // ...
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Layout className="form-designer-page">
        <Content style={{ padding: '16px' }}>
          <div className="designer-header">
            <h1>{formConfig.name || '新建表单'}</h1>
            <Space>
              <Button icon={<SaveOutlined />} type="primary" onClick={handleSave}>
                保存
              </Button>
              <Button icon={<EyeOutlined />} onClick={handlePreview}>
                预览
              </Button>
              <Button icon={<CodeOutlined />} onClick={handleViewJSON}>
                查看JSON
              </Button>
            </Space>
          </div>

          <Layout className="designer-content">
            <Sider width={300} className="designer-sider left">
              <ComponentPanel />
            </Sider>

            <Content className="designer-main">
              <DesignerCanvas />
            </Content>

            <Sider width={300} className="designer-sider right">
              <PropertyPanel />
            </Sider>
          </Layout>
        </Content>
      </Layout>
    </DndProvider>
  );
};
```

#### 3.3.2 工作流设计器

工作流设计器用于可视化设计业务流程，实现基于流程的自动化执行。

**核心实现**：

```tsx
// src/pages/workflows/WorkflowDesignerPage.tsx
import React, { useState, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  addEdge,
  removeElements,
  isNode,
  isEdge
} from 'react-flow-renderer';
import { nanoid } from 'nanoid';
import { Layout, Card, Button, Space, message } from 'antd';
import { NodePanel } from '@/components/business/workflow-designer/NodePanel';
import { NodePropertiesPanel } from '@/components/business/workflow-designer/NodePropertiesPanel';
import { workflowService } from '@/services/workflow.service';

const { Content, Sider } = Layout;

// 自定义节点类型
const nodeTypes = {
  startNode: StartNode,
  taskNode: TaskNode,
  decisionNode: DecisionNode,
  endNode: EndNode
};

export const WorkflowDesignerPage: React.FC = () => {
  // 工作流状态
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [workflowName, setWorkflowName] = useState('新建工作流');

  // 添加节点
  const onAddNode = (nodeType) => {
    const newNode = {
      id: `${nodeType}_${nanoid(6)}`,
      type: nodeType,
      data: {
        label: getDefaultLabelByType(nodeType),
        config: getDefaultConfigByType(nodeType)
      },
      position: { x: 250, y: 100 }
    };

    setElements((els) => els.concat(newNode));
  };

  // 连接节点
  const onConnect = (params) => {
    // 检查连接合法性
    if (!isConnectionValid(params, elements)) {
      message.error('无效的连接');
      return;
    }

    const edge = {
      ...params,
      id: `edge_${nanoid(6)}`,
      type: 'default',
      animated: true,
      data: {
        condition: null
      }
    };

    setElements((els) => addEdge(edge, els));
  };

  // 元素选择
  const onElementClick = (event, element) => {
    setSelectedElement(element);
  };

  // 更新元素属性
  const updateElementData = (id, newData) => {
    setElements((els) =>
      els.map((el) => {
        if (el.id === id) {
          return {
            ...el,
            data: {
              ...el.data,
              ...newData
            }
          };
        }
        return el;
      })
    );
  };

  // 保存工作流
  const saveWorkflow = async () => {
    try {
      const workflow = {
        name: workflowName,
        description: '',
        elements: elements,
      };

      await workflowService.saveWorkflow(workflow);
      message.success('工作流保存成功');
    } catch (error) {
      message.error('保存失败：' + error.message);
    }
  };

  return (
    <Layout className="workflow-designer-page">
      <Content style={{ padding: '16px' }}>
        <div className="designer-header">
          <h1>{workflowName}</h1>
          <Space>
            <Button type="primary" onClick={saveWorkflow}>
              保存
            </Button>
            <Button onClick={() => {}}>
              测试
            </Button>
          </Space>
        </div>

        <Layout className="designer-content">
          <Sider width={250} className="designer-sider left">
            <NodePanel onAddNode={onAddNode} />
          </Sider>

          <Content className="designer-main">
            <Card bordered={false} className="flow-container">
              <ReactFlow
                elements={elements}
                onElementsRemove={(elementsToRemove) =>
                  setElements((els) => removeElements(elementsToRemove, els))
                }
                onConnect={onConnect}
                onElementClick={onElementClick}
                deleteKeyCode={46} // Delete key
                nodeTypes={nodeTypes}
                snapToGrid={true}
                snapGrid={[15, 15]}
              >
                <Controls />
                <Background color="#aaa" gap={16} />
                <MiniMap
                  nodeStrokeColor={(n) => {
                    if (n.type === 'startNode') return '#0041d0';
                    if (n.type === 'endNode') return '#ff0072';
                    return '#1a192b';
                  }}
                  nodeColor={(n) => {
                    if (n.type === 'startNode') return '#0041d0';
                    if (n.type === 'endNode') return '#ff0072';
                    return '#1a192b';
                  }}
                />
              </ReactFlow>
            </Card>
          </Content>

          <Sider width={300} className="designer-sider right">
            <NodePropertiesPanel
              selectedElement={selectedElement}
              updateElementData={updateElementData}
            />
          </Sider>
        </Layout>
      </Content>
    </Layout>
  );
};
```

### 3.4 状态管理

项目使用状态管理来处理复杂的应用状态，主要包括：

```tsx
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import formReducer from './slices/formSlice';
import workflowReducer from './slices/workflowSlice';
import modelReducer from './slices/modelSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    form: formReducer,
    workflow: workflowReducer,
    model: modelReducer,
    ui: uiReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**使用示例**：

```tsx
// src/components/business/form-list/FormList.tsx
import React, { useEffect } from 'react';
import { Table, Button, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { fetchForms, deleteForm } from '@/store/slices/formSlice';

export const FormList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { forms, loading } = useAppSelector(state => state.form);

  useEffect(() => {
    dispatch(fetchForms());
  }, [dispatch]);

  const handleCreateForm = () => {
    navigate('/forms/create');
  };

  const handleEditForm = (id: string) => {
    navigate(`/forms/edit/${id}`);
  };

  const handleDeleteForm = async (id: string) => {
    try {
      await dispatch(deleteForm(id)).unwrap();
      message.success('表单删除成功');
    } catch (error) {
      message.error('删除失败：' + error.message);
    }
  };

  const columns = [
    {
      title: '表单名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleString()
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (text) => new Date(text).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditForm(record.id)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个表单吗？"
            onConfirm={() => handleDeleteForm(record.id)}
            okText="是"
            cancelText="否"
          >
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="form-list-container">
      <div className="list-header">
        <h2>表单列表</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateForm}
        >
          新建表单
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={forms}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
      />
    </div>
  );
};
```

### 3.5 API调用

前端使用封装的API服务与后端通信：

```tsx
// src/services/api.ts
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { message } from 'antd';
import { store } from '@/store';
import { logout } from '@/store/slices/authSlice';

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error: AxiosError) => {
    if (error.response) {
      const { status, data } = error.response;

      // 未授权，可能是token过期
      if (status === 401) {
        store.dispatch(logout());
        message.error('登录已过期，请重新登录');
      }
      // 服务器错误
      else if (status >= 500) {
        message.error('服务器错误，请稍后再试');
      }
      // 客户端错误
      else {
        message.error((data as any)?.message || '请求失败');
      }
    } else if (error.request) {
      message.error('网络连接失败，请检查网络设置');
    } else {
      message.error('请求配置错误');
    }

    return Promise.reject(error);
  }
);

export default api;
