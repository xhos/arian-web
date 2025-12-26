"use client";

import { useQuery } from "@tanstack/react-query";
import { transactionsApi } from "@/lib/api/transactions";
import { Card } from "@/components/lib";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { formatAmount, formatCurrency, formatDate, getDirectionDisplay } from "@/lib/utils/transaction";
import { getCategoryDisplayName } from "@/lib/utils/category";
import { getCategoryTextColor } from "@/lib/color-utils";
import { Muted, HStack, VStack } from "@/components/lib";
import { Badge } from "@/components/ui/badge";
import { useRef, useState } from "react";

interface RecentTransactionsCardProps {
  userId: string;
}

export function RecentTransactionsCard({ userId }: RecentTransactionsCardProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["recent-transactions", userId],
    queryFn: () => transactionsApi.list({ userId, limit: 30 }),
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(true);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const threshold = 40;
    setShowTopFade(scrollTop > threshold);
    setShowBottomFade(scrollHeight > clientHeight && scrollTop < scrollHeight - clientHeight - threshold);
  };

  return (
    <Card
      padding="md"
      className="flex flex-col h-full"
      title="recent transactions"
    >
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !data?.transactions.length ? (
        <div className="text-center py-8">
          <Muted>no transactions yet</Muted>
        </div>
      ) : (
        <div className="relative flex-1 overflow-hidden">
          <div className={`absolute top-0 left-0 right-0 h-16 pointer-events-none bg-gradient-to-b from-card via-transparent to-transparent z-10 transition-opacity duration-200 ${showTopFade ? "opacity-100" : "opacity-0"}`} />
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="overflow-y-auto flex-1 scrollbar-hide"
            style={{ maxHeight: "600px" }}
          >
            <div className="space-y-0">
              {data.transactions.map((transaction, index) => {
              const directionInfo = getDirectionDisplay(transaction.direction);
              const amount = formatAmount(transaction.txAmount);
              const formattedAmount = formatCurrency(amount, transaction.txAmount?.currencyCode);
              const { displayDate } = formatDate(transaction.txDate);

              return (
                <div
                  key={transaction.id.toString()}
                  className={`pb-3 transition-colors hover:bg-accent/5 cursor-pointer ${
                    index > 0 ? "pt-3 border-t border-border" : ""
                  }`}
                >
                  <HStack justify="between" align="start">
                    <VStack spacing="xs" align="start" className="flex-1 min-w-0">
                      <HStack spacing="sm" align="center" className="w-full">
                        <div className="text-sm font-medium truncate">
                          {transaction.description || transaction.merchant || "Unknown transaction"}
                        </div>
                        {transaction.category?.slug && (
                          <Badge
                            variant="outline"
                            className="text-xs border-0 shrink-0"
                            style={{
                              backgroundColor: transaction.category.color,
                              color: getCategoryTextColor(transaction.category.slug),
                            }}
                          >
                            {getCategoryDisplayName(transaction.category.slug)}
                          </Badge>
                        )}
                      </HStack>
                      <Muted size="xs">{displayDate}</Muted>
                    </VStack>
                    <div className={`text-sm font-semibold tabular-nums ml-4 shrink-0 ${
                      directionInfo.label === "in" ? "text-green-700 dark:text-green-400" : ""
                    }`}>
                      {directionInfo.label === "out" ? "-" : ""}$
                      {Math.abs(parseFloat(formattedAmount.replace(/[^0-9.-]/g, ''))).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </HStack>
                </div>
              );
            })}
            <Link
              href="/transactions"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors block text-center pt-2"
            >
              see more
            </Link>
          </div>
          </div>
          <div className={`absolute bottom-0 left-0 right-0 h-16 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-card transition-opacity duration-200 ${showBottomFade ? "opacity-100" : "opacity-0"}`} />
        </div>
      )}
    </Card>
  );
}
