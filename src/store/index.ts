import { configureStore } from "@reduxjs/toolkit";
import workTimeReducer from "./workTimeSlice";
import assetReducer from "./assetSlice";
import debtReducer from "./debtSlice";
import userReducer from "./userSlice";
import todoReducer from "./todoSlice";

export const store = configureStore({
  reducer: {
    workTime: workTimeReducer,
    asset: assetReducer,
    debt: debtReducer,
    user: userReducer,
    todo: todoReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
