"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import type { Account } from "@/gen/arian/v1/account_pb";
import { AccountType } from "@/gen/arian/v1/enums_pb";
import {
  useAccounts,
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount,
  useSetAnchorBalance,
} from "@/hooks/useAccounts";
import { useUserId } from "@/hooks/useSession";
import AccountGrid from "./components/AccountGrid";
import AnchorBalanceForm from "./components/AnchorBalanceForm";
import FilterChips from "./components/FilterChips";
import EditAccountSidebar from "./components/EditAccountSidebar";
import CreateAccountSidebar from "./components/CreateAccountSidebar";

const getAccountTypeName = (accountType: AccountType): string => {
  // Handle both string and numeric enum values
  const normalizedType =
    typeof accountType === "string"
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
  const { accounts } = useAccounts();

  const [error, setError] = useState("");
  const [showAnchorForm, setShowAnchorForm] = useState(false);
  const [anchorAccount, setAnchorAccount] = useState<Account | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const { createAccountAsync, isPending: isCreating } = useCreateAccount();
  const { updateAccountAsync, isPending: isUpdating } = useUpdateAccount();
  const { deleteAccountAsync, isPending: isDeleting } = useDeleteAccount();
  const { setAnchorBalanceAsync, isPending: isSettingAnchor } = useSetAnchorBalance();

  const handleDeleteAccount = async (accountId: bigint) => {
    try {
      await deleteAccountAsync(accountId);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
    }
  };

  const handleSetAnchorBalance = async (
    accountId: bigint,
    balance: { currencyCode: string; units: string; nanos: number }
  ) => {
    try {
      await setAnchorBalanceAsync({ id: accountId, balance });
      setShowAnchorForm(false);
      setAnchorAccount(null);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set anchor balance");
    }
  };

  const handleUpdateAccount = async (
    accountId: bigint,
    data: {
      name: string;
      bank: string;
      type: AccountType;
      alias?: string;
      mainCurrency?: string;
      colors?: string[];
    }
  ) => {
    try {
      await updateAccountAsync({
        id: accountId,
        name: data.name,
        bank: data.bank,
        accountType: data.type,
        alias: data.alias,
        mainCurrency: data.mainCurrency,
        colors: data.colors,
      });
      setError("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update account";
      if (errorMessage.includes("duplicate key")) {
        setError("An account with this name already exists. Please choose a different name.");
      } else {
        setError(errorMessage);
      }
    }
  };

  const handleCreateAccount = async (formData: {
    name: string;
    bank: string;
    type: AccountType;
    alias?: string;
    anchorBalance?: { currencyCode: string; units: string; nanos: number };
    mainCurrency?: string;
    colors?: string[];
  }) => {
    try {
      await createAccountAsync(formData);
      setError("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create account";
      if (errorMessage.includes("duplicate key")) {
        setError("An account with this name already exists. Please choose a different name.");
      } else {
        setError(errorMessage);
      }
    }
  };

  const handleCancelAnchorForm = () => {
    setShowAnchorForm(false);
    setAnchorAccount(null);
  };

  const isOperationLoading = isCreating || isUpdating || isDeleting || isSettingAnchor;

  const availableTypes = useMemo(() => {
    const types = new Set(accounts.map((account) => getAccountTypeName(account.type)));
    return Array.from(types).sort();
  }, [accounts]);

  const availableBanks = useMemo(() => {
    const banks = new Set(accounts.map((account) => account.bank));
    return Array.from(banks).sort();
  }, [accounts]);

  if (!userId) {
    return (
      <div className="min-h-screen p-6">
        <div className="text-sm tui-muted">loading session...</div>
      </div>
    );
  }

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
            <Button
              onClick={() => setIsCreatingAccount(true)}
              size="sm"
              disabled={isOperationLoading}
            >
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
              onSubmit={(balance) => handleSetAnchorBalance(anchorAccount.id, balance)}
              onCancel={handleCancelAnchorForm}
              isLoading={isSettingAnchor}
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
          <div className="tui-border rounded-lg p-8 text-center">
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

      <EditAccountSidebar
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
        onCreate={handleCreateAccount}
        isLoading={isOperationLoading}
      />
    </div>
  );
}
