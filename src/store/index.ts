import { configureStore } from "@reduxjs/toolkit";
import workTimeReducer from "./workTimeSlice";
import assetReducer from "./assetSlice";
import debtReducer from "./debtSlice";

export const store = configureStore({
  reducer: {
    workTime: workTimeReducer,
    asset: assetReducer,
    debt: debtReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
