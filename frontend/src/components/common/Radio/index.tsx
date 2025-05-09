import React from 'react';
import { Radio as AntRadio } from 'antd';
import type { RadioProps as AntRadioProps, RadioGroupProps } from 'antd';
import './style.scss';

const { Group, Button } = AntRadio;

export interface RadioProps extends AntRadioProps {
  /**
   * 自定义样式
   */
  customStyle?: 'button' | 'card';
}

/**
 * 封装的Radio组件，扩展了Ant Design的Radio组件
 */
const Radio: React.FC<RadioProps> = ({
  className,
  customStyle,
  ...restProps
}) => {
  const radioCls = customStyle === 'card' ? 'custom-radio-card' : 'custom-radio';

  return (
    <AntRadio
      className={`${radioCls} ${className || ''}`}
      {...restProps}
    />
  );
};

export interface RadioOption {
  /**
   * 选项值
   */
  value: string | number;
  /**
   * 选项标签
   */
  label: React.ReactNode;
  /**
   * 是否禁用
   */
  disabled?: boolean;
}

export interface RadioGroupComponentProps extends Omit<RadioGroupProps, 'options'> {
  /**
   * 单选框组合选项
   */
  options?: RadioOption[];
  /**
   * 自定义样式
   */
  customStyle?: 'default' | 'button' | 'card';
  /**
   * 按钮风格时的尺寸
   */
  buttonSize?: 'large' | 'middle' | 'small';
}

/**
 * RadioGroup组件
 */
const CustomRadioGroup: React.FC<RadioGroupComponentProps> = ({
  className,
  options = [],
  customStyle = 'default',
  buttonSize = 'middle',
  ...restProps
}) => {
  // 生成Radio选项
  const renderOptions = () => {
    if (!options || options.length === 0) {
      return null;
    }

    if (customStyle === 'button') {
      return options.map(option => (
        <Button
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </Button>
      ));
    }

    if (customStyle === 'card') {
      return options.map(option => (
        <Radio
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          customStyle="card"
        >
          {option.label}
        </Radio>
      ));
    }

    return options.map(option => (
      <Radio
        key={option.value}
        value={option.value}
        disabled={option.disabled}
      >
        {option.label}
      </Radio>
    ));
  };

  const groupProps = customStyle === 'button' ? { size: buttonSize } : {};

  const groupCls = `custom-radio-group custom-radio-group-${customStyle} ${className || ''}`;

  return (
    <Group
      className={groupCls}
      {...groupProps}
      {...restProps}
    >
      {options.length > 0 ? renderOptions() : restProps.children}
    </Group>
  );
};

/**
 * RadioButton组件
 */
const CustomRadioButton: React.FC<AntRadioProps> = (props) => {
  return (
    <Button {...props} />
  );
};

// 扩展Radio组件类型定义
interface RadioType extends React.FC<RadioProps> {
  Group: React.FC<RadioGroupComponentProps>;
  Button: React.FC<AntRadioProps>;
}

// 使用Object.assign扩展Radio组件
const RadioComponent = Radio as RadioType;
RadioComponent.Group = CustomRadioGroup;
RadioComponent.Button = CustomRadioButton;

export { RadioComponent as Radio };
