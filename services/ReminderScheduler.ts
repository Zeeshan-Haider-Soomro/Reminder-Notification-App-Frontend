import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Reminder } from "../types";

// 1️⃣ Notification Handler — mobile only
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// 🔔 Android Notification Channel Setup
if (Platform.OS === "android") {
  Notifications.setNotificationChannelAsync("default", {
    name: "default",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#FF231F7C",
    sound: "custom_sound.wav", // 👈 For Android (if using custom sound in native build)
  });
}

// 2️⃣ Browser fallback function (Web Custom Sound)
function notifyWeb(title: string, body: string) {
  if (!("Notification" in window)) {
    alert(`${title}\n${body}`);
    return;
  }

  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      new Notification(title, { body, silent: true });

      // 👇 Play custom recorded voice (must exist in public/sounds/)
      const audio = new Audio("/sounds/reminder_sound.mp3");
      audio
        .play()
        .then(() => console.log("Custom sound played successfully 🎵"))
        .catch((err) => console.warn("Audio play failed:", err));
    }
  });
}

class ReminderScheduler {
  // 3️⃣ Request Notification Permissions
  async requestPermissions(): Promise<void> {
    if (Platform.OS === "web") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Notification permissions not granted on web");
      }
    } else {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Notification permissions not granted on mobile");
      }
    }
  }

  // 4️⃣ Schedule Reminder
  async schedule(reminder: Reminder): Promise<string | null> {
    const date = new Date(reminder.notify_at);
    if (isNaN(date.getTime())) throw new Error("Invalid date");

    if (Platform.OS === "web") {
      // Web fallback using setTimeout
      const now = new Date();
      const delay = date.getTime() - now.getTime();

      setTimeout(() => {
        notifyWeb(`Reminder — ${reminder.name}`, reminder.task);
      }, delay > 0 ? delay : 0);

      return null; // web has no notification ID
    } else {
      // Mobile — Expo notifications
      const trigger: Notifications.DateTriggerInput = {
        type: "date" as Notifications.SchedulableTriggerInputTypes.DATE,
        date,
      };

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Reminder — ${reminder.name}`,
          body: reminder.task,
          sound: "custom_sound.wav", // 👈 Custom sound for Android/iOS build
          data: { reminderId: reminder.id },
        },
        trigger,
      });

      return id;
    }
  }

  // 5️⃣ Cancel Scheduled Notification
  async cancel(notificationId: string): Promise<void> {
    if (Platform.OS !== "web") {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    }
    // Web fallback: cannot cancel scheduled setTimeout notifications
  }
}

export default new ReminderScheduler();
