"use client";

import { useState, useRef, useEffect, useCallback, useMemo, forwardRef, useImperativeHandle } from "react";
import type { Transaction } from "@/gen/arian/v1/transaction_pb";
import { TransactionDirection } from "@/gen/arian/v1/enums_pb";
import { useTransactionsQuery } from "@/hooks/useTransactionsQuery";
import { useAccounts } from "@/hooks/useAccounts";
import { useMultiSelect } from "@/hooks/useMultiSelect";
import { Card, CardContent } from "@/components/ui/card";
import { TransactionItem } from "./TransactionItem";
import { groupTransactionsByDay, formatCurrency } from "@/lib/utils/transaction";

interface TransactionListProps {
  accountId?: bigint;
  onSelectionChange?: (selectedTransactions: Transaction[]) => void;
}

export interface TransactionListRef {
  refresh: () => void;
  clearSelection: () => void;
  hasSelection: boolean;
  selectedCount: number;
  deleteTransactions: (transactionIds: bigint[]) => void;
  createTransaction: (formData: {
    accountId: bigint;
    txDate: Date;
    txAmount: { currencyCode: string; units: string; nanos: number };
    direction: TransactionDirection;
    description?: string;
    merchant?: string;
    userNotes?: string;
    categoryId?: bigint;
  }) => Promise<void>;
  isCreating: boolean;
  isDeleting: boolean;
  createError: Error | null;
  deleteError: Error | null;
  isLoading: boolean;
}

function throttle(func: (...args: unknown[]) => void, limit: number) {
  let inThrottle: boolean;
  return function (this: unknown, ...args: unknown[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export const TransactionList = forwardRef<TransactionListRef, TransactionListProps>(
  ({ accountId, onSelectionChange }, ref) => {
    const {
      transactions,
      isLoading,
      isLoadingMore,
      error,
      hasMore,
      loadMore,
      deleteTransactions,
      isDeleting,
      createTransaction,
      isCreating,
      createError,
      deleteError,
      refetch,
    } = useTransactionsQuery({ accountId });
    const { getAccountDisplayName, getAccountFullName } = useAccounts();
    const [expandedTransaction, setExpandedTransaction] = useState<bigint | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);

    const { isSelected, toggleSelection, clearSelection, hasSelection, selectedCount, toggleItems } =
      useMultiSelect({
        items: transactions,
        getId: (transaction) => transaction.id,
      });

    const toggleTransactionExpansion = useCallback((transactionId: bigint) => {
      setExpandedTransaction((prev) => (prev === transactionId ? null : transactionId));
    }, []);

    const handleDayHeaderClick = useCallback(
      (event: React.MouseEvent, dayTransactions: Transaction[]) => {
        if (!event.ctrlKey && !event.metaKey && !event.shiftKey) {
          return;
        }

        event.preventDefault();

        const firstTransactionId = dayTransactions[0]?.id;
        if (!firstTransactionId) return;

        let firstGlobalIndex = 0;
        for (const transaction of transactions) {
          if (transaction.id === firstTransactionId) break;
          firstGlobalIndex++;
        }

        if (event.shiftKey) {
          toggleSelection(
            dayTransactions[dayTransactions.length - 1].id,
            firstGlobalIndex + dayTransactions.length - 1,
            event
          );
        } else {
          const dayTransactionIds = dayTransactions.map((t) => t.id);
          toggleItems(dayTransactionIds);
        }
      },
      [transactions, toggleSelection, toggleItems]
    );

    const selectedTransactions = useMemo(() => {
      return transactions.filter((transaction) => isSelected(transaction.id));
    }, [transactions, isSelected]);

    useEffect(() => {
      if (onSelectionChange) {
        onSelectionChange(selectedTransactions);
      }
    }, [selectedTransactions, onSelectionChange]);

    useEffect(() => {
      const sentinel = sentinelRef.current;
      if (!sentinel || isLoadingMore) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
            loadMore();
          }
        },
        {
          rootMargin: "400px 0px 400px 0px",
          threshold: 0,
        }
      );

      observerRef.current.observe(sentinel);

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }, [hasMore, isLoadingMore, loadMore]);

    useEffect(() => {
      if (!hasMore || isLoadingMore) return;

      const handleScroll = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;

        if (scrollHeight - scrollTop - clientHeight < 800) {
          loadMore();
        }
      };

      const throttledHandleScroll = throttle(handleScroll, 200);
      window.addEventListener("scroll", throttledHandleScroll, { passive: true });

      return () => {
        window.removeEventListener("scroll", throttledHandleScroll);
      };
    }, [hasMore, isLoadingMore, loadMore]);

    useImperativeHandle(ref, () => ({
      refresh: refetch,
      clearSelection,
      hasSelection,
      selectedCount,
      deleteTransactions: (transactionIds: bigint[]) => {
        deleteTransactions(transactionIds);
      },
      createTransaction: (formData) => {
        return createTransaction(formData);
      },
      isCreating,
      isDeleting,
      createError,
      deleteError,
      isLoading,
    }));

    if (isLoading) {
      return (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-sm text-muted-foreground">loading transactions...</div>
          </CardContent>
        </Card>
      );
    }

    if (error) {
      return (
        <Card className="border-destructive/50">
          <CardContent className="py-4">
            <div className="text-sm font-mono text-destructive">{String(error)}</div>
          </CardContent>
        </Card>
      );
    }

    const groupedTransactions = groupTransactionsByDay(transactions);

    if (groupedTransactions.length === 0) {
      return (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-sm text-muted-foreground mb-2">No transactions yet</div>
            <div className="text-xs text-muted-foreground">
              {accountId
                ? "No transactions found for this account"
                : "Connect your accounts to start tracking transactions"}
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {groupedTransactions.map((group, groupIndex) => {
          return (
            <div key={group.date} className="space-y-3">
              <div
                className={`flex items-center justify-between py-3 px-4 -mx-2 rounded-lg transition-colors select-none ${
                  hasSelection ? "hover:bg-muted/50 cursor-pointer" : ""
                }`}
                onClick={(event) => handleDayHeaderClick(event, group.transactions)}
                title={
                  hasSelection
                    ? "Ctrl+click to select all transactions in this day, Shift+click for range selection"
                    : ""
                }
              >
                <div>
                  <h3 className="text-sm font-semibold">{group.displayDate}</h3>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {group.transactions.length} transaction
                    {group.transactions.length !== 1 ? "s" : ""}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-500">
                      +{formatCurrency(group.totalIn, group.transactions[0]?.txAmount?.currencyCode)}
                    </span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-red-600 dark:text-red-500">
                      -{formatCurrency(group.totalOut, group.transactions[0]?.txAmount?.currencyCode)}
                    </span>
                  </div>
                  <div
                    className={`text-xs font-mono mt-1 ${
                      group.netAmount >= 0
                        ? "text-green-600 dark:text-green-500"
                        : "text-red-600 dark:text-red-500"
                    }`}
                  >
                    net: {formatCurrency(group.netAmount, group.transactions[0]?.txAmount?.currencyCode)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {group.transactions.map((transaction, localIndex) => {
                  const isExpanded = expandedTransaction === transaction.id;
                  const isTransactionSelected = isSelected(transaction.id);

                  let globalIndex = 0;
                  for (let i = 0; i < groupIndex; i++) {
                    globalIndex += groupedTransactions[i].transactions.length;
                  }
                  globalIndex += localIndex;

                  return (
                    <TransactionItem
                      key={transaction.id.toString()}
                      transaction={transaction}
                      isExpanded={isExpanded}
                      isSelected={isTransactionSelected}
                      onToggleExpansion={toggleTransactionExpansion}
                      onSelect={toggleSelection}
                      globalIndex={globalIndex}
                      getAccountDisplayName={getAccountDisplayName}
                      getAccountFullName={getAccountFullName}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        {hasMore && <div ref={sentinelRef} className="h-4" />}

        {isLoadingMore && (
          <div className="p-4 text-center text-sm text-muted-foreground">loading more...</div>
        )}

        {!hasMore && groupedTransactions.length > 0 && (
          <div className="p-4 text-center text-xs text-muted-foreground border-t">
            all transactions loaded
          </div>
        )}
      </div>
    );
  }
);

TransactionList.displayName = "TransactionList";
