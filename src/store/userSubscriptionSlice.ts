// ユーザーサブスクリプション（サイト内プラン管理）用のReduxスライス
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

// ユーザーサブスクリプション一覧を取得する非同期アクション
export const fetchUserSubscriptions = createAsyncThunk(
  'userSubscription/fetchUserSubscriptions',
  async () => {
    const response = await userSubscriptionApi.fetchUserSubscriptions();
    return response;
  }
);

// 新しいユーザーサブスクリプションを追加する非同期アクション
export const addUserSubscription = createAsyncThunk(
  'userSubscription/addUserSubscription',
  async (subscription: Omit<UserSubscription, '_id'>) => {
    const response = await userSubscriptionApi.addUserSubscription(subscription);
    return response;
  }
);

// ユーザーサブスクリプションを更新する非同期アクション
export const updateUserSubscription = createAsyncThunk(
  'userSubscription/updateUserSubscription',
  async ({
    _id,
    subscription,
  }: {
    _id: string;
    subscription: Partial<Omit<UserSubscription, '_id'>>;
  }) => {
    const response = await userSubscriptionApi.updateUserSubscription(_id, subscription);
    return response;
  }
);

// ユーザーサブスクリプションを削除する非同期アクション
export const deleteUserSubscription = createAsyncThunk(
  'userSubscription/deleteUserSubscription',
  async (id: string) => {
    await userSubscriptionApi.deleteUserSubscription(id);
    return id;
  }
);

// ユーザーサブスクリプションの確認ステータスを更新する非同期アクション
export const updateUserSubscriptionCheckStatus = createAsyncThunk(
  'userSubscription/updateUserSubscriptionCheckStatus',
  async ({ id, month, checked }: { id: string; month: string; checked: boolean }) => {
    const response = await userSubscriptionApi.updateUserSubscriptionCheckStatus(
      id,
      month,
      checked
    );
    return response;
  }
);

// 自動更新設定を更新する非同期アクション
export const updateAutoRenewal = createAsyncThunk(
  'userSubscription/updateAutoRenewal',
  async ({ id, cancelAtPeriodEnd }: { id: string; cancelAtPeriodEnd: boolean }) => {
    const response = await userSubscriptionApi.updateAutoRenewal(id, cancelAtPeriodEnd);
    return response;
  }
);

// プラン変更を予約する非同期アクション
export const scheduleSubscriptionChange = createAsyncThunk(
  'userSubscription/scheduleSubscriptionChange',
  async ({ id, newPlanId, changeDate }: { id: string; newPlanId: string; changeDate: Date }) => {
    const response = await userSubscriptionApi.scheduleSubscriptionChange(
      id,
      newPlanId,
      changeDate
    );
    return response;
  }
);

// サブスクリプションを即時解約する非同期アクション
export const cancelSubscription = createAsyncThunk(
  'userSubscription/cancelSubscription',
  async ({ id, reason }: { id: string; reason?: string }) => {
    const response = await userSubscriptionApi.cancelSubscription(id, reason);
    return response;
  }
);

// 解約後のサブスクリプションを復活する非同期アクション
export const reactivateSubscription = createAsyncThunk(
  'userSubscription/reactivateSubscription',
  async (id: string) => {
    const response = await userSubscriptionApi.reactivateSubscription(id);
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
      .addCase(
        fetchUserSubscriptions.fulfilled,
        (state, action: PayloadAction<UserSubscription[]>) => {
          state.status = 'succeeded';
          state.subscriptions = action.payload;
        }
      )
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
      .addCase(
        updateUserSubscription.fulfilled,
        (state, action: PayloadAction<UserSubscription>) => {
          state.status = 'succeeded';
          const index = state.subscriptions.findIndex((sub) => sub._id === action.payload._id);
          if (index !== -1) {
            state.subscriptions[index] = action.payload;
          }
        }
      )
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
        state.subscriptions = state.subscriptions.filter((sub) => sub._id !== action.payload);
      })
      .addCase(deleteUserSubscription.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'サブスクリプションの削除に失敗しました。';
      })

      // updateUserSubscriptionCheckStatus
      .addCase(updateUserSubscriptionCheckStatus.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(
        updateUserSubscriptionCheckStatus.fulfilled,
        (state, action: PayloadAction<UserSubscription>) => {
          state.status = 'succeeded';
          const index = state.subscriptions.findIndex((sub) => sub._id === action.payload._id);
          if (index !== -1) {
            state.subscriptions[index] = action.payload;
          }
        }
      )
      .addCase(updateUserSubscriptionCheckStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'チェックステータスの更新に失敗しました。';
      })

      // updateAutoRenewal
      .addCase(updateAutoRenewal.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(
        updateAutoRenewal.fulfilled,
        (state, action: PayloadAction<{ subscription: UserSubscription }>) => {
          state.status = 'succeeded';
          const index = state.subscriptions.findIndex(
            (sub) => sub._id === action.payload.subscription._id
          );
          if (index !== -1) {
            state.subscriptions[index] = action.payload.subscription;
          }
        }
      )
      .addCase(updateAutoRenewal.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || '自動更新設定の変更に失敗しました。';
      })

      // scheduleSubscriptionChange
      .addCase(scheduleSubscriptionChange.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(
        scheduleSubscriptionChange.fulfilled,
        (state, action: PayloadAction<{ subscription: UserSubscription }>) => {
          state.status = 'succeeded';
          const index = state.subscriptions.findIndex(
            (sub) => sub._id === action.payload.subscription._id
          );
          if (index !== -1) {
            state.subscriptions[index] = action.payload.subscription;
          }
        }
      )
      .addCase(scheduleSubscriptionChange.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'プラン変更の予約に失敗しました。';
      })

      // cancelSubscription
      .addCase(cancelSubscription.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(
        cancelSubscription.fulfilled,
        (state, action: PayloadAction<{ subscription: UserSubscription }>) => {
          state.status = 'succeeded';
          const index = state.subscriptions.findIndex(
            (sub) => sub._id === action.payload.subscription._id
          );
          if (index !== -1) {
            state.subscriptions[index] = action.payload.subscription;
          }
        }
      )
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'サブスクリプションの解約に失敗しました。';
      })

      // reactivateSubscription
      .addCase(reactivateSubscription.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(
        reactivateSubscription.fulfilled,
        (state, action: PayloadAction<{ subscription: UserSubscription }>) => {
          state.status = 'succeeded';
          const index = state.subscriptions.findIndex(
            (sub) => sub._id === action.payload.subscription._id
          );
          if (index !== -1) {
            state.subscriptions[index] = action.payload.subscription;
          }
        }
      )
      .addCase(reactivateSubscription.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'サブスクリプションの復活に失敗しました。';
      });
  },
});

// アクションとリデューサーのエクスポート
export const { resetStatus } = userSubscriptionSlice.actions;
export default userSubscriptionSlice.reducer;
