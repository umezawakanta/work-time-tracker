import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { assetApi } from "../services/api";
import { AssetEntry } from "@/types";

interface AssetState {
  entries: AssetEntry[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AssetState = {
  entries: [],
  status: "idle",
  error: null,
};

export const fetchAssetEntries = createAsyncThunk<
  AssetEntry[],
  void,
  { rejectValue: string }
>("asset/fetchEntries", async (_, { rejectWithValue }) => {
  try {
    const response = await assetApi.getAll();
    return response.data;
  } catch (error) {
    console.error("資産エントリーの取得中にエラーが発生しました:", error);
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : "資産エントリーの取得に失敗しました"
    );
  }
});

export const addAssetEntry = createAsyncThunk<
  AssetEntry,
  Omit<AssetEntry, "_id">,
  { rejectValue: string }
>("asset/addEntry", async (entry, { rejectWithValue }) => {
  try {
    const response = await assetApi.create(entry);
    return response.data.asset;
  } catch (error) {
    console.error("資産エントリーの追加中にエラーが発生しました:", error);
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : "資産エントリーの追加に失敗しました"
    );
  }
});

export const updateAssetEntry = createAsyncThunk<
  AssetEntry,
  { id: string; entry: Partial<AssetEntry> },
  { rejectValue: string }
>("asset/updateEntry", async ({ id, entry }, { rejectWithValue }) => {
  try {
    const response = await assetApi.update(id, entry);
    return response.data.asset;
  } catch (error) {
    console.error("資産エントリーの更新中にエラーが発生しました:", error);
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : "資産エントリーの更新に失敗しました"
    );
  }
});

export const deleteAssetEntry = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("asset/deleteEntry", async (id, { rejectWithValue }) => {
  try {
    await assetApi.delete(id);
    return id;
  } catch (error) {
    console.error("資産エントリーの削除中にエラーが発生しました:", error);
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : "資産エントリーの削除に失敗しました"
    );
  }
});

const assetSlice = createSlice({
  name: "asset",
  initialState,
  reducers: {
    // QuickAddFormのために単純化されたアクションを追加
    addAsset: (state, action: PayloadAction<Omit<AssetEntry, "_id">>) => {
      const newEntry = {
        ...action.payload,
        _id: `local_${Date.now()}` // 一時的なIDを生成
      };
      state.entries.push(newEntry);
    }
  },
  extraReducers: (builder) => {
    // 既存のextraReducersはそのまま
    builder
      .addCase(fetchAssetEntries.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchAssetEntries.fulfilled,
        (state, action: PayloadAction<AssetEntry[]>) => {
          state.status = "succeeded";
          state.entries = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchAssetEntries.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "資産エントリーの取得に失敗しました";
      })
      .addCase(
        addAssetEntry.fulfilled,
        (state, action: PayloadAction<AssetEntry>) => {
          state.entries.push(action.payload);
          state.error = null;
        }
      )
      .addCase(addAssetEntry.rejected, (state, action) => {
        state.error = action.payload || "資産エントリーの追加に失敗しました";
      })
      .addCase(
        updateAssetEntry.fulfilled,
        (state, action: PayloadAction<AssetEntry>) => {
          const index = state.entries.findIndex(
            (entry) => entry._id === action.payload._id
          );
          if (index !== -1) {
            state.entries[index] = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(updateAssetEntry.rejected, (state, action) => {
        state.error = action.payload || "資産エントリーの更新に失敗しました";
      })
      .addCase(
        deleteAssetEntry.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.entries = state.entries.filter(
            (entry) => entry._id !== action.payload
          );
          state.error = null;
        }
      )
      .addCase(deleteAssetEntry.rejected, (state, action) => {
        state.error = action.payload || "資産エントリーの削除に失敗しました";
      });
  },
});

export const { addAsset } = assetSlice.actions;
export default assetSlice.reducer;
