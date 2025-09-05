"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import TransactionCards from "./components/TransactionCards";
import TransactionSummary from "./components/TransactionSummary";
import TransactionForm from "./components/TransactionForm";
import { TransactionDirection } from "@/gen/arian/v1/enums_pb";

export default function TransactionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const cardsRef = useRef<{ refresh: () => void }>();

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
      setIsCreating(true);
      setError("");

      const session = await authClient.getSession();
      const userId = session.data?.user?.id;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const requestBody: {
        user_id: string;
        account_id: number;
        tx_date: string;
        tx_amount: {
          currency_code: string;
          units: string;
          nanos: number;
        };
        direction: TransactionDirection;
        description?: string;
        merchant?: string;
        user_notes?: string;
        category_id?: number;
      } = {
        user_id: userId,
        account_id: parseInt(formData.accountId.toString()),
        tx_date: formData.txDate.toISOString(),
        tx_amount: formData.txAmount,
        direction: formData.direction,
      };

      if (formData.description) {
        requestBody.description = formData.description;
      }
      if (formData.merchant) {
        requestBody.merchant = formData.merchant;
      }
      if (formData.userNotes) {
        requestBody.user_notes = formData.userNotes;
      }
      if (formData.categoryId) {
        requestBody.category_id = parseInt(formData.categoryId.toString());
      }

      const response = await fetch("/api/arian.v1.TransactionService/CreateTransaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to create transaction: ${response.statusText}`
        );
      }

      setShowForm(false);
      // Refresh the transaction cards
      if (cardsRef.current?.refresh) {
        cardsRef.current.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create transaction");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-full">
        <header className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg">arian // transactions</h1>
            <Button onClick={() => setShowForm(!showForm)} size="sm" disabled={isCreating}>
              {showForm ? "cancel" : "add transaction"}
            </Button>
          </div>
          <TransactionSummary />
        </header>

        {error && <div className="mb-6 p-3 text-sm font-mono text-red-600 tui-border">{error}</div>}

        {showForm && (
          <div className="mb-6">
            <TransactionForm
              onSubmit={handleCreateTransaction}
              onCancel={() => setShowForm(false)}
              isLoading={isCreating}
            />
          </div>
        )}

        <TransactionCards ref={cardsRef} />
      </div>
    </div>
  );
}
