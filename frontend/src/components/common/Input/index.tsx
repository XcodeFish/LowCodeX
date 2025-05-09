import React from 'react';
import {
  Input as AntInput,
  InputNumber as AntInputNumber,
  AutoComplete as AntAutoComplete
} from 'antd';
import type { InputProps as AntInputProps } from 'antd';
import type { TextAreaProps } from 'antd/lib/input';
import type { InputNumberProps } from 'antd/lib/input-number';
import type { AutoCompleteProps } from 'antd/lib/auto-complete';
import './style.scss';

const { TextArea, Password, Search } = AntInput;

export interface InputProps extends AntInputProps {
  /**
   * 是否显示字数限制
   */
  showCount?: boolean;
  /**
   * 是否允许清除
   */
  allowClear?: boolean;
}

/**
 * 封装的Input组件，扩展了Ant Design的Input组件
 */
const CustomInput: React.FC<InputProps> = ({
  className,
  ...restProps
}) => {
  return (
    <AntInput
      className={`custom-input ${className || ''}`}
      {...restProps}
    />
  );
};

export interface TextAreaComponentProps extends TextAreaProps {
  /**
   * 是否显示字数限制
   */
  showCount?: boolean;
  /**
   * 最大字数
   */
  maxLength?: number;
}

/**
 * TextArea组件
 */
const CustomTextArea: React.FC<TextAreaComponentProps> = ({
  className,
  ...restProps
}) => {
  return (
    <TextArea
      className={`custom-textarea ${className || ''}`}
      {...restProps}
    />
  );
};

export interface InputNumberComponentProps extends InputNumberProps {
  /**
   * 前缀
   */
  prefix?: React.ReactNode;
  /**
   * 后缀
   */
  suffix?: React.ReactNode;
}

/**
 * InputNumber组件
 */
const CustomInputNumber: React.FC<InputNumberComponentProps> = ({
  className,
  ...restProps
}) => {
  return (
    <AntInputNumber
      className={`custom-input-number ${className || ''}`}
      {...restProps}
    />
  );
};

export interface PasswordComponentProps extends AntInputProps {
  /**
   * 是否显示密码强度
   */
  showStrength?: boolean;
}

/**
 * Password组件
 */
const CustomPassword: React.FC<PasswordComponentProps> = ({
  className,
  ...restProps
}) => {
  return (
    <Password
      className={`custom-password ${className || ''}`}
      {...restProps}
    />
  );
};

export interface SearchComponentProps extends AntInputProps {
  /**
   * 搜索按钮的文本
   */
  searchText?: string;
  /**
   * 是否在按下回车时触发搜索
   */
  enterButton?: boolean | string | React.ReactNode;
}

/**
 * Search组件
 */
const CustomSearch: React.FC<SearchComponentProps> = ({
  className,
  ...restProps
}) => {
  return (
    <Search
      className={`custom-search ${className || ''}`}
      {...restProps}
    />
  );
};

export interface AutoCompleteComponentProps extends AutoCompleteProps {
  /**
   * 是否允许清除
   */
  allowClear?: boolean;
}

/**
 * AutoComplete组件
 */
const CustomAutoComplete: React.FC<AutoCompleteComponentProps> = ({
  className,
  ...restProps
}) => {
  return (
    <AntAutoComplete
      className={`custom-auto-complete ${className || ''}`}
      {...restProps}
    />
  );
};

// 创建Input复合组件
interface InputType extends React.FC<InputProps> {
  TextArea: React.FC<TextAreaComponentProps>;
  Number: React.FC<InputNumberComponentProps>;
  Password: React.FC<PasswordComponentProps>;
  Search: React.FC<SearchComponentProps>;
  AutoComplete: React.FC<AutoCompleteComponentProps>;
}

// 扩展Input组件
const Input = CustomInput as InputType;
Input.TextArea = CustomTextArea;
Input.Number = CustomInputNumber;
Input.Password = CustomPassword;
Input.Search = CustomSearch;
Input.AutoComplete = CustomAutoComplete;

export { Input };
