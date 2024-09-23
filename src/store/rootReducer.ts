import { combineReducers } from '@reduxjs/toolkit';
import workTimeReducer from './workTimeSlice';

const rootReducer = combineReducers({
  workTime: workTimeReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;