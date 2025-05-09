import { configureStore } from '@reduxjs/toolkit';

// 导入reducers
// import userReducer from './userSlice';
// import formReducer from './formSlice';

export const store = configureStore({
  reducer: {
    // user: userReducer,
    // form: formReducer,
    // 更多reducer将在这里添加
  },
});

// 导出类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
