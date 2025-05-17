import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tooltip,
  Typography,
  Popconfirm,
  Switch,
  Tag,
  message,
  Spin
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import type { Model, ModelField } from '../../types/data-models';
import { getFieldTypeDisplayName, createEmptyField } from '../../utils/modelUtils';
import { useMetaFields } from '../../hooks/features/data-models';

const { Text } = Typography;

interface TableEditorProps {
  model: Model | null;
  onFieldSelect: (field: ModelField) => void;
  onModelUpdate: (model: Model) => void;
  readOnly?: boolean;
}

/**
 * 表格形式的模型编辑器
 */
const TableEditor: React.FC<TableEditorProps> = ({
  model,
  onFieldSelect,
  onModelUpdate,
  readOnly = false
}) => {
  // 当前选中的字段ID
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  useEffect(() => {
    console.log('TableEditor渲染：', { model, readOnly });
  }, [model, readOnly]);

  // 如果模型不存在，显示加载或空状态
  if (!model) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Spin tip="初始化模型..." />
      </div>
    );
  }

  // 添加新字段
  const handleAddField = () => {
    console.log('添加字段');
    // 计算新字段的顺序值
    const maxOrder = model.fields.reduce((max, field) => Math.max(max, field.order), -1);
    const newField = createEmptyField(maxOrder + 1);

    // 更新模型
    const updatedFields = [...model.fields, newField];
    // @ts-ignore - types/data-models和types/model-types中的ModelField类型不兼容
    const updatedModel = { ...model, fields: updatedFields };
    onModelUpdate(updatedModel);

    // 选中新字段
    setSelectedFieldId(newField.id);
    // @ts-ignore - types/data-models和types/model-types中的ModelField类型不兼容
    onFieldSelect(newField);

    message.success('字段已添加');
  };

  // 删除字段
  const handleDeleteField = (fieldId: string) => {
    console.log('删除字段', fieldId);

    // 检查是否是主键
    const field = model.fields.find(f => f.id === fieldId);
    if (field?.isPrimaryKey) {
      message.error('不能删除主键字段');
      return;
    }

    // 更新模型
    const updatedFields = model.fields.filter(field => field.id !== fieldId);
    const updatedModel = { ...model, fields: updatedFields };
    onModelUpdate(updatedModel);

    // 如果删除的是当前选中的字段，重置选中状态
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }

    message.success('字段已删除');
  };

  // 移动字段顺序
  const handleMoveField = (fieldId: string, direction: 'up' | 'down') => {
    console.log('移动字段', { fieldId, direction });

    const fieldIndex = model.fields.findIndex(field => field.id === fieldId);
    if (fieldIndex === -1) {
      console.log('找不到字段', fieldId);
      return;
    }

    // 主键字段始终在第一位
    if (direction === 'up' && (fieldIndex <= 1 || model.fields[fieldIndex - 1]?.isPrimaryKey)) {
      console.log('无法上移：已在顶部或前一个是主键');
      message.info('字段已经在顶部或前一个是主键');
      return;
    }

    // 最后一个字段不能再往下移
    if (direction === 'down' && fieldIndex >= model.fields.length - 1) {
      console.log('无法下移：已在底部');
      message.info('字段已经在底部');
      return;
    }

    // 计算目标索引
    const targetIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1;

    // 创建字段副本
    const fields = [...model.fields];

    // 交换字段
    [fields[fieldIndex], fields[targetIndex]] = [fields[targetIndex], fields[fieldIndex]];

    // 更新顺序值
    fields.forEach((field, index) => {
      if (!field.isPrimaryKey) {
        field.order = index;
      }
    });

    // 更新模型
    const updatedModel = { ...model, fields };
    onModelUpdate(updatedModel);

    message.success(`字段已${direction === 'up' ? '上移' : '下移'}`);
  };

  // 更新单个字段属性
  const handleUpdateFieldAttribute = (fieldId: string, attribute: string, value: any) => {
    console.log('更新字段属性', { fieldId, attribute, value });

    const updatedFields = model.fields.map(field => {
      if (field.id === fieldId) {
        return { ...field, [attribute]: value };
      }
      return field;
    });

    const updatedModel = { ...model, fields: updatedFields };
    onModelUpdate(updatedModel);
  };

  // 表格列定义
  const columns: ColumnsType<ModelField> = [
    {
      title: '字段名称',
      dataIndex: 'displayName',
      key: 'displayName',
      render: (text: string, record) => (
        <Space>
          {text || '未命名字段'}
          {record.isPrimaryKey && <Tag color="blue">主键</Tag>}
          {record.isSystem && <Tag color="green">系统</Tag>}
        </Space>
      ),
    },
    {
      title: '技术名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text code>{text}</Text>,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => getFieldTypeDisplayName(type),
    },
    {
      title: '必填',
      dataIndex: 'isRequired',
      key: 'isRequired',
      width: 80,
      render: (isRequired: boolean, record) => (
        <Switch
          checked={isRequired}
          size="small"
          disabled={readOnly || record.isPrimaryKey}
          onChange={(checked) => handleUpdateFieldAttribute(record.id, 'isRequired', checked)}
        />
      ),
    },
    {
      title: '唯一',
      dataIndex: 'isUnique',
      key: 'isUnique',
      width: 80,
      render: (isUnique: boolean, record) => (
        <Switch
          checked={isUnique}
          size="small"
          disabled={readOnly || record.isPrimaryKey}
          onChange={(checked) => handleUpdateFieldAttribute(record.id, 'isUnique', checked)}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="编辑字段">
            <Button
              icon={<EditOutlined />}
              type="text"
              size="small"
              disabled={readOnly}
              onClick={() => {
                console.log('点击编辑字段', record.id);
                setSelectedFieldId(record.id);
                onFieldSelect(record);
              }}
            />
          </Tooltip>

          <Tooltip title="上移">
            <Button
              icon={<ArrowUpOutlined />}
              type="text"
              size="small"
              disabled={readOnly || record.isPrimaryKey}
              onClick={(e) => {
                console.log('点击上移字段', record.id);
                e.stopPropagation();
                handleMoveField(record.id, 'up');
              }}
            />
          </Tooltip>

          <Tooltip title="下移">
            <Button
              icon={<ArrowDownOutlined />}
              type="text"
              size="small"
              disabled={readOnly || record.isPrimaryKey}
              onClick={(e) => {
                console.log('点击下移字段', record.id);
                e.stopPropagation();
                handleMoveField(record.id, 'down');
              }}
            />
          </Tooltip>

          {!record.isPrimaryKey && !record.isSystem && (
            <Popconfirm
              title="确定删除此字段吗？"
              onConfirm={() => handleDeleteField(record.id)}
              okText="确定"
              cancelText="取消"
              disabled={readOnly}
            >
              <Tooltip title="删除字段">
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  type="text"
                  size="small"
                  disabled={readOnly}
                  onClick={(e) => {
                    console.log('点击删除字段按钮', record.id);
                    e.stopPropagation();
                  }}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // 行点击事件处理
  const handleRowClick = (record: ModelField) => {
    console.log('点击字段行', record.id);
    setSelectedFieldId(record.id);
    onFieldSelect(record);
  };

  // 渲染Footer，添加字段按钮
  const renderFooter = () => (
    <div style={{ textAlign: 'center', padding: '12px 0' }}>
      <Button
        type="dashed"
        onClick={handleAddField}
        icon={<PlusOutlined />}
        disabled={readOnly}
        style={{ width: '100%' }}
      >
        添加字段
      </Button>
    </div>
  );

  return (
    <div className="table-editor">
      <Table
        rowKey="id"
        dataSource={model.fields}
        columns={columns}
        footer={renderFooter}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          className: selectedFieldId === record.id ? 'selected-row' : ''
        })}
        rowClassName={(record) =>
          selectedFieldId === record.id ? 'selected-row' : ''
        }
        pagination={false}
      />
      <style>
        {`
          .table-editor .selected-row {
            background-color: #e6f7ff;
          }
        `}
      </style>
    </div>
  );
};

export default TableEditor;
