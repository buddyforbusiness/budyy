// app/you-are-here.tsx
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, Radius, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { API_BASE_URL } from "../src/config";
import { supabase } from "../src/lib/supabase";

console.log("API_BASE_URL =", API_BASE_URL);

type UserOnboardingRow = {
  user_id: string;
  q1_purpose: string[] | null;
  q2_feel_money: string | null;
  q3_profile: string | null;
  q4_income_range: string | null;
  q5_rent: string | null;
  q6_send_home: string | null;
  q7_goals: string[] | null;
  q8_top_goal: string | null;
  q9_goal_timeline: string | null;
  q10_goal_amount: string | null;
  q11_frictions: string[] | null;
  q12_run_out: string | null;
  q13_save_pattern: string | null;
  q14_help: string[] | null;
  q15_tone: string | null;
  q16_depth: string | null;
};

export default function YouAreHereScreen() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<UserOnboardingRow | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: auth, error: authErr } = await supabase.auth.getUser();
      if (authErr || !auth?.user) {
        setRow(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_onboarding")
        .select("*")
        .eq("user_id", auth.user.id)
        .maybeSingle();

      if (error) {
        console.log("you-are-here fetch error", error);
        setRow(null);
      } else {
        setRow(data as UserOnboardingRow | null);
      }
      setLoading(false);
    };

    load();
  }, []);

  const connectBank = async () => {
  try {
    const fullUrl = `${API_BASE_URL}/truelayer/auth-url`;
    console.log("Hitting:", fullUrl);

    const res = await fetch(fullUrl);
    console.log("Status:", res.status);

    if (!res.ok) throw new Error("Failed to get auth URL");

    const json = await res.json();
    console.log("auth-url JSON:", json);

    const { url } = json;
    if (!url) throw new Error("Missing auth URL");

    await Linking.openURL(url);
  } catch (e) {
    console.log("connectBank error", e);
    Alert.alert(
      "Could not start bank connection",
      String(e) || "Please try again in a moment."
    );
  }
};


  if (loading) {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: theme.backgroundSoft }]}
      >
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>
            Getting your starting point…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // If no onboarding data, send them to onboarding
  if (!row) {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: theme.backgroundSoft }]}
      >
        <View style={styles.center}>
          <Text style={[styles.title, { color: theme.text }]}>
            Let’s get to know you
          </Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            Answer a few quick questions so Budyy can personalise your
            dashboard.
          </Text>
          <Pressable
            style={styles.primaryButton}
            onPress={() => router.replace("/onboarding")}
          >
            <Text style={styles.primaryText}>Start questions</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // === Simple "brain" using answers ===

  const incomeLabel = row.q4_income_range;
  let estimatedIncome: number | null = null;
  switch (incomeLabel) {
    case "<500":
      estimatedIncome = 400;
      break;
    case "500_1000":
      estimatedIncome = 750;
      break;
    case "1000_1800":
      estimatedIncome = 1400;
      break;
    case "1800_2500":
      estimatedIncome = 2150;
      break;
    case "2500_plus":
      estimatedIncome = 2800;
      break;
    default:
      estimatedIncome = null;
  }

  const rentRaw = row.q5_rent ?? "";
  const rentNum = (() => {
    const cleaned = rentRaw.replace(/[£,\s]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  })();

  const rentShare =
    estimatedIncome && rentNum ? Math.round((rentNum / estimatedIncome) * 100) : null;

  const feel = row.q2_feel_money ?? "";
  const runOut = row.q12_run_out ?? "";
  const save = row.q13_save_pattern ?? "";

  let stabilityLabel = "Okay-ish";
  let stabilityDescription =
    "We’ll get a clearer picture once your accounts are connected.";

  if (
    (feel.startsWith("5_") || feel.startsWith("4_")) &&
    (runOut === "never" || runOut === "sometimes") &&
    (save === "yes_fixed" || save === "yes_random")
  ) {
    stabilityLabel = "Stable";
    stabilityDescription =
      "You’re generally on top of things, with some room to optimise.";
  } else if (runOut === "often" || runOut === "almost_every_month") {
    stabilityLabel = "Stretched";
    stabilityDescription =
      "Cash flow feels tight and money often runs out before the month ends.";
  } else if (feel.startsWith("1_") || feel.startsWith("2_")) {
    stabilityLabel = "At risk";
    stabilityDescription =
      "Money feels very stressful right now. Budyy will focus on stabilising first.";
  }

  const topGoalKey = row.q8_top_goal ?? "";
  const goalMap: Record<string, string> = {
    emergency_fund: "Emergency fund",
    visa_renewal: "Visa renewal",
    travel: "Travel",
    pay_off_debt: "Pay off debt",
    house_deposit: "House deposit",
    education: "Education",
    move_city: "Move city",
    investments: "Investments",
    wedding: "Wedding",
    other: "Something custom",
  };
  const topGoalLabel = goalMap[topGoalKey] ?? (topGoalKey || "Main goal");

  const timelineMap: Record<string, string> = {
    "3_months": "3 months",
    "6_months": "6 months",
    "12_months": "12 months",
    "1_3_years": "1–3 years",
    "not_sure": "Not sure yet",
  };
  const timelineLabel =
    row.q9_goal_timeline ? timelineMap[row.q9_goal_timeline] ?? row.q9_goal_timeline : null;

  const goalAmountNum = (() => {
    if (!row.q10_goal_amount) return null;
    const cleaned = row.q10_goal_amount.replace(/[£,\s]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  })();

  let suggestedMonthly: number | null = null;
  if (goalAmountNum && estimatedIncome) {
    let months = 12;
    if (row.q9_goal_timeline === "3_months") months = 3;
    else if (row.q9_goal_timeline === "6_months") months = 6;
    else if (row.q9_goal_timeline === "12_months") months = 12;
    else if (row.q9_goal_timeline === "1_3_years") months = 24;

    suggestedMonthly = goalAmountNum / months;
    if (suggestedMonthly > estimatedIncome * 0.4) {
      suggestedMonthly = estimatedIncome * 0.4;
    }
    suggestedMonthly = Math.round(suggestedMonthly);
  }

  const frictions = row.q11_frictions ?? [];
  const frictionDisplayMap: Record<string, string> = {
    high_rent: "High rent",
    unexpected_expenses: "Unexpected expenses",
    sending_home: "Sending money home",
    eating_out: "Eating out",
    subscriptions: "Subscriptions",
    shopping: "Shopping",
    debt: "Debt",
    not_tracking: "Not tracking",
  };
  const pressures = frictions
    .map((f) => frictionDisplayMap[f] ?? null)
    .filter(Boolean) as string[];

  if (row.q6_send_home?.startsWith("yes") && !pressures.includes("Sending money home")) {
    pressures.push("Sending money home");
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.backgroundSoft }]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.kicker, { color: theme.textMuted }]}>
          Your starting point
        </Text>
        <Text style={[styles.title, { color: theme.text }]}>
          Here’s where you are today 👇
        </Text>

        {/* Stability */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.cardGlass, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.cardLabel, { color: theme.textMuted }]}>
            Money stability
          </Text>
          <Text style={[styles.chip, { color: theme.text }]}>
            {stabilityLabel}
          </Text>
          <Text style={[styles.body, { color: theme.textMuted }]}>
            {stabilityDescription}
          </Text>
        </View>

        {/* Main goal */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.cardGlass, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.cardLabel, { color: theme.textMuted }]}>
            Main goal
          </Text>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {topGoalLabel}
          </Text>
          {timelineLabel && (
            <Text style={[styles.body, { color: theme.textMuted }]}>
              Target timeline: {timelineLabel}
            </Text>
          )}
          {goalAmountNum && (
            <Text style={[styles.body, { color: theme.textMuted }]}>
              Goal size: ~£{goalAmountNum}
            </Text>
          )}
          {suggestedMonthly && (
            <Text style={[styles.body, { color: theme.textMuted }]}>
              Rough monthly saving: ~£{suggestedMonthly}
            </Text>
          )}
        </View>

        {/* Income / rent */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.cardGlass, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.cardLabel, { color: theme.textMuted }]}>
            Monthly picture (rough)
          </Text>
          {estimatedIncome && (
            <Text style={[styles.body, { color: theme.text }]}>
              Estimated income: ~£{estimatedIncome}
            </Text>
          )}
          {rentNum && (
            <Text style={[styles.body, { color: theme.textMuted }]}>
              Rent: ~£{rentNum}
            </Text>
          )}
          {rentShare != null && (
            <Text style={[styles.body, { color: theme.textMuted }]}>
              Rent uses about {rentShare}% of your income.
            </Text>
          )}
          {!estimatedIncome && (
            <Text style={[styles.body, { color: theme.textMuted }]}>
              Once you add your income range, Budyy will show more here.
            </Text>
          )}
        </View>

        {/* Pressures */}
        {pressures.length > 0 && (
          <View
            style={[
              styles.card,
              { backgroundColor: theme.cardGlass, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.cardLabel, { color: theme.textMuted }]}>
              What’s putting pressure on your money
            </Text>
            <View style={styles.chipRow}>
              {pressures.map((p) => (
                <View key={p} style={styles.chipPill}>
                  <Text style={styles.chipPillText}>{p}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer / CTA */}
        <View style={styles.footerCard}>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>
            Next, Budyy can use a real bank connection to turn this into live
            safe-to-spend and insights.
          </Text>

          <Pressable style={styles.primaryButton} onPress={connectBank}>
            <Text style={styles.primaryText}>Connect your bank</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.secondaryText}>Skip for now</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 13,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingBottom: 40,
    gap: Spacing.md,
  },
  kicker: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: 6,
  },
  cardLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  body: {
    fontSize: 13,
  },
  chip: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  chipPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(148,163,184,0.18)",
  },
  chipPillText: {
    fontSize: 12,
    color: "#E5E7EB",
  },
  footerCard: {
    marginTop: 4,
    gap: 10,
  },
  footerText: {
    fontSize: 12,
  },
  primaryButton: {
    marginTop: 4,
    backgroundColor: "#38BDF8",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryText: {
    color: "#0B1120",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    marginTop: 8,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4B5563",
  },
  secondaryText: {
    color: "#E5E7EB",
    fontSize: 14,
    fontWeight: "600",
  },
});
