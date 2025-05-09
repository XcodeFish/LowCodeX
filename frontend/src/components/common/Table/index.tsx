import React, { useState, useEffect } from 'react';
import { Table as AntTable, Button, Space, Tooltip } from 'antd';
import type { TableProps as AntTableProps } from 'antd/es/table';
import type { ColumnType as AntColumnType } from 'antd/es/table';
import type { TableRowSelection } from 'antd/es/table/interface';
import { ReloadOutlined, SettingOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import './style.scss';

// 扩展列配置
export interface ColumnType<T> extends AntColumnType<T> {
  /**
   * 是否默认隐藏
   */
  defaultHidden?: boolean;
  /**
   * 是否禁止在列设置中修改
   */
  disableColumnSetting?: boolean;
}

export interface TableProps<RecordType> extends Omit<AntTableProps<RecordType>, 'columns'> {
  /**
   * 表格列配置
   */
  columns?: ColumnType<RecordType>[];
  /**
   * 是否可调整列顺序
   */
  draggable?: boolean;
  /**
   * 是否显示工具栏
   */
  showToolbar?: boolean;
  /**
   * 是否显示刷新按钮
   */
  showRefresh?: boolean;
  /**
   * 是否显示设置按钮
   */
  showSetting?: boolean;
  /**
   * 是否显示全屏按钮
   */
  showFullscreen?: boolean;
  /**
   * 刷新回调函数
   */
  onRefresh?: () => void;
  /**
   * 空数据时显示的提示信息
   */
  emptyText?: React.ReactNode;
  /**
   * 额外的工具栏元素
   */
  toolbarExtra?: React.ReactNode;
  /**
   * 行选择配置
   */
  rowSelection?: TableRowSelection<RecordType>;
}

/**
 * 封装的表格组件，扩展了Ant Design的Table组件
 */
const Table = <RecordType extends object>({
  columns = [],
  // draggable = false, // 暂未实现此功能，注释掉避免未使用警告
  showToolbar = true,
  showRefresh = true,
  showSetting = true,
  showFullscreen = true,
  onRefresh,
  emptyText = '暂无数据',
  toolbarExtra,
  className,
  ...restProps
}: TableProps<RecordType>) => {
  // 表格列状态
  const [tableColumns, setTableColumns] = useState<ColumnType<RecordType>[]>(columns);
  // 全屏状态
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 当columns变化时更新状态
  useEffect(() => {
    setTableColumns(columns);
  }, [columns]);

  // 渲染工具栏
  const renderToolbar = () => {
    if (!showToolbar) {
      return null;
    }

    return (
      <div className="custom-table-toolbar">
        <div className="custom-table-toolbar-title">
          {toolbarExtra}
        </div>
        <div className="custom-table-toolbar-actions">
          <Space>
            {showRefresh && (
              <Tooltip title="刷新">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={onRefresh}
                  type="text"
                />
              </Tooltip>
            )}
            {showSetting && (
              <Tooltip title="列设置">
                <Button
                  icon={<SettingOutlined />}
                  onClick={() => {/* 列设置 */}}
                  type="text"
                />
              </Tooltip>
            )}
            {showFullscreen && (
              <Tooltip title={isFullscreen ? '退出全屏' : '全屏'}>
                <Button
                  icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  type="text"
                />
              </Tooltip>
            )}
          </Space>
        </div>
      </div>
    );
  };

  // 计算容器类名
  const containerClassName = `
    custom-table-container
    ${isFullscreen ? 'custom-table-fullscreen' : ''}
    ${className || ''}
  `;

  return (
    <div className={containerClassName}>
      {renderToolbar()}
      <AntTable<RecordType>
        className="custom-table"
        columns={tableColumns}
        locale={{ emptyText }}
        {...restProps}
      />
    </div>
  );
};

export { Table };
