"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/layout";
import { PageTitle, MetaText } from "@/components/ui/typography";
import { ActionBar } from "@/components/ui/layout";

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
    <PageHeader>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-6">
          <PageTitle>arian // transactions</PageTitle>
          {selectedCount > 0 && (
            <div className="flex items-center gap-3">
              <MetaText className="font-medium">{selectedCount} selected</MetaText>
              <button
                onClick={onClearSelection}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
              >
                clear
              </button>
            </div>
          )}
        </div>
        <ActionBar>
          <Button onClick={onRefresh} size="sm" variant="outline" disabled={isLoading}>
            {isLoading ? "↻" : "⟲"} refresh
          </Button>
          <Button onClick={onAddTransaction} size="sm" disabled={isCreating}>
            {showForm ? "cancel" : "add transaction"}
          </Button>
        </ActionBar>
      </div>
      <MetaText>
        {totalCount.toLocaleString()} transaction{totalCount !== 1 ? "s" : ""} loaded
      </MetaText>
    </PageHeader>
  );
}
