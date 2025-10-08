"use client";

import { useState } from "react";
import type { Transaction } from "@/gen/arian/v1/transaction_pb";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/transaction";
import { Amount } from "@/components/data-display";
import { MetaText, SectionHeader } from "@/components/ui/typography";
import { Stat } from "@/components/ui/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTransactionAnalytics } from "@/hooks/useTransactionAnalytics";

interface TransactionSidebarProps {
  transactions: Transaction[];
  onClose: () => void;
  onDeleteSelected: () => Promise<void>;
  onBulkModify: () => void;
}

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border">{children}</kbd>
);

function SelectionGuide() {
  return (
    <Card className="w-80">
      <CardContent className="p-0">
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold">Multi-Select Guide</h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium mb-1.5">Individual Selection</div>
              <MetaText className="text-xs">
                <Kbd>Ctrl</Kbd> + click transaction
              </MetaText>
            </div>
            <div>
              <div className="text-sm font-medium mb-1.5">Range Selection</div>
              <MetaText className="text-xs">
                <Kbd>Shift</Kbd> + click transaction
              </MetaText>
            </div>
            <div>
              <div className="text-sm font-medium mb-1.5">Select Entire Day</div>
              <div className="space-y-1">
                <MetaText className="text-xs block">
                  <Kbd>Ctrl</Kbd> + click day header
                </MetaText>
                <MetaText className="text-xs block">
                  <Kbd>Shift</Kbd> + click day header
                </MetaText>
              </div>
            </div>
          </div>
          <Separator />
          <MetaText className="text-xs block">
            Selected transactions will show analysis here including income, expenses, and net totals.
          </MetaText>
        </div>
      </CardContent>
    </Card>
  );
}

function TransactionAnalytics({
  transactions,
  onClose,
  onDeleteSelected,
  onBulkModify,
}: TransactionSidebarProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const analytics = useTransactionAnalytics(transactions);

  const handleDeleteClick = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }

    try {
      setIsDeleting(true);
      await onDeleteSelected();
    } catch (error) {
      console.error("Failed to delete transactions:", error);
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <Card className="w-80">
      <CardContent className="p-0">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">Selection Analysis</h3>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>
          <MetaText className="text-xs">
            {analytics.transactionCount} transaction{analytics.transactionCount !== 1 ? "s" : ""} selected
          </MetaText>
        </div>

        <div className="p-4 space-y-5">
          <div className="space-y-2.5">
            <Stat
              label="Income"
              value={<Amount variant="positive" value={`+${formatCurrency(analytics.totalIncome)}`} className="text-sm" />}
            />
            <Stat
              label="Expenses"
              value={<Amount variant="negative" value={`-${formatCurrency(analytics.totalExpenses)}`} className="text-sm" />}
            />
          </div>

          <Separator />

          <Stat
            label="Net Amount"
            value={
              <Amount
                variant={analytics.netAmount >= 0 ? "positive" : "negative"}
                value={`${analytics.netAmount >= 0 ? "+" : ""}${formatCurrency(analytics.netAmount)}`}
                className="text-sm font-semibold"
              />
            }
          />

          <Separator />

          <div>
            <SectionHeader className="mb-2">Summary</SectionHeader>
            <div className="space-y-2 text-xs">
              <Stat
                label="Average per transaction"
                value={
                  <span className="font-mono">
                    {formatCurrency(analytics.netAmount / analytics.transactionCount)}
                  </span>
                }
              />
              {analytics.totalIncome > 0 && (
                <Stat
                  label="Income percentage"
                  value={
                    <Amount
                      variant="positive"
                      value={`${analytics.incomePercentage.toFixed(1)}%`}
                      className="text-xs"
                    />
                  }
                />
              )}
              {analytics.totalExpenses > 0 && (
                <Stat
                  label="Expense percentage"
                  value={
                    <Amount
                      variant="negative"
                      value={`${analytics.expensePercentage.toFixed(1)}%`}
                      className="text-xs"
                    />
                  }
                />
              )}
            </div>
          </div>

          <Separator />

          <div>
            <SectionHeader className="mb-3">Actions</SectionHeader>
            <div className="space-y-2">
              <Button onClick={onBulkModify} className="w-full" size="sm">
                Bulk Modify
              </Button>
              <Button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                variant={confirmDelete ? "destructive" : "outline"}
                className="w-full"
                size="sm"
              >
                {isDeleting
                  ? "Deleting..."
                  : confirmDelete
                    ? `Confirm delete ${transactions.length}?`
                    : "Delete Selected"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TransactionSidebar({ transactions, onClose, onDeleteSelected, onBulkModify }: TransactionSidebarProps) {
  if (transactions.length === 0) {
    return <SelectionGuide />;
  }

  return (
    <TransactionAnalytics
      transactions={transactions}
      onClose={onClose}
      onDeleteSelected={onDeleteSelected}
      onBulkModify={onBulkModify}
    />
  );
}
