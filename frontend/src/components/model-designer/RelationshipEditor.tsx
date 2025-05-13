import React, { useState } from 'react';
import {
  Table,
  Button,
  Select,
  Space,
  Popconfirm,
  Typography,
  Form,
  Input,
  Modal,
  message,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import type { Model, ModelRelation, ModelRelationType } from '../../types/model-types';
const { Option } = Select;

interface RelationshipEditorProps {
  currentModel: Model;
  allModels: Model[];
  relationships: ModelRelation[];
  onRelationshipsChange: (relationships: ModelRelation[]) => void;
  readOnly?: boolean;
}

/**
 * 模型关系编辑器组件
 */
const RelationshipEditor: React.FC<RelationshipEditorProps> = ({
  currentModel,
  allModels,
  relationships,
  onRelationshipsChange,
  readOnly = false,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRelationship, setEditingRelationship] = useState<ModelRelation | null>(null);
  const [form] = Form.useForm();

  // 清除编辑状态
  const resetEditing = () => {
    setEditingRelationship(null);
    form.resetFields();
  };

  // 打开创建关系模态框
  const showCreateModal = () => {
    resetEditing();
    setIsModalVisible(true);
  };

  // 打开编辑关系模态框
  const showEditModal = (relationship: ModelRelation) => {
    setEditingRelationship(relationship);
    form.setFieldsValue({
      ...relationship,
      displayName: relationship.displayName || '',
    });
    setIsModalVisible(true);
  };

  // 关闭模态框
  const handleCancel = () => {
    resetEditing();
    setIsModalVisible(false);
  };

  // 保存关系
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (editingRelationship) {
        // 更新已有关系
        const updatedRelationships = relationships.map(r =>
          r.id === editingRelationship.id ? { ...r, ...values } : r
        );
        onRelationshipsChange(updatedRelationships);
      } else {
        // 创建新关系
        const newRelationship: ModelRelation = {
          id: `rel_${Date.now()}`,
          sourceModelId: currentModel.id,
          ...values,
        };

        // 检查是否已存在相同的关系
        const exists = relationships.some(r =>
          r.sourceModelId === newRelationship.sourceModelId &&
          r.targetModelId === newRelationship.targetModelId &&
          r.sourceField === newRelationship.sourceField
        );

        if (exists) {
          message.error('已存在相同的关系定义');
          return;
        }

        onRelationshipsChange([...relationships, newRelationship]);
      }

      handleCancel();
      message.success(`${editingRelationship ? '更新' : '创建'}关系成功`);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 删除关系
  const handleDelete = (relationshipId: string) => {
    const updatedRelationships = relationships.filter(r => r.id !== relationshipId);
    onRelationshipsChange(updatedRelationships);
    message.success('删除关系成功');
  };

  // 获取字段选项
  const getFieldOptions = (modelId: string) => {
    const model = allModels.find(m => m.id === modelId);
    if (!model) return [];

    return model.fields.map(field => (
      <Option key={field.id} value={field.name}>
        {field.displayName || field.name}
      </Option>
    ));
  };

  // 获取关系类型的显示名称
  const getRelationTypeDisplayName = (type: ModelRelationType) => {
    const typeMap: Record<ModelRelationType, string> = {
      oneToOne: '一对一',
      oneToMany: '一对多',
      manyToOne: '多对一',
      manyToMany: '多对多',
    };

    return typeMap[type] || type;
  };

  // 获取目标模型的选项
  const getTargetModelOptions = () => {
    return allModels
      .filter(model => model.id !== currentModel.id)
      .map(model => (
        <Option key={model.id} value={model.id}>
          {model.displayName || model.name}
        </Option>
      ));
  };

  // 当选择的关系类型变化时
  const handleRelationTypeChange = (value: ModelRelationType) => {
    // 根据关系类型设置默认显示名称
    const targetModelId = form.getFieldValue('targetModelId');
    if (!targetModelId) return;

    const targetModel = allModels.find(m => m.id === targetModelId);
    if (!targetModel) return;

    // 构建合适的显示名称
    let displayName = '';
    switch (value) {
      case 'oneToOne':
        displayName = `关联${targetModel.displayName}`;
        break;
      case 'oneToMany':
        displayName = `${targetModel.displayName}列表`;
        break;
      case 'manyToOne':
        displayName = `所属${targetModel.displayName}`;
        break;
      case 'manyToMany':
        displayName = `关联的${targetModel.displayName}`;
        break;
    }

    form.setFieldValue('displayName', displayName);
  };

  // 当选择的目标模型变化时
  const handleTargetModelChange = (value: string) => {
    // 更新关系显示名称
    const relationType = form.getFieldValue('relationType');
    if (!relationType) return;

    const targetModel = allModels.find(m => m.id === value);
    if (!targetModel) return;

    // 构建合适的显示名称
    let displayName = '';
    switch (relationType) {
      case 'oneToOne':
        displayName = `关联${targetModel.displayName}`;
        break;
      case 'oneToMany':
        displayName = `${targetModel.displayName}列表`;
        break;
      case 'manyToOne':
        displayName = `所属${targetModel.displayName}`;
        break;
      case 'manyToMany':
        displayName = `关联的${targetModel.displayName}`;
        break;
    }

    form.setFieldValue('displayName', displayName);

    // 重置字段选择
    form.setFieldValue('sourceField', undefined);
    form.setFieldValue('targetField', undefined);
  };

  // 获取模型名称
  const getModelName = (modelId: string) => {
    const model = allModels.find(m => m.id === modelId);
    return model ? (model.displayName || model.name) : modelId;
  };

  // 表格列定义
  const columns = [
    {
      title: '关系名称',
      dataIndex: 'displayName',
      key: 'displayName',
      render: (text: string, record: ModelRelation) => (
        <span>
          {text || `${getModelName(record.sourceModelId)} -> ${getModelName(record.targetModelId)}`}
        </span>
      ),
    },
    {
      title: '关系类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: ModelRelationType) => getRelationTypeDisplayName(type),
    },
    {
      title: '源模型',
      dataIndex: 'sourceModelId',
      key: 'sourceModelId',
      render: (modelId: string) => getModelName(modelId),
    },
    {
      title: '源字段',
      dataIndex: 'sourceField',
      key: 'sourceField',
    },
    {
      title: '目标模型',
      dataIndex: 'targetModelId',
      key: 'targetModelId',
      render: (modelId: string) => getModelName(modelId),
    },
    {
      title: '目标字段',
      dataIndex: 'targetField',
      key: 'targetField',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ModelRelation) => (
        <Space size="small">
          {!readOnly && (
            <>
              <Button
                icon={<EditOutlined />}
                type="text"
                onClick={() => showEditModal(record)}
              />
              <Popconfirm
                title="确定删除此关系？"
                onConfirm={() => handleDelete(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  type="text"
                />
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="relationship-editor">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography.Title level={5} style={{ margin: 0 }}>
          <LinkOutlined /> 模型关系
        </Typography.Title>
        {!readOnly && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showCreateModal}
          >
            添加关系
          </Button>
        )}
      </div>

      <Table
        dataSource={relationships.filter(r => r.sourceModelId === currentModel.id)}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={false}
      />

      <Modal
        title={`${editingRelationship ? '编辑' : '创建'}关系`}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={handleCancel}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            relationType: 'manyToOne',
          }}
        >
          <Form.Item
            name="type"
            label="关系类型"
            rules={[{ required: true, message: '请选择关系类型' }]}
          >
            <Select
              onChange={handleRelationTypeChange}
              placeholder="选择关系类型"
            >
              <Option value="oneToOne">一对一 (One-to-One)</Option>
              <Option value="oneToMany">一对多 (One-to-Many)</Option>
              <Option value="manyToOne">多对一 (Many-to-One)</Option>
              <Option value="manyToMany">多对多 (Many-to-Many)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="targetModelId"
            label="目标模型"
            rules={[{ required: true, message: '请选择目标模型' }]}
          >
            <Select
              placeholder="选择目标模型"
              onChange={handleTargetModelChange}
            >
              {getTargetModelOptions()}
            </Select>
          </Form.Item>

          <Form.Item
            name="displayName"
            label="关系名称"
            tooltip="显示名称，用于在界面上展示"
          >
            <Input placeholder="例如：所属部门、用户列表" />
          </Form.Item>

          <Form.Item
            name="sourceField"
            label="源模型字段"
            tooltip="当前模型中用于关联的字段"
          >
            <Select
              placeholder="选择字段"
            >
              {getFieldOptions(currentModel.id)}
            </Select>
          </Form.Item>

          <Form.Item
            name="targetField"
            label="目标模型字段"
            dependencies={['targetModelId']}
            tooltip="目标模型中用于关联的字段"
          >
            <Select
              placeholder="选择字段"
              disabled={!form.getFieldValue('targetModelId')}
            >
              {form.getFieldValue('targetModelId') ?
                getFieldOptions(form.getFieldValue('targetModelId')) : []}
            </Select>
          </Form.Item>

          <Form.Item
            name="cascadeDelete"
            label="级联删除"
            valuePropName="checked"
            tooltip="删除主记录时是否级联删除关联记录"
          >
            <Select>
              <Option value={true}>是</Option>
              <Option value={false}>否</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RelationshipEditor;
