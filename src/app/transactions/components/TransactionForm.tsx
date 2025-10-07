"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TransactionDirection } from "@/gen/arian/v1/enums_pb";
import { useAccounts } from "@/hooks/useAccounts";
import { useUserId } from "@/hooks/useSession";

interface TransactionFormProps {
  onSubmit: (formData: {
    accountId: bigint;
    txDate: Date;
    txAmount: { currencyCode: string; units: string; nanos: number };
    direction: TransactionDirection;
    description?: string;
    merchant?: string;
    userNotes?: string;
    categoryId?: bigint;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const directionOptions = [
  { value: TransactionDirection.DIRECTION_OUTGOING, label: "expense" },
  { value: TransactionDirection.DIRECTION_INCOMING, label: "income" },
];

const currencyOptions = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "JPY", label: "JPY - Japanese Yen" },
];

export default function TransactionForm({ onSubmit, onCancel, isLoading }: TransactionFormProps) {
  const userId = useUserId();
  const { accounts } = useAccounts();

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/arian.v1.CategoryService/ListCategories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 100 }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.categories || [];
      }
      return [];
    },
    staleTime: 10 * 60 * 1000, // Categories change rarely
    gcTime: 30 * 60 * 1000,
  });

  const [formData, setFormData] = useState({
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

  const [error, setError] = useState("");
  const isLoadingData = !userId || isLoadingCategories;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.accountId) {
      setError("Please select an account");
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`);

      await onSubmit({
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create transaction");
    }
  };

  if (isLoadingData) {
    return (
      <div className="tui-border rounded-lg p-4">
        <div className="text-sm tui-muted">loading form data...</div>
      </div>
    );
  }

  return (
    <div className="tui-border rounded-lg p-4">
      <h2 className="text-sm tui-muted mb-4 uppercase tracking-wider">add new transaction</h2>

      {error && <div className="mb-4 p-3 text-sm font-mono text-red-600 tui-border">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="account">account *</Label>
            <select
              id="account"
              value={formData.accountId}
              onChange={(e) => setFormData((prev) => ({ ...prev, accountId: e.target.value }))}
              disabled={isLoading}
              required
              className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">select account</option>
              {accounts.map((account) => (
                <option key={account.id.toString()} value={account.id.toString()}>
                  {account.name} ({account.bank})
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="amount">amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
              placeholder="0.00"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <Label htmlFor="currency">currency</Label>
            <select
              id="currency"
              value={formData.currency}
              onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))}
              disabled={isLoading}
              className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {currencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="direction">type *</Label>
            <select
              id="direction"
              value={formData.direction}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  direction: parseInt(e.target.value) as TransactionDirection,
                }))
              }
              disabled={isLoading}
              required
              className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {directionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="category">category</Label>
            <select
              id="category"
              value={formData.categoryId}
              onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
              disabled={isLoading}
              className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">no category</option>
              {categories.map((category: { id: bigint; label: string }) => (
                <option key={category.id.toString()} value={category.id.toString()}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="date">date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <Label htmlFor="time">time</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
              disabled={isLoading}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="description">description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="transaction description"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="merchant">merchant</Label>
            <Input
              id="merchant"
              value={formData.merchant}
              onChange={(e) => setFormData((prev) => ({ ...prev, merchant: e.target.value }))}
              placeholder="merchant or payee"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="userNotes">notes</Label>
            <Input
              id="userNotes"
              value={formData.userNotes}
              onChange={(e) => setFormData((prev) => ({ ...prev, userNotes: e.target.value }))}
              placeholder="personal notes"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "creating..." : "create transaction"}
          </Button>
          <Button type="button" onClick={onCancel} variant="ghost" disabled={isLoading}>
            cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
