import { useState } from 'react';
import { modelService } from '@/services/modelService';
import type {
  CreateMetaRelationDto,
  UpdateMetaRelationDto,
  MetaRelation,
  ApiResponse,
  ModelRelationsResponse
} from '@/types/data-models';

/**
 * 元数据关系相关hooks
 */
export const useMetaRelations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 获取元数据关系列表
   */
  const getMetaRelations = async (sourceTableId?: string, targetTableId?: string): Promise<ModelRelationsResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.getMetaRelations(sourceTableId, targetTableId);
      return response;
    } catch (err: any) {
      setError(err.message || '获取元数据关系失败');
      return {
        success: false,
        error: err.message || '获取元数据关系失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取单个元数据关系
   */
  const getMetaRelation = async (id: string): Promise<ApiResponse<MetaRelation>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.getMetaRelation(id);
      return response;
    } catch (err: any) {
      setError(err.message || '获取元数据关系详情失败');
      return {
        success: false,
        error: err.message || '获取元数据关系详情失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 创建元数据关系
   */
  const createMetaRelation = async (relationDto: CreateMetaRelationDto): Promise<ApiResponse<MetaRelation>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.createMetaRelation(relationDto);
      return response;
    } catch (err: any) {
      setError(err.message || '创建元数据关系失败');
      return {
        success: false,
        error: err.message || '创建元数据关系失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 更新元数据关系
   */
  const updateMetaRelation = async (id: string, relationDto: UpdateMetaRelationDto): Promise<ApiResponse<MetaRelation>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.updateMetaRelation(id, relationDto);
      return response;
    } catch (err: any) {
      setError(err.message || '更新元数据关系失败');
      return {
        success: false,
        error: err.message || '更新元数据关系失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 删除元数据关系
   */
  const deleteMetaRelation = async (id: string): Promise<ApiResponse<any>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.deleteMetaRelation(id);
      return response;
    } catch (err: any) {
      setError(err.message || '删除元数据关系失败');
      return {
        success: false,
        error: err.message || '删除元数据关系失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取所有关系类型
   */
  const getRelationTypes = async (): Promise<ApiResponse<string[]>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.getRelationTypes();
      return response;
    } catch (err: any) {
      setError(err.message || '获取关系类型失败');
      return {
        success: false,
        error: err.message || '获取关系类型失败'
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getMetaRelations,
    getMetaRelation,
    createMetaRelation,
    updateMetaRelation,
    deleteMetaRelation,
    getRelationTypes
  };
};
