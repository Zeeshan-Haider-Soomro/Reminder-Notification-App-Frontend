
import axios from "axios";

const API_BASE = "http://localhost:4000"; 

export async function parseReminderText(message: string) {
  const res = await axios.post(`${API_BASE}/api/parse-reminder`, { message });
  return res.data; 
}
