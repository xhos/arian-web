"use client";

import { useState, useCallback } from "react";
import type { Transaction } from "@/gen/arian/v1/transaction_pb";
import { TransactionDirection } from "@/gen/arian/v1/enums_pb";
import { TransactionList } from "./components/TransactionList";
import { TransactionSidebar } from "./components/TransactionSidebar";
import { TransactionDialog } from "./components/transaction-dialog";
import { VStack, HStack, ErrorMessage } from "@/components/lib";
import { PageContainer, PageContent, PageHeaderWithTitle } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, RefreshCw, Plus } from "lucide-react";
import { useTransactionsQuery } from "@/hooks/useTransactionsQuery";
import { TransactionDetailsDialog } from "./components/TransactionDetailsDialog";

export default function TransactionsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedTransactions, setSelectedTransactions] = useState<Transaction[]>([]);
  const [detailsTransaction, setDetailsTransaction] = useState<Transaction | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const {
    deleteTransactions,
    createTransaction,
    updateTransaction,
    isCreating,
    isUpdating,
    createError,
    updateError,
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
    if (editingTransaction) {
      await updateTransaction({
        id: editingTransaction.id,
        ...formData,
      });
    } else {
      await createTransaction(formData);
    }
    setIsDialogOpen(false);
    setEditingTransaction(null);
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

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingTransaction(null);
    }
  };

  const handleDeleteTransaction = async (transaction: Transaction) => {
    await deleteTransactions([transaction.id]);
  };

  const handleViewDetails = (transaction: Transaction) => {
    setDetailsTransaction(transaction);
    setIsDetailsDialogOpen(true);
  };

  return (
    <PageContainer>
      <PageContent>
        <PageHeaderWithTitle title="transactions" />

        {(createError || updateError || deleteError) && (
          <ErrorMessage className="mb-6">
            {createError?.message || updateError?.message || deleteError?.message}
          </ErrorMessage>
        )}

        <div className="flex flex-col xl:flex-row xl:gap-8 gap-4">
          {/* Top toolbar - visible on all screens */}
          <div className="xl:hidden">
            <VStack spacing="sm">
              <HStack spacing="sm" justify="between">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search"
                    className="pl-9 border border-border rounded-sm"
                  />
                </div>
                <HStack spacing="xs">
                  <Button onClick={() => refetch()} size="icon" variant="ghost" disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button onClick={() => setIsDialogOpen(true)} size="icon" disabled={isCreating || isUpdating}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </HStack>
              </HStack>
              <Button variant="outline" size="sm" className="w-full rounded-sm">
                Filters
              </Button>
            </VStack>
          </div>

          <div className="flex-1 min-w-0 xl:order-2">
            <TransactionList
              onSelectionChange={handleSelectionChange}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onViewDetails={handleViewDetails}
            />
          </div>

          {/* Sidebar - visible on xl and up */}
          <aside className="hidden xl:block xl:flex-shrink-0 xl:sticky xl:top-8 xl:h-fit xl:w-80 xl:order-1">
            <VStack spacing="md">
              <HStack spacing="sm" justify="end">
                <Button onClick={() => refetch()} size="icon" variant="ghost" disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Button onClick={() => setIsDialogOpen(true)} size="default" disabled={isCreating || isUpdating}>
                  <Plus className="h-4 w-4" />
                  New
                </Button>
              </HStack>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search"
                  className="pl-9 border border-border rounded-sm"
                />
              </div>
              <Button variant="outline" size="sm" className="w-full rounded-sm">
                Filters
              </Button>

              {selectedTransactions.length > 0 && (
                <TransactionSidebar
                  transactions={selectedTransactions}
                  onClose={handleClearSelection}
                  onDeleteSelected={handleDeleteSelected}
                  onBulkModify={handleBulkModify}
                />
              )}
            </VStack>
          </aside>
        </div>

        <TransactionDialog
          open={isDialogOpen}
          onOpenChange={handleDialogOpenChange}
          transaction={editingTransaction}
          onSave={handleSaveTransaction}
          title={editingTransaction ? "Edit Transaction" : "Create Transaction"}
        />

        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
            </DialogHeader>
            {detailsTransaction && <TransactionDetailsDialog transaction={detailsTransaction} />}
          </DialogContent>
        </Dialog>
      </PageContent>
    </PageContainer>
  );
}
