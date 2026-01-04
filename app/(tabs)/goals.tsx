// app/(tabs)/goals.tsx
import { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, Radius, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getMockSummaryForCurrentMonth } from "@/mock/bank-data";

export default function GoalsScreen() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  // entrance animation
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Use mock bank summary to suggest a starting monthly goal amount
  const summary = getMockSummaryForCurrentMonth();
  const discretionaryBudget = Math.max(
    0,
    summary.income - summary.fixedExpenses
  );
  // super simple rule: start with ~20% of discretionary pot as “safe for goals”
  const suggestedGoalMonthly = Math.round(discretionaryBudget * 0.2);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.backgroundSoft }]}
    >
      <Animated.ScrollView
        style={{ flex: 1, opacity: fade, transform: [{ translateY: slide }] }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: theme.text }]}>
          Build goals that feel realistic 🎯
        </Text>

        <Text style={[styles.sub, { color: theme.textMuted }]}>
          In Phase 1 Budyy helps you plan before touching real money.
        </Text>

        {/* GOAL EXPLANATION CARD */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.cardGlass, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            What you’ll do here:
          </Text>

          <Text style={[styles.item, { color: theme.text }]}>
            • Choose your top priorities
          </Text>
          <Text style={[styles.item, { color: theme.text }]}>
            • Set how much you want to save
          </Text>
          <Text style={[styles.item, { color: theme.text }]}>
            • Pick a target date
          </Text>
          <Text style={[styles.item, { color: theme.text }]}>
            • Budyy will suggest realistic monthly saving
          </Text>

          <Text style={[styles.hint, { color: theme.textMuted }]}>
            Later, Budyy will automatically adjust your plan based on spending
            and bills — like Cleo + Plum combined.
          </Text>
        </View>

        {/* SUGGESTED AMOUNT CARD (mock data) */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.cardGlass, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Rough starting suggestion
          </Text>

          <Text style={[styles.item, { color: theme.textMuted }]}>
            Based on your sample month:
          </Text>

          <View style={styles.rowBetween}>
            <Text style={[styles.label, { color: theme.textMuted }]}>
              Income
            </Text>
            <Text style={[styles.value, { color: theme.text }]}>
              £{Math.round(summary.income)}
            </Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={[styles.label, { color: theme.textMuted }]}>
              Bills & commitments
            </Text>
            <Text style={[styles.value, { color: theme.text }]}>
              £{Math.round(summary.fixedExpenses)}
            </Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={[styles.label, { color: theme.textMuted }]}>
              Flexible pot
            </Text>
            <Text style={[styles.value, { color: theme.text }]}>
              £{Math.round(discretionaryBudget)}
            </Text>
          </View>

          <Text style={[styles.item, { color: theme.textMuted, marginTop: 8 }]}>
            A gentle starting point could be:
          </Text>

          <Text style={[styles.highlight, { color: theme.text }]}>
            £{isNaN(suggestedGoalMonthly) ? 0 : suggestedGoalMonthly} per month
          </Text>

          <Text style={[styles.hint, { color: theme.textMuted }]}>
            That’s about 20% of your flexible money after rent & bills. When
            your real accounts are connected, Budyy will refine this based on
            your actual spending pattern.
          </Text>

          <Pressable style={styles.cta}>
            <Text style={styles.ctaText}>Create your first goal</Text>
          </Pressable>
        </View>

        <Text style={[styles.footer, { color: theme.textMuted }]}>
          Soon: goals will be linked to your questionnaire answers and saved in
          Supabase, so Budyy can keep them in sync across devices.
        </Text>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingBottom: 40,
    gap: Spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
  },
  sub: {
    fontSize: 13,
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  item: {
    fontSize: 13,
  },
  hint: {
    fontSize: 11,
    marginTop: 8,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  label: {
    fontSize: 13,
  },
  value: {
    fontSize: 14,
    fontWeight: "700",
  },
  highlight: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "800",
  },
  cta: {
    marginTop: 14,
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#38BDF8",
  },
  ctaText: {
    color: "#020617",
    fontSize: 14,
    fontWeight: "800",
  },
  footer: {
    marginTop: 10,
    fontSize: 11,
  },
});
