import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface WorkTimeEntry {
  _id?: string;
  projectName: string;
  description: string;
  startTime: Date;
  endTime: Date;
  duration?: number;
  date?: string;
}

interface WorkTimeState {
  entries: WorkTimeEntry[];
}

const initialState: WorkTimeState = {
  entries: [],
};

const workTimeSlice = createSlice({
  name: "workTime",
  initialState,
  reducers: {
    addWorkTimeEntry: (state, action: PayloadAction<WorkTimeEntry>) => {
      state.entries.push(action.payload);
    },
    // 他のリデューサーがあればここに追加
  },
});

export const { addWorkTimeEntry } = workTimeSlice.actions;
export default workTimeSlice.reducer;
