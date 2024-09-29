import { configureStore } from "@reduxjs/toolkit";
import workTimeReducer from "./workTimeSlice";
import assetReducer from "./assetSlice";

export const store = configureStore({
  reducer: {
    workTime: workTimeReducer,
    asset: assetReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
