import { useState } from 'react';
import { modelService } from '@/services/modelService';
import type { CreateMetaFieldDto, UpdateMetaFieldDto, MetaField, ApiResponse } from '@/types/data-models';

/**
 * 元数据字段相关hooks
 */
export const useMetaFields = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 获取元数据字段列表
   */
  const getMetaFields = async (tableId?: string): Promise<ApiResponse<MetaField[]>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.getMetaFields(tableId);
      return response;
    } catch (err: any) {
      setError(err.message || '获取元数据字段失败');
      return {
        success: false,
        error: err.message || '获取元数据字段失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取单个元数据字段
   */
  const getMetaField = async (id: string): Promise<ApiResponse<MetaField>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.getMetaField(id);
      return response;
    } catch (err: any) {
      setError(err.message || '获取元数据字段详情失败');
      return {
        success: false,
        error: err.message || '获取元数据字段详情失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 创建元数据字段
   */
  const createMetaField = async (fieldDto: CreateMetaFieldDto): Promise<ApiResponse<MetaField>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.createMetaField(fieldDto);
      return response;
    } catch (err: any) {
      setError(err.message || '创建元数据字段失败');
      return {
        success: false,
        error: err.message || '创建元数据字段失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 更新元数据字段
   */
  const updateMetaField = async (id: string, fieldDto: UpdateMetaFieldDto): Promise<ApiResponse<MetaField>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.updateMetaField(id, fieldDto);
      return response;
    } catch (err: any) {
      setError(err.message || '更新元数据字段失败');
      return {
        success: false,
        error: err.message || '更新元数据字段失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 删除元数据字段
   */
  const deleteMetaField = async (id: string): Promise<ApiResponse<any>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.deleteMetaField(id);
      return response;
    } catch (err: any) {
      setError(err.message || '删除元数据字段失败');
      return {
        success: false,
        error: err.message || '删除元数据字段失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取所有字段类型
   */
  const getFieldTypes = async (): Promise<ApiResponse<string[]>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.getFieldTypes();
      return response;
    } catch (err: any) {
      setError(err.message || '获取字段类型失败');
      return {
        success: false,
        error: err.message || '获取字段类型失败'
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getMetaFields,
    getMetaField,
    createMetaField,
    updateMetaField,
    deleteMetaField,
    getFieldTypes
  };
};
