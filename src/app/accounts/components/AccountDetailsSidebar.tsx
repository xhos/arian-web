"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Account } from "@/gen/arian/v1/account_pb";
import { AccountType } from "@/gen/arian/v1/enums_pb";

interface AccountDetailsSidebarProps {
  account: Account | null;
  onClose: () => void;
  onUpdate: (accountId: bigint, data: { name: string; bank: string; type: AccountType; alias?: string }) => void;
  onDelete: (accountId: bigint) => void;
  onSetAnchorBalance: (accountId: bigint, balance: { currencyCode: string; units: string; nanos: number }) => void;
  getAccountTypeName: (type: AccountType) => string;
  isLoading: boolean;
}

export default function AccountDetailsSidebar({
  account,
  onClose,
  onUpdate,
  onDelete,
  onSetAnchorBalance,
  getAccountTypeName,
  isLoading,
}: AccountDetailsSidebarProps) {
  const [balance, setBalance] = useState<{
    currencyCode: string;
    units: bigint;
    nanos: number;
  } | null>(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bank: '',
    type: AccountType.ACCOUNT_UNSPECIFIED,
    alias: ''
  });
  const [anchorEditForm, setAnchorEditForm] = useState({
    units: '',
    currencyCode: 'USD'
  });
  const [isEditingAnchor, setIsEditingAnchor] = useState(false);

  useEffect(() => {
    if (!account) return;

    // Initialize edit form with current account data
    setEditForm({
      name: account.name,
      bank: account.bank,
      type: account.type,
      alias: account.alias || ''
    });

    // Initialize anchor form
    if (account.anchorBalance) {
      setAnchorEditForm({
        units: (parseFloat(account.anchorBalance.units?.toString() || '0') + (account.anchorBalance.nanos || 0) / 1e9).toString(),
        currencyCode: account.anchorBalance.currencyCode || 'USD'
      });
    }

    const fetchBalance = async () => {
      setIsBalanceLoading(true);
      try {
        const response = await fetch("/api/arian.v1.AccountService/GetAccountBalance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: parseInt(account.id.toString()) }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data.balance) {
            setBalance(data.balance);
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch balance for account ${account.id}:`, error);
      } finally {
        setIsBalanceLoading(false);
      }
    };

    fetchBalance();
  }, [account]);

  const formatBalance = (balance?: {
    currencyCode?: string;
    units?: string | bigint;
    nanos?: number;
  }) => {
    if (!balance?.units) return "—";
    
    const unitsAmount = parseFloat(balance.units.toString());
    const nanosAmount = (balance.nanos || 0) / 1e9;
    const totalAmount = unitsAmount + nanosAmount;
    
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: balance.currencyCode || "USD",
    }).format(totalAmount);
  };

  const formatDate = (timestamp?: { seconds?: string; nanos?: number }) => {
    if (!timestamp?.seconds) return "—";
    return new Date(parseInt(timestamp.seconds) * 1000).toLocaleDateString();
  };

  const handleDeleteClick = () => {
    if (!account) return;
    
    if (deleteConfirmation) {
      onDelete(account.id);
      setDeleteConfirmation(false);
      onClose();
    } else {
      setDeleteConfirmation(true);
    }
  };

  const handleSaveEdit = () => {
    if (!account) return;
    
    onUpdate(account.id, {
      name: editForm.name,
      bank: editForm.bank,
      type: editForm.type,
      alias: editForm.alias
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    if (!account) return;
    
    setEditForm({
      name: account.name,
      bank: account.bank,
      type: account.type,
      alias: account.alias || ''
    });
    setIsEditing(false);
  };

  const handleSaveAnchor = () => {
    if (!account) return;
    
    const anchorBalance = {
      currencyCode: anchorEditForm.currencyCode,
      units: parseFloat(anchorEditForm.units).toString(),
      nanos: Math.round((parseFloat(anchorEditForm.units) % 1) * 1e9)
    };
    
    onSetAnchorBalance(account.id, anchorBalance);
    setIsEditingAnchor(false);
  };

  const handleCancelAnchor = () => {
    if (!account?.anchorBalance) return;
    
    setAnchorEditForm({
      units: (parseFloat(account.anchorBalance.units?.toString() || '0') + (account.anchorBalance.nanos || 0) / 1e9).toString(),
      currencyCode: account.anchorBalance.currencyCode || 'USD'
    });
    setIsEditingAnchor(false);
  };

  if (!account) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-tui-background tui-border-l z-50 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-mono">account details</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-tui-muted hover:text-tui-foreground"
            >
              ✕
            </Button>
          </div>

          {/* Account Info */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-sm font-mono text-tui-muted mb-3">basic info</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-tui-muted block mb-1">account id</label>
                  <div className="text-sm font-mono">{account.id.toString()}</div>
                </div>
                
                <div>
                  <label className="text-xs text-tui-muted block mb-1">display name</label>
                  {isEditing ? (
                    <Input
                      value={editForm.alias}
                      onChange={(e) => setEditForm({ ...editForm, alias: e.target.value })}
                      placeholder="Display name (optional)"
                      className="text-sm h-8"
                    />
                  ) : (
                    <div className="text-sm font-medium">{account.alias || account.name}</div>
                  )}
                </div>
                
                <div>
                  <label className="text-xs text-tui-muted block mb-1">internal name</label>
                  {isEditing ? (
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Internal name"
                      className="text-sm h-8"
                      required
                    />
                  ) : (
                    <div className="text-sm">{account.name}</div>
                  )}
                </div>
                
                <div>
                  <label className="text-xs text-tui-muted block mb-1">bank</label>
                  {isEditing ? (
                    <Input
                      value={editForm.bank}
                      onChange={(e) => setEditForm({ ...editForm, bank: e.target.value })}
                      placeholder="Bank name"
                      className="text-sm h-8"
                      required
                    />
                  ) : (
                    <div className="text-sm">{account.bank}</div>
                  )}
                </div>
                
                <div>
                  <label className="text-xs text-tui-muted block mb-1">type</label>
                  {isEditing ? (
                    <Select 
                      value={editForm.type.toString()}
                      onChange={(e) => setEditForm({ ...editForm, type: parseInt(e.target.value) as AccountType })}
                      className="text-sm h-8"
                    >
                      <option value={AccountType.ACCOUNT_CHEQUING}>Chequing</option>
                      <option value={AccountType.ACCOUNT_SAVINGS}>Savings</option>
                      <option value={AccountType.ACCOUNT_CREDIT_CARD}>Credit Card</option>
                      <option value={AccountType.ACCOUNT_INVESTMENT}>Investment</option>
                      <option value={AccountType.ACCOUNT_OTHER}>Other</option>
                    </Select>
                  ) : (
                    <div className="text-sm">{getAccountTypeName(account.type)}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Balance Info */}
            <div>
              <h3 className="text-sm font-mono text-tui-muted mb-3">balance</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-xl font-mono font-bold">
                    {isBalanceLoading ? "loading..." : formatBalance(balance || undefined)}
                  </div>
                </div>
                
                {account.anchorBalance && (
                  <div>
                    <label className="text-xs text-tui-muted block mb-1">anchor balance</label>
                    {isEditingAnchor ? (
                      <div className="space-y-2">
                        <div className="flex gap-2 items-center">
                          <Input
                            type="number"
                            step="0.01"
                            value={anchorEditForm.units}
                            onChange={(e) => setAnchorEditForm({ ...anchorEditForm, units: e.target.value })}
                            placeholder="0.00"
                            className="text-sm h-8"
                          />
                          <Select
                            value={anchorEditForm.currencyCode}
                            onChange={(e) => setAnchorEditForm({ ...anchorEditForm, currencyCode: e.target.value })}
                            className="text-sm h-8 w-20"
                          >
                            <option value="USD">USD</option>
                            <option value="CAD">CAD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                            <option value="JPY">JPY</option>
                          </Select>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveAnchor} className="text-xs h-7">
                            save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={handleCancelAnchor} className="text-xs h-7">
                            cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <button 
                          onClick={() => setIsEditingAnchor(true)}
                          className="text-sm hover:underline text-blue-600"
                        >
                          {formatBalance(account.anchorBalance)}
                        </button>
                        <div className="text-xs text-tui-muted mt-1">
                          set on {formatDate(account.anchorDate ? { seconds: account.anchorDate.seconds?.toString(), nanos: account.anchorDate.nanos } : undefined)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div>
              <h3 className="text-sm font-mono text-tui-muted mb-3">actions</h3>
              <div className="space-y-2">
                {isEditing ? (
                  <>
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={isLoading || !editForm.name || !editForm.bank}
                      className="w-full justify-start"
                    >
                      save changes
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                      className="w-full justify-start"
                    >
                      cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      disabled={isLoading}
                      className="w-full justify-start"
                    >
                      edit account
                    </Button>
                    
                    {!account.anchorBalance && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setAnchorEditForm({ units: '0', currencyCode: 'USD' });
                          setIsEditingAnchor(true);
                        }}
                        disabled={isLoading}
                        className="w-full justify-start"
                      >
                        set anchor balance
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant={deleteConfirmation ? "destructive" : "ghost"}
                      onClick={handleDeleteClick}
                      disabled={isLoading}
                      className="w-full justify-start text-red-500 hover:bg-red-500/10"
                    >
                      {deleteConfirmation ? "confirm delete" : "delete account"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}