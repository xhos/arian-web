"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FormField, Select } from "@/components/ui/forms";
import { TransactionDirection } from "@/gen/arian/v1/enums_pb";
import { useAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import type { Transaction } from "@/gen/arian/v1/transaction_pb";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction | null;
  onSave: (formData: {
    accountId: bigint;
    txDate: Date;
    txAmount: { currencyCode: string; units: string; nanos: number };
    direction: TransactionDirection;
    description?: string;
    merchant?: string;
    userNotes?: string;
    categoryId?: bigint;
  }) => Promise<void>;
  title: string;
}

const directionOptions = [
  { value: TransactionDirection.DIRECTION_OUTGOING, label: "Expense" },
  { value: TransactionDirection.DIRECTION_INCOMING, label: "Income" },
];

const currencyOptions = [
  { value: "USD", label: "USD" },
  { value: "CAD", label: "CAD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "JPY", label: "JPY" },
];

export function TransactionDialog({
  open,
  onOpenChange,
  transaction,
  onSave,
  title,
}: TransactionDialogProps) {
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState({
    accountId: "",
    amount: "",
    currency: "USD",
    direction: TransactionDirection.DIRECTION_OUTGOING,
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
    description: "",
    merchant: "",
    userNotes: "",
    categoryId: "",
  });

  React.useEffect(() => {
    if (open) {
      if (transaction) {
        // Parse existing transaction for editing
        const txDate = transaction.txDate?.seconds
          ? new Date(Number(transaction.txDate.seconds) * 1000)
          : new Date();

        const amount = transaction.txAmount
          ? (Number(transaction.txAmount.units) + (transaction.txAmount.nanos || 0) / 1e9).toString()
          : "";

        setFormData({
          accountId: transaction.accountId?.toString() || "",
          amount,
          currency: transaction.txAmount?.currencyCode || "USD",
          direction: transaction.direction || TransactionDirection.DIRECTION_OUTGOING,
          date: txDate.toISOString().split("T")[0],
          time: txDate.toTimeString().slice(0, 5),
          description: transaction.description || "",
          merchant: transaction.merchant || "",
          userNotes: transaction.userNotes || "",
          categoryId: transaction.categoryId?.toString() || "",
        });
      } else {
        // Reset for new transaction
        setFormData({
          accountId: "",
          amount: "",
          currency: "USD",
          direction: TransactionDirection.DIRECTION_OUTGOING,
          date: new Date().toISOString().split("T")[0],
          time: new Date().toTimeString().slice(0, 5),
          description: "",
          merchant: "",
          userNotes: "",
          categoryId: "",
        });
      }
      setError(null);
    }
  }, [transaction, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.accountId) {
      setError("Please select an account");
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`);

      await onSave({
        accountId: BigInt(formData.accountId),
        txDate: dateTime,
        txAmount: {
          currencyCode: formData.currency,
          units: Math.floor(parseFloat(formData.amount)).toString(),
          nanos: Math.round((parseFloat(formData.amount) % 1) * 1e9),
        },
        direction: formData.direction,
        description: formData.description || undefined,
        merchant: formData.merchant || undefined,
        userNotes: formData.userNotes || undefined,
        categoryId: formData.categoryId ? BigInt(formData.categoryId) : undefined,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save transaction");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Account" required>
                <Select
                  value={formData.accountId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, accountId: e.target.value }))}
                  disabled={isLoading}
                  required
                >
                  <option value="">Select account</option>
                  {accounts.map((account) => (
                    <option key={account.id.toString()} value={account.id.toString()}>
                      {account.name} ({account.bank})
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Type" required>
                <Select
                  value={formData.direction}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      direction: parseInt(e.target.value) as TransactionDirection,
                    }))
                  }
                  disabled={isLoading}
                  required
                >
                  {directionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Amount" required>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  disabled={isLoading}
                  required
                  className="font-mono"
                />
              </FormField>

              <FormField label="Currency">
                <Select
                  value={formData.currency}
                  onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))}
                  disabled={isLoading}
                >
                  {currencyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Date" required>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  disabled={isLoading}
                  required
                />
              </FormField>

              <FormField label="Time">
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                  disabled={isLoading}
                />
              </FormField>
            </div>

            <FormField label="Description">
              <Input
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Transaction description"
                disabled={isLoading}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Merchant">
                <Input
                  value={formData.merchant}
                  onChange={(e) => setFormData((prev) => ({ ...prev, merchant: e.target.value }))}
                  placeholder="Merchant or payee"
                  disabled={isLoading}
                />
              </FormField>

              <FormField label="Category">
                <Select
                  value={formData.categoryId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
                  disabled={isLoading}
                >
                  <option value="">No category</option>
                  {categories.map((category: { id: bigint; slug: string }) => (
                    <option key={category.id.toString()} value={category.id.toString()}>
                      {category.slug}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>

            <FormField label="Notes">
              <Input
                value={formData.userNotes}
                onChange={(e) => setFormData((prev) => ({ ...prev, userNotes: e.target.value }))}
                placeholder="Personal notes"
                disabled={isLoading}
              />
            </FormField>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded p-2">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
