"use client";

import { useState, useCallback } from "react";
import type { Transaction } from "@/gen/arian/v1/transaction_pb";
import { TransactionDirection } from "@/gen/arian/v1/enums_pb";
import { TransactionHeader } from "./components/TransactionHeader";
import { TransactionList } from "./components/TransactionList";
import { TransactionSidebar } from "./components/TransactionSidebar";
import { TransactionDialog } from "./components/transaction-dialog";
import { ErrorMessage } from "@/components/data-display";
import { PageContainer, PageContent } from "@/components/ui/layout";
import { useTransactionsQuery } from "@/hooks/useTransactionsQuery";

export default function TransactionsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedTransactions, setSelectedTransactions] = useState<Transaction[]>([]);

  const {
    deleteTransactions,
    isDeleting,
    createTransaction,
    isCreating,
    createError,
    deleteError,
    refetch,
    isLoading,
  } = useTransactionsQuery({});

  void setEditingTransaction;

  const handleSelectionChange = useCallback((transactions: Transaction[]) => {
    setSelectedTransactions(transactions);
  }, []);

  const handleSaveTransaction = async (formData: {
    accountId: bigint;
    txDate: Date;
    txAmount: { currencyCode: string; units: string; nanos: number };
    direction: TransactionDirection;
    description?: string;
    merchant?: string;
    userNotes?: string;
    categoryId?: bigint;
  }) => {
    await createTransaction(formData);
    setIsDialogOpen(false);
  };

  const handleClearSelection = () => {
    setSelectedTransactions([]);
  };

  const handleDeleteSelected = async () => {
    const transactionIds = selectedTransactions.map((t) => t.id);
    await deleteTransactions(transactionIds);
    handleClearSelection();
  };

  const handleBulkModify = () => {
    alert("Bulk modify functionality coming soon!");
  };

  return (
    <PageContainer>
      <PageContent>
        <TransactionHeader
          selectedCount={selectedTransactions.length}
          onClearSelection={handleClearSelection}
          onRefresh={refetch}
          onAddTransaction={() => setIsDialogOpen(true)}
          isLoading={isLoading}
          isCreating={isCreating}
          showForm={isDialogOpen}
        />

        {(createError || deleteError) && (
          <ErrorMessage className="mb-6">
            {createError?.message || deleteError?.message}
          </ErrorMessage>
        )}

        <div className="flex gap-8">
          <div className="flex-1 min-w-0">
            <TransactionList onSelectionChange={handleSelectionChange} />
          </div>

          <aside className="flex-shrink-0 sticky top-8 h-fit">
            <TransactionSidebar
              transactions={selectedTransactions}
              onClose={handleClearSelection}
              onDeleteSelected={handleDeleteSelected}
              onBulkModify={handleBulkModify}
            />
          </aside>
        </div>

        <TransactionDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          transaction={editingTransaction}
          onSave={handleSaveTransaction}
          title={editingTransaction ? "Edit Transaction" : "Create Transaction"}
        />
      </PageContent>
    </PageContainer>
  );
}
