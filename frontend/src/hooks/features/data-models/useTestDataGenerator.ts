import { useState } from 'react';
import { modelService } from '@/services/modelService';
import type {
  TestDataGenerateRequest,
  TestDataPreviewResponse,
  SaveTestDataTemplateRequest,
  TestDataTemplateResponse,
  TestDataTemplatesResponse,
  ApiResponse
} from '@/types/data-models';

/**
 * 测试数据生成相关hooks
 */
export const useTestDataGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 生成测试数据
   */
  const generateTestData = async (requestData: TestDataGenerateRequest): Promise<TestDataPreviewResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.generateTestData(requestData);
      return response;
    } catch (err: any) {
      setError(err.message || '生成测试数据失败');
      return {
        success: false,
        error: err.message || '生成测试数据失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 预览测试数据
   */
  const previewTestData = async (requestData: TestDataGenerateRequest): Promise<TestDataPreviewResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.previewTestData(requestData);
      return response;
    } catch (err: any) {
      setError(err.message || '预览测试数据失败');
      return {
        success: false,
        error: err.message || '预览测试数据失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 保存测试数据模板
   */
  const saveTestDataTemplate = async (requestData: SaveTestDataTemplateRequest): Promise<TestDataTemplateResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.saveTestDataTemplate(requestData);
      return response;
    } catch (err: any) {
      setError(err.message || '保存测试数据模板失败');
      return {
        success: false,
        error: err.message || '保存测试数据模板失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取表的测试数据模板
   */
  const getTableTestDataTemplates = async (tableId: string): Promise<TestDataTemplatesResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.getTableTestDataTemplates(tableId);
      return response;
    } catch (err: any) {
      setError(err.message || '获取表的测试数据模板失败');
      return {
        success: false,
        error: err.message || '获取表的测试数据模板失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取测试数据模板详情
   */
  const getTestDataTemplate = async (id: string): Promise<TestDataTemplateResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.getTestDataTemplate(id);
      return response;
    } catch (err: any) {
      setError(err.message || '获取测试数据模板详情失败');
      return {
        success: false,
        error: err.message || '获取测试数据模板详情失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 删除测试数据模板
   */
  const deleteTestDataTemplate = async (id: string): Promise<ApiResponse<any>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.deleteTestDataTemplate(id);
      return response;
    } catch (err: any) {
      setError(err.message || '删除测试数据模板失败');
      return {
        success: false,
        error: err.message || '删除测试数据模板失败'
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    generateTestData,
    previewTestData,
    saveTestDataTemplate,
    getTableTestDataTemplates,
    getTestDataTemplate,
    deleteTestDataTemplate
  };
};
