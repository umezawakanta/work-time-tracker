import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "./index";
import { todoApi } from "@/services/api/todoApi";

export interface TodoItem {
  _id: string;
  task: string;
  completed: boolean;
  priority: number;
  isPrioritized: boolean;
  completedDate: string | null;
}

interface TodoState {
  items: TodoItem[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  todoHistory: Record<string, number>;
}

const initialState: TodoState = {
  items: [],
  status: "idle",
  error: null,
  todoHistory: {},
};

export const fetchTodoItems = createAsyncThunk("todo/fetchTodoItems", async () => {
  const response = await todoApi.getAll();
  return response.data;
});

export const addTodoItem = createAsyncThunk(
  "todo/addTodoItem",
  async (todo: { task: string; priority: number; isPrioritized: boolean }) => {
    const response = await todoApi.create(todo.task, todo.priority, todo.isPrioritized);
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
  async (id: string) => {
    await todoApi.delete(id);
    return id;
  }
);



export const resetTodoList = createAsyncThunk("todo/resetTodoList", async () => {
  const response = await todoApi.reset();
  return response.data;
});

export const reorderTodoItems = createAsyncThunk(
  "todo/reorderTodoItems",
  async (items: TodoItem[]) => {
    const response = await todoApi.reorder(items);
    return response.data.todos;
  }
);

export const toggleTodoPriority = createAsyncThunk(
  "todo/toggleTodoPriority",
  async (id: string) => {
    const response = await todoApi.togglePriority(id);
    return response.data.todo;
  }
);

const todoSlice = createSlice({
  name: "todo",
  initialState,
  reducers: {
    // 引数を受け取る形に変更
    updateTodoHistory: (
      state,
      action: { payload: { date: string; count: number } }
    ) => {
      const { date, count } = action.payload;
      state.todoHistory[date] = count;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodoItems.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTodoItems.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchTodoItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(addTodoItem.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateTodoItem.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteTodoItem.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      })
      .addCase(resetTodoList.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(reorderTodoItems.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(toggleTodoPriority.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export const { updateTodoHistory } = todoSlice.actions;

export const selectTodos = (state: RootState) => state.todo.items;
export const selectTodoStatus = (state: RootState) => state.todo.status;
export const selectTodoError = (state: RootState) => state.todo.error;
export const selectTodoHistory = (state: RootState) => state.todo.todoHistory;

export default todoSlice.reducer;
