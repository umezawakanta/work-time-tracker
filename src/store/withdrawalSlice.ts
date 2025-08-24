import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { withdrawalApi } from '@/services/api/withdrawalApi';

export interface WithdrawalEntry {
  _id?: string;
  date: string;
  bank: string;
  branch: string;
  amount: number;
  description: string;
}

interface WithdrawalState {
  entries: WithdrawalEntry[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: WithdrawalState = {
  entries: [],
  status: 'idle',
  error: null,
};

export const fetchWithdrawalEntries = createAsyncThunk<
  WithdrawalEntry[],
  void,
  { rejectValue: string }
>('withdrawal/fetchEntries', async (_, { rejectWithValue }) => {
  try {
    const response = await withdrawalApi.getAll();
    return response.data;
  } catch (error) {
    console.error('口座引き落とし情報の取得中にエラーが発生しました:', error);
    return rejectWithValue(
      error instanceof Error ? error.message : '口座引き落とし情報の取得に失敗しました'
    );
  }
});

export const addWithdrawalEntry = createAsyncThunk<
  WithdrawalEntry,
  Omit<WithdrawalEntry, '_id'>,
  { rejectValue: string }
>('withdrawal/addEntry', async (entry, { rejectWithValue }) => {
  try {
    const response = await withdrawalApi.create(entry);
    return response.data.withdrawal;
  } catch (error) {
    console.error('口座引き落とし情報の追加中にエラーが発生しました:', error);
    return rejectWithValue(
      error instanceof Error ? error.message : '口座引き落とし情報の追加に失敗しました'
    );
  }
});

export const updateWithdrawalEntry = createAsyncThunk<
  WithdrawalEntry,
  { id: string; entry: Partial<WithdrawalEntry> },
  { rejectValue: string }
>('withdrawal/updateEntry', async ({ id, entry }, { rejectWithValue }) => {
  try {
    const response = await withdrawalApi.update(id, entry);
    return response.data.withdrawal;
  } catch (error) {
    console.error('口座引き落とし情報の更新中にエラーが発生しました:', error);
    return rejectWithValue(
      error instanceof Error ? error.message : '口座引き落とし情報の更新に失敗しました'
    );
  }
});

export const deleteWithdrawalEntry = createAsyncThunk<string, string, { rejectValue: string }>(
  'withdrawal/deleteEntry',
  async (id, { rejectWithValue }) => {
    try {
      await withdrawalApi.delete(id);
      return id;
    } catch (error) {
      console.error('口座引き落とし情報の削除中にエラーが発生しました:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : '口座引き落とし情報の削除に失敗しました'
      );
    }
  }
);

const withdrawalSlice = createSlice({
  name: 'withdrawal',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWithdrawalEntries.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(
        fetchWithdrawalEntries.fulfilled,
        (state, action: PayloadAction<WithdrawalEntry[]>) => {
          state.status = 'succeeded';
          state.entries = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchWithdrawalEntries.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || '口座引き落とし情報の取得に失敗しました';
      })
      .addCase(addWithdrawalEntry.fulfilled, (state, action: PayloadAction<WithdrawalEntry>) => {
        state.entries.push(action.payload);
        state.error = null;
      })
      .addCase(addWithdrawalEntry.rejected, (state, action) => {
        state.error = action.payload || '口座引き落とし情報の追加に失敗しました';
      })
      .addCase(updateWithdrawalEntry.fulfilled, (state, action: PayloadAction<WithdrawalEntry>) => {
        const index = state.entries.findIndex((entry) => entry._id === action.payload._id);
        if (index !== -1) {
          state.entries[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateWithdrawalEntry.rejected, (state, action) => {
        state.error = action.payload || '口座引き落とし情報の更新に失敗しました';
      })
      .addCase(deleteWithdrawalEntry.fulfilled, (state, action: PayloadAction<string>) => {
        state.entries = state.entries.filter((entry) => entry._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteWithdrawalEntry.rejected, (state, action) => {
        state.error = action.payload || '口座引き落とし情報の削除に失敗しました';
      });
  },
});

export default withdrawalSlice.reducer;
