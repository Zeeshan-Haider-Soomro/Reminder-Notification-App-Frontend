import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import axios from "axios";
import Constants from "expo-constants";
import AudioService from "./AudioService";

const API_BASE = "http://192.168.90.188:4000"; // ✅ Your backend URL

class FCMService {
  private fcmToken: string | null = null;

  // 1️⃣ Request Permissions and Register Push Token
  // Expo Go me Expo Push Notifications use karenge (backend Expo Push API se FCM ko send karega)
  async registerForPushNotifications(): Promise<string | null> {
    try {
      if (Platform.OS === "web") {
        // Web me browser notifications use karenge
        // Web me local scheduling use karenge (backend se push notifications nahi)
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.warn("⚠️ Notification permission not granted on web");
          return null;
        }
        
        // Web ke liye "web" token (backend me store hoga but Expo Push API use nahi hogi)
        const token = `web-${Date.now()}`;
        this.fcmToken = token;
        await this.sendTokenToBackend(token);
        console.log("✅ Web token registered (local notifications will be used)");
        return token;
      } else {
        // Mobile (Android/iOS) - Expo Push Notifications
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== "granted") {
          console.warn("Notification permission not granted");
          return null;
        }

        // Expo push token get karo
        // Yeh token Expo Push Notification Service ko jayega
        // Backend me Expo Push API use karke FCM ko send kar sakte hain
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId || "fac5ccf4-bcb8-40c9-8cb4-fa7f5b40df80",
        });

        const token = tokenData.data;
        this.fcmToken = token;

        // Backend ko token send karo
        await this.sendTokenToBackend(token);
        console.log("✅ Push token registered:", token.substring(0, 20) + "...");
        return token;
      }
    } catch (error) {
      console.error("Error registering for push notifications:", error);
      return null;
    }
  }

  // 2️⃣ Send Token to Backend
  private async sendTokenToBackend(token: string): Promise<void> {
    try {
      await axios.post(`${API_BASE}/api/fcm/register-token`, {
        token,
        platform: Platform.OS,
      });
      console.log("✅ Token sent to backend successfully");
    } catch (error) {
      console.error("❌ Error sending token to backend:", error);
    }
  }

  // 3️⃣ Setup Notification Handlers
  setupNotificationHandlers(): void {
    if (Platform.OS === "web") {
      // Web me browser notifications already handle ho jayengi
      console.log("Web notifications handler setup");
    } else {
      // Mobile: Expo notification handlers
      // Foreground notifications
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      // Notification received listener (foreground)
      Notifications.addNotificationReceivedListener(async (notification) => {
        console.log("📨 Notification received:", notification);
        try {
          const audioUrl = (notification.request.content.data as any)?.audioUrl;
          if (audioUrl) {
            await AudioService.playFromUrl(audioUrl);
          }
        } catch (e) {
          console.warn("Audio play on receive failed:", e);
        }
      });

      // Notification tapped listener
      Notifications.addNotificationResponseReceivedListener(async (response) => {
        console.log("👆 Notification tapped:", response);
        try {
          const audioUrl = (response.notification.request.content.data as any)?.audioUrl;
          if (audioUrl) {
            await AudioService.playFromUrl(audioUrl);
          }
        } catch (e) {
          console.warn("Audio play on tap failed:", e);
        }
      });
    }
  }

  // 4️⃣ Get Current Token
  getToken(): string | null {
    return this.fcmToken;
  }

  // 5️⃣ Unregister Token
  async unregisterToken(): Promise<void> {
    if (this.fcmToken) {
      try {
        await axios.post(`${API_BASE}/api/fcm/unregister-token`, {
          token: this.fcmToken,
        });
        this.fcmToken = null;
      } catch (error) {
        console.error("Error unregistering token:", error);
      }
    }
  }
}

export default new FCMService();

