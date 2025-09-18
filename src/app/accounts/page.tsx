"use client";

import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import type { Account } from "@/gen/arian/v1/account_pb";
import { AccountType } from "@/gen/arian/v1/enums_pb";
import { useAccounts } from "@/hooks/useAccounts";
import { useUserId } from "@/hooks/useSession";
import AccountGrid from "./components/AccountGrid";
import AnchorBalanceForm from "./components/AnchorBalanceForm";
import FilterChips from "./components/FilterChips";
import AccountDetailsSidebar from "./components/AccountDetailsSidebar";
import CreateAccountSidebar from "./components/CreateAccountSidebar";

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
  const [showAnchorForm, setShowAnchorForm] = useState(false);
  const [anchorAccount, setAnchorAccount] = useState<Account | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

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

  // Set anchor balance mutation
  const setAnchorBalanceMutation = useMutation({
    mutationFn: async ({
      accountId,
      balance,
    }: {
      accountId: bigint;
      balance: {
        currencyCode: string;
        units: string;
        nanos: number;
      };
    }) => {
      if (!userId) throw new Error("User not authenticated");

      const response = await fetch("/api/arian.v1.AccountService/SetAccountAnchor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: parseInt(accountId.toString()),
          balance: {
            currency_code: balance.currencyCode,
            units: balance.units,
            nanos: balance.nanos,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to set anchor balance: ${errorData.message || response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setShowAnchorForm(false);
      setAnchorAccount(null);
      setError("");
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to set anchor balance");
    },
  });

  const handleDeleteAccount = (accountId: bigint) => {
    deleteAccountMutation.mutate(accountId);
  };


  const handleSetAnchorBalance = (accountId: bigint, balance: { currencyCode: string; units: string; nanos: number }) => {
    setAnchorBalanceMutation.mutate({ accountId, balance });
  };

  const handleUpdateAccount = (accountId: bigint, data: { name: string; bank: string; type: AccountType; alias?: string }) => {
    updateAccountMutation.mutate({ accountId, formData: data });
  };


  const handleCancelAnchorForm = () => {
    setShowAnchorForm(false);
    setAnchorAccount(null);
  };

  // Check if any mutation is loading
  const isOperationLoading = createAccountMutation.isPending || 
                            updateAccountMutation.isPending || 
                            deleteAccountMutation.isPending ||
                            setAnchorBalanceMutation.isPending;

  if (!userId) {
    return (
      <div className="min-h-screen p-6">
        <div className="text-sm tui-muted">loading session...</div>
      </div>
    );
  }

  const availableTypes = useMemo(() => {
    const types = new Set(accounts.map(account => getAccountTypeName(account.type)));
    return Array.from(types).sort();
  }, [accounts]);

  const availableBanks = useMemo(() => {
    const banks = new Set(accounts.map(account => account.bank));
    return Array.from(banks).sort();
  }, [accounts]);

  const handleAccountClick = (account: Account) => {
    setSelectedAccount(account);
  };

  const handleCloseSidebar = () => {
    setSelectedAccount(null);
    setIsCreatingAccount(false);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-mono mb-4">accounts</h1>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm tui-muted">
              <span>total: {accounts.length} accounts</span>
            </div>
            <Button onClick={() => setIsCreatingAccount(true)} size="sm" disabled={isOperationLoading}>
              add account
            </Button>
          </div>
        </header>

        {error && <div className="mb-6 p-3 text-sm font-mono text-red-600 tui-border">{error}</div>}


        {showAnchorForm && anchorAccount && (
          <div className="mb-6">
            <AnchorBalanceForm
              accountId={anchorAccount.id}
              accountName={anchorAccount.name}
              currentBalance={anchorAccount.anchorBalance}
              onSubmit={(balance) => setAnchorBalanceMutation.mutateAsync({ accountId: anchorAccount.id, balance })}
              onCancel={handleCancelAnchorForm}
              isLoading={setAnchorBalanceMutation.isPending}
            />
          </div>
        )}

        {!showAnchorForm && accounts.length > 0 && (
          <FilterChips
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
            availableTypes={availableTypes}
            availableBanks={availableBanks}
          />
        )}

        {accounts.length === 0 && !isCreatingAccount ? (
          <div className="tui-border p-8 text-center">
            <div className="text-sm tui-muted mb-2">No accounts yet</div>
            <div className="text-xs tui-muted">
              Add your first account to start tracking transactions
            </div>
          </div>
        ) : (
          !showAnchorForm && (
            <AccountGrid
              accounts={accounts}
              selectedFilter={selectedFilter}
              getAccountTypeName={getAccountTypeName}
              onAccountClick={handleAccountClick}
            />
          )
        )}
      </div>

      <AccountDetailsSidebar
        account={selectedAccount}
        onClose={handleCloseSidebar}
        onUpdate={handleUpdateAccount}
        onDelete={handleDeleteAccount}
        onSetAnchorBalance={handleSetAnchorBalance}
        getAccountTypeName={getAccountTypeName}
        isLoading={isOperationLoading}
      />
      
      <CreateAccountSidebar
        isOpen={isCreatingAccount}
        onClose={handleCloseSidebar}
        onCreate={(formData) => createAccountMutation.mutate(formData)}
        isLoading={isOperationLoading}
      />
    </div>
  );
}
