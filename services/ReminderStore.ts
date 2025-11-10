import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { store } from "../store";
import { addReminder, updateReminder, removeReminder } from "../store/remindersSlice";
import { Reminder } from "../types";

class ReminderStore {
  add(reminderData: Omit<Reminder, "id" | "notificationId">): Reminder {
    const id = uuidv4();
    const reminder: Reminder = { id, ...reminderData };
    
    // Check if reminder with same id already exists (shouldn't happen, but safety check)
    const existing = store.getState().reminders.list.find(r => r.id === id);
    if (!existing) {
      store.dispatch(addReminder(reminder));
    } else {
      // If exists, update it
      store.dispatch(updateReminder(reminder));
    }
    
    return reminder;
  }

  update(reminder: Reminder) {
    store.dispatch(updateReminder(reminder));
  }

  remove(id: string) {
    store.dispatch(removeReminder(id));
  }

  getAll(): Reminder[] {
    return store.getState().reminders.list;
  }
}

export default new ReminderStore();
