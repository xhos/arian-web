"use client";

import { useState, useRef, useCallback } from "react";
import type { Transaction } from "@/gen/arian/v1/transaction_pb";
import { TransactionDirection } from "@/gen/arian/v1/enums_pb";
import { TransactionHeader } from "./components/TransactionHeader";
import { TransactionList, type TransactionListRef } from "./components/TransactionList";
import { TransactionSidebar } from "./components/TransactionSidebar";
import TransactionForm from "./components/TransactionForm";

export default function TransactionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<Transaction[]>([]);
  const listRef = useRef<TransactionListRef>();

  const handleSelectionChange = useCallback((transactions: Transaction[]) => {
    setSelectedTransactions(transactions);
  }, []);

  const handleCreateTransaction = async (formData: {
    accountId: bigint;
    txDate: Date;
    txAmount: { currencyCode: string; units: string; nanos: number };
    direction: TransactionDirection;
    description?: string;
    merchant?: string;
    userNotes?: string;
    categoryId?: bigint;
  }) => {
    try {
      if (listRef.current?.createTransaction) {
        await listRef.current.createTransaction(formData);
        setShowForm(false);
      }
    } catch (err) {
      console.error("Create transaction error:", err);
    }
  };

  const handleClearSelection = () => {
    if (listRef.current?.clearSelection) {
      listRef.current.clearSelection();
    }
  };

  const handleDeleteSelected = async () => {
    const transactionIds = selectedTransactions.map((t) => t.id);

    try {
      if (listRef.current?.deleteTransactions) {
        listRef.current.deleteTransactions(transactionIds);
        handleClearSelection();
      }
    } catch (err) {
      console.error("Delete transactions error:", err);
      throw err;
    }
  };

  const handleBulkModify = () => {
    alert("Bulk modify functionality coming soon!");
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-full">
        <TransactionHeader
          selectedCount={selectedTransactions.length}
          onClearSelection={handleClearSelection}
          onRefresh={() => listRef.current?.refresh()}
          onAddTransaction={() => setShowForm(!showForm)}
          isLoading={listRef.current?.isLoading}
          isCreating={listRef.current?.isCreating}
          showForm={showForm}
        />

        {(listRef.current?.createError || listRef.current?.deleteError) && (
          <div className="mb-6 p-3 text-sm font-mono text-red-600 border rounded-lg">
            {listRef.current?.createError?.message || listRef.current?.deleteError?.message}
          </div>
        )}

        {showForm && (
          <div className="mb-6">
            <TransactionForm
              onSubmit={handleCreateTransaction}
              onCancel={() => setShowForm(false)}
              isLoading={listRef.current?.isCreating || false}
            />
          </div>
        )}

        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            <TransactionList ref={listRef} onSelectionChange={handleSelectionChange} />
          </div>

          <div className="flex-shrink-0 sticky top-6 h-fit">
            <TransactionSidebar
              transactions={selectedTransactions}
              onClose={handleClearSelection}
              onDeleteSelected={handleDeleteSelected}
              onBulkModify={handleBulkModify}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
