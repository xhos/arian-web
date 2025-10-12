import { TransactionDirection } from "@/gen/arian/v1/enums_pb";
import type { Transaction } from "@/gen/arian/v1/transaction_pb";

export interface AmountType {
  currencyCode?: string;
  currency_code?: string;
  units?: string | bigint;
  nanos?: number;
}

export interface TimestampType {
  seconds?: string | bigint;
  nanos?: number;
}

export function formatAmount(amount?: AmountType): number {
  if (!amount?.units) return 0;
  const units = typeof amount.units === "bigint" ? Number(amount.units) : parseFloat(amount.units);
  return units + (amount.nanos || 0) / 1e9;
}

export function formatCurrency(amount: number, currencyCode = "USD"): string {
  const isValidCurrency =
    currencyCode && currencyCode.length === 3 && /^[A-Z]{3}$/.test(currencyCode);
  const finalCurrencyCode = isValidCurrency ? currencyCode : "USD";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: finalCurrencyCode,
    }).format(amount);
  } catch {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }
}

export function formatDate(timestamp?: TimestampType | string) {
  let date: Date;

  if (!timestamp) return { date: "", displayDate: "" };

  if (typeof timestamp === "string") {
    date = new Date(timestamp);
  } else if (timestamp.seconds) {
    const seconds =
      typeof timestamp.seconds === "bigint"
        ? Number(timestamp.seconds)
        : parseInt(timestamp.seconds);
    date = new Date(seconds * 1000);
  } else {
    return { date: "", displayDate: "" };
  }

  if (isNaN(date.getTime())) {
    return { date: "", displayDate: "" };
  }

  const now = new Date();
  const isCurrentYear = date.getFullYear() === now.getFullYear();

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const isCurrentWeek = date >= startOfWeek && date <= endOfWeek;

  let displayOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "long",
    day: "numeric",
  };

  if (!isCurrentYear) {
    displayOptions.year = "numeric";
  }

  if (isCurrentWeek) {
    displayOptions = { weekday: "long" };
  }

  return {
    date: date.toISOString().split("T")[0],
    displayDate: date.toLocaleDateString("en-US", displayOptions),
  };
}

export function formatTime(timestamp?: TimestampType | string): string {
  let date: Date;

  if (typeof timestamp === "string") {
    date = new Date(timestamp);
  } else if (timestamp?.seconds) {
    const seconds =
      typeof timestamp.seconds === "bigint"
        ? Number(timestamp.seconds)
        : parseInt(String(timestamp.seconds));
    date = new Date(seconds * 1000);
  } else {
    return "—";
  }

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function getDirectionDisplay(direction: TransactionDirection) {
  const normalizedDirection =
    typeof direction === "string"
      ? TransactionDirection[direction as keyof typeof TransactionDirection]
      : direction;

  if (normalizedDirection === TransactionDirection.DIRECTION_INCOMING) {
    return { symbol: "+", className: "text-green-600 dark:text-green-500", label: "in" };
  }
  return { symbol: "-", className: "text-red-600 dark:text-red-500", label: "out" };
}

export function getCategorizationStatus(transaction: Transaction) {
  if (!transaction.categoryId) {
    return { text: "none", variant: "outline" as const };
  }
  if (transaction.categoryManuallySet) {
    return { text: "manual", variant: "secondary" as const };
  }
  return { text: "auto", variant: "default" as const };
}

export function getMerchantStatus(transaction: Transaction) {
  if (!transaction.merchant) {
    return { text: "none", variant: "outline" as const };
  }
  if (transaction.merchantManuallySet) {
    return { text: "manual", variant: "secondary" as const };
  }
  return { text: "auto", variant: "default" as const };
}

export interface DailyTransactionGroup {
  date: string;
  displayDate: string;
  transactions: Transaction[];
  totalIn: number;
  totalOut: number;
  netAmount: number;
}

export function groupTransactionsByDay(transactions: Transaction[]): DailyTransactionGroup[] {
  const groups: { [key: string]: DailyTransactionGroup } = {};

  transactions.forEach((transaction) => {
    const { date, displayDate } = formatDate(transaction.txDate);
    if (!date) return;

    if (!groups[date]) {
      groups[date] = {
        date,
        displayDate,
        transactions: [],
        totalIn: 0,
        totalOut: 0,
        netAmount: 0,
      };
    }

    groups[date].transactions.push(transaction);

    const amount = formatAmount(transaction.txAmount);
    const normalizedDirection =
      typeof transaction.direction === "string"
        ? TransactionDirection[transaction.direction as keyof typeof TransactionDirection]
        : transaction.direction;

    if (normalizedDirection === TransactionDirection.DIRECTION_INCOMING) {
      groups[date].totalIn += amount;
    } else {
      groups[date].totalOut += amount;
    }
    groups[date].netAmount = groups[date].totalIn - groups[date].totalOut;
  });

  return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
}
