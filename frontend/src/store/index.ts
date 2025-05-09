import { configureStore, createSlice } from '@reduxjs/toolkit';

// 创建一个空的appSlice作为基础reducer
const appSlice = createSlice({
  name: 'app',
  initialState: {
    isLoading: false,
    theme: 'light',
  },
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
  },
});

export const { setLoading, setTheme } = appSlice.actions;

// 导入reducers
// import userReducer from './userSlice';
// import formReducer from './formSlice';

export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
    // user: userReducer,
    // form: formReducer,
    // 更多reducer将在这里添加
  },
});

// 导出类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
