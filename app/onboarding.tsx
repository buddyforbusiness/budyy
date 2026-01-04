// app/onboarding.tsx
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { supabase } from "../src/lib/supabase";

type Answers = {
  purpose: string[];
  profile?: string;
  feel?: string;
  incomeRange?: string;
  runOut?: string;
  savePattern?: string;
  goals: string[];
  topGoal?: string;
  goalTimeline?: string;
  goalAmount?: string;
  rent?: string;
  sendHome?: string;
  frictions: string[];
  help: string[];
  tone?: string;
  depth?: string;
};

const initialAnswers: Answers = {
  purpose: [],
  profile: undefined,
  feel: undefined,
  incomeRange: undefined,
  runOut: undefined,
  savePattern: undefined,
  goals: [],
  topGoal: undefined,
  goalTimeline: undefined,
  goalAmount: undefined,
  rent: undefined,
  sendHome: undefined,
  frictions: [],
  help: [],
  tone: undefined,
  depth: undefined,
};

export default function Onboarding() {
  const [step, setStep] = useState(0); // 0..4
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [saving, setSaving] = useState(false);

  const totalSteps = 5;

  // --- helpers for chips and inputs ---

  const toggleMulti = (key: keyof Answers, value: string) => {
    const current = (answers[key] as string[]) || [];
    const exists = current.includes(value);
    const next = exists ? current.filter((v) => v !== value) : [...current, value];
    setAnswers((prev) => ({ ...prev, [key]: next }));
  };

  const setSingle = (key: keyof Answers, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const setText = (key: keyof Answers, text: string) => {
    setAnswers((prev) => ({ ...prev, [key]: text }));
  };

  const requireOnStep = (): boolean => {
    // basic validation – not too strict
    if (step === 0) {
      if (answers.purpose.length === 0 || !answers.profile) {
        alert("Please choose at least one reason and how you'd describe yourself.");
        return false;
      }
    }
    if (step === 1) {
      if (!answers.feel || !answers.incomeRange) {
        alert("Please tell us how you feel and your income range.");
        return false;
      }
    }
    if (step === 2) {
      if (!answers.topGoal) {
        alert("Please choose one main goal.");
        return false;
      }
    }
    // steps 3 & 4 are mostly optional
    return true;
  };

  const handleNext = async () => {
    if (!requireOnStep()) return;

    const isLast = step === totalSteps - 1;
    if (!isLast) {
      setStep((prev) => prev + 1);
      return;
    }

    // Last step → save to Supabase
    setSaving(true);
    try {
      const { data, error: userErr } = await supabase.auth.getUser();
      if (userErr || !data.user) {
        alert("Session expired. Please log in again.");
        router.replace("/login");
        return;
      }

      const user = data.user;

      const payload = {
        user_id: user.id,
        q1_purpose: answers.purpose.length ? answers.purpose : null,
        q2_feel_money: answers.feel ?? null,
        q3_profile: answers.profile ?? null,
        q4_income_range: answers.incomeRange ?? null,
        q5_rent: answers.rent ?? null,
        q6_send_home: answers.sendHome ?? null,
        q7_goals: answers.goals.length ? answers.goals : null,
        q8_top_goal: answers.topGoal ?? null,
        q9_goal_timeline: answers.goalTimeline ?? null,
        q10_goal_amount: answers.goalAmount ?? null,
        q11_frictions: answers.frictions.length ? answers.frictions : null,
        q12_run_out: answers.runOut ?? null,
        q13_save_pattern: answers.savePattern ?? null,
        q14_help: answers.help.length ? answers.help : null,
        q15_tone: answers.tone ?? null,
        q16_depth: answers.depth ?? null,
      };

      const { error: upsertErr } = await supabase
        .from("user_onboarding")
        .upsert(payload, { onConflict: "user_id" });

      if (upsertErr) {
        console.log("onboarding upsert error", upsertErr);
        alert("Could not save your answers. Please try again.");
        return;
      }

      // After onboarding, go to a "You are here" or back to welcome for now
      router.replace("/you-are-here");
    } catch (e) {
      console.log("onboarding error", e);
      alert("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (step === 0 || saving) return;
    setStep((prev) => prev - 1);
  };

  // --- UI building blocks ---

  const ChipRow = ({
    options,
    selected,
    onSelect,
    multi,
  }: {
    options: { value: string; label: string }[];
    selected: string | string[] | undefined;
    onSelect: (value: string) => void;
    multi?: boolean;
  }) => {
    const selectedValues = (Array.isArray(selected) ? selected : [selected].filter(Boolean)) as string[];
    return (
      <View style={styles.chipRow}>
        {options.map((opt) => {
          const isSelected = selectedValues.includes(opt.value);
          return (
            <Pressable
              key={opt.value}
              onPress={() => onSelect(opt.value)}
              style={({ pressed }) => [
                styles.chip,
                isSelected && styles.chipSelected,
                pressed && styles.chipPressed,
              ]}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  };

  const Section = ({
    title,
    subtitle,
    children,
    optional,
  }: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    optional?: boolean;
  }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {optional && <Text style={styles.optionalTag}>Optional</Text>}
      </View>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );

  // --- Step content ---

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <Section
              title="What brings you to Budyy?"
              subtitle="Pick one or more things you’d like help with."
            >
              <ChipRow
                multi
                options={[
                  { value: "stop_running_out", label: "Stop running out of money" },
                  { value: "build_savings", label: "Build savings" },
                  { value: "manage_rent_bills", label: "Manage rent & bills" },
                  { value: "understand_spending", label: "Understand spending" },
                  { value: "plan_big_goals", label: "Plan big goals" },
                  { value: "exploring", label: "Just exploring" },
                ]}
                selected={answers.purpose}
                onSelect={(value) => toggleMulti("purpose", value)}
              />
            </Section>

            <Section title="What best describes you?">
              <ChipRow
                options={[
                  { value: "intl_student", label: "International student" },
                  { value: "uk_student", label: "Student (UK)" },
                  { value: "working_professional", label: "Working professional" },
                  { value: "self_employed", label: "Self-employed" },
                  { value: "other", label: "Other" },
                ]}
                selected={answers.profile}
                onSelect={(value) => setSingle("profile", value)}
              />
            </Section>
          </>
        );

      case 1:
        return (
          <>
            <Section title="How do you feel about money right now?">
              <ChipRow
                options={[
                  { value: "1_very_stressed", label: "Very stressed" },
                  { value: "2_stressed", label: "Quite stressed" },
                  { value: "3_neutral", label: "In-between" },
                  { value: "4_confident", label: "Mostly confident" },
                  { value: "5_very_confident", label: "Very confident" },
                ]}
                selected={answers.feel}
                onSelect={(value) => setSingle("feel", value)}
              />
            </Section>

            <Section title="Roughly how much do you receive per month?">
              <ChipRow
                options={[
                  { value: "<500", label: "< £500" },
                  { value: "500_1000", label: "£500–£1,000" },
                  { value: "1000_1800", label: "£1,000–£1,800" },
                  { value: "1800_2500", label: "£1,800–£2,500" },
                  { value: "2500_plus", label: "£2,500+" },
                ]}
                selected={answers.incomeRange}
                onSelect={(value) => setSingle("incomeRange", value)}
              />
            </Section>

            <Section title="Do you run out of money before month-end?">
              <ChipRow
                options={[
                  { value: "never", label: "Never" },
                  { value: "sometimes", label: "Sometimes" },
                  { value: "often", label: "Often" },
                  { value: "almost_every_month", label: "Almost every month" },
                ]}
                selected={answers.runOut}
                onSelect={(value) => setSingle("runOut", value)}
              />
            </Section>

            <Section title="Do you currently save monthly?">
              <ChipRow
                options={[
                  { value: "yes_fixed", label: "Yes – fixed amount" },
                  { value: "yes_random", label: "Yes – random amount" },
                  { value: "no", label: "No" },
                ]}
                selected={answers.savePattern}
                onSelect={(value) => setSingle("savePattern", value)}
              />
            </Section>
          </>
        );

      case 2:
        return (
          <>
            <Section
              title="What are your top financial goals right now?"
              subtitle="Choose anything that matters."
              optional
            >
              <ChipRow
                multi
                options={[
                  { value: "emergency_fund", label: "Emergency fund" },
                  { value: "visa_renewal", label: "Visa renewal" },
                  { value: "travel", label: "Travel" },
                  { value: "pay_off_debt", label: "Pay off debt" },
                  { value: "house_deposit", label: "House deposit" },
                  { value: "education", label: "Education" },
                  { value: "move_city", label: "Move city" },
                  { value: "investments", label: "Investments" },
                  { value: "wedding", label: "Wedding" },
                  { value: "other", label: "Other" },
                ]}
                selected={answers.goals}
                onSelect={(value) => toggleMulti("goals", value)}
              />
            </Section>

            <Section title="Which one goal matters most right now?">
              <ChipRow
                options={[
                  { value: "emergency_fund", label: "Emergency fund" },
                  { value: "visa_renewal", label: "Visa renewal" },
                  { value: "travel", label: "Travel" },
                  { value: "pay_off_debt", label: "Pay off debt" },
                  { value: "house_deposit", label: "House deposit" },
                  { value: "education", label: "Education" },
                  { value: "move_city", label: "Move city" },
                  { value: "investments", label: "Investments" },
                  { value: "wedding", label: "Wedding" },
                  { value: "other", label: "Other" },
                ]}
                selected={answers.topGoal}
                onSelect={(value) => setSingle("topGoal", value)}
              />
            </Section>

            <Section title="When do you want to achieve this goal?">
              <ChipRow
                options={[
                  { value: "3_months", label: "3 months" },
                  { value: "6_months", label: "6 months" },
                  { value: "12_months", label: "12 months" },
                  { value: "1_3_years", label: "1–3 years" },
                  { value: "not_sure", label: "Not sure" },
                ]}
                selected={answers.goalTimeline}
                onSelect={(value) => setSingle("goalTimeline", value)}
              />
            </Section>
          </>
        );

      case 3:
        return (
          <>
            <Section
              title="How much is your rent per month?"
              subtitle="Rough number is fine."
              optional
            >
              <TextInput
                style={styles.input}
                placeholder="e.g. 900"
                keyboardType="number-pad"
                value={answers.rent ?? ""}
                onChangeText={(t) => setText("rent", t)}
              />
            </Section>

            <Section
              title="Do you send money back home?"
              optional
            >
              <ChipRow
                options={[
                  { value: "no", label: "No" },
                  { value: "yes_monthly", label: "Yes – monthly" },
                  { value: "yes_occasionally", label: "Yes – occasionally" },
                  { value: "yes_rarely", label: "Yes – rarely" },
                ]}
                selected={answers.sendHome}
                onSelect={(value) => setSingle("sendHome", value)}
              />
            </Section>

            <Section
              title="What makes managing money harder for you?"
              optional
            >
              <ChipRow
                multi
                options={[
                  { value: "high_rent", label: "High rent" },
                  { value: "unexpected_expenses", label: "Unexpected expenses" },
                  { value: "sending_home", label: "Sending money home" },
                  { value: "eating_out", label: "Eating out" },
                  { value: "subscriptions", label: "Subscriptions" },
                  { value: "shopping", label: "Shopping" },
                  { value: "debt", label: "Debt" },
                  { value: "not_tracking", label: "Not tracking" },
                ]}
                selected={answers.frictions}
                onSelect={(value) => toggleMulti("frictions", value)}
              />
            </Section>
          </>
        );

      case 4:
        return (
          <>
            <Section
              title="Roughly how much will you need for this main goal?"
              subtitle="If you’re not sure, you can skip this."
              optional
            >
              <TextInput
                style={styles.input}
                placeholder="e.g. 3000 or 'Not sure'"
                keyboardType="default"
                value={answers.goalAmount ?? ""}
                onChangeText={(t) => setText("goalAmount", t)}
              />
            </Section>

            <Section
              title="How would you like Budyy to help?"
              optional
            >
              <ChipRow
                multi
                options={[
                  { value: "daily_safe_spend", label: "Daily safe spend" },
                  { value: "overspend_alerts", label: "Overspend alerts" },
                  { value: "plan_goals", label: "Plan goals" },
                  { value: "spending_breakdown", label: "Spending breakdown" },
                  { value: "auto_budget", label: "Auto budget suggestions" },
                  { value: "motivation", label: "Motivation & nudges" },
                ]}
                selected={answers.help}
                onSelect={(value) => toggleMulti("help", value)}
              />
            </Section>

            <Section
              title="How do you want Budyy to talk to you?"
              optional
            >
              <ChipRow
                options={[
                  { value: "gentle", label: "Gentle" },
                  { value: "honest_practical", label: "Honest & practical" },
                  { value: "fun_roast", label: "Fun / roast mode" },
                ]}
                selected={answers.tone}
                onSelect={(value) => setSingle("tone", value)}
              />
            </Section>

            <Section
              title="Do you want simple tips or deep analysis?"
              optional
            >
              <ChipRow
                options={[
                  { value: "simple", label: "Simple tips" },
                  { value: "mix", label: "Mix of both" },
                  { value: "detailed", label: "Detailed breakdowns" },
                ]}
                selected={answers.depth}
                onSelect={(value) => setSingle("depth", value)}
              />
            </Section>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <View style={styles.outer}>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            Step {step + 1} of {totalSteps}
          </Text>
          <View style={styles.dotsRow}>
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  idx === step && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {renderStep()}

          <View style={styles.bottomRow}>
            <Pressable
              onPress={handleBack}
              disabled={step === 0 || saving}
              style={[
                styles.secondaryButton,
                (step === 0 || saving) && styles.secondaryDisabled,
              ]}
            >
              <Text style={styles.secondaryText}>Back</Text>
            </Pressable>

            <Pressable
              onPress={handleNext}
              disabled={saving}
              style={[
                styles.primaryButton,
                saving && styles.primaryDisabled,
              ]}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.primaryText}>
                  {step === totalSteps - 1 ? "Finish" : "Next"}
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
  },
  dotsRow: {
    flexDirection: "row",
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ddd",
  },
  dotActive: {
    width: 10,
    backgroundColor: "black",
  },
  scrollContent: {
    paddingBottom: 30,
    gap: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  optionalTag: {
    fontSize: 11,
    color: "#999",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "white",
  },
  chipSelected: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  chipPressed: {
    opacity: 0.8,
  },
  chipText: {
    fontSize: 13,
    color: "#333",
  },
  chipTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  input: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  bottomRow: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  secondaryDisabled: {
    opacity: 0.4,
  },
  secondaryText: {
    fontSize: 14,
    color: "#333",
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "black",
    alignItems: "center",
  },
  primaryDisabled: {
    opacity: 0.5,
  },
  primaryText: {
    fontSize: 15,
    fontWeight: "700",
    color: "white",
  },
});
