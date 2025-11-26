"use client";

import { useQuery } from "@tanstack/react-query";
import { transactionsApi } from "@/lib/api/transactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatAmount, formatCurrency, getDirectionDisplay } from "@/lib/utils/transaction";
import { getCategoryDisplayName } from "@/lib/utils/category";
import { Amount } from "@/components/data-display";
import { MetaText, MonoText } from "@/components/ui/typography";
import { formatTime } from "@/lib/utils/transaction";
import { Badge } from "@/components/ui/badge";

interface RecentTransactionsCardProps {
  userId: string;
}

const getCategoryTextColor = (hexColor: string) => {
  const rgb = parseInt(hexColor.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 128 ? '#000000' : '#ffffff';
};

export function RecentTransactionsCard({ userId }: RecentTransactionsCardProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["recent-transactions", userId],
    queryFn: () => transactionsApi.list({ userId, limit: 5 }),
  });

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">recent transactions</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/transactions">
            view all
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="flex-1">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !data?.transactions.length ? (
          <div className="text-center py-8">
            <MetaText>no transactions yet</MetaText>
          </div>
        ) : (
          <div className="space-y-3">
            {data.transactions.map((transaction) => {
              const directionInfo = getDirectionDisplay(transaction.direction);
              const amount = formatAmount(transaction.txAmount);
              const formattedAmount = formatCurrency(amount, transaction.txAmount?.currencyCode);

              return (
                <div
                  key={transaction.id.toString()}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {transaction.description || transaction.merchant || "Unknown transaction"}
                      </p>
                      {transaction.category?.slug && (
                        <Badge
                          variant="outline"
                          className="text-xs border-0"
                          style={{
                            backgroundColor: transaction.category.color,
                            color: getCategoryTextColor(transaction.category.color),
                          }}
                        >
                          {getCategoryDisplayName(transaction.category.slug)}
                        </Badge>
                      )}
                    </div>
                    <MonoText className="text-xs text-muted-foreground">
                      {formatTime(transaction.txDate)}
                    </MonoText>
                  </div>
                  <Amount
                    variant={directionInfo.label === "in" ? "positive" : "negative"}
                    value={`${directionInfo.symbol}${formattedAmount.replace("-", "")}`}
                    className="text-sm ml-4"
                  />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
