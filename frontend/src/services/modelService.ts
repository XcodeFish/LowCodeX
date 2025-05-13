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
} from '../types';
import { v4 as uuidv4 } from 'uuid';

const API_URL = '/api/data-models';

// 添加模拟数据，当后端API不可用时使用
const mockData = {
  models: [] as Model[],
  relations: [] as ModelRelation[],
  versions: [] as ModelVersion[]
};

// 添加请求拦截，如果后端不可用，使用本地数据
axios.interceptors.response.use(
  response => response,
  error => {
    console.warn('API请求失败，使用本地数据', error);
    // 返回一个新的Promise，避免程序崩溃
    return Promise.reject(error);
  }
);

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
      console.log('获取模型失败，使用本地数据');
      return {
        success: true,
        data: mockData.models,
        total: mockData.models.length
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
      const model = mockData.models.find(m => m.id === id);
      if (model) {
        return {
          success: true,
          data: model
        };
      }
      return {
        success: false,
        error: '模型不存在'
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
      // 使用本地数据模拟创建
      const newModel: Model = {
        id: uuidv4(),
        name: model.name,
        displayName: model.displayName,
        description: model.description || '',
        fields: model.fields || [],
        tenantId: model.tenantId || 'default-tenant',
        applicationId: model.applicationId,
        version: 1,
        isPublished: false,
        createdBy: 'local-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockData.models.push(newModel);
      return {
        success: true,
        data: newModel
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
      // 使用本地数据模拟更新
      const index = mockData.models.findIndex(m => m.id === id);
      if (index !== -1) {
        const updatedModel = {
          ...mockData.models[index],
          ...model,
          updatedAt: new Date().toISOString()
        };
        mockData.models[index] = updatedModel;
        return {
          success: true,
          data: updatedModel
        };
      }
      return {
        success: false,
        error: '模型不存在'
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
      // 使用本地数据模拟删除
      const index = mockData.models.findIndex(m => m.id === id);
      if (index !== -1) {
        mockData.models.splice(index, 1);
        return {
          success: true
        };
      }
      return {
        success: false,
        error: '模型不存在'
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
      // 使用本地数据模拟发布
      const model = mockData.models.find(m => m.id === request.id);
      if (model) {
        model.isPublished = true;
        model.updatedAt = new Date().toISOString();
        return {
          success: true,
          data: model
        };
      }
      return {
        success: false,
        error: '模型不存在'
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
      // 使用本地数据模拟关系
      const relations = mockData.relations.filter(r => r.sourceModelId === modelId || r.targetModelId === modelId);
      return {
        success: true,
        data: relations
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
      // 使用本地数据模拟创建关系
      const newRelation: ModelRelation = {
        id: uuidv4(),
        name: relation.name || `relation_${Date.now()}`,
        sourceModelId: modelId,
        targetModelId: relation.targetModelId || modelId,
        type: relation.type || 'manyToOne',
        sourceField: relation.sourceField || '',
        targetField: relation.targetField || '',
        junctionTable: relation.junctionTable,
        isRequired: relation.isRequired || false,
        displayName: relation.displayName || '',
        description: relation.description || '',
        cascadeDelete: relation.cascadeDelete || false
      };
      mockData.relations.push(newRelation);
      return {
        success: true,
        data: [newRelation]
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
      // 使用本地数据模拟版本
      const versions = mockData.versions.filter(v => v.modelId === modelId);
      return {
        success: true,
        data: versions
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
