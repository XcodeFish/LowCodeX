import React from 'react';
import { Button as AntButton } from 'antd';
import type { ButtonProps as AntButtonProps } from 'antd';
import classNames from 'classnames';
import './style.scss';

export interface ButtonProps extends AntButtonProps {
  /**
   * 自定义按钮类型
   */
  customType?: 'primary-light' | 'danger-light' | 'warning-light';
  /**
   * 是否显示加载状态
   */
  loading?: boolean;
}

/**
 * 封装的Button组件，扩展了Ant Design的Button组件功能
 */
const Button: React.FC<ButtonProps> = ({
  className,
  customType,
  children,
  loading = false,
  ...restProps
}) => {
  const buttonClassName = classNames(
    'custom-button',
    {
      [`custom-button-${customType}`]: customType,
    },
    className
  );

  return (
    <AntButton
      className={buttonClassName}
      loading={loading}
      {...restProps}
    >
      {children}
    </AntButton>
  );
};

export { Button };
