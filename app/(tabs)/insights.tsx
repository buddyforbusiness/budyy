// app/(tabs)/insights.tsx
import { StyleSheet, Text, View } from "react-native";

export default function InsightsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Insights</Text>
      <Text style={styles.subtitle}>Here Budyy will show:</Text>
      <Text style={styles.bullet}>• Monthly spend summary</Text>
      <Text style={styles.bullet}>• Top spending categories</Text>
      <Text style={styles.bullet}>• Detected subscriptions</Text>
      <Text style={styles.bullet}>• Changes vs last month</Text>

      <Text style={styles.placeholder}>
        In Phase 1 this will be simple charts & text powered by your transactions.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 4 },
  bullet: { fontSize: 13, color: "#333", marginBottom: 2 },
  placeholder: { marginTop: 16, fontSize: 12, color: "#777" },
});
