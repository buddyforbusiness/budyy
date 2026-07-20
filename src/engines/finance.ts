export type MoneyTransaction = { amount: number; occurredAt: string; category?: string; recurring?: boolean };
export type SafeToSpendInput = { availableBalance: number; transactions: MoneyTransaction[]; upcomingCommitments: number; goalContribution?: number; buffer?: number; periodEnd: string; today?: string };
export type SafeToSpendResult = { availableAfterCommitments: number; safeToSpendToday: number; daysRemaining: number; explanation: string };

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function calculateSafeToSpend(input: SafeToSpendInput): SafeToSpendResult {
  const today = new Date(input.today ?? new Date().toISOString());
  const end = new Date(input.periodEnd);
  if (Number.isNaN(today.valueOf()) || Number.isNaN(end.valueOf())) throw new Error("today and periodEnd must be valid ISO dates");
  const daysRemaining = Math.max(1, Math.ceil((end.valueOf() - today.valueOf()) / 86_400_000) + 1);
  const reserved = Math.max(0, input.upcomingCommitments) + Math.max(0, input.goalContribution ?? 0) + Math.max(0, input.buffer ?? 0);
  const availableAfterCommitments = Math.max(0, input.availableBalance - reserved);
  return { availableAfterCommitments: roundMoney(availableAfterCommitments), safeToSpendToday: roundMoney(availableAfterCommitments / daysRemaining), daysRemaining, explanation: `Balance minus £${roundMoney(reserved).toFixed(2)} reserved, spread across ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}.` };
}

export function totalsByCategory(transactions: MoneyTransaction[]) {
  return transactions.reduce<Record<string, number>>((totals, transaction) => {
    if (transaction.amount >= 0) return totals;
    const category = transaction.category?.trim() || "Uncategorised";
    totals[category] = roundMoney((totals[category] ?? 0) + Math.abs(transaction.amount));
    return totals;
  }, {});
}
