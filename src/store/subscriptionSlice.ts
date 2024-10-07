import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { subscriptionApi } from "@/services/api/subscriptionApi";
import { Subscription } from "@/types/subscription";

interface SubscriptionState {
  subscriptions: Subscription[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: SubscriptionState = {
  subscriptions: [],
  status: "idle",
  error: null,
};

export const fetchSubscriptions = createAsyncThunk(
  "subscriptions/fetchSubscriptions",
  async () => {
    const response = await subscriptionApi.getAll();
    return response.data;
  }
);

export const addSubscription = createAsyncThunk(
  "subscriptions/addSubscription",
  async (subscription: Omit<Subscription, "_id">) => {
    const response = await subscriptionApi.create(subscription);
    return response.data.subscription;
  }
);

export const updateSubscription = createAsyncThunk(
  "subscriptions/updateSubscription",
  async ({
    _id,
    subscription,
  }: {
    _id: string;
    subscription: Partial<Subscription>;
  }) => {
    const response = await subscriptionApi.update(_id, subscription);
    return response.data.subscription;
  }
);

export const deleteSubscription = createAsyncThunk(
  "subscriptions/deleteSubscription",
  async (_id: string) => {
    await subscriptionApi.delete(_id);
    return _id;
  }
);

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.subscriptions = action.payload;
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(addSubscription.fulfilled, (state, action) => {
        state.subscriptions.push(action.payload);
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        const index = state.subscriptions.findIndex(
          (sub) => sub._id === action.payload._id
        );
        if (index !== -1) {
          state.subscriptions[index] = action.payload;
        }
      })
      .addCase(deleteSubscription.fulfilled, (state, action) => {
        state.subscriptions = state.subscriptions.filter(
          (sub) => sub._id !== action.payload
        );
      });
  },
});

export default subscriptionSlice.reducer;
export type { Subscription };
