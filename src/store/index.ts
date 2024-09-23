// store/index.ts

import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WorkTimeEntry } from '../services/api';

// Work Time Entries Slice
interface WorkTimeState {
  entries: WorkTimeEntry[];
  loading: boolean;
  error: string | null;
}

const initialWorkTimeState: WorkTimeState = {
  entries: [],
  loading: false,
  error: null,
};

const workTimeSlice = createSlice({
  name: 'workTime',
  initialState: initialWorkTimeState,
  reducers: {
    setWorkTimeEntries: (state, action: PayloadAction<WorkTimeEntry[]>) => {
      state.entries = action.payload;
      state.loading = false;
      state.error = null;
    },
    addWorkTimeEntry: (state, action: PayloadAction<WorkTimeEntry>) => {
      state.entries.push(action.payload);
    },
    updateWorkTimeEntry: (state, action: PayloadAction<WorkTimeEntry>) => {
      const index = state.entries.findIndex(entry => entry.id === action.payload.id);
      if (index !== -1) {
        state.entries[index] = action.payload;
      }
    },
    deleteWorkTimeEntry: (state, action: PayloadAction<string>) => {
      state.entries = state.entries.filter(entry => entry.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

// User Slice (例として追加)
interface UserState {
  id: string | null;
  username: string | null;
  isAuthenticated: boolean;
}

const initialUserState: UserState = {
  id: null,
  username: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState: initialUserState,
  reducers: {
    setUser: (state, action: PayloadAction<{ id: string; username: string }>) => {
      state.id = action.payload.id;
      state.username = action.payload.username;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.id = null;
      state.username = null;
      state.isAuthenticated = false;
    },
  },
});

// Root Reducer
const rootReducer = {
  workTime: workTimeSlice.reducer,
  user: userSlice.reducer,
};

// Store
export const store = configureStore({
  reducer: rootReducer,
});

// Action Creators
export const {
  setWorkTimeEntries,
  addWorkTimeEntry,
  updateWorkTimeEntry,
  deleteWorkTimeEntry,
  setLoading,
  setError,
} = workTimeSlice.actions;

export const { setUser, clearUser } = userSlice.actions;

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
