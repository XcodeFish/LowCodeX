import React from 'react';
import { Pagination as AntPagination } from 'antd';
import type { PaginationProps as AntPaginationProps } from 'antd';
import './style.scss';

export interface PaginationProps extends AntPaginationProps {
  /**
   * 是否显示快捷跳转
   */
  showQuickJumper?: boolean;
  /**
   * 是否显示页数切换
   */
  showSizeChanger?: boolean;
  /**
   * 是否采用简洁版本
   */
  simple?: boolean;
}

/**
 * 分页组件，基于Ant Design的Pagination组件封装
 */
const Pagination: React.FC<PaginationProps> = ({
  showQuickJumper = true,
  showSizeChanger = true,
  simple = false,
  className,
  ...restProps
}) => {
  return (
    <AntPagination
      className={`custom-pagination ${className || ''}`}
      showQuickJumper={simple ? false : showQuickJumper}
      showSizeChanger={simple ? false : showSizeChanger}
      simple={simple}
      {...restProps}
    />
  );
};

export { Pagination };
