import axios from "axios";

const API_BASE = "http://192.168.90.70:4000"; // ✅ use your laptop's IP

export async function parseReminderText(message: string) {
  const res = await axios.post(`${API_BASE}/api/parse-reminder`, { message });
  return res.data; 
}
