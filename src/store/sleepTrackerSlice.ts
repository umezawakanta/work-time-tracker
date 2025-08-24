import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { sleepTrackerApi } from '@/services/api/sleepTrackerApi';
import type { RootState } from './index';

export interface SleepRecord {
  _id: string;
  date: string;
  wakeUp: string | null;
  bedtime: string | null;
  quality?: string; // 'good' | 'neutral' | 'bad'
  notes?: string; // 睡眠に関するメモ
}

interface SleepTrackerState {
  records: SleepRecord[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SleepTrackerState = {
  records: [],
  status: 'idle',
  error: null,
};

export const fetchSleepRecords = createAsyncThunk('sleepTracker/fetchSleepRecords', async () => {
  const response = await sleepTrackerApi.getAll();
  return response.data;
});

export const addSleepRecord = createAsyncThunk(
  'sleepTracker/addSleepRecord',
  async (record: Omit<SleepRecord, '_id'>) => {
    const response = await sleepTrackerApi.create(record);
    return response.data.sleepRecord;
  }
);

export const updateSleepRecord = createAsyncThunk(
  'sleepTracker/updateSleepRecord',
  async ({ _id, updates }: { _id: string; updates: Partial<SleepRecord> }) => {
    const response = await sleepTrackerApi.update(_id, updates);
    return response.data.sleepRecord;
  }
);

export const deleteSleepRecord = createAsyncThunk(
  'sleepTracker/deleteSleepRecord',
  async (_id: string) => {
    await sleepTrackerApi.delete(_id);
    return _id;
  }
);

const sleepTrackerSlice = createSlice({
  name: 'sleepTracker',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSleepRecords.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSleepRecords.fulfilled, (state, action: PayloadAction<SleepRecord[]>) => {
        state.status = 'succeeded';
        state.records = action.payload;
        state.error = null;
      })
      .addCase(fetchSleepRecords.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Something went wrong';
      })
      .addCase(addSleepRecord.fulfilled, (state, action: PayloadAction<SleepRecord>) => {
        state.records.push(action.payload);
        state.error = null;
      })
      .addCase(updateSleepRecord.fulfilled, (state, action: PayloadAction<SleepRecord>) => {
        const index = state.records.findIndex((record) => record._id === action.payload._id);
        if (index !== -1) {
          state.records[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(deleteSleepRecord.fulfilled, (state, action: PayloadAction<string>) => {
        state.records = state.records.filter((record) => record._id !== action.payload);
        state.error = null;
      });
  },
});

export const selectSleepRecords = (state: RootState) => state.sleepTracker.records;
export const selectSleepTrackerStatus = (state: RootState) => state.sleepTracker.status;
export const selectSleepTrackerError = (state: RootState) => state.sleepTracker.error;

export default sleepTrackerSlice.reducer;
