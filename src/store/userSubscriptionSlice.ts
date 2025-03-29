import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import userSubscriptionApi from '@/services/api/userSubscriptionApi';
import { UserSubscription } from '@/types';

// 初期状態の型定義
interface UserSubscriptionState {
  subscriptions: UserSubscription[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// 初期状態
const initialState: UserSubscriptionState = {
  subscriptions: [],
  status: 'idle',
  error: null,
};

// サブスクリプション一覧を取得する非同期アクション
export const fetchUserSubscriptions = createAsyncThunk(
  'userSubscription/fetchUserSubscriptions',
  async () => {
    const response = await userSubscriptionApi.fetchUserSubscriptions();
    return response;
  }
);

// 新しいサブスクリプションを追加する非同期アクション
export const addUserSubscription = createAsyncThunk(
  'userSubscription/addUserSubscription',
  async (subscription: Omit<UserSubscription, '_id'>) => {
    const response = await userSubscriptionApi.addUserSubscription(subscription);
    return response;
  }
);

// サブスクリプションを更新する非同期アクション
export const updateUserSubscription = createAsyncThunk(
  'userSubscription/updateUserSubscription',
  async ({ _id, subscription }: { _id: string; subscription: Partial<Omit<UserSubscription, '_id'>> }) => {
    const response = await userSubscriptionApi.updateUserSubscription(_id, subscription);
    return response;
  }
);

// サブスクリプションを削除する非同期アクション
export const deleteUserSubscription = createAsyncThunk(
  'userSubscription/deleteUserSubscription',
  async (id: string) => {
    await userSubscriptionApi.deleteUserSubscription(id);
    return id;
  }
);

// サブスクリプションの確認ステータスを更新する非同期アクション
export const updateSubscriptionCheckStatus = createAsyncThunk(
  'userSubscription/updateSubscriptionCheckStatus',
  async ({ id, month, checked }: { id: string; month: string; checked: boolean }) => {
    const response = await userSubscriptionApi.updateSubscriptionCheckStatus(id, month, checked);
    return response;
  }
);

// userSubscriptionスライスの作成
const userSubscriptionSlice = createSlice({
  name: 'userSubscription',
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
      // fetchUserSubscriptions
      .addCase(fetchUserSubscriptions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserSubscriptions.fulfilled, (state, action: PayloadAction<UserSubscription[]>) => {
        state.status = 'succeeded';
        state.subscriptions = action.payload;
      })
      .addCase(fetchUserSubscriptions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'サブスクリプションの取得に失敗しました。';
      })
      
      // addUserSubscription
      .addCase(addUserSubscription.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addUserSubscription.fulfilled, (state, action: PayloadAction<UserSubscription>) => {
        state.status = 'succeeded';
        state.subscriptions.push(action.payload);
      })
      .addCase(addUserSubscription.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'サブスクリプションの追加に失敗しました。';
      })
      
      // updateUserSubscription
      .addCase(updateUserSubscription.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateUserSubscription.fulfilled, (state, action: PayloadAction<UserSubscription>) => {
        state.status = 'succeeded';
        const index = state.subscriptions.findIndex(sub => sub._id === action.payload._id);
        if (index !== -1) {
          state.subscriptions[index] = action.payload;
        }
      })
      .addCase(updateUserSubscription.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'サブスクリプションの更新に失敗しました。';
      })
      
      // deleteUserSubscription
      .addCase(deleteUserSubscription.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteUserSubscription.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = 'succeeded';
        state.subscriptions = state.subscriptions.filter(sub => sub._id !== action.payload);
      })
      .addCase(deleteUserSubscription.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'サブスクリプションの削除に失敗しました。';
      })
      
      // updateSubscriptionCheckStatus
      .addCase(updateSubscriptionCheckStatus.fulfilled, (state, action: PayloadAction<UserSubscription>) => {
        const index = state.subscriptions.findIndex(sub => sub._id === action.payload._id);
        if (index !== -1) {
          state.subscriptions[index] = action.payload;
        }
      });
  },
});

// アクションとリデューサーのエクスポート
export const { resetStatus } = userSubscriptionSlice.actions;
export default userSubscriptionSlice.reducer;