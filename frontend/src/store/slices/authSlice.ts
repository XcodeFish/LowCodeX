import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { UserInfo } from '../../types';

// 状态接口
interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  permissions: string[];
}

// 初始状态
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  permissions: [],
}

// 简化的异步action，只负责状态更新
export const setLoginResult = createAsyncThunk(
  'auth/setLoginResult',
  async (payload: { user: UserInfo }) => {
    return payload;
  }
);

export const setUserInfo = createAsyncThunk(
  'auth/setUserInfo',
  async (payload: { user: UserInfo, permissions?: string[] }) => {
    return payload;
  }
);

export const clearUserSession = createAsyncThunk(
  'auth/clearUserSession',
  async () => {
    return true;
  }
);

// 创建slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updatePermissions: (state, action: PayloadAction<string[]>) => {
      state.permissions = action.payload;
    },
    // 设置加载状态
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    // 设置错误信息
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  },
  extraReducers: (builder) => {
    // 登录结果处理
    builder.addCase(setLoginResult.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;
    })

    // 用户信息处理
    builder.addCase(setUserInfo.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.permissions = action.payload.permissions || action.payload.user.roles || [];
      state.error = null;
    })

    // 登出处理
    builder.addCase(clearUserSession.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.permissions = [];
      state.error = null;
    })
  }
});

// 导出actions
export const { clearError, updatePermissions, setLoading, setError } = authSlice.actions;

// 导出选择器
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectError = (state: { auth: AuthState }) => state.auth.error;
export const selectPermissions = (state: { auth: AuthState }) => state.auth.permissions;

export default authSlice.reducer;
