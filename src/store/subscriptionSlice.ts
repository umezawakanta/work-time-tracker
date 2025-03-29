import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import subscriptionApi from '@/services/api/subscriptionApi';
import { SubscriptionService } from '@/types';

// 初期状態の型定義
interface SubscriptionState {
  subscriptions: SubscriptionService[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// 初期状態
const initialState: SubscriptionState = {
  subscriptions: [],
  status: 'idle',
  error: null,
};

// サブスクリプション一覧を取得する非同期アクション
export const fetchSubscriptions = createAsyncThunk(
  'subscription/fetchSubscriptions',
  async () => {
    const response = await subscriptionApi.fetchSubscriptions();
    return response;
  }
);

// 新しいサブスクリプションを追加する非同期アクション
export const addSubscription = createAsyncThunk(
  'subscription/addSubscription',
  async (subscription: Omit<SubscriptionService, '_id'>) => {
    const response = await subscriptionApi.addSubscription(subscription);
    return response;
  }
);

// サブスクリプションを更新する非同期アクション
export const updateSubscription = createAsyncThunk(
  'subscription/updateSubscription',
  async ({ _id, subscription }: { _id: string; subscription: Partial<Omit<SubscriptionService, '_id'>> }) => {
    const response = await subscriptionApi.updateSubscription(_id, subscription);
    return response;
  }
);

// サブスクリプションを削除する非同期アクション
export const deleteSubscription = createAsyncThunk(
  'subscription/deleteSubscription',
  async (id: string) => {
    await subscriptionApi.deleteSubscription(id);
    return id;
  }
);

// サブスクリプションの確認ステータスを更新する非同期アクション
export const updateSubscriptionCheckStatus = createAsyncThunk(
  'subscription/updateSubscriptionCheckStatus',
  async ({ id, month, checked }: { id: string; month: string; checked: boolean }) => {
    const response = await subscriptionApi.updateSubscriptionCheckStatus(id, month, checked);
    return response;
  }
);

// subscriptionスライスの作成
const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    // ローカルの状態リセット用のリデューサー
    resetStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchSubscriptions
      .addCase(fetchSubscriptions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action: PayloadAction<SubscriptionService[]>) => {
        state.status = 'succeeded';
        state.subscriptions = action.payload;
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'サブスクリプションの取得に失敗しました。';
      })
      
      // addSubscription
      .addCase(addSubscription.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addSubscription.fulfilled, (state, action: PayloadAction<SubscriptionService>) => {
        state.status = 'succeeded';
        state.subscriptions.push(action.payload);
      })
      .addCase(addSubscription.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'サブスクリプションの追加に失敗しました。';
      })
      
      // updateSubscription
      .addCase(updateSubscription.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateSubscription.fulfilled, (state, action: PayloadAction<SubscriptionService>) => {
        state.status = 'succeeded';
        const index = state.subscriptions.findIndex(sub => sub._id === action.payload._id);
        if (index !== -1) {
          state.subscriptions[index] = action.payload;
        }
      })
      .addCase(updateSubscription.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'サブスクリプションの更新に失敗しました。';
      })
      
      // deleteSubscription
      .addCase(deleteSubscription.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteSubscription.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = 'succeeded';
        state.subscriptions = state.subscriptions.filter(sub => sub._id !== action.payload);
      })
      .addCase(deleteSubscription.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'サブスクリプションの削除に失敗しました。';
      })
      
      // updateSubscriptionCheckStatus
      .addCase(updateSubscriptionCheckStatus.fulfilled, (state, action: PayloadAction<SubscriptionService>) => {
        const index = state.subscriptions.findIndex(sub => sub._id === action.payload._id);
        if (index !== -1) {
          state.subscriptions[index] = action.payload;
        }
      });
  },
});

// アクションとリデューサーのエクスポート
export const { resetStatus } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;