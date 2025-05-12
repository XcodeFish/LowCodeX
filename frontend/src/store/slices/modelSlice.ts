import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type {
  Model,
  ModelRelation,
  ModelVersion,
  CreateModelRequest,
  UpdateModelRequest,
  PublishModelRequest,
  ModelVersionRequest
} from '../../types/model-types';
import { modelService } from '../../services/modelService';

interface ModelState {
  models: Model[];
  currentModel: Model | null;
  modelRelations: ModelRelation[];
  modelVersions: ModelVersion[];
  loading: boolean;
  error: string | null;
  selectedVersion: number | null;
  total: number;
}

const initialState: ModelState = {
  models: [],
  currentModel: null,
  modelRelations: [],
  modelVersions: [],
  loading: false,
  error: null,
  selectedVersion: null,
  total: 0
};

// 异步Action: 获取所有模型
export const fetchModels = createAsyncThunk(
  'model/fetchModels',
  async (params: { applicationId?: string, isPublished?: boolean } | undefined, { rejectWithValue }) => {
    try {
      const response = await modelService.getModels(params);
      if (response.success) {
        return {
          models: response.data || [],
          total: response.total || 0
        };
      }
      return rejectWithValue(response.error || '获取数据模型失败');
    } catch (error: any) {
      return rejectWithValue(error.message || '获取数据模型失败');
    }
  }
);

// 异步Action: 获取单个模型
export const fetchModelById = createAsyncThunk(
  'model/fetchModelById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await modelService.getModelById(id);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error || '获取数据模型详情失败');
    } catch (error: any) {
      return rejectWithValue(error.message || '获取数据模型详情失败');
    }
  }
);

// 异步Action: 创建模型
export const createModel = createAsyncThunk(
  'model/createModel',
  async (model: CreateModelRequest, { rejectWithValue }) => {
    try {
      const response = await modelService.createModel(model);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error || '创建数据模型失败');
    } catch (error: any) {
      return rejectWithValue(error.message || '创建数据模型失败');
    }
  }
);

// 异步Action: 更新模型
export const updateModel = createAsyncThunk(
  'model/updateModel',
  async ({ id, model }: { id: string, model: UpdateModelRequest }, { rejectWithValue }) => {
    try {
      const response = await modelService.updateModel(id, model);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error || '更新数据模型失败');
    } catch (error: any) {
      return rejectWithValue(error.message || '更新数据模型失败');
    }
  }
);

// 异步Action: 删除模型
export const deleteModel = createAsyncThunk(
  'model/deleteModel',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await modelService.deleteModel(id);
      if (response.success) {
        return id;
      }
      return rejectWithValue(response.error || '删除数据模型失败');
    } catch (error: any) {
      return rejectWithValue(error.message || '删除数据模型失败');
    }
  }
);

// 异步Action: 发布模型
export const publishModel = createAsyncThunk(
  'model/publishModel',
  async (request: PublishModelRequest, { rejectWithValue }) => {
    try {
      const response = await modelService.publishModel(request);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error || '发布数据模型失败');
    } catch (error: any) {
      return rejectWithValue(error.message || '发布数据模型失败');
    }
  }
);

// 异步Action: 获取模型关系
export const fetchModelRelations = createAsyncThunk(
  'model/fetchModelRelations',
  async (modelId: string, { rejectWithValue }) => {
    try {
      const response = await modelService.getModelRelations(modelId);
      if (response.success) {
        return response.data || [];
      }
      return rejectWithValue(response.error || '获取模型关系失败');
    } catch (error: any) {
      return rejectWithValue(error.message || '获取模型关系失败');
    }
  }
);

// 异步Action: 获取模型版本
export const fetchModelVersions = createAsyncThunk(
  'model/fetchModelVersions',
  async (modelId: string, { rejectWithValue }) => {
    try {
      const response = await modelService.getModelVersions(modelId);
      if (response.success) {
        return response.data || [];
      }
      return rejectWithValue(response.error || '获取模型版本失败');
    } catch (error: any) {
      return rejectWithValue(error.message || '获取模型版本失败');
    }
  }
);

// 异步Action: 回滚到指定版本
export const rollbackToVersion = createAsyncThunk(
  'model/rollbackToVersion',
  async (request: ModelVersionRequest, { rejectWithValue }) => {
    try {
      const response = await modelService.rollbackToVersion(request);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error || '回滚版本失败');
    } catch (error: any) {
      return rejectWithValue(error.message || '回滚版本失败');
    }
  }
);

// 异步Action: 复制模型
export const duplicateModel = createAsyncThunk(
  'model/duplicateModel',
  async ({ id, newName }: { id: string, newName: string }, { rejectWithValue }) => {
    try {
      const response = await modelService.duplicateModel(id, newName);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error || '复制数据模型失败');
    } catch (error: any) {
      return rejectWithValue(error.message || '复制数据模型失败');
    }
  }
);

const modelSlice = createSlice({
  name: 'model',
  initialState,
  reducers: {
    clearCurrentModel: (state) => {
      state.currentModel = null;
      state.modelRelations = [];
      state.modelVersions = [];
      state.selectedVersion = null;
    },
    setSelectedVersion: (state, action: PayloadAction<number | null>) => {
      state.selectedVersion = action.payload;
    },
    clearModelError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // 获取所有模型
    builder.addCase(fetchModels.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchModels.fulfilled, (state, action) => {
      state.loading = false;
      state.models = action.payload.models;
      state.total = action.payload.total;
    });
    builder.addCase(fetchModels.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 获取单个模型
    builder.addCase(fetchModelById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchModelById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentModel = action.payload as Model;
    });
    builder.addCase(fetchModelById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 创建模型
    builder.addCase(createModel.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createModel.fulfilled, (state, action) => {
      state.loading = false;
      state.models.push(action.payload as Model);
      state.currentModel = action.payload as Model;
    });
    builder.addCase(createModel.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 更新模型
    builder.addCase(updateModel.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateModel.fulfilled, (state, action) => {
      state.loading = false;
      const updatedModel = action.payload as Model;
      // 更新列表中的模型
      state.models = state.models.map(model =>
        model.id === updatedModel.id ? updatedModel : model
      );
      state.currentModel = updatedModel;
    });
    builder.addCase(updateModel.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 删除模型
    builder.addCase(deleteModel.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteModel.fulfilled, (state, action) => {
      state.loading = false;
      const id = action.payload as string;
      state.models = state.models.filter(model => model.id !== id);
      if (state.currentModel?.id === id) {
        state.currentModel = null;
      }
    });
    builder.addCase(deleteModel.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 发布模型
    builder.addCase(publishModel.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(publishModel.fulfilled, (state, action) => {
      state.loading = false;
      const publishedModel = action.payload as Model;

      // 更新列表和当前模型
      state.models = state.models.map(model =>
        model.id === publishedModel.id ? publishedModel : model
      );

      if (state.currentModel?.id === publishedModel.id) {
        state.currentModel = publishedModel;
      }
    });
    builder.addCase(publishModel.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 获取模型关系
    builder.addCase(fetchModelRelations.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchModelRelations.fulfilled, (state, action) => {
      state.loading = false;
      state.modelRelations = action.payload as ModelRelation[];
    });
    builder.addCase(fetchModelRelations.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 获取模型版本
    builder.addCase(fetchModelVersions.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchModelVersions.fulfilled, (state, action) => {
      state.loading = false;
      state.modelVersions = action.payload as ModelVersion[];
    });
    builder.addCase(fetchModelVersions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 回滚到指定版本
    builder.addCase(rollbackToVersion.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(rollbackToVersion.fulfilled, (state, action) => {
      state.loading = false;
      const updatedModel = action.payload as Model;

      // 更新列表和当前模型
      state.models = state.models.map(model =>
        model.id === updatedModel.id ? updatedModel : model
      );

      state.currentModel = updatedModel;
      state.selectedVersion = null;
    });
    builder.addCase(rollbackToVersion.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 复制模型
    builder.addCase(duplicateModel.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(duplicateModel.fulfilled, (state, action) => {
      state.loading = false;
      state.models.push(action.payload as Model);
    });
    builder.addCase(duplicateModel.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});

export const { clearCurrentModel, setSelectedVersion, clearModelError } = modelSlice.actions;

export default modelSlice.reducer;
