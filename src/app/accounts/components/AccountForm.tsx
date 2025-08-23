"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { AccountType } from "@/gen/arian/v1/enums_pb";
import type { Account } from "@/gen/arian/v1/account_pb";

interface AccountFormProps {
  account?: Account | null;
  onSubmit: (formData: {
    name: string;
    bank: string;
    type: AccountType;
    alias?: string;
    anchorBalance?: { currencyCode: string; units: string; nanos: number };
  }) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const accountTypeOptions = [
  { value: AccountType.ACCOUNT_CHEQUING, label: "chequing" },
  { value: AccountType.ACCOUNT_SAVINGS, label: "savings" },
  { value: AccountType.ACCOUNT_CREDIT_CARD, label: "credit card" },
  { value: AccountType.ACCOUNT_INVESTMENT, label: "investment" },
  { value: AccountType.ACCOUNT_OTHER, label: "other" },
];

export default function AccountForm({ account, onSubmit, onCancel, isLoading }: AccountFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    bank: "",
    type: AccountType.ACCOUNT_CHEQUING,
    alias: "",
    anchorBalance: "",
  });

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        bank: account.bank,
        type: account.type,
        alias: account.alias || "",
        anchorBalance: account.anchorBalance?.units || "",
      });
    }
  }, [account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData: Parameters<typeof onSubmit>[0] = {
      name: formData.name,
      bank: formData.bank,
      type: formData.type,
      alias: formData.alias || undefined,
    };

    if (!account && formData.anchorBalance) {
      submitData.anchorBalance = {
        currencyCode: "USD",
        units: formData.anchorBalance,
        nanos: 0,
      };
    }

    await onSubmit(submitData);
  };

  const isEditing = !!account;

  return (
    <div className="tui-border p-4">
      <h2 className="text-sm tui-muted mb-4 uppercase tracking-wider">
        {isEditing ? "edit account" : "add new account"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">account name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="my checking account"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <Label htmlFor="bank">bank</Label>
            <Input
              id="bank"
              value={formData.bank}
              onChange={(e) => setFormData((prev) => ({ ...prev, bank: e.target.value }))}
              placeholder="chase, wells fargo, etc"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <Label htmlFor="type">account type</Label>
            <Select
              id="type"
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, type: parseInt(e.target.value) as AccountType }))
              }
              disabled={isLoading}
              required
            >
              {accountTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="alias">alias (optional)</Label>
            <Input
              id="alias"
              value={formData.alias}
              onChange={(e) => setFormData((prev) => ({ ...prev, alias: e.target.value }))}
              placeholder="short nickname"
              disabled={isLoading}
            />
          </div>

          {!isEditing && (
            <div className="md:col-span-2">
              <Label htmlFor="anchorBalance">starting balance (optional)</Label>
              <Input
                id="anchorBalance"
                type="number"
                step="0.01"
                value={formData.anchorBalance}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, anchorBalance: e.target.value }))
                }
                placeholder="0.00"
                disabled={isLoading}
              />
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? isEditing
                ? "updating..."
                : "creating..."
              : isEditing
                ? "update"
                : "create"}
          </Button>
          <Button type="button" onClick={onCancel} variant="ghost" disabled={isLoading}>
            cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
