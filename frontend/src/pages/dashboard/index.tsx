import React from 'react';
import { Card, Statistic, Table, Progress, List, Avatar } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  FileOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import './style.scss';

const Dashboard: React.FC = () => {
  const dataSource = [
    {
      key: '1',
      product: 'Product A',
      sales: 235,
      growth: 12.3,
    },
    {
      key: '2',
      product: 'Product B',
      sales: 187,
      growth: -5.8,
    },
    {
      key: '3',
      product: 'Product C',
      sales: 302,
      growth: 25.7,
    },
    {
      key: '4',
      product: 'Product D',
      sales: 142,
      growth: 8.1,
    },
  ];

  const columns = [
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
    },
    {
      title: 'Sales',
      dataIndex: 'sales',
      key: 'sales',
      render: (sales: number) => `${sales} units`,
    },
    {
      title: 'Growth',
      dataIndex: 'growth',
      key: 'growth',
      render: (growth: number) => (
        <span className={growth >= 0 ? 'growth-positive' : 'growth-negative'}>
          {growth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          {Math.abs(growth)}%
        </span>
      ),
    },
  ];

  const progressData = [
    { name: 'Project Alpha', percent: 75 },
    { name: 'Project Beta', percent: 45 },
    { name: 'Project Gamma', percent: 90 },
    { name: 'Project Delta', percent: 30 },
  ];

  const activityData = [
    {
      title: 'John Doe updated the task',
      time: '2 hours ago',
    },
    {
      title: 'Jane Smith completed Project Alpha',
      time: '5 hours ago',
    },
    {
      title: 'Alex Johnson created a new project',
      time: '1 day ago',
    },
    {
      title: 'Mike Wilson added a new comment',
      time: '2 days ago',
    },
  ];

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">仪表盘概览</h1>

      <div className="stat-cards-row">
        <div className="stat-card-wrapper">
          <Card className="stat-card" variant="outlined">
            <Statistic
              title="用户总数"
              value={4598}
              prefix={<UserOutlined />}
            />
          </Card>
        </div>
        <div className="stat-card-wrapper">
          <Card className="stat-card" variant="outlined">
            <Statistic
              title="订单总数"
              value={1259}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </div>
        <div className="stat-card-wrapper">
          <Card className="stat-card" variant="outlined">
            <Statistic
              title="总收入"
              value={23567}
              prefix={<DollarOutlined />}
              suffix="¥"
            />
          </Card>
        </div>
        <div className="stat-card-wrapper">
          <Card className="stat-card" variant="outlined">
            <Statistic
              title="报告总数"
              value={345}
              prefix={<FileOutlined />}
            />
          </Card>
        </div>
      </div>

      <div className="content-row">
        <div className="content-col">
          <Card title="热门产品" className="table-card" variant="outlined">
            <Table dataSource={dataSource} columns={columns} pagination={false} />
          </Card>
        </div>

        <div className="content-col">
          <Card title="项目进度" className="progress-card" variant="outlined">
            {progressData.map((item, index) => (
              <div key={index} className="progress-item">
                <div className="progress-name">
                  <span>{item.name}</span>
                  <span>{item.percent}%</span>
                </div>
                <Progress percent={item.percent} showInfo={false} />
                  </div>
            ))}
          </Card>
        </div>
      </div>

      <div className="content-row">
        <div className="content-col">
          <Card title="最近活动" className="activity-card" variant="outlined">
            <List
              itemLayout="horizontal"
              dataSource={activityData}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={item.title}
                    description={
                      <span>
                        <span className="time-info">
                          <ClockCircleOutlined />
                          {item.time}
                        </span>
                      </span>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
