// mock/bank-data.ts
export type MockAccount = {
  id: string;
  name: string;
  bankName: string;
  type: "current" | "savings" | "credit";
  currency: "GBP";
};

export type MockTransaction = {
  id: string;
  accountId: string;
  date: string; // ISO string: "2026-01-02"
  description: string;
  amount: number; // income = +, expense = -
  category:
    | "salary"
    | "rent"
    | "bills"
    | "groceries"
    | "eating_out"
    | "shopping"
    | "transport"
    | "entertainment"
    | "other";
  type: "income" | "expense";
  isFixed: boolean; // fixed = rent/bills, variable = groceries etc.
};

export const mockAccounts: MockAccount[] = [
  {
    id: "acc_1",
    name: "Monzo Current Account",
    bankName: "Monzo",
    type: "current",
    currency: "GBP",
  },
];

export const mockTransactions: MockTransaction[] = [
  // Income
  {
    id: "tx_1",
    accountId: "acc_1",
    date: "2026-01-01",
    description: "Salary Disney",
    amount: 2800,
    category: "salary",
    type: "income",
    isFixed: true,
  },

  // Fixed expenses
  {
    id: "tx_2",
    accountId: "acc_1",
    date: "2026-01-02",
    description: "Rent",
    amount: -1100,
    category: "rent",
    type: "expense",
    isFixed: true,
  },
  {
    id: "tx_3",
    accountId: "acc_1",
    date: "2026-01-03",
    description: "Council tax",
    amount: -150,
    category: "bills",
    type: "expense",
    isFixed: true,
  },
  {
    id: "tx_4",
    accountId: "acc_1",
    date: "2026-01-03",
    description: "Electricity + Gas",
    amount: -120,
    category: "bills",
    type: "expense",
    isFixed: true,
  },
  {
    id: "tx_5",
    accountId: "acc_1",
    date: "2026-01-04",
    description: "Phone bill",
    amount: -40,
    category: "bills",
    type: "expense",
    isFixed: true,
  },

  // Variable spending so far this month
  {
    id: "tx_6",
    accountId: "acc_1",
    date: "2026-01-05",
    description: "Tesco groceries",
    amount: -65,
    category: "groceries",
    type: "expense",
    isFixed: false,
  },
  {
    id: "tx_7",
    accountId: "acc_1",
    date: "2026-01-06",
    description: "Nando's dinner",
    amount: -24,
    category: "eating_out",
    type: "expense",
    isFixed: false,
  },
  {
    id: "tx_8",
    accountId: "acc_1",
    date: "2026-01-06",
    description: "Tube + bus",
    amount: -18,
    category: "transport",
    type: "expense",
    isFixed: false,
  },
  {
    id: "tx_9",
    accountId: "acc_1",
    date: "2026-01-07",
    description: "Zara shopping",
    amount: -80,
    category: "shopping",
    type: "expense",
    isFixed: false,
  },
  {
    id: "tx_10",
    accountId: "acc_1",
    date: "2026-01-08",
    description: "Netflix",
    amount: -10.99,
    category: "entertainment",
    type: "expense",
    isFixed: true, // subscription
  },
];

export type MockMonthSummary = {
  income: number;
  fixedExpenses: number;
  variableExpenses: number;
  safeToSpendToday: number;
};

function isSameMonth(d: Date, ref: Date): boolean {
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

export function getMockSummaryForCurrentMonth(
  today: Date = new Date()
): MockMonthSummary {
  const monthTx = mockTransactions.filter((tx) =>
    isSameMonth(new Date(tx.date), today)
  );

  let income = 0;
  let fixedExpenses = 0;
  let variableExpenses = 0;

  for (const tx of monthTx) {
    if (tx.type === "income") {
      income += tx.amount;
    } else {
      // expenses are negative in data; convert to positive for sums
      const abs = Math.abs(tx.amount);
      if (tx.isFixed) fixedExpenses += abs;
      else variableExpenses += abs;
    }
  }

  // Very rough safe-to-spend: income - fixed - variable spent so far, spread across remaining days
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayOfMonth = today.getDate();

  const discretionaryBudget = Math.max(0, income - fixedExpenses);
  const remainingDiscretionary = Math.max(0, discretionaryBudget - variableExpenses);
  const remainingDays = Math.max(1, daysInMonth - dayOfMonth + 1);

  const safeToSpendToday = remainingDiscretionary / remainingDays;

  return {
    income,
    fixedExpenses,
    variableExpenses,
    safeToSpendToday,
  };
}
