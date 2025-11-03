import React, { useState } from "react";
import { TextInput, TouchableOpacity, Text, Alert, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { parseReminderText } from "../api/geminiApi";
import ReminderStore from "../services/ReminderStore";
import ReminderScheduler from "../services/ReminderScheduler";
import { useDispatch } from "react-redux";
import { updateReminder } from "../store/remindersSlice";

export default function NewReminderScreen() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

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
    const res = await parseReminderText(message);
    if (!res.success) throw new Error(res.error || "Parse failed");

    const reminder = ReminderStore.add(res.reminder);
    await ReminderScheduler.requestPermissions();
    const notificationId = (await ReminderScheduler.schedule(reminder)) ?? undefined;

    const updated = { ...reminder, notificationId };
    ReminderStore.update(updated);
    dispatch(updateReminder(updated));

    if (Platform.OS === "web") {
      window.alert("Reminder scheduled");
    } else {
      Alert.alert("Reminder scheduled");
    }

    setMessage("");
  } catch (err: any) {
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
