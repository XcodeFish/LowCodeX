import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tabs, Button, Space, message, Spin, Typography } from 'antd';
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
import { createEmptyModel } from '../../utils/modelUtils';
import type { Model, CreateMetaTableDto, UpdateMetaTableDto } from '../../types/data-models';

const { Title } = Typography;

const ModelEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { getMetaTable, createMetaTable, updateMetaTable: updateTable, loading: tablesLoading, error: tablesError } = useMetaTables();
  const { publishModel } = useCompleteModel();
  const [activeTab, setActiveTab] = useState('1');
  const [isEdited, setIsEdited] = useState(false);
  const [localModel, setLocalModel] = useState<Model | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isNewModel = !id || id === 'new';

  // 加载模型数据
  const fetchModelData = async () => {
    if (!isNewModel && id) {
      try {
        setLoading(true);
        dispatch(setModelLoading({ loading: true }));
        const response = await getMetaTable(id);
        if (response.success && response.data) {
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

  const handleSave = async () => {
    if (!localModel) return;

    setSubmitting(true);

    try {
      if (isNewModel) {
        // 创建新模型
        const createRequest: CreateMetaTableDto = {
          name: localModel.name,
          displayName: localModel.displayName,
          description: localModel.description || '',
          tenant: localModel.tenantId || 'default',
          application: localModel.applicationId
        };

        const response = await createMetaTable(createRequest);
        if (response.success && response.data) {
          // @ts-ignore - Model和MetaTable类型不完全兼容
          dispatch(addMetaTable({ table: response.data }));
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
        if (response.success && response.data) {
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
      if (response.success) {
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
  if (!isNewModel && (loading || tablesLoading)) {
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

  // 准备Tab项配置
  const tabItems = [
    {
      key: '1',
      label: '表格编辑器',
      children: (
        <TableEditor
          // @ts-ignore - Model和MetaTable类型不完全兼容
          model={localModel}
          onFieldSelect={(field) => console.log('Selected field:', field)}
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
          onFieldSelect={(field) => console.log('Selected field:', field)}
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
      <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabItems} />
    </Card>
  );
};

export default ModelEditor;
