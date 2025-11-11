import axios from "axios";
import { Platform } from "react-native";

const API_BASE = "http://192.168.90.188:4000"; // ✅ use your laptop's IP

// Register FCM Token
export async function registerFCMToken(token: string, platform: string) {
  const res = await axios.post(`${API_BASE}/api/fcm/register-token`, {
    token,
    platform,
  });
  return res.data;
}

// Create Reminder
export async function createReminder(reminder: {
  name: string;
  task: string;
  notify_at: string;
  fcmToken?: string;
  audioUrl?: string;
}) {
  const res = await axios.post(`${API_BASE}/api/reminders`, reminder);
  return res.data;
}

// Get All Reminders
export async function getReminders() {
  const res = await axios.get(`${API_BASE}/api/reminders`);
  return res.data;
}

// Delete Reminder
export async function deleteReminder(id: string) {
  const res = await axios.delete(`${API_BASE}/api/reminders/${id}`);
  return res.data;
}

// Upload Audio (mp3/ogg/webm/wav)
export async function uploadAudio(
  file: any
): Promise<{ success: boolean; url: string }> {
  const form = new FormData();
  if (Platform.OS === "web") {
    form.append("audio", file as any);
  } else {
    // Expecting { uri, name, type }
    const rnFile = file && file.uri ? file : null;
    if (!rnFile) {
      throw new Error("Invalid audio file");
    }
    form.append("audio", rnFile as any);
  }
  const res = await axios.post(`${API_BASE}/api/uploads/audio`, form as any, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

