"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAmount } from "@/lib/utils/transaction";
import { Card, VStack, Muted, Caption } from "@/components/lib";

interface DashboardStatsProps {
  userId: string;
}

export function DashboardStats({ userId }: DashboardStatsProps) {
  const { data: netBalance, isLoading: netBalanceLoading } = useQuery({
    queryKey: ["net-balance", userId],
    queryFn: () => dashboardApi.getNetBalance(userId),
  });

  const { data: totalBalance, isLoading: totalBalanceLoading } = useQuery({
    queryKey: ["total-balance", userId],
    queryFn: () => dashboardApi.getTotalBalance(userId),
  });

  const { data: totalDebt, isLoading: totalDebtLoading } = useQuery({
    queryKey: ["total-debt", userId],
    queryFn: () => dashboardApi.getTotalDebt(userId),
  });

  const isLoading = netBalanceLoading || totalBalanceLoading || totalDebtLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  const netWorthValue = netBalance?.netBalance ? formatAmount(netBalance.netBalance) : 0;
  const totalBalanceValue = totalBalance?.totalBalance ? formatAmount(totalBalance.totalBalance) : 0;
  const totalDebtValue = totalDebt?.totalDebt ? formatAmount(totalDebt.totalDebt) : 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <Card padding="md">
        <VStack spacing="sm">
          <Caption>NET WORTH</Caption>
          <div className="text-2xl font-bold tabular-nums">
            ${netWorthValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <Muted size="xs">total assets - debt</Muted>
        </VStack>
      </Card>

      <Card padding="md">
        <VStack spacing="sm">
          <Caption>BALANCE</Caption>
          <div className="text-2xl font-bold tabular-nums">
            ${totalBalanceValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <Muted size="xs">total assets</Muted>
        </VStack>
      </Card>

      <Card padding="md">
        <VStack spacing="sm">
          <Caption>DEBT</Caption>
          <div className="text-2xl font-bold tabular-nums">
            ${totalDebtValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <Muted size="xs" color="destructive">credit cards</Muted>
        </VStack>
      </Card>

      <Card padding="md">
        <VStack spacing="sm">
          <Caption>SAVINGS RATE</Caption>
          <div className="text-2xl font-bold">—</div>
          <Muted size="xs">coming soon</Muted>
        </VStack>
      </Card>

      <Card padding="md">
        <VStack spacing="sm">
          <Caption>BUDGET</Caption>
          <div className="text-2xl font-bold">—</div>
          <Muted size="xs">coming soon</Muted>
        </VStack>
      </Card>
    </div>
  );
}
