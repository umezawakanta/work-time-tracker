import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Subscription {
  id: string;
  name: string;
  billingDate: string;
  type: string;
  amount: number;
}

interface SubscriptionState {
  subscriptions: Subscription[];
}

const initialState: SubscriptionState = {
  subscriptions: [],
};

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    addSubscription: (state, action: PayloadAction<Subscription>) => {
      state.subscriptions.push(action.payload);
    },
    // 必要に応じて、更新や削除のアクションを追加できます
  },
});

export const { addSubscription } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
