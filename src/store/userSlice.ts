import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUserProfile, updateUserProfile } from '@/services/api/authApi';
import { UserState } from '@/types';

// 初期状態を拡張
const initialState: UserState = {
  id: null,
  name: '',
  email: '',
  isLoading: false,
  error: null,
  lastReminderDate: null,
  isLoggedIn: false,
  hasActiveSubscription: false,
  trialActivated: false,
  trialExpiryDate: null,
};

export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUserProfile();
      return response.user;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (userData: { name: string; email: string }, { rejectWithValue }) => {
    try {
      const response = await updateUserProfile(userData);
      return response.user;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// reducers に新しいアクションを追加
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateLastReminderDate: (state, action) => {
      state.lastReminderDate = action.payload;
    },
    setLoggedIn: (state, action) => {
      state.isLoggedIn = action.payload;
    },
    setActiveSubscription: (state, action) => {
      state.hasActiveSubscription = action.payload;
    },
    setTrialActivated: (state, action) => {
      state.trialActivated = action.payload;
      
      // トライアルの開始時には14日後の期限日も設定する
      if (action.payload) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 14); // 14日間のトライアル
        state.trialExpiryDate = expiryDate.toISOString();
      } else {
        state.trialExpiryDate = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.id = action.payload.id;
          state.name = action.payload.name || '';
          state.email = action.payload.email || '';
          state.isLoggedIn = true; // プロフィール取得成功時はログイン状態を設定
          // サーバーからのレスポンスに含まれる場合
          if (action.payload.hasActiveSubscription !== undefined) {
            state.hasActiveSubscription = action.payload.hasActiveSubscription;
          }
          if (action.payload.trialActivated !== undefined) {
            state.trialActivated = action.payload.trialActivated;
          }
          if (action.payload.trialExpiryDate) {
            state.trialExpiryDate = action.payload.trialExpiryDate;
          }
        }
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isLoggedIn = false; // プロフィール取得失敗時はログアウト状態を設定
      })
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.name = action.payload.name || state.name;
          state.email = action.payload.email || state.email;
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// アクションをエクスポート
export const { 
  updateLastReminderDate, 
  setLoggedIn, 
  setActiveSubscription, 
  setTrialActivated 
} = userSlice.actions;

export default userSlice.reducer;