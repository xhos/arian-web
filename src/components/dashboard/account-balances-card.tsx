"use client";

import { useQuery } from "@tanstack/react-query";
import { accountsApi } from "@/lib/api/accounts";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, VStack, HStack, Caption } from "@/components/lib";
import { formatAmount } from "@/lib/utils/transaction";
import { AccountType } from "@/gen/arian/v1/enums_pb";
import type { Account } from "@/gen/arian/v1/account_pb";

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

const sortAccountsByType = (accounts: Account[]) => {
  const typeOrder: Record<AccountType, number> = {
    [AccountType.ACCOUNT_UNSPECIFIED]: 99,
    [AccountType.ACCOUNT_CHEQUING]: 1,
    [AccountType.ACCOUNT_SAVINGS]: 2,
    [AccountType.ACCOUNT_INVESTMENT]: 3,
    [AccountType.ACCOUNT_OTHER]: 4,
    [AccountType.ACCOUNT_CREDIT_CARD]: 5,
  };

  return [...accounts].sort((a, b) => {
    const orderA = typeOrder[a.type as AccountType] ?? 99;
    const orderB = typeOrder[b.type as AccountType] ?? 99;
    return orderA - orderB;
  });
};

export function AccountBalancesCard({ userId }: AccountBalancesCardProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["accounts", userId],
    queryFn: () => accountsApi.list(userId),
  });

  return (
    <Card padding="md" title="account balances">
      <VStack spacing="sm">
        {isLoading ? (
          <>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </>
        ) : data && data.length > 0 ? (
          sortAccountsByType(data).map((account, index) => {
            const balance = account.balance ? formatAmount(account.balance) : 0;
            const isDebt = account.type === AccountType.ACCOUNT_CREDIT_CARD;

            return (
              <HStack
                key={account.id}
                spacing="md"
                justify="between"
                className={index > 0 ? "border-t pt-3" : ""}
              >
                <VStack spacing="xs" align="start">
                  <div className="text-sm font-medium">{account.alias || account.name}</div>
                  <Caption className="text-muted-foreground">{getAccountTypeLabel(account.type)}</Caption>
                </VStack>
                <div className="text-sm font-semibold tabular-nums">
                  {isDebt && balance !== 0 ? "-" : ""}$
                  {Math.abs(balance).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </HStack>
            );
          })
        ) : (
          <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
            No accounts found
          </div>
        )}
      </VStack>
    </Card>
  );
}
