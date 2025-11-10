import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "../store";
import { SafeAreaView } from "react-native";
import NewReminderScreen from "../screens/NewReminderScreen";
import RemindersListScreen from "../screens/RemindersListScreen";
import { View } from "react-native";
import FCMService from "../services/FCMService";

export default function App() {
  useEffect(() => {
    // Initialize FCM service
    const initFCM = async () => {
      try {
        // Register for push notifications
        await FCMService.registerForPushNotifications();
        
        // Setup notification handlers
        FCMService.setupNotificationHandlers();
        
        console.log("✅ FCM Service initialized");
      } catch (error) {
        console.error("❌ Error initializing FCM:", error);
      }
    };

    initFCM();
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Simple combined view: top for create, bottom for list */}
        <View style={{ flex: 1 }}>
          <NewReminderScreen />
          <RemindersListScreen />
        </View>
      </SafeAreaView>
    </Provider>
  );
}
