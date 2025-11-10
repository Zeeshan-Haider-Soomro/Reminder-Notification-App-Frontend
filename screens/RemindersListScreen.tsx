import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import ReminderStore from "../services/ReminderStore";
import ReminderScheduler from "../services/ReminderScheduler";
import { removeReminder } from "../store/remindersSlice";

export default function RemindersListScreen() {
  const reminders = useSelector((s: RootState) => s.reminders.list);
  const dispatch = useDispatch();

  const handleCancel = async (item: any) => {
    try {
      if (item.notificationId) {
        await ReminderScheduler.cancel(item.notificationId);
      }
      ReminderStore.remove(item.id);
      dispatch(removeReminder(item.id));
      Alert.alert("Cancelled");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not cancel");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Scheduled Reminders</Text>
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        extraData={reminders.length}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.task}>{item.task}</Text>
              <Text style={styles.time}>{new Date(item.notify_at).toLocaleString()}</Text>
            </View>
            <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancel(item)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 20 }}>No reminders</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1, backgroundColor: "#f7f7f7" },
  heading: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  name: { fontWeight: "700", fontSize: 16 },
  task: { marginTop: 4, fontSize: 14, color: "#333" },
  time: { marginTop: 2, fontSize: 12, color: "#888" },
  cancelButton: { backgroundColor: "#ff6b6b", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  cancelText: { color: "#fff", fontWeight: "600" },
});
