import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TodaySuggestion {
  task: string;
  reason?: string;
  createdAt: number;
}

interface AISuggestionState {
  today: TodaySuggestion | null;
}

const initialState: AISuggestionState = {
  today: null,
};

const aiSuggestionSlice = createSlice({
  name: 'aiSuggestion',
  initialState,
  reducers: {
    setTodaySuggestion(state, action: PayloadAction<{ task: string; reason?: string }>) {
      state.today = {
        task: action.payload.task,
        reason: action.payload.reason,
        createdAt: Date.now(),
      };
    },
    clearTodaySuggestion(state) {
      state.today = null;
    },
  },
});

export const { setTodaySuggestion, clearTodaySuggestion } = aiSuggestionSlice.actions;
export default aiSuggestionSlice.reducer;
