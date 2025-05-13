import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tabs, Button, Space, message, Spin, Typography } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, CheckOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchModelById, createModel, updateModel } from '../../store/slices/modelSlice';
import type { AppDispatch, RootState } from '../../store';
import TableEditor from '../../components/model-designer/TableEditor';
import ERDiagramEditor from '../../components/model-designer/ERDiagramEditor';
import ModelVersionControl from '../../components/model-designer/ModelVersionControl';
import { createEmptyModel } from '../../utils/modelUtils';
import type { Model, CreateModelRequest, UpdateModelRequest } from '../../types/model-types';

const { Title } = Typography;

const ModelEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentModel, loading, error } = useSelector((state: RootState) => state.model);
  const [activeTab, setActiveTab] = useState('1');
  const [isEdited, setIsEdited] = useState(false);
  const [localModel, setLocalModel] = useState<Model | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isNewModel = !id || id === 'new';

  useEffect(() => {
    if (!isNewModel && id) {
      dispatch(fetchModelById(id));
    } else {
      // 为新模型创建空模型
      const emptyModel = createEmptyModel('default-tenant') as Model;
      setLocalModel(emptyModel);
    }
  }, [dispatch, id, isNewModel]);

  // 当 currentModel 发生变化时更新本地模型
  useEffect(() => {
    if (currentModel && !isNewModel) {
      setLocalModel(currentModel);
    }
  }, [currentModel, isNewModel]);

  const handleSave = async () => {
    if (!localModel) return;

    setSubmitting(true);

    try {
      if (isNewModel) {
        // 创建新模型
        const createRequest: CreateModelRequest = {
          name: localModel.name,
          displayName: localModel.displayName,
          description: localModel.description,
          fields: localModel.fields,
          tenantId: localModel.tenantId,
          applicationId: localModel.applicationId
        };

        await dispatch(createModel(createRequest)).unwrap();
        message.success('模型创建成功');
        navigate('/models');
      } else if (id) {
        // 更新已有模型
        const updateRequest: UpdateModelRequest = {
          id: id,
          name: localModel.name,
          displayName: localModel.displayName,
          description: localModel.description,
          fields: localModel.fields,
          version: localModel.version
        };

        await dispatch(updateModel({ id, model: updateRequest })).unwrap();
        message.success('模型保存成功');
        setIsEdited(false);
      }
    } catch (error) {
      message.error('保存失败');
      console.error('保存模型失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = () => {
    message.info('发布功能尚未实现');
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleModelUpdate = (updatedModel: Model) => {
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
  if (!isNewModel && loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="large" />
      </div>
    );
  }

  // 如果有错误，显示错误信息
  if (!isNewModel && error) {
    return (
      <Card>
        <div style={{ textAlign: 'center' }}>
          <Title level={4} type="danger">加载失败</Title>
          <p>{error}</p>
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
          model={localModel}
          onFieldSelect={(field) => console.log('Selected field:', field)}
          onModelUpdate={handleModelUpdate}
        />
      ),
    },
    {
      key: '2',
      label: 'ER图编辑器',
      children: (
        <ERDiagramEditor
          model={localModel}
          onFieldSelect={(field) => console.log('Selected field:', field)}
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
          model={localModel as Model}
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
