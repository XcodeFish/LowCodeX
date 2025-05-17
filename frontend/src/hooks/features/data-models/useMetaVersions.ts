import { useState } from 'react';
import { modelService } from '@/services/modelService';
import type {
  CreateMetaVersionDto,
  UpdateMetaVersionDto,
  MetaVersion,
  ApiResponse,
  ModelVersionsResponse,
  ModelVersionDiffResponse
} from '@/types/data-models';

/**
 * 元数据版本相关hooks
 */
export const useMetaVersions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 获取元数据版本列表
   */
  const getMetaVersions = async (tableId?: string): Promise<ModelVersionsResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.getMetaVersions(tableId);
      return response;
    } catch (err: any) {
      setError(err.message || '获取元数据版本失败');
      return {
        success: false,
        error: err.message || '获取元数据版本失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取版本历史
   */
  const getVersionHistory = async (params?: { tableId?: string, publishedOnly?: boolean }): Promise<ModelVersionsResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.getVersionHistory(params);
      return response;
    } catch (err: any) {
      setError(err.message || '获取版本历史失败');
      return {
        success: false,
        error: err.message || '获取版本历史失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取单个元数据版本详情
   */
  const getMetaVersion = async (id: string): Promise<ApiResponse<MetaVersion>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.getMetaVersion(id);
      return response;
    } catch (err: any) {
      setError(err.message || '获取元数据版本详情失败');
      return {
        success: false,
        error: err.message || '获取元数据版本详情失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 创建元数据版本
   */
  const createMetaVersion = async (versionDto: CreateMetaVersionDto): Promise<ApiResponse<MetaVersion>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.createMetaVersion(versionDto);
      return response;
    } catch (err: any) {
      setError(err.message || '创建元数据版本失败');
      return {
        success: false,
        error: err.message || '创建元数据版本失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 更新元数据版本
   */
  const updateMetaVersion = async (id: string, versionDto: UpdateMetaVersionDto): Promise<ApiResponse<MetaVersion>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.updateMetaVersion(id, versionDto);
      return response;
    } catch (err: any) {
      setError(err.message || '更新元数据版本失败');
      return {
        success: false,
        error: err.message || '更新元数据版本失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 发布版本
   */
  const publishVersion = async (id: string): Promise<ApiResponse<MetaVersion>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.publishVersion(id);
      return response;
    } catch (err: any) {
      setError(err.message || '发布版本失败');
      return {
        success: false,
        error: err.message || '发布版本失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 比较两个版本
   */
  const compareVersions = async (oldVersionId: string, newVersionId: string): Promise<ModelVersionDiffResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.compareVersions(oldVersionId, newVersionId);
      return response;
    } catch (err: any) {
      setError(err.message || '比较版本失败');
      return {
        success: false,
        error: err.message || '比较版本失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 恢复版本
   */
  const restoreVersion = async (id: string): Promise<ApiResponse<MetaVersion>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.restoreVersion(id);
      return response;
    } catch (err: any) {
      setError(err.message || '恢复版本失败');
      return {
        success: false,
        error: err.message || '恢复版本失败'
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getMetaVersions,
    getVersionHistory,
    getMetaVersion,
    createMetaVersion,
    updateMetaVersion,
    publishVersion,
    compareVersions,
    restoreVersion
  };
};
