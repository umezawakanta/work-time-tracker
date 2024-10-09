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
  async (_, { rejectWithValue }) => {
    try {
      const response = await todoApi.getAll();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addTodoItem = createAsyncThunk(
  "todo/addTodoItem",
  async (task: string, { rejectWithValue }) => {
    try {
      const response = await todoApi.create(task);
      return response.data.todo;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateTodoItem = createAsyncThunk(
  "todo/updateTodoItem",
  async ({ _id, updates }: { _id: string; updates: Partial<TodoItem> }, { rejectWithValue }) => {
    try {
      const response = await todoApi.update(_id, updates);
      return response.data.todo;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteTodoItem = createAsyncThunk(
  "todo/deleteTodoItem",
  async (_id: string, { rejectWithValue }) => {
    try {
      await todoApi.delete(_id);
      return _id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const resetTodoList = createAsyncThunk(
  "todo/resetTodoList",
  async (_, { rejectWithValue }) => {
    try {
      const response = await todoApi.reset();
      return response.data as TodoItem[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
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
          state.error = null;
        }
      )
      .addCase(fetchTodoItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string || "Something went wrong";
      })
      .addCase(
        addTodoItem.fulfilled,
        (state, action: PayloadAction<TodoItem>) => {
          state.items.push(action.payload);
          state.error = null;
        }
      )
      .addCase(addTodoItem.rejected, (state, action) => {
        state.error = action.payload as string || "Failed to add todo item";
      })
      .addCase(
        updateTodoItem.fulfilled,
        (state, action: PayloadAction<TodoItem>) => {
          const index = state.items.findIndex(
            (item) => item._id === action.payload._id
          );
          if (index !== -1) {
            state.items[index] = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(updateTodoItem.rejected, (state, action) => {
        state.error = action.payload as string || "Failed to update todo item";
      })
      .addCase(
        deleteTodoItem.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.items = state.items.filter(
            (item) => item._id !== action.payload
          );
          state.error = null;
        }
      )
      .addCase(deleteTodoItem.rejected, (state, action) => {
        state.error = action.payload as string || "Failed to delete todo item";
      })
      .addCase(
        resetTodoList.fulfilled,
        (state, action: PayloadAction<TodoItem[]>) => {
          state.items = action.payload;
          state.error = null;
        }
      )
      .addCase(resetTodoList.rejected, (state, action) => {
        state.error = action.payload as string || "Failed to reset todo list";
      });
  },
});

export default todoSlice.reducer;