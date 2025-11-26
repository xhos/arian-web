"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAmount } from "@/lib/utils/transaction";

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
      <div className="rounded-lg bg-card p-4 shadow-sm">
        <div className="text-xs text-muted-foreground">NET WORTH</div>
        <div className="mt-1 text-2xl font-bold tabular-nums">
          ${netWorthValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">total assets - debt</div>
      </div>

      <div className="rounded-lg bg-card p-4 shadow-sm">
        <div className="text-xs text-muted-foreground">BALANCE</div>
        <div className="mt-1 text-2xl font-bold tabular-nums">
          ${totalBalanceValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">total assets</div>
      </div>

      <div className="rounded-lg bg-card p-4 shadow-sm">
        <div className="text-xs text-muted-foreground">DEBT</div>
        <div className="mt-1 text-2xl font-bold tabular-nums">
          ${totalDebtValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="mt-1 text-xs text-red-600">credit cards</div>
      </div>

      <div className="rounded-lg bg-card p-4 shadow-sm">
        <div className="text-xs text-muted-foreground">SAVINGS RATE</div>
        <div className="mt-1 text-2xl font-bold">—</div>
        <div className="mt-1 text-xs text-muted-foreground">coming soon</div>
      </div>

      <div className="rounded-lg bg-card p-4 shadow-sm">
        <div className="text-xs text-muted-foreground">BUDGET</div>
        <div className="mt-1 text-2xl font-bold">—</div>
        <div className="mt-1 text-xs text-muted-foreground">coming soon</div>
      </div>
    </div>
  );
}
