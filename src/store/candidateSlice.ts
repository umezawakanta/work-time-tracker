import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { candidateApi } from '@services/api';
import { Candidate, CandidateState } from '@/types';

const initialState: CandidateState = {
  candidates: [],
  status: 'idle',
  error: null,
  lastUpdated: null, // lastUpdatedプロパティを追加
};

export const fetchCandidates = createAsyncThunk<Candidate[], void, { rejectValue: string }>(
  'candidates/fetchCandidates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await candidateApi.getAll();
      return response.data as Candidate[];
    } catch (error) {
      console.error('候補者の取得中にエラーが発生しました:', error);
      return rejectWithValue(error instanceof Error ? error.message : '候補者の取得に失敗しました');
    }
  }
);

export const addCandidate = createAsyncThunk<
  Candidate,
  Omit<Candidate, '_id'>,
  { rejectValue: string }
>('candidates/addCandidate', async (candidate, { rejectWithValue }) => {
  try {
    const response = await candidateApi.create(candidate);
    return response.data.candidate as Candidate;
  } catch (error) {
    console.error('候補者の追加中にエラーが発生しました:', error);
    return rejectWithValue(error instanceof Error ? error.message : '候補者の追加に失敗しました');
  }
});

export const updateCandidate = createAsyncThunk<
  Candidate,
  { id: string; candidate: Partial<Candidate> },
  { rejectValue: string }
>('candidates/updateCandidate', async ({ id, candidate }, { rejectWithValue }) => {
  try {
    const response = await candidateApi.update(id, candidate);
    return response.data.candidate as Candidate;
  } catch (error) {
    console.error('候補者の更新中にエラーが発生しました:', error);
    return rejectWithValue(error instanceof Error ? error.message : '候補者の更新に失敗しました');
  }
});

export const deleteCandidate = createAsyncThunk<string, string, { rejectValue: string }>(
  'candidates/deleteCandidate',
  async (id, { rejectWithValue }) => {
    try {
      await candidateApi.delete(id);
      return id;
    } catch (error) {
      console.error('候補者の削除中にエラーが発生しました:', error);
      return rejectWithValue(error instanceof Error ? error.message : '候補者の削除に失敗しました');
    }
  }
);

// リアルタイム更新のサブスクリプション処理を追加
let updateInterval: ReturnType<typeof setInterval> | null = null;

// リアルタイム更新を購読する関数
export const subscribeToUpdates = createAsyncThunk(
  'candidates/subscribeToUpdates',
  async (_, { dispatch }) => {
    // 既存のインターバルがあれば解除
    if (updateInterval) {
      clearInterval(updateInterval);
    }

    // 定期的に候補者データを更新（例：30秒ごと）
    updateInterval = setInterval(() => {
      dispatch(fetchCandidates());
    }, 30000);

    return true;
  }
);

// リアルタイム更新の購読を解除する関数
export const unsubscribeFromUpdates = createAsyncThunk(
  'candidates/unsubscribeFromUpdates',
  async () => {
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }
    return true;
  }
);

const candidateSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCandidates.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCandidates.fulfilled, (state, action: PayloadAction<Candidate[]>) => {
        state.status = 'succeeded';
        state.candidates = action.payload;
        state.lastUpdated = new Date().toISOString(); // 最終更新日時を記録
        state.error = null;
      })
      .addCase(fetchCandidates.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || '候補者の取得に失敗しました';
      })
      .addCase(addCandidate.fulfilled, (state, action: PayloadAction<Candidate>) => {
        state.candidates.push(action.payload);
        state.error = null;
      })
      .addCase(addCandidate.rejected, (state, action) => {
        state.error = action.payload || '候補者の追加に失敗しました';
      })
      .addCase(updateCandidate.fulfilled, (state, action: PayloadAction<Candidate>) => {
        const index = state.candidates.findIndex(
          (candidate) => candidate._id === action.payload._id
        );
        if (index !== -1) {
          state.candidates[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateCandidate.rejected, (state, action) => {
        state.error = action.payload || '候補者の更新に失敗しました';
      })
      .addCase(deleteCandidate.fulfilled, (state, action: PayloadAction<string>) => {
        state.candidates = state.candidates.filter((candidate) => candidate._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteCandidate.rejected, (state, action) => {
        state.error = action.payload || '候補者の削除に失敗しました';
      })
      // 以下の2つのケースを追加（必要に応じて）
      .addCase(subscribeToUpdates.fulfilled, (state) => {
        // サブスクリプション成功時の処理（必要に応じて状態を更新）
        console.log(state.lastUpdated); // 最終更新日時を確認
      })
      .addCase(unsubscribeFromUpdates.fulfilled, (state) => {
        // サブスクリプション解除時の処理（必要に応じて状態を更新）
        console.log(state.lastUpdated); // 最終更新日時を確認
      });
  },
});

export default candidateSlice.reducer;
