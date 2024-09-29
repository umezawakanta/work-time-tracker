import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { WorkTimeEntry } from "../types/workTimeEntry";
import { workTimeApi } from "../services/api";

interface WorkTimeApiResponse {
  message: string;
  workTime: WorkTimeEntry;
}

export const fetchWorkTimeEntries = createAsyncThunk<
  WorkTimeEntry[],
  void,
  { rejectValue: string }
>("workTime/fetchEntries", async (_, { rejectWithValue }) => {
  try {
    const response = await workTimeApi.getAll();
    return response.data;
  } catch (error) {
    console.error("エントリーの取得中にエラーが発生しました:", error);
    return rejectWithValue(
      error instanceof Error ? error.message : "エントリーの取得に失敗しました"
    );
  }
});

export const addWorkTimeEntry = createAsyncThunk<
  WorkTimeEntry,
  Omit<WorkTimeEntry, "_id">,
  { rejectValue: string }
>("workTime/addEntry", async (entry, { rejectWithValue }) => {
  try {
    const response = await workTimeApi.create(entry);
    return (response.data as WorkTimeApiResponse).workTime;
  } catch (error) {
    console.error("エントリーの追加中にエラーが発生しました:", error);
    return rejectWithValue(
      error instanceof Error ? error.message : "エントリーの追加に失敗しました"
    );
  }
});

export const updateWorkTimeEntry = createAsyncThunk<
  WorkTimeEntry,
  { id: string; entry: Partial<WorkTimeEntry> },
  { rejectValue: string }
>("workTime/updateEntry", async ({ id, entry }, { rejectWithValue }) => {
  try {
    const response = await workTimeApi.update(id, entry);
    return (response.data as WorkTimeApiResponse).workTime;
  } catch (error) {
    console.error("エントリーの更新中にエラーが発生しました:", error);
    return rejectWithValue(
      error instanceof Error ? error.message : "エントリーの更新に失敗しました"
    );
  }
});

export const deleteWorkTimeEntry = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("workTime/deleteEntry", async (id, { rejectWithValue }) => {
  try {
    await workTimeApi.delete(id);
    return id;
  } catch (error) {
    console.error("エントリーの削除中にエラーが発生しました:", error);
    return rejectWithValue(
      error instanceof Error ? error.message : "エントリーの削除に失敗しました"
    );
  }
});

interface WorkTimeState {
  entries: WorkTimeEntry[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: WorkTimeState = {
  entries: [],
  status: "idle",
  error: null,
};

const workTimeSlice = createSlice({
  name: "workTime",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkTimeEntries.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchWorkTimeEntries.fulfilled,
        (state, action: PayloadAction<WorkTimeEntry[]>) => {
          state.status = "succeeded";
          state.entries = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchWorkTimeEntries.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "エントリーの取得に失敗しました";
      })
      .addCase(
        addWorkTimeEntry.fulfilled,
        (state, action: PayloadAction<WorkTimeEntry>) => {
          state.entries.push(action.payload);
          state.error = null;
        }
      )
      .addCase(addWorkTimeEntry.rejected, (state, action) => {
        state.error = action.payload || "エントリーの追加に失敗しました";
      })
      .addCase(
        updateWorkTimeEntry.fulfilled,
        (state, action: PayloadAction<WorkTimeEntry>) => {
          const index = state.entries.findIndex(
            (entry) => entry._id === action.payload._id
          );
          if (index !== -1) {
            state.entries[index] = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(updateWorkTimeEntry.rejected, (state, action) => {
        state.error = action.payload || "エントリーの更新に失敗しました";
      })
      .addCase(
        deleteWorkTimeEntry.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.entries = state.entries.filter(
            (entry) => entry._id !== action.payload
          );
          state.error = null;
        }
      )
      .addCase(deleteWorkTimeEntry.rejected, (state, action) => {
        state.error = action.payload || "エントリーの削除に失敗しました";
      });
  },
});

export default workTimeSlice.reducer;
