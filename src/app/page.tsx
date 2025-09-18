"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import TransactionCards from "./components/TransactionCards";
import TransactionSummary from "./components/TransactionSummary";
import TransactionForm from "./components/TransactionForm";
import TransactionAnalytics from "./components/TransactionAnalytics";
import SelectionGuide from "./components/SelectionGuide";
import { TransactionDirection } from "@/gen/arian/v1/enums_pb";
import type { Transaction } from "@/gen/arian/v1/transaction_pb";

export default function TransactionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<Transaction[]>([]);

  const handleSelectionChange = useCallback((transactions: Transaction[]) => {
    setSelectedTransactions(transactions);
  }, []);
  const cardsRef = useRef<{ 
    refresh: () => void; 
    clearSelection: () => void;
    hasSelection: boolean;
    selectedCount: number;
    deleteTransactions: (transactionIds: bigint[]) => void;
    createTransaction: (formData: any) => void;
    isCreating: boolean;
    isDeleting: boolean;
    createError: Error | null;
    deleteError: Error | null;
    isLoading: boolean;
  }>();

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
      if (cardsRef.current?.createTransaction) {
        await cardsRef.current.createTransaction(formData);
        setShowForm(false);
      }
    } catch (err) {
      console.error("Create transaction error:", err);
    }
  };

  const handleClearSelection = () => {
    if (cardsRef.current?.clearSelection) {
      cardsRef.current.clearSelection();
    }
  };

  const handleDeleteSelected = async () => {
    const transactionIds = selectedTransactions.map(t => t.id);
    
    try {
      if (cardsRef.current?.deleteTransactions) {
        cardsRef.current.deleteTransactions(transactionIds);
        handleClearSelection();
      }
    } catch (err) {
      console.error("Delete transactions error:", err);
      throw err; // Re-throw so the component can handle loading state
    }
  };

  const handleBulkModify = () => {
    // TODO: Implement bulk modify functionality
    alert("Bulk modify functionality coming soon!");
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-full">
        <header className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <h1 className="text-lg">arian // transactions</h1>
              {selectedTransactions.length > 0 && (
                <div className="flex items-center gap-2 text-sm tui-muted">
                  <span>{selectedTransactions.length} selected</span>
                  <button 
                    onClick={handleClearSelection}
                    className="text-xs underline hover:no-underline"
                  >
                    clear
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => cardsRef.current?.refresh()} 
                size="sm" 
                variant="outline"
                disabled={cardsRef.current?.isLoading}
                className="text-xs"
              >
                {cardsRef.current?.isLoading ? "↻" : "⟲"} refresh
              </Button>
              <Button onClick={() => setShowForm(!showForm)} size="sm" disabled={cardsRef.current?.isCreating || false}>
                {showForm ? "cancel" : "add transaction"}
              </Button>
            </div>
          </div>
          <TransactionSummary />
        </header>

        {(cardsRef.current?.createError || cardsRef.current?.deleteError) && (
          <div className="mb-6 p-3 text-sm font-mono text-red-600 tui-border">
            {cardsRef.current?.createError?.message || cardsRef.current?.deleteError?.message}
          </div>
        )}

        {showForm && (
          <div className="mb-6">
            <TransactionForm
              onSubmit={handleCreateTransaction}
              onCancel={() => setShowForm(false)}
              isLoading={cardsRef.current?.isCreating || false}
            />
          </div>
        )}

        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            <TransactionCards 
              ref={cardsRef} 
              onSelectionChange={handleSelectionChange}
            />
          </div>
          
          <div className="flex-shrink-0 sticky top-6 h-fit">
            {selectedTransactions.length > 0 ? (
              <TransactionAnalytics 
                transactions={selectedTransactions}
                onClose={handleClearSelection}
                onDeleteSelected={handleDeleteSelected}
                onBulkModify={handleBulkModify}
              />
            ) : (
              <SelectionGuide />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
