"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PageHeaderWithTitle } from "@/components/ui/layout";
import { MetaText } from "@/components/ui/typography";

interface TransactionHeaderProps {
  selectedCount: number;
  onClearSelection: () => void;
  onRefresh: () => void;
  onAddTransaction: () => void;
  isLoading?: boolean;
  isCreating?: boolean;
  showForm: boolean;
  accountId?: bigint;
}

export function TransactionHeader({
  selectedCount,
  onClearSelection,
  onRefresh,
  onAddTransaction,
  isLoading,
  isCreating,
  showForm,
  accountId,
}: TransactionHeaderProps) {
  const queryClient = useQueryClient();

  const transactionData = queryClient.getQueryData(["transactions", accountId?.toString()]);
  const totalCount = (transactionData as { pages?: Array<{ transactions: unknown[] }> })?.pages
    ? (transactionData as { pages: Array<{ transactions: unknown[] }> }).pages.reduce(
        (total: number, page: { transactions: unknown[] }) => total + page.transactions.length,
        0
      )
    : 0;

  return (
    <PageHeaderWithTitle
      title="transactions"
      stats={
        selectedCount > 0 && (
          <div className="flex items-center gap-3">
            <MetaText className="font-medium">{selectedCount} selected</MetaText>
            <button
              onClick={onClearSelection}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
            >
              clear
            </button>
          </div>
        )
      }
      actions={
        <>
          <Button onClick={onRefresh} size="sm" variant="outline" disabled={isLoading}>
            {isLoading ? "↻" : "⟲"} refresh
          </Button>
          <Button onClick={onAddTransaction} size="sm" disabled={isCreating}>
            {showForm ? "cancel" : "add transaction"}
          </Button>
        </>
      }
      subtitle={`${totalCount.toLocaleString()} transaction${totalCount !== 1 ? "s" : ""} loaded`}
    />
  );
}
