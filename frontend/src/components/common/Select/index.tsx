import React from 'react';
import { Select as AntSelect } from 'antd';
import type { SelectProps as AntSelectProps } from 'antd';
import './style.scss';

const { Option, OptGroup } = AntSelect;

export interface SelectOption {
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
  /**
   * 分组标题
   */
  groupLabel?: string;
  /**
   * 自定义渲染内容
   */
  customContent?: React.ReactNode;
}

export interface SelectProps<ValueType = string | number> extends Omit<AntSelectProps<ValueType>, 'options'> {
  /**
   * 下拉选项
   */
  options?: SelectOption[];
  /**
   * 是否显示搜索框
   */
  showSearch?: boolean;
  /**
   * 是否允许清除
   */
  allowClear?: boolean;
  /**
   * 是否自动聚焦
   */
  autoFocus?: boolean;
  /**
   * 是否使用远程搜索
   */
  remote?: boolean;
  /**
   * 远程搜索函数
   */
  onRemoteSearch?: (value: string) => Promise<SelectOption[]>;
}

/**
 * 封装的Select组件，扩展了Ant Design的Select组件
 */
const Select = <ValueType = string | number>({
  className,
  options = [],
  showSearch = false,
  allowClear = true,
  autoFocus = false,
  remote = false,
  onRemoteSearch,
  onSearch,
  loading,
  ...restProps
}: SelectProps<ValueType>) => {
  // 处理搜索
  const handleSearch = async (value: string) => {
    if (onSearch) {
      onSearch(value);
    }

    if (remote && onRemoteSearch) {
      // 远程搜索由外部控制loading和options
      await onRemoteSearch(value);
    }
  };

  // 生成子选项
  const renderOptions = () => {
    if (!options || options.length === 0) {
      return null;
    }

    // 按分组整理选项
    const groupMap: Record<string, SelectOption[]> = {};
    const nonGroupOptions: SelectOption[] = [];

    options.forEach(option => {
      if (option.groupLabel) {
        if (!groupMap[option.groupLabel]) {
          groupMap[option.groupLabel] = [];
        }
        groupMap[option.groupLabel].push(option);
      } else {
        nonGroupOptions.push(option);
      }
    });

    // 生成所有选项
    const allOptions: React.ReactNode[] = [];

    // 处理非分组选项
    nonGroupOptions.forEach(option => {
      allOptions.push(
        <Option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.customContent || option.label}
        </Option>
      );
    });

    // 处理分组选项
    Object.keys(groupMap).forEach(groupLabel => {
      allOptions.push(
        <OptGroup key={groupLabel} label={groupLabel}>
          {groupMap[groupLabel].map(option => (
            <Option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.customContent || option.label}
            </Option>
          ))}
        </OptGroup>
      );
    });

    return allOptions;
  };

  return (
    <AntSelect<ValueType>
      className={`custom-select ${className || ''}`}
      showSearch={showSearch}
      allowClear={allowClear}
      autoFocus={autoFocus}
      onSearch={handleSearch}
      filterOption={!remote}
      loading={loading}
      notFoundContent={loading ? '加载中...' : '暂无数据'}
      {...restProps}
    >
      {renderOptions()}
    </AntSelect>
  );
};

Select.Option = Option;
Select.OptGroup = OptGroup;

export { Select };
