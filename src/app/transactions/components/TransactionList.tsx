"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import type { Transaction } from "@/gen/arian/v1/transaction_pb";
import { useTransactionsQuery } from "@/hooks/useTransactionsQuery";
import { useAccounts } from "@/hooks/useAccounts";
import { useMultiSelect } from "@/hooks/useMultiSelect";
import { useCategories } from "@/hooks/useCategories";
import { TransactionItem } from "./TransactionItem";
import { groupTransactionsByDay, formatCurrency } from "@/lib/utils/transaction";
import { LoadingCard, EmptyState, ErrorMessage, Amount } from "@/components/data-display";
import { MetaText } from "@/components/ui/typography";
import { DayHeader } from "./TransactionCard";

interface TransactionListProps {
  accountId?: bigint;
  onSelectionChange?: (selectedTransactions: Transaction[]) => void;
  onEditTransaction?: (transaction: Transaction) => void;
  onDeleteTransaction?: (transaction: Transaction) => void;
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

export function TransactionList({ accountId, onSelectionChange, onEditTransaction, onDeleteTransaction }: TransactionListProps) {
  const {
    transactions,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
  } = useTransactionsQuery({ accountId });

  const { getAccountDisplayName } = useAccounts();
  const { categoryMap } = useCategories();
  const [expandedTransaction, setExpandedTransaction] = useState<bigint | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { isSelected, toggleSelection, clearSelection, hasSelection, toggleItems } = useMultiSelect({
    items: transactions,
    getId: (transaction) => transaction.id,
  });

  const enrichTransaction = useCallback(
    (transaction: Transaction) => {
      if (transaction.categoryId && !transaction.category) {
        const category = categoryMap.get(transaction.categoryId.toString());
        if (category) {
          return { ...transaction, category };
        }
      }
      return transaction;
    },
    [categoryMap]
  );

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

  const selectedTransactions = useMemo(
    () => transactions.filter((transaction) => isSelected(transaction.id)),
    [transactions, isSelected]
  );

  useEffect(() => {
    onSelectionChange?.(selectedTransactions);
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

  if (isLoading) {
    return <LoadingCard message="loading transactions..." />;
  }

  if (error) {
    return <ErrorMessage>{String(error)}</ErrorMessage>;
  }

  const groupedTransactions = groupTransactionsByDay(transactions);

    if (groupedTransactions.length === 0) {
      return (
        <EmptyState
          title="No transactions yet"
          description={
            accountId
              ? "No transactions found for this account"
              : "Connect your accounts to start tracking transactions"
          }
        />
      );
    }

    return (
      <div className="space-y-8">
        {groupedTransactions.map((group, groupIndex) => {
          const currencyCode = group.transactions[0]?.txAmount?.currencyCode;

          return (
            <div key={group.date} className="space-y-4">
              <DayHeader
                selectable={hasSelection}
                onClick={(event) => handleDayHeaderClick(event, group.transactions)}
                title={
                  hasSelection
                    ? "Ctrl+click to select all transactions in this day, Shift+click for range selection"
                    : ""
                }
              >
                <div>
                  <h3 className="text-sm font-semibold tracking-tight">{group.displayDate}</h3>
                  <MetaText className="text-xs mt-0.5">
                    {group.transactions.length} transaction{group.transactions.length !== 1 ? "s" : ""}
                  </MetaText>
                </div>
                <div className="text-right space-y-1">
                  <div className="flex items-center gap-2.5 text-sm">
                    <Amount variant="positive" value={`+${formatCurrency(group.totalIn, currencyCode)}`} />
                    <MetaText className="text-xs">/</MetaText>
                    <Amount variant="negative" value={`-${formatCurrency(group.totalOut, currencyCode)}`} />
                  </div>
                  <div className="text-xs">
                    <MetaText className="mr-1.5">net:</MetaText>
                    <Amount
                      variant={group.netAmount >= 0 ? "positive" : "negative"}
                      value={formatCurrency(group.netAmount, currencyCode)}
                      className="text-xs"
                    />
                  </div>
                </div>
              </DayHeader>

              <div>
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
                      transaction={enrichTransaction(transaction)}
                      isExpanded={isExpanded}
                      isSelected={isTransactionSelected}
                      onToggleExpansion={toggleTransactionExpansion}
                      onSelect={toggleSelection}
                      globalIndex={globalIndex}
                      getAccountDisplayName={getAccountDisplayName}
                      onEdit={onEditTransaction}
                      onDelete={onDeleteTransaction}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        {hasMore && <div ref={sentinelRef} className="h-4" />}

        {isLoadingMore && (
          <div className="py-6 text-center">
            <MetaText>loading more...</MetaText>
          </div>
        )}

        {!hasMore && groupedTransactions.length > 0 && (
          <div className="py-6 text-center border-t">
            <MetaText className="text-xs">all transactions loaded</MetaText>
          </div>
        )}
      </div>
    );
}
