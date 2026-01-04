// engines/money-profile.ts
import type { UserOnboarding } from "@/api/onboarding";

export type MoneyStability = "stable" | "okay" | "stretched" | "at_risk";

export type MoneyProfile = {
  stability: MoneyStability;
  stabilityLabel: string;
  stabilityDescription: string;
  estimatedIncome: number | null;
  estimatedRent: number | null;
  rentShare: number | null; // 0–1
  pressures: string[];
  mainGoal?: {
    key: string;
    label: string;
    timelineLabel?: string;
    amount?: number | null;
    suggestedMonthly?: number | null;
  };
  tone?: string;
  detailLevel?: string;
};

function mapIncomeRange(code: string | null): number | null {
  switch (code) {
    case "<500":
      return 400;
    case "500_1000":
      return 750;
    case "1000_1800":
      return 1400;
    case "1800_2500":
      return 2150;
    case "2500_plus":
      return 2800;
    default:
      return null;
  }
}

function parseAmountString(raw: string | null): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[£,\s]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function deriveStability(o: UserOnboarding): {
  stability: MoneyStability;
  label: string;
  description: string;
} {
  const feel = o.q2_feel_money ?? "";
  const runOut = o.q12_run_out ?? "";
  const save = o.q13_save_pattern ?? "";

  // basic rule-based classifier
  if (
    (feel.startsWith("5_") || feel.startsWith("4_")) &&
    (runOut === "never" || runOut === "sometimes") &&
    (save === "yes_fixed" || save === "yes_random")
  ) {
    return {
      stability: "stable",
      label: "Stable",
      description: "You’re generally on top of things, with some room to optimise.",
    };
  }

  if (
    feel.includes("neutral") ||
    feel.startsWith("3_") ||
    runOut === "sometimes"
  ) {
    return {
      stability: "okay",
      label: "Okay-ish",
      description: "Things mostly work, but some months feel tighter than others.",
    };
  }

  if (runOut === "often" || runOut === "almost_every_month") {
    return {
      stability: "stretched",
      label: "Stretched",
      description:
        "Cash flow feels tight and money often runs out before the month ends.",
    };
  }

  if (feel.startsWith("1_") || feel.startsWith("2_")) {
    return {
      stability: "at_risk",
      label: "At risk",
      description:
        "Money feels very stressful right now. Budyy will focus on stabilising first.",
    };
  }

  return {
    stability: "okay",
    label: "Okay-ish",
    description: "We’ll get a clearer picture once your accounts are connected.",
  };
}

function mapGoalLabel(key: string | null): string | undefined {
  if (!key) return undefined;
  const map: Record<string, string> = {
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
  return map[key] ?? key;
}

function mapTimelineLabel(code: string | null): string | undefined {
  if (!code) return undefined;
  const map: Record<string, string> = {
    "3_months": "3 months",
    "6_months": "6 months",
    "12_months": "12 months",
    "1_3_years": "1–3 years",
    "not_sure": "Not sure yet",
  };
  return map[code] ?? code;
}

function deriveMainGoal(o: UserOnboarding, income: number | null) {
  const key = o.q8_top_goal;
  const label = mapGoalLabel(key);
  const timelineLabel = mapTimelineLabel(o.q9_goal_timeline);
  const amount = parseAmountString(o.q10_goal_amount);

  if (!label && !amount) return undefined;

  let suggestedMonthly: number | null = null;

  if (amount && o.q9_goal_timeline && income) {
    let months = 12;
    if (o.q9_goal_timeline === "3_months") months = 3;
    else if (o.q9_goal_timeline === "6_months") months = 6;
    else if (o.q9_goal_timeline === "12_months") months = 12;
    else if (o.q9_goal_timeline === "1_3_years") months = 24;

    suggestedMonthly = amount / months;

    // keep it in a realistic band: not more than ~40% of income
    if (suggestedMonthly > income * 0.4) {
      suggestedMonthly = income * 0.4;
    }
  }

  return {
    key: key ?? "",
    label: label ?? "Main goal",
    timelineLabel,
    amount: amount ?? null,
    suggestedMonthly: suggestedMonthly ? Math.round(suggestedMonthly) : null,
  };
}

function derivePressures(o: UserOnboarding, income: number | null) {
  const pressures: string[] = [];
  const frictions = o.q11_frictions ?? [];

  // from frictions multi-select
  const map: Record<string, string> = {
    high_rent: "High rent",
    unexpected_expenses: "Unexpected expenses",
    sending_home: "Sending money home",
    eating_out: "Eating out",
    subscriptions: "Subscriptions",
    shopping: "Shopping",
    debt: "Debt",
    not_tracking: "Not tracking spending",
  };

  frictions.forEach((f) => {
    if (map[f]) pressures.push(map[f]);
  });

  // from rent % of income if both exist
  const rent = parseAmountString(o.q5_rent);
  if (income && rent) {
    const ratio = rent / income;
    if (ratio >= 0.5) pressures.push("Rent is using 50%+ of income");
    else if (ratio >= 0.4) pressures.push("Rent is using ~40–50% of income");
  }

  // from sending home
  if (o.q6_send_home && o.q6_send_home.startsWith("yes")) {
    if (!pressures.includes("Sending money home")) {
      pressures.push("Sending money home");
    }
  }

  return pressures;
}

export function buildMoneyProfile(o: UserOnboarding | null): MoneyProfile | null {
  if (!o) return null;

  const estimatedIncome = mapIncomeRange(o.q4_income_range);
  const estimatedRent = parseAmountString(o.q5_rent);
  const rentShare =
    estimatedIncome && estimatedRent ? estimatedRent / estimatedIncome : null;

  const stability = deriveStability(o);
  const mainGoal = deriveMainGoal(o, estimatedIncome);
  const pressures = derivePressures(o, estimatedIncome);

  return {
    stability: stability.stability,
    stabilityLabel: stability.label,
    stabilityDescription: stability.description,
    estimatedIncome,
    estimatedRent,
    rentShare,
    pressures,
    mainGoal,
    tone: o.q15_tone ?? undefined,
    detailLevel: o.q16_depth ?? undefined,
  };
}
