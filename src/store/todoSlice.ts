import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { todoApi } from "@/services/api/todoApi";
import { RootState } from "./index";

export interface TodoItem {
  _id: string;
  task: string;
  completed: boolean;
  completedDate: string | null;
  priority: number;
}

export interface TodoHistoryItem {
  date: string;
  completedTasks: {
    id: string;
    task: string;
    completedDate: string;
  }[];
  totalTasks: number;
}

interface TodoState {
  items: TodoItem[];
  history: TodoHistoryItem[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: TodoState = {
  items: [],
  history: [],
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
  async ({ task, priority }: { task: string; priority: number }) => {
    const response = await todoApi.create(task, priority);
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
    return response.data;
  }
);

export const reorderTodoItems = createAsyncThunk(
  "todo/reorderTodoItems",
  async (items: TodoItem[]) => {
    const response = await todoApi.reorder(items);
    return response.data.todos;
  }
);

const todoSlice = createSlice({
  name: "todo",
  initialState,
  reducers: {
    updateTodoHistory: (state) => {
      const today = new Date().toISOString().split('T')[0];
      const completedTasks = state.items
        .filter(item => item.completed && item.completedDate)
        .map(item => ({
          id: item._id,
          task: item.task,
          completedDate: item.completedDate!
        }));
      const totalTasks = state.items.length;

      const existingHistoryIndex = state.history.findIndex(item => item.date === today);
      if (existingHistoryIndex !== -1) {
        state.history[existingHistoryIndex] = { date: today, completedTasks, totalTasks };
      } else {
        state.history.push({ date: today, completedTasks, totalTasks });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodoItems.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTodoItems.fulfilled, (state, action: PayloadAction<TodoItem[]>) => {
        state.status = "succeeded";
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchTodoItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Something went wrong";
      })
      .addCase(addTodoItem.fulfilled, (state, action: PayloadAction<TodoItem>) => {
        state.items.push(action.payload);
        state.error = null;
      })
      .addCase(updateTodoItem.fulfilled, (state, action: PayloadAction<TodoItem>) => {
        const index = state.items.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(deleteTodoItem.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
        state.error = null;
      })
      .addCase(resetTodoList.fulfilled, (state, action: PayloadAction<TodoItem[]>) => {
        state.items = action.payload;
        state.error = null;
      })
      .addCase(reorderTodoItems.fulfilled, (state, action: PayloadAction<TodoItem[]>) => {
        state.items = action.payload;
        state.error = null;
      });
  },
});

export const { updateTodoHistory } = todoSlice.actions;

export const selectTodos = (state: RootState) => state.todo.items;
export const selectTodoStatus = (state: RootState) => state.todo.status;
export const selectTodoError = (state: RootState) => state.todo.error;
export const selectTodoHistory = (state: RootState) => state.todo.history;

export default todoSlice.reducer;