// app/welcome.tsx
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { supabase } from "../src/lib/supabase";

export default function Welcome() {
  const params = useLocalSearchParams<{ fullName?: string; email?: string }>();

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/signup");
  };

  const goToApp = () => {
    router.replace("/(tabs)");
  };

  const displayName =
    params.fullName && String(params.fullName).trim().length > 0
      ? String(params.fullName)
      : "Budyy";

  return (
    <View style={styles.screen}>
      {/* Header / hero */}
      <View style={styles.header}>
        <Text style={styles.appName}>Budyy</Text>
        <Text style={styles.title}>You’re in, {displayName} 🎉</Text>
        <Text style={styles.subtitle}>
          We’ll help you see what’s safe to spend, what’s locked in bills, and what
          can go towards your goals.
        </Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        {params.email ? (
          <Text style={styles.emailText}>Signed in as {params.email}</Text>
        ) : (
          <Text style={styles.emailText}>You’re signed in.</Text>
        )}

        <View style={styles.steps}>
          <Text style={styles.stepsTitle}>What happens next?</Text>
          <Text style={styles.stepItem}>• Home shows your safe-to-spend today</Text>
          <Text style={styles.stepItem}>• Chat lets you ask Budyy money questions</Text>
          <Text style={styles.stepItem}>• Goals & Insights keep you on track</Text>
        </View>

        <Pressable style={styles.primaryButton} onPress={goToApp}>
          <Text style={styles.primaryButtonText}>Open Budyy</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={logout}>
          <Text style={styles.secondaryButtonText}>Log out</Text>
        </Pressable>
      </View>

      <Text style={styles.footerNote}>
        Budyy gives guidance only — not regulated financial advice.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0F172A",
    paddingHorizontal: 18,
    paddingTop: 60,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 26,
  },
  appName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#38BDF8",
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#F9FAFB",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "#9CA3AF",
  },
  card: {
    backgroundColor: "#020617",
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  emailText: {
    fontSize: 13,
    color: "#E5E7EB",
    marginBottom: 10,
  },
  steps: {
    marginTop: 6,
    marginBottom: 16,
  },
  stepsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F9FAFB",
    marginBottom: 4,
  },
  stepItem: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  primaryButton: {
    marginTop: 4,
    backgroundColor: "#38BDF8",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#0B1120",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#1F2937",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#E5E7EB",
    fontSize: 14,
    fontWeight: "600",
  },
  footerNote: {
    marginTop: 18,
    textAlign: "center",
    fontSize: 11,
    color: "#6B7280",
  },
});
