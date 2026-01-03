// app/(tabs)/chat.tsx
import { StyleSheet, Text, View } from "react-native";

export default function ChatScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Budyy Chat Coach</Text>
      <Text style={styles.subtitle}>Ask Budyy things like:</Text>
      <Text style={styles.example}>• Can I afford a £20 meal tonight?</Text>
      <Text style={styles.example}>• Why does my money finish early?</Text>
      <Text style={styles.example}>• How much can I save this month?</Text>

      <Text style={styles.placeholder}>
        (We’ll add a real chat UI + AI in the next steps.)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 6 },
  example: { fontSize: 13, color: "#333", marginBottom: 2 },
  placeholder: { marginTop: 16, fontSize: 12, color: "#777" },
});
