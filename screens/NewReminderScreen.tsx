import React, { useState } from "react";
import { TextInput, TouchableOpacity, Text, Alert, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { parseReminderText } from "../api/geminiApi";
import { createReminder } from "../api/reminderApi";
import ReminderStore from "../services/ReminderStore";
import ReminderScheduler from "../services/ReminderScheduler";
import FCMService from "../services/FCMService";
import { store } from "../store";
import { addReminder } from "../store/remindersSlice";
import { Reminder } from "../types";

export default function NewReminderScreen() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  // const dispatch = useDispatch(); // ❌ REMOVED - not needed

 const handleCreate = async () => {
  if (!message.trim()) {
    if (Platform.OS === "web") {
      window.alert("Enter the message"); // ✅ web ke liye
    } else {
      Alert.alert("Enter the message"); // ✅ mobile ke liye
    }
    return;
  }

  try {
    setLoading(true);
    
    // Step 1: Parse reminder using Gemini
    const res = await parseReminderText(message);
    if (!res.success) throw new Error(res.error || "Parse failed");

    if (Platform.OS === "web") {
      // Web: Local scheduling use karo
      // ReminderStore.add() already Redux store me add kar deta hai, duplicate dispatch nahi karna
      const reminder = ReminderStore.add({
        name: res.reminder.name,
        task: res.reminder.task,
        notify_at: res.reminder.notify_at,
      });
      
      // Web me local notification schedule karo
      await ReminderScheduler.requestPermissions();
      const notificationId = await ReminderScheduler.schedule(reminder);
      if (notificationId) {
        reminder.notificationId = notificationId;
        ReminderStore.update(reminder);
      }
      
      // dispatch(addReminder(reminder)); // ❌ REMOVED - ReminderStore.add() already adds to Redux
      window.alert("Reminder scheduled (local notification)");
    } else {
      // Mobile: Backend se push notifications
      const fcmToken = FCMService.getToken();
      if (!fcmToken) {
        throw new Error("Push token not available. Please wait a moment and try again.");
      }

      // Backend me reminder create karo
      const reminderData = {
        name: res.reminder.name,
        task: res.reminder.task,
        notify_at: res.reminder.notify_at,
        fcmToken: fcmToken,
      };

      const createRes = await createReminder(reminderData);
      if (!createRes.success) throw new Error(createRes.error || "Failed to create reminder");

      // Backend se id use karo (backend se unique id aayegi)
      // Direct Redux me add karo (duplicate check slice me ho jayega)
      const reminder: Reminder = {
        id: createRes.reminder.id, // Backend se id use karo
        name: createRes.reminder.name,
        task: createRes.reminder.task,
        notify_at: createRes.reminder.notify_at,
      };
      
      // Direct add karo (duplicate check slice me ho jayega)
      store.dispatch(addReminder(reminder));
      
      Alert.alert("Reminder scheduled", "You will receive a push notification");
    }

    setMessage("");
  } catch (err: any) {
    console.error("Error creating reminder:", err);
    if (Platform.OS === "web") {
      window.alert(err.message || "Something went wrong");
    } else {
      Alert.alert("Error", err.message || "Something went wrong");
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Quick Reminder</Text>
   <TextInput
  value={message}
  onChangeText={setMessage}
  placeholder='e.g. "Zeeshan: pay rent tomorrow at 8pm"'
  style={styles.input}
  multiline={false} // ❌ Change to false so Enter triggers submit
  returnKeyType="done" // optional: changes the keyboard's Enter button text
  onSubmitEditing={handleCreate} // trigger your submit function
/>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCreate}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? "Scheduling..." : "Create Reminder"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, justifyContent: "center", backgroundColor: "#f7f7f7" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20, textAlign: "center" },
  input: { 
    backgroundColor: "#fff", 
    padding: 14, 
    borderRadius: 10, 
    fontSize: 16, 
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  button: { backgroundColor: "#2e86de", padding: 15, borderRadius: 10, alignItems: "center" },
  buttonDisabled: { backgroundColor: "#a0c4ff" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
