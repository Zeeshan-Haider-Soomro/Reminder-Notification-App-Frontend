export interface Reminder {
  id: string;
  name: string;
  task: string;
  notify_at: string; // ISO string
  notificationId?: string; // id returned by expo schedule
}
