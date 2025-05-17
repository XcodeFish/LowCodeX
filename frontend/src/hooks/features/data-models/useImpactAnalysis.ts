import { useState } from 'react';
import { modelService } from '@/services/modelService';
import type { ImpactAnalysisRequest, ImpactAnalysisResponse } from '@/types/data-models';

/**
 * 模型变更影响分析相关hooks
 */
export const useImpactAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 分析模型变更影响
   */
  const analyzeImpact = async (requestData: ImpactAnalysisRequest): Promise<ImpactAnalysisResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await modelService.analyzeImpact(requestData);
      return response;
    } catch (err: any) {
      setError(err.message || '分析模型变更影响失败');
      return {
        success: false,
        error: err.message || '分析模型变更影响失败'
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    analyzeImpact
  };
};
