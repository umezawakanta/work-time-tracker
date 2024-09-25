import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { WorkTimeEntry } from "../types/workTimeEntry";
import { workTimeApi } from "../services/api";

export const fetchWorkTimeEntries = createAsyncThunk<WorkTimeEntry[]>(
  "workTime/fetchEntries",
  async () => {
    const response = await workTimeApi.getAll();
    return response.data;
  }
);

export const addWorkTimeEntry = createAsyncThunk<WorkTimeEntry, WorkTimeEntry>(
  "workTime/addEntry",
  async (entry) => {
    const response = await workTimeApi.create(entry);
    return response.data;
  }
);

export const updateWorkTimeEntry = createAsyncThunk<
  WorkTimeEntry,
  { id: string; entry: WorkTimeEntry }
>("workTime/updateEntry", async ({ id, entry }) => {
  const response = await workTimeApi.update(id, entry);
  return response.data;
});

export const deleteWorkTimeEntry = createAsyncThunk<string, string>(
  "workTime/deleteEntry",
  async (id) => {
    await workTimeApi.delete(id);
    return id;
  }
);

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
      })
      .addCase(
        fetchWorkTimeEntries.fulfilled,
        (state, action: PayloadAction<WorkTimeEntry[]>) => {
          state.status = "succeeded";
          state.entries = action.payload.map((entry) => ({
            ...entry,
            startTime: new Date(entry.startTime),
            endTime: new Date(entry.endTime),
          }));
        }
      )
      .addCase(fetchWorkTimeEntries.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "エントリーの取得に失敗しました";
      })
      .addCase(
        addWorkTimeEntry.fulfilled,
        (state, action: PayloadAction<WorkTimeEntry>) => {
          state.entries.push({
            ...action.payload,
            startTime: new Date(action.payload.startTime),
            endTime: new Date(action.payload.endTime),
          });
        }
      )
      .addCase(
        updateWorkTimeEntry.fulfilled,
        (state, action: PayloadAction<WorkTimeEntry>) => {
          const index = state.entries.findIndex(
            (entry) => entry._id === action.payload._id
          );
          if (index !== -1) {
            state.entries[index] = {
              ...action.payload,
              startTime: new Date(action.payload.startTime),
              endTime: new Date(action.payload.endTime),
            };
          }
        }
      )
      .addCase(
        deleteWorkTimeEntry.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.entries = state.entries.filter(
            (entry) => entry._id !== action.payload
          );
        }
      );
  },
});

export default workTimeSlice.reducer;
