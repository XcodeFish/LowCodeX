import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slices/authSlice';
import modelReducer from './slices/modelSlice';

// 创建Store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    model: modelReducer,
    // 其他reducer将在这里添加，如表单、工作流等
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略某些非可序列化的值
        ignoredActions: ['auth/uploadAvatar/fulfilled'],
      },
    }),
});

// 可选，但是为了使用 RTK Query 的 refetchOnFocus/refetchOnReconnect 功能需要它
setupListeners(store.dispatch);

// 导出类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
