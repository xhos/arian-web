"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import type { Account } from "@/gen/arian/v1/account_pb";
import { AccountType } from "@/gen/arian/v1/enums_pb";
import { useAccounts } from "@/hooks/useAccounts";
import { useUserId } from "@/hooks/useSession";
import AccountForm from "./components/AccountForm";
import AccountList from "./components/AccountList";

const getAccountTypeName = (accountType: AccountType): string => {
  // Handle both string and numeric enum values
  const normalizedType = typeof accountType === 'string' 
    ? AccountType[accountType as keyof typeof AccountType] 
    : accountType;

  switch (normalizedType) {
    case AccountType.ACCOUNT_UNSPECIFIED:
      return "unspecified";
    case AccountType.ACCOUNT_CHEQUING:
      return "chequing";
    case AccountType.ACCOUNT_SAVINGS:
      return "savings";
    case AccountType.ACCOUNT_CREDIT_CARD:
      return "credit card";
    case AccountType.ACCOUNT_INVESTMENT:
      return "investment";
    case AccountType.ACCOUNT_OTHER:
      return "other";
    default:
      return "unknown";
  }
};
//TODO: decimal support for balance on create account
export default function AccountsPage() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const { accounts } = useAccounts();
  
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Create account mutation
  const createAccountMutation = useMutation({
    mutationFn: async (formData: {
      name: string;
      bank: string;
      type: AccountType;
      alias?: string;
      anchorBalance?: { currencyCode: string; units: string; nanos: number };
    }) => {
      if (!userId) throw new Error("User not authenticated");

      const response = await fetch("/api/arian.v1.AccountService/CreateAccount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name: formData.name,
          bank: formData.bank,
          type: formData.type,
          alias: formData.alias,
          anchorBalance: formData.anchorBalance,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.message?.includes("duplicate key value violates unique constraint")) {
          throw new Error(
            "An account with this name already exists. Please choose a different name."
          );
        }
        throw new Error(`Failed to create account: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setShowForm(false);
      setError("");
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to create account");
    },
  });

  // Update account mutation
  const updateAccountMutation = useMutation({
    mutationFn: async ({
      accountId,
      formData,
    }: {
      accountId: bigint;
      formData: {
        name: string;
        bank: string;
        type: AccountType;
        alias?: string;
      };
    }) => {
      if (!userId) throw new Error("User not authenticated");

      const response = await fetch("/api/arian.v1.AccountService/UpdateAccount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          id: accountId.toString(),
          updateMask: "name,bank,accountType,alias",
          name: formData.name,
          bank: formData.bank,
          accountType: formData.type,
          alias: formData.alias,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.message?.includes("duplicate key value violates unique constraint")) {
          throw new Error(
            "An account with this name already exists. Please choose a different name."
          );
        }
        throw new Error(`Failed to update account: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setEditingAccount(null);
      setShowForm(false);
      setError("");
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to update account");
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async (accountId: bigint) => {
      if (!userId) throw new Error("User not authenticated");

      const response = await fetch("/api/arian.v1.AccountService/DeleteAccount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          id: accountId.toString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete account: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setError("");
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to delete account");
    },
  });

  const handleDeleteAccount = (accountId: bigint) => {
    deleteAccountMutation.mutate(accountId);
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingAccount(null);
  };

  // Check if any mutation is loading
  const isOperationLoading = createAccountMutation.isPending || 
                            updateAccountMutation.isPending || 
                            deleteAccountMutation.isPending;

  if (!userId) {
    return (
      <div className="min-h-screen p-6">
        <div className="text-sm tui-muted">loading session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl">
        <header className="mb-6">
          <h1 className="text-lg mb-1">arian // accounts</h1>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm tui-muted">
              <span>total: {accounts.length} accounts</span>
            </div>
            <Button onClick={() => setShowForm(!showForm)} size="sm" disabled={isOperationLoading}>
              {showForm ? "cancel" : "add account"}
            </Button>
          </div>
        </header>

        {error && <div className="mb-6 p-3 text-sm font-mono text-red-600 tui-border">{error}</div>}

        {showForm && (
          <div className="mb-6">
            <AccountForm
              account={editingAccount}
              onSubmit={
                editingAccount
                  ? (formData) => updateAccountMutation.mutate({ accountId: editingAccount.id, formData })
                  : (formData) => createAccountMutation.mutate(formData)
              }
              onCancel={handleCancelForm}
              isLoading={isOperationLoading}
            />
          </div>
        )}

        {accounts.length === 0 && !showForm ? (
          <div className="tui-border p-8 text-center">
            <div className="text-sm tui-muted mb-2">No accounts yet</div>
            <div className="text-xs tui-muted">
              Add your first account to start tracking transactions
            </div>
          </div>
        ) : (
          <AccountList
            accounts={accounts}
            onEdit={handleEdit}
            onDelete={handleDeleteAccount}
            getAccountTypeName={getAccountTypeName}
            isLoading={isOperationLoading}
          />
        )}
      </div>
    </div>
  );
}
