import { registerAs } from '@nestjs/config';

export enum TenantModeEnum {
  DATABASE = 'database',
  SCHEMA = 'schema',
  COLUMN = 'column',
}

export interface TenantConfig {
  mode: TenantModeEnum;
  idField: string;
  enabledModels: string[];
}

export default registerAs('tenant', (): TenantConfig => {
  // 获取并验证租户模式
  const modeStr = (process.env.TENANT_MODE || 'column').toLowerCase();
  const mode = validateTenantMode(modeStr);

  // 获取租户ID字段名
  const idField = process.env.TENANT_ID_FIELD || 'tenantId';

  // 从配置或默认值获取启用多租户的模型列表
  const enabledModelsStr =
    process.env.TENANT_ENABLED_MODELS ||
    'User,Role,Permission,Application,DataModel,Form,Workflow';
  const enabledModels = enabledModelsStr.split(',').map((m) => m.trim());

  return {
    mode,
    idField,
    enabledModels,
  };
});

// 验证租户模式是否有效，如果无效则返回默认值
function validateTenantMode(mode: string): TenantModeEnum {
  const validModes = Object.values(TenantModeEnum);
  if (validModes.includes(mode as TenantModeEnum)) {
    return mode as TenantModeEnum;
  }
  return TenantModeEnum.COLUMN;
}
