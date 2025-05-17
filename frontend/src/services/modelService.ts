import type {
  CreateMetaTableDto,
  UpdateMetaTableDto,
  CreateMetaFieldDto,
  UpdateMetaFieldDto,
  MetaField,
  CreateMetaRelationDto,
  UpdateMetaRelationDto,
  MetaRelation,
  CreateMetaVersionDto,
  UpdateMetaVersionDto,
  MetaVersion,
  ApiResponse,
  CompleteModel,
  ModelExportData,
  ModelResponse,
  ModelsResponse,
  ModelRelationsResponse,
  ModelVersionsResponse,
  ModelVersionDiffResponse,
  CreateCompleteModelResponse,
  PublishModelResponse,
  CloneModelResponse,
  ImportModelResponse,
  ImpactAnalysisRequest,
  ImpactAnalysisResponse,
  VisualDiagramSaveDto,
  VisualDiagramResponse,
  VisualDiagramsResponse,
  TestDataGenerateRequest,
  TestDataPreviewResponse,
  SaveTestDataTemplateRequest,
  TestDataTemplateResponse,
  TestDataTemplatesResponse,
  CreateModelApprovalDto,
  ApproveModelDto,
  ModelApprovalResponse,
  ModelApprovalsResponse,
  ModelApprovalHistoryResponse
} from '../types/data-models';
import request, { markErrorAsHandled } from './request';

const API_URL = '/v1/data-models';

/**
 * 数据模型服务
 * 提供与数据模型相关的API接口调用
 */
export const modelService = {
  // ===== 元数据表 =====

  /**
   * 获取所有元数据表
   */
  async getMetaTables(params?: { tenant?: string, applicationId?: string }): Promise<ModelsResponse> {
    try {
       const response = await request.get(`${API_URL}/tables`, { params });
        // 适配后端返回结构
        if (response && (response.code === 200 || response.success)) {
          return response;
        }
        return {
          success: false,
          error: response?.message || '获取元数据表失败1'
        };
    } catch (error: any) {
      // markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '获取元数据表失败2'
      };
    }
  },

  /**
   * 获取单个元数据表详情
   */
  async getMetaTable(id: string): Promise<ModelResponse> {
    try {
      const response = await request.get(`${API_URL}/tables/${id}`);
      return response;
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '获取元数据表详情失败'
      };
    }
  },

  /**
   * 创建元数据表
   */
  async createMetaTable(tableDto: CreateMetaTableDto): Promise<ModelResponse> {
    try {
      const response = await request.post(`${API_URL}/tables`, tableDto);
      return response;
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '创建元数据表失败'
      };
    }
  },

  /**
   * 更新元数据表
   */
  async updateMetaTable(id: string, tableDto: UpdateMetaTableDto): Promise<ModelResponse> {
    try {
      const response = await request.patch(`${API_URL}/tables/${id}`, tableDto);
      return response;
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '更新元数据表失败'
      };
    }
  },

  /**
   * 删除元数据表
   */
  async deleteMetaTable(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await request.delete(`${API_URL}/tables/${id}`);
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '删除元数据表失败'
      };
    }
  },

  // ===== 元数据字段 =====

  /**
   * 获取元数据字段列表
   */
  async getMetaFields(tableId?: string): Promise<ApiResponse<MetaField[]>> {
    try {
      const params = tableId ? { tableId } : undefined;
      const response = await request.get(`${API_URL}/fields`, { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '获取元数据字段失败'
      };
    }
  },

  /**
   * 获取单个元数据字段
   */
  async getMetaField(id: string): Promise<ApiResponse<MetaField>> {
    try {
      const response = await request.get(`${API_URL}/fields/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '获取元数据字段详情失败'
      };
    }
  },

  /**
   * 创建元数据字段
   */
  async createMetaField(fieldDto: CreateMetaFieldDto): Promise<ApiResponse<MetaField>> {
    try {
      const response = await request.post(`${API_URL}/fields`, fieldDto);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '创建元数据字段失败'
      };
    }
  },

  /**
   * 更新元数据字段
   */
  async updateMetaField(id: string, fieldDto: UpdateMetaFieldDto): Promise<ApiResponse<MetaField>> {
    try {
      const response = await request.patch(`${API_URL}/fields/${id}`, fieldDto);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '更新元数据字段失败'
      };
    }
  },

  /**
   * 删除元数据字段
   */
  async deleteMetaField(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await request.delete(`${API_URL}/fields/${id}`);
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '删除元数据字段失败'
      };
    }
  },

  /**
   * 获取所有字段类型
   */
  async getFieldTypes(): Promise<ApiResponse<string[]>> {
    try {
      const response = await request.get(`${API_URL}/fields/types/all`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '获取字段类型失败'
      };
    }
  },

  // ===== 元数据关系 =====

  /**
   * 获取元数据关系列表
   */
  async getMetaRelations(sourceTableId?: string, targetTableId?: string): Promise<ModelRelationsResponse> {
    try {
      const params: any = {};
      if (sourceTableId) params.sourceTableId = sourceTableId;
      if (targetTableId) params.targetTableId = targetTableId;

      const response = await request.get(`${API_URL}/relations`, { params });
      return response;
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '获取元数据关系失败'
      };
    }
  },

  /**
   * 获取单个元数据关系
   */
  async getMetaRelation(id: string): Promise<ApiResponse<MetaRelation>> {
    try {
      const response = await request.get(`${API_URL}/relations/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '获取元数据关系详情失败'
      };
    }
  },

  /**
   * 创建元数据关系
   */
  async createMetaRelation(relationDto: CreateMetaRelationDto): Promise<ApiResponse<MetaRelation>> {
    try {
      const response = await request.post(`${API_URL}/relations`, relationDto);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '创建元数据关系失败'
      };
    }
  },

  /**
   * 更新元数据关系
   */
  async updateMetaRelation(id: string, relationDto: UpdateMetaRelationDto): Promise<ApiResponse<MetaRelation>> {
    try {
      const response = await request.patch(`${API_URL}/relations/${id}`, relationDto);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '更新元数据关系失败'
      };
    }
  },

  /**
   * 删除元数据关系
   */
  async deleteMetaRelation(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await request.delete(`${API_URL}/relations/${id}`);
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '删除元数据关系失败'
      };
    }
  },

  /**
   * 获取所有关系类型
   */
  async getRelationTypes(): Promise<ApiResponse<string[]>> {
    try {
      const response = await request.get(`${API_URL}/relations/types/all`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '获取关系类型失败'
      };
    }
  },

  // ===== 元数据版本 =====

  /**
   * 获取元数据版本列表
   */
  async getMetaVersions(tableId?: string): Promise<ModelVersionsResponse> {
    try {
      const params = tableId ? { tableId } : undefined;
      const response = await request.get(`${API_URL}/versions`, { params });
      return response;
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '获取元数据版本失败'
      };
    }
  },

  /**
   * 获取版本历史
   */
  async getVersionHistory(params?: { tableId?: string, publishedOnly?: boolean }): Promise<ModelVersionsResponse> {
    try {
      const response = await request.get(`${API_URL}/versions/history`, { params });
      return response;
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '获取版本历史失败'
      };
    }
  },

  /**
   * 获取单个元数据版本详情
   */
  async getMetaVersion(id: string): Promise<ApiResponse<MetaVersion>> {
    try {
      const response = await request.get(`${API_URL}/versions/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '获取元数据版本详情失败'
      };
    }
  },

  /**
   * 创建元数据版本
   */
  async createMetaVersion(versionDto: CreateMetaVersionDto): Promise<ApiResponse<MetaVersion>> {
    try {
      const response = await request.post(`${API_URL}/versions`, versionDto);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '创建元数据版本失败'
      };
    }
  },

  /**
   * 更新元数据版本
   */
  async updateMetaVersion(id: string, versionDto: UpdateMetaVersionDto): Promise<ApiResponse<MetaVersion>> {
    try {
      const response = await request.patch(`${API_URL}/versions/${id}`, versionDto);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '更新元数据版本失败'
      };
    }
  },

  /**
   * 发布版本
   */
  async publishVersion(id: string): Promise<ApiResponse<MetaVersion>> {
    try {
      const response = await request.post(`${API_URL}/versions/${id}/publish`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '发布版本失败'
      };
    }
  },

  /**
   * 比较两个版本
   */
  async compareVersions(oldVersionId: string, newVersionId: string): Promise<ModelVersionDiffResponse> {
    try {
      const response = await request.post(`${API_URL}/versions/compare`, {
        oldVersionId,
        newVersionId
      });
      return response;
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '比较版本失败'
      };
    }
  },

  /**
   * 恢复版本
   */
  async restoreVersion(id: string): Promise<ApiResponse<MetaVersion>> {
    try {
      const response = await request.post(`${API_URL}/versions/${id}/restore`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '恢复版本失败'
      };
    }
  },

  // ===== 模型发布审批 =====

  /**
   * 创建模型发布审批申请
   */
  async createModelApproval(approvalDto: CreateModelApprovalDto): Promise<ModelApprovalResponse> {
    try {
      const response = await request.post(`${API_URL}/approvals`, approvalDto);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '创建模型发布审批申请失败'
      };
    }
  },

  /**
   * 获取模型发布审批列表
   */
  async getModelApprovals(params?: { tableId?: string, status?: string, requestedBy?: string, approvedBy?: string }): Promise<ModelApprovalsResponse> {
    try {
      const response = await request.get(`${API_URL}/approvals`, { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '获取模型发布审批列表失败'
      };
    }
  },

  /**
   * 获取单个模型发布审批详情
   */
  async getModelApproval(id: string): Promise<ModelApprovalResponse> {
    try {
      const response = await request.get(`${API_URL}/approvals/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '获取模型发布审批详情失败'
      };
    }
  },

  /**
   * 审批模型发布申请
   */
  async approveModel(id: string, approveDto: ApproveModelDto): Promise<ModelApprovalResponse> {
    try {
      const response = await request.put(`${API_URL}/approvals/${id}/approve`, approveDto);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '审批模型发布申请失败'
      };
    }
  },

  /**
   * 取消模型发布审批申请
   */
  async cancelModelApproval(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await request.delete(`${API_URL}/approvals/${id}`);
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '取消模型发布审批申请失败'
      };
    }
  },

  /**
   * 获取模型审批历史
   */
  async getApprovalHistory(tableId: string): Promise<ModelApprovalHistoryResponse> {
    try {
      const response = await request.get(`${API_URL}/approvals/table/${tableId}/history`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '获取模型审批历史失败'
      };
    }
  },

  // ===== 模型变更影响分析 =====

  /**
   * 分析模型变更影响
   */
  async analyzeImpact(requestData: ImpactAnalysisRequest): Promise<ImpactAnalysisResponse> {
    try {
      const response = await request.post(`${API_URL}/impact-analysis`, requestData);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '分析模型变更影响失败'
      };
    }
  },

  // ===== 测试数据生成 =====

  /**
   * 生成测试数据
   */
  async generateTestData(requestData: TestDataGenerateRequest): Promise<TestDataPreviewResponse> {
    try {
      const response = await request.post(`${API_URL}/test-data/generate`, requestData);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '生成测试数据失败'
      };
    }
  },

  /**
   * 预览测试数据
   */
  async previewTestData(requestData: TestDataGenerateRequest): Promise<TestDataPreviewResponse> {
    try {
      const response = await request.post(`${API_URL}/test-data/preview`, requestData);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '预览测试数据失败'
      };
    }
  },

  /**
   * 保存测试数据模板
   */
  async saveTestDataTemplate(requestData: SaveTestDataTemplateRequest): Promise<TestDataTemplateResponse> {
    try {
      const response = await request.post(`${API_URL}/test-data/templates`, requestData);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '保存测试数据模板失败'
      };
    }
  },

  /**
   * 获取表的测试数据模板
   */
  async getTableTestDataTemplates(tableId: string): Promise<TestDataTemplatesResponse> {
    try {
      const response = await request.get(`${API_URL}/test-data/templates/${tableId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '获取表的测试数据模板失败'
      };
    }
  },

  /**
   * 获取测试数据模板详情
   */
  async getTestDataTemplate(id: string): Promise<TestDataTemplateResponse> {
    try {
      const response = await request.get(`${API_URL}/test-data/templates/detail/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '获取测试数据模板详情失败'
      };
    }
  },

  /**
   * 删除测试数据模板
   */
  async deleteTestDataTemplate(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await request.delete(`${API_URL}/test-data/templates/${id}`);
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '删除测试数据模板失败'
      };
    }
  },

  // ===== 模型可视化设计 =====

  /**
   * 保存可视化图表
   */
  async saveVisualDiagram(diagramDto: VisualDiagramSaveDto): Promise<VisualDiagramResponse> {
    try {
      const response = await request.post(`${API_URL}/visual-designer/diagrams`, diagramDto);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '保存可视化图表失败'
      };
    }
  },

  /**
   * 更新可视化图表
   */
  async updateVisualDiagram(id: string, diagramDto: VisualDiagramSaveDto): Promise<VisualDiagramResponse> {
    try {
      const response = await request.put(`${API_URL}/visual-designer/diagrams/${id}`, diagramDto);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '更新可视化图表失败'
      };
    }
  },

  /**
   * 获取所有可视化图表
   */
  async getVisualDiagrams(): Promise<VisualDiagramsResponse> {
    try {
      const response = await request.get(`${API_URL}/visual-designer/diagrams`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '获取所有可视化图表失败'
      };
    }
  },

  /**
   * 获取单个可视化图表
   */
  async getVisualDiagram(id: string): Promise<VisualDiagramResponse> {
    try {
      const response = await request.get(`${API_URL}/visual-designer/diagrams/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '获取可视化图表失败'
      };
    }
  },

  /**
   * 删除可视化图表
   */
  async deleteVisualDiagram(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await request.delete(`${API_URL}/visual-designer/diagrams/${id}`);
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '删除可视化图表失败'
      };
    }
  },

  /**
   * 自动生成ER图
   */
  async generateERDiagram(tableIds: string[]): Promise<VisualDiagramResponse> {
    try {
      const response = await request.post(`${API_URL}/visual-designer/generate-er-diagram`, { tableIds });
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '自动生成ER图失败'
      };
    }
  },

  // ===== 完整模型操作 =====

  /**
   * 创建完整数据模型
   */
  async createCompleteModel(
    model: CreateMetaTableDto,
    fields: CreateMetaFieldDto[],
  ): Promise<ApiResponse<CreateCompleteModelResponse>> {
    try {
      const response = await request.post(`${API_URL}/complete`, {
        model,
        fields,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '创建完整数据模型失败',
      };
    }
  },

  /**
   * 发布数据模型
   */
  async publishModel(tableId: string): Promise<ApiResponse<PublishModelResponse>> {
    try {
      const response = await request.put(`${API_URL}/${tableId}/publish`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '发布数据模型失败',
      };
    }
  },

  /**
   * 克隆数据模型
   */
  async cloneModel(
    tableId: string,
    newName: string,
    newDisplayName: string
  ): Promise<ApiResponse<CloneModelResponse>> {
    try {
      const response = await request.post(`${API_URL}/${tableId}/clone`, {
        newName,
        newDisplayName,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '克隆数据模型失败',
      };
    }
  },

  /**
   * 获取完整数据模型信息
   */
  async getCompleteModel(tableId: string): Promise<ApiResponse<CompleteModel>> {
    try {
      const response = await request.get(`${API_URL}/${tableId}/complete`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '获取完整数据模型失败',
      };
    }
  },

  /**
   * 导出数据模型定义
   */
  async exportModelDefinition(tableId: string): Promise<ApiResponse<ModelExportData>> {
    try {
      const response = await request.get(`${API_URL}/${tableId}/export`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '导出数据模型定义失败',
      };
    }
  },

  /**
   * 导入数据模型定义
   */
  async importModelDefinition(
    definition: ModelExportData,
    tenant: string
  ): Promise<ApiResponse<ImportModelResponse>> {
    try {
      const response = await request.post(`${API_URL}/import`, {
        definition,
        tenant,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      markErrorAsHandled(error);
      return {
        success: false,
        error: error.response?.data?.message || '导入数据模型定义失败',
      };
    }
  },
};
