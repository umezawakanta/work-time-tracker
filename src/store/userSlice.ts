import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  lastReminderDate: string | null;
  name: string;
  email: string;
}

const initialState: UserState = {
  lastReminderDate: null,
  name: "",
  email: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateLastReminderDate(state, action: PayloadAction<string>) {
      state.lastReminderDate = action.payload;
    },
    updateUser(state, action: PayloadAction<{ name: string; email: string }>) {
      state.name = action.payload.name;
      state.email = action.payload.email;
    },
  },
});

export const { updateLastReminderDate, updateUser } = userSlice.actions;
export default userSlice.reducer;