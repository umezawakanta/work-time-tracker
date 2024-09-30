import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  lastReminderDate: string | null;
}

const initialState: UserState = {
  lastReminderDate: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateLastReminderDate(state, action: PayloadAction<string>) {
      state.lastReminderDate = action.payload;
    },
  },
});

export const { updateLastReminderDate } = userSlice.actions;
export default userSlice.reducer;
