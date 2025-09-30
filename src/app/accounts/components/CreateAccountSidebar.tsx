"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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
      <div className="fixed right-0 top-0 h-full w-96 bg-tui-background tui-border-l z-50 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-mono">add</h2>
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
              <label className="text-xs text-tui-muted block mb-1">name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="text-sm h-8"
                required
              />
            </div>

            <div>
              <label className="text-xs text-tui-muted block mb-1">alias</label>
              <Input
                value={formData.alias}
                onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                placeholder="Display name (optional)"
                className="text-sm h-8"
              />
            </div>

            <div>
              <label className="text-xs text-tui-muted block mb-1">bank</label>
              <Input
                value={formData.bank}
                onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                className="text-sm h-8"
                required
              />
            </div>

            <div>
              <label className="text-xs text-tui-muted block mb-1">type</label>
              <Select
                value={formData.type.toString()}
                onChange={(e) =>
                  setFormData({ ...formData, type: parseInt(e.target.value) as AccountType })
                }
                className="text-sm !h-8"
              >
                <option value={AccountType.ACCOUNT_CHEQUING}>Chequing</option>
                <option value={AccountType.ACCOUNT_SAVINGS}>Savings</option>
                <option value={AccountType.ACCOUNT_CREDIT_CARD}>Credit Card</option>
                <option value={AccountType.ACCOUNT_INVESTMENT}>Investment</option>
                <option value={AccountType.ACCOUNT_OTHER}>Other</option>
              </Select>
            </div>

            <div>
              <label className="text-xs text-tui-muted block mb-1">currency</label>
              <Select
                value={formData.mainCurrency}
                onChange={(e) => setFormData({ ...formData, mainCurrency: e.target.value })}
                className="text-sm !h-8"
              >
                <option value="USD">USD</option>
                <option value="CAD">CAD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
              </Select>
            </div>

            <div>
              <label className="text-xs text-tui-muted block mb-1">colors</label>
              <div className="space-y-2">
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
                    <span className="text-xs text-tui-muted">
                      {index === 0 ? "Primary" : index === 1 ? "Secondary" : "Tertiary"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-tui-muted block mb-1">initial balance</label>
              <Input
                type="number"
                step="0.01"
                value={formData.initialBalance}
                onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                placeholder="0.00"
                className="text-sm h-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                required
              />
            </div>

            <div className="pt-4">
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={isLoading || !isValid}
                className="w-full"
              >
                create
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
