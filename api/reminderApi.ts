import axios from "axios";

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

