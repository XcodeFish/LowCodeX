import { useState } from 'react';
import { modelService } from '@/services/modelService';
import type {
  CreateModelApprovalDto,
  ApproveModelDto,
  ModelApprovalResponse,
  ModelApprovalsResponse,
  ModelApprovalHistoryResponse,
  ApiResponse
} from '@/types/data-models';

/**
 * 模型发布审批相关hooks
 */
export const useModelApproval = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 创建模型发布审批申请
   */
  const createModelApproval = async (approvalDto: CreateModelApprovalDto): Promise<ModelApprovalResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.createModelApproval(approvalDto);
      return response;
    } catch (err: any) {
      setError(err.message || '创建模型发布审批申请失败');
      return {
        success: false,
        error: err.message || '创建模型发布审批申请失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取模型发布审批列表
   */
  const getModelApprovals = async (params?: {
    tableId?: string,
    status?: string,
    requestedBy?: string,
    approvedBy?: string
  }): Promise<ModelApprovalsResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.getModelApprovals(params);
      return response;
    } catch (err: any) {
      setError(err.message || '获取模型发布审批列表失败');
      return {
        success: false,
        error: err.message || '获取模型发布审批列表失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取单个模型发布审批详情
   */
  const getModelApproval = async (id: string): Promise<ModelApprovalResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.getModelApproval(id);
      return response;
    } catch (err: any) {
      setError(err.message || '获取模型发布审批详情失败');
      return {
        success: false,
        error: err.message || '获取模型发布审批详情失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 审批模型发布申请
   */
  const approveModel = async (id: string, approveDto: ApproveModelDto): Promise<ModelApprovalResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.approveModel(id, approveDto);
      return response;
    } catch (err: any) {
      setError(err.message || '审批模型发布申请失败');
      return {
        success: false,
        error: err.message || '审批模型发布申请失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 取消模型发布审批申请
   */
  const cancelModelApproval = async (id: string): Promise<ApiResponse<any>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.cancelModelApproval(id);
      return response;
    } catch (err: any) {
      setError(err.message || '取消模型发布审批申请失败');
      return {
        success: false,
        error: err.message || '取消模型发布审批申请失败'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取模型审批历史
   */
  const getApprovalHistory = async (tableId: string): Promise<ModelApprovalHistoryResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.getApprovalHistory(tableId);
      return response;
    } catch (err: any) {
      setError(err.message || '获取模型审批历史失败');
      return {
        success: false,
        error: err.message || '获取模型审批历史失败'
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createModelApproval,
    getModelApprovals,
    getModelApproval,
    approveModel,
    cancelModelApproval,
    getApprovalHistory
  };
};
