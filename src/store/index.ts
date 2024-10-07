// store/index.ts

import { configureStore } from "@reduxjs/toolkit";
import workTimeReducer from "./workTimeSlice";
import assetReducer from "./assetSlice";
import debtReducer from "./debtSlice";
import userReducer from "./userSlice";
import todoReducer from "./todoSlice";
import candidateReducer from "./candidateSlice";
import subscriptionReducer from "./subscriptionSlice";

export const store = configureStore({
  reducer: {
    workTime: workTimeReducer,
    asset: assetReducer,
    debt: debtReducer,
    user: userReducer,
    todo: todoReducer,
    candidate: candidateReducer,
    subscription: subscriptionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
