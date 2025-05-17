import React, { useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  Position,
  useEdgesState,
  useNodesState,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import type { Connection, Edge, Node } from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, Empty, Spin, Button, message, Tooltip, Space, Select } from 'antd';
import { ZoomInOutlined, ZoomOutOutlined, CompressOutlined } from '@ant-design/icons';
import type { Model, ModelField, ModelRelation, ModelRelationType } from '../../types/model-types';
import { useVisualDesigner } from '../../hooks/features/data-models';

interface ERDiagramEditorProps {
  model: Model | null;
  onFieldSelect: (field: ModelField) => void;
  onModelUpdate: (model: Model) => void;
  readOnly?: boolean;
}

// 自定义模型节点组件
const ModelNode = ({ data }: { data: any }) => {
  return (
    <div className="model-node">
      <div className="model-node-header">
        <strong>{data.label}</strong>
      </div>
      <div className="model-node-body">
        {data.fields.map((field: any) => (
          <div key={field.id} className="model-node-field">
            <div
              className={`field-name ${field.isPrimaryKey ? 'is-primary' : ''} ${
                field.isRequired ? 'is-required' : ''
              }`}
            >
              {field.isPrimaryKey && '🔑 '}
              {field.name}
            </div>
            <div className="field-type">{field.type}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 节点类型定义
const nodeTypes = {
  modelNode: ModelNode,
};

/**
 * ER图编辑器组件
 */
const ERDiagramEditor: React.FC<ERDiagramEditorProps> = ({
  model,
  onFieldSelect,
  onModelUpdate,
  readOnly = false,
}) => {
  const flowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const reactFlowInstance = useReactFlow();

  // 初始化图表数据
  useEffect(() => {
    if (!model) {
      setLoading(false);
      return;
    }

    // 创建节点
    const flowNodes: Node[] = [];
    const gridSize = Math.ceil(Math.sqrt(model.fields.length));
    const nodeWidth = 220;
    const nodeHeight = 300;
    const spacingX = 300;
    const spacingY = 350;

    model.fields.forEach((field, index) => {
      // 计算网格位置
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;

      // 创建节点
      flowNodes.push({
        id: field.id,
        type: 'modelNode',
        position: { x: col * spacingX, y: row * spacingY },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          label: field.name,
          fields: [field],
        },
        style: {
          width: nodeWidth,
          border: field.isPrimaryKey ? '2px solid #1890ff' : '1px solid #d9d9d9',
          borderRadius: '4px',
          background: '#fff',
        },
      });
    });

    // 创建边
    const flowEdges: Edge[] = [];

    setNodes(flowNodes);
    setEdges(flowEdges);
    setLoading(false);
  }, [model, setNodes, setEdges]);

  // 处理边连接
  const onConnect = (params: Connection) => {
    // 必要的安全检查
    if (readOnly || !model) return;

    // 检查是否已存在相同的连接
    const existingEdge = edges.find(
      (edge) => edge.source === params.source && edge.target === params.target
    );

    if (existingEdge) {
      message.warning('关系已存在');
      return;
    }

    // 查找源字段和目标字段
    const sourceField = model.fields.find((f) => f.id === params.source);
    const targetField = model.fields.find((f) => f.id === params.target);

    if (!sourceField || !targetField) {
      message.error('无法创建关系：找不到源字段或目标字段');
      return;
    }

    // 创建新的关系 (注意：这个关系对象会发送到API，但不会直接添加到model对象)
    const newRelation: ModelRelation = {
      id: `rel_${Date.now()}`,
      sourceModelId: model.id,
      targetModelId: model.id,
      type: 'manyToOne',
      name: `${model.name}_${model.name}`,
      displayName: `所属${model.name}`,
      sourceField: sourceField.id,
      targetField: targetField.id,
    };

    // 直接通知父组件模型已更新，不修改Model类型
    // 关系处理应在父组件或专门的关系服务中进行
    onModelUpdate(model);

    // TODO: 实际应用中会有API调用来保存关系
    // 例如: modelService.createRelation(model.id, newRelation);

    // 更新边 - 仅用于视觉显示
    setEdges((eds) =>
      addEdge(
        {
          ...params,
          type: 'default',
          animated: false,
          label: 'N:1',
          style: { stroke: '#666' },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: '#666',
          },
          data: {
            relationType: 'manyToOne',
            displayName: newRelation.displayName,
          },
        },
        eds
      )
    );

    message.success('已创建多对一关系，请在关系编辑器中完善详细信息');
  };

  // 获取关系类型图标
  const getRelationTypeIcon = (type: ModelRelationType) => {
    switch (type) {
      case 'oneToOne':
        return '1:1';
      case 'oneToMany':
        return '1:N';
      case 'manyToOne':
        return 'N:1';
      case 'manyToMany':
        return 'N:N';
      default:
        return type;
    }
  };

  // 自适应画布
  const fitView = () => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2 });
    }
  };

  // 缩放控制
  const zoomIn = () => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomIn();
    }
  };

  const zoomOut = () => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomOut();
    }
  };

  // 当模型数据为空时显示提示
  if (!model) {
    return (
      <Card title="ER图编辑器" className="er-diagram-card">
        <Empty description="没有可用的数据模型" />
      </Card>
    );
  }

  return (
    <Card
      title="ER图编辑器"
      className="er-diagram-card"
      extra={
        <Space>
          <Tooltip title="放大">
            <Button icon={<ZoomInOutlined />} onClick={zoomIn} />
          </Tooltip>
          <Tooltip title="缩小">
            <Button icon={<ZoomOutOutlined />} onClick={zoomOut} />
          </Tooltip>
          <Tooltip title="适应画布">
            <Button icon={<CompressOutlined />} onClick={fitView} />
          </Tooltip>
        </Space>
      }
    >
      <Spin spinning={loading}>
        <div className="er-diagram-container" ref={flowWrapper} style={{ height: 600 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-right"
            minZoom={0.1}
            maxZoom={2}
            defaultEdgeOptions={{
              animated: false,
              type: 'default',
            }}
          >
            <Controls showInteractive={false} />
            <MiniMap
              nodeStrokeWidth={3}
              zoomable
              pannable
            />
            <Background color="#aaa" gap={16} />
          </ReactFlow>
        </div>
      </Spin>

      {/* 使用普通style标签添加CSS */}
      <style>
        {`
        .model-node {
          border: 1px solid #ccc;
          border-radius: 4px;
          background: white;
          width: 100%;
          height: 100%;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .model-node-header {
          background: #f0f0f0;
          padding: 8px;
          border-bottom: 1px solid #ccc;
          font-weight: bold;
        }

        .model-node-body {
          padding: 8px;
          overflow-y: auto;
          flex: 1;
        }

        .model-node-field {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 12px;
          padding: 2px 0;
          border-bottom: 1px dashed #eee;
        }

        .field-name {
          font-weight: normal;
        }

        .field-name.is-primary {
          font-weight: bold;
          color: #1890ff;
        }

        .field-name.is-required:after {
          content: '*';
          color: #f5222d;
          margin-left: 2px;
        }

        .field-type {
          color: #888;
          font-size: 11px;
        }
        `}
      </style>
    </Card>
  );
};

// 包装组件以提供ReactFlow上下文
const ERDiagramEditorWrapper: React.FC<ERDiagramEditorProps> = (props) => {
  return (
    <ReactFlowProvider>
      <ERDiagramEditor {...props} />
    </ReactFlowProvider>
  );
};

export default ERDiagramEditorWrapper;
