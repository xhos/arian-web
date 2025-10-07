"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { Account } from "@/gen/arian/v1/account_pb";
import { AccountType } from "@/gen/arian/v1/enums_pb";

interface EditAccountSidebarProps {
  account: Account | null;
  onClose: () => void;
  onUpdate: (
    accountId: bigint,
    data: {
      name: string;
      bank: string;
      type: AccountType;
      alias?: string;
      mainCurrency?: string;
      colors?: string[];
    }
  ) => void;
  onDelete: (accountId: bigint) => void;
  onSetAnchorBalance: (
    accountId: bigint,
    balance: { currencyCode: string; units: string; nanos: number }
  ) => void;
  getAccountTypeName: (type: AccountType) => string;
  isLoading: boolean;
}

export default function EditAccountSidebar({
  account,
  onClose,
  onUpdate,
  onDelete,
  onSetAnchorBalance,
  isLoading,
}: EditAccountSidebarProps) {
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    bank: "",
    type: AccountType.ACCOUNT_UNSPECIFIED,
    alias: "",
    mainCurrency: "",
    anchorBalance: "",
    colors: ["#1f2937", "#3b82f6", "#10b981"],
  });

  useEffect(() => {
    if (!account) return;

    setEditForm({
      name: account.name,
      bank: account.bank,
      type: account.type,
      alias: account.alias || "",
      mainCurrency: account.mainCurrency || "USD",
      anchorBalance: account.anchorBalance
        ? (
            parseFloat(account.anchorBalance.units?.toString() || "0") +
            (account.anchorBalance.nanos || 0) / 1e9
          ).toString()
        : "",
      colors: account.colors.length === 3 ? account.colors : ["#1f2937", "#3b82f6", "#10b981"],
    });

    // Reset delete confirmation when account changes
    setDeleteConfirmation(false);
  }, [account]);

  // Reset delete confirmation when sidebar closes
  useEffect(() => {
    if (!account) {
      setDeleteConfirmation(false);
    }
  }, [account]);

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

  const handleSave = () => {
    if (!account) return;

    const updateData = {
      name: editForm.name,
      bank: editForm.bank,
      type: editForm.type,
      alias: editForm.alias,
      mainCurrency: editForm.mainCurrency,
      colors: editForm.colors,
    };

    onUpdate(account.id, updateData);

    // Update anchor balance if it changed
    if (
      editForm.anchorBalance &&
      editForm.anchorBalance !==
        (account.anchorBalance
          ? (
              parseFloat(account.anchorBalance.units?.toString() || "0") +
              (account.anchorBalance.nanos || 0) / 1e9
            ).toString()
          : "")
    ) {
      const anchorBalance = {
        currencyCode: editForm.mainCurrency,
        units: parseFloat(editForm.anchorBalance).toString(),
        nanos: Math.round((parseFloat(editForm.anchorBalance) % 1) * 1e9),
      };

      onSetAnchorBalance(account.id, anchorBalance);
    }
  };

  const handleCancel = () => {
    if (!account) return;

    setEditForm({
      name: account.name,
      bank: account.bank,
      type: account.type,
      alias: account.alias || "",
      mainCurrency: account.mainCurrency || "USD",
      anchorBalance: account.anchorBalance
        ? (
            parseFloat(account.anchorBalance.units?.toString() || "0") +
            (account.anchorBalance.nanos || 0) / 1e9
          ).toString()
        : "",
      colors: account.colors.length === 3 ? account.colors : ["#1f2937", "#3b82f6", "#10b981"],
    });
    onClose();
  };

  if (!account) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={handleCancel} />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-tui-background tui-border-l z-50 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-mono">details</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-tui-muted hover:text-tui-foreground"
            >
              ✕
            </Button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="text-xs text-tui-muted block mb-1">id</label>
              <div className="text-sm font-mono text-tui-muted">{account.id.toString()}</div>
            </div>

            <div>
              <label className="text-xs text-tui-muted block mb-1">name</label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="text-sm h-8"
                required
              />
            </div>

            <div>
              <label className="text-xs text-tui-muted block mb-1">alias</label>
              <Input
                value={editForm.alias}
                onChange={(e) => setEditForm({ ...editForm, alias: e.target.value })}
                placeholder="Display name (optional)"
                className="text-sm h-8"
              />
            </div>

            <div>
              <label className="text-xs text-tui-muted block mb-1">bank</label>
              <Input
                value={editForm.bank}
                onChange={(e) => setEditForm({ ...editForm, bank: e.target.value })}
                className="text-sm h-8"
                required
              />
            </div>

            <div>
              <label className="text-xs text-tui-muted block mb-1">type</label>
              <select
                value={editForm.type.toString()}
                onChange={(e) =>
                  setEditForm({ ...editForm, type: parseInt(e.target.value) as AccountType })
                }
                className="text-sm"
              >
                <option value={AccountType.ACCOUNT_CHEQUING}>Chequing</option>
                <option value={AccountType.ACCOUNT_SAVINGS}>Savings</option>
                <option value={AccountType.ACCOUNT_CREDIT_CARD}>Credit Card</option>
                <option value={AccountType.ACCOUNT_INVESTMENT}>Investment</option>
                <option value={AccountType.ACCOUNT_OTHER}>Other</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-tui-muted block mb-1">currency</label>
              <select
                value={editForm.mainCurrency}
                onChange={(e) => setEditForm({ ...editForm, mainCurrency: e.target.value })}
                className="text-sm"
              >
                <option value="USD">USD</option>
                <option value="CAD">CAD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-tui-muted block mb-1">colors</label>
              <div className="space-y-2">
                {editForm.colors.map((color, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => {
                        const newColors = [...editForm.colors];
                        newColors[index] = e.target.value;
                        setEditForm({ ...editForm, colors: newColors });
                      }}
                      className="w-8 h-8 rounded border cursor-pointer"
                    />
                    <span className="text-xs text-tui-muted">
                      {index === 0 ? "Primary" : index === 1 ? "Secondary" : "Tertiary"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-tui-muted block mb-1">anchor</label>
              <Input
                type="number"
                step="0.01"
                value={editForm.anchorBalance}
                onChange={(e) => setEditForm({ ...editForm, anchorBalance: e.target.value })}
                placeholder="0.00"
                className="text-sm h-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              {account.anchorDate && (
                <div className="text-xs text-tui-muted mt-1">
                  last set on{" "}
                  {new Date(
                    parseInt(account.anchorDate.seconds?.toString() || "0") * 1000
                  ).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="pt-4 space-y-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isLoading || !editForm.name || !editForm.bank}
                className="w-full h-8"
              >
                save
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleDeleteClick}
                disabled={isLoading}
                className={`w-full h-8 text-red-500 hover:bg-red-500/10 ${
                  deleteConfirmation ? "bg-red-500 text-white hover:bg-red-600" : ""
                }`}
              >
                {deleteConfirmation ? "confirm delete" : "delete"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
