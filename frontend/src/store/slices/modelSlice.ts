import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type {
  Model,
  ModelRelation,
  ModelVersion,
  MetaTable,
  MetaField,
  MetaRelation,
  MetaVersion,
  VisualDiagram,
  ModelApproval,
  ImpactAnalysisResponse,
  TestDataTemplate
} from '../../types/data-models';

// 状态接口
interface ModelState {
  // 元数据表相关
  metaTables: MetaTable[];
  currentMetaTable: MetaTable | null;
  totalMetaTables: number;

  // 元数据字段相关
  metaFields: MetaField[];

  // 元数据关系相关
  metaRelations: MetaRelation[];

  // 元数据版本相关
  metaVersions: MetaVersion[];
  selectedVersion: MetaVersion | null;

  // 模型审批相关
  modelApprovals: ModelApproval[];

  // 模型可视化设计相关
  visualDiagrams: VisualDiagram[];
  currentDiagram: VisualDiagram | null;

  // 模型变更影响分析相关
  impactAnalysisResult: ImpactAnalysisResponse | null;

  // 测试数据相关
  testDataTemplates: TestDataTemplate[];

  // 通用状态
  loading: boolean;
  error: string | null;
}

// 初始状态
const initialState: ModelState = {
  metaTables: [],
  currentMetaTable: null,
  totalMetaTables: 0,

  metaFields: [],

  metaRelations: [],

  metaVersions: [],
  selectedVersion: null,

  modelApprovals: [],

  visualDiagrams: [],
  currentDiagram: null,

  impactAnalysisResult: null,

  testDataTemplates: [],

  loading: false,
  error: null
};

// 元数据表相关action
export const setMetaTables = createAsyncThunk(
  'model/setMetaTables',
  async (payload: { tables: MetaTable[], total: number }) => {
    return payload;
  }
);

export const setCurrentMetaTable = createAsyncThunk(
  'model/setCurrentMetaTable',
  async (payload: { table: MetaTable }) => {
    return payload;
  }
);

export const addMetaTable = createAsyncThunk(
  'model/addMetaTable',
  async (payload: { table: MetaTable }) => {
    return payload;
  }
);

export const updateMetaTable = createAsyncThunk(
  'model/updateMetaTable',
  async (payload: { table: MetaTable }) => {
    return payload;
  }
);

export const removeMetaTable = createAsyncThunk(
  'model/removeMetaTable',
  async (payload: { tableId: string }) => {
    return payload;
  }
);

// 元数据字段相关action
export const setMetaFields = createAsyncThunk(
  'model/setMetaFields',
  async (payload: { fields: MetaField[] }) => {
    return payload;
  }
);

export const addMetaField = createAsyncThunk(
  'model/addMetaField',
  async (payload: { field: MetaField }) => {
    return payload;
  }
);

export const updateMetaField = createAsyncThunk(
  'model/updateMetaField',
  async (payload: { field: MetaField }) => {
    return payload;
  }
);

export const removeMetaField = createAsyncThunk(
  'model/removeMetaField',
  async (payload: { fieldId: string }) => {
    return payload;
  }
);

// 元数据关系相关action
export const setMetaRelations = createAsyncThunk(
  'model/setMetaRelations',
  async (payload: { relations: MetaRelation[] }) => {
    return payload;
  }
);

export const addMetaRelation = createAsyncThunk(
  'model/addMetaRelation',
  async (payload: { relation: MetaRelation }) => {
    return payload;
  }
);

export const updateMetaRelation = createAsyncThunk(
  'model/updateMetaRelation',
  async (payload: { relation: MetaRelation }) => {
    return payload;
  }
);

export const removeMetaRelation = createAsyncThunk(
  'model/removeMetaRelation',
  async (payload: { relationId: string }) => {
    return payload;
  }
);

// 元数据版本相关action
export const setMetaVersions = createAsyncThunk(
  'model/setMetaVersions',
  async (payload: { versions: MetaVersion[] }) => {
    return payload;
  }
);

export const setSelectedVersion = createAsyncThunk(
  'model/setSelectedVersion',
  async (payload: { version: MetaVersion | null }) => {
    return payload;
  }
);

// 模型审批相关action
export const setModelApprovals = createAsyncThunk(
  'model/setModelApprovals',
  async (payload: { approvals: ModelApproval[] }) => {
    return payload;
  }
);

// 可视化设计相关action
export const setVisualDiagrams = createAsyncThunk(
  'model/setVisualDiagrams',
  async (payload: { diagrams: VisualDiagram[] }) => {
    return payload;
  }
);

export const setCurrentDiagram = createAsyncThunk(
  'model/setCurrentDiagram',
  async (payload: { diagram: VisualDiagram | null }) => {
    return payload;
  }
);

// 影响分析相关action
export const setImpactAnalysisResult = createAsyncThunk(
  'model/setImpactAnalysisResult',
  async (payload: { result: ImpactAnalysisResponse | null }) => {
    return payload;
  }
);

// 测试数据相关action
export const setTestDataTemplates = createAsyncThunk(
  'model/setTestDataTemplates',
  async (payload: { templates: TestDataTemplate[] }) => {
    return payload;
  }
);

// 通用状态action
export const setModelLoading = createAsyncThunk(
  'model/setLoading',
  async (payload: { loading: boolean }) => {
    return payload;
  }
);

export const setModelError = createAsyncThunk(
  'model/setError',
  async (payload: { error: string | null }) => {
    return payload;
  }
);

const modelSlice = createSlice({
  name: 'model',
  initialState,
  reducers: {
    clearModelState: (state) => {
      return initialState;
    },
    clearCurrentMetaTable: (state) => {
      state.currentMetaTable = null;
      state.metaFields = [];
      state.metaRelations = [];
      state.metaVersions = [];
      state.selectedVersion = null;
    },
    clearModelError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // 元数据表相关
    builder.addCase(setMetaTables.fulfilled, (state, action) => {
      state.metaTables = action.payload.tables;
      state.totalMetaTables = action.payload.total;
    });

    builder.addCase(setCurrentMetaTable.fulfilled, (state, action) => {
      state.currentMetaTable = action.payload.table;
    });

    builder.addCase(addMetaTable.fulfilled, (state, action) => {
      state.metaTables.push(action.payload.table);
      state.currentMetaTable = action.payload.table;
      state.totalMetaTables += 1;
    });

    builder.addCase(updateMetaTable.fulfilled, (state, action) => {
      const updatedTable = action.payload.table;
      state.metaTables = state.metaTables.map(table =>
        table.id === updatedTable.id ? updatedTable : table
      );
      if (state.currentMetaTable?.id === updatedTable.id) {
        state.currentMetaTable = updatedTable;
      }
    });

    builder.addCase(removeMetaTable.fulfilled, (state, action) => {
      const tableId = action.payload.tableId;
      state.metaTables = state.metaTables.filter(table => table.id !== tableId);
      if (state.currentMetaTable?.id === tableId) {
        state.currentMetaTable = null;
      }
      state.totalMetaTables -= 1;
    });

    // 元数据字段相关
    builder.addCase(setMetaFields.fulfilled, (state, action) => {
      state.metaFields = action.payload.fields;
    });

    builder.addCase(addMetaField.fulfilled, (state, action) => {
      state.metaFields.push(action.payload.field);
    });

    builder.addCase(updateMetaField.fulfilled, (state, action) => {
      const updatedField = action.payload.field;
      state.metaFields = state.metaFields.map(field =>
        field.id === updatedField.id ? updatedField : field
      );
    });

    builder.addCase(removeMetaField.fulfilled, (state, action) => {
      state.metaFields = state.metaFields.filter(field =>
        field.id !== action.payload.fieldId
      );
    });

    // 元数据关系相关
    builder.addCase(setMetaRelations.fulfilled, (state, action) => {
      state.metaRelations = action.payload.relations;
    });

    builder.addCase(addMetaRelation.fulfilled, (state, action) => {
      state.metaRelations.push(action.payload.relation);
    });

    builder.addCase(updateMetaRelation.fulfilled, (state, action) => {
      const updatedRelation = action.payload.relation;
      state.metaRelations = state.metaRelations.map(relation =>
        relation.id === updatedRelation.id ? updatedRelation : relation
      );
    });

    builder.addCase(removeMetaRelation.fulfilled, (state, action) => {
      state.metaRelations = state.metaRelations.filter(relation =>
        relation.id !== action.payload.relationId
      );
    });

    // 元数据版本相关
    builder.addCase(setMetaVersions.fulfilled, (state, action) => {
      state.metaVersions = action.payload.versions;
    });

    builder.addCase(setSelectedVersion.fulfilled, (state, action) => {
      state.selectedVersion = action.payload.version;
    });

    // 模型审批相关
    builder.addCase(setModelApprovals.fulfilled, (state, action) => {
      state.modelApprovals = action.payload.approvals;
    });

    // 可视化设计相关
    builder.addCase(setVisualDiagrams.fulfilled, (state, action) => {
      state.visualDiagrams = action.payload.diagrams;
    });

    builder.addCase(setCurrentDiagram.fulfilled, (state, action) => {
      state.currentDiagram = action.payload.diagram;
    });

    // 影响分析相关
    builder.addCase(setImpactAnalysisResult.fulfilled, (state, action) => {
      state.impactAnalysisResult = action.payload.result;
    });

    // 测试数据相关
    builder.addCase(setTestDataTemplates.fulfilled, (state, action) => {
      state.testDataTemplates = action.payload.templates;
    });

    // 通用状态
    builder.addCase(setModelLoading.fulfilled, (state, action) => {
      state.loading = action.payload.loading;
    });

    builder.addCase(setModelError.fulfilled, (state, action) => {
      state.error = action.payload.error;
    });
  }
});

export const { clearModelState, clearCurrentMetaTable, clearModelError } = modelSlice.actions;

// 选择器
export const selectMetaTables = (state: { model: ModelState }) => state.model.metaTables;
export const selectCurrentMetaTable = (state: { model: ModelState }) => state.model.currentMetaTable;
export const selectTotalMetaTables = (state: { model: ModelState }) => state.model.totalMetaTables;
export const selectMetaFields = (state: { model: ModelState }) => state.model.metaFields;
export const selectMetaRelations = (state: { model: ModelState }) => state.model.metaRelations;
export const selectMetaVersions = (state: { model: ModelState }) => state.model.metaVersions;
export const selectSelectedVersion = (state: { model: ModelState }) => state.model.selectedVersion;
export const selectModelApprovals = (state: { model: ModelState }) => state.model.modelApprovals;
export const selectVisualDiagrams = (state: { model: ModelState }) => state.model.visualDiagrams;
export const selectCurrentDiagram = (state: { model: ModelState }) => state.model.currentDiagram;
export const selectImpactAnalysisResult = (state: { model: ModelState }) => state.model.impactAnalysisResult;
export const selectTestDataTemplates = (state: { model: ModelState }) => state.model.testDataTemplates;
export const selectModelLoading = (state: { model: ModelState }) => state.model.loading;
export const selectModelError = (state: { model: ModelState }) => state.model.error;

export default modelSlice.reducer;
