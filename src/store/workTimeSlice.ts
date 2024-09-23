import { WorkTimeEntry } from "@/types/workTimeEntry";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
