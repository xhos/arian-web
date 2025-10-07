"use client";

import { useState, useMemo } from "react";
import type { Transaction } from "@/gen/arian/v1/transaction_pb";
import { TransactionDirection } from "@/gen/arian/v1/enums_pb";
import { Button } from "@/components/ui/button";
import { formatAmount, formatCurrency } from "@/lib/utils/transaction";

interface TransactionSidebarProps {
  transactions: Transaction[];
  onClose: () => void;
  onDeleteSelected: () => Promise<void>;
  onBulkModify: () => void;
}

function SelectionGuide() {
  return (
    <div className="w-80 border rounded-lg bg-background">
      <div className="p-4 border-b">
        <h3 className="text-sm font-medium text-muted-foreground">Multi-Select Guide</h3>
      </div>
      <div className="p-4 space-y-4">
        <div className="space-y-3 text-sm text-muted-foreground">
          <div>
            <div className="font-medium mb-1">Individual Selection:</div>
            <div className="text-xs">
              <kbd className="px-1 py-0.5 text-xs font-mono bg-muted rounded border">Ctrl</kbd> + click
              transaction
            </div>
          </div>
          <div>
            <div className="font-medium mb-1">Range Selection:</div>
            <div className="text-xs">
              <kbd className="px-1 py-0.5 text-xs font-mono bg-muted rounded border">Shift</kbd> + click
              transaction
            </div>
          </div>
          <div>
            <div className="font-medium mb-1">Select Entire Day:</div>
            <div className="text-xs space-y-1">
              <div>
                <kbd className="px-1 py-0.5 text-xs font-mono bg-muted rounded border">Ctrl</kbd> + click
                day header
              </div>
              <div>
                <kbd className="px-1 py-0.5 text-xs font-mono bg-muted rounded border">Shift</kbd> + click
                day header
              </div>
            </div>
          </div>
        </div>
        <div className="pt-3 border-t">
          <div className="text-xs text-muted-foreground">
            Selected transactions will show analysis here including income, expenses, and net totals.
          </div>
        </div>
      </div>
    </div>
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

  const analytics = useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach((transaction) => {
      const amount = formatAmount(transaction.txAmount);
      const normalizedDirection =
        typeof transaction.direction === "string"
          ? TransactionDirection[transaction.direction as keyof typeof TransactionDirection]
          : transaction.direction;

      if (normalizedDirection === TransactionDirection.DIRECTION_INCOMING) {
        totalIncome += amount;
      } else {
        totalExpenses += amount;
      }
    });

    const netAmount = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      netAmount,
      transactionCount: transactions.length,
    };
  }, [transactions]);

  return (
    <div className="w-80 border rounded-lg bg-background">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Selection Analysis</h3>
          <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {analytics.transactionCount} transaction{analytics.transactionCount !== 1 ? "s" : ""} selected
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Income</span>
            <span className="text-sm font-mono text-green-500">
              +{formatCurrency(analytics.totalIncome)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Expenses</span>
            <span className="text-sm font-mono text-red-500">
              -{formatCurrency(analytics.totalExpenses)}
            </span>
          </div>

          <div className="border-t pt-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Net Amount</span>
              <span
                className={`text-sm font-mono font-medium ${
                  analytics.netAmount >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {analytics.netAmount >= 0 ? "+" : ""}
                {formatCurrency(analytics.netAmount)}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground mb-2">Summary</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Average per transaction:</span>
              <span className="font-mono">
                {formatCurrency(analytics.netAmount / analytics.transactionCount)}
              </span>
            </div>
            {analytics.totalIncome > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Income percentage:</span>
                <span className="font-mono text-green-500">
                  {(
                    (analytics.totalIncome / (analytics.totalIncome + analytics.totalExpenses)) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            )}
            {analytics.totalExpenses > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expense percentage:</span>
                <span className="font-mono text-red-500">
                  {(
                    (analytics.totalExpenses / (analytics.totalIncome + analytics.totalExpenses)) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="text-xs text-muted-foreground mb-3">Actions</div>
          <div className="space-y-2">
            <Button onClick={onBulkModify} className="w-full" size="sm">
              Bulk Modify
            </Button>
            <Button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              variant={confirmDelete ? "destructive" : "outline"}
              className={`w-full ${
                !confirmDelete ? "hover:bg-red-50 hover:border-red-300 hover:text-red-700" : ""
              }`}
              size="sm"
            >
              {isDeleting
                ? "Deleting..."
                : confirmDelete
                  ? `Confirm delete ${transactions.length} transaction${transactions.length !== 1 ? "s" : ""}?`
                  : "Delete Selected"}
            </Button>
          </div>
        </div>
      </div>
    </div>
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
