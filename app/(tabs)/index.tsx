// app/(tabs)/index.tsx
import { getMockSummaryForCurrentMonth } from "@/mock/bank-data";
import { useEffect, useRef } from "react";


import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function HomeTab() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  // animation for safe-to-spend card
  const safeOpacity = useRef(new Animated.Value(0)).current;
  const safeScale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(safeOpacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(safeScale, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // mock values for now – later we’ll calculate from transactions
  const summary = getMockSummaryForCurrentMonth();
  const safeToSpend = `£${Math.round(summary.safeToSpendToday)}`;
  const incomeThisMonth = `£${Math.round(summary.income)}`;
  const billsThisMonth = `£${Math.round(summary.fixedExpenses)}`;

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme.backgroundSoft },
      ]}
      edges={["top", "left", "right"]}
    >
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.greeting, { color: theme.text }]}>
                Today
              </Text>
              <Text
                style={[styles.subGreeting, { color: theme.textMuted }]}
              >
                Here’s where your money stands.
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: "rgba(148, 163, 184, 0.18)" }]}>
              <IconSymbol name="paperplane.fill" size={16} withBadge />
              <Text style={[styles.badgeText, { color: theme.text }]}>
                Budyy chat
              </Text>
            </View>
          </View>

          {/* SAFE TO SPEND CARD */}
          <Animated.View
            style={[
              styles.safeCard,
              {
                backgroundColor:
                  colorScheme === "dark"
                    ? Colors.dark.cardGlass
                    : Colors.light.cardGlass,
                borderColor: theme.border,
                shadowColor: "#000",
                opacity: safeOpacity,
                transform: [{ scale: safeScale }],
              },
            ]}
          >
            <View style={styles.safeHeaderRow}>
              <View style={styles.safeLabelRow}>
                <IconSymbol name="house.fill" size={20} withBadge />
                <Text
                  style={[styles.safeLabel, { color: theme.textMuted }]}
                >
                  Safe to spend today
                </Text>
              </View>
              <Text
                style={[
                  styles.safeSubLabel,
                  { color: theme.textMuted },
                ]}
              >
                After bills & basics
              </Text>
            </View>

            <Text style={[styles.safeAmount, { color: theme.text }]}>
              {safeToSpend}
            </Text>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: theme.tint,
                    width: "45%", // placeholder %
                  },
                ]}
              />
            </View>

            <View style={styles.safeFooterRow}>
              <View>
                <Text
                  style={[styles.metaLabel, { color: theme.textMuted }]}
                >
                  Income this month
                </Text>
                <Text
                  style={[styles.metaValue, { color: theme.text }]}
                >
                  {incomeThisMonth}
                </Text>
              </View>
              <View>
                <Text
                  style={[styles.metaLabel, { color: theme.textMuted }]}
                >
                  Bills & commitments
                </Text>
                <Text
                  style={[styles.metaValue, { color: theme.text }]}
                >
                  {billsThisMonth}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* SECONDARY CARDS */}
          <View style={styles.row}>
            <View
              style={[
                styles.smallCard,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text
                style={[styles.smallLabel, { color: theme.textMuted }]}
              >
                Goals
              </Text>
              <Text
                style={[styles.smallValue, { color: theme.text }]}
              >
                2 active
              </Text>
              <Text
                style={[styles.smallHint, { color: theme.textMuted }]}
              >
                You’re on track this month.
              </Text>
            </View>

            <View
              style={[
                styles.smallCard,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text
                style={[styles.smallLabel, { color: theme.textMuted }]}
              >
                Insights
              </Text>
              <Text
                style={[styles.smallValue, { color: theme.text }]}
              >
                3 new
              </Text>
              <Text
                style={[styles.smallHint, { color: theme.textMuted }]}
              >
                Tap Insights tab for details.
              </Text>
            </View>
          </View>

          {/* INFO CARD */}
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={[styles.infoTitle, { color: theme.text }]}>
              What does “safe to spend” mean?
            </Text>
            <Text style={[styles.infoBody, { color: theme.textMuted }]}>
              Budyy separates your essentials (rent, bills, minimum payments)
              from the rest, so this number shows what you can use without
              wrecking next week.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 40,
    gap: Spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "800",
  },
  subGreeting: {
    marginTop: 2,
    fontSize: 13,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  safeCard: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 18 },
    elevation: 10,
    gap: Spacing.sm,
  },
  safeHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  safeLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  safeLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  safeSubLabel: {
    fontSize: 11,
  },
  safeAmount: {
    fontSize: 32,
    fontWeight: "800",
    marginTop: 4,
  },
  progressTrack: {
    marginTop: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(148,163,184,0.35)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  safeFooterRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaLabel: {
    fontSize: 11,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  smallCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: 4,
  },
  smallLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  smallValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  smallHint: {
    fontSize: 11,
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  infoBody: {
    fontSize: 12,
    lineHeight: 17,
  },
});
