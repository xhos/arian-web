"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAmount } from "@/lib/utils/transaction";
import { Card, VStack, Muted, Caption, Text } from "@/components/lib";

interface DashboardStatsProps {
  userId: string;
}

export function DashboardStats({ userId }: DashboardStatsProps) {
  const { data: financialSummary, isLoading } = useQuery({
    queryKey: ["financial-summary", userId],
    queryFn: () => dashboardApi.getFinancialSummary(userId),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  const netWorthValue = financialSummary?.netBalance ? formatAmount(financialSummary.netBalance) : 0;
  const totalBalanceValue = financialSummary?.totalBalance ? formatAmount(financialSummary.totalBalance) : 0;
  const totalDebtValue = financialSummary?.totalDebt ? formatAmount(financialSummary.totalDebt) : 0;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      <Card padding="md">
        <VStack spacing="sm">
          <div className="font-mono text-xs text-muted-foreground">net worth</div>
          <Text size="lg" weight="bold" className="tabular-nums">
            ${netWorthValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <Muted size="xs">total assets - debt</Muted>
        </VStack>
      </Card>

      <Card padding="md">
        <VStack spacing="sm">
          <div className="font-mono text-xs text-muted-foreground">balance</div>
          <Text size="lg" weight="bold" className="tabular-nums">
            ${totalBalanceValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <Muted size="xs">total assets</Muted>
        </VStack>
      </Card>

      <Card padding="md">
        <VStack spacing="sm">
          <div className="font-mono text-xs text-muted-foreground">debt</div>
          <Text size="lg" weight="bold" className="tabular-nums">
            ${totalDebtValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <Muted size="xs">credit cards</Muted>
        </VStack>
      </Card>

      <Card padding="md">
        <VStack spacing="sm">
          <div className="font-mono text-xs text-muted-foreground">savings rate</div>
          <Text size="lg" weight="bold">—</Text>
          <Muted size="xs">coming soon</Muted>
        </VStack>
      </Card>

      <Card padding="md">
        <VStack spacing="sm">
          <div className="font-mono text-xs text-muted-foreground">budget</div>
          <Text size="lg" weight="bold">—</Text>
          <Muted size="xs">coming soon</Muted>
        </VStack>
      </Card>
    </div>
  );
}
