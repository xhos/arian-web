"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Account } from "@/gen/arian/v1/account_pb";
import { AccountType } from "@/gen/arian/v1/enums_pb";

interface AccountListProps {
  accounts: Account[];
  onEdit: (account: Account) => void;
  onDelete: (accountId: bigint) => void;
  onSetAnchorBalance: (
    accountId: bigint,
    balance: { currencyCode: string; units: string; nanos: number }
  ) => void;
  onUpdateAccount: (
    accountId: bigint,
    data: { name: string; bank: string; type: AccountType; alias?: string }
  ) => void;
  getAccountTypeName: (type: AccountType) => string;
  isLoading: boolean;
}

export default function AccountList({
  accounts,
  onDelete,
  onSetAnchorBalance,
  getAccountTypeName,
  isLoading,
}: AccountListProps) {
  const [deleteConfirmation, setDeleteConfirmation] = useState<bigint | null>(null);
  const [editingAccount, setEditingAccount] = useState<bigint | null>(null);
  const [editingAnchor, setEditingAnchor] = useState<bigint | null>(null);
  const [balances, setBalances] = useState<
    Map<string, { currencyCode: string; units: bigint; nanos: number }>
  >(new Map());

  // Fetch current balances for all accounts
  useEffect(() => {
    const fetchBalances = async () => {
      const newBalances = new Map();
      for (const account of accounts) {
        try {
          const response = await fetch("/api/arian.v1.AccountService/GetAccountBalance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: parseInt(account.id.toString()) }),
          });
          if (response.ok) {
            const data = await response.json();
            if (data.balance) {
              newBalances.set(account.id.toString(), data.balance);
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch balance for account ${account.id}:`, error);
        }
      }
      setBalances(newBalances);
    };

    if (accounts.length > 0) {
      fetchBalances();
    }
  }, [accounts]);
  const formatBalance = (balance?: {
    currencyCode?: string;
    units?: string | bigint;
    nanos?: number;
  }) => {
    if (!balance?.units) return "—";

    // Convert units to number and add nanos (fractional part)
    const unitsAmount = parseFloat(balance.units.toString());
    const nanosAmount = (balance.nanos || 0) / 1e9; // Convert nanos to decimal
    const totalAmount = unitsAmount + nanosAmount;

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: balance.currencyCode || "USD",
    }).format(totalAmount);
  };

  const getCurrentBalance = (accountId: bigint) => {
    const balance = balances.get(accountId.toString());
    return balance ? formatBalance(balance) : "loading...";
  };

  const formatDate = (timestamp?: { seconds?: string; nanos?: number }) => {
    if (!timestamp?.seconds) return "—";
    return new Date(parseInt(timestamp.seconds) * 1000).toLocaleDateString();
  };

  const handleDeleteClick = (accountId: bigint) => {
    if (deleteConfirmation === accountId) {
      // Second click - actually delete
      onDelete(accountId);
      setDeleteConfirmation(null);
    } else {
      // First click - show confirmation
      setDeleteConfirmation(accountId);
    }
  };

  return (
    <div className="space-y-4">
      {accounts.map((account) => (
        <div key={account.id.toString()} className="tui-border rounded-lg p-4">
          {/* Main account info */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {editingAccount === account.id ? (
                <div className="space-y-2">
                  <Input
                    defaultValue={account.alias || account.name}
                    placeholder="Account display name"
                    className="font-medium"
                  />
                  <div className="flex gap-2">
                    <Input
                      defaultValue={account.name}
                      placeholder="Internal name"
                      className="text-sm"
                    />
                    <Input defaultValue={account.bank} placeholder="Bank" className="text-sm" />
                    <Select defaultValue={account.type.toString()}>
                      <option value={AccountType.ACCOUNT_CHEQUING}>Chequing</option>
                      <option value={AccountType.ACCOUNT_SAVINGS}>Savings</option>
                      <option value={AccountType.ACCOUNT_CREDIT_CARD}>Credit Card</option>
                      <option value={AccountType.ACCOUNT_INVESTMENT}>Investment</option>
                      <option value={AccountType.ACCOUNT_OTHER}>Other</option>
                    </Select>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-lg">{account.alias || account.name}</h3>
                    {account.alias && <span className="text-sm tui-muted">({account.name})</span>}
                  </div>
                  <div className="text-sm tui-muted">
                    {account.bank} • {getAccountTypeName(account.type)}
                  </div>
                </div>
              )}
            </div>

            <div className="text-right">
              <div className="text-xl font-mono mb-1">{getCurrentBalance(account.id)}</div>
              <div className="text-xs tui-muted">current balance</div>
            </div>
          </div>

          {/* Anchor balance info */}
          {account.anchorBalance && (
            <div className="mb-4 p-3 bg-muted/30 rounded border-l-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs tui-muted mb-1">anchor balance</div>
                  {editingAnchor === account.id ? (
                    <div className="flex gap-2 items-center">
                      <Input
                        type="number"
                        step="0.01"
                        defaultValue={
                          parseFloat(account.anchorBalance.units?.toString() || "0") +
                          (account.anchorBalance.nanos || 0) / 1e9
                        }
                        className="w-24 h-7 text-sm"
                      />
                      <Select
                        defaultValue={account.anchorBalance.currencyCode || "USD"}
                        className="h-7 text-sm"
                      >
                        <option value="USD">USD</option>
                        <option value="CAD">CAD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="JPY">JPY</option>
                      </Select>
                      <Button size="sm" className="h-7 text-xs">
                        save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => setEditingAnchor(null)}
                      >
                        cancel
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingAnchor(account.id)}
                      className="text-sm hover:underline text-blue-600"
                    >
                      {formatBalance(account.anchorBalance)}
                    </button>
                  )}
                </div>
                <div className="text-xs tui-muted">
                  {account.anchorDate && formatDate(account.anchorDate)}
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            {editingAccount === account.id ? (
              <>
                <Button size="sm" onClick={() => setEditingAccount(null)}>
                  save changes
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingAccount(null)}>
                  cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingAccount(account.id)}
                  disabled={isLoading}
                >
                  edit
                </Button>
                {!account.anchorBalance && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      onSetAnchorBalance(account.id, { currencyCode: "USD", units: "0", nanos: 0 })
                    }
                    disabled={isLoading}
                    className="text-blue-600 hover:bg-blue-50 border-blue-200"
                  >
                    set anchor balance
                  </Button>
                )}
                <Button
                  size="sm"
                  variant={deleteConfirmation === account.id ? "destructive" : "ghost"}
                  onClick={() => handleDeleteClick(account.id)}
                  className={
                    deleteConfirmation === account.id
                      ? "min-h-8"
                      : "text-red-500 hover:bg-red-500/10 border-red-500/50"
                  }
                  disabled={isLoading}
                >
                  {deleteConfirmation === account.id ? "confirm delete" : "delete"}
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
