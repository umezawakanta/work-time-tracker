import { configureStore } from '@reduxjs/toolkit';
import workTimeReducer from './workTimeSlice';

export const store = configureStore({
  reducer: {
    workTime: workTimeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;