import React from 'react';
import { Form as AntForm, Row, Col } from 'antd';
import type { FormProps as AntFormProps, ColProps } from 'antd';
import './style.scss';

const { Item: FormItem } = AntForm;

export interface FormProps extends AntFormProps {
  /**
   * 是否使用紧凑模式
   */
  compact?: boolean;
  /**
   * 表单项标签宽度
   */
  labelWidth?: number | string;
  /**
   * 是否为搜索表单模式
   */
  isSearchForm?: boolean;
}

export interface FormItemLayoutProps {
  /**
   * 标签列配置
   */
  labelCol?: ColProps;
  /**
   * 内容列配置
   */
  wrapperCol?: ColProps;
}

/**
 * 获取默认的表单布局
 */
export const getFormItemLayout = (
  labelWidth?: number | string
): FormItemLayoutProps => {
  const width = labelWidth ? (typeof labelWidth === 'number' ? `${labelWidth}px` : labelWidth) : '100px';

  return {
    labelCol: {
      style: {
        width,
        flex: `0 0 ${width}`,
      },
    },
    wrapperCol: {
      style: {
        flex: 1,
      },
    },
  };
};

/**
 * 封装的表单组件，扩展了Ant Design的Form组件
 */
const Form: CustomFormType = Object.assign(
  ({
    compact = false,
    labelWidth,
    isSearchForm = false,
    children,
    className,
    ...restProps
  }: FormProps) => {
    const formClassName = `custom-form ${isSearchForm ? 'custom-search-form' : ''} ${compact ? 'custom-compact-form' : ''} ${className || ''}`;

    // 获取默认的表单布局
    const formItemLayout = getFormItemLayout(labelWidth);

    return (
      <AntForm
        className={formClassName}
        {...formItemLayout}
        {...restProps}
      >
        {children}
      </AntForm>
    );
  },
  { Item: FormItem, Actions: null as unknown as React.FC<FormActionsProps> }
);

/**
 * 表单搜索区域，用于搜索表单的提交和重置按钮区域
 */
interface FormActionsProps {
  children: React.ReactNode;
  /**
   * 列配置
   */
  col?: ColProps;
  /**
   * 对齐方式
   */
  align?: 'left' | 'center' | 'right';
}

const FormActions: React.FC<FormActionsProps> = ({
  children,
  col = { span: 24 },
  align = 'right',
}) => {
  return (
    <Row>
      <Col {...col}>
        <div className={`custom-form-actions custom-form-actions-${align}`}>
          {children}
        </div>
      </Col>
    </Row>
  );
};

// 扩展Form组件，包含子组件
interface CustomFormType extends React.FC<FormProps> {
  Item: typeof FormItem;
  Actions: React.FC<FormActionsProps>;
}

// 补充Actions组件
Form.Actions = FormActions;

export { Form, FormItem };
