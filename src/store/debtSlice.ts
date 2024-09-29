import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { debtApi } from "../services/api";

export interface DebtEntry {
  _id?: string;
  date: string;
  value: number;
  description: string;
  account: string;
}

interface DebtState {
  entries: DebtEntry[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: DebtState = {
  entries: [],
  status: "idle",
  error: null,
};

export const fetchDebtEntries = createAsyncThunk<
  DebtEntry[],
  void,
  { rejectValue: string }
>("debt/fetchEntries", async (_, { rejectWithValue }) => {
  try {
    const response = await debtApi.getAll();
    return response.data;
  } catch (error) {
    console.error("負債エントリーの取得中にエラーが発生しました:", error);
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : "負債エントリーの取得に失敗しました"
    );
  }
});

export const addDebtEntry = createAsyncThunk<
  DebtEntry,
  Omit<DebtEntry, "_id">,
  { rejectValue: string }
>("debt/addEntry", async (entry, { rejectWithValue }) => {
  try {
    const response = await debtApi.create(entry);
    return response.data.debt;
  } catch (error) {
    console.error("負債エントリーの追加中にエラーが発生しました:", error);
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : "負債エントリーの追加に失敗しました"
    );
  }
});

export const deleteDebtEntry = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("debt/deleteEntry", async (id, { rejectWithValue }) => {
  try {
    await debtApi.delete(id);
    return id;
  } catch (error) {
    console.error("負債エントリーの削除中にエラーが発生しました:", error);
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : "負債エントリーの削除に失敗しました"
    );
  }
});

const debtSlice = createSlice({
  name: "debt",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDebtEntries.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchDebtEntries.fulfilled,
        (state, action: PayloadAction<DebtEntry[]>) => {
          state.status = "succeeded";
          state.entries = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchDebtEntries.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "負債エントリーの取得に失敗しました";
      })
      .addCase(
        addDebtEntry.fulfilled,
        (state, action: PayloadAction<DebtEntry>) => {
          state.entries.push(action.payload);
          state.error = null;
        }
      )
      .addCase(addDebtEntry.rejected, (state, action) => {
        state.error = action.payload || "負債エントリーの追加に失敗しました";
      })
      .addCase(
        deleteDebtEntry.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.entries = state.entries.filter(
            (entry) => entry._id !== action.payload
          );
          state.error = null;
        }
      )
      .addCase(deleteDebtEntry.rejected, (state, action) => {
        state.error = action.payload || "負債エントリーの削除に失敗しました";
      });
  },
});

export default debtSlice.reducer;
