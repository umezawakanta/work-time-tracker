import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUserProfile, updateUserProfile } from '@/services/api/authApi';

// UserState インターフェースに lastReminderDate を追加
interface UserState {
  id: string | null;
  name: string;
  email: string;
  isLoading: boolean;
  error: string | null;
  lastReminderDate: string | null; // 追加
}

// 初期状態に lastReminderDate を追加
const initialState: UserState = {
  id: null,
  name: '',
  email: '',
  isLoading: false,
  error: null,
  lastReminderDate: null, // 追加
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

// reducers に updateLastReminderDate アクションを追加
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateLastReminderDate: (state, action) => {
      state.lastReminderDate = action.payload;
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
        }
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
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
export const { updateLastReminderDate } = userSlice.actions;
export default userSlice.reducer;