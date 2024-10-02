import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { todoApi } from "@/services/api";

export interface TodoItem {
  _id: string;
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

export const fetchTodoItems = createAsyncThunk(
  "todo/fetchTodoItems",
  async () => {
    const response = await todoApi.getAll();
    return response.data;
  }
);

export const addTodoItem = createAsyncThunk(
  "todo/addTodoItem",
  async (task: string) => {
    const response = await todoApi.create(task);
    return response.data.todo;
  }
);

export const updateTodoItem = createAsyncThunk(
  "todo/updateTodoItem",
  async ({ _id, updates }: { _id: string; updates: Partial<TodoItem> }) => {
    const response = await todoApi.update(_id, updates);
    return response.data.todo;
  }
);

export const deleteTodoItem = createAsyncThunk(
  "todo/deleteTodoItem",
  async (_id: string) => {
    await todoApi.delete(_id);
    return _id;
  }
);

export const resetTodoList = createAsyncThunk(
  "todo/resetTodoList",
  async () => {
    const response = await todoApi.reset();
    // APIのレスポンスに合わせて、TodoItem[]を返すように修正
    return response.data as TodoItem[];
  }
);

const todoSlice = createSlice({
  name: "todo",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodoItems.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchTodoItems.fulfilled,
        (state, action: PayloadAction<TodoItem[]>) => {
          state.status = "succeeded";
          state.items = action.payload;
        }
      )
      .addCase(fetchTodoItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Something went wrong";
      })
      .addCase(
        addTodoItem.fulfilled,
        (state, action: PayloadAction<TodoItem>) => {
          state.items.push(action.payload);
        }
      )
      .addCase(
        updateTodoItem.fulfilled,
        (state, action: PayloadAction<TodoItem>) => {
          const index = state.items.findIndex(
            (item) => item._id === action.payload._id
          );
          if (index !== -1) {
            state.items[index] = action.payload;
          }
        }
      )
      .addCase(
        deleteTodoItem.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.items = state.items.filter(
            (item) => item._id !== action.payload
          );
        }
      )
      .addCase(
        resetTodoList.fulfilled,
        (state, action: PayloadAction<TodoItem[]>) => {
          state.items = action.payload;
        }
      );
  },
});

export default todoSlice.reducer;
