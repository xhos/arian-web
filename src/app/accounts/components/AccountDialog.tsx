"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HexColorPicker } from "react-colorful";
import type { Account } from "@/gen/arian/v1/account_pb";
import { AccountType } from "@/gen/arian/v1/enums_pb";

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: Account | null;
  onSave: (data: {
    name: string;
    bank: string;
    type: AccountType;
    alias?: string;
    anchorBalance?: { currencyCode: string; units: string; nanos: number };
    mainCurrency?: string;
    colors?: string[];
  }) => Promise<void>;
  title: string;
}

export function AccountDialog({
  open,
  onOpenChange,
  account,
  onSave,
  title,
}: AccountDialogProps) {
  const [name, setName] = useState("");
  const [alias, setAlias] = useState("");
  const [bank, setBank] = useState("");
  const [type, setType] = useState<AccountType>(AccountType.ACCOUNT_CHEQUING);
  const [mainCurrency, setMainCurrency] = useState("USD");
  const [colors, setColors] = useState(["#1f2937", "#3b82f6", "#10b981"]);
  const [initialBalance, setInitialBalance] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (account) {
        setName(account.name);
        setAlias(account.alias || "");
        setBank(account.bank);
        setType(account.type);
        setMainCurrency(account.mainCurrency || "USD");
        setColors(account.colors.length > 0 ? account.colors : ["#1f2937", "#3b82f6", "#10b981"]);
        setInitialBalance("0");
      } else {
        setName("");
        setAlias("");
        setBank("");
        setType(AccountType.ACCOUNT_CHEQUING);
        setMainCurrency("USD");
        setColors(["#1f2937", "#3b82f6", "#10b981"]);
        setInitialBalance("0");
      }
      setError(null);
    }
  }, [account, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !bank) {
      setError("Name and bank are required");
      return;
    }

    setIsLoading(true);
    try {
      const data: Parameters<typeof onSave>[0] = {
        name,
        bank,
        type,
        alias: alias || undefined,
        mainCurrency,
        colors,
      };

      if (!account) {
        data.anchorBalance = {
          currencyCode: mainCurrency,
          units: Math.floor(parseFloat(initialBalance || "0")).toString(),
          nanos: Math.round((parseFloat(initialBalance || "0") % 1) * 1e9),
        };
      }

      await onSave(data);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Checking Account"
                disabled={isLoading}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="alias">Alias</Label>
              <Input
                id="alias"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="Display name (optional)"
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bank">Bank *</Label>
              <Input
                id="bank"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                placeholder="Chase"
                disabled={isLoading}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={type.toString()}
                onValueChange={(value) => setType(parseInt(value) as AccountType)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AccountType.ACCOUNT_CHEQUING.toString()}>Chequing</SelectItem>
                  <SelectItem value={AccountType.ACCOUNT_SAVINGS.toString()}>Savings</SelectItem>
                  <SelectItem value={AccountType.ACCOUNT_CREDIT_CARD.toString()}>Credit Card</SelectItem>
                  <SelectItem value={AccountType.ACCOUNT_INVESTMENT.toString()}>Investment</SelectItem>
                  <SelectItem value={AccountType.ACCOUNT_OTHER.toString()}>Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={mainCurrency}
                onValueChange={setMainCurrency}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="JPY">JPY</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Colors</Label>
              <div className="flex gap-2">
                {colors.map((color, index) => (
                  <div key={index} className="flex flex-col items-center gap-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          disabled={isLoading}
                          className="h-12 w-12 cursor-pointer rounded border flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-3">
                        <HexColorPicker
                          color={color}
                          onChange={(newColor) => {
                            const newColors = [...colors];
                            newColors[index] = newColor;
                            setColors(newColors);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <span className="text-xs text-muted-foreground">
                      {index === 0 ? "Primary" : index === 1 ? "Secondary" : "Tertiary"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {!account && (
              <div className="grid gap-2">
                <Label htmlFor="initialBalance">Initial Balance *</Label>
                <Input
                  id="initialBalance"
                  type="number"
                  step="0.01"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  placeholder="0.00"
                  disabled={isLoading}
                  required
                />
              </div>
            )}

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
