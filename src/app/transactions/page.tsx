"use client";

import { useState, useCallback } from "react";
import type { Transaction } from "@/gen/arian/v1/transaction_pb";
import { TransactionDirection } from "@/gen/arian/v1/enums_pb";
import { TransactionList } from "./components/TransactionList";
import { TransactionSidebar } from "./components/TransactionSidebar";
import { TransactionDialog } from "./components/transaction-dialog";
import { ErrorMessage } from "@/components/data-display";
import { PageContainer, PageContent, PageHeaderWithTitle } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, Plus } from "lucide-react";
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

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleDeleteTransaction = async (transaction: Transaction) => {
    await deleteTransactions([transaction.id]);
  };

  return (
    <PageContainer>
      <PageContent>
        <PageHeaderWithTitle title="transactions" />

        {(createError || deleteError) && (
          <ErrorMessage className="mb-6">
            {createError?.message || deleteError?.message}
          </ErrorMessage>
        )}

        <div className="flex flex-col xl:flex-row gap-6 xl:gap-8">
          <div className="flex-1 min-w-0">
            <TransactionList
              onSelectionChange={handleSelectionChange}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </div>

          <aside className="xl:flex-shrink-0 xl:sticky xl:top-8 xl:h-fit xl:w-80 space-y-4">
            <div className="flex items-center gap-2 justify-end">
              <Button onClick={() => refetch()} size="icon" variant="ghost" disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button onClick={() => setIsDialogOpen(true)} size="default" disabled={isCreating}>
                <Plus className="h-4 w-4" />
                New
              </Button>
            </div>

            <div className="border rounded-lg bg-card p-4 space-y-3 xl:mt-12">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search"
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Advanced Filters
              </Button>
            </div>

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
