import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import authReducer from './slices/authSlice';
import modelReducer from './slices/modelSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  model: modelReducer,
});

// 创建Store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// 导出类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 导出所有slice
export * from './slices/authSlice';
export * from './slices/modelSlice';
