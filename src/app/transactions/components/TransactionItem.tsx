"use client";

import type { Transaction } from "@/gen/arian/v1/transaction_pb";
import { Badge } from "@/components/ui/badge";
import {
  formatAmount,
  formatCurrency,
  formatTime,
  getDirectionDisplay,
  getCategorizationStatus,
} from "@/lib/utils/transaction";
import { getCategoryDisplayName } from "@/lib/utils/category";
import { Amount } from "@/components/data-display";
import { MetaText, MonoText } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TransactionDetails } from "./TransactionDetails";

interface TransactionItemProps {
  transaction: Transaction;
  isExpanded: boolean;
  isSelected: boolean;
  onToggleExpansion: (id: bigint) => void;
  onSelect: (id: bigint, index: number, event: React.MouseEvent) => void;
  globalIndex: number;
  getAccountDisplayName: (accountId: bigint, accountName?: string) => string;
}

const getCategoryTextColor = (hexColor: string) => {
  const rgb = parseInt(hexColor.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 128 ? '#000000' : '#ffffff';
};

export function TransactionItem({
  transaction,
  isExpanded,
  isSelected,
  onToggleExpansion,
  onSelect,
  globalIndex,
  getAccountDisplayName,
}: TransactionItemProps) {
  const handleClick = (event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey) {
      event.preventDefault();
      onSelect(transaction.id, globalIndex, event);
    } else {
      onToggleExpansion(transaction.id);
    }
  };

  const directionInfo = getDirectionDisplay(transaction.direction);
  const categoryInfo = getCategorizationStatus(transaction);
  const amount = formatAmount(transaction.txAmount);
  const formattedAmount = formatCurrency(amount, transaction.txAmount?.currencyCode);

  return (
    <div className="relative transition-[padding-bottom] duration-500 ease-in-out" style={{ paddingBottom: isExpanded ? "0.75rem" : "2rem" }}>
      <div
        onClick={handleClick}
        className={cn(
          "relative z-10 p-4 border rounded-xl bg-card hover:bg-muted transition-all duration-150 cursor-pointer select-none",
          isSelected && "ring-1 ring-primary"
        )}
        style={{ marginBottom: "2.5rem" }}
      >
        <div className="flex justify-between gap-6">
          <div className="flex-1 min-w-0 space-y-2">
            <h4 className="text-sm font-semibold truncate leading-tight">
              {transaction.description || transaction.merchant || "Unknown transaction"}
            </h4>
            <div className="flex items-center gap-2 flex-wrap">
              <MetaText className="text-xs truncate">
                {(transaction.merchant && transaction.description !== transaction.merchant)
                  ? transaction.merchant
                  : "null"}
              </MetaText>
              <MetaText className="text-xs">•</MetaText>
              {transaction.category?.slug ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="text-xs border-0 cursor-help"
                        style={{
                          backgroundColor: transaction.category.color,
                          color: getCategoryTextColor(transaction.category.color),
                        }}
                      >
                        {getCategoryDisplayName(transaction.category.slug)}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{categoryInfo.text}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <MetaText className="text-xs">null</MetaText>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <Amount
              variant={directionInfo.label === "in" ? "positive" : "negative"}
              value={`${directionInfo.symbol}${formattedAmount.replace("-", "")}`}
              className="text-lg"
            />
            <div className="flex flex-col items-end gap-1">
              <MetaText className="text-xs">
                {transaction.accountId
                  ? getAccountDisplayName(transaction.accountId, transaction.accountName)
                  : "null"}
              </MetaText>
              <MonoText className="text-xs text-muted-foreground">{formatTime(transaction.txDate)}</MonoText>
            </div>
          </div>
        </div>
      </div>

      <div
        className="relative z-0 border rounded-xl px-6 bg-muted/20 overflow-hidden grid transition-[grid-template-rows,margin-top] duration-500 ease-in-out"
        style={{
          gridTemplateRows: isExpanded ? "1fr" : "0fr",
          marginTop: isExpanded ? "-6.5rem" : "-4rem",
        }}
      >
        <div className="min-h-0">
          <div
            className="pt-16 transition-transform duration-500 ease-in-out"
            style={{
              transform: isExpanded ? "translateY(0)" : "translateY(-100%)",
            }}
          >
            <TransactionDetails transaction={transaction} />
          </div>
        </div>
      </div>
    </div>
  );
}
