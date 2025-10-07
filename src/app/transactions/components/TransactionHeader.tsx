"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

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
    <header className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <h1 className="text-lg">arian // transactions</h1>
          {selectedCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{selectedCount} selected</span>
              <button onClick={onClearSelection} className="text-xs underline hover:no-underline">
                clear
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onRefresh} size="sm" variant="outline" disabled={isLoading}>
            {isLoading ? "↻" : "⟲"} refresh
          </Button>
          <Button onClick={onAddTransaction} size="sm" disabled={isCreating}>
            {showForm ? "cancel" : "add transaction"}
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>total: {totalCount.toLocaleString()} transactions loaded</span>
      </div>
    </header>
  );
}
