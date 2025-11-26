"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAmount } from "@/lib/utils/transaction";
import { AccountType } from "@/gen/arian/v1/enums_pb";

interface AccountBalancesCardProps {
  userId: string;
}

const getAccountTypeLabel = (type: AccountType): string => {
  switch (type) {
    case AccountType.ACCOUNT_CHEQUING:
      return "Checking";
    case AccountType.ACCOUNT_SAVINGS:
      return "Savings";
    case AccountType.ACCOUNT_CREDIT_CARD:
      return "Credit Card";
    case AccountType.ACCOUNT_INVESTMENT:
      return "Investment";
    case AccountType.ACCOUNT_OTHER:
      return "Other";
    default:
      return "Unknown";
  }
};

const sortAccountsByType = (accounts: any[]) => {
  const typeOrder: Record<AccountType, number> = {
    [AccountType.ACCOUNT_UNSPECIFIED]: 99,
    [AccountType.ACCOUNT_CHEQUING]: 1,
    [AccountType.ACCOUNT_SAVINGS]: 2,
    [AccountType.ACCOUNT_INVESTMENT]: 3,
    [AccountType.ACCOUNT_OTHER]: 4,
    [AccountType.ACCOUNT_CREDIT_CARD]: 5,
  };

  return [...accounts].sort((a, b) => {
    const orderA = typeOrder[a.accountType as AccountType] ?? 99;
    const orderB = typeOrder[b.accountType as AccountType] ?? 99;
    return orderA - orderB;
  });
};

export function AccountBalancesCard({ userId }: AccountBalancesCardProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["account-balances", userId],
    queryFn: () => dashboardApi.getAccountBalances(userId),
  });

  return (
    <div className="rounded-lg bg-card p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">ACCOUNT BALANCES</h3>
      <div className="space-y-3">
        {isLoading ? (
          <>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </>
        ) : data && data.balances.length > 0 ? (
          sortAccountsByType(data.balances).map((account) => {
            const balance = formatAmount(account.currentBalance);
            const isDebt = account.accountType === AccountType.ACCOUNT_CREDIT_CARD;
            const isBorderTop = account.accountType === AccountType.ACCOUNT_CREDIT_CARD;

            return (
              <div
                key={account.id}
                className={`flex items-center justify-between ${isBorderTop ? "border-t pt-3" : ""}`}
              >
                <div>
                  <div className="text-sm font-medium">{account.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {getAccountTypeLabel(account.accountType)}
                  </div>
                </div>
                <div
                  className={`text-sm font-semibold tabular-nums ${isDebt ? "text-red-600" : ""}`}
                >
                  {isDebt && balance !== 0 ? "-" : ""}$
                  {Math.abs(balance).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
            No accounts found
          </div>
        )}
      </div>
    </div>
  );
}
