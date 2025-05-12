import { useDispatch } from 'react-redux';
import type { ThunkDispatch } from '@reduxjs/toolkit';
import type { AnyAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

// 类型化的AppDispatch，支持异步action
export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;

// 类型化的dispatch hook
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default useAppDispatch;
