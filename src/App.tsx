import React from "react";
import { Provider } from "react-redux";
import { store } from "../store";
import { SafeAreaView } from "react-native";
import NewReminderScreen from "../screens/NewReminderScreen";
import RemindersListScreen from "../screens/RemindersListScreen";
import { View } from "react-native";

export default function App() {
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
