import axios from 'axios';
import type {
  Model,
  ModelRelation,
  ModelVersion,
  CreateModelRequest,
  UpdateModelRequest,
  ModelResponse,
  ModelsResponse,
  ModelRelationsResponse,
  ModelVersionsResponse,
  PublishModelRequest,
  ModelVersionRequest,
  ModelVersionDiffRequest,
  ModelVersionDiffResponse,
  ModelDiff
} from '../types/model-types';

const API_URL = '/api/data-models';

/**
 * 数据模型服务
 * 提供与数据模型相关的API接口调用
 */
export const modelService = {
  /**
   * 获取所有数据模型
   */
  async getModels(params?: { applicationId?: string, isPublished?: boolean }): Promise<ModelsResponse> {
    try {
      const response = await axios.get(API_URL, { params });
      return {
        success: true,
        data: response.data.data,
        total: response.data.total
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || '获取数据模型失败'
      };
    }
  },

  /**
   * 获取单个数据模型
   */
  async getModelById(id: string): Promise<ModelResponse> {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || '获取数据模型详情失败'
      };
    }
  },

  /**
   * 创建数据模型
   */
  async createModel(model: CreateModelRequest): Promise<ModelResponse> {
    try {
      const response = await axios.post(API_URL, model);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || '创建数据模型失败'
      };
    }
  },

  /**
   * 更新数据模型
   */
  async updateModel(id: string, model: UpdateModelRequest): Promise<ModelResponse> {
    try {
      const response = await axios.put(`${API_URL}/${id}`, model);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || '更新数据模型失败'
      };
    }
  },

  /**
   * 删除数据模型
   */
  async deleteModel(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return {
        success: true
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || '删除数据模型失败'
      };
    }
  },

  /**
   * 发布数据模型版本
   */
  async publishModel(request: PublishModelRequest): Promise<ModelResponse> {
    try {
      const response = await axios.post(`${API_URL}/${request.id}/publish`, { comment: request.comment });
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || '发布数据模型失败'
      };
    }
  },

  /**
   * 获取模型关系
   */
  async getModelRelations(modelId: string): Promise<ModelRelationsResponse> {
    try {
      const response = await axios.get(`${API_URL}/${modelId}/relations`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || '获取模型关系失败'
      };
    }
  },

  /**
   * 创建模型关系
   */
  async createRelation(modelId: string, relation: Partial<ModelRelation>): Promise<ModelRelationsResponse> {
    try {
      const response = await axios.post(`${API_URL}/${modelId}/relations`, relation);
      return {
        success: true,
        data: [response.data]
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || '创建模型关系失败'
      };
    }
  },

  /**
   * 更新模型关系
   */
  async updateRelation(modelId: string, relationId: string, relation: Partial<ModelRelation>): Promise<ModelRelationsResponse> {
    try {
      const response = await axios.put(`${API_URL}/${modelId}/relations/${relationId}`, relation);
      return {
        success: true,
        data: [response.data]
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || '更新模型关系失败'
      };
    }
  },

  /**
   * 删除模型关系
   */
  async deleteRelation(modelId: string, relationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await axios.delete(`${API_URL}/${modelId}/relations/${relationId}`);
      return {
        success: true
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || '删除模型关系失败'
      };
    }
  },

  /**
   * 获取模型版本历史
   */
  async getModelVersions(modelId: string): Promise<ModelVersionsResponse> {
    try {
      const response = await axios.get(`${API_URL}/${modelId}/versions`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || '获取模型版本历史失败'
      };
    }
  },

  /**
   * 获取指定版本的模型
   */
  async getModelVersion(modelId: string, version: number): Promise<ModelResponse> {
    try {
      const response = await axios.get(`${API_URL}/${modelId}/versions/${version}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || '获取模型版本失败'
      };
    }
  },

  /**
   * 比较两个版本的差异
   */
  async compareVersions(request: ModelVersionDiffRequest): Promise<ModelVersionDiffResponse> {
    try {
      const response = await axios.get(
        `${API_URL}/${request.modelId}/versions/diff`,
        { params: { sourceVersion: request.sourceVersion, targetVersion: request.targetVersion } }
      );
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || '比较版本差异失败'
      };
    }
  },

  /**
   * 回滚到指定版本
   */
  async rollbackToVersion(request: ModelVersionRequest): Promise<ModelResponse> {
    try {
      const response = await axios.post(`${API_URL}/${request.modelId}/rollback`, {
        version: request.version,
        comment: request.comment
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || '回滚版本失败'
      };
    }
  },

  /**
   * 复制数据模型
   */
  async duplicateModel(id: string, newName: string): Promise<ModelResponse> {
    try {
      const response = await axios.post(`${API_URL}/${id}/duplicate`, { newName });
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || '复制数据模型失败'
      };
    }
  }
};
