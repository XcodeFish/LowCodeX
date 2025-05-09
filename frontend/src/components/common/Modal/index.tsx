import React, { useState, useEffect } from 'react';
import { Modal as AntModal, Button, Space } from 'antd';
import type { ModalProps as AntModalProps } from 'antd';
import './style.scss';

export interface ModalProps extends AntModalProps {
  /**
   * 是否使用全屏模式
   */
  fullscreen?: boolean;
  /**
   * 确认按钮文字
   */
  okText?: string;
  /**
   * 取消按钮文字
   */
  cancelText?: string;
  /**
   * 确认按钮加载状态
   */
  confirmLoading?: boolean;
  /**
   * 是否在按下ESC时关闭
   */
  keyboard?: boolean;
  /**
   * 是否显示全屏切换按钮
   */
  showFullscreenToggle?: boolean;
  /**
   * 是否在点击遮罩层时关闭
   */
  maskClosable?: boolean;
  /**
   * 点击确定回调
   */
  onOk?: (e: React.MouseEvent<HTMLElement>) => void | Promise<void>;
  /**
   * 点击取消回调
   */
  onCancel?: (e: React.MouseEvent<HTMLElement>) => void;
  /**
   * 是否模态对话框
   */
  destroyOnClose?: boolean;
  /**
   * 对话框是否可见
   */
  visible?: boolean;
  /**
   * 对话框是否可见（新API）
   */
  open?: boolean;
  /**
   * 自定义页脚
   */
  footer?: React.ReactNode;
  /**
   * 是否使用简单模式（没有页脚）
   */
  simple?: boolean;
}

/**
 * 封装的Modal组件，扩展了Ant Design的Modal组件
 */
const Modal: React.FC<ModalProps> = ({
  fullscreen: propFullscreen,
  okText = '确定',
  cancelText = '取消',
  confirmLoading = false,
  keyboard = true,
  showFullscreenToggle = false,
  maskClosable = true,
  onOk,
  onCancel,
  destroyOnClose = true,
  visible,
  open,
  width = 520,
  footer,
  simple = false,
  children,
  className,
  ...restProps
}) => {
  // 全屏状态
  const [isFullscreen, setIsFullscreen] = useState(propFullscreen || false);

  // 监听属性变化
  useEffect(() => {
    setIsFullscreen(propFullscreen || false);
  }, [propFullscreen]);

  // 切换全屏
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // 渲染页脚
  const renderFooter = () => {
    // 简单模式没有页脚
    if (simple) {
      return null;
    }

    // 自定义页脚
    if (footer !== undefined) {
      return footer;
    }

    return (
      <Space>
        <Button onClick={onCancel}>{cancelText}</Button>
        <Button type="primary" loading={confirmLoading} onClick={onOk}>
          {okText}
        </Button>
      </Space>
    );
  };

  // 计算Modal样式
  const modalStyle: React.CSSProperties = isFullscreen
    ? { top: 0, padding: 0, maxWidth: '100%' }
    : {};

  // 计算Modal宽度
  const modalWidth = isFullscreen ? '100%' : width;

  // 计算类名
  const modalClassName = `
    custom-modal
    ${isFullscreen ? 'custom-modal-fullscreen' : ''}
    ${simple ? 'custom-modal-simple' : ''}
    ${className || ''}
  `;

  return (
    <AntModal
      className={modalClassName}
      style={modalStyle}
      width={modalWidth}
      okText={okText}
      cancelText={cancelText}
      confirmLoading={confirmLoading}
      keyboard={keyboard}
      maskClosable={maskClosable}
      onOk={onOk}
      onCancel={onCancel}
      destroyOnClose={destroyOnClose}
      footer={renderFooter()}
      visible={open || visible}
      {...restProps}
    >
      {showFullscreenToggle && (
        <Button
          className="custom-modal-fullscreen-btn"
          type="text"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? '退出全屏' : '全屏'}
        >
          {isFullscreen ? '退出全屏' : '全屏'}
        </Button>
      )}
      <div className="custom-modal-content">
        {children}
      </div>
    </AntModal>
  );
};

export { Modal };
