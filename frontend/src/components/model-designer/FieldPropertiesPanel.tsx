import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Switch,
  Collapse,
  Divider,
  Space,
  Button,
  Card,
  Tooltip,
  Typography,
  InputNumber,
  Tag,
  message,
  Tabs,
  Empty,
  Table,
  Radio,
  Drawer
} from 'antd';
import {
  QuestionCircleOutlined,
  PlusOutlined,
  DeleteOutlined,
  SyncOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  SafetyOutlined,
  BuildOutlined
} from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import ValidationRuleEditor from './ValidationRuleEditor';
import { FieldType } from '../../types';
import type { ModelField, ValidationRule } from '../../types';
import { getFieldTypeDisplayName } from '../../utils/modelUtils';

const { Option } = Select;
const { TabPane } = Tabs;
const { Text, Title } = Typography;

interface FieldPropertiesPanelProps {
  field: ModelField | null;
  onFieldUpdate: (field: ModelField) => void;
  readOnly?: boolean;
}

/**
 * 字段属性编辑面板组件
 */
const FieldPropertiesPanel: React.FC<FieldPropertiesPanelProps> = ({
  field,
  onFieldUpdate,
  readOnly = false,
}) => {
  // 当没有选中字段时，显示空状态
  if (!field) {
    return (
      <Card
        title="字段属性"
        className="field-properties-card"
        style={{ height: '100%' }}
      >
        <Empty description="请选择一个字段" />
      </Card>
    );
  }

  // 更新字段属性
  const handleFieldChange = (key: string, value: any) => {
    if (!field) return;

    // 特殊处理：如果修改字段类型，可能需要重置一些相关属性
    if (key === 'type') {
      const newField = {
        ...field,
        [key]: value,
      };

      // 重置类型相关的默认值
      switch (value as FieldType) {
        case FieldType.STRING:
          newField.defaultValue = '';
          break;
        case FieldType.NUMBER:
        case FieldType.INTEGER:
        case FieldType.FLOAT:
          newField.defaultValue = null;
          break;
        case FieldType.BOOLEAN:
          newField.defaultValue = false;
          break;
        default:
          newField.defaultValue = null;
      }

      onFieldUpdate(newField);
    } else {
      // 常规属性更新
      onFieldUpdate({
        ...field,
        [key]: value,
      });
    }
  };

  // 更新验证规则
  const handleValidationRulesChange = (rules: ValidationRule[]) => {
    if (!field) return;

    onFieldUpdate({
      ...field,
      validationRules: rules,
    });
  };

  // 更新高级属性
  const handleAdvancedPropertyChange = (property: string, value: any) => {
    if (!field) return;

    const updatedSettings = {
      ...(field.advancedSettings || {}),
      [property]: value
    };

    onFieldUpdate({
      ...field,
      advancedSettings: updatedSettings,
    });
  };

  return (
    <Card
      title="字段属性"
      className="field-properties-card"
      style={{ height: '100%', overflowY: 'auto' }}
    >
      <Tabs defaultActiveKey="basic">
        <TabPane
          tab={
            <span>
              <InfoCircleOutlined />
              基本信息
            </span>
          }
          key="basic"
        >
          <Form layout="vertical">
            <Form.Item label="显示名称" required>
              <Input
                value={field.displayName}
                onChange={(e) => handleFieldChange('displayName', e.target.value)}
                placeholder="字段显示名称"
                disabled={readOnly}
              />
            </Form.Item>

            <Form.Item
              label="技术名称"
              required
              tooltip="API和数据库中使用的字段名称，建议使用英文和下划线"
            >
              <Input
                value={field.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="技术名称(英文)"
                disabled={readOnly || field.isPrimaryKey || field.isSystem}
              />
            </Form.Item>

            <Form.Item label="字段类型" required>
              <Select
                value={field.type}
                onChange={(value) => handleFieldChange('type', value)}
                style={{ width: '100%' }}
                disabled={readOnly || field.isPrimaryKey}
              >
                <Option value={FieldType.STRING}>文本</Option>
                <Option value={FieldType.RICH_TEXT}>富文本</Option>
                <Option value={FieldType.NUMBER}>数字</Option>
                <Option value={FieldType.INTEGER}>整数</Option>
                <Option value={FieldType.FLOAT}>浮点数</Option>
                <Option value={FieldType.BOOLEAN}>布尔值</Option>
                <Option value={FieldType.DATE}>日期</Option>
                <Option value={FieldType.DATETIME}>日期时间</Option>
                <Option value={FieldType.TIME}>时间</Option>
                <Option value={FieldType.EMAIL}>邮箱</Option>
                <Option value={FieldType.URL}>网址</Option>
                <Option value={FieldType.PHONE}>电话</Option>
                <Option value={FieldType.JSON}>JSON</Option>
                <Option value={FieldType.ENUM}>枚举</Option>
                <Option value={FieldType.REFERENCE}>引用</Option>
              </Select>
            </Form.Item>

            <Form.Item label="描述">
              <Input.TextArea
                value={field.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="字段描述(可选)"
                rows={3}
                disabled={readOnly}
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Switch
                  checked={field.isRequired}
                  onChange={(checked) => handleFieldChange('isRequired', checked)}
                  disabled={readOnly || field.isPrimaryKey}
                />
                <span>必填字段</span>
              </Space>
            </Form.Item>

            <Form.Item>
              <Space>
                <Switch
                  checked={field.isUnique}
                  onChange={(checked) => handleFieldChange('isUnique', checked)}
                  disabled={readOnly || field.isPrimaryKey}
                />
                <span>唯一字段</span>
              </Space>
            </Form.Item>

            <Form.Item>
              <Space>
                <Switch
                  checked={field.isSearchable}
                  onChange={(checked) => handleFieldChange('isSearchable', checked)}
                  disabled={readOnly}
                />
                <span>可搜索</span>
              </Space>
            </Form.Item>

            <Form.Item>
              <Space>
                <Switch
                  checked={field.isSortable}
                  onChange={(checked) => handleFieldChange('isSortable', checked)}
                  disabled={readOnly}
                />
                <span>可排序</span>
              </Space>
            </Form.Item>
          </Form>
        </TabPane>

        <TabPane
          tab={
            <span>
              <SettingOutlined />
              默认值
            </span>
          }
          key="default"
        >
          <Form layout="vertical">
            <Form.Item
              label="设置默认值"
              tooltip="当创建新记录时，如果不提供值，将使用此默认值"
            >
              {field.type === FieldType.STRING || field.type === FieldType.RICH_TEXT ||
               field.type === FieldType.EMAIL || field.type === FieldType.URL ||
               field.type === FieldType.PHONE ? (
                <Input
                  value={field.defaultValue as string}
                  onChange={(e) => handleFieldChange('defaultValue', e.target.value)}
                  placeholder="默认值"
                  disabled={readOnly}
                />
              ) : field.type === FieldType.NUMBER || field.type === FieldType.INTEGER ||
                   field.type === FieldType.FLOAT ? (
                <InputNumber
                  value={field.defaultValue as number}
                  onChange={(value) => handleFieldChange('defaultValue', value)}
                  style={{ width: '100%' }}
                  placeholder="默认值"
                  disabled={readOnly}
                />
              ) : field.type === FieldType.BOOLEAN ? (
                <Select
                  value={field.defaultValue as boolean}
                  onChange={(value) => handleFieldChange('defaultValue', value)}
                  style={{ width: '100%' }}
                  disabled={readOnly}
                >
                  <Option value={true}>是</Option>
                  <Option value={false}>否</Option>
                </Select>
              ) : field.type === FieldType.DATE || field.type === FieldType.DATETIME ||
                   field.type === FieldType.TIME ? (
                <Select
                  value={field.defaultValue as string}
                  onChange={(value) => handleFieldChange('defaultValue', value)}
                  style={{ width: '100%' }}
                  disabled={readOnly}
                >
                  <Option value="NOW">当前时间</Option>
                  <Option value="">无</Option>
                </Select>
              ) : field.type === FieldType.ENUM ? (
                <Input
                  value={field.defaultValue as string}
                  onChange={(e) => handleFieldChange('defaultValue', e.target.value)}
                  placeholder="默认枚举值"
                  disabled={readOnly}
                />
              ) : (
                <Text type="secondary">当前字段类型不支持设置默认值</Text>
              )}
            </Form.Item>
          </Form>
        </TabPane>

        <TabPane
          tab={
            <span>
              <SafetyOutlined />
              验证规则
            </span>
          }
          key="validation"
        >
          <ValidationRuleEditor
            rules={field.validationRules || []}
            fieldType={field.type}
            onChange={handleValidationRulesChange}
            readOnly={readOnly}
          />
        </TabPane>

        <TabPane
          tab={
            <span>
              <BuildOutlined />
              高级设置
            </span>
          }
          key="advanced"
        >
          <Form layout="vertical">
            {/* 字符串类型的高级属性 */}
            {(field.type === FieldType.STRING || field.type === FieldType.RICH_TEXT) && (
              <>
                <Form.Item label="最小长度">
                  <InputNumber
                    value={(field.advancedSettings?.minLength as number) || 0}
                    onChange={(value) => handleAdvancedPropertyChange('minLength', value)}
                    style={{ width: '100%' }}
                    min={0}
                    disabled={readOnly}
                  />
                </Form.Item>

                <Form.Item label="最大长度">
                  <InputNumber
                    value={(field.advancedSettings?.maxLength as number) || 255}
                    onChange={(value) => handleAdvancedPropertyChange('maxLength', value)}
                    style={{ width: '100%' }}
                    min={1}
                    disabled={readOnly}
                  />
                </Form.Item>
              </>
            )}

            {/* 数字类型的高级属性 */}
            {(field.type === FieldType.NUMBER || field.type === FieldType.INTEGER ||
              field.type === FieldType.FLOAT) && (
              <>
                <Form.Item label="最小值">
                  <InputNumber
                    value={(field.advancedSettings?.min as number) || null}
                    onChange={(value) => handleAdvancedPropertyChange('min', value)}
                    style={{ width: '100%' }}
                    disabled={readOnly}
                  />
                </Form.Item>

                <Form.Item label="最大值">
                  <InputNumber
                    value={(field.advancedSettings?.max as number) || null}
                    onChange={(value) => handleAdvancedPropertyChange('max', value)}
                    style={{ width: '100%' }}
                    disabled={readOnly}
                  />
                </Form.Item>

                {field.type === FieldType.FLOAT && (
                  <Form.Item label="小数位数">
                    <InputNumber
                      value={(field.advancedSettings?.decimalPlaces as number) || 2}
                      onChange={(value) => handleAdvancedPropertyChange('decimalPlaces', value)}
                      style={{ width: '100%' }}
                      min={0}
                      max={10}
                      disabled={readOnly}
                    />
                  </Form.Item>
                )}
              </>
            )}

            {/* 枚举类型的高级属性 */}
            {field.type === FieldType.ENUM && (
              <Form.Item label="枚举值" required>
                <Input.TextArea
                  value={(field.advancedSettings?.enumValues as string) || ''}
                  onChange={(e) => handleAdvancedPropertyChange('enumValues', e.target.value)}
                  placeholder="请输入枚举值，每行一个值"
                  rows={5}
                  disabled={readOnly}
                />
                <Text type="secondary">
                  每行输入一个枚举值，格式为：value:label，如果不指定标签，则值和标签相同
                </Text>
              </Form.Item>
            )}

            {/* 引用类型的高级属性 */}
            {field.type === FieldType.REFERENCE && (
              <>
                <Form.Item label="引用模型" required>
                  <Input
                    value={(field.advancedSettings?.referenceModel as string) || ''}
                    onChange={(e) => handleAdvancedPropertyChange('referenceModel', e.target.value)}
                    placeholder="引用的模型ID"
                    disabled={readOnly}
                  />
                </Form.Item>

                <Form.Item label="引用字段">
                  <Input
                    value={(field.advancedSettings?.referenceField as string) || ''}
                    onChange={(e) => handleAdvancedPropertyChange('referenceField', e.target.value)}
                    placeholder="引用的字段名"
                    disabled={readOnly}
                  />
                </Form.Item>

                <Form.Item label="关系类型">
                  <Select
                    value={(field.advancedSettings?.relationType as string) || 'manyToOne'}
                    onChange={(value) => handleAdvancedPropertyChange('relationType', value)}
                    style={{ width: '100%' }}
                    disabled={readOnly}
                  >
                    <Option value="oneToOne">一对一</Option>
                    <Option value="oneToMany">一对多</Option>
                    <Option value="manyToOne">多对一</Option>
                    <Option value="manyToMany">多对多</Option>
                  </Select>
                </Form.Item>
              </>
            )}

            {/* 通用高级属性 */}
            <Divider />

            <Form.Item label="字段索引类型">
              <Select
                value={(field.advancedSettings?.indexType as string) || 'none'}
                onChange={(value) => handleAdvancedPropertyChange('indexType', value)}
                style={{ width: '100%' }}
                disabled={readOnly}
              >
                <Option value="none">无索引</Option>
                <Option value="index">普通索引</Option>
                <Option value="unique">唯一索引</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Switch
                  checked={(field.advancedSettings?.isVirtual as boolean) || false}
                  onChange={(checked) => handleAdvancedPropertyChange('isVirtual', checked)}
                  disabled={readOnly || field.isPrimaryKey}
                />
                <span>虚拟字段</span>
                <Text type="secondary">(不存储在数据库中)</Text>
              </Space>
            </Form.Item>
          </Form>
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default FieldPropertiesPanel;
