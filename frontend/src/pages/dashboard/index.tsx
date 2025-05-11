import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Progress, List, Avatar } from 'antd';
import {
  AppstoreOutlined,
  FormOutlined,
  ApiOutlined,
  UserOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import './style.scss';

// 模拟数据
const mockData = {
  stats: {
    models: 12,
    forms: 23,
    workflows: 8,
    applications: 5,
    users: 124
  },
  activities: [
    { id: 1, user: '张三', action: '创建了表单', target: '客户信息表', time: '10分钟前' },
    { id: 2, user: '李四', action: '更新了数据模型', target: '产品库存', time: '30分钟前' },
    { id: 3, user: '王五', action: '发布了应用', target: '员工管理系统', time: '1小时前' },
    { id: 4, user: '赵六', action: '编辑了工作流', target: '报销审批流程', time: '2小时前' },
    { id: 5, user: '张三', action: '新增了用户', target: '市场部门成员', time: '3小时前' }
  ],
  recentForms: [
    { id: 1, name: '客户反馈表', usage: 145, growth: 12.5 },
    { id: 2, name: '产品订单表', usage: 234, growth: -5.2 },
    { id: 3, name: '员工入职表', usage: 98, growth: 3.5 },
    { id: 4, name: '会议室预订', usage: 56, growth: 8.1 },
    { id: 5, name: '培训申请表', usage: 78, growth: -2.3 }
  ],
  progressData: [
    { id: 1, name: '客户管理系统', progress: 75 },
    { id: 2, name: '库存管理系统', progress: 45 },
    { id: 3, name: '人事管理系统', progress: 90 },
    { id: 4, name: '办公OA系统', progress: 30 }
  ]
};

// 定义Dashboard组件
const Dashboard: React.FC = () => {
  const [data, setData] = useState(mockData);

  // 模拟API请求
  useEffect(() => {
    // 这里可以替换为实际的API请求
    // fetchDashboardData().then(res => setData(res));
    setData(mockData);
  }, []);

  // 表格列配置
  const columns = [
    {
      title: '表单名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '使用次数',
      dataIndex: 'usage',
      key: 'usage',
      sorter: (a: any, b: any) => a.usage - b.usage,
    },
    {
      title: '增长率',
      dataIndex: 'growth',
      key: 'growth',
      render: (growth: number) => (
        <span style={{ color: growth >= 0 ? '#3f8600' : '#cf1322' }}>
          {growth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          {Math.abs(growth)}%
        </span>
      ),
    },
  ];

  return (
    <div className="dashboard-container">
      <Row gutter={[24, 24]}>
        {/* 统计卡片 */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="数据模型"
              value={data.stats.models}
              prefix={<ApiOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="表单"
              value={data.stats.forms}
              prefix={<FormOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="工作流"
              value={data.stats.workflows}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="用户数"
              value={data.stats.users}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>

        {/* 热门表单使用情况 */}
        <Col xs={24} lg={12}>
          <Card title="热门表单使用情况" className="table-card">
            <Table
              columns={columns}
              dataSource={data.recentForms}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </Col>

        {/* 应用构建进度 */}
        <Col xs={24} lg={12}>
          <Card title="应用构建进度" className="progress-card">
            <List
              dataSource={data.progressData}
              renderItem={item => (
                <List.Item key={item.id}>
                  <div className="progress-item">
                    <div className="progress-name">{item.name}</div>
                    <Progress percent={item.progress} size="small" status={
                      item.progress === 100 ? 'success' : 'active'
                    } />
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 最近活动 */}
        <Col xs={24}>
          <Card title="最近活动" className="activity-card">
            <List
              dataSource={data.activities}
              renderItem={item => (
                <List.Item key={item.id}>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={`${item.user} ${item.action}`}
                    description={`${item.target} - ${item.time}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// 明确使用默认导出
export default Dashboard;
