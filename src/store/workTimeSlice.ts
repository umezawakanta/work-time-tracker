import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { WorkTimeEntry } from '../types/workTimeEntry';
import { workTimeApi } from '../services/api/workTimeApi';
import { WorkTimeApiResponse, WorkState } from '@/types';

export const fetchWorkTimeEntries = createAsyncThunk(
  'workTime/fetchEntries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await workTimeApi.getAll();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch work time entries');
    }
  }
);

export const createWorkTimeEntry = createAsyncThunk(
  'workTime/createEntry',
  async (entry: Omit<WorkTimeEntry, '_id' | 'userId'>, { rejectWithValue }) => {
    try {
      const response = await workTimeApi.create(entry);
      return response.data.workTime;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create work time entry');
    }
  }
);

export const updateWorkTimeEntry = createAsyncThunk<
  WorkTimeEntry,
  { id: string; entry: Partial<WorkTimeEntry> },
  { rejectValue: string }
>('workTime/updateEntry', async ({ id, entry }, { rejectWithValue }) => {
  try {
    const response = await workTimeApi.update(id, entry);
    return (response.data as WorkTimeApiResponse).workTime;
  } catch (error) {
    console.error('エントリーの更新中にエラーが発生しました:', error);
    return rejectWithValue(
      error instanceof Error ? error.message : 'エントリーの更新に失敗しました'
    );
  }
});

export const deleteWorkTimeEntry = createAsyncThunk<string, string, { rejectValue: string }>(
  'workTime/deleteEntry',
  async (id, { rejectWithValue }) => {
    try {
      await workTimeApi.delete(id);
      return id;
    } catch (error) {
      console.error('エントリーの削除中にエラーが発生しました:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'エントリーの削除に失敗しました'
      );
    }
  }
);

// 状態を取得するThunk
export const fetchWorkState = createAsyncThunk<
  WorkState | null,
  string, // userId
  { rejectValue: string }
>('workTime/fetchWorkState', async (userId, { rejectWithValue }) => {
  try {
    const response = await workTimeApi.getWorkState(userId);
    return response.data;
  } catch (error) {
    console.error('作業状態の取得中にエラーが発生しました:', error);
    return rejectWithValue(error instanceof Error ? error.message : '作業状態の取得に失敗しました');
  }
});

// 状態を保存するThunk
export const saveWorkState = createAsyncThunk<WorkState, WorkState, { rejectValue: string }>(
  'workTime/saveWorkState',
  async (workState, { rejectWithValue }) => {
    try {
      const response = await workTimeApi.saveWorkState(workState);
      return response.data.workState;
    } catch (error) {
      console.error('作業状態の保存中にエラーが発生しました:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : '作業状態の保存に失敗しました'
      );
    }
  }
);

interface WorkTimeState {
  entries: WorkTimeEntry[];
  isLoading: boolean;
  error: string | null;
  workState: WorkState | null;
}

const initialState: WorkTimeState = {
  entries: [],
  isLoading: false,
  error: null,
  workState: null,
};

const workTimeSlice = createSlice({
  name: 'workTime',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkTimeEntries.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkTimeEntries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.entries = action.payload;
      })
      .addCase(fetchWorkTimeEntries.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createWorkTimeEntry.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createWorkTimeEntry.fulfilled, (state, action) => {
        state.isLoading = false;
        state.entries.unshift(action.payload);
      })
      .addCase(createWorkTimeEntry.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateWorkTimeEntry.fulfilled, (state, action: PayloadAction<WorkTimeEntry>) => {
        const index = state.entries.findIndex((entry) => entry._id === action.payload._id);
        if (index !== -1) {
          state.entries[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateWorkTimeEntry.rejected, (state, action) => {
        state.error = action.payload || 'エントリーの更新に失敗しました';
      })
      .addCase(deleteWorkTimeEntry.fulfilled, (state, action: PayloadAction<string>) => {
        state.entries = state.entries.filter((entry) => entry._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteWorkTimeEntry.rejected, (state, action) => {
        state.error = action.payload || 'エントリーの削除に失敗しました';
      })
      .addCase(fetchWorkState.fulfilled, (state, action) => {
        state.workState = action.payload;
      })
      .addCase(fetchWorkState.rejected, (state) => {
        state.workState = null;
      })
      .addCase(saveWorkState.fulfilled, (state, action) => {
        state.workState = action.payload;
      })
      .addCase(saveWorkState.rejected, (state, action) => {
        state.error = action.payload || '作業状態の保存に失敗しました';
      });
  },
});

export const { clearError } = workTimeSlice.actions;
export default workTimeSlice.reducer;
