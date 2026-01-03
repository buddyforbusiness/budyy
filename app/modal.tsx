// app/modal.tsx
import { Link, router } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function ModalScreen() {
  const handleClose = () => {
    // Close the modal and go back to whatever opened it
    router.back();
  };

  return (
    <ThemedView style={styles.backdrop}>
      <ThemedView style={styles.card}>
        <ThemedText type="title" style={styles.title}>
          Quick Budyy tip 💡
        </ThemedText>

        <ThemedText style={styles.body}>
          Your “safe-to-spend” balance ignores bills and essentials, so you can
          enjoy today without wrecking next week.
        </ThemedText>

        <ThemedText style={styles.bodySub}>
          As you connect accounts and add goals, Budyy will keep recalculating
          this in the background.
        </ThemedText>

        <Pressable style={styles.primaryButton} onPress={handleClose}>
          <ThemedText style={styles.primaryButtonText}>
            Got it, back to Budyy
          </ThemedText>
        </Pressable>

        <Link href="/" dismissTo style={styles.secondaryLink}>
          <ThemedText type="link">Go to home screen</ThemedText>
        </Link>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.7)", // dark overlay
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 24,
    paddingVertical: 22,
    paddingHorizontal: 20,
    backgroundColor: "#020617",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },
  title: {
    marginBottom: 10,
  },
  body: {
    fontSize: 14,
    marginBottom: 6,
  },
  bodySub: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: "#38BDF8",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0B1120",
  },
  secondaryLink: {
    marginTop: 12,
    alignItems: "center",
  },
});
