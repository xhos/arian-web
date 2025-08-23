"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import type { Account } from "@/gen/arian/v1/account_pb";
import { AccountType } from "@/gen/arian/v1/enums_pb";
import AccountForm from "./components/AccountForm";
import AccountList from "./components/AccountList";

const getAccountTypeName = (accountType: AccountType): string => {
  switch (accountType) {
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

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isOperationLoading, setIsOperationLoading] = useState(false);

  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      const session = await authClient.getSession();
      const userId = session.data?.user?.id;

      if (!userId) {
        setError("User not authenticated");
        return;
      }

      const response = await fetch("/api/arian.v1.AccountService/ListAccounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to load accounts: ${response.statusText}`);
      }

      const data = await response.json();
      setAccounts(data.accounts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load accounts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async (formData: {
    name: string;
    bank: string;
    type: AccountType;
    alias?: string;
    anchorBalance?: { currencyCode: string; units: string; nanos: number };
  }) => {
    try {
      setIsOperationLoading(true);
      const session = await authClient.getSession();
      const userId = session.data?.user?.id;

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
          throw new Error("An account with this name already exists. Please choose a different name.");
        }
        throw new Error(`Failed to create account: ${response.statusText}`);
      }

      await loadAccounts();
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setIsOperationLoading(false);
    }
  };

  const handleUpdateAccount = async (
    accountId: bigint,
    formData: {
      name: string;
      bank: string;
      type: AccountType;
      alias?: string;
    }
  ) => {
    try {
      setIsOperationLoading(true);
      const session = await authClient.getSession();
      const userId = session.data?.user?.id;

      if (!userId) throw new Error("User not authenticated");

      const response = await fetch("/api/arian.v1.AccountService/UpdateAccount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          id: accountId.toString(),
          updateMask: { paths: ["name", "bank", "account_type", "alias"] },
          name: formData.name,
          bank: formData.bank,
          accountType: formData.type,
          alias: formData.alias,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.message?.includes("duplicate key value violates unique constraint")) {
          throw new Error("An account with this name already exists. Please choose a different name.");
        }
        throw new Error(`Failed to update account: ${response.statusText}`);
      }

      await loadAccounts();
      setEditingAccount(null);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update account");
    } finally {
      setIsOperationLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId: bigint) => {
    if (!confirm("Are you sure you want to delete this account?")) return;

    try {
      setIsOperationLoading(true);
      const session = await authClient.getSession();
      const userId = session.data?.user?.id;

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

      await loadAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
    } finally {
      setIsOperationLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingAccount(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
        <div className="text-sm tui-muted">loading accounts...</div>
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
                  ? (formData) => handleUpdateAccount(editingAccount.id, formData)
                  : handleCreateAccount
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
