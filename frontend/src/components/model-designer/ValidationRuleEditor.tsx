import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  Space,
  Typography,
  InputNumber,
  Collapse,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { FieldType } from '../../types';
import type { ValidationRule, ValidationRuleType } from '../../types/model-types';

const { Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

interface ValidationRuleEditorProps {
  rules: ValidationRule[];
  fieldType: FieldType;
  onChange: (rules: ValidationRule[]) => void;
  readOnly?: boolean;
}

/**
 * 验证规则编辑器组件
 */
const ValidationRuleEditor: React.FC<ValidationRuleEditorProps> = ({
  rules,
  fieldType,
  onChange,
  readOnly = false,
}) => {
  const [expandedRuleIndex, setExpandedRuleIndex] = useState<number | null>(null);

  // 添加新规则
  const handleAddRule = () => {
    const newRule: ValidationRule = {
      type: getDefaultRuleType(fieldType),
      message: getDefaultMessage(getDefaultRuleType(fieldType)),
    };

    const newRules = [...rules, newRule];
    onChange(newRules);

    // 展开新创建的规则
    setExpandedRuleIndex(newRules.length - 1);
  };

  // 删除规则
  const handleDeleteRule = (index: number) => {
    const newRules = [...rules];
    newRules.splice(index, 1);
    onChange(newRules);

    if (expandedRuleIndex === index || expandedRuleIndex === null) {
      setExpandedRuleIndex(null);
    } else if (expandedRuleIndex > index) {
      setExpandedRuleIndex(expandedRuleIndex - 1);
    }
  };

  // 更新规则属性
  const handleUpdateRule = (index: number, key: string, value: any) => {
    const newRules = [...rules];

    if (key === 'type') {
      // 如果改变了类型，重置相关属性
      newRules[index] = {
        type: value as ValidationRuleType,
        message: getDefaultMessage(value as ValidationRuleType),
      };

      // 根据新类型添加默认属性
      if (value === 'format' || value === 'regex') {
        newRules[index].pattern = '';
      } else if (value === 'range' || value === 'length') {
        newRules[index].min = undefined;
        newRules[index].max = undefined;
      } else if (value === 'custom') {
        newRules[index].expression = '';
      }
    } else {
      // 更新具体属性
      newRules[index] = {
        ...newRules[index],
        [key]: value,
      };
    }

    onChange(newRules);
  };

  // 获取适合当前字段类型的默认规则类型
  const getDefaultRuleType = (fieldType: FieldType): ValidationRuleType => {
    switch (fieldType) {
      case FieldType.STRING:
      case FieldType.RICH_TEXT:
        return 'length';
      case FieldType.DECIMAL:
      case FieldType.INTEGER:
      case FieldType.FLOAT:
        return 'range';
      case FieldType.EMAIL:
        return 'format';
      case FieldType.URL:
        return 'format';
      case FieldType.PHONE:
        return 'format';
      default:
        return 'required';
    }
  };

  // 获取规则类型的默认错误消息
  const getDefaultMessage = (ruleType: ValidationRuleType): string => {
    switch (ruleType) {
      case 'required':
        return '此字段必填';
      case 'format':
        return '格式不正确';
      case 'range':
        return '值不在允许范围内';
      case 'length':
        return '长度不符合要求';
      case 'regex':
        return '格式不匹配要求';
      case 'unique':
        return '值必须唯一';
      case 'custom':
        return '验证未通过';
      default:
        return '验证失败';
    }
  };

  // 获取字段类型适用的规则类型
  const getAvailableRuleTypes = (fieldType: FieldType): ValidationRuleType[] => {
    const commonTypes: ValidationRuleType[] = ['required', 'unique', 'custom'];

    switch (fieldType) {
      case FieldType.STRING:
      case FieldType.RICH_TEXT:
        return [...commonTypes, 'length', 'regex'];
      case FieldType.DECIMAL:
      case FieldType.INTEGER:
      case FieldType.FLOAT:
        return [...commonTypes, 'range'];
      case FieldType.EMAIL:
      case FieldType.URL:
      case FieldType.PHONE:
        return [...commonTypes, 'format', 'regex'];
      case FieldType.DATE:
      case FieldType.DATETIME:
      case FieldType.TIME:
        return [...commonTypes, 'range'];
      default:
        return commonTypes;
    }
  };

  // 渲染规则表单
  const renderRuleForm = (rule: ValidationRule, index: number) => {
    return (
      <div key={index} className="rule-form">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item label="规则类型">
            <Select
              value={rule.type}
              onChange={(value) => handleUpdateRule(index, 'type', value)}
              style={{ width: '100%' }}
              disabled={readOnly}
            >
              {getAvailableRuleTypes(fieldType).map((type) => (
                <Option key={type} value={type}>
                  {getRuleTypeDisplayName(type)}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="错误消息">
            <Input
              value={rule.message}
              onChange={(e) => handleUpdateRule(index, 'message', e.target.value)}
              placeholder="验证失败时显示的错误消息"
              disabled={readOnly}
            />
          </Form.Item>

          {/* 格式和正则表达式规则 */}
          {(rule.type === 'format' || rule.type === 'regex') && (
            <Form.Item
              label={
                <Space>
                  <span>正则表达式</span>
                  <Tooltip title="用于验证的正则表达式">
                    <QuestionCircleOutlined />
                  </Tooltip>
                </Space>
              }
            >
              <Input
                value={rule.pattern}
                onChange={(e) => handleUpdateRule(index, 'pattern', e.target.value)}
                placeholder="正则表达式"
                disabled={readOnly}
              />
            </Form.Item>
          )}

          {/* 范围和长度规则 */}
          {(rule.type === 'range' || rule.type === 'length') && (
            <>
              <Form.Item label="最小值">
                <InputNumber
                  value={rule.min}
                  onChange={(value) => handleUpdateRule(index, 'min', value)}
                  placeholder="最小值"
                  style={{ width: '100%' }}
                  disabled={readOnly}
                />
              </Form.Item>
              <Form.Item label="最大值">
                <InputNumber
                  value={rule.max}
                  onChange={(value) => handleUpdateRule(index, 'max', value)}
                  placeholder="最大值"
                  style={{ width: '100%' }}
                  disabled={readOnly}
                />
              </Form.Item>
            </>
          )}

          {/* 自定义规则 */}
          {rule.type === 'custom' && (
            <Form.Item
              label={
                <Space>
                  <span>表达式</span>
                  <Tooltip title="自定义验证表达式，可以使用JavaScript表达式">
                    <QuestionCircleOutlined />
                  </Tooltip>
                </Space>
              }
            >
              <Input.TextArea
                value={rule.expression}
                onChange={(e) => handleUpdateRule(index, 'expression', e.target.value)}
                placeholder="JavaScript表达式，返回true表示验证通过"
                rows={3}
                disabled={readOnly}
              />
            </Form.Item>
          )}
        </Space>
      </div>
    );
  };

  // 获取规则类型的显示名称
  const getRuleTypeDisplayName = (type: ValidationRuleType): string => {
    const typeMap: Record<ValidationRuleType, string> = {
      required: '必填',
      format: '格式',
      range: '范围',
      length: '长度',
      regex: '正则表达式',
      unique: '唯一',
      custom: '自定义',
    };

    return typeMap[type] || type;
  };

  // 获取规则的简要描述
  const getRuleSummary = (rule: ValidationRule): string => {
    switch (rule.type) {
      case 'required':
        return '必填字段';
      case 'format':
        return `格式: ${rule.pattern || '未指定'}`;
      case 'range':
        return `范围: ${rule.min ?? '不限'} 至 ${rule.max ?? '不限'}`;
      case 'length':
        return `长度: ${rule.min ?? '不限'} 至 ${rule.max ?? '不限'}`;
      case 'regex':
        return `正则: ${rule.pattern || '未指定'}`;
      case 'unique':
        return '值必须唯一';
      case 'custom':
        return '自定义表达式';
      default:
        return '未知规则';
    }
  };

  return (
    <div className="validation-rule-editor">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography.Title level={5} style={{ margin: 0 }}>验证规则</Typography.Title>
        {!readOnly && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddRule}
            size="small"
          >
            添加规则
          </Button>
        )}
      </div>

      {rules.length > 0 ? (
        <Collapse
          accordion
          activeKey={expandedRuleIndex !== null ? expandedRuleIndex.toString() : undefined}
          onChange={(key) => setExpandedRuleIndex(key ? Number(key) : null)}
        >
          {rules.map((rule, index) => (
            <Panel
              header={
                <Space>
                  <span>{getRuleTypeDisplayName(rule.type)}</span>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {getRuleSummary(rule)}
                  </Text>
                </Space>
              }
              key={index.toString()}
              extra={
                !readOnly && (
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRule(index);
                    }}
                    size="small"
                  />
                )
              }
            >
              {renderRuleForm(rule, index)}
            </Panel>
          ))}
        </Collapse>
      ) : (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <Text type="secondary">
            {readOnly ? '没有验证规则' : '点击「添加规则」按钮添加验证规则'}
          </Text>
        </div>
      )}
    </div>
  );
};

export default ValidationRuleEditor;
