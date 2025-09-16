"use client";

import { useMemo, useState } from "react";
import type { Transaction } from "@/gen/arian/v1/transaction_pb";
import { TransactionDirection } from "@/gen/arian/v1/enums_pb";
import { Button } from "@/components/ui/button";

interface TransactionAnalyticsProps {
  transactions: Transaction[];
  onClose: () => void;
  onDeleteSelected: () => Promise<void>;
  onBulkModify: () => void;
}

export default function TransactionAnalytics({ transactions, onClose, onDeleteSelected, onBulkModify }: TransactionAnalyticsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteClick = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      // Reset confirmation after 3 seconds
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }

    try {
      setIsDeleting(true);
      await onDeleteSelected();
    } catch (error) {
      console.error('Failed to delete transactions:', error);
      // You could add a proper error notification here instead of alert
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  const analytics = useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;
    
    const formatAmount = (amount?: { currencyCode?: string; currency_code?: string; units?: string; nanos?: number }) => {
      if (!amount?.units) return 0;
      return parseFloat(amount.units) + (amount.nanos || 0) / 1e9;
    };

    transactions.forEach((transaction) => {
      const amount = formatAmount(transaction.txAmount);
      const normalizedDirection = typeof transaction.direction === 'string' 
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

  const formatCurrency = (amount: number, currencyCode = "USD") => {
    const isValidCurrency = currencyCode && currencyCode.length === 3 && /^[A-Z]{3}$/.test(currencyCode);
    const finalCurrencyCode = isValidCurrency ? currencyCode : "USD";
    
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: finalCurrencyCode,
      }).format(amount);
    } catch {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
    }
  };

  return (
    <div className="w-80 tui-border bg-background">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Selection Analysis</h3>
          <button 
            onClick={onClose}
            className="text-xs tui-muted hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="text-xs tui-muted mt-1">
          {analytics.transactionCount} transaction{analytics.transactionCount !== 1 ? 's' : ''} selected
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm tui-muted">Income</span>
            <span className="text-sm font-mono text-green-500">
              +{formatCurrency(analytics.totalIncome)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm tui-muted">Expenses</span>
            <span className="text-sm font-mono text-red-500">
              -{formatCurrency(analytics.totalExpenses)}
            </span>
          </div>
          
          <div className="border-t border-border pt-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Net Amount</span>
              <span className={`text-sm font-mono font-medium ${
                analytics.netAmount >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {analytics.netAmount >= 0 ? '+' : ''}{formatCurrency(analytics.netAmount)}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <div className="text-xs tui-muted mb-2">Summary</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="tui-muted">Average per transaction:</span>
              <span className="font-mono">
                {formatCurrency(analytics.netAmount / analytics.transactionCount)}
              </span>
            </div>
            {analytics.totalIncome > 0 && (
              <div className="flex justify-between">
                <span className="tui-muted">Income percentage:</span>
                <span className="font-mono text-green-500">
                  {((analytics.totalIncome / (analytics.totalIncome + analytics.totalExpenses)) * 100).toFixed(1)}%
                </span>
              </div>
            )}
            {analytics.totalExpenses > 0 && (
              <div className="flex justify-between">
                <span className="tui-muted">Expense percentage:</span>
                <span className="font-mono text-red-500">
                  {((analytics.totalExpenses / (analytics.totalIncome + analytics.totalExpenses)) * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="text-xs tui-muted mb-3">Actions</div>
          <div className="space-y-2">
            <Button
              onClick={onBulkModify}
              className="w-full min-h-8"
              size="sm"
            >
              Bulk Modify
            </Button>
            <Button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              variant={confirmDelete ? "destructive" : "outline"}
              className={`w-full min-h-8 ${
                !confirmDelete ? 'hover:bg-red-50 hover:border-red-300 hover:text-red-700' : ''
              }`}
              size="sm"
            >
              {isDeleting 
                ? 'Deleting...' 
                : confirmDelete 
                  ? `Confirm delete ${transactions.length} transaction${transactions.length !== 1 ? 's' : ''}?`
                  : 'Delete Selected'
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}