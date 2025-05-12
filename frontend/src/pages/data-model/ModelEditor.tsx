import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tabs, Button, Space, message, Spin, Typography } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, CheckOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchModelById } from '../../store/slices/modelSlice';
import type { AppDispatch, RootState } from '../../store';
import TableEditor from '../../components/model-designer/TableEditor';
import ERDiagramEditor from '../../components/model-designer/ERDiagramEditor';
import ModelVersionControl from '../../components/model-designer/ModelVersionControl';

const { Title } = Typography;
const { TabPane } = Tabs;

const ModelEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentModel, loading, error } = useSelector((state: RootState) => state.model);
  const [activeTab, setActiveTab] = useState('1');
  const [isEdited, setIsEdited] = useState(false);

  const isNewModel = !id || id === 'new';

  useEffect(() => {
    if (!isNewModel && id) {
      dispatch(fetchModelById(id));
    }
  }, [dispatch, id, isNewModel]);

  const handleSave = () => {
    message.success(isNewModel ? '模型创建成功' : '模型保存成功');
    setIsEdited(false);
  };

  const handlePublish = () => {
    message.info('发布功能尚未实现');
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleFieldsChange = () => {
    setIsEdited(true);
  };

  // 如果正在加载，显示加载状态
  if (!isNewModel && loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="large" tip="加载中..." />
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
            {isNewModel ? '创建新模型' : `编辑模型: ${currentModel?.displayName || ''}`}
          </Title>
        </Space>
      }
      extra={
        <Space>
          <Button
            onClick={handleSave}
            type="primary"
            icon={<SaveOutlined />}
            disabled={!isEdited}
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
      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane tab="表格编辑器" key="1">
          <TableEditor model={currentModel} onChange={handleFieldsChange} />
        </TabPane>
        <TabPane tab="ER图编辑器" key="2">
          <ERDiagramEditor model={currentModel} onChange={handleFieldsChange} />
        </TabPane>
        {!isNewModel && (
          <TabPane tab="版本控制" key="3">
            <ModelVersionControl modelId={id as string} />
          </TabPane>
        )}
      </Tabs>
    </Card>
  );
};

export default ModelEditor;
