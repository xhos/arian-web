"use client";

import { useCallback } from "react";
import type { Transaction } from "@/gen/arian/v1/transaction_pb";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  formatAmount,
  formatCurrency,
  formatTime,
  getDirectionDisplay,
  getCategorizationStatus,
} from "@/lib/utils/transaction";

interface TransactionItemProps {
  transaction: Transaction;
  isExpanded: boolean;
  isSelected: boolean;
  onToggleExpansion: (id: bigint) => void;
  onSelect: (id: bigint, index: number, event: React.MouseEvent) => void;
  globalIndex: number;
  getAccountDisplayName: (accountId: bigint, accountName?: string) => string;
  getAccountFullName: (accountId: bigint, accountName?: string) => string;
}

export function TransactionItem({
  transaction,
  isExpanded,
  isSelected,
  onToggleExpansion,
  onSelect,
  globalIndex,
  getAccountDisplayName,
  getAccountFullName,
}: TransactionItemProps) {
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey) {
        event.preventDefault();
        onSelect(transaction.id, globalIndex, event);
      } else {
        onToggleExpansion(transaction.id);
      }
    },
    [transaction.id, globalIndex, onSelect, onToggleExpansion]
  );

  const directionInfo = getDirectionDisplay(transaction.direction);
  const categoryInfo = getCategorizationStatus(transaction);
  const amount = formatAmount(transaction.txAmount);

  return (
    <div>
      <Card
        className={`cursor-pointer relative transition-colors ${
          isSelected
            ? "bg-sky-50 border-sky-300 dark:bg-sky-950 dark:border-sky-700"
            : "hover:bg-muted/30"
        }`}
        onClick={handleClick}
      >
        {isSelected && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500 rounded-l-xl" />
        )}
        <CardContent className="py-4 select-none">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold truncate">
                {transaction.description || transaction.merchant || "Unknown transaction"}
              </h4>
              {transaction.merchant && transaction.description !== transaction.merchant && (
                <div className="text-xs text-muted-foreground mt-1 truncate">
                  {transaction.merchant}
                </div>
              )}
            </div>
            <div className="text-right ml-4">
              <div className={`text-lg font-mono font-semibold ${directionInfo.className}`}>
                {directionInfo.symbol}
                {formatCurrency(amount, transaction.txAmount?.currencyCode).replace("-", "")}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              {transaction.accountId && (
                <span className="text-muted-foreground truncate">
                  {getAccountDisplayName(transaction.accountId, transaction.accountName)}
                </span>
              )}
              {transaction.category?.label && (
                <>
                  {transaction.accountId && <span className="text-muted-foreground">•</span>}
                  <Badge variant="outline">{transaction.category.label}</Badge>
                </>
              )}
              {transaction.categoryId && (
                <>
                  {(transaction.accountId || transaction.category?.label) && (
                    <span className="text-muted-foreground">•</span>
                  )}
                  <Badge variant={categoryInfo.variant}>{categoryInfo.text}</Badge>
                </>
              )}
            </div>
            <div className="font-mono text-muted-foreground">{formatTime(transaction.txDate)}</div>
          </div>
        </CardContent>
      </Card>

      <div
        className={`border rounded-xl px-6 bg-muted/30 relative transition-all duration-200 ease-out overflow-hidden ${
          isExpanded ? "pt-10 pb-4 max-h-[1000px] -mt-6" : "pt-0 pb-0 max-h-0 mt-0"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">
              Transaction Details
            </div>
            <div className="space-y-2.5">
              <div className="flex">
                <span className="text-muted-foreground min-w-[100px]">ID:</span>
                <span className="font-mono">#{transaction.id.toString()}</span>
              </div>
              <div className="flex">
                <span className="text-muted-foreground min-w-[100px]">Account:</span>
                <span>{getAccountFullName(transaction.accountId, transaction.accountName)}</span>
              </div>
              {transaction.merchant && (
                <div className="flex">
                  <span className="text-muted-foreground min-w-[100px]">Merchant:</span>
                  <span>{transaction.merchant}</span>
                  {transaction.merchantManuallySet && (
                    <Badge variant="secondary" className="ml-2">
                      manual
                    </Badge>
                  )}
                </div>
              )}
              {transaction.category?.label && (
                <div className="flex items-center">
                  <span className="text-muted-foreground min-w-[100px]">Category:</span>
                  <span>{transaction.category.label}</span>
                  {transaction.category.slug && (
                    <span className="ml-2 text-xs text-muted-foreground font-mono">
                      ({transaction.category.slug})
                    </span>
                  )}
                </div>
              )}
              {transaction.categoryId && (
                <div className="flex items-center">
                  <span className="text-muted-foreground min-w-[100px]">Category ID:</span>
                  <span className="font-mono">#{transaction.categoryId.toString()}</span>
                  <Badge variant={categoryInfo.variant} className="ml-2">
                    {categoryInfo.text}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">
              Additional Info
            </div>
            <div className="space-y-2.5">
              {transaction.userNotes && (
                <div className="flex">
                  <span className="text-muted-foreground min-w-[120px]">Notes:</span>
                  <span className="flex-1">{transaction.userNotes}</span>
                </div>
              )}
              {transaction.balanceAfter && (
                <div className="flex">
                  <span className="text-muted-foreground min-w-[120px]">Balance After:</span>
                  <span className="font-mono">
                    {formatCurrency(
                      formatAmount(transaction.balanceAfter),
                      transaction.balanceAfter?.currencyCode
                    )}
                  </span>
                </div>
              )}
              {transaction.receiptId && (
                <div className="flex">
                  <span className="text-muted-foreground min-w-[120px]">Receipt ID:</span>
                  <span className="font-mono">#{transaction.receiptId.toString()}</span>
                </div>
              )}
              {transaction.foreignAmount && (
                <div className="flex">
                  <span className="text-muted-foreground min-w-[120px]">Foreign Amount:</span>
                  <span className="font-mono">
                    {formatCurrency(
                      formatAmount(transaction.foreignAmount),
                      transaction.foreignAmount?.currencyCode
                    )}
                  </span>
                </div>
              )}
              {transaction.exchangeRate && (
                <div className="flex">
                  <span className="text-muted-foreground min-w-[120px]">Exchange Rate:</span>
                  <span className="font-mono">{transaction.exchangeRate}</span>
                </div>
              )}
              {transaction.emailId && (
                <div className="flex">
                  <span className="text-muted-foreground min-w-[120px]">Email ID:</span>
                  <span className="font-mono text-xs">{transaction.emailId}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {transaction.suggestions && transaction.suggestions.length > 0 && (
          <div className="mt-6">
            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">
              Suggestions
            </div>
            <div className="flex flex-wrap gap-1.5">
              {transaction.suggestions.map((suggestion, index) => (
                <Badge key={index} variant="outline">
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {(transaction.createdAt?.seconds || transaction.updatedAt?.seconds) && (
          <div className="mt-6 pt-4 border-t text-xs text-muted-foreground">
            <div className="flex justify-between gap-4">
              {transaction.createdAt?.seconds && (
                <span>
                  Created: {new Date(Number(transaction.createdAt.seconds) * 1000).toLocaleString()}
                </span>
              )}
              {transaction.updatedAt?.seconds && (
                <span>
                  Updated: {new Date(Number(transaction.updatedAt.seconds) * 1000).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
