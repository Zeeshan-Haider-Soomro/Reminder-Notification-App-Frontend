// 🔥 Firebase Configuration (Backend ke liye use hoga)
// ⚠️ Frontend me Expo Push Notifications use karenge
// Backend me Firebase Admin SDK se Expo Push API ke through notifications send karenge

// Note: Expo Go me direct FCM use nahi kar sakte
// Backend Expo Push Notification Service use karega jo automatically FCM/APNS ko handle karega

export const FIREBASE_CONFIG = {
  // Yeh config backend me use hogi
  // Frontend me Expo Push Token use hoga
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
};

// For future: Agar web me direct FCM chahiye to yahan setup kar sakte hain
// Abhi ke liye Expo Push Notifications use karenge

