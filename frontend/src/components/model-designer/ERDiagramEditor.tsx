import React, { useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Edge,
  MiniMap,
  Node,
  addEdge,
  Position,
  useEdgesState,
  useNodesState,
  MarkerType,
  Connection,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, Typography, Empty, Spin, Button, message, Tooltip, Space, Select } from 'antd';
import { ZoomInOutlined, ZoomOutOutlined, CompressOutlined, ExpandOutlined, ReloadOutlined, FullscreenOutlined } from '@ant-design/icons';
import { Model, ModelField, ModelRelation, ModelRelationType } from '../../types/model-types';
import RelationshipEditor from './RelationshipEditor';

const { Title, Text } = Typography;
const { Option } = Select;

interface ERDiagramEditorProps {
  models: Model[];
  relationships: ModelRelation[];
  onRelationshipsChange?: (relationships: ModelRelation[]) => void;
  currentModelId?: string;
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
  models,
  relationships,
  onRelationshipsChange,
  currentModelId,
  readOnly = false,
}) => {
  const flowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const reactFlowInstance = useReactFlow();

  // 初始化图表数据
  useEffect(() => {
    if (models.length === 0) {
      setLoading(false);
      return;
    }

    // 创建节点
    const flowNodes: Node[] = [];
    const gridSize = Math.ceil(Math.sqrt(models.length));
    const nodeWidth = 220;
    const nodeHeight = 300;
    const spacingX = 300;
    const spacingY = 350;

    models.forEach((model, index) => {
      // 计算网格位置
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;

      // 如果是当前模型，放在中心位置
      let x = col * spacingX;
      let y = row * spacingY;

      if (model.id === currentModelId) {
        x = gridSize * spacingX / 2;
        y = gridSize * spacingY / 2;
      }

      // 创建节点
      flowNodes.push({
        id: model.id,
        type: 'modelNode',
        position: { x, y },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          label: model.displayName || model.name,
          fields: model.fields.map((field) => ({
            id: field.id,
            name: field.name,
            type: field.type,
            isPrimaryKey: field.isPrimaryKey,
            isRequired: field.isRequired,
          })),
        },
        style: {
          width: nodeWidth,
          border: model.id === currentModelId ? '2px solid #1890ff' : '1px solid #d9d9d9',
          borderRadius: '4px',
          background: '#fff',
        },
      });
    });

    // 创建边
    const flowEdges: Edge[] = relationships.map((rel) => {
      let label = '';
      let type = '';

      switch (rel.type) {
        case 'oneToOne':
          label = '1:1';
          type = 'one-to-one';
          break;
        case 'oneToMany':
          label = '1:N';
          type = 'one-to-many';
          break;
        case 'manyToOne':
          label = 'N:1';
          type = 'many-to-one';
          break;
        case 'manyToMany':
          label = 'N:N';
          type = 'many-to-many';
          break;
      }

      return {
        id: rel.id,
        source: rel.sourceModelId,
        target: rel.targetModelId,
        label: label,
        type: 'default',
        animated: false,
        style: { stroke: '#666' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 15,
          height: 15,
          color: '#666',
        },
        data: {
          relationType: rel.type,
          displayName: rel.displayName,
          sourceField: rel.sourceField,
          targetField: rel.targetField,
        },
      };
    });

    setNodes(flowNodes);
    setEdges(flowEdges);
    setLoading(false);
  }, [models, relationships, currentModelId, setNodes, setEdges]);

  // 处理边连接
  const onConnect = (params: Connection) => {
    // 只读模式不允许添加连接
    if (readOnly || !onRelationshipsChange) return;

    // 检查是否已存在相同的连接
    const existingEdge = edges.find(
      (edge) => edge.source === params.source && edge.target === params.target
    );

    if (existingEdge) {
      message.warning('关系已存在');
      return;
    }

    // 创建新的关系
    const sourceModel = models.find((model) => model.id === params.source);
    const targetModel = models.find((model) => model.id === params.target);

    if (!sourceModel || !targetModel) {
      message.error('无法创建关系：找不到源模型或目标模型');
      return;
    }

    // 默认为多对一关系
    const newRelationship: ModelRelation = {
      id: `rel_${Date.now()}`,
      sourceModelId: sourceModel.id,
      targetModelId: targetModel.id,
      type: 'manyToOne',
      name: `${sourceModel.name}_${targetModel.name}`,
      displayName: `所属${targetModel.displayName || targetModel.name}`,
      // 默认使用主键作为关联字段
      sourceField: '',
      targetField: targetModel.fields.find((f) => f.isPrimaryKey)?.name || 'id',
    };

    // 更新关系
    onRelationshipsChange([...relationships, newRelationship]);

    // 更新边
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
            displayName: newRelationship.displayName,
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
  if (models.length === 0) {
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
      <Spin spinning={loading} tip="加载中...">
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

      <style jsx>{`
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
      `}</style>
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
