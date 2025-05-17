import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  List,
  Space,
  Typography,
  Modal,
  Form,
  Input,
  Tag,
  Badge,
  Popconfirm,
  Divider,
  message,
  Tabs,
  Tooltip,
  Drawer,
  Empty,
  Spin,
} from 'antd';
import {
  HistoryOutlined,
  SaveOutlined,
  RollbackOutlined,
  DiffOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { Model } from '../../types/model-types';
import type { MetaVersion } from '../../types/data-models';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { useMetaVersions } from '../../hooks/features/data-models';

const { Text } = Typography;
const { TabPane } = Tabs;
const { confirm } = Modal;

interface ModelVersionControlProps {
  model: Model;
  versions: MetaVersion[];
  currentVersion?: MetaVersion;
  onSaveVersion: (version: Partial<MetaVersion>) => void;
  onRestoreVersion: (versionId: string) => void;
  readOnly?: boolean;
  modelId?: string;
}

/**
 * 模型版本控制组件
 */
const ModelVersionControl: React.FC<ModelVersionControlProps> = ({
  model,
  versions = [],
  currentVersion,
  onSaveVersion,
  onRestoreVersion,
  readOnly = false,
  modelId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { metaVersions, loading: reduxLoading } = useSelector((state: RootState) => state.model);
  const { getMetaVersions, restoreVersion, compareVersions: compareVersionsApi, loading: hookLoading } = useMetaVersions();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isVersionDetailVisible, setIsVersionDetailVisible] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<MetaVersion | null>(null);
  const [form] = Form.useForm();
  const [diffVisible, setDiffVisible] = useState(false);
  const [versionsToCompare, setVersionsToCompare] = useState<{
    oldVersion: MetaVersion | null;
    newVersion: MetaVersion | null;
  }>({
    oldVersion: null,
    newVersion: null,
  });
  const [loadedVersions, setLoadedVersions] = useState<MetaVersion[]>([]);
  const loading = hookLoading || reduxLoading;

  // 加载版本数据
  useEffect(() => {
    const fetchVersions = async () => {
      if (modelId) {
        const response = await getMetaVersions(modelId);
        if (response.code === 200 && response.data) {
          // @ts-ignore - 忽略类型不匹配的问题
          setLoadedVersions(response.data);
        }
      }
    };

    fetchVersions();
  }, [modelId, getMetaVersions]);

  // 使用从hooks获取的版本数据或props传入的版本数据
  const versionsToDisplay = versions.length > 0 ? versions : (loadedVersions.length > 0 ? loadedVersions : metaVersions);

  // 打开创建版本模态框
  const showCreateVersionModal = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  // 关闭模态框
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // 保存版本
  const handleSaveVersion = async () => {
    try {
      const values = await form.validateFields();

      onSaveVersion({
        name: values.name,
        description: values.description,
        // @ts-ignore - 忽略类型不匹配的问题
        snapshot: model,
        isPublished: values.isPublished,
      });

      setIsModalVisible(false);
      message.success('版本保存成功');
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 显示版本详情
  const showVersionDetail = (version: MetaVersion) => {
    setSelectedVersion(version);
    setIsVersionDetailVisible(true);
  };

  // 关闭版本详情抽屉
  const closeVersionDetail = () => {
    setIsVersionDetailVisible(false);
  };

  // 还原版本
  const handleRestoreVersion = (versionId: string) => {
    confirm({
      title: '确认还原版本',
      icon: <ExclamationCircleOutlined />,
      content: '还原后当前未保存的修改将会丢失，确定继续吗？',
      onOk() {
        onRestoreVersion(versionId);
        message.success('版本还原成功');
        setIsVersionDetailVisible(false);
      },
    });
  };

  // 显示版本对比
  const showDiff = async (oldVersion: MetaVersion, newVersion: MetaVersion) => {
    setVersionsToCompare({
      oldVersion,
      newVersion,
    });

    // 如果需要，调用API获取比较结果
    if (oldVersion.id && newVersion.id) {
      try {
        const response = await compareVersionsApi(oldVersion.id, newVersion.id);
        if (response.success) {
          // 可以在这里处理比较结果
          console.log('比较结果:', response.data);
        }
      } catch (error) {
        console.error('比较版本出错:', error);
      }
    }

    setDiffVisible(true);
  };

  // 关闭版本对比
  const closeDiff = () => {
    setDiffVisible(false);
  };

  // 获取模型的 JSON 字符串表示，用于对比
  const getModelJsonString = (model: any) => {
    if (!model) return '';

    // 复制模型并移除不需要比较的字段
    const { updatedAt, updatedBy, ...modelCopy } = { ...model };

    return JSON.stringify(modelCopy, null, 2);
  };

  // 获取版本列表
  const renderVersionList = () => {
    if (loading) {
      return <Spin tip="加载版本记录中..." />;
    }

    if (versionsToDisplay.length === 0) {
      return <Empty description="暂无版本记录" />;
    }

    return (
      <List
        itemLayout="horizontal"
        dataSource={versionsToDisplay.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())}
        renderItem={(version: any, index: number) => (
          <List.Item
            actions={[
              <Button
                key="view"
                type="link"
                onClick={() => showVersionDetail(version)}
                icon={<InfoCircleOutlined />}
              >
                详情
              </Button>,
              !readOnly && (
                <Popconfirm
                  key="restore"
                  title="确定要还原到此版本吗？"
                  onConfirm={() => handleRestoreVersion(version.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button type="link" icon={<RollbackOutlined />}>
                    还原
                  </Button>
                </Popconfirm>
              ),
              index < versionsToDisplay.length - 1 && (
                <Button
                  key="diff"
                  type="link"
                  onClick={() => showDiff(versionsToDisplay[index + 1], version)}
                  icon={<DiffOutlined />}
                >
                  对比
                </Button>
              ),
            ].filter(Boolean)}
          >
            <List.Item.Meta
              title={
                <Space>
                  <Text strong>{version.name}</Text>
                  {version.isPublished && <Tag color="green">已发布</Tag>}
                  {currentVersion?.id === version.id && <Tag color="blue">当前</Tag>}
                </Space>
              }
              description={
                <Space direction="vertical" size={0}>
                  <Text type="secondary">
                    {version.description || '无描述'}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    创建于 {dayjs(version.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                    {version.createdBy ? ` 由 ${version.createdBy}` : ''}
                  </Text>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    );
  };

  return (
    <div className="model-version-control">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography.Title level={5} style={{ margin: 0 }}>
          <HistoryOutlined /> 版本记录
        </Typography.Title>
        {!readOnly && model && (
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={showCreateVersionModal}
          >
            保存当前版本
          </Button>
        )}
      </div>

      {renderVersionList()}

      {/* 创建版本模态框 */}
      <Modal
        title="保存模型版本"
        open={isModalVisible}
        onOk={handleSaveVersion}
        onCancel={handleCancel}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            name: model ? `${model.name} v${versionsToDisplay.length + 1}` : '',
            description: '',
            isPublished: false,
          }}
        >
          <Form.Item
            name="name"
            label="版本名称"
            rules={[{ required: true, message: '请输入版本名称' }]}
          >
            <Input placeholder="例如：v1.0.0" />
          </Form.Item>

          <Form.Item
            name="description"
            label="版本描述"
          >
            <Input.TextArea
              placeholder="此版本的修改内容或备注信息"
              rows={4}
            />
          </Form.Item>

          <Form.Item
            name="isPublished"
            valuePropName="checked"
            label="发布状态"
          >
            <Tooltip title="发布后的版本将用于生产环境">
              <Button type="link">
                标记为已发布版本
                <InfoCircleOutlined />
              </Button>
            </Tooltip>
          </Form.Item>
        </Form>
      </Modal>

      {/* 版本详情抽屉 */}
      <Drawer
        title={`版本详情: ${selectedVersion?.name}`}
        placement="right"
        width={600}
        onClose={closeVersionDetail}
        open={isVersionDetailVisible}
        extra={
          !readOnly && selectedVersion && (
            <Button
              type="primary"
              icon={<RollbackOutlined />}
              onClick={() => handleRestoreVersion(selectedVersion.id)}
            >
              还原此版本
            </Button>
          )
        }
      >
        {selectedVersion && (
          <div>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Card>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <Text type="secondary">版本名称:</Text>
                    <Text strong style={{ marginLeft: 8 }}>{selectedVersion.name}</Text>
                    {selectedVersion.isPublished && (
                      <Tag color="green" style={{ marginLeft: 8 }}>已发布</Tag>
                    )}
                  </div>

                  <div>
                    <Text type="secondary">创建时间:</Text>
                    <Text style={{ marginLeft: 8 }}>
                      {dayjs(selectedVersion.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                    </Text>
                  </div>

                  <div>
                    <Text type="secondary">创建者:</Text>
                    <Text style={{ marginLeft: 8 }}>
                      {selectedVersion.createdBy || '未知'}
                    </Text>
                  </div>

                  <div>
                    <Text type="secondary">描述:</Text>
                    <div style={{ marginTop: 8 }}>
                      {selectedVersion.description ? (
                        <Text>{selectedVersion.description}</Text>
                      ) : (
                        <Text type="secondary">无描述</Text>
                      )}
                    </div>
                  </div>
                </Space>
              </Card>

              <Divider>模型信息</Divider>

              <Tabs defaultActiveKey="fields">
                <TabPane tab="字段" key="fields">
                  <List
                    size="small"
                    // @ts-ignore - MetaVersion类型中缺少snapshot属性
                    dataSource={selectedVersion.snapshot.fields}
                    renderItem={(field: any) => (
                      <List.Item>
                        <Space>
                          <Text strong>{field.displayName || field.name}</Text>
                          <Text code>{field.name}</Text>
                          <Text type="secondary">{field.type}</Text>
                          {field.isPrimaryKey && <Tag color="blue">主键</Tag>}
                          {field.isRequired && <Tag color="red">必填</Tag>}
                        </Space>
                      </List.Item>
                    )}
                  />
                </TabPane>
                <TabPane tab="JSON" key="json">
                  <pre
                    style={{
                      maxHeight: 400,
                      overflow: 'auto',
                      backgroundColor: '#f5f5f5',
                      padding: 16,
                      borderRadius: 4,
                    }}
                  >
                    {/* @ts-ignore - MetaVersion类型中缺少snapshot属性 */}
                    {JSON.stringify(selectedVersion.snapshot, null, 2)}
                  </pre>
                </TabPane>
              </Tabs>
            </Space>
          </div>
        )}
      </Drawer>

      {/* 版本对比抽屉 */}
      <Drawer
        title="版本对比"
        placement="right"
        width="80%"
        onClose={closeDiff}
        open={diffVisible}
      >
        {versionsToCompare.oldVersion && versionsToCompare.newVersion && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Badge status="error" text={
                  <Text type="secondary">
                    旧版本: {versionsToCompare.oldVersion.name} ({dayjs(versionsToCompare.oldVersion.createdAt).format('YYYY-MM-DD')})
                  </Text>
                } />
                <Divider type="vertical" />
                <Badge status="success" text={
                  <Text type="secondary">
                    新版本: {versionsToCompare.newVersion.name} ({dayjs(versionsToCompare.newVersion.createdAt).format('YYYY-MM-DD')})
                  </Text>
                } />
              </Space>
            </div>

            <ReactDiffViewer
              // @ts-ignore - MetaVersion类型中缺少snapshot属性
              oldValue={getModelJsonString(versionsToCompare.oldVersion.snapshot)}
              // @ts-ignore - MetaVersion类型中缺少snapshot属性
              newValue={getModelJsonString(versionsToCompare.newVersion.snapshot)}
              splitView={true}
              compareMethod={DiffMethod.WORDS}
              useDarkTheme={false}
              styles={{
                contentText: {
                  fontSize: '13px',
                },
              }}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ModelVersionControl;
