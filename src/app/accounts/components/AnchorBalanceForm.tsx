"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VStack, HStack, Caption, Muted, Card, ErrorMessage, Text } from "@/components/lib";

interface AnchorBalanceFormProps {
  accountId: bigint;
  accountName: string;
  currentBalance?: {
    currencyCode?: string;
    units?: string | bigint;
    nanos?: number;
  };
  onSubmit: (balance: { currencyCode: string; units: string; nanos: number }) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const currencyOptions = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "JPY", label: "JPY - Japanese Yen" },
];

export default function AnchorBalanceForm({
  accountName,
  currentBalance,
  onSubmit,
  onCancel,
  isLoading,
}: AnchorBalanceFormProps) {
  const [formData, setFormData] = useState({
    amount: currentBalance?.units ? parseFloat(currentBalance.units.toString()).toString() : "",
    currency: currentBalance?.currencyCode || "USD",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.amount) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      const amount = parseFloat(formData.amount);
      const units = Math.trunc(amount);
      const nanos = Math.round((amount - units) * 1e9);

      await onSubmit({
        currencyCode: formData.currency,
        units: units.toString(),
        nanos,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set anchor balance");
    }
  };

  return (
    <Card padding="md">
      <form onSubmit={handleSubmit}>
        <VStack spacing="lg">
          <Muted size="xs" weight="medium" className="uppercase tracking-wider">
            set anchor balance for {accountName}
          </Muted>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <VStack spacing="xs">
              <Caption>amount *</Caption>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                disabled={isLoading}
                required
                min={undefined}
              />
            </VStack>

            <VStack spacing="xs">
              <Caption>currency</Caption>
              <select
                id="currency"
                value={formData.currency}
                onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))}
                disabled={isLoading}
                className="rounded-sm border border-border bg-background h-9 px-3 text-sm"
              >
                {currencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </VStack>
          </div>

          <Text size="sm" color="muted">
            This sets the reference balance for this account at a specific point in time. It&apos;s
            used to calculate running balances for transactions.
          </Text>

          <HStack spacing="sm">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "setting..." : "set anchor balance"}
            </Button>
            <Button type="button" onClick={onCancel} variant="ghost" disabled={isLoading}>
              cancel
            </Button>
          </HStack>
        </VStack>
      </form>
    </Card>
  );
}
