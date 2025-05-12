import React, { useEffect, useState, useRef } from 'react';
import { Button, Table, Space, Card, Typography, Input, message, Popconfirm, Tag, Tooltip } from 'antd';
import { PlusOutlined, SearchOutlined, DeleteOutlined, EditOutlined, CopyOutlined, EyeOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchModels } from '../../store/slices/modelSlice';
import type { AppDispatch, RootState } from '../../store';
import type { Model } from '../../types/model-types';
import './style.scss';
const { Title } = Typography;
const { Search } = Input;

const ModelList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { models, loading, total } = useSelector((state: RootState) => state.model);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const fetchedRef = useRef(false);

  useEffect(() => {
    // 使用ref避免重复加载
    if (!fetchedRef.current) {
      dispatch(fetchModels({}));
      fetchedRef.current = true;
    }
  }, [dispatch]);

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
    // 实际应用中，这里应该调用API进行搜索
    // dispatch(searchModels(value));
  };

  const handleDuplicate = (model: Model) => {
    message.info(`复制模型 ${model.displayName} 功能尚未实现`);
    // 实际应用中，这里应该调用API复制模型
  };

  const handleDelete = (id: string) => {
    message.info(`删除模型 ${id} 功能尚未实现`);
    // 实际应用中，这里应该调用API删除模型
  };

  const handleTableChange = (pagination: any) => {
    setPagination(pagination);
    // 实际应用中，这里应该调用API获取分页数据
    // dispatch(fetchModels({ page: pagination.current, pageSize: pagination.pageSize }));
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
