import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { todoApi } from "../services/api";

export interface TodoItem {
  id: string;
  task: string;
  completed: boolean;
}

interface TodoState {
  items: TodoItem[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: TodoState = {
  items: [],
  status: "idle",
  error: null,
};

export const fetchTodoItems = createAsyncThunk<
  TodoItem[],
  void,
  { rejectValue: string }
>("todo/fetchItems", async (_, { rejectWithValue }) => {
  try {
    const response = await todoApi.getAll();
    return response.data;
  } catch (error) {
    console.error("ToDoアイテムの取得中にエラーが発生しました:", error);
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : "ToDoアイテムの取得に失敗しました"
    );
  }
});

export const addTodoItem = createAsyncThunk<
  TodoItem,
  string,
  { rejectValue: string }
>("todo/addItem", async (task, { rejectWithValue }) => {
  try {
    const response = await todoApi.create(task);
    return response.data.todo;
  } catch (error) {
    console.error("ToDoアイテムの追加中にエラーが発生しました:", error);
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : "ToDoアイテムの追加に失敗しました"
    );
  }
});

export const updateTodoItem = createAsyncThunk<
  TodoItem,
  { id: string; updates: Partial<TodoItem> },
  { rejectValue: string }
>("todo/updateItem", async ({ id, updates }, { rejectWithValue }) => {
  try {
    const response = await todoApi.update(id, updates);
    return response.data.todo;
  } catch (error) {
    console.error("ToDoアイテムの更新中にエラーが発生しました:", error);
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : "ToDoアイテムの更新に失敗しました"
    );
  }
});

export const deleteTodoItem = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("todo/deleteItem", async (id, { rejectWithValue }) => {
  try {
    await todoApi.delete(id);
    return id;
  } catch (error) {
    console.error("ToDoアイテムの削除中にエラーが発生しました:", error);
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : "ToDoアイテムの削除に失敗しました"
    );
  }
});

export const resetTodoList = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("todo/resetList", async (_, { rejectWithValue }) => {
  try {
    await todoApi.reset();
  } catch (error) {
    console.error("ToDoリストのリセット中にエラーが発生しました:", error);
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : "ToDoリストのリセットに失敗しました"
    );
  }
});

const todoSlice = createSlice({
  name: "todo",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodoItems.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchTodoItems.fulfilled,
        (state, action: PayloadAction<TodoItem[]>) => {
          state.status = "succeeded";
          state.items = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchTodoItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "ToDoアイテムの取得に失敗しました";
      })
      .addCase(
        addTodoItem.fulfilled,
        (state, action: PayloadAction<TodoItem>) => {
          state.items.push(action.payload);
          state.error = null;
        }
      )
      .addCase(addTodoItem.rejected, (state, action) => {
        state.error = action.payload || "ToDoアイテムの追加に失敗しました";
      })
      .addCase(
        updateTodoItem.fulfilled,
        (state, action: PayloadAction<TodoItem>) => {
          const index = state.items.findIndex(
            (item) => item.id === action.payload.id
          );
          if (index !== -1) {
            state.items[index] = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(updateTodoItem.rejected, (state, action) => {
        state.error = action.payload || "ToDoアイテムの更新に失敗しました";
      })
      .addCase(
        deleteTodoItem.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.items = state.items.filter(
            (item) => item.id !== action.payload
          );
          state.error = null;
        }
      )
      .addCase(deleteTodoItem.rejected, (state, action) => {
        state.error = action.payload || "ToDoアイテムの削除に失敗しました";
      })
      .addCase(resetTodoList.fulfilled, (state) => {
        state.items = [];
        state.error = null;
      })
      .addCase(resetTodoList.rejected, (state, action) => {
        state.error = action.payload || "ToDoリストのリセットに失敗しました";
      });
  },
});

export default todoSlice.reducer;
