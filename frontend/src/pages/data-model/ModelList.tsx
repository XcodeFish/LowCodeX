import React, { useEffect, useState } from 'react';
import { Button, Table, Space, Card, Typography, Input, message, Popconfirm, Tag, Tooltip } from 'antd';
import { PlusOutlined, SearchOutlined, DeleteOutlined, EditOutlined, CopyOutlined, EyeOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useMetaTables } from '../../hooks/features/data-models';
import { setMetaTables, setModelLoading, setModelError } from '../../store/slices/modelSlice';
import type { AppDispatch } from '../../store';
import type { Model } from '../../types/data-models';
import './style.scss';
const { Title } = Typography;
const { Search } = Input;

const ModelList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { getMetaTables, loading, error } = useMetaTables();
  const [models, setModels] = useState<Model[]>([]);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchModels = async () => {
    try {
      dispatch(setModelLoading({ loading: true }));
      const result = await getMetaTables({});
      if (result.success && result.data) {
        setModels(result.data);
        setTotal(result.total || 0);
        // 类型安全：因为Redux期望MetaTable[]，这里我们使用断言
        // @ts-ignore - 忽略类型不匹配的错误
        dispatch(setMetaTables({ tables: result.data, total: result.total || 0 }));
      } else {
        message.error(result.error || '获取数据模型失败');
        dispatch(setModelError({ error: result.error || '获取数据模型失败' }));
      }
    } catch (err: any) {
      message.error(err.message || '获取数据模型失败');
      dispatch(setModelError({ error: err.message || '获取数据模型失败' }));
    } finally {
      dispatch(setModelLoading({ loading: false }));
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      total,
    }));
  }, [total]);

  const columns = [
    {
      title: '模型名称',
      dataIndex: 'displayName',
      key: 'displayName',
      render: (text: string, record: Model) => (
        <Space>
          {text}
          {record.isPublished && (
            <Tag color="green">已发布</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '技术名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Model) => (
        <Space size="middle">
          <Tooltip title="查看">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/models/view/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => navigate(`/models/edit/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="复制">
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => handleDuplicate(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除此模型吗?"
            onConfirm={() => handleDelete(record.id)}
            okText="是"
            cancelText="否"
          >
            <Tooltip title="删除">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // 实现模型搜索功能
    const searchResult = models.filter(model =>
      model.name.toLowerCase().includes(value.toLowerCase()) ||
      model.displayName.toLowerCase().includes(value.toLowerCase())
    );
    setModels(searchResult);
  };

  const handleDuplicate = async (model: Model) => {
    // 在此实现调用复制模型的API
    message.info(`复制模型 ${model.displayName} 功能尚未实现`);
  };

  const handleDelete = async (id: string) => {
    // 在此实现调用删除模型的API
    message.info(`删除模型 ${id} 功能尚未实现`);
  };

  const handleTableChange = (pagination: any) => {
    setPagination(pagination);
    // 实现分页功能
  };

  // 搜索框和按钮样式
  const searchButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>数据模型管理</Title>
        <div style={searchButtonStyle}>
          <Search
            placeholder="搜索模型"
            onSearch={handleSearch}
            style={{ width: 180}}
            className="search-input"
            allowClear
            size="middle"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/models/create')}
          >
            创建模型
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={models}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />
    </Card>
  );
};

export default ModelList;
