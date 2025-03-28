import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { subscriptionApi, SubscriptionsListResponse } from "@/services/api/subscriptionApi";
import { Subscription } from "@/types/subscription";

interface SubscriptionState {
  subscriptions: Subscription[];
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: SubscriptionState = {
  subscriptions: [],
  totalItems: 0,
  currentPage: 1,
  itemsPerPage: 10,
  status: "idle",
  error: null,
};

export const fetchSubscriptions = createAsyncThunk(
  "subscriptions/fetchSubscriptions",
  async (params?: {
    search?: string;
    category?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) => {
    const response = await subscriptionApi.getAll(params);
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
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setItemsPerPage: (state, action) => {
      state.itemsPerPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.status = "succeeded";
        
        // APIからのレスポンス形式に合わせて処理
        const data = action.payload as SubscriptionsListResponse;
        
        // subscriptionsプロパティが存在する場合（新しいAPI）
        if ('subscriptions' in data) {
          state.subscriptions = data.subscriptions;
          state.totalItems = data.total;
          state.currentPage = data.page;
          state.itemsPerPage = data.limit;
        } 
        // 配列の場合（旧API互換）
        else if (Array.isArray(action.payload)) {
          state.subscriptions = action.payload;
          state.totalItems = action.payload.length;
        }
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(addSubscription.fulfilled, (state, action) => {
        state.subscriptions.push(action.payload);
        state.totalItems += 1;
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
        state.totalItems -= 1;
      });
  },
});

export const { setCurrentPage, setItemsPerPage } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
export type { Subscription };