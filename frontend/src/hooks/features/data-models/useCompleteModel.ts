import { useState } from 'react';
import { modelService } from '@/services/modelService';
import type {
  CreateMetaTableDto,
  CreateMetaFieldDto,
  CompleteModel,
  ModelExportData,
  ApiResponse,
  CreateCompleteModelResponse,
  PublishModelResponse,
  CloneModelResponse,
  ImportModelResponse
} from '@/types/data-models';

/**
 * 完整数据模型相关hooks
 */
export const useCompleteModel = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 创建完整数据模型
   */
  const createCompleteModel = async (
    model: CreateMetaTableDto,
    fields: CreateMetaFieldDto[]
  ): Promise<ApiResponse<CreateCompleteModelResponse>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.createCompleteModel(model, fields);
      return response;
    } catch (err: any) {
      setError(err.message || '创建完整数据模型失败');
      return {
        success: false,
        error: err.message || '创建完整数据模型失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 发布数据模型
   */
  const publishModel = async (tableId: string): Promise<ApiResponse<PublishModelResponse>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.publishModel(tableId);
      return response;
    } catch (err: any) {
      setError(err.message || '发布数据模型失败');
      return {
        success: false,
        error: err.message || '发布数据模型失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 克隆数据模型
   */
  const cloneModel = async (
    tableId: string,
    newName: string,
    newDisplayName: string
  ): Promise<ApiResponse<CloneModelResponse>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.cloneModel(tableId, newName, newDisplayName);
      return response;
    } catch (err: any) {
      setError(err.message || '克隆数据模型失败');
      return {
        success: false,
        error: err.message || '克隆数据模型失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取完整数据模型信息
   */
  const getCompleteModel = async (tableId: string): Promise<ApiResponse<CompleteModel>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.getCompleteModel(tableId);
      return response;
    } catch (err: any) {
      setError(err.message || '获取完整数据模型失败');
      return {
        success: false,
        error: err.message || '获取完整数据模型失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 导出数据模型定义
   */
  const exportModelDefinition = async (tableId: string): Promise<ApiResponse<ModelExportData>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.exportModelDefinition(tableId);
      return response;
    } catch (err: any) {
      setError(err.message || '导出数据模型定义失败');
      return {
        success: false,
        error: err.message || '导出数据模型定义失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 导入数据模型定义
   */
  const importModelDefinition = async (
    definition: ModelExportData,
    tenant: string
  ): Promise<ApiResponse<ImportModelResponse>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.importModelDefinition(definition, tenant);
      return response;
    } catch (err: any) {
      setError(err.message || '导入数据模型定义失败');
      return {
        success: false,
        error: err.message || '导入数据模型定义失败'
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createCompleteModel,
    publishModel,
    cloneModel,
    getCompleteModel,
    exportModelDefinition,
    importModelDefinition
  };
};
