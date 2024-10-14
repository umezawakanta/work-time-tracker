import { configureStore, combineReducers } from '@reduxjs/toolkit';
import workTimeReducer from './workTimeSlice';
import assetReducer from './assetSlice';
import debtReducer from './debtSlice';
import userReducer from './userSlice';
import todoReducer from './todoSlice';
import candidateReducer from './candidateSlice';
import subscriptionReducer from './subscriptionSlice';
import withdrawalReducer from './withdrawalSlice';
import bookReducer from './bookSlice';
import sleepTrackerReducer from './sleepTrackerSlice';
import blogReducer from './blogSlice';

const rootReducer = combineReducers({
  workTime: workTimeReducer,
  asset: assetReducer,
  debt: debtReducer,
  user: userReducer,
  todo: todoReducer,
  candidate: candidateReducer,
  subscription: subscriptionReducer,
  withdrawal: withdrawalReducer,
  book: bookReducer,
  sleepTracker: sleepTrackerReducer,
  blog: blogReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: true,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;