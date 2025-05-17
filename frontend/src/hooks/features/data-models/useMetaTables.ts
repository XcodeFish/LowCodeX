import { useState } from 'react';
import { modelService } from '@/services/modelService';
import type { CreateMetaTableDto, UpdateMetaTableDto, ModelResponse, ModelsResponse, ApiResponse } from '@/types/data-models';

// 定义返回类型接口
interface UseMetaTablesReturn {
  loading: boolean;
  error: string | null;
  getMetaTables: (params?: { tenant?: string, applicationId?: string }) => Promise<ModelsResponse>;
  getMetaTable: (id: string) => Promise<ModelResponse>;
  createMetaTable: (tableDto: CreateMetaTableDto) => Promise<ModelResponse>;
  updateMetaTable: (id: string, tableDto: UpdateMetaTableDto) => Promise<ModelResponse>;
  deleteMetaTable: (id: string) => Promise<ApiResponse<any>>;
}

/**
 * 元数据表相关hooks
 */
export const useMetaTables = (): UseMetaTablesReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 获取所有元数据表
   */
  const getMetaTables = async (params?: { tenant?: string, applicationId?: string }): Promise<ModelsResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.getMetaTables(params);
      return response;
    } catch (err: any) {
      // setError(err.message || '获取元数据表失败');
      return {
        success: false,
        error: err.message || '获取元数据表失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取单个元数据表详情
   */
  const getMetaTable = async (id: string): Promise<ModelResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.getMetaTable(id);
      return response;
    } catch (err: any) {
      setError(err.message || '获取元数据表详情失败');
      return {
        success: false,
        error: err.message || '获取元数据表详情失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 创建元数据表
   */
  const createMetaTable = async (tableDto: CreateMetaTableDto): Promise<ModelResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.createMetaTable(tableDto);
      return response;
    } catch (err: any) {
      setError(err.message || '创建元数据表失败');
      return {
        success: false,
        error: err.message || '创建元数据表失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 更新元数据表
   */
  const updateMetaTable = async (id: string, tableDto: UpdateMetaTableDto): Promise<ModelResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.updateMetaTable(id, tableDto);
      return response;
    } catch (err: any) {
      setError(err.message || '更新元数据表失败');
      return {
        success: false,
        error: err.message || '更新元数据表失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 删除元数据表
   */
  const deleteMetaTable = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.deleteMetaTable(id);
      return response;
    } catch (err: any) {
      setError(err.message || '删除元数据表失败');
      return {
        success: false,
        error: err.message || '删除元数据表失败'
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getMetaTables,
    getMetaTable,
    createMetaTable,
    updateMetaTable,
    deleteMetaTable
  };
};
