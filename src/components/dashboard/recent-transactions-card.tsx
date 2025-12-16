"use client";

import { useQuery } from "@tanstack/react-query";
import { transactionsApi } from "@/lib/api/transactions";
import { Card } from "@/components/lib";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatAmount, formatCurrency, getDirectionDisplay } from "@/lib/utils/transaction";
import { getCategoryDisplayName } from "@/lib/utils/category";
import { getCategoryTextColor } from "@/lib/color-utils";
import { Amount, Muted, HStack, VStack } from "@/components/lib";
import { formatTime } from "@/lib/utils/transaction";
import { Badge } from "@/components/ui/badge";

interface RecentTransactionsCardProps {
  userId: string;
}

export function RecentTransactionsCard({ userId }: RecentTransactionsCardProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["recent-transactions", userId],
    queryFn: () => transactionsApi.list({ userId, limit: 5 }),
  });

  return (
    <Card
      padding="lg"
      className="h-full"
      title="recent transactions"
      action={
        <Button variant="ghost" size="sm" asChild>
          <Link href="/transactions">
            view all
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      }
    >
      <div className="flex-1">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !data?.transactions.length ? (
          <div className="text-center py-8">
            <Muted>no transactions yet</Muted>
          </div>
        ) : (
          <VStack spacing="md">
            {data.transactions.map((transaction) => {
              const directionInfo = getDirectionDisplay(transaction.direction);
              const amount = formatAmount(transaction.txAmount);
              const formattedAmount = formatCurrency(amount, transaction.txAmount?.currencyCode);

              return (
                <Card
                  key={transaction.id.toString()}
                  variant="outline"
                  padding="sm"
                  interactive
                >
                  <HStack justify="between">
                    <VStack spacing="xs" align="start" className="flex-1 min-w-0">
                      <HStack spacing="sm" align="center">
                        <div className="text-sm font-medium truncate">
                          {transaction.description || transaction.merchant || "Unknown transaction"}
                        </div>
                        {transaction.category?.slug && (
                          <Badge
                            variant="outline"
                            className="text-xs border-0"
                            style={{
                              backgroundColor: transaction.category.color,
                              color: getCategoryTextColor(transaction.category.slug),
                            }}
                          >
                            {getCategoryDisplayName(transaction.category.slug)}
                          </Badge>
                        )}
                      </HStack>
                      <Muted size="xs">{formatTime(transaction.txDate)}</Muted>
                    </VStack>
                    <Amount
                      value={parseFloat(formattedAmount.replace(/[^0-9.-]/g, ''))}
                      variant={directionInfo.label === "in" ? "positive" : "negative"}
                      className="text-sm ml-4"
                    />
                  </HStack>
                </Card>
              );
            })}
          </VStack>
        )}
      </div>
    </Card>
  );
}
