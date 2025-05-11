import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import {authTypes, userTypes} from '../../types';
import { authService } from '../../services/authService';


// 状态接口
interface AuthState {
  user: userTypes.UserInfo | null;
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

// 登录异步action
export const login = createAsyncThunk(
  '/v1/auth/login',
  async (params: authTypes.LoginRequest, { rejectWithValue }) => {
    try {
      const result = await authService.login(params);

      // 存储token
      localStorage.setItem('token', result.data.accessToken);
      localStorage.setItem('refreshToken', result.data.refreshToken);

      // 如果选择了记住密码，保存用户名
      if (params.rememberMe) {
        localStorage.setItem('rememberedUsername', params.username);
      } else {
        localStorage.removeItem('rememberedUsername');
      }
      return result;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || '登录失败，请检查用户名和密码'
      );
    }
  }
)

// 获取当前用户信息异步action
export const fetchCurrentUser = createAsyncThunk(
  '/v1/auth/me',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getUserInfo();
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || '获取用户信息失败'
      );
    }
  }
)

// 登出异步action
export const logout = createAsyncThunk(
  '/v1/auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();

      // 清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('rememberedUsername');

      return true;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || '登出失败'
      );
    }
  }
)

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
  },
  extraReducers: (builder) => {
    // 登录处理
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(login.fulfilled, (state, action: PayloadAction<authTypes.LoginResponse>) => {
      state.loading = false;
      state.user = action.payload.data.user;
      state.isAuthenticated = true;
    })
    .addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // 获取当前用户信息处理
    builder.addCase(fetchCurrentUser.pending, (state) => {
      state.loading = true;
    })
    .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<authTypes.GetUserInfoResponse>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.data;
      state.permissions = action.payload.data.roles;
    })
    .addCase(fetchCurrentUser.rejected, (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.permissions = [];
    })

    // 登出处理
    builder.addCase(logout.pending, (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.permissions = [];
    })
  }
});

// 导出actions
export const { clearError, updatePermissions } = authSlice.actions;

// 导出选择器
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectError = (state: { auth: AuthState }) => state.auth.error;
export const selectPermissions = (state: { auth: AuthState }) => state.auth.permissions;

// 判断是否有权限
export const hasPermission = (state: { auth: AuthState }, permission: string) => {
  return state.auth.permissions.includes(permission);
};

// 判断是否有角色
export const hasRole = (state: { auth: AuthState }, roleCode: string) => {
  return state.auth.user?.roles.some((role: any) => role.code === roleCode) || false;
};

export default authSlice.reducer;
