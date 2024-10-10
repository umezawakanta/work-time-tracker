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
      const response = await todoApi.getAll();
      return response.data;
    } catch {
      return rejectWithValue('Todo項目の取得に失敗しました');
    }
  }
);

export const addTodoItem = createAsyncThunk<TodoItem, string, { rejectValue: string }>(
  'todo/addItem',
  async (task, { rejectWithValue }) => {
    try {
      const response = await todoApi.create(task);
      return response.data;
    } catch {
      return rejectWithValue('Todo項目の追加に失敗しました');
    }
  }
);

export const updateTodoItem = createAsyncThunk<
  TodoItem,
  { _id: string; updates: Partial<TodoItem> },
  { rejectValue: string }
>('todo/updateItem', async ({ _id, updates }, { rejectWithValue }) => {
  try {
    const response = await todoApi.update(_id, updates);
    return response.data;
  } catch {
    return rejectWithValue('Todo項目の更新に失敗しました');
  }
});

export const deleteTodoItem = createAsyncThunk<string, string, { rejectValue: string }>(
  'todo/deleteItem',
  async (_id, { rejectWithValue }) => {
    try {
      await todoApi.delete(_id);
      return _id;
    } catch {
      return rejectWithValue('Todo項目の削除に失敗しました');
    }
  }
);

export const resetTodoList = createAsyncThunk<void, void, { rejectValue: string }>(
  'todo/resetList',
  async (_, { rejectWithValue }) => {
    try {
      await todoApi.reset();
    } catch {
      return rejectWithValue('Todoリストのリセットに失敗しました');
    }
  }
);

export const reorderTodoItems = createAsyncThunk<TodoItem[], TodoItem[], { rejectValue: string }>(
  'todo/reorderItems',
  async (items, { rejectWithValue }) => {
    try {
      const response = await todoApi.reorder(items);
      return response.data;
    } catch {
      return rejectWithValue('Todo項目の並べ替えに失敗しました');
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
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTodoItems.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchTodoItems.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Todo項目の取得に失敗しました';
      })
      .addCase(addTodoItem.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.error = null;
      })
      .addCase(addTodoItem.rejected, (state, action) => {
        state.error = action.payload || 'Todo項目の追加に失敗しました';
      })
      .addCase(updateTodoItem.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateTodoItem.rejected, (state, action) => {
        state.error = action.payload || 'Todo項目の更新に失敗しました';
      })
      .addCase(deleteTodoItem.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteTodoItem.rejected, (state, action) => {
        state.error = action.payload || 'Todo項目の削除に失敗しました';
      })
      .addCase(resetTodoList.fulfilled, (state) => {
        state.items = [];
        state.error = null;
      })
      .addCase(resetTodoList.rejected, (state, action) => {
        state.error = action.payload || 'Todoリストのリセットに失敗しました';
      })
      .addCase(reorderTodoItems.fulfilled, (state, action) => {
        state.items = action.payload;
        state.error = null;
      })
      .addCase(reorderTodoItems.rejected, (state, action) => {
        state.error = action.payload || 'Todo項目の並べ替えに失敗しました';
      });
  },
});

export default todoSlice.reducer;