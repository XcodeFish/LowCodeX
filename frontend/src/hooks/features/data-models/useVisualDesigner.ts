import { useState } from 'react';
import { modelService } from '@/services/modelService';
import type {
  VisualDiagramSaveDto,
  ApiResponse,
  VisualDiagram,
  VisualDiagramResponse,
  VisualDiagramsResponse
} from '@/types/data-models';

/**
 * 模型可视化设计相关hooks
 */
export const useVisualDesigner = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 保存可视化图表
   */
  const saveVisualDiagram = async (diagramDto: VisualDiagramSaveDto): Promise<VisualDiagramResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.saveVisualDiagram(diagramDto);
      return response;
    } catch (err: any) {
      setError(err.message || '保存可视化图表失败');
      return {
        success: false,
        error: err.message || '保存可视化图表失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 更新可视化图表
   */
  const updateVisualDiagram = async (id: string, diagramDto: VisualDiagramSaveDto): Promise<VisualDiagramResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.updateVisualDiagram(id, diagramDto);
      return response;
    } catch (err: any) {
      setError(err.message || '更新可视化图表失败');
      return {
        success: false,
        error: err.message || '更新可视化图表失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取所有可视化图表
   */
  const getVisualDiagrams = async (): Promise<VisualDiagramsResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.getVisualDiagrams();
      return response;
    } catch (err: any) {
      setError(err.message || '获取所有可视化图表失败');
      return {
        success: false,
        error: err.message || '获取所有可视化图表失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取单个可视化图表
   */
  const getVisualDiagram = async (id: string): Promise<VisualDiagramResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.getVisualDiagram(id);
      return response;
    } catch (err: any) {
      setError(err.message || '获取可视化图表失败');
      return {
        success: false,
        error: err.message || '获取可视化图表失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 删除可视化图表
   */
  const deleteVisualDiagram = async (id: string): Promise<ApiResponse<any>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.deleteVisualDiagram(id);
      return response;
    } catch (err: any) {
      setError(err.message || '删除可视化图表失败');
      return {
        success: false,
        error: err.message || '删除可视化图表失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 自动生成ER图
   */
  const generateERDiagram = async (tableIds: string[]): Promise<VisualDiagramResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.generateERDiagram(tableIds);
      return response;
    } catch (err: any) {
      setError(err.message || '自动生成ER图失败');
      return {
        success: false,
        error: err.message || '自动生成ER图失败'
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    saveVisualDiagram,
    updateVisualDiagram,
    getVisualDiagrams,
    getVisualDiagram,
    deleteVisualDiagram,
    generateERDiagram
  };
};
