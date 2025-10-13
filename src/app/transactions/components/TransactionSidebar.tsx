"use client";

import { useState } from "react";
import type { Transaction } from "@/gen/arian/v1/transaction_pb";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/transaction";
import { Amount } from "@/components/data-display";
import { MetaText, SectionHeader, SmallText } from "@/components/ui/typography";
import { Stat } from "@/components/ui/layout";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { useTransactionAnalytics } from "@/hooks/useTransactionAnalytics";

interface TransactionSidebarProps {
  transactions: Transaction[];
  onClose: () => void;
  onDeleteSelected: () => Promise<void>;
  onBulkModify: () => void;
}

const Panel = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`hidden xl:block border rounded-lg bg-card ${className}`}>
    {children}
  </div>
);

const PanelSection = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);

const PanelDivider = () => <div className="border-t" />;

function SelectionGuide() {
  return (
    <Panel>
      <PanelSection className="space-y-4">
        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium mb-1.5">Individual Selection</div>
            <SmallText className="flex items-center gap-1.5">
              <KbdGroup><Kbd>Ctrl</Kbd></KbdGroup> + click transaction
            </SmallText>
          </div>
          <div>
            <div className="text-sm font-medium mb-1.5">Range Selection</div>
            <SmallText className="flex items-center gap-1.5">
              <KbdGroup><Kbd>Shift</Kbd></KbdGroup> + click transaction
            </SmallText>
          </div>
          <div>
            <div className="text-sm font-medium mb-1.5">Select Entire Day</div>
            <div className="space-y-1">
              <SmallText className="flex items-center gap-1.5">
                <KbdGroup><Kbd>Ctrl</Kbd></KbdGroup> + click day header
              </SmallText>
              <SmallText className="flex items-center gap-1.5">
                <KbdGroup><Kbd>Shift</Kbd></KbdGroup> + click day header
              </SmallText>
            </div>
          </div>
        </div>
        <PanelDivider />
        <SmallText className="block">
          Selected transactions will show analysis here including income, expenses, and net totals.
        </SmallText>
      </PanelSection>
    </Panel>
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
    <Panel>
      <PanelSection className="border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Selection Analysis</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>
        <SmallText>
          {analytics.transactionCount} transaction{analytics.transactionCount !== 1 ? "s" : ""} selected
        </SmallText>
      </PanelSection>

      <PanelSection className="space-y-5">
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

        <PanelDivider />

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

        <PanelDivider />

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

        <PanelDivider />

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
      </PanelSection>
    </Panel>
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
