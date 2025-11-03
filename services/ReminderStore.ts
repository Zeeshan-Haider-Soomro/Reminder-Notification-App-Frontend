import { store } from "../store";
import { addReminder, updateReminder, removeReminder } from "../store/remindersSlice";
import { Reminder } from "../types";
import { v4 as uuidv4 } from "uuid";

class ReminderStore {
  add(reminderData: Omit<Reminder, "id" | "notificationId">): Reminder {
    const id = uuidv4();
    const reminder: Reminder = { id, ...reminderData };
    store.dispatch(addReminder(reminder));
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
