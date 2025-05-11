import React from 'react';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';

const Forbidden: React.FC = () => {
  return (
    <Result
      status="403"
      title="403"
      subTitle="抱歉，您没有权限访问此页面。"
      extra={
        <Link to="/">
          <Button type="primary">返回首页</Button>
        </Link>
      }
    />
  );
};

export default Forbidden;
