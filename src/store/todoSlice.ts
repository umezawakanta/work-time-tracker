import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { todoApi } from '@/services/api/todoApi';

export interface TodoItem {
  _id: string;
  task: string;
  completed: boolean;
}

interface TodoState {
  items: TodoItem[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TodoState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchTodoItems = createAsyncThunk<TodoItem[], void, { rejectValue: string }>(
  'todo/fetchItems',
  async (_, { rejectWithValue }) => {
    try {
      console.log("Fetching todo items from API");
      const response = await todoApi.getAll();
      console.log("Fetched todo items:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching todo items:", error);
      return rejectWithValue('Failed to fetch todo items');
    }
  }
);

export const addTodoItem = createAsyncThunk<TodoItem, string, { rejectValue: string }>(
  'todo/addItem',
  async (task, { rejectWithValue }) => {
    try {
      console.log("Adding new todo item:", task);
      const response = await todoApi.create(task);
      console.log("Added todo item:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error adding todo item:", error);
      return rejectWithValue('Failed to add todo item');
    }
  }
);

export const updateTodoItem = createAsyncThunk<
  TodoItem,
  { _id: string; updates: Partial<TodoItem> },
  { rejectValue: string }
>('todo/updateItem', async ({ _id, updates }, { rejectWithValue }) => {
  try {
    console.log("Updating todo item:", _id, updates);
    const response = await todoApi.update(_id, updates);
    console.log("Updated todo item:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating todo item:", error);
    return rejectWithValue('Failed to update todo item');
  }
});

export const deleteTodoItem = createAsyncThunk<string, string, { rejectValue: string }>(
  'todo/deleteItem',
  async (_id, { rejectWithValue }) => {
    try {
      console.log("Deleting todo item:", _id);
      await todoApi.delete(_id);
      console.log("Deleted todo item:", _id);
      return _id;
    } catch (error) {
      console.error("Error deleting todo item:", error);
      return rejectWithValue('Failed to delete todo item');
    }
  }
);

export const resetTodoList = createAsyncThunk<void, void, { rejectValue: string }>(
  'todo/resetList',
  async (_, { rejectWithValue }) => {
    try {
      console.log("Resetting todo list");
      await todoApi.reset();
      console.log("Todo list reset completed");
    } catch (error) {
      console.error("Error resetting todo list:", error);
      return rejectWithValue('Failed to reset todo list');
    }
  }
);

export const reorderTodoItems = createAsyncThunk<TodoItem[], TodoItem[], { rejectValue: string }>(
  'todo/reorderItems',
  async (items, { rejectWithValue }) => {
    try {
      console.log("Reordering todo items:", items);
      const response = await todoApi.reorder(items);
      console.log("Reordered todo items:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error reordering todo items:", error);
      return rejectWithValue('Failed to reorder todo items');
    }
  }
);

const todoSlice = createSlice({
  name: 'todo',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodoItems.pending, (state) => {
        console.log("fetchTodoItems: pending");
        state.status = 'loading';
      })
      .addCase(fetchTodoItems.fulfilled, (state, action) => {
        console.log("fetchTodoItems: fulfilled", action.payload);
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTodoItems.rejected, (state, action) => {
        console.log("fetchTodoItems: rejected", action.payload);
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch todo items';
      })
      .addCase(addTodoItem.fulfilled, (state, action) => {
        console.log("addTodoItem: fulfilled", action.payload);
        state.items.push(action.payload);
      })
      .addCase(updateTodoItem.fulfilled, (state, action) => {
        console.log("updateTodoItem: fulfilled", action.payload);
        const index = state.items.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteTodoItem.fulfilled, (state, action) => {
        console.log("deleteTodoItem: fulfilled", action.payload);
        state.items = state.items.filter((item) => item._id !== action.payload);
      })
      .addCase(resetTodoList.fulfilled, (state) => {
        console.log("resetTodoList: fulfilled");
        state.items = [];
      })
      .addCase(reorderTodoItems.fulfilled, (state, action) => {
        console.log("reorderTodoItems: fulfilled", action.payload);
        state.items = action.payload;
      });
  },
});

export default todoSlice.reducer;