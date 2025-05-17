import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tabs, Button, Space, message, Spin, Typography, Modal, Form, Input, Row, Col } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, CheckOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { useMetaTables, useCompleteModel } from '../../hooks/features/data-models';
import {
  setCurrentMetaTable,
  addMetaTable,
  updateMetaTable,
  setModelLoading,
  setModelError
} from '../../store/slices/modelSlice';
import type { AppDispatch } from '../../store';
import TableEditor from '../../components/model-designer/TableEditor';
import ERDiagramEditor from '../../components/model-designer/ERDiagramEditor';
import ModelVersionControl from '../../components/model-designer/ModelVersionControl';
import FieldPropertiesPanel from '../../components/model-designer/FieldPropertiesPanel';
import { createEmptyModel } from '../../utils/modelUtils';
import type { Model, CreateMetaTableDto, UpdateMetaTableDto, ModelField } from '../../types/data-models';
import { TableStatus } from '../../types/data-models';

const { Title } = Typography;

const ModelEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { getMetaTable, createMetaTable, updateMetaTable: updateTable, loading: tablesLoading, error: tablesError } = useMetaTables();
  const { publishModel, createCompleteModel } = useCompleteModel();
  const [activeTab, setActiveTab] = useState('1');
  const [isEdited, setIsEdited] = useState(false);
  const [localModel, setLocalModel] = useState<Model | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<ModelField | null>(null);
  const [isFieldModalVisible, setIsFieldModalVisible] = useState(false);
  const [form] = Form.useForm();

  const isNewModel = !id || id === 'new';

  // 加载模型数据
  const fetchModelData = async () => {
    if (!isNewModel && id) {
      try {
        setLoading(true);
        dispatch(setModelLoading({ loading: true }));
        const response = await getMetaTable(id);
        if (response.code === 200 && response.data) {
          setLocalModel(response.data);
          // @ts-ignore - Model和MetaTable类型不完全兼容，但功能上是一致的
          dispatch(setCurrentMetaTable({ table: response.data }));
        } else {
          const errorMsg = response.error || '获取模型详情失败';
          setError(errorMsg);
          dispatch(setModelError({ error: errorMsg }));
          message.error(errorMsg);
        }
      } catch (err: any) {
        const errorMsg = err.message || '获取模型详情失败';
        setError(errorMsg);
        dispatch(setModelError({ error: errorMsg }));
        message.error(errorMsg);
      } finally {
        setLoading(false);
        dispatch(setModelLoading({ loading: false }));
      }
    } else {
      // 为新模型创建空模型
      // @ts-ignore - 类型可能不完全兼容，需要强制类型转换
      const emptyModel = createEmptyModel('default-tenant');
      // @ts-ignore - 类型可能不完全兼容
      setLocalModel(emptyModel);
    }
  };

  useEffect(() => {
    fetchModelData();
  }, [id, isNewModel]);

  // 同步输入框内容到localModel
  const handleModelInputChange = (key: keyof Model, value: string) => {
    if (!localModel) return;
    setLocalModel({ ...localModel, [key]: value });
    setIsEdited(true);
  };

  const handleSave = async () => {
    if (!localModel) return;
    // 校验必填项
    if (!localModel.name || !localModel.displayName) {
      message.error('请填写模型的技术名称和显示名称');
      return;
    }
    setSubmitting(true);
    try {
      if (isNewModel) {
        // 1. 组装模型参数
        const model = {
          name: localModel.name,
          displayName: localModel.displayName,
          description: localModel.description || '',
          isSystem: (localModel as any).isSystem ?? false,
          isSoftDelete: (localModel as any).isSoftDelete ?? false,
          isVersioned: (localModel as any).isVersioned ?? false,
          status: (localModel as any).status || TableStatus.DRAFT,
          tenant: localModel.tenantId || 'default-tenant',
          application: localModel.applicationId || '',
          auditFields: (localModel as any).auditFields ?? false,
          apiEnabled: (localModel as any).apiEnabled ?? false,
          customOptions: (localModel as any).customOptions || {},
        };
        // 2. 组装字段参数
        const fields = (localModel.fields || []).map((f, idx) => ({
          tableId: '', // 新建时可为空，后端自动填充
          name: f.name,
          displayName: f.displayName,
          description: f.description || '',
          type: f.type,
          isPrimaryKey: f.isPrimaryKey ?? false,
          isRequired: f.isRequired ?? false,
          isUnique: f.isUnique ?? false,
          isSystem: f.isSystem ?? false,
          isHidden: f.isHidden ?? false,
          ordinal: typeof f.order === 'number' ? f.order : idx,
          defaultValue: f.defaultValue,
          validationRules: f.validationRules || [],
          isSearchable: f.isSearchable ?? false,
          isSortable: f.isSortable ?? false,
          isFilterable: (f as any).isFilterable ?? false,
          isAggregatable: (f as any).isAggregatable ?? false,
          advancedSettings: (f as any).advancedSettings || {},
        }));
        // 3. 调用完整模型创建接口
        const response = await createCompleteModel(model, fields);
        if (response.code === 200 && response.data) {
          dispatch(addMetaTable({ table: response.data.table }));
          message.success('模型创建成功');
          navigate('/models');
        } else {
          message.error(response.error || '创建模型失败');
        }
      } else if (id) {
        // 更新已有模型
        const updateRequest: UpdateMetaTableDto = {
          displayName: localModel.displayName,
          description: localModel.description || ''
          // 注意：根据定义，UpdateMetaTableDto 可能不包含name和version字段
        };

        const response = await updateTable(id, updateRequest);
        if (response.code === 200 && response.data) {
          // @ts-ignore - Model和MetaTable类型不完全兼容
          dispatch(updateMetaTable({ table: response.data }));
          message.success('模型保存成功');
          setIsEdited(false);
        } else {
          message.error(response.error || '更新模型失败');
        }
      }
    } catch (error: any) {
      message.error(error.message || '保存失败');
      console.error('保存模型失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (!id) return;

    try {
      setSubmitting(true);
      const response = await publishModel(id);
      if (response.code === 200) {
        message.success('模型发布成功');
      } else {
        message.error(response.error || '发布失败');
      }
    } catch (error: any) {
      message.error(error.message || '发布失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleModelUpdate = (updatedModel: any) => {
    // @ts-ignore - 类型可能不完全兼容
    setLocalModel(updatedModel);
    setIsEdited(true);
  };

  // 处理字段选择，打开弹窗
  const handleFieldSelect = (field: any) => {
    setSelectedField(field);
    setIsFieldModalVisible(true);
  };

  // 处理字段更新
  const handleFieldUpdate = (updatedField: any) => {
    if (!localModel) return;
    const updatedFields = localModel.fields.map(field =>
      field.id === updatedField.id ? updatedField : field
    );
    const updatedModel = { ...localModel, fields: updatedFields };
    // @ts-ignore - 类型可能不完全兼容
    setLocalModel(updatedModel);
    setSelectedField(updatedField);
    setIsEdited(true);
  };

  // 确认字段编辑并关闭弹窗
  const handleFieldEditConfirm = () => {
    message.success('字段属性已更新');
    setIsFieldModalVisible(false);
  };

  // 关闭字段属性弹窗
  const handleFieldModalClose = () => {
    setIsFieldModalVisible(false);
  };

  // 处理版本还原
  const handleRestoreVersion = (versionId: string) => {
    message.info(`还原到版本 ${versionId}`);
    // 实际应用中需要调用后端API还原版本
  };

  // 处理保存版本
  const handleSaveVersion = (version: any) => {
    message.info(`保存版本 ${version.name}`);
    // 实际应用中需要调用后端API保存版本
  };

  // 如果正在加载，显示加载状态
  if (!localModel || (!isNewModel && (loading || tablesLoading))) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="large" />
      </div>
    );
  }

  // 如果有错误，显示错误信息
  if (!isNewModel && (error || tablesError)) {
    return (
      <Card>
        <div style={{ textAlign: 'center' }}>
          <Title level={4} type="danger">加载失败</Title>
          <p>{error || tablesError}</p>
          <Button type="primary" onClick={() => navigate('/models')}>返回列表</Button>
        </div>
      </Card>
    );
  }

  // 顶部表单区域
  const renderModelBaseInfo = () => (
    <Form
      layout="inline"
      style={{ marginBottom: 24 }}
      form={form}
      initialValues={{
        name: localModel.name,
        displayName: localModel.displayName
      }}
    >
      <Form.Item
        label="技术名称"
        name="name"
        rules={[{ required: true, message: '请输入技术名称' }]}
      >
        <Input
          placeholder="请输入技术名称（英文、下划线）"
          value={localModel.name}
          onChange={e => handleModelInputChange('name', e.target.value)}
          style={{ width: 220 }}
        />
      </Form.Item>
      <Form.Item
        label="显示名称"
        name="displayName"
        rules={[{ required: true, message: '请输入显示名称' }]}
      >
        <Input
          placeholder="请输入显示名称"
          value={localModel.displayName}
          onChange={e => handleModelInputChange('displayName', e.target.value)}
          style={{ width: 220 }}
        />
      </Form.Item>
    </Form>
  );

  // 准备Tab项配置
  const tabItems = [
    {
      key: '1',
      label: '表格编辑器',
      children: (
        <TableEditor
          // @ts-ignore - Model和MetaTable类型不完全兼容
          model={localModel}
          // @ts-ignore - 类型不兼容，使用ts-ignore忽略
          onFieldSelect={handleFieldSelect}
          // @ts-ignore - Model和MetaTable类型不完全兼容
          onModelUpdate={handleModelUpdate}
        />
      ),
    },
    {
      key: '2',
      label: 'ER图编辑器',
      children: (
        <ERDiagramEditor
          // @ts-ignore - Model和MetaTable类型不完全兼容
          model={localModel}
          // @ts-ignore - 类型不兼容，使用ts-ignore忽略
          onFieldSelect={handleFieldSelect}
          // @ts-ignore - Model和MetaTable类型不完全兼容
          onModelUpdate={handleModelUpdate}
        />
      ),
    },
  ];

  // 如果不是新模型，添加版本控制选项卡
  if (!isNewModel) {
    tabItems.push({
      key: '3',
      label: '版本控制',
      children: (
        <ModelVersionControl
          // @ts-ignore - Model和MetaTable类型不完全兼容
          model={localModel}
          versions={[]}
          onSaveVersion={handleSaveVersion}
          onRestoreVersion={handleRestoreVersion}
          modelId={id}
        />
      ),
    });
  }

  return (
    <>
      <Card
        className="model-editor"
        title={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/models')}
              type="text"
            />
            <Title level={4} style={{ margin: 0 }}>
              {isNewModel ? '创建新模型' : `编辑模型: ${localModel?.displayName || ''}`}
            </Title>
          </Space>
        }
        extra={
          <Space>
            <Button
              onClick={handleSave}
              type="primary"
              icon={<SaveOutlined />}
              disabled={!isEdited || submitting}
              loading={submitting}
            >
              保存
            </Button>
            {!isNewModel && (
              <Button
                onClick={handlePublish}
                type="primary"
                icon={<CheckOutlined />}
                loading={submitting}
              >
                发布
              </Button>
            )}
          </Space>
        }
      >
        {renderModelBaseInfo()}
        <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabItems} />
      </Card>

      {/* 字段属性编辑弹窗 */}
      <Modal
        title="编辑字段属性"
        open={isFieldModalVisible}
        onCancel={handleFieldModalClose}
        footer={[
          <Button key="cancel" onClick={handleFieldModalClose}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handleFieldEditConfirm}>
            确认
          </Button>
        ]}
        width={700}
        destroyOnClose
      >
        {selectedField && (
          <FieldPropertiesPanel
            // @ts-ignore - 类型可能不完全兼容
            field={selectedField}
            // @ts-ignore - 类型可能不完全兼容
            onFieldUpdate={handleFieldUpdate}
          />
        )}
      </Modal>
    </>
  );
};

export default ModelEditor;
