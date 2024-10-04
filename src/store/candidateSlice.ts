// candidateSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { candidateApi } from "../services/api";

export interface Candidate {
  _id?: string;
  name: string;
  party: string;
  prefecture: string;
  district: number;
}

interface CandidateState {
  candidates: Candidate[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: CandidateState = {
  candidates: [],
  status: "idle",
  error: null,
};

export const fetchCandidates = createAsyncThunk<
  Candidate[],
  void,
  { rejectValue: string }
>("candidates/fetchCandidates", async (_, { rejectWithValue }) => {
  try {
    const response = await candidateApi.getAll();
    return response.data;
  } catch (error) {
    console.error("候補者の取得中にエラーが発生しました:", error);
    return rejectWithValue(
      error instanceof Error ? error.message : "候補者の取得に失敗しました"
    );
  }
});

export const addCandidate = createAsyncThunk<
  Candidate,
  Omit<Candidate, "_id">,
  { rejectValue: string }
>("candidates/addCandidate", async (candidate, { rejectWithValue }) => {
  try {
    const response = await candidateApi.create(candidate);
    return response.data.candidate;
  } catch (error) {
    console.error("候補者の追加中にエラーが発生しました:", error);
    return rejectWithValue(
      error instanceof Error ? error.message : "候補者の追加に失敗しました"
    );
  }
});

export const updateCandidate = createAsyncThunk<
  Candidate,
  { id: string; candidate: Partial<Candidate> },
  { rejectValue: string }
>(
  "candidates/updateCandidate",
  async ({ id, candidate }, { rejectWithValue }) => {
    try {
      const response = await candidateApi.update(id, candidate);
      return response.data.candidate;
    } catch (error) {
      console.error("候補者の更新中にエラーが発生しました:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "候補者の更新に失敗しました"
      );
    }
  }
);

export const deleteCandidate = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("candidates/deleteCandidate", async (id, { rejectWithValue }) => {
  try {
    await candidateApi.delete(id);
    return id;
  } catch (error) {
    console.error("候補者の削除中にエラーが発生しました:", error);
    return rejectWithValue(
      error instanceof Error ? error.message : "候補者の削除に失敗しました"
    );
  }
});

const candidateSlice = createSlice({
  name: "candidates",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCandidates.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchCandidates.fulfilled,
        (state, action: PayloadAction<Candidate[]>) => {
          state.status = "succeeded";
          state.candidates = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchCandidates.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "候補者の取得に失敗しました";
      })
      .addCase(
        addCandidate.fulfilled,
        (state, action: PayloadAction<Candidate>) => {
          state.candidates.push(action.payload);
          state.error = null;
        }
      )
      .addCase(addCandidate.rejected, (state, action) => {
        state.error = action.payload || "候補者の追加に失敗しました";
      })
      .addCase(
        updateCandidate.fulfilled,
        (state, action: PayloadAction<Candidate>) => {
          const index = state.candidates.findIndex(
            (candidate) => candidate._id === action.payload._id
          );
          if (index !== -1) {
            state.candidates[index] = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(updateCandidate.rejected, (state, action) => {
        state.error = action.payload || "候補者の更新に失敗しました";
      })
      .addCase(
        deleteCandidate.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.candidates = state.candidates.filter(
            (candidate) => candidate._id !== action.payload
          );
          state.error = null;
        }
      )
      .addCase(deleteCandidate.rejected, (state, action) => {
        state.error = action.payload || "候補者の削除に失敗しました";
      });
  },
});

export default candidateSlice.reducer;
