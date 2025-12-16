"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VStack, Caption, Muted, Text, HStack } from "@/components/lib";
import { AccountType } from "@/gen/arian/v1/enums_pb";

interface CreateAccountSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    bank: string;
    type: AccountType;
    alias?: string;
    anchorBalance: { currencyCode: string; units: string; nanos: number };
    mainCurrency?: string;
    colors?: string[];
  }) => void;
  isLoading: boolean;
}

export default function CreateAccountSidebar({
  isOpen,
  onClose,
  onCreate,
  isLoading,
}: CreateAccountSidebarProps) {
  const [formData, setFormData] = useState({
    name: "",
    bank: "",
    type: AccountType.ACCOUNT_CHEQUING,
    alias: "",
    initialBalance: "0",
    mainCurrency: "USD",
    colors: ["#1f2937", "#3b82f6", "#10b981"],
  });

  const handleSubmit = () => {
    const createData = {
      name: formData.name,
      bank: formData.bank,
      type: formData.type,
      alias: formData.alias || undefined,
      anchorBalance: {
        currencyCode: formData.mainCurrency,
        units: parseFloat(formData.initialBalance || "0").toString(),
        nanos: Math.round((parseFloat(formData.initialBalance || "0") % 1) * 1e9),
      },
      mainCurrency: formData.mainCurrency,
      colors: formData.colors,
    };

    onCreate(createData);

    // Reset form
    setFormData({
      name: "",
      bank: "",
      type: AccountType.ACCOUNT_CHEQUING,
      alias: "",
      initialBalance: "0",
      mainCurrency: "USD",
      colors: ["#1f2937", "#3b82f6", "#10b981"],
    });
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      name: "",
      bank: "",
      type: AccountType.ACCOUNT_CHEQUING,
      alias: "",
      initialBalance: "0",
      mainCurrency: "USD",
      colors: ["#1f2937", "#3b82f6", "#10b981"],
    });
    onClose();
  };

  const isValid = formData.name && formData.bank && formData.initialBalance;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={handleCancel} />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-background border-l border-border z-50 overflow-y-auto">
        <VStack spacing="md" className="p-6">
          {/* Header */}
          <HStack spacing="md" justify="between" align="center" className="w-full">
            <Text size="lg" weight="semibold">Add Account</Text>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
            >
              ✕
            </Button>
          </HStack>

          {/* Form */}
          <VStack spacing="sm">
            <VStack spacing="xs">
              <Caption>Name</Caption>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="text-sm h-8"
                required
              />
            </VStack>

            <VStack spacing="xs">
              <Caption>Alias</Caption>
              <Input
                value={formData.alias}
                onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                placeholder="Display name (optional)"
                className="text-sm h-8"
              />
            </VStack>

            <VStack spacing="xs">
              <Caption>Bank</Caption>
              <Input
                value={formData.bank}
                onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                className="text-sm h-8"
                required
              />
            </VStack>

            <VStack spacing="xs">
              <Caption>Type</Caption>
              <select
                value={formData.type.toString()}
                onChange={(e) =>
                  setFormData({ ...formData, type: parseInt(e.target.value) as AccountType })
                }
                className="text-sm h-8 rounded-sm border border-border bg-background"
              >
                <option value={AccountType.ACCOUNT_CHEQUING}>Chequing</option>
                <option value={AccountType.ACCOUNT_SAVINGS}>Savings</option>
                <option value={AccountType.ACCOUNT_CREDIT_CARD}>Credit Card</option>
                <option value={AccountType.ACCOUNT_INVESTMENT}>Investment</option>
                <option value={AccountType.ACCOUNT_OTHER}>Other</option>
              </select>
            </VStack>

            <VStack spacing="xs">
              <Caption>Currency</Caption>
              <select
                value={formData.mainCurrency}
                onChange={(e) => setFormData({ ...formData, mainCurrency: e.target.value })}
                className="text-sm h-8 rounded-sm border border-border bg-background"
              >
                <option value="USD">USD</option>
                <option value="CAD">CAD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
              </select>
            </VStack>

            <VStack spacing="xs">
              <Caption>Colors</Caption>
              <VStack spacing="xs">
                {formData.colors.map((color, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => {
                        const newColors = [...formData.colors];
                        newColors[index] = e.target.value;
                        setFormData({ ...formData, colors: newColors });
                      }}
                      className="w-8 h-8 rounded border cursor-pointer"
                    />
                    <Muted size="xs">
                      {index === 0 ? "Primary" : index === 1 ? "Secondary" : "Tertiary"}
                    </Muted>
                  </div>
                ))}
              </VStack>
            </VStack>

            <VStack spacing="xs">
              <Caption>Initial Balance</Caption>
              <Input
                type="number"
                step="0.01"
                value={formData.initialBalance}
                onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                placeholder="0.00"
                className="text-sm h-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                required
              />
            </VStack>

            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isLoading || !isValid}
              className="w-full"
            >
              Create
            </Button>
          </VStack>
        </VStack>
      </div>
    </>
  );
}
