// app/welcome.tsx
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { supabase } from "../src/lib/supabase";

export default function Welcome() {
  const params = useLocalSearchParams<{ fullName?: string; email?: string }>();

  // whether user has completed onboarding questionnaire
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return;

      const { data } = await supabase
        .from("user_onboarding")
        .select("user_id")
        .eq("user_id", auth.user.id)
        .maybeSingle();

      setHasOnboarded(!!data);
    };

    load();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/signup");
  };

  // button action — decides where to go
  const continueFlow = () => {
    if (hasOnboarded) {
      router.replace("/(tabs)");
    } else {
      router.replace("/onboarding");
    }
  };

  const displayName =
    params.fullName && String(params.fullName).trim().length > 0
      ? String(params.fullName)
      : "Budyy";

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>Budyy</Text>
        <Text style={styles.title}>You’re in, {displayName} 🎉</Text>
        <Text style={styles.subtitle}>
          We’ll help you see what’s safe to spend, what’s locked in bills, and
          what can go towards your goals.
        </Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        {params.email ? (
          <Text style={styles.emailText}>Signed in as {params.email}</Text>
        ) : (
          <Text style={styles.emailText}>You’re signed in.</Text>
        )}

        <View className="steps">
          <Text style={styles.stepsTitle}>What happens next?</Text>
          <Text style={styles.stepItem}>• Answer a few quick questions</Text>
          <Text style={styles.stepItem}>• See where you stand financially</Text>
          <Text style={styles.stepItem}>• Start using Budyy dashboard</Text>
        </View>

        {/* Primary Button */}
        <Pressable style={styles.primaryButton} onPress={continueFlow}>
          <Text style={styles.primaryButtonText}>
            {hasOnboarded ? "Open Budyy" : "Get Started"}
          </Text>
        </Pressable>

        {/* Logout */}
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
