// app/(tabs)/insights.tsx
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, Radius, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  getMockSummaryForCurrentMonth,
  mockTransactions,
} from "@/mock/bank-data";

export default function InsightsScreen() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  const today = new Date();
  const summary = getMockSummaryForCurrentMonth(today);

  const totalSpent = summary.fixedExpenses + summary.variableExpenses;
  const discretionaryBudget = Math.max(0, summary.income - summary.fixedExpenses);
  const spentDiscretionary = summary.variableExpenses;
  const discretionaryUsedPct =
    discretionaryBudget > 0
      ? Math.round((spentDiscretionary / discretionaryBudget) * 100)
      : 0;

  // Top spending categories (expenses only)
  type CatAgg = { category: string; total: number };
  const categoryLabels: Record<string, string> = {
    salary: "Income",
    rent: "Rent",
    bills: "Bills",
    groceries: "Groceries",
    eating_out: "Eating out",
    shopping: "Shopping",
    transport: "Transport",
    entertainment: "Entertainment",
    other: "Other",
  };

  const expenseTx = mockTransactions.filter((t) => t.type === "expense");
  const byCat = new Map<string, number>();
  for (const tx of expenseTx) {
    const current = byCat.get(tx.category) ?? 0;
    byCat.set(tx.category, current + Math.abs(tx.amount));
  }

  const topCategories: CatAgg[] = Array.from(byCat.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  const monthName = today.toLocaleString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.backgroundSoft }]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: theme.text }]}>Insights</Text>

        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          A simple view of where your money is going this month ({monthName}).
        </Text>

        {/* OVERVIEW CARD */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.cardGlass, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            This month’s overview
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
              Spent (so far)
            </Text>
            <Text style={[styles.value, { color: theme.text }]}>
              £{Math.round(totalSpent)}
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
              Flexible spending
            </Text>
            <Text style={[styles.value, { color: theme.text }]}>
              £{Math.round(summary.variableExpenses)}
            </Text>
          </View>

          <Text style={[styles.helper, { color: theme.textMuted }]}>
            We treat bills + rent as “non-negotiable” and everything else as
            flexible.
          </Text>
        </View>

        {/* FLEXIBLE BUDGET CARD */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.cardGlass, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Flexible budget check-in
          </Text>

          <Text style={[styles.body, { color: theme.textMuted }]}>
            After rent and bills, this is how your flexible money looks:
          </Text>

          <View style={styles.rowBetween}>
            <Text style={[styles.label, { color: theme.textMuted }]}>
              Flexible pot for month
            </Text>
            <Text style={[styles.value, { color: theme.text }]}>
              £{Math.round(discretionaryBudget)}
            </Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={[styles.label, { color: theme.textMuted }]}>
              Used so far
            </Text>
            <Text style={[styles.value, { color: theme.text }]}>
              £{Math.round(spentDiscretionary)} ({discretionaryUsedPct}%)
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(discretionaryUsedPct, 100)}%` },
              ]}
            />
          </View>

          <Text style={[styles.helper, { color: theme.textMuted }]}>
            If this bar fills up too quickly in the month, we’ll nudge you to
            slow down spending or adjust goals.
          </Text>
        </View>

        {/* TOP CATEGORIES CARD */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.cardGlass, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Where your money actually goes
          </Text>

          {topCategories.length === 0 ? (
            <Text style={[styles.body, { color: theme.textMuted }]}>
              Once we have a few transactions, we’ll show your top spending
              categories here.
            </Text>
          ) : (
            <>
              {topCategories.map((cat) => (
                <View key={cat.category} style={styles.rowBetween}>
                  <Text style={[styles.label, { color: theme.text }]}>
                    {categoryLabels[cat.category] ?? cat.category}
                  </Text>
                  <Text style={[styles.value, { color: theme.text }]}>
                    £{Math.round(cat.total)}
                  </Text>
                </View>
              ))}
              <Text style={[styles.helper, { color: theme.textMuted }]}>
                This is a rough view from your sample data. When real accounts
                are connected, Budyy will use live transactions.
              </Text>
            </>
          )}
        </View>
      </ScrollView>
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
  subtitle: {
    fontSize: 13,
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 13,
  },
  value: {
    fontSize: 14,
    fontWeight: "700",
  },
  helper: {
    fontSize: 11,
    marginTop: 8,
  },
  body: {
    fontSize: 13,
  },
  progressTrack: {
    marginTop: 8,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(148,163,184,0.35)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#38BDF8",
  },
});
