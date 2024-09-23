import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WorkTimeEntry {
  id?: string;  // idを省略可能に変更
  projectName: string;
  description: string;
  duration: number;
  date: string;
}

interface WorkTimeState {
  entries: WorkTimeEntry[];
}

const initialState: WorkTimeState = {
  entries: [],
};

const workTimeSlice = createSlice({
  name: 'workTime',
  initialState,
  reducers: {
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
  },
});

export const { addWorkTimeEntry, updateWorkTimeEntry, deleteWorkTimeEntry } = workTimeSlice.actions;
export default workTimeSlice.reducer;