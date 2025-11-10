import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Reminder } from "../types";

interface RemindersState { list: Reminder[] }

const initialState: RemindersState = { list: [] };

const remindersSlice = createSlice({
  name: "reminders",
  initialState,
  reducers: {
    addReminder(state, action: PayloadAction<Reminder>) {
      // Duplicate check - agar same id ka reminder already hai to add nahi karo
      const exists = state.list.find(r => r.id === action.payload.id);
      if (!exists) {
        state.list.push(action.payload);
      } else {
        // Agar already hai to update karo
        state.list = state.list.map(r => r.id === action.payload.id ? action.payload : r);
      }
    },
    updateReminder(state, action: PayloadAction<Reminder>) {
      state.list = state.list.map(r => r.id === action.payload.id ? action.payload : r);
    },
    removeReminder(state, action: PayloadAction<string>) {
      state.list = state.list.filter(r => r.id !== action.payload);
    },
    setAll(state, action: PayloadAction<Reminder[]>) {
      state.list = action.payload;
    }
  }
});

export const { addReminder, updateReminder, removeReminder, setAll } = remindersSlice.actions;
export default remindersSlice.reducer;
