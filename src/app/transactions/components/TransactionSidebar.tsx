"use client";

import { useState } from "react";
import type { Transaction } from "@/gen/arian/v1/transaction_pb";
import { Button } from "@/components/ui/button";
import { Amount, Text, VStack, HStack, Caption } from "@/components/lib";
import { formatCurrency } from "@/lib/utils/transaction";
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
        <VStack spacing="sm">
          <VStack spacing="xs">
            <Text size="sm" weight="medium">Individual Selection</Text>
            <Text size="sm" color="muted" className="flex items-center gap-1.5">
              <KbdGroup><Kbd>Ctrl</Kbd></KbdGroup> + click transaction
            </Text>
          </VStack>
          <VStack spacing="xs">
            <Text size="sm" weight="medium">Range Selection</Text>
            <Text size="sm" color="muted" className="flex items-center gap-1.5">
              <KbdGroup><Kbd>Shift</Kbd></KbdGroup> + click transaction
            </Text>
          </VStack>
          <VStack spacing="xs">
            <Text size="sm" weight="medium">Select Entire Day</Text>
            <VStack spacing="xs">
              <Text size="sm" color="muted" className="flex items-center gap-1.5">
                <KbdGroup><Kbd>Ctrl</Kbd></KbdGroup> + click day header
              </Text>
              <Text size="sm" color="muted" className="flex items-center gap-1.5">
                <KbdGroup><Kbd>Shift</Kbd></KbdGroup> + click day header
              </Text>
            </VStack>
          </VStack>
        </VStack>
        <PanelDivider />
        <Text size="sm" color="muted" className="block">
          Selected transactions will show analysis here including income, expenses, and net totals.
        </Text>
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
        <HStack spacing="md" justify="between" align="center" className="mb-2">
          <Text size="sm" weight="semibold">Selection Analysis</Text>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </HStack>
        <Text size="sm" color="muted">
          {analytics.transactionCount} transaction{analytics.transactionCount !== 1 ? "s" : ""} selected
        </Text>
      </PanelSection>

      <PanelSection className="space-y-5">
        <VStack spacing="sm">
          <Stat
            label="Income"
            value={<Amount variant="positive" value={analytics.totalIncome} className="text-sm" />}
          />
          <Stat
            label="Expenses"
            value={<Amount variant="negative" value={analytics.totalExpenses} className="text-sm" />}
          />
        </VStack>

        <PanelDivider />

        <Stat
          label="Net Amount"
          value={
            <Amount
              variant={analytics.netAmount >= 0 ? "positive" : "negative"}
              value={analytics.netAmount}
              className="text-sm font-semibold"
            />
          }
        />

        <PanelDivider />

        <VStack spacing="sm">
          <Caption>Summary</Caption>
          <VStack spacing="xs">
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
                  <span className="font-mono text-xs text-success">
                    {analytics.incomePercentage.toFixed(1)}%
                  </span>
                }
              />
            )}
            {analytics.totalExpenses > 0 && (
              <Stat
                label="Expense percentage"
                value={
                  <span className="font-mono text-xs text-destructive">
                    {analytics.expensePercentage.toFixed(1)}%
                  </span>
                }
              />
            )}
          </VStack>
        </VStack>

        <PanelDivider />

        <VStack spacing="sm">
          <Caption>Actions</Caption>
          <VStack spacing="xs">
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
          </VStack>
        </VStack>
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
